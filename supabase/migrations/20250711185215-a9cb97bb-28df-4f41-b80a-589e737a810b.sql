-- Phase 1: Medical Digital Twin Database Schema - Missing Tables Only
-- Add new specialized health tables for comprehensive medical tracking

-- Glucose Metrics Table
CREATE TABLE public.glucose_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  measurement_value NUMERIC(5,1) NOT NULL,
  measurement_unit TEXT NOT NULL DEFAULT 'mg/dL',
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('fasting', 'post_meal', 'random', 'bedtime', 'pre_meal')),
  measurement_time TIME WITHOUT TIME ZONE,
  meal_context TEXT,
  symptoms_noted TEXT[],
  medication_taken BOOLEAN DEFAULT false,
  device_source TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Body Composition Metrics Table
CREATE TABLE public.body_composition_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight_kg NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,1),
  muscle_mass_kg NUMERIC(5,2),
  bone_density NUMERIC(4,2),
  water_percentage NUMERIC(4,1),
  visceral_fat_level INTEGER,
  metabolic_age INTEGER,
  bmi NUMERIC(4,1),
  measurement_method TEXT,
  device_source TEXT,
  measurement_date DATE NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Physical Activity Detailed Table
CREATE TABLE public.physical_activity_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  activity_subtype TEXT,
  duration_minutes INTEGER NOT NULL,
  intensity_level TEXT CHECK (intensity_level IN ('low', 'moderate', 'high', 'maximum')),
  calories_burned INTEGER,
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  distance_km NUMERIC(6,2),
  steps_count INTEGER,
  elevation_gain INTEGER,
  workout_notes TEXT,
  device_source TEXT,
  activity_date DATE NOT NULL,
  start_time TIME WITHOUT TIME ZONE,
  end_time TIME WITHOUT TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Device Registry Table
CREATE TABLE public.medical_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT,
  device_identifier TEXT UNIQUE,
  connection_status TEXT DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'manual',
  data_types TEXT[] DEFAULT '{}',
  device_settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.glucose_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_composition_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_activity_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for glucose_metrics
CREATE POLICY "Users can manage own glucose metrics" ON public.glucose_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for body_composition_metrics
CREATE POLICY "Users can manage own body composition metrics" ON public.body_composition_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for physical_activity_detailed
CREATE POLICY "Users can manage own physical activity data" ON public.physical_activity_detailed
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for medical_devices
CREATE POLICY "Users can manage own medical devices" ON public.medical_devices
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_glucose_metrics_user_date ON public.glucose_metrics(user_id, recorded_at);
CREATE INDEX idx_body_composition_user_date ON public.body_composition_metrics(user_id, measurement_date);
CREATE INDEX idx_physical_activity_user_date ON public.physical_activity_detailed(user_id, activity_date);
CREATE INDEX idx_medical_devices_user_active ON public.medical_devices(user_id, is_active);

-- Add updated_at triggers
CREATE TRIGGER update_glucose_metrics_updated_at
  BEFORE UPDATE ON public.glucose_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_body_composition_updated_at
  BEFORE UPDATE ON public.body_composition_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_physical_activity_updated_at
  BEFORE UPDATE ON public.physical_activity_detailed
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_devices_updated_at
  BEFORE UPDATE ON public.medical_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();