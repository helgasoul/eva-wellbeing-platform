-- Add onboarding completion tracking columns to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_phase_result JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_onboarding_step TEXT;

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