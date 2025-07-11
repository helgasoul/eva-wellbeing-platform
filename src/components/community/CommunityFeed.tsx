import React from 'react';
import { PostCard } from './PostCard';
import { cn } from '@/lib/utils';

interface CommunityPost {
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

interface CommunityFeedProps {
  posts: CommunityPost[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onPostUpdate: () => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  selectedCategory,
  onCategoryChange,
  onPostUpdate
}) => {
  const categories = [
    { id: 'all', label: 'Все темы', icon: '📰', count: posts.length },
    { id: 'symptoms', label: 'Симптомы', icon: '🔥', count: posts.filter(p => p.category === 'symptoms').length },
    { id: 'treatment', label: 'Лечение', icon: '💊', count: posts.filter(p => p.category === 'treatment').length },
    { id: 'lifestyle', label: 'Образ жизни', icon: '🏃‍♀️', count: posts.filter(p => p.category === 'lifestyle').length },
    { id: 'success_stories', label: 'Истории успеха', icon: '🌟', count: posts.filter(p => p.category === 'success_stories').length },
    { id: 'support', label: 'Поддержка', icon: '🤗', count: posts.filter(p => p.category === 'support').length },
    { id: 'questions', label: 'Вопросы', icon: '❓', count: posts.filter(p => p.category === 'questions').length }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Фильтры по категориям */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm">
        <h3 className="font-semibold gentle-text mb-4">Категории обсуждений</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "p-3 rounded-lg border-2 transition-colors text-left interactive-hover",
                selectedCategory === category.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{category.icon}</span>
                <span className="text-xs soft-text">({category.count})</span>
              </div>
              <div className="text-sm font-medium gentle-text">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Сортировка и фильтры */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-sm soft-text">Сортировка:</span>
          <select className="gentle-border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary">
            <option value="recent">Недавние</option>
            <option value="popular">Популярные</option>
            <option value="commented">Обсуждаемые</option>
          </select>
        </div>
        <div className="text-sm soft-text">
          {filteredPosts.length} постов
        </div>
      </div>

      {/* Список постов */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <EmptyFeedState selectedCategory={selectedCategory} />
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onPostUpdate={onPostUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Компонент пустого состояния
const EmptyFeedState = ({ selectedCategory }: { selectedCategory: string }) => (
  <div className="bloom-card bg-white/90 backdrop-blur-sm text-center">
    <div className="text-6xl mb-4 animate-gentle-float">🌸</div>
    <h3 className="text-xl font-semibold gentle-text mb-2">
      {selectedCategory === 'all' ? 'Пока нет постов' : 'Нет постов в этой категории'}
    </h3>
    <p className="soft-text mb-6">
      Станьте первой, кто поделится своим опытом и поддержит других женщин
    </p>
    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
      ✍️ Создать первый пост
    </button>
  </div>
);