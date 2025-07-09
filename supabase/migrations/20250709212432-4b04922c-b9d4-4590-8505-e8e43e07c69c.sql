-- Create table for daily weather records
CREATE TABLE public.daily_weather_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  location_data JSONB NOT NULL,
  weather_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_weather_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own weather data" 
ON public.daily_weather_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weather data" 
ON public.daily_weather_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather data" 
ON public.daily_weather_records 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate records for same user/date
CREATE UNIQUE INDEX daily_weather_records_user_date_idx 
ON public.daily_weather_records (user_id, date);

-- Create updated_at trigger
CREATE TRIGGER update_daily_weather_records_updated_at
BEFORE UPDATE ON public.daily_weather_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for user locations
CREATE TABLE public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  location_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for user locations
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for user locations
CREATE POLICY "Users can manage their own location" 
ON public.user_locations 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for user locations
CREATE TRIGGER update_user_locations_updated_at
BEFORE UPDATE ON public.user_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();