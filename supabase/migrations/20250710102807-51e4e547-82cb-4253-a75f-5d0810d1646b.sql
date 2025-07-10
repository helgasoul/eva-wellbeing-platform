-- Удаляем пользователей helgasoul@yandex.ru и o.s.puchkova@icloud.com
-- Финальная версия с учетом зависимостей

DO $$
DECLARE
    user_id_1 UUID;
    user_id_2 UUID;
BEGIN
    -- Находим ID пользователей
    SELECT id INTO user_id_1 FROM auth.users WHERE email = 'helgasoul@yandex.ru';
    SELECT id INTO user_id_2 FROM auth.users WHERE email = 'o.s.puchkova@icloud.com';
    
    -- Удаляем первого пользователя
    IF user_id_1 IS NOT NULL THEN
        -- Удаляем все связанные данные
        DELETE FROM public.health_recommendations WHERE risk_assessment_id IN (
            SELECT id FROM public.risk_assessments WHERE user_id = user_id_1
        );
        DELETE FROM public.crc_pro_assessments WHERE user_id = user_id_1;
        DELETE FROM public.risk_assessments WHERE user_id = user_id_1;
        DELETE FROM public.user_profiles WHERE id = user_id_1;
        DELETE FROM public.onboarding_data WHERE user_id = user_id_1;
        DELETE FROM public.ai_chat_sessions WHERE user_id = user_id_1;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id_1;
        
        RAISE NOTICE 'Deleted user helgasoul@yandex.ru with ID: %', user_id_1;
    ELSE
        RAISE NOTICE 'User helgasoul@yandex.ru not found';
    END IF;
    
    -- Удаляем второго пользователя
    IF user_id_2 IS NOT NULL THEN
        -- Удаляем все связанные данные
        DELETE FROM public.health_recommendations WHERE risk_assessment_id IN (
            SELECT id FROM public.risk_assessments WHERE user_id = user_id_2
        );
        DELETE FROM public.crc_pro_assessments WHERE user_id = user_id_2;
        DELETE FROM public.risk_assessments WHERE user_id = user_id_2;
        DELETE FROM public.user_profiles WHERE id = user_id_2;
        DELETE FROM public.onboarding_data WHERE user_id = user_id_2;
        DELETE FROM public.ai_chat_sessions WHERE user_id = user_id_2;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id_2;
        
        RAISE NOTICE 'Deleted user o.s.puchkova@icloud.com with ID: %', user_id_2;
    ELSE
        RAISE NOTICE 'User o.s.puchkova@icloud.com not found';
    END IF;
END $$;