-- PRODUCTION OPTIMIZATION AND SECURITY

-- 1. PERFORMANCE OPTIMIZATION
-- Создание составных индексов для критических запросов

-- Индексы для пользовательской аналитики
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_analytics_composite 
ON public.user_analytics (user_id, event_type, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_analytics_session_events 
ON public.user_analytics (session_id, created_at DESC);

-- Индексы для симптомов
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_symptom_entries_user_date 
ON public.symptom_entries (user_id, entry_date DESC);

-- Индексы для медицинских событий
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_medical_events_user_date 
ON public.medical_events (user_id, event_date DESC, event_type);

-- Индексы для семейных данных
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_family_members_group_active 
ON public.family_members (family_group_id, status) WHERE status = 'active';

-- Индексы для алертов системы
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_alerts_unresolved 
ON public.system_alerts (severity, created_at DESC) WHERE is_resolved = FALSE;

-- Индексы для производительности БД
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_db_performance_slow_queries 
ON public.db_performance_logs (execution_time_ms DESC, created_at DESC) 
WHERE execution_time_ms > 1000;

-- 2. SECURITY AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL, -- 'rls_policy', 'data_access', 'admin_action', 'security_violation'
  table_name TEXT,
  policy_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для аудита безопасности
CREATE INDEX IF NOT EXISTS idx_security_audit_type_date 
ON public.security_audit_log (audit_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_severity 
ON public.security_audit_log (severity, created_at DESC) WHERE severity IN ('high', 'critical');

-- 3. DATA RETENTION POLICY TABLE
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  deletion_strategy TEXT DEFAULT 'soft_delete', -- 'hard_delete', 'soft_delete', 'archive'
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Настройки retention по умолчанию
INSERT INTO public.data_retention_policies (table_name, retention_period_days, deletion_strategy) VALUES
('user_analytics', 1095, 'archive'), -- 3 года
('system_metrics', 365, 'archive'), -- 1 год
('db_performance_logs', 90, 'hard_delete'), -- 3 месяца
('security_audit_log', 2555, 'archive'), -- 7 лет (compliance)
('system_alerts', 365, 'soft_delete') -- 1 год
ON CONFLICT (table_name) DO NOTHING;

-- 4. BACKUP VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.backup_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date DATE NOT NULL,
  backup_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  verification_status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  backup_size_bytes BIGINT,
  verification_details JSONB DEFAULT '{}'::jsonb,
  recovery_test_passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPLIANCE TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_type TEXT NOT NULL, -- 'gdpr', 'medical_data', 'user_consent'
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'data_export', 'data_deletion', 'consent_given', 'consent_withdrawn'
  data_types TEXT[] DEFAULT '{}',
  processing_basis TEXT, -- 'consent', 'legitimate_interest', 'contract', etc.
  retention_period_days INTEGER,
  automated BOOLEAN DEFAULT FALSE,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для compliance
CREATE INDEX IF NOT EXISTS idx_compliance_log_user_action 
ON public.compliance_log (user_id, action, created_at DESC);

-- 6. HEALTH CHECK TABLE
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL, -- 'database', 'api', 'storage', 'auth'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'unhealthy'
  response_time_ms INTEGER,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для health checks
CREATE INDEX IF NOT EXISTS idx_health_checks_type_status 
ON public.system_health_checks (check_type, status, checked_at DESC);

-- 7. RLS POLICIES FOR NEW TABLES
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_verification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

-- Только админы могут управлять системными таблицами
CREATE POLICY "Admins can manage security audit log" ON public.security_audit_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage data retention policies" ON public.data_retention_policies
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage backup verification log" ON public.backup_verification_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage system health checks" ON public.system_health_checks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Пользователи могут видеть свои compliance записи
CREATE POLICY "Users can view their compliance log" ON public.compliance_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all compliance log" ON public.compliance_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. ФУНКЦИИ ДЛЯ АВТОМАТИЧЕСКОЙ ОЧИСТКИ ДАННЫХ
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void AS $$
DECLARE
  policy RECORD;
  cleanup_date DATE;
  deleted_count INTEGER;
BEGIN
  FOR policy IN SELECT * FROM public.data_retention_policies WHERE is_active = TRUE LOOP
    cleanup_date := CURRENT_DATE - INTERVAL '1 day' * policy.retention_period_days;
    
    CASE policy.table_name
      WHEN 'user_analytics' THEN
        IF policy.deletion_strategy = 'hard_delete' THEN
          DELETE FROM public.user_analytics WHERE created_at::date < cleanup_date;
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END IF;
      
      WHEN 'system_metrics' THEN
        IF policy.deletion_strategy = 'hard_delete' THEN
          DELETE FROM public.system_metrics WHERE recorded_at::date < cleanup_date;
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END IF;
        
      WHEN 'db_performance_logs' THEN
        DELETE FROM public.db_performance_logs WHERE created_at::date < cleanup_date;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        
      WHEN 'security_audit_log' THEN
        IF policy.deletion_strategy = 'hard_delete' THEN
          DELETE FROM public.security_audit_log WHERE created_at::date < cleanup_date;
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END IF;
    END CASE;
    
    -- Логируем очистку
    INSERT INTO public.security_audit_log (
      audit_type, table_name, action, details
    ) VALUES (
      'data_cleanup', 
      policy.table_name, 
      'automated_cleanup',
      jsonb_build_object('deleted_count', deleted_count, 'cleanup_date', cleanup_date)
    );
    
    -- Обновляем время последней очистки
    UPDATE public.data_retention_policies 
    SET last_cleanup_at = NOW() 
    WHERE id = policy.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ЗДОРОВЬЯ СИСТЕМЫ
CREATE OR REPLACE FUNCTION public.perform_health_check()
RETURNS jsonb AS $$
DECLARE
  db_status TEXT := 'healthy';
  db_response_time INTEGER;
  start_time TIMESTAMP;
  result JSONB;
BEGIN
  start_time := clock_timestamp();
  
  -- Проверка базы данных
  BEGIN
    PERFORM 1 FROM pg_stat_activity LIMIT 1;
    db_response_time := EXTRACT(milliseconds FROM clock_timestamp() - start_time)::INTEGER;
    
    IF db_response_time > 1000 THEN
      db_status := 'degraded';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    db_status := 'unhealthy';
    db_response_time := -1;
  END;
  
  -- Запись результата
  INSERT INTO public.system_health_checks (
    check_type, status, response_time_ms
  ) VALUES (
    'database', db_status, db_response_time
  );
  
  result := jsonb_build_object(
    'database', jsonb_build_object(
      'status', db_status,
      'response_time_ms', db_response_time
    ),
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON public.data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. PARTITIONING FOR LARGE TABLES (Подготовка)
-- Для user_analytics (самая нагруженная таблица)
-- Примечание: В production потребуется миграция существующих данных

-- CREATE TABLE public.user_analytics_y2025m01 PARTITION OF public.user_analytics
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 12. ФУНКЦИЯ ДЛЯ АУДИТА RLS ПОЛИТИК
CREATE OR REPLACE FUNCTION public.audit_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_command TEXT,
  policy_permissive TEXT,
  policy_using TEXT,
  policy_check TEXT,
  potential_issues TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pol.schemaname || '.' || pol.tablename as table_name,
    pol.policyname as policy_name,
    pol.cmd as policy_command,
    pol.permissive as policy_permissive,
    pol.qual as policy_using,
    pol.with_check as policy_check,
    ARRAY[]::TEXT[] as potential_issues -- Будет расширено
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
  ORDER BY pol.tablename, pol.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;