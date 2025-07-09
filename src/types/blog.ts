import { UserRole } from './roles';

// Интерфейс статьи блога
export interface ExpertBlogPost {
  id: string;
  author_id: string;
  author: {
    full_name: string;
    avatar_url?: string;
    expert_specialization: string;
    expert_credentials: string;
  };
  
  title: string;
  subtitle?: string;
  content: string; // Markdown контент
  excerpt: string; // Краткое описание
  
  // Медиа контент
  featured_image?: string;
  gallery_images?: string[];
  
  // Метаданные
  category: 'menopause' | 'cardiovascular' | 'bone_health' | 'mental_health' | 'nutrition' | 'lifestyle' | 'research';
  tags: string[];
  
  // Статус публикации
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  visibility: 'public' | 'members_only' | 'premium';
  
  // Временные метки
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Статистика
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  
  // SEO и социальные сети
  meta_description?: string;
  og_image?: string;
  
  // Модерация
  moderation_status: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
}

// Интерфейс комментария к статье
export interface BlogComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: UserRole;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_expert_reply: boolean; // Ответ от автора-эксперта
}

// Интерфейс профиля эксперта
export interface ExpertProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  specialization: string;
  credentials: string;
  bio: string;
  
  // Поля для экспертов
  is_expert: boolean;
  expert_status: 'pending' | 'approved' | 'revoked' | null;
  expert_specialization?: string;
  expert_bio?: string;
  expert_credentials?: string;
  expert_approved_at?: string;
  expert_approved_by?: string;
  
  // Статистика блога
  blog_posts_count: number;
  blog_followers_count: number;
  
  created_at: string;
  updated_at: string;
}

// Категории блога
export const BLOG_CATEGORIES = {
  menopause: 'Менопауза',
  cardiovascular: 'Сердечно-сосудистая система',
  bone_health: 'Здоровье костей',
  mental_health: 'Психическое здоровье',
  nutrition: 'Питание',
  lifestyle: 'Образ жизни',
  research: 'Исследования'
} as const;

export type BlogCategory = keyof typeof BLOG_CATEGORIES;