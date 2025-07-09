import { BasicRecommendation, BasicRecommendationContext } from './basicRecommendationEngine';

interface AdvancedRecommendation extends BasicRecommendation {
  conditions: RecommendationCondition[];
  targetAudience: string[];
  effectiveness: number;
  category: 'meal' | 'hydration' | 'symptom' | 'deficiency' | 'lifestyle' | 'weather';
  timeRestrictions?: {
    minHour: number;
    maxHour: number;
  };
}

interface RecommendationCondition {
  type: 'time' | 'symptom' | 'meal_gap' | 'hydration' | 'weather' | 'subscription';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
}

interface AdvancedRecommendationContext extends BasicRecommendationContext {
  userProfile: {
    age: number;
    menopausePhase: string;
    subscriptionTier: string;
    deficiencies: string[];
  };
  weatherData?: {
    temperature: number;
    humidity: number;
  };
  recentSymptoms: Array<{
    name: string;
    severity: number;
    timestamp: Date;
  }>;
}

export class AdvancedRecommendationEngine {
  private static advancedRules: AdvancedRecommendation[] = [
    {
      id: 'menopause_specific_breakfast',
      conditions: [
        { type: 'time', value: { hour: 8 }, operator: 'greater_than' },
        { type: 'symptom', value: 'Приливы', operator: 'contains' }
      ],
      targetAudience: ['perimenopause', 'menopause'],
      effectiveness: 85,
      category: 'meal',
      timeRestrictions: { minHour: 7, maxHour: 11 },
      type: 'meal_reminder',
      priority: 'high',
      title: 'Завтрак против приливов',
      message: 'Специальный завтрак поможет снизить приливы',
      recommendation: 'Омлет с семенами льна богат фитоэстрогенами и снижает приливы на 30%',
      action: 'Приготовить сейчас',
      icon: '🥗',
      benefit: 'Снижение приливов на 30%',
      triggerTime: new Date()
    },

    {
      id: 'premium_deficiency_alert',
      conditions: [
        { type: 'subscription', value: 'plus', operator: 'equals' }
      ],
      targetAudience: ['plus', 'optimum'],
      effectiveness: 92,
      category: 'deficiency',
      type: 'symptom_tip',
      priority: 'high',
      title: 'Персональный анализ дефицитов',
      message: 'На основе ваших анализов обнаружены дефициты',
      recommendation: 'Витамин D ниже нормы - добавьте жирную рыбу 3 раза в неделю',
      action: 'Посмотреть план',
      icon: '🧪',
      benefit: 'Персонализированные рекомендации',
      triggerTime: new Date()
    },

    {
      id: 'weather_adaptation',
      conditions: [
        { type: 'weather', value: { humidity: 60 }, operator: 'greater_than' }
      ],
      targetAudience: ['all'],
      effectiveness: 70,
      category: 'weather',
      type: 'symptom_tip',
      priority: 'medium',
      title: 'Адаптация к погоде',
      message: 'Высокая влажность может усилить симптомы',
      recommendation: 'Пейте прохладную воду с огурцом и мятой',
      action: 'Узнать рецепт',
      icon: '🌧️',
      benefit: 'Снижение дискомфорта',
      triggerTime: new Date()
    },

    {
      id: 'sleep_optimization',
      conditions: [
        { type: 'time', value: { hour: 20 }, operator: 'greater_than' },
        { type: 'symptom', value: 'Нарушения сна', operator: 'contains' }
      ],
      targetAudience: ['all'],
      effectiveness: 78,
      category: 'lifestyle',
      timeRestrictions: { minHour: 19, maxHour: 22 },
      type: 'symptom_tip',
      priority: 'high',
      title: 'Подготовка ко сну',
      message: 'Время подготовиться к качественному сну',
      recommendation: 'Магний за 30 минут до сна улучшает качество сна на 40%',
      action: 'Напомнить о приеме',
      icon: '😴',
      benefit: 'Улучшение сна на 40%',
      triggerTime: new Date()
    },

    {
      id: 'stress_nutrition',
      conditions: [
        { type: 'symptom', value: 'Стресс', operator: 'contains' }
      ],
      targetAudience: ['all'],
      effectiveness: 73,
      category: 'symptom',
      type: 'symptom_tip',
      priority: 'medium',
      title: 'Питание при стрессе',
      message: 'Стресс влияет на гормональный баланс',
      recommendation: 'Темный шоколад (70%+ какао) снижает кортизол',
      action: 'Добавить в рацион',
      icon: '🍫',
      benefit: 'Снижение стресса',
      triggerTime: new Date()
    },

    {
      id: 'hydration_smart',
      conditions: [
        { type: 'hydration', value: 4, operator: 'less_than' },
        { type: 'time', value: { hour: 16 }, operator: 'greater_than' }
      ],
      targetAudience: ['all'],
      effectiveness: 85,
      category: 'hydration',
      type: 'hydration',
      priority: 'medium',
      title: 'Умное напоминание о воде',
      message: 'Недостаток воды может усилить симптомы',
      recommendation: 'Добавьте лимон и имбирь для дополнительных антиоксидантов',
      action: 'Выпить стакан',
      icon: '💧',
      benefit: 'Улучшение гидратации',
      triggerTime: new Date()
    }
  ];

  static generateAdvancedRecommendations(context: AdvancedRecommendationContext): AdvancedRecommendation[] {
    const recommendations: AdvancedRecommendation[] = [];
    const currentHour = context.currentTime.getHours();

    for (const rule of this.advancedRules) {
      // Проверка временных ограничений
      if (rule.timeRestrictions) {
        if (currentHour < rule.timeRestrictions.minHour || currentHour > rule.timeRestrictions.maxHour) {
          continue;
        }
      }

      // Проверка целевой аудитории
      if (!rule.targetAudience.includes('all') && 
          !rule.targetAudience.includes(context.userProfile.menopausePhase) &&
          !rule.targetAudience.includes(context.userProfile.subscriptionTier)) {
        continue;
      }

      // Проверка условий
      if (this.evaluateConditions(rule.conditions, context)) {
        recommendations.push({
          ...rule,
          triggerTime: new Date()
        });
      }
    }

    // Сортировка по эффективности и приоритету
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.effectiveness - a.effectiveness;
    });
  }

  private static evaluateConditions(conditions: RecommendationCondition[], context: AdvancedRecommendationContext): boolean {
    return conditions.every(condition => {
      switch (condition.type) {
        case 'time':
          const currentHour = context.currentTime.getHours();
          return currentHour >= condition.value.hour;
        
        case 'symptom':
          return context.primarySymptoms.includes(condition.value);
        
        case 'meal_gap':
          if (!context.lastMealTime) return false;
          const hoursSinceLastMeal = (context.currentTime.getTime() - context.lastMealTime.getTime()) / (1000 * 60 * 60);
          return hoursSinceLastMeal > condition.value;
        
        case 'hydration':
          switch (condition.operator) {
            case 'less_than':
              return context.waterIntake < condition.value;
            case 'greater_than':
              return context.waterIntake > condition.value;
            default:
              return false;
          }
        
        case 'weather':
          return context.weatherData && context.weatherData.humidity > condition.value.humidity;
        
        case 'subscription':
          return context.userProfile.subscriptionTier === condition.value;
        
        default:
          return false;
      }
    });
  }
}

export type { AdvancedRecommendation, AdvancedRecommendationContext, RecommendationCondition };