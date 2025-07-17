-- Step 1: Create temporary table with new structure
CREATE TABLE public.onboarding_data_new (
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

-- Step 2: Migrate data from old structure to new structure
INSERT INTO public.onboarding_data_new (
  user_id,
  basic_info,
  menstrual_history,
  symptoms,
  medical_history,
  lifestyle,
  goals,
  completed_steps,
  completion_percentage,
  phase_result,
  recommendations,
  created_at,
  updated_at
)
SELECT 
  user_id,
  COALESCE(MAX(CASE WHEN step_name = 'basicInfo' THEN step_data END), '{}') as basic_info,
  COALESCE(MAX(CASE WHEN step_name = 'menstrualHistory' THEN step_data END), '{}') as menstrual_history,
  COALESCE(MAX(CASE WHEN step_name = 'symptoms' THEN step_data END), '{}') as symptoms,
  COALESCE(MAX(CASE WHEN step_name = 'medicalHistory' THEN step_data END), '{}') as medical_history,
  COALESCE(MAX(CASE WHEN step_name = 'lifestyle' THEN step_data END), '{}') as lifestyle,
  COALESCE(MAX(CASE WHEN step_name = 'goals' THEN step_data END), '{}') as goals,
  ARRAY_AGG(step_name ORDER BY step_number) as completed_steps,
  LEAST(100, (COUNT(*) * 100) / 6) as completion_percentage,
  COALESCE(MAX(CASE WHEN step_name = 'phaseAssessment' THEN step_data END), '{}') as phase_result,
  COALESCE(MAX(CASE WHEN step_name = 'recommendations' THEN step_data END), '{}') as recommendations,
  MIN(completed_at) as created_at,
  MAX(completed_at) as updated_at
FROM public.onboarding_data
GROUP BY user_id;

-- Step 3: Drop old table and rename new one
DROP TABLE public.onboarding_data;
ALTER TABLE public.onboarding_data_new RENAME TO onboarding_data;

-- Step 4: Update user profiles with correct completion status
UPDATE public.user_profiles 
SET onboarding_completion_percentage = COALESCE((
  SELECT od.completion_percentage 
  FROM public.onboarding_data od 
  WHERE od.user_id = user_profiles.id 
  LIMIT 1
), 0),
onboarding_completed = CASE 
  WHEN EXISTS (
    SELECT 1 FROM public.onboarding_data od 
    WHERE od.user_id = user_profiles.id 
    AND od.completion_percentage >= 100
  ) THEN true
  ELSE false
END,
updated_at = NOW()
WHERE onboarding_completed = true AND onboarding_completion_percentage = 0;

-- Step 5: Enable RLS on the new table
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "Users can manage their own onboarding data"
ON public.onboarding_data
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 7: Create trigger to update updated_at timestamp
CREATE TRIGGER update_onboarding_data_updated_at
  BEFORE UPDATE ON public.onboarding_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_onboarding_data_updated_at();