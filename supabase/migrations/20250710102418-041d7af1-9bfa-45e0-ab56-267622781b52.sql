-- Удаляем пользователей helgasoul@yandex.ru и o.s.puchkova@icloud.com
-- Сначала удаляем связанные данные из публичных таблиц (только существующие таблицы)

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