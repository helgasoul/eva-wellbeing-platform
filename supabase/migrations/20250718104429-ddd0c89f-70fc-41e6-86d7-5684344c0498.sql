-- ✅ СОЗДАНИЕ БЕЗОПАСНОГО ХРАНИЛИЩА ДЛЯ МЕДИЦИНСКИХ ДАННЫХ
-- Соответствует требованиям HIPAA/GDPR

-- Таблица для аудита доступа к медицинским данным
CREATE TABLE IF NOT EXISTS public.medical_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'export')),
  data_type TEXT NOT NULL CHECK (data_type IN ('symptoms', 'medications', 'vitals', 'notes', 'profile')),
  ip_address INET,
  user_agent TEXT,
  access_result TEXT NOT NULL CHECK (access_result IN ('success', 'failure', 'unauthorized')),
  failure_reason TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Включаем RLS для логов доступа
ALTER TABLE public.medical_data_access_log ENABLE ROW LEVEL SECURITY;

-- Политика: только админы могут просматривать логи доступа
CREATE POLICY "Admins can view access logs"
ON public.medical_data_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Политика: система может записывать логи
CREATE POLICY "System can log access"
ON public.medical_data_access_log
FOR INSERT
WITH CHECK (true);

-- Таблица для хранения зашифрованных медицинских данных
CREATE TABLE IF NOT EXISTS public.encrypted_medical_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('symptoms', 'medications', 'vitals', 'notes', 'profile', 'menopause')),
  encrypted_content TEXT NOT NULL, -- Зашифрованные данные в base64
  encryption_metadata JSONB NOT NULL, -- IV, salt и другие метаданные шифрования
  data_hash TEXT NOT NULL, -- Хэш для проверки целостности
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Автоматическое удаление старых данных
  access_level TEXT NOT NULL DEFAULT 'private' CHECK (access_level IN ('private', 'shared_family', 'shared_doctor')),
  
  -- Индексы для быстрого поиска
  UNIQUE(user_id, data_type, created_at)
);

-- Включаем RLS
ALTER TABLE public.encrypted_medical_data ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут управлять только своими данными
CREATE POLICY "Users can manage own encrypted medical data"
ON public.encrypted_medical_data
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Политика: врачи могут читать данные с разрешением
CREATE POLICY "Doctors can read shared medical data"
ON public.encrypted_medical_data
FOR SELECT
USING (
  access_level = 'shared_doctor' 
  AND has_patient_data_permission(user_id, auth.uid(), 'read', 'medical_data')
);

-- Функция для логирования доступа к медицинским данным
CREATE OR REPLACE FUNCTION public.log_medical_data_access(
  p_user_id UUID,
  p_access_type TEXT,
  p_data_type TEXT,
  p_access_result TEXT DEFAULT 'success',
  p_failure_reason TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.medical_data_access_log (
    user_id,
    access_type,
    data_type,
    ip_address,
    user_agent,
    access_result,
    failure_reason,
    metadata
  ) VALUES (
    p_user_id,
    p_access_type,
    p_data_type,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_access_result,
    p_failure_reason,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Функция для безопасного сохранения зашифрованных данных
CREATE OR REPLACE FUNCTION public.save_encrypted_medical_data(
  p_user_id UUID,
  p_data_type TEXT,
  p_encrypted_content TEXT,
  p_encryption_metadata JSONB,
  p_data_hash TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_access_level TEXT DEFAULT 'private'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  data_id UUID;
BEGIN
  -- Проверяем права доступа
  IF auth.uid() != p_user_id THEN
    PERFORM public.log_medical_data_access(
      p_user_id, 'write', p_data_type, 'unauthorized', 'User mismatch'
    );
    RAISE EXCEPTION 'Unauthorized access to medical data';
  END IF;
  
  -- Сохраняем зашифрованные данные
  INSERT INTO public.encrypted_medical_data (
    user_id,
    data_type,
    encrypted_content,
    encryption_metadata,
    data_hash,
    expires_at,
    access_level
  ) VALUES (
    p_user_id,
    p_data_type,
    p_encrypted_content,
    p_encryption_metadata,
    p_data_hash,
    p_expires_at,
    p_access_level
  ) 
  ON CONFLICT (user_id, data_type, created_at)
  DO UPDATE SET
    encrypted_content = EXCLUDED.encrypted_content,
    encryption_metadata = EXCLUDED.encryption_metadata,
    data_hash = EXCLUDED.data_hash,
    updated_at = NOW(),
    expires_at = EXCLUDED.expires_at,
    access_level = EXCLUDED.access_level
  RETURNING id INTO data_id;
  
  -- Логируем успешное сохранение
  PERFORM public.log_medical_data_access(
    p_user_id, 'write', p_data_type, 'success'
  );
  
  RETURN data_id;
END;
$$;

-- Функция для автоматической очистки устаревших данных
CREATE OR REPLACE FUNCTION public.cleanup_expired_medical_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.encrypted_medical_data
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Логируем очистку
  IF deleted_count > 0 THEN
    INSERT INTO public.medical_data_access_log (
      user_id,
      access_type,
      data_type,
      access_result,
      metadata
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid,
      'delete',
      'expired_data',
      'success',
      jsonb_build_object('deleted_count', deleted_count)
    );
  END IF;
  
  RETURN deleted_count;
END;
$$;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_medical_data_user_type 
ON public.encrypted_medical_data (user_id, data_type);

CREATE INDEX IF NOT EXISTS idx_medical_data_expires 
ON public.encrypted_medical_data (expires_at) 
WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_access_log_user_time 
ON public.medical_data_access_log (user_id, accessed_at DESC);

-- Создаем триггер для обновления updated_at
CREATE TRIGGER update_encrypted_medical_data_updated_at
  BEFORE UPDATE ON public.encrypted_medical_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();