import React, { useState, useEffect } from 'react';
import { NotificationButton } from './NotificationButton';
import { NotificationCenter } from './NotificationCenter';
import { SimpleNotification } from './SimpleNotification';
import { AdvancedRecommendationEngine, AdvancedRecommendation } from '../../services/advancedRecommendationEngine';
import { logger } from '@/utils/logger';

export const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<AdvancedRecommendation[]>([]);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<AdvancedRecommendation | null>(null);
  const [showCurrentNotification, setShowCurrentNotification] = useState(false);

  // Мокированный контекст пользователя
  const userContext = {
    currentTime: new Date(),
    lastMealTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    todaysMeals: ['breakfast'],
    primarySymptoms: ['Приливы', 'Усталость'],
    waterIntake: 3,
    userProfile: {
      age: 52,
      menopausePhase: 'perimenopause',
      subscriptionTier: 'plus',
      deficiencies: ['Витамин D', 'Железо']
    },
    weatherData: {
      temperature: 25,
      humidity: 70
    },
    recentSymptoms: [
      { name: 'Приливы', severity: 7, timestamp: new Date() }
    ]
  };

  const generateRecommendations = () => {
    const newRecommendations = AdvancedRecommendationEngine.generateAdvancedRecommendations(userContext);
    if (newRecommendations.length > 0) {
      const topRecommendation = newRecommendations[0];
      setCurrentNotification(topRecommendation);
      setShowCurrentNotification(true);
      setNotifications(prev => [topRecommendation, ...prev]);
    }
  };

  const handleNotificationClick = (notification: AdvancedRecommendation) => {
    logger.debug('Notification clicked', { title: notification.title });
    setCurrentNotification(notification);
    setShowCurrentNotification(true);
    setShowNotificationCenter(false);
  };

  const handleNotificationAction = (action: string) => {
    logger.debug('Notification action performed', { action });
    setShowCurrentNotification(false);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotificationCenter(false);
  };

  const hasHighPriorityNotifications = notifications.some(n => n.priority === 'high');

  // Периодическая генерация рекомендаций
  useEffect(() => {
    const interval = setInterval(generateRecommendations, 30000); // Каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Кнопка уведомлений */}
      <NotificationButton
        notificationCount={notifications.length}
        hasHighPriority={hasHighPriorityNotifications}
        onClick={() => setShowNotificationCenter(!showNotificationCenter)}
      />

      {/* Текущее всплывающее уведомление */}
      {showCurrentNotification && currentNotification && (
        <SimpleNotification
          recommendation={currentNotification}
          onDismiss={() => setShowCurrentNotification(false)}
          onAction={handleNotificationAction}
          isVisible={showCurrentNotification}
        />
      )}

      {/* Центр уведомлений */}
      <NotificationCenter
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onClearAll={clearAllNotifications}
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </>
  );
};