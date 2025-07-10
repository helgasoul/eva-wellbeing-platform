-- Удаляем пользователей helgasoul@yandex.ru и o.s.puchkova@icloud.com
-- Полное удаление с учетом ВСЕХ зависимостей

DO $$
DECLARE
    user_id_1 UUID;
    user_id_2 UUID;
BEGIN
    -- Находим ID пользователей
    SELECT id INTO user_id_1 FROM auth.users WHERE email = 'helgasoul@yandex.ru';
    SELECT id INTO user_id_2 FROM auth.users WHERE email = 'o.s.puchkova@icloud.com';
    
    -- Удаляем связанные данные для первого пользователя
    IF user_id_1 IS NOT NULL THEN
        -- Удаляем данные из всех таблиц с внешними ключами
        DELETE FROM public.health_recommendations WHERE risk_assessment_id IN (
            SELECT id FROM public.risk_assessments WHERE user_id = user_id_1
        );
        DELETE FROM public.crc_pro_assessments WHERE user_id = user_id_1;
        DELETE FROM public.risk_assessments WHERE user_id = user_id_1;
        DELETE FROM public.calculator_results WHERE patient_id = user_id_1;
        DELETE FROM public.blog_comments WHERE author_id = user_id_1;
        DELETE FROM public.blog_post_likes WHERE user_id = user_id_1;
        DELETE FROM public.ai_chat_messages WHERE session_id IN (
            SELECT id FROM public.ai_chat_sessions WHERE user_id = user_id_1
        );
        DELETE FROM public.post_replies WHERE author_id = user_id_1;
        DELETE FROM public.family_memories WHERE author_id = user_id_1;
        DELETE FROM public.family_hereditary_risks WHERE created_by = user_id_1;
        DELETE FROM public.family_members WHERE created_by = user_id_1;
        DELETE FROM public.group_members WHERE user_id = user_id_1;
        DELETE FROM public.community_posts WHERE author_id = user_id_1;
        DELETE FROM public.consultation_bookings WHERE patient_id = user_id_1;
        DELETE FROM public.ai_analysis_sessions WHERE user_id = user_id_1;
        DELETE FROM public.health_app_integrations WHERE user_id = user_id_1;
        DELETE FROM public.wearable_devices WHERE user_id = user_id_1;
        DELETE FROM public.nutrition_entries WHERE user_id = user_id_1;
        DELETE FROM public.meal_plans WHERE user_id = user_id_1;
        DELETE FROM public.supplement_plans WHERE user_id = user_id_1;
        DELETE FROM public.nutrition_goals WHERE user_id = user_id_1;
        DELETE FROM public.food_preferences WHERE user_id = user_id_1;
        DELETE FROM public.medical_records WHERE user_id = user_id_1;
        DELETE FROM public.doctor_profiles WHERE user_id = user_id_1;
        DELETE FROM public.laboratory_profiles WHERE user_id = user_id_1;
        DELETE FROM public.clinic_profiles WHERE user_id = user_id_1;
        DELETE FROM public.pharmacy_profiles WHERE user_id = user_id_1;
        DELETE FROM public.user_profiles WHERE id = user_id_1;
        DELETE FROM public.onboarding_data WHERE user_id = user_id_1;
        DELETE FROM public.symptom_entries WHERE user_id = user_id_1;
        DELETE FROM public.ai_chat_sessions WHERE user_id = user_id_1;
        DELETE FROM public.user_locations WHERE user_id = user_id_1;
        DELETE FROM public.daily_weather_records WHERE user_id = user_id_1;
        DELETE FROM public.health_device_data WHERE user_id = user_id_1;
        DELETE FROM public.medical_events WHERE user_id = user_id_1;
        DELETE FROM public.user_reminders WHERE user_id = user_id_1;
        DELETE FROM public.screening_plans WHERE user_id = user_id_1;
        DELETE FROM public.medical_appointments WHERE user_id = user_id_1;
        DELETE FROM public.motivational_messages WHERE user_id = user_id_1;
        DELETE FROM public.user_achievements WHERE user_id = user_id_1;
        DELETE FROM public.medication_reminders WHERE user_id = user_id_1;
        DELETE FROM public.telemedicine_sessions WHERE user_id = user_id_1;
        DELETE FROM public.doctor_access_tokens WHERE user_id = user_id_1;
        DELETE FROM public.ai_insights WHERE user_id = user_id_1;
        DELETE FROM public.menopause_analysis WHERE user_id = user_id_1;
        DELETE FROM public.workflow_executions WHERE user_id = user_id_1;
        DELETE FROM public.family_groups WHERE created_by = user_id_1;
        DELETE FROM public.family_shared_plans WHERE owner_user_id = user_id_1;
        DELETE FROM public.daily_health_summary WHERE user_id = user_id_1;
        DELETE FROM public.correlation_analysis WHERE user_id = user_id_1;
        DELETE FROM public.data_relationships WHERE user_id = user_id_1;
        DELETE FROM public.automation_user_settings WHERE user_id = user_id_1;
        DELETE FROM public.automation_workflows WHERE user_id = user_id_1;
        DELETE FROM public.calendar_integrations WHERE user_id = user_id_1;
        DELETE FROM public.data_exports WHERE user_id = user_id_1;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id_1;
        
        RAISE NOTICE 'Deleted user helgasoul@yandex.ru with ID: %', user_id_1;
    ELSE
        RAISE NOTICE 'User helgasoul@yandex.ru not found';
    END IF;
    
    -- Удаляем связанные данные для второго пользователя
    IF user_id_2 IS NOT NULL THEN
        -- Удаляем данные из всех таблиц с внешними ключами
        DELETE FROM public.health_recommendations WHERE risk_assessment_id IN (
            SELECT id FROM public.risk_assessments WHERE user_id = user_id_2
        );
        DELETE FROM public.crc_pro_assessments WHERE user_id = user_id_2;
        DELETE FROM public.risk_assessments WHERE user_id = user_id_2;
        DELETE FROM public.calculator_results WHERE patient_id = user_id_2;
        DELETE FROM public.blog_comments WHERE author_id = user_id_2;
        DELETE FROM public.blog_post_likes WHERE user_id = user_id_2;
        DELETE FROM public.ai_chat_messages WHERE session_id IN (
            SELECT id FROM public.ai_chat_sessions WHERE user_id = user_id_2
        );
        DELETE FROM public.post_replies WHERE author_id = user_id_2;
        DELETE FROM public.family_memories WHERE author_id = user_id_2;
        DELETE FROM public.family_hereditary_risks WHERE created_by = user_id_2;
        DELETE FROM public.family_members WHERE created_by = user_id_2;
        DELETE FROM public.group_members WHERE user_id = user_id_2;
        DELETE FROM public.community_posts WHERE author_id = user_id_2;
        DELETE FROM public.consultation_bookings WHERE patient_id = user_id_2;
        DELETE FROM public.ai_analysis_sessions WHERE user_id = user_id_2;
        DELETE FROM public.health_app_integrations WHERE user_id = user_id_2;
        DELETE FROM public.wearable_devices WHERE user_id = user_id_2;
        DELETE FROM public.nutrition_entries WHERE user_id = user_id_2;
        DELETE FROM public.meal_plans WHERE user_id = user_id_2;
        DELETE FROM public.supplement_plans WHERE user_id = user_id_2;
        DELETE FROM public.nutrition_goals WHERE user_id = user_id_2;
        DELETE FROM public.food_preferences WHERE user_id = user_id_2;
        DELETE FROM public.medical_records WHERE user_id = user_id_2;
        DELETE FROM public.doctor_profiles WHERE user_id = user_id_2;
        DELETE FROM public.laboratory_profiles WHERE user_id = user_id_2;
        DELETE FROM public.clinic_profiles WHERE user_id = user_id_2;
        DELETE FROM public.pharmacy_profiles WHERE user_id = user_id_2;
        DELETE FROM public.user_profiles WHERE id = user_id_2;
        DELETE FROM public.onboarding_data WHERE user_id = user_id_2;
        DELETE FROM public.symptom_entries WHERE user_id = user_id_2;
        DELETE FROM public.ai_chat_sessions WHERE user_id = user_id_2;
        DELETE FROM public.user_locations WHERE user_id = user_id_2;
        DELETE FROM public.daily_weather_records WHERE user_id = user_id_2;
        DELETE FROM public.health_device_data WHERE user_id = user_id_2;
        DELETE FROM public.medical_events WHERE user_id = user_id_2;
        DELETE FROM public.user_reminders WHERE user_id = user_id_2;
        DELETE FROM public.screening_plans WHERE user_id = user_id_2;
        DELETE FROM public.medical_appointments WHERE user_id = user_id_2;
        DELETE FROM public.motivational_messages WHERE user_id = user_id_2;
        DELETE FROM public.user_achievements WHERE user_id = user_id_2;
        DELETE FROM public.medication_reminders WHERE user_id = user_id_2;
        DELETE FROM public.telemedicine_sessions WHERE user_id = user_id_2;
        DELETE FROM public.doctor_access_tokens WHERE user_id = user_id_2;
        DELETE FROM public.ai_insights WHERE user_id = user_id_2;
        DELETE FROM public.menopause_analysis WHERE user_id = user_id_2;
        DELETE FROM public.workflow_executions WHERE user_id = user_id_2;
        DELETE FROM public.family_groups WHERE created_by = user_id_2;
        DELETE FROM public.family_shared_plans WHERE owner_user_id = user_id_2;
        DELETE FROM public.daily_health_summary WHERE user_id = user_id_2;
        DELETE FROM public.correlation_analysis WHERE user_id = user_id_2;
        DELETE FROM public.data_relationships WHERE user_id = user_id_2;
        DELETE FROM public.automation_user_settings WHERE user_id = user_id_2;
        DELETE FROM public.automation_workflows WHERE user_id = user_id_2;
        DELETE FROM public.calendar_integrations WHERE user_id = user_id_2;
        DELETE FROM public.data_exports WHERE user_id = user_id_2;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id_2;
        
        RAISE NOTICE 'Deleted user o.s.puchkova@icloud.com with ID: %', user_id_2;
    ELSE
        RAISE NOTICE 'User o.s.puchkova@icloud.com not found';
    END IF;
END $$;