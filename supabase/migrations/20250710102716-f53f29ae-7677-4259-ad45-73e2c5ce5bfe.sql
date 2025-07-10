-- Удаляем пользователей helgasoul@yandex.ru и o.s.puchkova@icloud.com
-- Простое удаление только существующих данных

DO $$
DECLARE
    user_id_1 UUID;
    user_id_2 UUID;
BEGIN
    -- Находим ID пользователей
    SELECT id INTO user_id_1 FROM auth.users WHERE email = 'helgasoul@yandex.ru';
    SELECT id INTO user_id_2 FROM auth.users WHERE email = 'o.s.puchkova@icloud.com';
    
    -- Удаляем связанные данные для первого пользователя (только существующие таблицы)
    IF user_id_1 IS NOT NULL THEN
        -- Удаляем из основных таблиц
        DELETE FROM public.user_profiles WHERE id = user_id_1;
        DELETE FROM public.onboarding_data WHERE user_id = user_id_1;
        DELETE FROM public.ai_chat_sessions WHERE user_id = user_id_1;
        
        -- Удаляем пользователя из auth.users
        DELETE FROM auth.users WHERE id = user_id_1;
        
        RAISE NOTICE 'Deleted user helgasoul@yandex.ru with ID: %', user_id_1;
    ELSE
        RAISE NOTICE 'User helgasoul@yandex.ru not found';
    END IF;
    
    -- Удаляем связанные данные для второго пользователя (только существующие таблицы)
    IF user_id_2 IS NOT NULL THEN
        -- Удаляем из основных таблиц
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