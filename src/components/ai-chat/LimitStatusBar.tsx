import React from 'react';
import { cn } from '@/lib/utils';
import { UserLimitStatus } from '@/services/claudeChatService';

interface LimitStatusBarProps {
  limitStatus: UserLimitStatus;
}

export const LimitStatusBar: React.FC<LimitStatusBarProps> = ({ limitStatus }) => {
  const getStatusColor = () => {
    if (limitStatus.remainingRequests === 0) return 'bg-red-50 border-red-200 text-red-700';
    if (limitStatus.remainingRequests <= 5) return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    return 'bg-green-50 border-green-200 text-green-700';
  };

  const getProgressPercentage = () => {
    return ((limitStatus.requestsToday / limitStatus.maxRequestsPerDay) * 100);
  };

  const getHourlyProgressPercentage = () => {
    return ((limitStatus.requestsThisHour / limitStatus.maxRequestsPerHour) * 100);
  };

  return (
    <div className={cn("mt-3 p-4 rounded-lg border", getStatusColor())}>
      {/* Основная информация */}
      <div className="flex items-center justify-between text-sm mb-3">
        <div className="flex items-center space-x-2">
          <span>📊</span>
          <span className="font-medium">
            Осталось запросов: {limitStatus.remainingRequests}/{limitStatus.maxRequestsPerDay}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>🕒</span>
          <span>
            В этом часу: {limitStatus.requestsThisHour}/{limitStatus.maxRequestsPerHour}
          </span>
        </div>
      </div>

      {/* Прогресс-бары */}
      <div className="space-y-2">
        {/* Дневной прогресс */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Дневное использование</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                limitStatus.remainingRequests === 0 ? "bg-red-400" :
                limitStatus.remainingRequests <= 5 ? "bg-yellow-400" : "bg-green-400"
              )}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Часовой прогресс */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Использование в текущем часу</span>
            <span>{Math.round(getHourlyProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour ? "bg-red-400" :
                limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour * 0.8 ? "bg-yellow-400" : "bg-green-400"
              )}
              style={{ width: `${getHourlyProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Предупреждения */}
      {limitStatus.remainingRequests === 0 && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs">
          <p className="font-medium text-red-800">Лимит исчерпан</p>
          <p className="text-red-700">
            Следующий сброс: {new Date(limitStatus.nextDailyReset).toLocaleString('ru-RU')}
          </p>
        </div>
      )}

      {limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs">
          <p className="font-medium text-yellow-800">Часовой лимит достигнут</p>
          <p className="text-yellow-700">
            Следующий сброс: {new Date(limitStatus.nextHourlyReset).toLocaleString('ru-RU')}
          </p>
        </div>
      )}

      {limitStatus.remainingRequests <= 5 && limitStatus.remainingRequests > 0 && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs">
          <p className="font-medium text-yellow-800">
            Внимание: осталось мало запросов ({limitStatus.remainingRequests})
          </p>
        </div>
      )}
    </div>
  );
};