-- Create system alerts table for monitoring auth issues
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  alert_data JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system health checks table
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create auth error logs table
CREATE TABLE IF NOT EXISTS public.auth_error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  user_agent TEXT,
  ip_address TEXT,
  url TEXT,
  recovery_attempted BOOLEAN DEFAULT false,
  recovery_successful BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for system alerts (admin only)
CREATE POLICY "Admins can view system alerts"
ON public.system_alerts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for system health checks (admin only)
CREATE POLICY "Admins can view system health checks"
ON public.system_health_checks FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create policies for auth error logs (users can see their own errors, admins can see all)
CREATE POLICY "Users can view their own auth errors"
ON public.auth_error_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all auth errors"
ON public.auth_error_logs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log auth errors
CREATE OR REPLACE FUNCTION public.log_auth_error(
  p_user_id UUID,
  p_error_type TEXT,
  p_error_message TEXT,
  p_error_details JSONB DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create trigger to update updated_at on system_alerts
CREATE OR REPLACE FUNCTION public.update_system_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_alerts_updated_at
  BEFORE UPDATE ON public.system_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_alerts_updated_at();

-- Create function to create system alert
CREATE OR REPLACE FUNCTION public.create_system_alert(
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_alert_data JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;