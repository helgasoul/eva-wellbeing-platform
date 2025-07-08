import React, { useState, useEffect } from 'react';
import { WeatherAlert } from '../../utils/environmentalAnalyzer';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
  onDismiss?: (alertId: string) => void;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({ 
  alerts, 
  onDismiss 
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Загружаем отклоненные уведомления из localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed_weather_alerts');
    if (dismissed) {
      setDismissedAlerts(JSON.parse(dismissed));
    }
  }, []);

  // Сохраняем отклоненные уведомления в localStorage
  useEffect(() => {
    localStorage.setItem('dismissed_weather_alerts', JSON.stringify(dismissedAlerts));
  }, [dismissedAlerts]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'danger': 
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-700',
          action: 'text-red-600 bg-red-100'
        };
      case 'warning': 
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          action: 'text-yellow-600 bg-yellow-100'
        };
      default: 
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-700',
          action: 'text-blue-600 bg-blue-100'
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pressure_drop': return '📉';
      case 'high_humidity': return '💧';
      case 'poor_air_quality': return '🌫️';
      case 'uv_warning': return '☀️';
      default: return '🌤️';
    }
  };

  const handleDismiss = (alert: WeatherAlert, index: number) => {
    const alertId = `${alert.type}-${alert.showUntil}-${index}`;
    setDismissedAlerts(prev => [...prev, alertId]);
    onDismiss?.(alertId);
  };

  const visibleAlerts = alerts.filter((alert, index) => {
    const alertId = `${alert.type}-${alert.showUntil}-${index}`;
    return !dismissedAlerts.includes(alertId) && new Date(alert.showUntil) > new Date();
  });

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🌪️</span>
          Погодные предупреждения
        </h3>
        {visibleAlerts.length > 1 && (
          <button
            onClick={() => {
              const allAlertIds = visibleAlerts.map((alert, index) => 
                `${alert.type}-${alert.showUntil}-${index}`
              );
              setDismissedAlerts(prev => [...prev, ...allAlertIds]);
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Скрыть все
          </button>
        )}
      </div>
      
      {visibleAlerts.map((alert, index) => {
        const styles = getSeverityStyles(alert.severity);
        const timeUntil = getTimeUntilExpiry(alert.showUntil);
        
        return (
          <div
            key={`${alert.type}-${index}`}
            className={`border rounded-lg p-4 ${styles.container} transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                {/* Иконки */}
                <div className="flex items-center mr-3">
                  <span className="text-lg mr-1">{getSeverityIcon(alert.severity)}</span>
                  <span className="text-sm">{getTypeIcon(alert.type)}</span>
                </div>
                
                {/* Содержимое */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${styles.title}`}>{alert.title}</h4>
                    {timeUntil && (
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {timeUntil}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${styles.message}`}>
                    {alert.message}
                  </p>
                  
                  <div className={`text-xs font-medium px-3 py-2 rounded-lg ${styles.action}`}>
                    💡 {alert.action}
                  </div>
                </div>
              </div>
              
              {/* Кнопка закрытия */}
              <button
                onClick={() => handleDismiss(alert, index)}
                className="text-gray-400 hover:text-gray-600 ml-3 p-1 rounded-full hover:bg-white/50 transition-colors"
                title="Скрыть уведомление"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
                </svg>
              </button>
            </div>
            
            {/* Полоса прогресса времени */}
            <AlertProgressBar showUntil={alert.showUntil} />
          </div>
        );
      })}
      
      {/* Итоговая статистика */}
      {visibleAlerts.length > 2 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{visibleAlerts.length}</span> активных предупреждений
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Основано на прогнозе погоды и ваших данных о симптомах
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент полосы прогресса времени
const AlertProgressBar: React.FC<{ showUntil: string }> = ({ showUntil }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const now = new Date().getTime();
      const until = new Date(showUntil).getTime();
      const total = until - (now - 24 * 60 * 60 * 1000); // 24 часа назад
      const remaining = until - now;
      
      if (total > 0) {
        const progressPercent = Math.max(0, Math.min(100, ((total - remaining) / total) * 100));
        setProgress(progressPercent);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, [showUntil]);

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Актуально до:</span>
        <span className="text-xs text-gray-600">
          {new Date(showUntil).toLocaleString('ru')}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Вспомогательная функция для расчета времени до истечения
const getTimeUntilExpiry = (showUntil: string): string | null => {
  const now = new Date();
  const until = new Date(showUntil);
  const diffMs = until.getTime() - now.getTime();
  
  if (diffMs <= 0) return null;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else if (minutes > 0) {
    return `${minutes}м`;
  } else {
    return 'менее минуты';
  }
};

export default WeatherAlerts;