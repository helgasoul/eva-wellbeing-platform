-- Проверяем и обновляем таблицу user_profiles для поддержки миграции
-- Добавляем недостающие поля если их нет
DO $$ 
BEGIN
    -- Добавляем поле email если его нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Добавляем поле role если его нет (это будет текстовое поле для совместимости)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'patient';
    END IF;
END $$;

-- Обновляем таблицу onboarding_data для поддержки миграции
-- Делаем step_number необязательным для совместимости
ALTER TABLE public.onboarding_data ALTER COLUMN step_number DROP NOT NULL;
ALTER TABLE public.onboarding_data ALTER COLUMN step_number SET DEFAULT 1;

-- Обновляем функцию handle_new_user для корректной работы с новыми полями
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, user_role, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'patient')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    user_role = COALESCE(EXCLUDED.user_role, user_profiles.user_role),
    role = COALESCE(EXCLUDED.role, user_profiles.role),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Проверяем что триггер существует, если нет - создаем
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Проверяем политики RLS и добавляем недостающие
DO $$
BEGIN
    -- Политика для просмотра собственного профиля
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.user_profiles
            FOR SELECT USING (auth.uid() = id);
    END IF;
    
    -- Политика для обновления собственного профиля  
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.user_profiles
            FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    -- Политика для создания собственного профиля
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.user_profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    -- Политики для onboarding_data
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'onboarding_data' AND policyname = 'Users can view own onboarding'
    ) THEN
        CREATE POLICY "Users can view own onboarding" ON public.onboarding_data
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'onboarding_data' AND policyname = 'Users can insert own onboarding'
    ) THEN
        CREATE POLICY "Users can insert own onboarding" ON public.onboarding_data
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;