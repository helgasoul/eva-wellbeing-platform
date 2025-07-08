import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { X, ArrowLeft, ArrowRight, Edit } from 'lucide-react';

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

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: CommunityPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onPostCreated
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'type' | 'content' | 'settings'>('type');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    category: 'general' as CommunityPost['category'],
    tags: [] as string[],
    is_anonymous: false,
    sensitivity_level: 'public' as CommunityPost['sensitivity_level']
  });

  const postTypes = [
    {
      category: 'questions' as const,
      title: 'Задать вопрос',
      description: 'Получите ответы от опытных женщин',
      icon: '❓',
      example: 'Как справиться с приливами без гормонов?'
    },
    {
      category: 'support' as const,
      title: 'Попросить поддержку',
      description: 'Поделитесь переживаниями и получите понимание',
      icon: '🤗',
      example: 'Чувствую себя потерянной в начале менопаузы...'
    },
    {
      category: 'success_stories' as const,
      title: 'История успеха',
      description: 'Вдохновите других своим опытом',
      icon: '🌟',
      example: 'Как я справилась с депрессией в менопаузе'
    },
    {
      category: 'symptoms' as const,
      title: 'Обсудить симптомы',
      description: 'Сравните опыт с другими женщинами',
      icon: '🔥',
      example: 'У кого еще бывают ночные поты?'
    },
    {
      category: 'treatment' as const,
      title: 'Лечение и препараты',
      description: 'Обменяйтесь опытом терапии',
      icon: '💊',
      example: 'Мой опыт приема ЗГТ'
    },
    {
      category: 'lifestyle' as const,
      title: 'Образ жизни',
      description: 'Советы по питанию, спорту, уходу',
      icon: '🏃‍♀️',
      example: 'Йога помогла мне с приливами'
    }
  ];

  const handleCreatePost = async () => {
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author_id: user?.id || '',
      author_name: postData.is_anonymous ? 'Анонимно' : (user?.email || 'Пользователь'),
      author_age_group: calculateAgeGroup(45), // Можно получить из профиля пользователя
      author_menopause_phase: 'perimenopause', // Можно получить из онбординга
      title: postData.title,
      content: postData.content,
      category: postData.category,
      tags: postData.tags,
      is_anonymous: postData.is_anonymous,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      is_pinned: false,
      is_verified: false,
      sensitivity_level: postData.sensitivity_level
    };

    // Сохраняем в localStorage (позже заменить на API)
    const existingPosts = JSON.parse(localStorage.getItem('community_posts') || '[]');
    existingPosts.unshift(newPost);
    localStorage.setItem('community_posts', JSON.stringify(existingPosts));

    onPostCreated(newPost);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold gentle-text">
            {step === 'type' ? 'Выберите тип поста' :
             step === 'content' ? 'Напишите пост' : 'Настройки поста'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          
          {step === 'type' && (
            <div className="space-y-4">
              <p className="soft-text mb-6">
                Какой тип поста лучше всего описывает то, чем вы хотите поделиться?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {postTypes.map(type => (
                  <button
                    key={type.category}
                    onClick={() => {
                      setPostData(prev => ({ ...prev, category: type.category }));
                      setStep('content');
                    }}
                    className="text-left p-4 gentle-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors interactive-hover"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <div className="font-semibold gentle-text">{type.title}</div>
                      </div>
                    </div>
                    <div className="text-sm soft-text mb-2">{type.description}</div>
                    <div className="text-xs text-gray-500 italic">
                      Пример: "{type.example}"
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Заголовок поста *
                </label>
                <input
                  type="text"
                  value={postData.title}
                  onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Кратко опишите суть вашего поста..."
                  className="w-full p-3 gentle-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Содержание поста *
                </label>
                <textarea
                  value={postData.content}
                  onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Поделитесь своим опытом, задайте вопрос или расскажите историю..."
                  rows={8}
                  className="w-full p-3 gentle-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  placeholder="приливы, сон, настроение..."
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                    setPostData(prev => ({ ...prev, tags }));
                  }}
                  className="w-full p-3 gentle-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('type')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </button>
                <button
                  onClick={() => setStep('settings')}
                  disabled={!postData.title || !postData.content}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  Далее
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>
          )}

          {step === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold gentle-text mb-4">Настройки приватности</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={postData.is_anonymous}
                      onChange={(e) => setPostData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Опубликовать анонимно</div>
                      <div className="text-sm soft-text">Ваше имя не будет показано</div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium gentle-text mb-2">
                      Уровень чувствительности
                    </label>
                    <select
                      value={postData.sensitivity_level}
                      onChange={(e) => setPostData(prev => ({ 
                        ...prev, 
                        sensitivity_level: e.target.value as CommunityPost['sensitivity_level']
                      }))}
                      className="w-full gentle-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                    >
                      <option value="public">Публичный - видят все</option>
                      <option value="sensitive">Деликатный - предупреждение</option>
                      <option value="private">Приватный - только участницы групп</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <strong>Правила сообщества:</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Будьте уважительны к другим участницам</li>
                      <li>Не давайте медицинских советов без квалификации</li>
                      <li>Делитесь только проверенной информацией</li>
                      <li>Поддерживайте друг друга с пониманием</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('content')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </button>
                <button
                  onClick={handleCreatePost}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Опубликовать пост
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция определения возрастной группы
const calculateAgeGroup = (age?: number): CommunityPost['author_age_group'] => {
  if (!age) return '45-50';
  if (age < 40) return '35-40';
  if (age < 45) return '40-45';
  if (age < 50) return '45-50';
  if (age < 55) return '50-55';
  if (age < 60) return '55-60';
  return '60+';
};