
-- Создание системы сообщества для Eva платформы

-- Обновляем существующую таблицу community_posts
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS anonymous_name;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS like_count;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS reply_count;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS post_type;
ALTER TABLE public.community_posts DROP COLUMN IF EXISTS group_id;

-- Добавляем необходимые поля для community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sensitivity_level TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS author_age_group TEXT,
ADD COLUMN IF NOT EXISTS author_menopause_phase TEXT;

-- Создаем таблицу комментариев сообщества
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.community_comments(id),
  likes_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу экспертных статей (переименовываем expert_blog_posts)
ALTER TABLE public.expert_blog_posts 
ADD COLUMN IF NOT EXISTS expert_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS credentials TEXT;

-- Создаем таблицу для лайков постов
CREATE TABLE IF NOT EXISTS public.community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Создаем таблицу для лайков комментариев
CREATE TABLE IF NOT EXISTS public.community_comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Создаем таблицу групп поддержки
CREATE TABLE IF NOT EXISTS public.support_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT DEFAULT '👥',
  cover_image TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  member_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создаем таблицу участников групп
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.support_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, moderator, admin
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Включаем RLS для новых таблиц
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS политики для community_comments
CREATE POLICY "Users can view comments" ON public.community_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.community_comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- RLS политики для лайков постов
CREATE POLICY "Users can view post likes" ON public.community_post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own post likes" ON public.community_post_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для лайков комментариев
CREATE POLICY "Users can view comment likes" ON public.community_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own comment likes" ON public.community_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для групп поддержки
CREATE POLICY "Anyone can view public groups" ON public.support_groups
  FOR SELECT USING (is_private = FALSE OR EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = support_groups.id AND user_id = auth.uid() AND is_active = TRUE
  ));

CREATE POLICY "Users can create groups" ON public.support_groups
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.support_groups
  FOR UPDATE USING (auth.uid() = created_by);

-- RLS политики для участников групп
CREATE POLICY "Users can view group members" ON public.group_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid() AND gm.is_active = TRUE)
  );

CREATE POLICY "Users can join groups" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their group membership" ON public.group_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Создаем функции для обновления счетчиков
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры
CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER update_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.community_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

-- Включаем real-time для таблиц
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- Триггеры для updated_at
CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_groups_updated_at
  BEFORE UPDATE ON public.support_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
