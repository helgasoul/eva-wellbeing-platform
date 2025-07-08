import React, { useState, useEffect } from 'react';
import { WearableData, WearableDevice } from '@/pages/patient/WearableDevices';
import { useAuth } from '@/context/AuthContext';
import { performWearableAnalysis, WearableInsight } from '@/utils/wearableAnalyzer';

interface WearableInsightsContentProps {
  data: WearableData[];
  devices: WearableDevice[];
}

export const WearableInsightsContent: React.FC<WearableInsightsContentProps> = ({
  data,
  devices
}) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<WearableInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (data.length > 0) {
      analyzeWearableData();
    }
  }, [data, user?.id]);

  const analyzeWearableData = async () => {
    if (!user?.id) return;
    
    setIsAnalyzing(true);
    try {
      // Получаем данные симптомов для корреляции
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user.id}`) || '[]');
      
      const wearableInsights = await performWearableAnalysis(data, symptomEntries);
      setInsights(wearableInsights);
    } catch (error) {
      console.error('Ошибка анализа данных носимых устройств:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (devices.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-gentle-float">🧠</div>
          <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
            Нет данных для анализа
          </h3>
          <p className="soft-text">
            Подключите носимое устройство для получения инсайтов
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return <WearableAnalysisLoading />;
  }

  return (
    <div className="space-y-6">
      
      {/* Ключевые инсайты */}
      <WearableKeyInsights insights={insights} />
      
      {/* Корреляции с симптомами менопаузы */}
      <WearableSymptomCorrelations insights={insights} />
      
      {/* Рекомендации по улучшению */}
      <WearableRecommendations insights={insights} />
      
      {/* Прогнозы и тренды */}
      <WearablePredictions data={data} />
    </div>
  );
};

// Компонент загрузки анализа
const WearableAnalysisLoading = () => (
  <div className="bloom-card bg-white/90 backdrop-blur-sm p-8">
    <div className="text-center">
      <div className="animate-spin text-4xl mb-4">🧠</div>
      <h3 className="text-lg font-playfair font-semibold gentle-text mb-2">
        Анализируем ваши данные...
      </h3>
      <p className="soft-text mb-4">
        Ищем корреляции между данными устройств и симптомами менопаузы
      </p>
      <div className="bg-bloom-vanilla rounded-full h-2 max-w-md mx-auto">
        <div className="bg-primary h-2 rounded-full animate-pulse w-3/4" />
      </div>
    </div>
  </div>
);

// Ключевые инсайты
const WearableKeyInsights = ({ insights }: { insights: WearableInsight[] }) => {
  const highPriorityInsights = insights.filter(i => i.priority === 'high');

  if (highPriorityInsights.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">
          🎯 Ключевые инсайты
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✨</div>
          <p className="soft-text">
            Пока недостаточно данных для выявления значимых закономерностей
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">
        🎯 Ключевые инсайты
      </h2>
      
      <div className="space-y-4">
        {highPriorityInsights.map(insight => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
};

// Карточка инсайта
const InsightCard = ({ insight }: { insight: WearableInsight }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '📊';
      default: return '';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${getPriorityColor(insight.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{insight.icon}</span>
          <div>
            <h3 className="font-semibold gentle-text">{insight.title}</h3>
            <div className="flex items-center space-x-2 text-xs mt-1">
              <span className={`px-2 py-1 rounded-full ${
                insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {insight.priority === 'high' ? 'Высокий приоритет' :
                 insight.priority === 'medium' ? 'Средний приоритет' : 'Низкий приоритет'}
              </span>
              <span className="soft-text">Уверенность: {insight.confidence}%</span>
              {insight.trend && (
                <span className="flex items-center">
                  {getTrendIcon(insight.trend)}
                  <span className="ml-1 soft-text capitalize">{insight.trend}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <p className="soft-text mb-4">{insight.description}</p>
      
      {insight.recommendations && insight.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium gentle-text mb-2">💡 Рекомендации:</h4>
          <ul className="space-y-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="text-sm soft-text flex items-start">
                <span className="mr-2 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Корреляции с симптомами
const WearableSymptomCorrelations = ({ insights }: { insights: WearableInsight[] }) => {
  const correlationInsights = insights.filter(i => i.correlation !== undefined);

  if (correlationInsights.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">
          🔗 Связи с симптомами менопаузы
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="soft-text">
            Добавьте больше записей симптомов для анализа корреляций
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">
        🔗 Связи с симптомами менопаузы
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {correlationInsights.map(insight => (
          <div key={insight.id} className="border border-bloom-caramel/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{insight.icon}</span>
              <div className="text-right">
                <div className={`text-sm font-bold ${
                  Math.abs(insight.correlation || 0) > 0.5 ? 'text-red-600' :
                  Math.abs(insight.correlation || 0) > 0.3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {Math.round(Math.abs(insight.correlation || 0) * 100)}% корреляция
                </div>
              </div>
            </div>
            <h4 className="font-semibold gentle-text mb-1">{insight.title}</h4>
            <p className="text-sm soft-text">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Рекомендации
const WearableRecommendations = ({ insights }: { insights: WearableInsight[] }) => {
  const actionableInsights = insights.filter(i => i.actionable && i.recommendations);

  if (actionableInsights.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">
          💡 Персональные рекомендации
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👍</div>
          <p className="soft-text">
            Отличная работа! Пока все показатели в норме
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">
        💡 Персональные рекомендации
      </h2>
      
      <div className="space-y-6">
        {actionableInsights.map(insight => (
          <div key={insight.id} className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold gentle-text mb-2 flex items-center">
              <span className="mr-2">{insight.icon}</span>
              {insight.title}
            </h3>
            <div className="space-y-2">
              {insight.recommendations?.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0" />
                  <span className="text-sm soft-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Прогнозы и тренды
const WearablePredictions = ({ data }: { data: WearableData[] }) => {
  if (data.length < 7) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">
          🔮 Прогнозы и тренды
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="soft-text">
            Нужно минимум 7 дней данных для построения прогнозов
          </p>
        </div>
      </div>
    );
  }

  // Простой анализ трендов
  const recentWeek = data.slice(-7);
  const previousWeek = data.slice(-14, -7);

  const calculateWeeklyAverage = (weekData: WearableData[], metric: string) => {
    if (weekData.length === 0) return 0;
    
    return weekData.reduce((sum, d) => {
      switch (metric) {
        case 'sleep':
          return sum + (d.sleep?.total_minutes || 0) / 60;
        case 'steps':
          return sum + (d.activity?.steps || 0);
        case 'hrv':
          return sum + (d.heart_rate?.variability || 0);
        default:
          return sum;
      }
    }, 0) / weekData.length;
  };

  const trends = [
    {
      metric: 'Качество сна',
      icon: '😴',
      current: calculateWeeklyAverage(recentWeek, 'sleep'),
      previous: calculateWeeklyAverage(previousWeek, 'sleep'),
      unit: 'ч',
      good: 7
    },
    {
      metric: 'Активность',
      icon: '👣',
      current: calculateWeeklyAverage(recentWeek, 'steps'),
      previous: calculateWeeklyAverage(previousWeek, 'steps'),
      unit: 'шагов',
      good: 8000
    },
    {
      metric: 'Восстановление',
      icon: '❤️',
      current: calculateWeeklyAverage(recentWeek, 'hrv'),
      previous: calculateWeeklyAverage(previousWeek, 'hrv'),
      unit: 'мс',
      good: 30
    }
  ];

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">
        🔮 Тренды за неделю
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trends.map((trend, index) => {
          const change = trend.current - trend.previous;
          const changePercent = trend.previous > 0 ? (change / trend.previous) * 100 : 0;
          const isImproving = change > 0;
          const isSignificant = Math.abs(changePercent) > 5;

          return (
            <div key={index} className="border border-bloom-caramel/20 rounded-lg p-4 text-center">
              <div className="text-3xl mb-2">{trend.icon}</div>
              <h3 className="font-semibold gentle-text mb-2">{trend.metric}</h3>
              
              <div className="text-2xl font-bold text-primary mb-1">
                {trend.current.toFixed(trend.unit === 'ч' ? 1 : 0)}{trend.unit}
              </div>
              
              {isSignificant && (
                <div className={`text-sm flex items-center justify-center ${
                  isImproving ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">
                    {isImproving ? '📈' : '📉'}
                  </span>
                  {Math.abs(changePercent).toFixed(0)}% 
                  {isImproving ? ' рост' : ' снижение'}
                </div>
              )}
              
              {!isSignificant && (
                <div className="text-sm text-gray-500">
                  📊 Стабильно
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>💡 Совет:</strong> Регулярное отслеживание этих метрик поможет лучше понять, 
          как ваш образ жизни влияет на симптомы менопаузы. Обратите внимание на дни с 
          лучшими показателями и постарайтесь воспроизвести условия, которые к ним привели.
        </div>
      </div>
    </div>
  );
};