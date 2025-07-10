-- Создание системы аналитики и мониторинга

-- Пользовательская аналитика
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Системная аналитика
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value DECIMAL,
  metric_data JSONB DEFAULT '{}'::jsonb,
  metric_category TEXT DEFAULT 'general',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Алерты системы
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  title TEXT NOT NULL,
  description TEXT,
  alert_data JSONB DEFAULT '{}'::jsonb,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Производительность базы данных
CREATE TABLE IF NOT EXISTS public.db_performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_type TEXT NOT NULL,
  table_name TEXT,
  execution_time_ms INTEGER NOT NULL,
  rows_affected INTEGER,
  query_hash TEXT,
  error_message TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_session_id ON public.user_analytics(session_id);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON public.system_metrics(metric_category);

CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON public.system_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON public.system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON public.system_alerts(is_resolved);

CREATE INDEX IF NOT EXISTS idx_db_performance_logs_query_type ON public.db_performance_logs(query_type);
CREATE INDEX IF NOT EXISTS idx_db_performance_logs_execution_time ON public.db_performance_logs(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_db_performance_logs_created_at ON public.db_performance_logs(created_at);

-- Включение RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_performance_logs ENABLE ROW LEVEL SECURITY;

-- RLS политики для user_analytics
CREATE POLICY "Users can insert their own analytics" ON public.user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.user_analytics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS политики для system_metrics
CREATE POLICY "Admins can manage system metrics" ON public.system_metrics
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS политики для system_alerts
CREATE POLICY "Admins can manage system alerts" ON public.system_alerts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS политики для db_performance_logs
CREATE POLICY "Admins can view performance logs" ON public.db_performance_logs
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own performance logs" ON public.db_performance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Триггеры для обновления updated_at
CREATE TRIGGER update_system_alerts_updated_at
    BEFORE UPDATE ON public.system_alerts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Функция для автоматического создания алертов
CREATE OR REPLACE FUNCTION public.create_performance_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Создаем алерт если запрос выполнялся более 5 секунд
  IF NEW.execution_time_ms > 5000 THEN
    INSERT INTO public.system_alerts (
      alert_type,
      severity,
      title,
      description,
      alert_data
    ) VALUES (
      'slow_query',
      CASE 
        WHEN NEW.execution_time_ms > 10000 THEN 'high'
        WHEN NEW.execution_time_ms > 7500 THEN 'medium'
        ELSE 'low'
      END,
      'Медленный запрос обнаружен',
      format('Запрос типа %s выполнялся %s мс', NEW.query_type, NEW.execution_time_ms),
      jsonb_build_object(
        'execution_time_ms', NEW.execution_time_ms,
        'query_type', NEW.query_type,
        'table_name', NEW.table_name,
        'query_hash', NEW.query_hash
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для создания алертов
CREATE TRIGGER create_performance_alert_trigger
    AFTER INSERT ON public.db_performance_logs
    FOR EACH ROW EXECUTE FUNCTION public.create_performance_alert();