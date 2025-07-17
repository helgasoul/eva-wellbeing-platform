-- Create onboarding_data table to store user onboarding information
CREATE TABLE public.onboarding_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  basic_info JSONB DEFAULT '{}',
  menstrual_history JSONB DEFAULT '{}',
  symptoms JSONB DEFAULT '{}',
  medical_history JSONB DEFAULT '{}',
  lifestyle JSONB DEFAULT '{}',
  goals JSONB DEFAULT '{}',
  completed_steps TEXT[] DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  phase_result JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add onboarding completion tracking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_phase_result JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_onboarding_step TEXT;

-- Enable RLS on onboarding_data table
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for onboarding_data
CREATE POLICY "Users can manage their own onboarding data"
ON public.onboarding_data
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_onboarding_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_data_updated_at();

-- Create function to sync onboarding completion status
CREATE OR REPLACE FUNCTION public.sync_onboarding_completion_status(
  p_user_id UUID,
  p_completion_percentage INTEGER,
  p_phase_result JSONB DEFAULT '{}',
  p_completed_steps TEXT[] DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user_profiles with onboarding completion status
  UPDATE public.user_profiles
  SET 
    onboarding_completed = (p_completion_percentage >= 100),
    onboarding_completed_at = CASE 
      WHEN p_completion_percentage >= 100 AND onboarding_completed_at IS NULL 
      THEN now() 
      ELSE onboarding_completed_at 
    END,
    onboarding_completion_percentage = p_completion_percentage,
    onboarding_phase_result = p_phase_result,
    last_onboarding_step = CASE 
      WHEN array_length(p_completed_steps, 1) > 0 
      THEN p_completed_steps[array_length(p_completed_steps, 1)]
      ELSE last_onboarding_step
    END,
    updated_at = now()
  WHERE id = p_user_id;
END;
$$;