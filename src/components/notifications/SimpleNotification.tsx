import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { BasicRecommendation } from '../../services/basicRecommendationEngine';

interface SimpleNotificationProps {
  recommendation: BasicRecommendation;
  onDismiss: () => void;
  onAction: (action: string) => void;
  isVisible: boolean;
}

export const SimpleNotification: React.FC<SimpleNotificationProps> = ({
  recommendation,
  onDismiss,
  onAction,
  isVisible
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Автоскрытие через 8 секунд
      const timer = setTimeout(() => {
        onDismiss();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      high: 'Важно',
      medium: 'Средне',
      low: 'Инфо'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 bg-white rounded-lg shadow-xl border-2 ${getPriorityColor(recommendation.priority)} p-5 w-80 z-50 transition-all duration-300 transform ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-xl">{recommendation.icon}</div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{recommendation.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              {getPriorityBadge(recommendation.priority)}
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{recommendation.message}</p>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <p className="text-sm text-gray-700">
          💡 {recommendation.recommendation}
        </p>
      </div>
      
      <div className="flex items-center text-xs text-green-600 mb-3">
        <CheckCircle size={12} className="mr-1" />
        {recommendation.benefit}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onAction(recommendation.action)}
          className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          {recommendation.action}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
        >
          Позже
        </button>
      </div>
    </div>
  );
};