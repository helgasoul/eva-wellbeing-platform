import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';

interface NutritionTrendsContentProps {
  entries: FoodEntry[];
}

export const NutritionTrendsContent: React.FC<NutritionTrendsContentProps> = ({ entries }) => {
  const trends = useMemo(() => {
    if (entries.length < 3) return null;

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    
    // Анализ трендов
    const waterTrend = calculateTrend(sortedEntries.map(e => e.water_intake));
    const energyTrend = calculateAverageEnergyTrend(sortedEntries);
    const digestiveTrend = calculateTrend(sortedEntries.map(e => e.digestive_comfort));
    const mealConsistencyTrend = calculateMealConsistencyTrend(sortedEntries);

    return {
      water: waterTrend,
      energy: energyTrend,
      digestive: digestiveTrend,
      consistency: mealConsistencyTrend,
      totalDays: entries.length,
      dateRange: {
        start: sortedEntries[0]?.date,
        end: sortedEntries[sortedEntries.length - 1]?.date
      }
    };
  }, [entries]);

  if (!trends) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
        <div className="text-6xl mb-4 animate-gentle-float">📈</div>
        <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
          Недостаточно данных для анализа трендов
        </h3>
        <p className="soft-text">
          Добавьте минимум 3 записи питания для отслеживания трендов
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Заголовок с периодом */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-playfair font-bold gentle-text flex items-center">
              <BarChart3 className="h-5 w-5 text-primary mr-2" />
              Тренды питания
            </h2>
            <p className="text-sm soft-text mt-1">
              Анализ за период с {new Date(trends.dateRange.start + 'T00:00:00').toLocaleDateString('ru-RU')} 
              по {new Date(trends.dateRange.end + 'T00:00:00').toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{trends.totalDays}</div>
            <div className="text-sm soft-text">дней</div>
          </div>
        </div>
      </div>

      {/* Ключевые тренды */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Тренд потребления воды */}
        <TrendCard
          title="💧 Потребление воды"
          value={`${trends.water.average.toFixed(1)}л`}
          trend={trends.water.direction}
          change={`${trends.water.change > 0 ? '+' : ''}${trends.water.change.toFixed(1)}л`}
          description={`Средний объем за период. ${getTrendDescription(trends.water.direction, 'water')}`}
        />

        {/* Тренд энергии */}
        <TrendCard
          title="⚡ Уровень энергии"
          value={`${trends.energy.average.toFixed(1)}/5`}
          trend={trends.energy.direction}
          change={`${trends.energy.change > 0 ? '+' : ''}${trends.energy.change.toFixed(1)}`}
          description={`Средняя энергия за день. ${getTrendDescription(trends.energy.direction, 'energy')}`}
        />

        {/* Тренд пищеварения */}
        <TrendCard
          title="🫄 Пищеварительный комфорт"
          value={`${trends.digestive.average.toFixed(1)}/5`}
          trend={trends.digestive.direction}
          change={`${trends.digestive.change > 0 ? '+' : ''}${trends.digestive.change.toFixed(1)}`}
          description={`Комфорт пищеварения. ${getTrendDescription(trends.digestive.direction, 'digestive')}`}
        />

        {/* Тренд регулярности */}
        <TrendCard
          title="📅 Регулярность питания"
          value={`${trends.consistency.average.toFixed(1)}`}
          trend={trends.consistency.direction}
          change={`${trends.consistency.change > 0 ? '+' : ''}${trends.consistency.change.toFixed(1)}`}
          description={`Приемов пищи в день. ${getTrendDescription(trends.consistency.direction, 'consistency')}`}
        />
      </div>

      {/* Детальная аналитика */}
      <NutritionDetailedAnalysis entries={entries} />
    </div>
  );
};

// Компонент карточки тренда
const TrendCard = ({ 
  title, 
  value, 
  trend, 
  change, 
  description 
}: {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
  description: string;
}) => {
  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold gentle-text">{title}</h3>
        <div className="flex items-center space-x-1">
          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          {trend === 'stable' && <span className="text-gray-400">━</span>}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change}
          </span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-primary mb-2">{value}</div>
      <p className="text-sm soft-text">{description}</p>
    </div>
  );
};

// Детальная аналитика
const NutritionDetailedAnalysis = ({ entries }: { entries: FoodEntry[] }) => {
  const categoryAnalysis = useMemo(() => {
    const categories = ['protein', 'vegetables', 'fruits', 'dairy', 'grains', 'fats'] as const;
    const analysis: Record<string, { count: number; percentage: number }> = {};

    categories.forEach(category => {
      const daysWithCategory = entries.filter(entry => 
        Object.values(entry.meals).flat().some(meal => meal.category === category)
      ).length;
      
      analysis[category] = {
        count: daysWithCategory,
        percentage: Math.round((daysWithCategory / entries.length) * 100)
      };
    });

    return analysis;
  }, [entries]);

  const triggerAnalysis = useMemo(() => {
    const triggers = ['caffeine', 'alcohol', 'spicy', 'sugar', 'processed'] as const;
    const analysis: Record<string, { count: number; percentage: number }> = {};

    triggers.forEach(trigger => {
      const daysWithTrigger = entries.filter(entry => 
        Object.values(entry.meals).flat().some(meal => 
          meal.contains_trigger_foods.includes(trigger)
        )
      ).length;
      
      analysis[trigger] = {
        count: daysWithTrigger,
        percentage: Math.round((daysWithTrigger / entries.length) * 100)
      };
    });

    return analysis;
  }, [entries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Анализ категорий продуктов */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <h3 className="font-semibold gentle-text mb-4">🥗 Категории продуктов</h3>
        <div className="space-y-3">
          {Object.entries(categoryAnalysis).map(([category, data]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm gentle-text capitalize">
                {getCategoryEmoji(category)} {getCategoryName(category)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-bloom-vanilla rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary w-10 text-right">
                  {data.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Анализ триггерных продуктов */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <h3 className="font-semibold gentle-text mb-4">⚠️ Триггерные продукты</h3>
        <div className="space-y-3">
          {Object.entries(triggerAnalysis).map(([trigger, data]) => (
            <div key={trigger} className="flex items-center justify-between">
              <span className="text-sm gentle-text capitalize">
                {getTriggerEmoji(trigger)} {getTriggerName(trigger)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-bloom-vanilla rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-orange-600 w-10 text-right">
                  {data.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Вспомогательные функции
const calculateTrend = (values: number[]) => {
  if (values.length < 2) return { direction: 'stable' as const, change: 0, average: 0 };
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const firstHalf = values.slice(0, Math.ceil(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const change = secondAvg - firstAvg;
  const direction = Math.abs(change) < 0.1 ? 'stable' : change > 0 ? 'up' : 'down';
  
  return { direction, change, average };
};

const calculateAverageEnergyTrend = (entries: FoodEntry[]) => {
  const dailyAverages = entries.map(entry => {
    const levels = Object.values(entry.energy_levels);
    return levels.reduce((sum, level) => sum + level, 0) / levels.length;
  });
  
  return calculateTrend(dailyAverages);
};

const calculateMealConsistencyTrend = (entries: FoodEntry[]) => {
  const dailyMealCounts = entries.map(entry => 
    Object.values(entry.meals).flat().length
  );
  
  return calculateTrend(dailyMealCounts);
};

const getTrendDescription = (direction: string, type: string) => {
  const descriptions = {
    water: {
      up: 'Увеличивается гидратация 📈',
      down: 'Снижается потребление воды 📉',
      stable: 'Стабильный уровень 📊'
    },
    energy: {
      up: 'Энергия растет 🚀',
      down: 'Энергия снижается 📉',
      stable: 'Стабильная энергия 📊'
    },
    digestive: {
      up: 'Улучшается пищеварение 📈',
      down: 'Ухудшается комфорт 📉',
      stable: 'Стабильное состояние 📊'
    },
    consistency: {
      up: 'Больше приемов пищи 📈',
      down: 'Реже едите 📉',
      stable: 'Регулярный режим 📊'
    }
  };
  
  return descriptions[type as keyof typeof descriptions]?.[direction as keyof typeof descriptions.water] || '';
};

const getCategoryEmoji = (category: string) => {
  const emojis: Record<string, string> = {
    protein: '🥩',
    vegetables: '🥕',
    fruits: '🍎',
    dairy: '🥛',
    grains: '🌾',
    fats: '🥑'
  };
  return emojis[category] || '🍽️';
};

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    protein: 'Белки',
    vegetables: 'Овощи',
    fruits: 'Фрукты',
    dairy: 'Молочные',
    grains: 'Злаки',
    fats: 'Жиры'
  };
  return names[category] || category;
};

const getTriggerEmoji = (trigger: string) => {
  const emojis: Record<string, string> = {
    caffeine: '☕',
    alcohol: '🍷',
    spicy: '🌶️',
    sugar: '🍭',
    processed: '🍟'
  };
  return emojis[trigger] || '⚠️';
};

const getTriggerName = (trigger: string) => {
  const names: Record<string, string> = {
    caffeine: 'Кофеин',
    alcohol: 'Алкоголь',
    spicy: 'Острое',
    sugar: 'Сахар',
    processed: 'Переработанное'
  };
  return names[trigger] || trigger;
};