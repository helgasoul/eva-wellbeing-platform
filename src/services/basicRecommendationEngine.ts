interface BasicRecommendation {
  id: string;
  type: 'meal_reminder' | 'hydration' | 'symptom_tip' | 'timing';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  recommendation: string;
  action: string;
  icon: string;
  category: string;
  benefit: string;
  triggerTime: Date;
}

interface BasicRecommendationContext {
  currentTime: Date;
  lastMealTime?: Date;
  todaysMeals: string[];
  primarySymptoms: string[];
  waterIntake: number;
}

export class BasicRecommendationEngine {
  private static basicRules = [
    // Утренние рекомендации
    {
      id: 'morning_breakfast',
      condition: (context: BasicRecommendationContext) => {
        const hour = context.currentTime.getHours();
        return hour >= 8 && hour <= 10 && !context.todaysMeals.includes('breakfast');
      },
      recommendation: {
        type: 'meal_reminder' as const,
        priority: 'high' as const,
        title: 'Время завтрака!',
        message: 'Начните день с полезного завтрака',
        recommendation: 'Попробуйте омлет с авокадо - это поддержит энергию на весь день',
        action: 'Посмотреть рецепт',
        icon: '🌅',
        category: 'timing',
        benefit: 'Стабилизация энергии'
      }
    },

    // Напоминания о воде
    {
      id: 'hydration_reminder',
      condition: (context: BasicRecommendationContext) => {
        return context.waterIntake < 4;
      },
      recommendation: {
        type: 'hydration' as const,
        priority: 'medium' as const,
        title: 'Не забывайте пить воду',
        message: 'Сегодня выпито недостаточно воды',
        recommendation: 'Добавьте лимон в воду для вкуса и витаминов',
        action: 'Отметить стакан',
        icon: '💧',
        category: 'hydration',
        benefit: 'Улучшение самочувствия'
      }
    },

    // Рекомендации при приливах
    {
      id: 'hot_flashes_tip',
      condition: (context: BasicRecommendationContext) => {
        return context.primarySymptoms.includes('Приливы');
      },
      recommendation: {
        type: 'symptom_tip' as const,
        priority: 'high' as const,
        title: 'Совет при приливах',
        message: 'Охлаждающие продукты помогут снизить приливы',
        recommendation: 'Попробуйте зеленый чай с мятой или огуречную воду',
        action: 'Узнать больше',
        icon: '🌿',
        category: 'symptoms',
        benefit: 'Снижение приливов'
      }
    },

    // Обеденные напоминания
    {
      id: 'lunch_reminder',
      condition: (context: BasicRecommendationContext) => {
        const hour = context.currentTime.getHours();
        return hour >= 12 && hour <= 14 && !context.todaysMeals.includes('lunch');
      },
      recommendation: {
        type: 'meal_reminder' as const,
        priority: 'medium' as const,
        title: 'Время обеда',
        message: 'Не пропускайте обед для поддержания энергии',
        recommendation: 'Сбалансированный обед поможет избежать вечерних перекусов',
        action: 'Выбрать обед',
        icon: '🍽️',
        category: 'timing',
        benefit: 'Поддержание энергии'
      }
    },

    // Вечерние рекомендации
    {
      id: 'evening_routine',
      condition: (context: BasicRecommendationContext) => {
        const hour = context.currentTime.getHours();
        return hour >= 18 && hour <= 20;
      },
      recommendation: {
        type: 'timing' as const,
        priority: 'low' as const,
        title: 'Вечерняя рутина',
        message: 'Время подготовки к спокойному вечеру',
        recommendation: 'Легкий ужин за 3 часа до сна улучшит качество сна',
        action: 'Посмотреть ужины',
        icon: '🌙',
        category: 'evening',
        benefit: 'Улучшение сна'
      }
    },

    // Перекусы
    {
      id: 'snack_reminder',
      condition: (context: BasicRecommendationContext) => {
        if (!context.lastMealTime) return false;
        const hoursSinceLastMeal = (context.currentTime.getTime() - context.lastMealTime.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastMeal > 4;
      },
      recommendation: {
        type: 'meal_reminder' as const,
        priority: 'medium' as const,
        title: 'Время перекуса',
        message: 'Прошло более 4 часов с последнего приема пищи',
        recommendation: 'Здоровый перекус поддержит уровень сахара в крови',
        action: 'Выбрать перекус',
        icon: '🍎',
        category: 'timing',
        benefit: 'Стабилизация сахара'
      }
    }
  ];

  static generateRecommendations(context: BasicRecommendationContext): BasicRecommendation[] {
    const recommendations: BasicRecommendation[] = [];

    for (const rule of this.basicRules) {
      if (rule.condition(context)) {
        recommendations.push({
          id: rule.id,
          ...rule.recommendation,
          triggerTime: new Date()
        });
      }
    }

    // Сортировка по приоритету
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static getRecommendationIcon(iconName: string): string {
    const icons = {
      '🌅': 'sunrise',
      '💧': 'droplet',
      '🌿': 'leaf',
      '🍽️': 'utensils',
      '🌙': 'moon',
      '🍎': 'apple'
    };
    return icons[iconName] || 'lightbulb';
  }
}

export type { BasicRecommendation, BasicRecommendationContext };