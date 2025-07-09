import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BasicRecommendationEngine, BasicRecommendation } from '../services/basicRecommendationEngine';

interface BasicNotificationContextType {
  notifications: BasicRecommendation[];
  currentRecommendation: BasicRecommendation | null;
  showNotification: boolean;
  dismissNotification: () => void;
  triggerRecommendation: () => void;
  clearAllNotifications: () => void;
}

const BasicNotificationContext = createContext<BasicNotificationContextType | undefined>(undefined);

export const useBasicNotifications = () => {
  const context = useContext(BasicNotificationContext);
  if (!context) {
    throw new Error('useBasicNotifications must be used within a BasicNotificationProvider');
  }
  return context;
};

export const BasicNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<BasicRecommendation[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<BasicRecommendation | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [shownIds, setShownIds] = useState<string[]>([]);

  // Мокированные данные пользователя
  const [userContext, setUserContext] = useState({
    currentTime: new Date(),
    lastMealTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 часа назад
    todaysMeals: ['breakfast'],
    primarySymptoms: ['Приливы', 'Усталость'],
    waterIntake: 3
  });

  const generateRecommendation = useCallback(() => {
    const context = {
      ...userContext,
      currentTime: new Date()
    };

    const recommendations = BasicRecommendationEngine.generateRecommendations(context);
    
    // Найти первую нераспознанную рекомендацию
    const newRecommendation = recommendations.find(r => !shownIds.includes(r.id));
    
    if (newRecommendation) {
      setCurrentRecommendation(newRecommendation);
      setShowNotification(true);
      setNotifications(prev => [newRecommendation, ...prev]);
      setShownIds(prev => [...prev, newRecommendation.id]);
    }
  }, [userContext, shownIds]);

  const dismissNotification = () => {
    setShowNotification(false);
    setCurrentRecommendation(null);
  };

  const triggerRecommendation = () => {
    generateRecommendation();
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShownIds([]);
    setShowNotification(false);
    setCurrentRecommendation(null);
  };

  // Периодическая проверка рекомендаций
  useEffect(() => {
    const interval = setInterval(() => {
      generateRecommendation();
    }, 60000); // Каждую минуту для тестирования

    return () => clearInterval(interval);
  }, [generateRecommendation]);

  return (
    <BasicNotificationContext.Provider value={{
      notifications,
      currentRecommendation,
      showNotification,
      dismissNotification,
      triggerRecommendation,
      clearAllNotifications
    }}>
      {children}
    </BasicNotificationContext.Provider>
  );
};