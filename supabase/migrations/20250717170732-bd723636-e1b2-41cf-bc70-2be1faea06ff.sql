-- Step 1: Create migration function to consolidate onboarding data
CREATE OR REPLACE FUNCTION public.migrate_onboarding_data_to_new_format()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  onboarding_record RECORD;
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
BEGIN
  -- Loop through all users who have onboarding_steps but no onboarding_data
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.onboarding_steps 
    WHERE user_id NOT IN (SELECT user_id FROM public.onboarding_data)
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
    
    -- Collect all onboarding steps for this user
    FOR onboarding_record IN 
      SELECT * FROM public.onboarding_steps 
      WHERE user_id = user_record.user_id AND completed = true
      ORDER BY completed_at
    LOOP
      -- Add to completed steps array
      completed_steps_array := array_append(completed_steps_array, onboarding_record.step_name);
      
      -- Consolidate step data based on step type
      CASE onboarding_record.step_name
        WHEN 'basic_info' THEN
          basic_info_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'menstrual_history' THEN
          menstrual_history_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'symptoms' THEN
          symptoms_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'medical_history' THEN
          medical_history_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'lifestyle' THEN
          lifestyle_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'goals' THEN
          goals_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'phase_assessment' THEN
          phase_result_data := COALESCE(onboarding_record.step_data, '{}');
        WHEN 'recommendations' THEN
          recommendations_data := COALESCE(onboarding_record.step_data, '{}');
        ELSE
          NULL;
      END CASE;
    END LOOP;
    
    -- Calculate completion percentage (assuming 6 main steps)
    completion_percentage := (array_length(completed_steps_array, 1) * 100) / 6;
    IF completion_percentage > 100 THEN
      completion_percentage := 100;
    END IF;
    
    -- Insert consolidated data into onboarding_data table
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
    );
    
    -- Update user profile with correct completion status
    PERFORM public.sync_onboarding_completion_status(
      user_record.user_id,
      completion_percentage,
      phase_result_data,
      completed_steps_array
    );
    
    RAISE NOTICE 'Migrated onboarding data for user %', user_record.user_id;
  END LOOP;
END;
$$;

-- Step 2: Run the migration
SELECT public.migrate_onboarding_data_to_new_format();

-- Step 3: Update existing onboarding_data records to ensure completion percentage is correct
UPDATE public.onboarding_data 
SET completion_percentage = CASE 
  WHEN array_length(completed_steps, 1) IS NULL THEN 0
  ELSE (array_length(completed_steps, 1) * 100) / 6
END,
updated_at = NOW()
WHERE completion_percentage != CASE 
  WHEN array_length(completed_steps, 1) IS NULL THEN 0
  ELSE (array_length(completed_steps, 1) * 100) / 6
END;

-- Step 4: Sync user profiles for all users with onboarding data
DO $$
DECLARE
  onboarding_record RECORD;
BEGIN
  FOR onboarding_record IN 
    SELECT user_id, completion_percentage, phase_result, completed_steps 
    FROM public.onboarding_data
  LOOP
    PERFORM public.sync_onboarding_completion_status(
      onboarding_record.user_id,
      onboarding_record.completion_percentage,
      COALESCE(onboarding_record.phase_result, '{}'),
      COALESCE(onboarding_record.completed_steps, '{}')
    );
  END LOOP;
END;
$$;