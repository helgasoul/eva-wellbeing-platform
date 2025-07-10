-- Создаем RPC функцию для получения информации о пользователях auth
-- Это поможет в диагностике проблем с аутентификацией
CREATE OR REPLACE FUNCTION public.get_auth_users_info()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.users.id,
    auth.users.email,
    auth.users.created_at,
    auth.users.email_confirmed_at,
    auth.users.last_sign_in_at
  FROM auth.users
  ORDER BY auth.users.created_at DESC
  LIMIT 20;
END;
$$;

-- Создаем функцию для проверки существования пользователя по email
CREATE OR REPLACE FUNCTION public.check_user_exists(user_email TEXT)
RETURNS TABLE (
  exists BOOLEAN,
  user_id UUID,
  email_confirmed BOOLEAN,
  last_sign_in TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN auth.users.id IS NOT NULL THEN TRUE ELSE FALSE END as exists,
    auth.users.id as user_id,
    CASE WHEN auth.users.email_confirmed_at IS NOT NULL THEN TRUE ELSE FALSE END as email_confirmed,
    auth.users.last_sign_in_at as last_sign_in
  FROM auth.users
  WHERE auth.users.email = user_email
  LIMIT 1;
END;
$$;