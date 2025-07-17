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

-- Step 2: Migrate data from old structure to new structure using a function
DO $$
DECLARE
  user_record RECORD;
  step_record RECORD;
  basic_info_data JSONB := '{}';
  menstrual_history_data JSONB := '{}';
  symptoms_data JSONB := '{}';
  medical_history_data JSONB := '{}';
  lifestyle_data JSONB := '{}';
  goals_data JSONB := '{}';
  completed_steps_array TEXT[] := '{}';
  completion_percentage INTEGER := 0;
  phase_result_data JSONB := '{}';
  recommendations_data JSONB := '{}';
  step_count INTEGER := 0;
  min_created_at TIMESTAMP WITH TIME ZONE;
  max_updated_at TIMESTAMP WITH TIME ZONE;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM public.onboarding_data
  LOOP
    -- Reset variables for each user
    basic_info_data := '{}';
    menstrual_history_data := '{}';
    symptoms_data := '{}';
    medical_history_data := '{}';
    lifestyle_data := '{}';
    goals_data := '{}';
    completed_steps_array := '{}';
    completion_percentage := 0;
    phase_result_data := '{}';
    recommendations_data := '{}';
    step_count := 0;
    min_created_at := null;
    max_updated_at := null;
    
    -- Get min and max timestamps
    SELECT MIN(completed_at), MAX(completed_at) 
    INTO min_created_at, max_updated_at
    FROM public.onboarding_data 
    WHERE user_id = user_record.user_id;
    
    -- Collect all onboarding steps for this user
    FOR step_record IN 
      SELECT * FROM public.onboarding_data 
      WHERE user_id = user_record.user_id
      ORDER BY step_number
    LOOP
      -- Add to completed steps array
      completed_steps_array := array_append(completed_steps_array, step_record.step_name);
      step_count := step_count + 1;
      
      -- Consolidate step data based on step type
      CASE step_record.step_name
        WHEN 'basicInfo' THEN
          basic_info_data := step_record.step_data;
        WHEN 'menstrualHistory' THEN
          menstrual_history_data := step_record.step_data;
        WHEN 'symptoms' THEN
          symptoms_data := step_record.step_data;
        WHEN 'medicalHistory' THEN
          medical_history_data := step_record.step_data;
        WHEN 'lifestyle' THEN
          lifestyle_data := step_record.step_data;
        WHEN 'goals' THEN
          goals_data := step_record.step_data;
        WHEN 'phaseAssessment' THEN
          phase_result_data := step_record.step_data;
        WHEN 'recommendations' THEN
          recommendations_data := step_record.step_data;
        ELSE
          NULL;
      END CASE;
    END LOOP;
    
    -- Calculate completion percentage (assuming 6 main steps)
    completion_percentage := LEAST(100, (step_count * 100) / 6);
    
    -- Insert consolidated data into new table
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
    ) VALUES (
      user_record.user_id,
      basic_info_data,
      menstrual_history_data,
      symptoms_data,
      medical_history_data,
      lifestyle_data,
      goals_data,
      completed_steps_array,
      completion_percentage,
      phase_result_data,
      recommendations_data,
      COALESCE(min_created_at, NOW()),
      COALESCE(max_updated_at, NOW())
    );
    
  END LOOP;
END;
$$;

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