-- Add missing columns to existing health_app_integrations table
ALTER TABLE public.health_app_integrations 
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS integration_type TEXT DEFAULT 'oauth',
ADD COLUMN IF NOT EXISTS sync_frequency TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS scopes_granted TEXT[],
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_secret TEXT,
ADD COLUMN IF NOT EXISTS error_details JSONB,
ADD COLUMN IF NOT EXISTS provider_user_id TEXT;

-- Update provider_name from app_name for existing records
UPDATE public.health_app_integrations 
SET provider_name = COALESCE(provider_name, app_name)
WHERE provider_name IS NULL;

-- Add missing columns to existing external_health_data table
ALTER TABLE public.external_health_data 
ADD COLUMN IF NOT EXISTS recorded_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_source TEXT,
ADD COLUMN IF NOT EXISTS data_quality_score NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS is_processed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS processing_errors JSONB;

-- Create unique constraint if it doesn't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE public.external_health_data 
        ADD CONSTRAINT unique_external_data_new UNIQUE(integration_id, external_id, data_type);
    EXCEPTION 
        WHEN duplicate_table THEN NULL;
    END;
END $$;

-- Update existing records to have data_source from integration
UPDATE public.external_health_data 
SET data_source = COALESCE(data_source, 'Unknown')
WHERE data_source IS NULL;