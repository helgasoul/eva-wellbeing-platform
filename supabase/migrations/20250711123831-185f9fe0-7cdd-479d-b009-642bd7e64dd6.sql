-- Enhanced external health app integrations
CREATE TABLE IF NOT EXISTS public.health_app_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL, -- 'apple_health', 'whoop', 'oura', 'fitbit', 'garmin'
  integration_type TEXT NOT NULL DEFAULT 'oauth', -- 'oauth', 'api_key', 'manual'
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  integration_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'error', 'revoked'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'daily', -- 'real_time', 'hourly', 'daily', 'weekly'
  sync_settings JSONB DEFAULT '{}',
  provider_user_id TEXT, -- External user ID from the provider
  scopes_granted TEXT[], -- List of data scopes user granted
  webhook_url TEXT,
  webhook_secret TEXT,
  error_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id, provider_name)
);

-- Enhanced external health data storage
CREATE TABLE IF NOT EXISTS public.external_health_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  integration_id UUID NOT NULL REFERENCES public.health_app_integrations(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL, -- 'steps', 'heart_rate', 'sleep', 'workout', 'nutrition', etc.
  data_payload JSONB NOT NULL,
  external_id TEXT, -- Provider's unique ID for this data point
  recorded_date DATE NOT NULL, -- When the health event occurred
  recorded_timestamp TIMESTAMP WITH TIME ZONE, -- Precise timestamp if available
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_source TEXT, -- Specific device or app that recorded the data
  data_quality_score NUMERIC(3,2), -- 0.0 to 1.0 quality assessment
  is_processed BOOLEAN DEFAULT false,
  processing_errors JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Indexes for efficient querying
  CONSTRAINT unique_external_data UNIQUE(integration_id, external_id, data_type)
);

-- Health data sync logs for monitoring
CREATE TABLE IF NOT EXISTS public.health_data_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.health_app_integrations(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'partial'
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  data_types_synced TEXT[],
  error_details JSONB,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User health data preferences
CREATE TABLE IF NOT EXISTS public.user_health_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferred_units JSONB DEFAULT '{"weight": "kg", "height": "cm", "temperature": "celsius"}',
  data_sharing_settings JSONB DEFAULT '{"share_with_providers": false, "anonymous_research": false}',
  sync_preferences JSONB DEFAULT '{"auto_sync": true, "sync_frequency": "daily"}',
  notification_settings JSONB DEFAULT '{"sync_alerts": true, "data_anomalies": true}',
  data_retention_days INTEGER DEFAULT 730, -- 2 years default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.health_app_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_data_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own health integrations" 
ON public.health_app_integrations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own external health data" 
ON public.external_health_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert health data" 
ON public.external_health_data 
FOR INSERT 
WITH CHECK (true); -- Edge functions will handle this

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_integrations_user_provider ON public.health_app_integrations(user_id, provider_name);
CREATE INDEX IF NOT EXISTS idx_health_integrations_status ON public.health_app_integrations(integration_status);
CREATE INDEX IF NOT EXISTS idx_external_health_data_user_date ON public.external_health_data(user_id, recorded_date);
CREATE INDEX IF NOT EXISTS idx_external_health_data_type ON public.external_health_data(data_type);
CREATE INDEX IF NOT EXISTS idx_external_health_data_integration ON public.external_health_data(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON public.health_data_sync_logs(integration_id);

-- Trigger for updating timestamps
CREATE TRIGGER update_health_integrations_updated_at
  BEFORE UPDATE ON public.health_app_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_preferences_updated_at
  BEFORE UPDATE ON public.user_health_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();