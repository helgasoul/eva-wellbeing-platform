-- 1. УДАЛЯЕМ СТАРЫЕ ТРИГГЕР И ФУНКЦИЮ (если есть)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. СОЗДАЕМ ИСПРАВЛЕННУЮ ФУНКЦИЮ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. СОЗДАЕМ НОВЫЙ ТРИГГЕР
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ПРОВЕРЯЕМ ЧТО ТРИГГЕР СОЗДАЛСЯ
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement, 
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. ПРОВЕРЯЕМ ЧТО ФУНКЦИЯ СОЗДАЛАСЬ
SELECT 
    routine_name, 
    routine_type, 
    specific_name
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';