import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { performNutritionAnalysis } from '@/utils/nutritionAnalyzer';
import type { FoodEntry } from '@/pages/patient/NutritionTracker';
import type { NutritionInsight } from '@/utils/nutritionAnalyzer';

interface NutritionInsightsContentProps {
  entries: FoodEntry[];
}

export const NutritionInsightsContent: React.FC<NutritionInsightsContentProps> = ({ entries }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<NutritionInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeNutritionData();
  }, [entries]);

  const analyzeNutritionData = async () => {
    if (entries.length < 3) return;
    
    setIsAnalyzing(true);
    try {
      // Получаем данные симптомов для корреляции
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
      
      const nutritionInsights = await performNutritionAnalysis(entries, symptomEntries);
      setInsights(nutritionInsights);
    } catch (error) {
      console.error('Ошибка анализа питания:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return <NutritionAnalysisLoading />;
  }

  if (entries.length < 3) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
        <div className="text-6xl mb-4 animate-gentle-float">🧠</div>
        <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
          Недостаточно данных для анализа
        </h3>
        <p className="soft-text">
          Добавьте минимум 3 записи питания для получения персональных инсайтов
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Ключевые инсайты питания */}
      <NutritionKeyInsights insights={insights} />
      
      {/* Корреляции питания и симптомов */}
      <FoodSymptomCorrelations insights={insights} />
      
      {/* Анализ триггерных продуктов */}
      <TriggerFoodAnalysis entries={entries} />
      
      {/* Рекомендации по питанию */}
      <NutritionRecommendations insights={insights} />
      
      {/* Недостающие нутриенты */}
      <NutrientDeficiencyAnalysis entries={entries} />
    </div>
  );
};

// Компонент загрузки анализа
const NutritionAnalysisLoading = () => (
  <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
    <h3 className="text-lg font-semibold gentle-text mb-2">Анализируем ваше питание</h3>
    <p className="soft-text">Ищем корреляции между питанием и симптомами...</p>
  </div>
);

// Компонент ключевых инсайтов
const NutritionKeyInsights = ({ insights }: { insights: NutritionInsight[] }) => {
  const keyInsights = insights.filter(insight => insight.priority === 'high').slice(0, 3);

  if (keyInsights.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">🎯 Ключевые инсайты питания</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4 animate-gentle-float">🥗</div>
          <p className="soft-text">
            Добавьте больше записей питания для получения персональных инсайтов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">🎯 Ключевые инсайты питания</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {keyInsights.map(insight => (
          <NutritionInsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
};

// Карточка инсайта питания
const NutritionInsightCard = ({ insight }: { insight: NutritionInsight }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${getPriorityColor(insight.priority)}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{insight.icon}</div>
        <div className="text-xs bg-white rounded-full px-2 py-1">
          {insight.confidence}% уверенности
        </div>
      </div>
      
      <h3 className="font-semibold gentle-text mb-2">{insight.title}</h3>
      <p className="text-sm soft-text mb-3">{insight.description}</p>
      
      {insight.actionable && insight.recommendations && (
        <div className="space-y-1">
          <div className="text-xs font-medium gentle-text">Рекомендации:</div>
          {insight.recommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="flex items-start text-xs soft-text">
              <span className="text-green-500 mr-1">•</span>
              {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Корреляции питания и симптомов
const FoodSymptomCorrelations = ({ insights }: { insights: NutritionInsight[] }) => {
  const correlationInsights = insights.filter(insight => insight.type === 'correlation');

  if (correlationInsights.length === 0) return null;

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">🔗 Связи питания и симптомов</h2>
      
      <div className="space-y-4">
        {correlationInsights.map(insight => (
          <div key={insight.id} className="border border-bloom-cream rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold gentle-text flex items-center">
                <span className="text-xl mr-2">{insight.icon}</span>
                {insight.title}
              </h3>
              <div className="text-sm text-primary font-medium">
                {Math.abs(insight.correlation || 0) > 0.5 ? 'Сильная связь' : 'Умеренная связь'}
              </div>
            </div>
            <p className="text-sm soft-text mb-3">{insight.description}</p>
            {insight.recommendations && insight.recommendations.length > 0 && (
              <div className="space-y-1">
                {insight.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start text-sm">
                    <span className="text-primary mr-2">→</span>
                    <span className="gentle-text">{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Анализ триггерных продуктов
const TriggerFoodAnalysis = ({ entries }: { entries: FoodEntry[] }) => {
  const triggerAnalysis = React.useMemo(() => {
    const triggers = ['caffeine', 'alcohol', 'spicy', 'sugar', 'processed'];
    const analysis: Record<string, { frequency: number; lastUsed: string | null }> = {};

    triggers.forEach(trigger => {
      const entriesWithTrigger = entries.filter(entry => 
        Object.values(entry.meals).flat().some(meal => 
          meal.contains_trigger_foods.includes(trigger)
        )
      );
      
      analysis[trigger] = {
        frequency: (entriesWithTrigger.length / entries.length) * 100,
        lastUsed: entriesWithTrigger.length > 0 ? 
          entriesWithTrigger[entriesWithTrigger.length - 1].date : null
      };
    });

    return analysis;
  }, [entries]);

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">⚠️ Анализ триггерных продуктов</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(triggerAnalysis).map(([trigger, data]) => (
          <div key={trigger} className="border border-bloom-cream rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium gentle-text capitalize">
                {getTriggerInfo(trigger).emoji} {getTriggerInfo(trigger).name}
              </span>
              <span className={`text-sm font-medium ${
                data.frequency > 30 ? 'text-red-600' : 
                data.frequency > 15 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {data.frequency.toFixed(0)}%
              </span>
            </div>
            
            <div className="w-full bg-bloom-vanilla rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  data.frequency > 30 ? 'bg-red-500' : 
                  data.frequency > 15 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(data.frequency, 100)}%` }}
              />
            </div>
            
            <p className="text-xs soft-text">
              {data.lastUsed ? 
                `Последний раз: ${new Date(data.lastUsed + 'T00:00:00').toLocaleDateString('ru-RU')}` :
                'Не используется'
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Рекомендации по питанию
const NutritionRecommendations = ({ insights }: { insights: NutritionInsight[] }) => {
  const recommendations = insights
    .filter(insight => insight.type === 'recommendation' || insight.actionable)
    .slice(0, 5);

  if (recommendations.length === 0) return null;

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">💡 Персональные рекомендации</h2>
      
      <div className="space-y-3">
        {recommendations.map((insight, index) => (
          <div key={insight.id || index} className="flex items-start space-x-3 p-3 bg-bloom-vanilla rounded-lg">
            <div className="text-lg flex-shrink-0">{insight.icon}</div>
            <div className="flex-1">
              <h3 className="font-medium gentle-text mb-1">{insight.title}</h3>
              <p className="text-sm soft-text">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Анализ дефицита нутриентов
const NutrientDeficiencyAnalysis = ({ entries }: { entries: FoodEntry[] }) => {
  const deficiencies = React.useMemo(() => {
    const analysis = [];
    
    // Анализ категорий продуктов
    const categoryStats = {
      dairy: entries.filter(e => Object.values(e.meals).flat().some(m => m.category === 'dairy')).length,
      protein: entries.filter(e => Object.values(e.meals).flat().some(m => m.category === 'protein')).length,
      vegetables: entries.filter(e => Object.values(e.meals).flat().some(m => m.category === 'vegetables')).length,
      fruits: entries.filter(e => Object.values(e.meals).flat().some(m => m.category === 'fruits')).length
    };

    const totalDays = entries.length;

    Object.entries(categoryStats).forEach(([category, days]) => {
      const percentage = (days / totalDays) * 100;
      if (percentage < 60) {
        analysis.push({
          category,
          percentage,
          risk: percentage < 30 ? 'high' : 'medium'
        });
      }
    });

    return analysis;
  }, [entries]);

  if (deficiencies.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-playfair font-bold gentle-text mb-4">✅ Анализ нутриентов</h2>
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="soft-text">Отличная сбалансированность рациона!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">⚡ Возможные дефициты</h2>
      
      <div className="space-y-4">
        {deficiencies.map(deficiency => (
          <div key={deficiency.category} className={`border-2 rounded-lg p-4 ${
            deficiency.risk === 'high' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold gentle-text">
                {getNutrientInfo(deficiency.category).emoji} {getNutrientInfo(deficiency.category).name}
              </h3>
              <span className={`text-sm font-medium ${
                deficiency.risk === 'high' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {deficiency.percentage.toFixed(0)}% дней
              </span>
            </div>
            <p className="text-sm soft-text mb-3">
              {getNutrientInfo(deficiency.category).warning}
            </p>
            <div className="space-y-1">
              {getNutrientInfo(deficiency.category).recommendations.map((rec, index) => (
                <div key={index} className="flex items-start text-sm">
                  <span className="text-primary mr-2">•</span>
                  <span className="gentle-text">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Вспомогательные функции
const getTriggerInfo = (trigger: string) => {
  const info: Record<string, { emoji: string; name: string }> = {
    caffeine: { emoji: '☕', name: 'Кофеин' },
    alcohol: { emoji: '🍷', name: 'Алкоголь' },
    spicy: { emoji: '🌶️', name: 'Острое' },
    sugar: { emoji: '🍭', name: 'Сахар' },
    processed: { emoji: '🍟', name: 'Переработанное' }
  };
  return info[trigger] || { emoji: '⚠️', name: trigger };
};

const getNutrientInfo = (category: string) => {
  const info: Record<string, { emoji: string; name: string; warning: string; recommendations: string[] }> = {
    dairy: {
      emoji: '🦴',
      name: 'Кальций (молочные продукты)',
      warning: 'Низкое потребление кальция может увеличить риск остеопороза в менопаузе',
      recommendations: [
        'Включите творог, сыр, йогурт в ежедневный рацион',
        'Рассмотрите растительные альтернативы: кунжут, миндаль',
        'Обсудите с врачом прием кальция с витамином D3'
      ]
    },
    protein: {
      emoji: '💪',
      name: 'Белки',
      warning: 'Недостаток белка может привести к потере мышечной массы',
      recommendations: [
        'Добавьте рыбу, мясо, яйца в каждый основной прием пищи',
        'Включите растительные белки: бобовые, орехи',
        'Стремитесь к 1.2г белка на кг веса'
      ]
    },
    vegetables: {
      emoji: '🥗',
      name: 'Овощи и клетчатка',
      warning: 'Мало овощей означает недостаток витаминов и клетчатки',
      recommendations: [
        'Добавляйте овощи в каждый прием пищи',
        'Стремитесь к 5-7 порциям овощей в день',
        'Включите зеленые листовые овощи для фолиевой кислоты'
      ]
    },
    fruits: {
      emoji: '🍎',
      name: 'Фрукты и антиоксиданты',
      warning: 'Недостаток фруктов снижает поступление антиоксидантов',
      recommendations: [
        'Ешьте 2-3 порции фруктов в день',
        'Выбирайте разноцветные фрукты для разнообразия витаминов',
        'Отдавайте предпочтение свежим фруктам, а не сокам'
      ]
    }
  };
  return info[category] || { emoji: '❓', name: category, warning: '', recommendations: [] };
};