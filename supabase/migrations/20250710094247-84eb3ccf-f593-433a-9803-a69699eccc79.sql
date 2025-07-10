-- PRODUCTION OPTIMIZATION AND SECURITY (Part 2)

-- RLS POLICIES
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_verification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security audit log" ON public.security_audit_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage data retention policies" ON public.data_retention_policies
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage backup verification log" ON public.backup_verification_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage system health checks" ON public.system_health_checks
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their compliance log" ON public.compliance_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all compliance log" ON public.compliance_log
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- AUTOMATED DATA CLEANUP FUNCTION
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
    
    INSERT INTO public.security_audit_log (
      audit_type, table_name, action, details
    ) VALUES (
      'data_cleanup', 
      policy.table_name, 
      'automated_cleanup',
      jsonb_build_object('deleted_count', deleted_count, 'cleanup_date', cleanup_date)
    );
    
    UPDATE public.data_retention_policies 
    SET last_cleanup_at = NOW() 
    WHERE id = policy.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SYSTEM HEALTH CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.perform_health_check()
RETURNS jsonb AS $$
DECLARE
  db_status TEXT := 'healthy';
  db_response_time INTEGER;
  start_time TIMESTAMP;
  result JSONB;
BEGIN
  start_time := clock_timestamp();
  
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

-- RLS POLICIES AUDIT FUNCTION
CREATE OR REPLACE FUNCTION public.audit_rls_policies()
RETURNS TABLE(
  table_name TEXT,
  policy_name TEXT,
  policy_command TEXT,
  policy_permissive TEXT,
  policy_using TEXT,
  policy_check TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pol.schemaname || '.' || pol.tablename as table_name,
    pol.policyname as policy_name,
    pol.cmd as policy_command,
    pol.permissive as policy_permissive,
    pol.qual as policy_using,
    pol.with_check as policy_check
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
  ORDER BY pol.tablename, pol.policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS
CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON public.data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();