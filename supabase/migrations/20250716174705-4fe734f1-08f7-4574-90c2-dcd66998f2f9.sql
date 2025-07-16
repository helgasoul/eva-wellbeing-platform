-- Fix database security warnings by adding search_path to security definer functions

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Fix has_patient_data_permission function
CREATE OR REPLACE FUNCTION public.has_patient_data_permission(_patient_id uuid, _requester_id uuid, _permission_type text, _data_type text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.patient_data_permissions
    WHERE patient_id = _patient_id
      AND granted_to_id = _requester_id
      AND permission_type IN (_permission_type, 'full')
      AND _data_type = ANY(data_types)
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  ) OR _patient_id = _requester_id OR public.has_role(_requester_id, 'admin');
$function$;

-- Fix generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    ticket_num TEXT;
BEGIN
    SELECT 'TICKET-' || LPAD((EXTRACT(EPOCH FROM now())::bigint % 1000000)::text, 6, '0') INTO ticket_num;
    RETURN ticket_num;
END;
$function$;

-- Fix set_ticket_number function
CREATE OR REPLACE FUNCTION public.set_ticket_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix update_group_member_count function
CREATE OR REPLACE FUNCTION public.update_group_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    UPDATE public.support_groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = false AND NEW.is_active = true THEN
      UPDATE public.support_groups 
      SET member_count = member_count + 1 
      WHERE id = NEW.group_id;
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      UPDATE public.support_groups 
      SET member_count = member_count - 1 
      WHERE id = NEW.group_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_active = true THEN
    UPDATE public.support_groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix update_post_reply_count function
CREATE OR REPLACE FUNCTION public.update_post_reply_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET reply_count = reply_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Fix log_auth_error function
CREATE OR REPLACE FUNCTION public.log_auth_error(p_user_id uuid, p_error_type text, p_error_message text, p_error_details jsonb DEFAULT NULL::jsonb, p_user_agent text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text, p_url text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  error_log_id UUID;
BEGIN
  INSERT INTO public.auth_error_logs (
    user_id,
    error_type,
    error_message,
    error_details,
    user_agent,
    ip_address,
    url
  ) VALUES (
    p_user_id,
    p_error_type,
    p_error_message,
    p_error_details,
    p_user_agent,
    p_ip_address,
    p_url
  ) RETURNING id INTO error_log_id;
  
  RETURN error_log_id;
END;
$function$;

-- Fix cleanup_old_data function
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix other critical security definer functions
CREATE OR REPLACE FUNCTION public.perform_health_check()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix create_system_alert function
CREATE OR REPLACE FUNCTION public.create_system_alert(p_alert_type text, p_severity text, p_title text, p_description text DEFAULT NULL::text, p_alert_data jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO public.system_alerts (
    alert_type,
    severity,
    title,
    description,
    alert_data
  ) VALUES (
    p_alert_type,
    p_severity,
    p_title,
    p_description,
    p_alert_data
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$function$;