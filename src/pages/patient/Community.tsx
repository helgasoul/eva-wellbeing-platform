import React, { useState, useEffect } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { useAuth } from '@/context/AuthContext';
import { CommunityFeed } from '@/components/community/CommunityFeed';
import { CommunityGroups } from '@/components/community/CommunityGroups';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { getCommunityContent } from '@/services/communityService';
import { cn } from '@/lib/utils';
import { Users, MessageSquare, FileText, Bookmark, Plus, Heart, TrendingUp } from 'lucide-react';

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

interface CommunityGroup {
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

// Компонент быстрых действий
const QuickActions = ({ onCreatePost }: { onCreatePost: () => void }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onCreatePost}
          className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-colors"
        >
          <Plus className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Создать пост</span>
        </button>
        
        <button className="flex flex-col items-center p-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
          <MessageSquare className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Задать вопрос</span>
        </button>
        
        <button className="flex flex-col items-center p-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors">
          <Heart className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Поддержка</span>
        </button>
        
        <button className="flex flex-col items-center p-4 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors">
          <TrendingUp className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">История успеха</span>
        </button>
      </div>
    </div>
  );
};

// Компонент боковой панели
const CommunitySidebar = ({ user }: { user: any }) => {
  return (
    <div className="space-y-6">
      {/* Профиль пользователя */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Ваш профиль</h3>
        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-gray-600">Фаза:</span>
            <span className="ml-2 font-medium">Перименопауза</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Постов:</span>
            <span className="ml-2 font-medium">3</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">Лайков получено:</span>
            <span className="ml-2 font-medium">47</span>
          </div>
        </div>
      </div>

      {/* Популярные темы */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Популярные темы</h3>
        <div className="space-y-2">
          {['#приливы', '#сон', '#настроение', '#ЗГТ', '#питание'].map(tag => (
            <button key={tag} className="block w-full text-left text-sm text-gray-600 hover:text-purple-600 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Помощь */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-2">Нужна помощь?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Наши модераторы всегда готовы помочь
        </p>
        <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg text-sm hover:bg-purple-600 transition-colors">
          Связаться с модератором
        </button>
      </div>
    </div>
  );
};

// Компонент моих постов
const MyPostsContent = ({ posts }: { posts: CommunityPost[] }) => {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            У вас пока нет постов
          </h3>
          <p className="text-gray-600">
            Поделитесь своим опытом с сообществом
          </p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">{post.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{post.content.slice(0, 150)}...</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{post.likes_count} лайков</span>
              <span>{post.comments_count} комментариев</span>
              <span>{new Date(post.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Компонент сохраненного
const SavedContent = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🔖</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Нет сохраненных постов
      </h3>
      <p className="text-gray-600">
        Сохраняйте интересные посты для быстрого доступа
      </p>
    </div>
  );
};

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'my_posts' | 'saved'>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Сообщество' }
  ];

  useEffect(() => {
    loadCommunityData();
  }, [activeTab, selectedCategory]);

  const loadCommunityData = async () => {
    try {
      const communityData = await getCommunityContent(activeTab, selectedCategory);
      setPosts(communityData.posts);
      setGroups(communityData.groups);
    } catch (error) {
      console.error('Error loading community data:', error);
    }
  };

  const tabItems = [
    { key: 'feed', label: 'Лента', icon: FileText },
    { key: 'groups', label: 'Группы', icon: Users },
    { key: 'my_posts', label: 'Мои посты', icon: MessageSquare },
    { key: 'saved', label: 'Сохраненное', icon: Bookmark }
  ] as const;

  return (
    <PatientLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Заголовок */}
        <div className="bloom-warm-gradient p-6 rounded-2xl text-white shadow-warm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full animate-gentle-float">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Сообщество Eva</h1>
              <p className="text-white/90 mt-1">
                Поддержка, опыт и понимание от женщин, которые проходят через то же самое
              </p>
            </div>
          </div>
        </div>

        {/* Быстрые действия */}
        <QuickActions onCreatePost={() => setShowCreatePost(true)} />

        {/* Табы */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 max-w-2xl">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2",
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Основная область */}
          <div className="lg:col-span-3">
            {activeTab === 'feed' && (
              <CommunityFeed 
                posts={posts}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onPostUpdate={loadCommunityData}
              />
            )}

            {activeTab === 'groups' && (
              <CommunityGroups 
                groups={groups}
                onJoinGroup={loadCommunityData}
              />
            )}

            {activeTab === 'my_posts' && (
              <MyPostsContent posts={posts.filter(p => p.author_id === user?.id)} />
            )}

            {activeTab === 'saved' && (
              <SavedContent />
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            <CommunitySidebar user={user} />
          </div>
        </div>

        {/* Модальное окно создания поста */}
        {showCreatePost && (
          <CreatePostModal
            onClose={() => setShowCreatePost(false)}
            onPostCreated={(newPost) => {
              setPosts([newPost, ...posts]);
              setShowCreatePost(false);
            }}
          />
        )}
      </div>
    </PatientLayout>
  );
}