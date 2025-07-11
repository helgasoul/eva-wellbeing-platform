-- Drop existing policies that conflict and recreate with updated logic
DROP POLICY IF EXISTS "Users can view their own external health data" ON public.external_health_data;
DROP POLICY IF EXISTS "Users can insert their own health data" ON public.external_health_data;
DROP POLICY IF EXISTS "Users can view their own health data" ON public.external_health_data;
DROP POLICY IF EXISTS "Users can insert their own health data" ON public.external_health_data;

-- Create enhanced RLS policies for external_health_data
CREATE POLICY "Users can view their own external health data" 
ON public.external_health_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert health data for users" 
ON public.external_health_data 
FOR INSERT 
WITH CHECK (true); -- Edge functions will handle this with service role

-- Create missing tables and indexes if they don't exist
CREATE TABLE IF NOT EXISTS public.health_data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.health_app_integrations(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'running',
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  data_types_synced TEXT[],
  error_details JSONB,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_health_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_units JSONB DEFAULT '{"weight": "kg", "height": "cm", "temperature": "celsius"}',
  data_sharing_settings JSONB DEFAULT '{"share_with_providers": false, "anonymous_research": false}',
  sync_preferences JSONB DEFAULT '{"auto_sync": true, "sync_frequency": "daily"}',
  notification_settings JSONB DEFAULT '{"sync_alerts": true, "data_anomalies": true}',
  data_retention_days INTEGER DEFAULT 730,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for new tables
ALTER TABLE public.health_data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Users can view their sync logs" 
ON public.health_data_sync_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.health_app_integrations 
  WHERE id = health_data_sync_logs.integration_id 
  AND user_id = auth.uid()
));

CREATE POLICY "Users can manage their health preferences" 
ON public.user_health_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_data_sync_logs_integration ON public.health_data_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_user_health_preferences_user ON public.user_health_preferences(user_id);