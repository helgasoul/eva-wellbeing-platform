import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_age_group: '35-40' | '40-45' | '45-50' | '50-55' | '55-60' | '60+';
  author_menopause_phase: 'premenopause' | 'perimenopause' | 'menopause' | 'postmenopause';
  title: string;
  content: string;
  category: 'general' | 'symptoms' | 'treatment' | 'lifestyle' | 'success_stories' | 'questions' | 'support';
  tags: string[];
  is_anonymous: boolean;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_verified: boolean;
  sensitivity_level: 'public' | 'sensitive' | 'private';
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: 'phase' | 'age' | 'symptoms' | 'treatment' | 'location' | 'interests';
  member_count: number;
  post_count: number;
  is_private: boolean;
  moderators: string[];
  tags: string[];
  icon: string;
  cover_image?: string;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  likes_count: number;
  is_anonymous: boolean;
  is_verified: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: CommunityPost['category'];
  tags?: string[];
  is_anonymous?: boolean;
  sensitivity_level?: 'public' | 'sensitive' | 'private';
  author_age_group?: CommunityPost['author_age_group'];
  author_menopause_phase?: CommunityPost['author_menopause_phase'];
}

export interface PostFilters {
  category?: string;
  tag?: string;
  author_id?: string;
  sensitivity_level?: string;
  limit?: number;
  offset?: number;
}

export interface ExpertArticleData {
  title: string;
  content: string;
  category: string;
  excerpt?: string;
  tags?: string[];
  featured_image?: string;
}

export interface ExpertArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author_name: string;
  author_title?: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  featured_image?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  published_at?: string;
}

class CommunityService {
  private realtimeChannels: Map<string, RealtimeChannel> = new Map();

  // === ПОСТЫ ===
  async createPost(post: CreatePostData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Получаем профиль пользователя для имени
    let authorName = 'Пользователь';
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      authorName = post.is_anonymous 
        ? 'Анонимно' 
        : `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Пользователь';
    } catch (error) {
      console.warn('Could not load user profile:', error);
    }

    // Используем существующую таблицу community_posts с обходом типов
    const insertData = {
      author_id: user.id,
      content: post.content,
      anonymous_name: authorName,
      is_anonymous: post.is_anonymous || false,
      tags: post.tags || [],
      group_id: 'general' // Временное решение
    };

    const { data, error } = await supabase
      .from('community_posts')
      .insert(insertData as any)
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  async getPosts(filters: PostFilters = {}): Promise<CommunityPost[]> {
    try {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      // Преобразуем данные в нужный формат
      return await this.enrichPostsWithProfiles(data || []);
    } catch (error) {
      console.error('Error loading posts from Supabase:', error);
      // Fallback к демо-данным
      return getDefaultPosts();
    }
  }

  async getUserPosts(userId: string): Promise<CommunityPost[]> {
    return this.getPosts({ author_id: userId });
  }

  async likePost(postId: string): Promise<void> {
    // Пока используем локальную симуляцию
    console.log('Liking post:', postId);
  }

  async unlikePost(postId: string): Promise<void> {
    // Пока используем локальную симуляцию
    console.log('Unliking post:', postId);
  }

  async isPostLiked(postId: string): Promise<boolean> {
    // Пока возвращаем случайное значение
    return Math.random() > 0.5;
  }

  // === КОММЕНТАРИИ ===
  async addComment(postId: string, content: string, parentCommentId?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Используем существующую таблицу post_replies с обходом типов
    const insertData = {
      post_id: postId,
      author_id: user.id,
      content,
      anonymous_name: 'Пользователь'
    };

    const { error } = await supabase
      .from('post_replies')
      .insert(insertData as any);

    if (error) throw new Error(error.message);
  }

  async getComments(postId: string): Promise<CommunityComment[]> {
    try {
      const { data, error } = await supabase
        .from('post_replies')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);

      // Преобразуем данные в нужный формат
      return await this.enrichCommentsWithProfiles(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback к демо-комментариям
      return getDemoComments(postId);
    }
  }

  // === ЭКСПЕРТНЫЕ СТАТЬИ ===
  async createArticle(article: ExpertArticleData): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Получаем профиль пользователя для имени
    let authorName = 'Эксперт';
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      authorName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Эксперт';
    } catch (error) {
      console.warn('Could not load user profile:', error);
    }

    const { data, error } = await supabase
      .from('expert_blog_posts')
      .insert({
        author_id: user.id,
        author_name: authorName,
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        tags: article.tags || [],
        featured_image: article.featured_image,
        status: 'pending',
        moderation_status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  }

  async getPublishedArticles(): Promise<ExpertArticle[]> {
    const { data, error } = await supabase
      .from('expert_blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async moderateArticle(articleId: string, status: 'approved' | 'rejected', notes?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const updateData: any = {
      moderation_status: status,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
      moderation_notes: notes
    };

    if (status === 'approved') {
      updateData.status = 'published';
      updateData.is_published = true;
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('expert_blog_posts')
      .update(updateData)
      .eq('id', articleId);

    if (error) throw new Error(error.message);
  }

  // === ГРУППЫ ===
  async getGroups(): Promise<CommunityGroup[]> {
    return getDefaultGroups();
  }

  async getRecommendedGroups(): Promise<CommunityGroup[]> {
    const allGroups = await this.getGroups();
    return getRecommendedGroups(allGroups);
  }

  // === REAL-TIME ПОДПИСКИ ===
  subscribeToNewPosts(callback: (post: CommunityPost) => void): () => void {
    const channel = supabase
      .channel('community_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts'
        },
        async (payload) => {
          try {
            const enrichedPosts = await this.enrichPostsWithProfiles([payload.new as any]);
            if (enrichedPosts.length > 0) {
              callback(enrichedPosts[0]);
            }
          } catch (error) {
            console.error('Error handling real-time post:', error);
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set('posts', channel);

    return () => {
      channel.unsubscribe();
      this.realtimeChannels.delete('posts');
    };
  }

  subscribeToPostComments(postId: string, callback: (comment: CommunityComment) => void): () => void {
    const channel = supabase
      .channel(`post_${postId}_comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_replies',
          filter: `post_id=eq.${postId}`
        },
        async (payload) => {
          try {
            const enrichedComments = await this.enrichCommentsWithProfiles([payload.new as any]);
            if (enrichedComments.length > 0) {
              callback(enrichedComments[0]);
            }
          } catch (error) {
            console.error('Error handling real-time comment:', error);
          }
        }
      )
      .subscribe();

    this.realtimeChannels.set(`comments_${postId}`, channel);

    return () => {
      channel.unsubscribe();
      this.realtimeChannels.delete(`comments_${postId}`);
    };
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
  private async enrichPostsWithProfiles(posts: any[]): Promise<CommunityPost[]> {
    if (!posts.length) return [];

    const authorIds = [...new Set(posts.map(p => p.author_id))];
    let profileMap = new Map();

    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', authorIds);

      profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    } catch (error) {
      console.warn('Could not load user profiles:', error);
    }

    return posts.map(post => {
      const profile = profileMap.get(post.author_id);
      return {
        id: post.id,
        author_id: post.author_id,
        author_name: post.is_anonymous 
          ? 'Анонимно' 
          : post.anonymous_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Пользователь',
        author_avatar: post.is_anonymous ? undefined : profile?.avatar_url,
        author_age_group: '45-50',
        author_menopause_phase: 'perimenopause',
        title: post.title || 'Пост сообщества',
        content: post.content,
        category: 'general',
        tags: post.tags || [],
        is_anonymous: post.is_anonymous || false,
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes_count: post.like_count || 0,
        comments_count: post.reply_count || 0,
        is_pinned: false,
        is_verified: false,
        sensitivity_level: 'public'
      } as CommunityPost;
    });
  }

  private async enrichCommentsWithProfiles(comments: any[]): Promise<CommunityComment[]> {
    if (!comments.length) return [];

    const authorIds = [...new Set(comments.map(c => c.author_id))];
    let profileMap = new Map();

    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', authorIds);

      profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    } catch (error) {
      console.warn('Could not load user profiles:', error);
    }

    return comments.map(comment => {
      const profile = profileMap.get(comment.author_id);
      return {
        id: comment.id,
        post_id: comment.post_id,
        author_id: comment.author_id,
        author_name: comment.is_anonymous 
          ? 'Анонимно' 
          : comment.anonymous_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Пользователь',
        author_avatar: comment.is_anonymous ? undefined : profile?.avatar_url,
        content: comment.content,
        parent_comment_id: undefined,
        created_at: comment.created_at,
        likes_count: comment.like_count || 0,
        is_anonymous: comment.is_anonymous || false,
        is_verified: false
      } as CommunityComment;
    });
  }

  cleanup(): void {
    this.realtimeChannels.forEach(channel => channel.unsubscribe());
    this.realtimeChannels.clear();
  }
}

// Экспортируем singleton
export const communityService = new CommunityService();

// === СОВМЕСТИМОСТЬ С СУЩЕСТВУЮЩИМ КОДОМ ===
export const getCommunityContent = async (
  tab: string,
  category: string
): Promise<{ posts: CommunityPost[]; groups: CommunityGroup[] }> => {
  try {
    const posts = await communityService.getPosts({ category: category === 'all' ? undefined : category });
    const groups = await communityService.getGroups();
    return { posts, groups };
  } catch (error) {
    console.error('Error loading community content:', error);
    // Fallback к демо-данным в случае ошибки
    return { posts: getDefaultPosts(), groups: getDefaultGroups() };
  }
};

export const getPostComments = async (postId: string): Promise<CommunityComment[]> => {
  try {
    return await communityService.getComments(postId);
  } catch (error) {
    console.error('Error loading comments:', error);
    // Fallback к демо-комментариям
    return getDemoComments(postId);
  }
};

const getDemoComments = (postId: string): CommunityComment[] => [
  {
    id: '1',
    post_id: postId,
    author_id: 'user1',
    author_name: 'Мария',
    content: 'Спасибо за такой честный пост! У меня похожий опыт.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes_count: 5,
    is_anonymous: false,
    is_verified: false
  },
  {
    id: '2',
    post_id: postId,
    author_id: 'user2',
    author_name: 'Анонимно',
    content: 'Очень поддерживающее сообщество, чувствую себя понятой.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes_count: 3,
    is_anonymous: true,
    is_verified: false
  }
];

export const getDefaultGroups = (): CommunityGroup[] => [
  {
    id: 'perimenopause_support',
    name: 'Поддержка в перименопаузе',
    description: 'Группа для женщин, которые только начинают путь менопаузы. Делимся опытом первых симптомов и способов адаптации.',
    category: 'phase',
    member_count: 1247,
    post_count: 89,
    is_private: false,
    moderators: ['mod1', 'mod2'],
    tags: ['перименопауза', 'поддержка', 'симптомы'],
    icon: '🌸',
    created_at: new Date().toISOString()
  },
  {
    id: 'natural_menopause',
    name: 'Естественная менопауза',
    description: 'Обсуждаем натуральные способы борьбы с симптомами: травы, питание, образ жизни без гормональной терапии.',
    category: 'treatment',
    member_count: 892,
    post_count: 156,
    is_private: false,
    moderators: ['mod3'],
    tags: ['натуральные методы', 'травы', 'питание'],
    icon: '🌿',
    created_at: new Date().toISOString()
  },
  {
    id: 'moscow_women',
    name: 'Женщины Москвы 45+',
    description: 'Встречи и поддержка для женщин в Москве. Организуем офлайн-встречи, прогулки, совместные активности.',
    category: 'location',
    member_count: 324,
    post_count: 67,
    is_private: false,
    moderators: ['mod4'],
    tags: ['москва', 'встречи', 'поддержка'],
    icon: '🏙️',
    created_at: new Date().toISOString()
  },
  {
    id: 'hrt_experience',
    name: 'Опыт ЗГТ',
    description: 'Закрытая группа для обмена опытом приема заместительной гормональной терапии. Только честные отзывы от реальных женщин.',
    category: 'treatment',
    member_count: 567,
    post_count: 234,
    is_private: true,
    moderators: ['doc1', 'mod5'],
    tags: ['ЗГТ', 'гормоны', 'опыт'],
    icon: '💊',
    created_at: new Date().toISOString()
  },
  {
    id: 'fitness_45plus',
    name: 'Фитнес после 45',
    description: 'Спорт и физическая активность в период менопаузы. Делимся тренировками, которые подходят нашему возрасту.',
    category: 'interests',
    member_count: 445,
    post_count: 123,
    is_private: false,
    moderators: ['trainer1'],
    tags: ['фитнес', 'спорт', 'здоровье'],
    icon: '💪',
    created_at: new Date().toISOString()
  },
  {
    id: 'sleep_support',
    name: 'Борьба с бессонницей',
    description: 'Группа поддержки для тех, кто страдает от нарушений сна в период менопаузы. Делимся способами улучшения сна.',
    category: 'symptoms',
    member_count: 678,
    post_count: 89,
    is_private: false,
    moderators: ['sleep_expert'],
    tags: ['сон', 'бессонница', 'отдых'],
    icon: '😴',
    created_at: new Date().toISOString()
  }
];

export const getDefaultPosts = (): CommunityPost[] => [
  {
    id: '1',
    author_id: 'user1',
    author_name: 'Елена',
    author_age_group: '45-50',
    author_menopause_phase: 'perimenopause',
    title: 'Мой первый год перименопаузы - что я узнала',
    content: 'Привет, девочки! Хочу поделиться своим опытом первого года перименопаузы. Начну с того, что первые симптомы я заметила около года назад - стали нерегулярными месячные, появились приливы по ночам и резкие перепады настроения. Сначала я списывала все на стресс на работе, но когда симптомы усилились, поняла, что это начало нового этапа. Самое главное, что я поняла - не нужно молчать и терпеть. Обращение к гинекологу-эндокринологу помогло мне разобраться в происходящем и подобрать подходящую поддержку.',
    category: 'success_stories',
    tags: ['перименопауза', 'первый опыт', 'симптомы'],
    is_anonymous: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 24,
    comments_count: 8,
    is_pinned: true,
    is_verified: true,
    sensitivity_level: 'public'
  },
  {
    id: '2',
    author_id: 'user2',
    author_name: 'Анонимно',
    author_age_group: '50-55',
    author_menopause_phase: 'menopause',
    title: 'Как справиться с приливами на работе?',
    content: 'Девочки, подскажите, как вы справляетесь с приливами на работе? У меня они стали очень частыми и интенсивными. Работаю в офисе, и это очень неловко, когда вдруг краснею и потею. Пока спасаюсь веером и холодной водой, но хотелось бы узнать, есть ли более эффективные способы.',
    category: 'symptoms',
    tags: ['приливы', 'работа', 'советы'],
    is_anonymous: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes_count: 15,
    comments_count: 12,
    is_pinned: false,
    is_verified: false,
    sensitivity_level: 'public'
  },
  {
    id: '3',
    author_id: 'user3',
    author_name: 'Ирина',
    author_age_group: '40-45',
    author_menopause_phase: 'perimenopause',
    title: 'Натуральные способы борьбы с перепадами настроения',
    content: 'Хочу поделиться тем, что мне помогло справиться с эмоциональными качелями в начале перименопаузы. Раньше я была очень спокойным человеком, а тут стала плакать от любой мелочи и срываться на близких. Что помогло: магний перед сном, медитация утром, прогулки на свежем воздухе.',
    category: 'lifestyle',
    tags: ['настроение', 'натуральные методы', 'стресс'],
    is_anonymous: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes_count: 31,
    comments_count: 6,
    is_pinned: false,
    is_verified: true,
    sensitivity_level: 'public'
  }
];

export const getRecommendedGroups = (allGroups: CommunityGroup[]): CommunityGroup[] => {
  return allGroups.filter(group => 
    group.category === 'phase' || group.category === 'treatment' || group.category === 'symptoms'
  ).slice(0, 4);
};