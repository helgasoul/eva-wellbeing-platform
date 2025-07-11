-- Создаем таблицу для аудита миграций
CREATE TABLE IF NOT EXISTS public.migration_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT NOT NULL,
  legacy_user_id TEXT,
  migration_type TEXT NOT NULL DEFAULT 'jit_migration',
  migration_status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  migration_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.migration_audit_log ENABLE ROW LEVEL SECURITY;

-- Только администраторы могут просматривать лог миграций
CREATE POLICY "Admins can view migration audit log" 
ON public.migration_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Система может записывать в лог миграций
CREATE POLICY "System can insert migration audit log" 
ON public.migration_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_migration_audit_email ON public.migration_audit_log(email);
CREATE INDEX IF NOT EXISTS idx_migration_audit_status ON public.migration_audit_log(migration_status);
CREATE INDEX IF NOT EXISTS idx_migration_audit_timestamp ON public.migration_audit_log(migration_timestamp);

-- Обновляем Edge Function для логирования в новую таблицу
COMMENT ON TABLE public.migration_audit_log IS 'Аудит лог JIT миграций пользователей из legacy системы';