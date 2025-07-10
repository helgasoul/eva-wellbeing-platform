-- PRODUCTION OPTIMIZATION AND SECURITY (Part 1)

-- 1. PERFORMANCE OPTIMIZATION - Индексы для критических запросов
CREATE INDEX IF NOT EXISTS idx_user_analytics_composite 
ON public.user_analytics (user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_analytics_session_events 
ON public.user_analytics (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_date 
ON public.symptom_entries (user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_medical_events_user_date 
ON public.medical_events (user_id, event_date DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_family_members_group_active 
ON public.family_members (family_group_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved 
ON public.system_alerts (severity, created_at DESC) WHERE is_resolved = FALSE;

CREATE INDEX IF NOT EXISTS idx_db_performance_slow_queries 
ON public.db_performance_logs (execution_time_ms DESC, created_at DESC) 
WHERE execution_time_ms > 1000;

-- 2. SECURITY AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type TEXT NOT NULL,
  table_name TEXT,
  policy_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_type_date 
ON public.security_audit_log (audit_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_severity 
ON public.security_audit_log (severity, created_at DESC) WHERE severity IN ('high', 'critical');

-- 3. DATA RETENTION POLICIES
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  retention_period_days INTEGER NOT NULL,
  deletion_strategy TEXT DEFAULT 'soft_delete',
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.data_retention_policies (table_name, retention_period_days, deletion_strategy) VALUES
('user_analytics', 1095, 'archive'),
('system_metrics', 365, 'archive'),
('db_performance_logs', 90, 'hard_delete'),
('security_audit_log', 2555, 'archive'),
('system_alerts', 365, 'soft_delete')
ON CONFLICT (table_name) DO NOTHING;

-- 4. BACKUP VERIFICATION LOG
CREATE TABLE IF NOT EXISTS public.backup_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date DATE NOT NULL,
  backup_type TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  backup_size_bytes BIGINT,
  verification_details JSONB DEFAULT '{}'::jsonb,
  recovery_test_passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COMPLIANCE TRACKING
CREATE TABLE IF NOT EXISTS public.compliance_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  data_types TEXT[] DEFAULT '{}',
  processing_basis TEXT,
  retention_period_days INTEGER,
  automated BOOLEAN DEFAULT FALSE,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_log_user_action 
ON public.compliance_log (user_id, action, created_at DESC);

-- 6. SYSTEM HEALTH CHECKS
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_checks_type_status 
ON public.system_health_checks (check_type, status, checked_at DESC);