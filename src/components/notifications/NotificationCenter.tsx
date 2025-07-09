import React, { useState } from 'react';
import { Bell, X, Filter, Clock, Target, Droplets, Sun } from 'lucide-react';
import { AdvancedRecommendation } from '../../services/advancedRecommendationEngine';

interface NotificationCenterProps {
  notifications: AdvancedRecommendation[];
  onNotificationClick: (notification: AdvancedRecommendation) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onClearAll,
  isOpen,
  onClose
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'today' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (activeFilter) {
      case 'high':
        filtered = filtered.filter(n => n.priority === 'high');
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(n => n.triggerTime.toDateString() === today);
        break;
      case 'category':
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(n => n.category === selectedCategory);
        }
        break;
    }
    
    return filtered;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      meal: <Clock size={16} className="text-green-500" />,
      hydration: <Droplets size={16} className="text-blue-500" />,
      symptom: <Target size={16} className="text-red-500" />,
      deficiency: <Sun size={16} className="text-yellow-500" />,
      lifestyle: <Target size={16} className="text-purple-500" />,
      weather: <Sun size={16} className="text-orange-500" />
    };
    return icons[category] || <Bell size={16} />;
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    return 'вчера';
  };

  const getEffectivenessColor = (effectiveness: number) => {
    if (effectiveness >= 85) return 'text-green-600';
    if (effectiveness >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const categories = [
    { value: 'all', label: 'Все' },
    { value: 'meal', label: 'Питание' },
    { value: 'hydration', label: 'Гидратация' },
    { value: 'symptom', label: 'Симптомы' },
    { value: 'deficiency', label: 'Дефициты' },
    { value: 'lifestyle', label: 'Образ жизни' },
    { value: 'weather', label: 'Погода' }
  ];

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="fixed top-16 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-[600px] z-40 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Центр уведомлений</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {notifications.length}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setActiveFilter('high')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'high' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Важные
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'today' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => setActiveFilter('category')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === 'category' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter size={12} />
          </button>
        </div>

        {/* Category Filter */}
        {activeFilter === 'category' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        )}
      </div>
      
      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg mb-1">Нет уведомлений</p>
            <p className="text-sm">
              {activeFilter === 'all' 
                ? 'Новые рекомендации появятся здесь' 
                : 'Попробуйте другой фильтр'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                index === 0 ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg flex-shrink-0">
                  {notification.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-gray-800 truncate">
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(notification.category)}
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.triggerTime)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">
                      {notification.benefit}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getEffectivenessColor(notification.effectiveness)}`}>
                        {notification.effectiveness}%
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : notification.priority === 'medium' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.priority === 'high' ? 'Важно' : 
                         notification.priority === 'medium' ? 'Средне' : 'Инфо'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClearAll}
            className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Очистить все уведомления
          </button>
        </div>
      )}
    </div>
  );
};