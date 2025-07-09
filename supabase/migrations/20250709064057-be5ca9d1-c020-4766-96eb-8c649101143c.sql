
-- Расширяем роли пользователей
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('patient', 'doctor', 'expert', 'admin');
  ELSE
    -- Добавляем expert роль если её ещё нет
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'expert';
  END IF;
END $$;

-- Создаем таблицу профилей пользователей (если не существует)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  specialization TEXT,
  credentials TEXT,
  bio TEXT,
  
  -- Поля для экспертов
  is_expert BOOLEAN DEFAULT false,
  expert_status TEXT CHECK (expert_status IN ('pending', 'approved', 'revoked')) DEFAULT NULL,
  expert_specialization TEXT,
  expert_bio TEXT,
  expert_credentials TEXT,
  expert_approved_at TIMESTAMP WITH TIME ZONE,
  expert_approved_by UUID,
  
  -- Статистика блога
  blog_posts_count INTEGER DEFAULT 0,
  blog_followers_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу ролей пользователей
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Создаем таблицу статей блога
CREATE TABLE IF NOT EXISTS public.expert_blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  
  -- Медиа контент
  featured_image TEXT,
  gallery_images TEXT[],
  
  -- Метаданные
  category TEXT NOT NULL CHECK (category IN ('menopause', 'cardiovascular', 'bone_health', 'mental_health', 'nutrition', 'lifestyle', 'research')),
  tags TEXT[],
  
  -- Статус публикации
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_review', 'published', 'archived')) DEFAULT 'draft',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'members_only', 'premium')) DEFAULT 'public',
  
  -- Временные метки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Статистика
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- SEO и социальные сети
  meta_description TEXT,
  og_image TEXT,
  
  -- Модерация
  moderation_status TEXT NOT NULL CHECK (moderation_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderation_notes TEXT,
  moderated_by UUID,
  moderated_at TIMESTAMP WITH TIME ZONE
);

-- Создаем таблицу комментариев к статьям
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.expert_blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  likes_count INTEGER DEFAULT 0,
  is_expert_reply BOOLEAN DEFAULT false
);

-- Создаем таблицу лайков статей
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.expert_blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Создаем таблицу лайков комментариев
CREATE TABLE IF NOT EXISTS public.blog_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Создаем таблицу подписчиков экспертов
CREATE TABLE IF NOT EXISTS public.expert_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(expert_id, follower_id)
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_followers ENABLE ROW LEVEL SECURITY;

-- Создаем функцию для проверки ролей (если не существует)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- RLS политики для профилей
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS политики для ролей пользователей
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS политики для статей блога
CREATE POLICY "Anyone can view published blog posts" ON public.expert_blog_posts
  FOR SELECT USING (status = 'published' AND moderation_status = 'approved');

CREATE POLICY "Authors can manage their own posts" ON public.expert_blog_posts
  FOR ALL USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" ON public.expert_blog_posts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can moderate posts" ON public.expert_blog_posts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS политики для комментариев
CREATE POLICY "Anyone can view comments for published posts" ON public.blog_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.expert_blog_posts 
      WHERE id = post_id 
        AND status = 'published' 
        AND moderation_status = 'approved'
    )
  );

CREATE POLICY "Authenticated users can create comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = author_id);

-- RLS политики для лайков статей
CREATE POLICY "Anyone can view post likes" ON public.blog_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own post likes" ON public.blog_post_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для лайков комментариев
CREATE POLICY "Anyone can view comment likes" ON public.blog_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their own comment likes" ON public.blog_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для подписчиков
CREATE POLICY "Anyone can view expert followers" ON public.expert_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON public.expert_followers
  FOR ALL USING (auth.uid() = follower_id);

-- Создаем триггеры для обновления счетчиков
CREATE OR REPLACE FUNCTION update_blog_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.expert_blog_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.expert_blog_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_blog_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.expert_blog_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.expert_blog_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_expert_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET blog_followers_count = blog_followers_count + 1 
    WHERE user_id = NEW.expert_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET blog_followers_count = blog_followers_count - 1 
    WHERE user_id = OLD.expert_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры
DROP TRIGGER IF EXISTS blog_post_likes_count_trigger ON public.blog_post_likes;
CREATE TRIGGER blog_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.blog_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_blog_post_likes_count();

DROP TRIGGER IF EXISTS blog_comments_count_trigger ON public.blog_comments;
CREATE TRIGGER blog_comments_count_trigger
  AFTER INSERT OR DELETE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_blog_post_comments_count();

DROP TRIGGER IF EXISTS expert_followers_count_trigger ON public.expert_followers;
CREATE TRIGGER expert_followers_count_trigger
  AFTER INSERT OR DELETE ON public.expert_followers
  FOR EACH ROW EXECUTE FUNCTION update_expert_followers_count();

-- Создаем триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.expert_blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.expert_blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Создаем функцию для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Создаем триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_expert_blog_posts_author_id ON public.expert_blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_expert_blog_posts_status ON public.expert_blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_expert_blog_posts_moderation_status ON public.expert_blog_posts(moderation_status);
CREATE INDEX IF NOT EXISTS idx_expert_blog_posts_category ON public.expert_blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_expert_blog_posts_published_at ON public.expert_blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_author_id ON public.blog_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_expert ON public.profiles(is_expert);
