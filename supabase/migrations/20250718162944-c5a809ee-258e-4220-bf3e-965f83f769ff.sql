
-- Create tables for DataBridge system
CREATE TABLE IF NOT EXISTS public.data_bridge_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_source TEXT NOT NULL,
  to_destination TEXT NOT NULL,
  data_payload JSONB NOT NULL,
  transfer_status TEXT NOT NULL DEFAULT 'pending',
  transferred_keys TEXT[] DEFAULT '{}',
  errors TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  validation_result JSONB DEFAULT NULL,
  backup_id UUID DEFAULT NULL,
  duration_ms INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_bridge_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_type TEXT NOT NULL,
  backup_data JSONB NOT NULL,
  backup_size INTEGER NOT NULL,
  checksum TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  is_compressed BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_bridge_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  data_type TEXT NOT NULL,
  affected_keys TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  session_id TEXT DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_bridge_health_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
  overall_status TEXT NOT NULL,
  issues JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  check_duration_ms INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_bridge_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT NULL,
  total_transfers INTEGER DEFAULT 0,
  successful_transfers INTEGER DEFAULT 0,
  failed_transfers INTEGER DEFAULT 0,
  average_transfer_time NUMERIC DEFAULT 0,
  data_integrity_score NUMERIC DEFAULT 100,
  storage_utilization NUMERIC DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  last_backup_time TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.data_bridge_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_bridge_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_bridge_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_bridge_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_bridge_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own transfers" ON public.data_bridge_transfers
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own backups" ON public.data_bridge_backups
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own audit logs" ON public.data_bridge_audit_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health reports" ON public.data_bridge_health_reports
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create health reports" ON public.data_bridge_health_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own metrics" ON public.data_bridge_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can manage metrics" ON public.data_bridge_metrics
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_bridge_transfers_user_id ON public.data_bridge_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_data_bridge_transfers_status ON public.data_bridge_transfers(transfer_status);
CREATE INDEX IF NOT EXISTS idx_data_bridge_backups_user_id ON public.data_bridge_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_data_bridge_backups_expires_at ON public.data_bridge_backups(expires_at);
CREATE INDEX IF NOT EXISTS idx_data_bridge_audit_log_user_id ON public.data_bridge_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_bridge_audit_log_action ON public.data_bridge_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_data_bridge_health_reports_created_at ON public.data_bridge_health_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_data_bridge_metrics_user_id ON public.data_bridge_metrics(user_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_data_bridge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_data_bridge_transfers_updated_at
    BEFORE UPDATE ON public.data_bridge_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_data_bridge_updated_at();

CREATE TRIGGER update_data_bridge_metrics_updated_at
    BEFORE UPDATE ON public.data_bridge_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_data_bridge_updated_at();
