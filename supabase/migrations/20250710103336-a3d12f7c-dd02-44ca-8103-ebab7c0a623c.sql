-- 1. СОЗДАЕМ ПРОФИЛИ ДЛЯ СУЩЕСТВУЮЩИХ ПОЛЬЗОВАТЕЛЕЙ
INSERT INTO public.user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  role,
  onboarding_completed,
  created_at,
  updated_at
) VALUES 
  (
    'e629a565-65dd-4ba4-9b62-9d9769c7d3e9'::uuid,
    'helgasoul@yandex.ru',
    'Ольга',
    '',
    'patient',
    false,
    NOW(),
    NOW()
  ),
  (
    'fbe582fe-8f00-47d9-9d9c-eb52908aa04b'::uuid,
    'o.s.puchkova@icloud.com',
    'Ольга',
    'Пучкова',
    'patient',
    false,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();

-- 2. ПРОВЕРЯЕМ ЧТО ПРОФИЛИ СОЗДАНЫ
SELECT 
  up.id,
  up.email,
  up.first_name,
  up.last_name,
  up.role,
  up.onboarding_completed,
  au.email as auth_email,
  au.created_at as auth_created
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;

-- 3. ПРОВЕРЯЕМ СООТВЕТСТВИЕ КОЛИЧЕСТВА ЗАПИСЕЙ
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM user_profiles) as profiles_count,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM user_profiles)) as missing_profiles;