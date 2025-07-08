import React, { useState } from 'react';
import { getPostComments } from '@/services/communityService';
import { cn } from '@/lib/utils';
import { Heart, MessageSquare, Share, Bookmark } from 'lucide-react';

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

interface CommunityComment {
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

interface PostCardProps {
  post: CommunityPost;
  onPostUpdate: () => void;
}

// Компонент секции комментариев
const CommentsSection = ({ 
  postId, 
  comments, 
  onCommentAdd 
}: { 
  postId: string; 
  comments: CommunityComment[]; 
  onCommentAdd: (comment: CommunityComment) => void;
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: CommunityComment = {
      id: Date.now().toString(),
      post_id: postId,
      author_id: 'current_user',
      author_name: 'Текущий пользователь',
      content: newComment,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_anonymous: false,
      is_verified: false
    };

    onCommentAdd(comment);
    setNewComment('');
  };

  return (
    <div className="space-y-4">
      {/* Форма добавления комментария */}
      <div className="bg-gray-50 rounded-lg p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Поделитесь своими мыслями..."
          className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Комментировать
          </button>
        </div>
      </div>

      {/* Список комментариев */}
      <div className="space-y-3">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                {comment.is_anonymous ? '🌸' : comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm gentle-text">
                    {comment.is_anonymous ? 'Анонимно' : comment.author_name}
                  </span>
                  <span className="text-xs soft-text">
                    {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-primary transition-colors">
                    <Heart className="h-3 w-3" />
                    <span>{comment.likes_count}</span>
                  </button>
                  <button className="text-xs text-gray-500 hover:text-primary transition-colors">
                    Ответить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'symptoms': return 'bg-red-100 text-red-700';
      case 'treatment': return 'bg-blue-100 text-blue-700';
      case 'lifestyle': return 'bg-green-100 text-green-700';
      case 'success_stories': return 'bg-yellow-100 text-yellow-700';
      case 'support': return 'bg-purple-100 text-purple-700';
      case 'questions': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      general: 'Общее',
      symptoms: 'Симптомы',
      treatment: 'Лечение',
      lifestyle: 'Образ жизни',
      success_stories: 'История успеха',
      questions: 'Вопрос',
      support: 'Поддержка'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getPhaseLabel = (phase: string) => {
    const labels = {
      premenopause: 'Пременопауза',
      perimenopause: 'Перименопауза',
      menopause: 'Менопауза',
      postmenopause: 'Постменопауза'
    };
    return labels[phase as keyof typeof labels] || phase;
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    // API call для лайка
  };

  const loadComments = async () => {
    if (!showComments) {
      const postComments = await getPostComments(post.id);
      setComments(postComments);
    }
    setShowComments(!showComments);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Только что';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm interactive-hover">
      
      {/* Заголовок поста */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          {/* Аватар автора */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt={post.author_name} className="w-full h-full rounded-full object-cover" />
            ) : (
              post.is_anonymous ? '🌸' : post.author_name.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Информация об авторе */}
          <div>
            <div className="font-semibold gentle-text">
              {post.is_anonymous ? 'Анонимно' : post.author_name}
            </div>
            <div className="text-xs soft-text space-x-2">
              <span>{post.author_age_group} лет</span>
              <span>•</span>
              <span>{getPhaseLabel(post.author_menopause_phase)}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Значки верификации */}
        <div className="flex items-center space-x-2">
          {post.is_verified && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              ✓ Проверено
            </span>
          )}
          {post.is_pinned && (
            <span className="text-yellow-500" title="Закреплено">📌</span>
          )}
        </div>
      </div>

      {/* Категория и теги */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
          {getCategoryLabel(post.category)}
        </span>
        {post.tags.slice(0, 3).map(tag => (
          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            #{tag}
          </span>
        ))}
      </div>

      {/* Заголовок поста */}
      <h3 className="text-lg font-semibold gentle-text mb-3">
        {post.title}
      </h3>

      {/* Содержание поста */}
      <div className="text-gray-700 mb-4">
        <p className="line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Действия с постом */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          
          {/* Лайки */}
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center space-x-2 transition-colors",
              isLiked ? "text-primary" : "text-gray-500 hover:text-primary"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-sm">{likesCount}</span>
          </button>

          {/* Комментарии */}
          <button
            onClick={loadComments}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{post.comments_count}</span>
          </button>

          {/* Поделиться */}
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors">
            <Share className="h-4 w-4" />
            <span className="text-sm">Поделиться</span>
          </button>
        </div>

        {/* Сохранить */}
        <button className="text-gray-500 hover:text-purple-600 transition-colors">
          <Bookmark className="h-4 w-4" />
        </button>
      </div>

      {/* Комментарии */}
      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <CommentsSection 
            postId={post.id}
            comments={comments}
            onCommentAdd={(newComment) => {
              setComments([...comments, newComment]);
              onPostUpdate();
            }}
          />
        </div>
      )}
    </div>
  );
};