-- Убедимся что таблица expert_blog_posts существует (она уже есть в предыдущей миграции)
-- Но добавим недостающие функции и исправления

-- Функция для увеличения просмотров
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.expert_blog_posts 
    SET views_count = views_count + 1 
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для корректного обновления счетчика лайков (исправление для работы с blog_post_likes)
CREATE OR REPLACE FUNCTION public.update_blog_post_likes_count()
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

-- Функция для корректного обновления счетчика комментариев (исправление для работы с blog_comments)
CREATE OR REPLACE FUNCTION public.update_blog_post_comments_count()
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