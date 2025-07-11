-- Extend medical_partners table for LIMS/MIS integration
ALTER TABLE public.medical_partners 
ADD COLUMN IF NOT EXISTS partner_type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS integration_capabilities jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS data_standards_supported text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hl7_endpoint text,
ADD COLUMN IF NOT EXISTS fhir_endpoint text,
ADD COLUMN IF NOT EXISTS certification_details jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compliance_standards text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_sync_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sync_frequency text DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS data_retention_days integer DEFAULT 365;

-- Create lab_tests_catalog table
CREATE TABLE IF NOT EXISTS public.lab_tests_catalog (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_code text NOT NULL UNIQUE,
  test_name text NOT NULL,
  test_category text NOT NULL,
  loinc_code text,
  snomed_code text,
  specimen_type text NOT NULL,
  normal_ranges jsonb DEFAULT '{}',
  units text,
  methodology text,
  turnaround_time_hours integer,
  cost numeric,
  partner_id uuid REFERENCES public.medical_partners(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create lab_orders table
CREATE TABLE IF NOT EXISTS public.lab_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  partner_id uuid NOT NULL REFERENCES public.medical_partners(id),
  order_number text NOT NULL UNIQUE,
  external_order_id text,
  ordering_provider_name text,
  ordering_provider_npi text,
  patient_demographics jsonb NOT NULL,
  ordered_tests jsonb NOT NULL DEFAULT '[]',
  clinical_notes text,
  diagnosis_codes text[] DEFAULT '{}',
  specimen_collection_date timestamp with time zone,
  specimen_collection_site text,
  priority_level text DEFAULT 'routine',
  order_status text DEFAULT 'pending',
  hl7_message text,
  integration_metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS public.lab_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lab_order_id uuid REFERENCES public.lab_orders(id),
  partner_id uuid NOT NULL REFERENCES public.medical_partners(id),
  test_code text NOT NULL,
  test_name text NOT NULL,
  result_value text,
  result_numeric numeric,
  result_units text,
  reference_range text,
  abnormal_flag text,
  result_status text DEFAULT 'final',
  performed_date timestamp with time zone,
  reported_date timestamp with time zone,
  performing_lab text,
  technician_id text,
  verified_by text,
  loinc_code text,
  snomed_code text,
  hl7_segment text,
  critical_flag boolean DEFAULT false,
  delta_check_flag boolean DEFAULT false,
  quality_control_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create medical_data_mappings table
CREATE TABLE IF NOT EXISTS public.medical_data_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.medical_partners(id),
  source_system text NOT NULL,
  source_field text NOT NULL,
  target_field text NOT NULL,
  data_type text NOT NULL,
  mapping_rules jsonb DEFAULT '{}',
  validation_rules jsonb DEFAULT '{}',
  transformation_logic text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(partner_id, source_system, source_field)
);

-- Create integration_audit_logs table
CREATE TABLE IF NOT EXISTS public.integration_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.medical_partners(id),
  user_id uuid,
  operation_type text NOT NULL,
  endpoint_called text,
  request_payload jsonb,
  response_payload jsonb,
  status_code integer,
  processing_time_ms integer,
  error_message text,
  records_processed integer DEFAULT 0,
  data_quality_score numeric,
  compliance_check_passed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create partner_api_configurations table
CREATE TABLE IF NOT EXISTS public.partner_api_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.medical_partners(id),
  api_type text NOT NULL,
  base_url text NOT NULL,
  authentication_method text NOT NULL,
  api_key_encrypted text,
  oauth_config jsonb,
  rate_limits jsonb DEFAULT '{}',
  timeout_seconds integer DEFAULT 30,
  retry_config jsonb DEFAULT '{"max_retries": 3, "backoff_factor": 2}',
  supported_formats text[] DEFAULT '{"json", "xml", "hl7"}',
  webhook_endpoints jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_tested_at timestamp with time zone,
  test_results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(partner_id, api_type)
);

-- Enable RLS on new tables
ALTER TABLE public.lab_tests_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_data_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_api_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lab_orders
CREATE POLICY "Users can view their own lab orders" ON public.lab_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab orders" ON public.lab_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab orders" ON public.lab_orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for lab_results
CREATE POLICY "Users can view their own lab results" ON public.lab_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lab results" ON public.lab_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for administrative tables
CREATE POLICY "Admins can manage lab tests catalog" ON public.lab_tests_catalog
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage data mappings" ON public.medical_data_mappings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view audit logs" ON public.integration_audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage API configurations" ON public.partner_api_configurations
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_orders_user_id ON public.lab_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_partner_id ON public.lab_orders(partner_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.lab_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_lab_results_user_id ON public.lab_results(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_order_id ON public.lab_results(lab_order_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_test_code ON public.lab_results(test_code);
CREATE INDEX IF NOT EXISTS idx_integration_logs_partner_id ON public.integration_audit_logs(partner_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON public.integration_audit_logs(created_at);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lab_tests_catalog_updated_at
    BEFORE UPDATE ON public.lab_tests_catalog
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
    BEFORE UPDATE ON public.lab_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at
    BEFORE UPDATE ON public.lab_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_data_mappings_updated_at
    BEFORE UPDATE ON public.medical_data_mappings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_api_configurations_updated_at
    BEFORE UPDATE ON public.partner_api_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();