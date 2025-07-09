import React, { useState } from 'react';
import { Bell, Dot } from 'lucide-react';

interface NotificationButtonProps {
  notificationCount: number;
  hasHighPriority: boolean;
  onClick: () => void;
  className?: string;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  notificationCount,
  hasHighPriority,
  onClick,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
        isAnimating ? 'scale-95' : 'scale-100'
      } ${className}`}
    >
      <Bell 
        size={24} 
        className={`transition-colors ${
          hasHighPriority ? 'text-red-500' : 'text-gray-600'
        }`}
      />
      
      {/* Счетчик уведомлений */}
      {notificationCount > 0 && (
        <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium ${
          hasHighPriority ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
      
      {/* Индикатор новых уведомлений */}
      {hasHighPriority && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <Dot className="text-red-500 animate-pulse" size={12} />
        </div>
      )}
    </button>
  );
};