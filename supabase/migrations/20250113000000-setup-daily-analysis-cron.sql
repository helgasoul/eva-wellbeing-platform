-- Настройка автоматического ежедневного анализа корреляций цикла
-- Запускается каждое утро в 6:00 UTC

-- Включаем расширения для cron и http запросов
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Создаем функцию для запуска ежедневного анализа для всех активных пользователей
CREATE OR REPLACE FUNCTION trigger_daily_health_analysis()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    response_data jsonb;
BEGIN
    -- Логируем начало процесса
    RAISE NOTICE 'Starting daily health analysis for all users at %', NOW();
    
    -- Получаем всех активных пользователей, которые входили в последние 30 дней
    FOR user_record IN 
        SELECT DISTINCT u.id, u.email, u.last_sign_in_at
        FROM auth.users u
        WHERE u.last_sign_in_at > NOW() - INTERVAL '30 days'
        AND u.email_confirmed_at IS NOT NULL
        ORDER BY u.last_sign_in_at DESC
    LOOP
        BEGIN
            -- Проверяем, был ли уже выполнен анализ сегодня для этого пользователя
            IF NOT EXISTS (
                SELECT 1 FROM public.ai_analysis_sessions 
                WHERE user_id = user_record.id 
                AND session_type = 'daily_health_analysis'
                AND analysis_date = CURRENT_DATE
            ) THEN
                -- Вызываем edge функцию для анализа
                SELECT net.http_post(
                    url := 'https://wbydubxjcdhoinhrozwx.supabase.co/functions/v1/daily-health-analysis',
                    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
                    body := jsonb_build_object(
                        'userId', user_record.id,
                        'analysisDate', CURRENT_DATE::text
                    )
                ) INTO response_data;
                
                RAISE NOTICE 'Triggered daily analysis for user: % (last sign in: %)', user_record.email, user_record.last_sign_in_at;
            ELSE
                RAISE NOTICE 'Daily analysis already completed for user: %', user_record.email;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Логируем ошибки, но продолжаем для других пользователей
            RAISE WARNING 'Error processing daily analysis for user %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Completed daily health analysis trigger at %', NOW();
END;
$$;

-- Создаем cron задачу для запуска каждое утро в 6:00 UTC
SELECT cron.schedule(
    'daily-health-analysis-trigger',
    '0 6 * * *', -- Каждый день в 6:00 UTC
    'SELECT trigger_daily_health_analysis();'
);

-- Создаем функцию для ручного запуска (для тестирования)
CREATE OR REPLACE FUNCTION manual_trigger_daily_analysis()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM trigger_daily_health_analysis();
    RETURN 'Daily health analysis triggered manually at ' || NOW()::text;
END;
$$;

-- Создаем таблицу для логирования автоматических задач
CREATE TABLE IF NOT EXISTS public.automated_task_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_name text NOT NULL,
    task_type text NOT NULL, -- 'daily_analysis', 'weekly_summary', etc.
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    status text DEFAULT 'running', -- 'running', 'completed', 'failed'
    users_processed integer DEFAULT 0,
    errors_count integer DEFAULT 0,
    execution_details jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now()
);

-- Включаем RLS для таблицы логов
ALTER TABLE public.automated_task_logs ENABLE ROW LEVEL SECURITY;

-- Политика доступа: только админы могут видеть логи
CREATE POLICY "Admins can view automated task logs" ON public.automated_task_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Функция для логирования выполнения задач
CREATE OR REPLACE FUNCTION log_automated_task(
    p_task_name text,
    p_task_type text,
    p_users_processed integer DEFAULT 0,
    p_errors_count integer DEFAULT 0,
    p_execution_details jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO public.automated_task_logs (
        task_name,
        task_type,
        users_processed,
        errors_count,
        execution_details,
        status,
        completed_at
    ) VALUES (
        p_task_name,
        p_task_type,
        p_users_processed,
        p_errors_count,
        p_execution_details,
        CASE WHEN p_errors_count > 0 THEN 'failed' ELSE 'completed' END,
        now()
    )
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Комментарии для документации
COMMENT ON FUNCTION trigger_daily_health_analysis() IS 'Автоматически запускает ежедневный анализ здоровья для всех активных пользователей';
COMMENT ON FUNCTION manual_trigger_daily_analysis() IS 'Ручной запуск ежедневного анализа для тестирования';
COMMENT ON TABLE public.automated_task_logs IS 'Логи выполнения автоматических задач системы';

-- Завершение
RAISE NOTICE 'Daily health analysis cron job has been set up successfully. It will run every day at 6:00 UTC.';