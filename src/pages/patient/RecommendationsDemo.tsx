import React from 'react';
import { Bell, Zap, Target, Clock } from 'lucide-react';
import { useBasicNotifications } from '../../contexts/BasicNotificationContext';
import { SimpleNotification } from '../../components/notifications/SimpleNotification';
import { NotificationSystem } from '../../components/notifications/NotificationSystem';

export const RecommendationsDemo: React.FC = () => {
  const {
    notifications,
    currentRecommendation,
    showNotification,
    dismissNotification,
    triggerRecommendation,
    clearAllNotifications
  } = useBasicNotifications();

  const handleNotificationAction = (action: string) => {
    console.log('Выполнено действие:', action);
    dismissNotification();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Система уведомлений */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationSystem />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Система рекомендаций Eva - Расширенная версия
        </h1>
        <p className="text-gray-600">
          Персонализированные подсказки с центром уведомлений и расширенной логикой
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="text-blue-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Уведомления</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {notifications.length}
          </div>
          <p className="text-sm text-gray-600">Всего сегодня</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Target className="text-green-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Активность</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {Math.floor(notifications.length * 0.4)}
          </div>
          <p className="text-sm text-gray-600">Выполнено действий</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="text-purple-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Следующее</h3>
          </div>
          <div className="text-lg font-bold text-gray-800">
            Через 15 мин
          </div>
          <p className="text-sm text-gray-600">Напоминание о воде</p>
        </div>
      </div>

      {/* Управление */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Управление рекомендациями</h3>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            💡 Новая система включает центр уведомлений с фильтрацией, показатели эффективности и персонализированные рекомендации
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={triggerRecommendation}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Zap size={16} />
            <span>Показать рекомендацию</span>
          </button>
          <button
            onClick={clearAllNotifications}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
          >
            Очистить все
          </button>
        </div>
      </div>

      {/* История уведомлений */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-lg mb-4">История уведомлений</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Пока нет уведомлений
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">{notification.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-800">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.priority === 'high' ? 'Важно' : 
                         notification.priority === 'medium' ? 'Средне' : 'Инфо'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notification.triggerTime.toLocaleTimeString('ru', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Всплывающее уведомление */}
      {showNotification && currentRecommendation && (
        <SimpleNotification
          recommendation={currentRecommendation}
          onDismiss={dismissNotification}
          onAction={handleNotificationAction}
          isVisible={showNotification}
        />
      )}
    </div>
  );
};