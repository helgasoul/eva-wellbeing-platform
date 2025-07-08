import React, { useState } from 'react';
import { getRecommendedGroups } from '@/services/communityService';
import { cn } from '@/lib/utils';
import { Users, Lock, MessageSquare, Plus } from 'lucide-react';

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

interface CommunityGroupsProps {
  groups: CommunityGroup[];
  onJoinGroup: () => void;
}

// Карточка рекомендуемой группы
const RecommendedGroupCard = ({ 
  group, 
  onJoin 
}: { 
  group: CommunityGroup; 
  onJoin: () => void;
}) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = async () => {
    setIsJoined(true);
    onJoin();
  };

  return (
    <div className="bg-gradient-to-br from-primary/10 to-purple-100 rounded-xl p-4 border border-primary/20">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
          {group.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold gentle-text mb-1">{group.name}</h4>
          <p className="text-sm soft-text mb-2 line-clamp-2">{group.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs soft-text">{group.member_count} участниц</span>
            <button
              onClick={handleJoin}
              disabled={isJoined}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                isJoined
                  ? "bg-green-100 text-green-700"
                  : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {isJoined ? '✓ Присоединились' : 'Присоединиться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Карточка группы
const GroupCard = ({ 
  group, 
  onJoin 
}: { 
  group: CommunityGroup; 
  onJoin: () => void;
}) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = async () => {
    setIsJoined(true);
    onJoin();
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm interactive-hover border border-gray-200">
      
      {/* Обложка группы */}
      <div className="h-32 bg-gradient-to-br from-primary to-primary/70 rounded-t-xl flex items-center justify-center">
        <span className="text-4xl">{group.icon}</span>
      </div>

      <div className="p-4">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold gentle-text text-sm leading-tight">
            {group.name}
          </h3>
          {group.is_private && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center">
              <Lock className="h-3 w-3 mr-1" />
              Приватная
            </span>
          )}
        </div>

        {/* Описание */}
        <p className="text-xs soft-text mb-3 line-clamp-2">
          {group.description}
        </p>

        {/* Статистика */}
        <div className="flex justify-between items-center text-xs soft-text mb-4">
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {group.member_count} участниц
          </span>
          <span className="flex items-center">
            <MessageSquare className="h-3 w-3 mr-1" />
            {group.post_count} постов
          </span>
        </div>

        {/* Теги */}
        <div className="flex flex-wrap gap-1 mb-4">
          {group.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>

        {/* Кнопка присоединения */}
        <button
          onClick={handleJoin}
          disabled={isJoined}
          className={cn(
            "w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors",
            isJoined
              ? "bg-green-100 text-green-700"
              : "bg-primary text-white hover:bg-primary/90"
          )}
        >
          {isJoined ? '✓ Присоединились' : 'Присоединиться'}
        </button>
      </div>
    </div>
  );
};

export const CommunityGroups: React.FC<CommunityGroupsProps> = ({
  groups,
  onJoinGroup
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const groupCategories = [
    { id: 'all', label: 'Все группы', icon: '👥' },
    { id: 'phase', label: 'По фазам', icon: '📅' },
    { id: 'age', label: 'По возрасту', icon: '🎂' },
    { id: 'symptoms', label: 'По симптомам', icon: '🔥' },
    { id: 'treatment', label: 'По лечению', icon: '💊' },
    { id: 'location', label: 'По регионам', icon: '📍' },
    { id: 'interests', label: 'По интересам', icon: '🎯' }
  ];

  const filteredGroups = selectedCategory === 'all' 
    ? groups 
    : groups.filter(g => g.category === selectedCategory);

  // Рекомендуемые группы на основе профиля пользователя
  const recommendedGroups = getRecommendedGroups(groups);

  return (
    <div className="space-y-6">
      
      {/* Рекомендуемые группы */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl font-bold gentle-text mb-4 flex items-center">
          ⭐ Рекомендуемые для вас
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedGroups.slice(0, 4).map(group => (
            <RecommendedGroupCard 
              key={group.id} 
              group={group} 
              onJoin={onJoinGroup}
            />
          ))}
        </div>
      </div>

      {/* Фильтры по категориям */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm">
        <h3 className="font-semibold gentle-text mb-4">Категории групп</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {groupCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "p-3 rounded-lg border-2 transition-colors interactive-hover",
                selectedCategory === category.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="text-lg mb-1">{category.icon}</div>
              <div className="text-sm font-medium gentle-text">{category.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Список групп */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <GroupCard 
            key={group.id} 
            group={group} 
            onJoin={onJoinGroup}
          />
        ))}
      </div>

      {/* Создать группу */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-dashed border-primary/30">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-gentle-float">
            <Plus className="h-12 w-12 mx-auto text-primary" />
          </div>
          <h3 className="text-lg font-semibold gentle-text mb-2">
            Не нашли подходящую группу?
          </h3>
          <p className="soft-text mb-4">
            Создайте собственную группу поддержки для женщин с похожими интересами
          </p>
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Создать группу
          </button>
        </div>
      </div>
    </div>
  );
};