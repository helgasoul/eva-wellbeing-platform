import { supabase } from '@/integrations/supabase/client';
import { ExpertBlogPost, BlogComment, ExpertProfile } from '@/types/blog';

export const blogApi = {
  // Получить все опубликованные статьи
  async getPublishedPosts(category?: string, limit = 20): Promise<ExpertBlogPost[]> {
    let query = supabase
      .from('expert_blog_posts')
      .select(`
        *,
        author:profiles!author_id(
          full_name,
          avatar_url,
          expert_specialization,
          expert_credentials
        )
      `)
      .eq('status', 'published')
      .eq('moderation_status', 'approved')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Получить статьи для модерации
  async getPendingPosts(): Promise<ExpertBlogPost[]> {
    const { data, error } = await supabase
      .from('expert_blog_posts')
      .select(`
        *,
        author:profiles!author_id(
          full_name,
          avatar_url,
          expert_specialization,
          expert_credentials
        )
      `)
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Получить статьи пользователя
  async getUserPosts(userId: string, status?: string): Promise<ExpertBlogPost[]> {
    let query = supabase
      .from('expert_blog_posts')
      .select(`
        *,
        author:profiles!author_id(
          full_name,
          avatar_url,
          expert_specialization,
          expert_credentials
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Получить конкретную статью
  async getPost(id: string): Promise<ExpertBlogPost | null> {
    const { data, error } = await supabase
      .from('expert_blog_posts')
      .select(`
        *,
        author:profiles!author_id(
          full_name,
          avatar_url,
          expert_specialization,
          expert_credentials
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Создать или обновить статью
  async savePost(post: Partial<ExpertBlogPost> & { id?: string }): Promise<ExpertBlogPost> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const postData = {
      ...post,
      author_id: user.id,
      updated_at: new Date().toISOString()
    };

    if (post.id) {
      // Обновление существующей статьи
      const { data, error } = await supabase
        .from('expert_blog_posts')
        .update(postData)
        .eq('id', post.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Создание новой статьи
      const { data, error } = await supabase
        .from('expert_blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Модерировать статью
  async moderatePost(postId: string, status: 'approved' | 'rejected', notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const updateData: any = {
      moderation_status: status,
      moderated_by: user.id,
      moderated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      updateData.published_at = new Date().toISOString();
      updateData.status = 'published';
    }

    if (notes) {
      updateData.moderation_notes = notes;
    }

    const { error } = await supabase
      .from('expert_blog_posts')
      .update(updateData)
      .eq('id', postId);

    if (error) throw error;
  },

  // Увеличить счетчик просмотров
  async incrementViews(postId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId
    });

    if (error) console.error('Ошибка обновления просмотров:', error);
  },

  // Получить комментарии к статье
  async getComments(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        author:profiles!author_id(
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Добавить комментарий
  async addComment(postId: string, content: string, parentId?: string): Promise<BlogComment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
        parent_comment_id: parentId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Лайкнуть статью
  async togglePostLike(postId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    // Проверяем есть ли уже лайк
    const { data: existingLike } = await supabase
      .from('blog_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Убираем лайк
      const { error } = await supabase
        .from('blog_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      return false;
    } else {
      // Добавляем лайк
      const { error } = await supabase
        .from('blog_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;
      return true;
    }
  },

  // Получить профили экспертов
  async getExperts(): Promise<ExpertProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_expert', true)
      .eq('expert_status', 'approved')
      .order('blog_followers_count', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Получить профили врачей для назначения экспертами
  async getDoctors(): Promise<ExpertProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_expert', false)
      .not('specialization', 'is', null)
      .order('full_name');

    if (error) throw error;
    return data || [];
  },

  // Назначить эксперта
  async promoteToExpert(userId: string, data: {
    expert_specialization: string;
    expert_bio: string;
    expert_credentials: string;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const { error } = await supabase
      .from('profiles')
      .update({
        is_expert: true,
        expert_status: 'approved',
        expert_specialization: data.expert_specialization,
        expert_bio: data.expert_bio,
        expert_credentials: data.expert_credentials,
        expert_approved_at: new Date().toISOString(),
        expert_approved_by: user.id
      })
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Отозвать статус эксперта
  async revokeExpert(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_expert: false,
        expert_status: 'revoked'
      })
      .eq('user_id', userId);

    if (error) throw error;
  }
};