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
    <div className="mt-4 p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 rounded-2xl border border-primary/10 shadow-soft">
      {/* Основная информация */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold">✨</span>
          </div>
          <div>
            <p className="font-medium text-foreground">
              Осталось запросов на сегодня: {limitStatus.remainingRequests} из {limitStatus.maxRequestsPerDay}
            </p>
            <p className="text-xs text-muted-foreground italic">
              Чувствуйте себя свободно — задавайте любые вопросы, я отвечу с заботой!
            </p>
          </div>
        </div>
      </div>

      {/* Прогресс-бары */}
      <div className="space-y-3">
        {/* Дневной прогресс */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Использовано сегодня</span>
            <span className="font-medium text-primary">{Math.round(getProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden">
            <div 
              className={cn(
                "h-3 rounded-full transition-all duration-500 bg-gradient-to-r",
                limitStatus.remainingRequests === 0 ? "from-red-300 to-red-400" :
                limitStatus.remainingRequests <= 5 ? "from-yellow-300 to-yellow-400" : "from-primary/60 to-accent/60"
              )}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Часовой прогресс */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">В текущем часу</span>
            <span className="font-medium text-primary">{Math.round(getHourlyProgressPercentage())}%</span>
          </div>
          <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden">
            <div 
              className={cn(
                "h-3 rounded-full transition-all duration-500 bg-gradient-to-r",
                limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour ? "from-red-300 to-red-400" :
                limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour * 0.8 ? "from-yellow-300 to-yellow-400" : "from-secondary/60 to-accent/60"
              )}
              style={{ width: `${getHourlyProgressPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Предупреждения */}
      {limitStatus.remainingRequests === 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
          <p className="font-medium text-red-800 mb-1">💝 Дневной лимит исчерпан</p>
          <p className="text-red-700 text-sm">
            Завтра я снова буду готова помочь вам! Сброс: {new Date(limitStatus.nextDailyReset).toLocaleString('ru-RU')}
          </p>
        </div>
      )}

      {limitStatus.requestsThisHour >= limitStatus.maxRequestsPerHour && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl">
          <p className="font-medium text-yellow-800 mb-1">⏰ Небольшая пауза</p>
          <p className="text-yellow-700 text-sm">
            Давайте отдохнем чуть-чуть. Я буду готова отвечать снова через час: {new Date(limitStatus.nextHourlyReset).toLocaleString('ru-RU')}
          </p>
        </div>
      )}

      {limitStatus.remainingRequests <= 5 && limitStatus.remainingRequests > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
          <p className="font-medium text-yellow-800 mb-1">
            🌸 Осталось {limitStatus.remainingRequests} вопросов на сегодня
          </p>
          <p className="text-yellow-700 text-sm">
            Используйте их с умом — я постараюсь дать максимально полезные ответы!
          </p>
        </div>
      )}
    </div>
  );
};