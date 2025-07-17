-- Step 1: Create migration function to consolidate individual onboarding steps
CREATE OR REPLACE FUNCTION public.consolidate_onboarding_steps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  consolidated_id UUID;
BEGIN
  -- Loop through users who have individual step records
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.onboarding_data 
    WHERE step_name IS NOT NULL
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
    
    -- Collect all onboarding steps for this user
    FOR step_record IN 
      SELECT * FROM public.onboarding_data 
      WHERE user_id = user_record.user_id AND step_name IS NOT NULL
      ORDER BY completed_at
    LOOP
      -- Add to completed steps array
      completed_steps_array := array_append(completed_steps_array, step_record.step_name);
      step_count := step_count + 1;
      
      -- Consolidate step data based on step type
      CASE step_record.step_name
        WHEN 'basicInfo' THEN
          basic_info_data := COALESCE(step_record.step_data, '{}');
        WHEN 'menstrualHistory' THEN
          menstrual_history_data := COALESCE(step_record.step_data, '{}');
        WHEN 'symptoms' THEN
          symptoms_data := COALESCE(step_record.step_data, '{}');
        WHEN 'medicalHistory' THEN
          medical_history_data := COALESCE(step_record.step_data, '{}');
        WHEN 'lifestyle' THEN
          lifestyle_data := COALESCE(step_record.step_data, '{}');
        WHEN 'goals' THEN
          goals_data := COALESCE(step_record.step_data, '{}');
        WHEN 'phaseAssessment' THEN
          phase_result_data := COALESCE(step_record.step_data, '{}');
        WHEN 'recommendations' THEN
          recommendations_data := COALESCE(step_record.step_data, '{}');
        ELSE
          NULL;
      END CASE;
    END LOOP;
    
    -- Calculate completion percentage (assuming 6 main steps)
    completion_percentage := (step_count * 100) / 6;
    IF completion_percentage > 100 THEN
      completion_percentage := 100;
    END IF;
    
    -- Create consolidated record
    INSERT INTO public.onboarding_data (
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
      NOW(),
      NOW()
    ) RETURNING id INTO consolidated_id;
    
    -- Delete the individual step records
    DELETE FROM public.onboarding_data 
    WHERE user_id = user_record.user_id AND step_name IS NOT NULL;
    
    -- Update user profile with correct completion status
    PERFORM public.sync_onboarding_completion_status(
      user_record.user_id,
      completion_percentage,
      phase_result_data,
      completed_steps_array
    );
    
    RAISE NOTICE 'Consolidated onboarding data for user % with %% completion', user_record.user_id, completion_percentage;
  END LOOP;
END;
$$;

-- Step 2: Run the consolidation
SELECT public.consolidate_onboarding_steps();

-- Step 3: Update any remaining user profiles that may have incorrect completion percentages
UPDATE public.user_profiles 
SET onboarding_completion_percentage = CASE 
  WHEN EXISTS (
    SELECT 1 FROM public.onboarding_data od 
    WHERE od.user_id = user_profiles.id 
    AND od.completion_percentage >= 100
  ) THEN 100
  ELSE COALESCE((
    SELECT od.completion_percentage 
    FROM public.onboarding_data od 
    WHERE od.user_id = user_profiles.id 
    LIMIT 1
  ), 0)
END,
updated_at = NOW()
WHERE onboarding_completed = true AND onboarding_completion_percentage = 0;