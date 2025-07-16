-- Create glucose_metrics table
CREATE TABLE public.glucose_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    measurement_value DECIMAL(5,2) NOT NULL,
    measurement_unit VARCHAR(20) DEFAULT 'mg/dL',
    measurement_type VARCHAR(50) NOT NULL,
    measurement_time TIME,
    meal_context VARCHAR(100),
    symptoms_noted TEXT[],
    medication_taken BOOLEAN DEFAULT false,
    device_source VARCHAR(100),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create body_composition_metrics table
CREATE TABLE public.body_composition_metrics (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    bone_density DECIMAL(5,2),
    water_percentage DECIMAL(5,2),
    visceral_fat_level INTEGER,
    metabolic_age INTEGER,
    bmi DECIMAL(5,2),
    measurement_method VARCHAR(100),
    device_source VARCHAR(100),
    measurement_date DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create physical_activity_detailed table
CREATE TABLE public.physical_activity_detailed (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_subtype VARCHAR(100),
    duration_minutes INTEGER NOT NULL,
    intensity_level VARCHAR(50),
    calories_burned INTEGER,
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    distance_km DECIMAL(8,2),
    steps_count INTEGER,
    elevation_gain INTEGER,
    workout_notes TEXT,
    device_source VARCHAR(100),
    activity_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_devices table
CREATE TABLE public.medical_devices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    device_name VARCHAR(200) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    device_identifier VARCHAR(200),
    connection_status VARCHAR(50) DEFAULT 'disconnected',
    sync_frequency VARCHAR(50),
    data_types TEXT[],
    device_settings JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_patterns table
CREATE TABLE public.health_patterns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pattern_name VARCHAR(200) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    description TEXT,
    confidence_score DECIMAL(3,2),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    pattern_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.glucose_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_composition_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_activity_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for glucose_metrics
CREATE POLICY "Users can view their own glucose metrics"
ON public.glucose_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own glucose metrics"
ON public.glucose_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own glucose metrics"
ON public.glucose_metrics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own glucose metrics"
ON public.glucose_metrics FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for body_composition_metrics
CREATE POLICY "Users can view their own body composition metrics"
ON public.body_composition_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body composition metrics"
ON public.body_composition_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body composition metrics"
ON public.body_composition_metrics FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body composition metrics"
ON public.body_composition_metrics FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for physical_activity_detailed
CREATE POLICY "Users can view their own physical activities"
ON public.physical_activity_detailed FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own physical activities"
ON public.physical_activity_detailed FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own physical activities"
ON public.physical_activity_detailed FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own physical activities"
ON public.physical_activity_detailed FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for medical_devices
CREATE POLICY "Users can view their own medical devices"
ON public.medical_devices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical devices"
ON public.medical_devices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical devices"
ON public.medical_devices FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical devices"
ON public.medical_devices FOR DELETE
USING (auth.uid() = user_id);

-- Create RLS policies for health_patterns
CREATE POLICY "Users can view their own health patterns"
ON public.health_patterns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health patterns"
ON public.health_patterns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health patterns"
ON public.health_patterns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health patterns"
ON public.health_patterns FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_glucose_metrics_updated_at
    BEFORE UPDATE ON public.glucose_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_body_composition_metrics_updated_at
    BEFORE UPDATE ON public.body_composition_metrics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_physical_activity_detailed_updated_at
    BEFORE UPDATE ON public.physical_activity_detailed
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_devices_updated_at
    BEFORE UPDATE ON public.medical_devices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_patterns_updated_at
    BEFORE UPDATE ON public.health_patterns
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_glucose_metrics_user_id ON public.glucose_metrics(user_id);
CREATE INDEX idx_glucose_metrics_recorded_at ON public.glucose_metrics(recorded_at);
CREATE INDEX idx_body_composition_metrics_user_id ON public.body_composition_metrics(user_id);
CREATE INDEX idx_body_composition_metrics_measurement_date ON public.body_composition_metrics(measurement_date);
CREATE INDEX idx_physical_activity_detailed_user_id ON public.physical_activity_detailed(user_id);
CREATE INDEX idx_physical_activity_detailed_activity_date ON public.physical_activity_detailed(activity_date);
CREATE INDEX idx_medical_devices_user_id ON public.medical_devices(user_id);
CREATE INDEX idx_medical_devices_connection_status ON public.medical_devices(connection_status);
CREATE INDEX idx_health_patterns_user_id ON public.health_patterns(user_id);
CREATE INDEX idx_health_patterns_pattern_type ON public.health_patterns(pattern_type);