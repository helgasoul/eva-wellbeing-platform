-- Создание таблицы expert_blog_posts
CREATE TABLE public.expert_blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_avatar TEXT,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    featured_image TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    reading_time INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    meta_description TEXT,
    meta_keywords TEXT[],
    status TEXT DEFAULT 'draft',
    visibility TEXT DEFAULT 'public',
    moderation_status TEXT DEFAULT 'pending',
    moderation_notes TEXT,
    moderated_by UUID,
    moderated_at TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для производительности
CREATE INDEX idx_expert_blog_posts_category ON public.expert_blog_posts(category);
CREATE INDEX idx_expert_blog_posts_published ON public.expert_blog_posts(is_published);
CREATE INDEX idx_expert_blog_posts_featured ON public.expert_blog_posts(is_featured);
CREATE INDEX idx_expert_blog_posts_author ON public.expert_blog_posts(author_id);
CREATE INDEX idx_expert_blog_posts_created_at ON public.expert_blog_posts(created_at);

-- RLS (Row Level Security) политики
ALTER TABLE public.expert_blog_posts ENABLE ROW LEVEL SECURITY;

-- Политика для чтения опубликованных постов
CREATE POLICY "Allow reading published posts" ON public.expert_blog_posts
    FOR SELECT USING (is_published = true);

-- Политика для создания постов (только для экспертов)
CREATE POLICY "Allow experts to create posts" ON public.expert_blog_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'expert'
        )
    );

-- Политика для редактирования своих постов
CREATE POLICY "Allow authors to update their posts" ON public.expert_blog_posts
    FOR UPDATE USING (author_id = auth.uid());

-- Политика для удаления своих постов
CREATE POLICY "Allow authors to delete their posts" ON public.expert_blog_posts
    FOR DELETE USING (author_id = auth.uid());

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_expert_blog_posts_updated_at
    BEFORE UPDATE ON public.expert_blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Создание таблицы для лайков постов
CREATE TABLE public.blog_post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.expert_blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- RLS для лайков
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own likes" ON public.blog_post_likes
    FOR ALL USING (auth.uid() = user_id);

-- Создание таблицы для комментариев
CREATE TABLE public.blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.expert_blog_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    author_role TEXT,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    is_expert_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS для комментариев
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.blog_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.blog_comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.blog_comments
    FOR UPDATE USING (auth.uid() = author_id);

-- Триггеры для обновления счетчиков
CREATE TRIGGER update_blog_post_likes_count_trigger
    AFTER INSERT OR DELETE ON public.blog_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_post_likes_count();

CREATE TRIGGER update_blog_post_comments_count_trigger
    AFTER INSERT OR DELETE ON public.blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_blog_post_comments_count();

-- Вставка тестовых данных
INSERT INTO public.expert_blog_posts (
    title, content, excerpt, author_id, author_name, author_title, 
    category, tags, is_featured, is_published, reading_time, 
    views_count, likes_count, published_at
) VALUES 
(
    'Как справиться с приливами: 10 проверенных способов',
    'Приливы — один из самых частых и неприятных симптомов менопаузы. В этой статье мы рассмотрим 10 эффективных способов справиться с этим симптомом.',
    'Эффективные методы борьбы с приливами от ведущих специалистов',
    auth.uid(),
    'Др. Анна Петрова',
    'Гинеколог-эндокринолог',
    'menopause',
    ARRAY['приливы', 'симптомы', 'лечение'],
    true,
    true,
    8,
    1250,
    89,
    NOW()
),
(
    'ЗГТ: мифы и реальность',
    'Заместительная гормональная терапия окружена множеством мифов. Разбираем основные заблуждения с позиций доказательной медицины.',
    'Разбираем основные мифы о ЗГТ с позиций доказательной медицины',
    auth.uid(),
    'Др. Мария Сидорова',
    'Эндокринолог',
    'cardiovascular',
    ARRAY['ЗГТ', 'гормоны', 'мифы'],
    false,
    true,
    12,
    890,
    67,
    NOW()
),
(
    'Питание в менопаузе: что нужно знать',
    'Правильное питание играет ключевую роль в поддержании здоровья в период менопаузы. Узнайте, как адаптировать свой рацион.',
    'Как адаптировать рацион к потребностям организма в менопаузе',
    auth.uid(),
    'Др. Елена Козлова',
    'Диетолог-эндокринолог',
    'nutrition',
    ARRAY['питание', 'диета', 'здоровье'],
    false,
    true,
    10,
    654,
    45,
    NOW()
);