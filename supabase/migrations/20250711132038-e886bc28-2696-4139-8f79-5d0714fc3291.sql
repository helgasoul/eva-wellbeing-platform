-- БЕЗОПАСНОСТЬ: Исправление критических уязвимостей в RLS политиках

-- 1. Удаляем опасную политику "System can insert health data for users" 
-- которая позволяет любому вставлять данные в external_health_data
DROP POLICY IF EXISTS "System can insert health data for users" ON public.external_health_data;

-- 2. Удаляем дублирующиеся RLS политики для daily_health_summary
DROP POLICY IF EXISTS "Users can create own health summary" ON public.daily_health_summary;
DROP POLICY IF EXISTS "Users can update own health summary" ON public.daily_health_summary;
DROP POLICY IF EXISTS "Users can view own health summary" ON public.daily_health_summary;

-- 3. Удаляем дублирующиеся RLS политики для health_device_data
DROP POLICY IF EXISTS "Users can create own device data" ON public.health_device_data;
DROP POLICY IF EXISTS "Users can view own device data" ON public.health_device_data;

-- 4. Создаем безопасную функцию для вставки health data через service role
CREATE OR REPLACE FUNCTION public.insert_external_health_data_secure(
  p_user_id uuid,
  p_integration_id uuid,
  p_data_type text,
  p_data_payload jsonb,
  p_external_id text DEFAULT NULL,
  p_recorded_date date DEFAULT NULL,
  p_recorded_timestamp timestamptz DEFAULT NULL,
  p_data_source text DEFAULT NULL,
  p_data_quality_score numeric DEFAULT 1.0
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  record_id uuid;
BEGIN
  -- Проверяем, что интеграция принадлежит указанному пользователю
  IF NOT EXISTS (
    SELECT 1 FROM health_app_integrations 
    WHERE id = p_integration_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Integration not found or access denied';
  END IF;

  -- Вставляем данные
  INSERT INTO external_health_data (
    user_id,
    integration_id,
    data_type,
    data_payload,
    external_id,
    recorded_date,
    recorded_timestamp,
    data_source,
    data_quality_score,
    is_processed
  ) VALUES (
    p_user_id,
    p_integration_id,
    p_data_type,
    p_data_payload,
    p_external_id,
    COALESCE(p_recorded_date, CURRENT_DATE),
    COALESCE(p_recorded_timestamp, NOW()),
    p_data_source,
    p_data_quality_score,
    false
  )
  ON CONFLICT (integration_id, COALESCE(external_id, ''), data_type) 
  DO UPDATE SET
    data_payload = EXCLUDED.data_payload,
    recorded_timestamp = EXCLUDED.recorded_timestamp,
    data_quality_score = EXCLUDED.data_quality_score,
    updated_at = NOW()
  RETURNING id INTO record_id;

  RETURN record_id;
END;
$$;

-- 5. Создаем безопасную функцию для создания sync logs
CREATE OR REPLACE FUNCTION public.create_health_sync_log_secure(
  p_integration_id uuid,
  p_data_types_synced text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
  integration_user_id uuid;
BEGIN
  -- Получаем user_id из интеграции для валидации
  SELECT user_id INTO integration_user_id 
  FROM health_app_integrations 
  WHERE id = p_integration_id;

  IF integration_user_id IS NULL THEN
    RAISE EXCEPTION 'Integration not found';
  END IF;

  -- Создаем лог
  INSERT INTO health_data_sync_logs (
    integration_id,
    sync_status,
    data_types_synced,
    sync_started_at
  ) VALUES (
    p_integration_id,
    'running',
    p_data_types_synced,
    NOW()
  )
  RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- 6. Создаем функцию для обновления sync logs
CREATE OR REPLACE FUNCTION public.update_health_sync_log_secure(
  p_log_id uuid,
  p_sync_status text,
  p_records_synced integer DEFAULT 0,
  p_records_failed integer DEFAULT 0,
  p_sync_duration_ms integer DEFAULT NULL,
  p_error_details jsonb DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE health_data_sync_logs 
  SET 
    sync_completed_at = CASE WHEN p_sync_status IN ('completed', 'failed', 'partial') THEN NOW() ELSE sync_completed_at END,
    sync_status = p_sync_status,
    records_synced = p_records_synced,
    records_failed = p_records_failed,
    sync_duration_ms = p_sync_duration_ms,
    error_details = p_error_details,
    updated_at = NOW()
  WHERE id = p_log_id;

  RETURN FOUND;
END;
$$;

-- 7. Добавляем строгие RLS политики для health_data_sync_logs
DROP POLICY IF EXISTS "Users can view their sync logs" ON public.health_data_sync_logs;

CREATE POLICY "Users can view own sync logs" 
ON public.health_data_sync_logs 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM health_app_integrations hai
    WHERE hai.id = health_data_sync_logs.integration_id 
    AND hai.user_id = auth.uid()
  )
);

-- 8. Создаем политику для admin доступа к health logs (только для мониторинга)
CREATE POLICY "Admins can view all sync logs"
ON public.health_data_sync_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 9. Добавляем audit лог для health data access
CREATE TABLE IF NOT EXISTS public.health_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  accessed_user_data uuid NOT NULL, -- чьи данные были доступны
  access_type text NOT NULL, -- 'read', 'write', 'sync'
  table_accessed text NOT NULL,
  record_count integer DEFAULT 1,
  ip_address inet,
  user_agent text,
  accessed_at timestamptz NOT NULL DEFAULT NOW()
);

-- Включаем RLS на audit log
ALTER TABLE public.health_data_access_log ENABLE ROW LEVEL SECURITY;

-- Только админы могут видеть audit logs
CREATE POLICY "Admins can view audit logs"
ON public.health_data_access_log
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 10. Создаем функцию для логирования доступа к health data
CREATE OR REPLACE FUNCTION public.log_health_data_access(
  p_accessed_user_data uuid,
  p_access_type text,
  p_table_accessed text,
  p_record_count integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Логируем только если это не собственные данные пользователя
  IF auth.uid() != p_accessed_user_data THEN
    INSERT INTO health_data_access_log (
      user_id,
      accessed_user_data,
      access_type,
      table_accessed,
      record_count
    ) VALUES (
      auth.uid(),
      p_accessed_user_data,
      p_access_type,
      p_table_accessed,
      p_record_count
    );
  END IF;
END;
$$;