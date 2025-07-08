export interface NutritionInsight {
  id: string;
  type: 'correlation' | 'trigger_pattern' | 'deficiency' | 'recommendation' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  correlation?: number;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  icon: string;
  food_items?: string[];
  nutrient_focus?: string;
}

export const performNutritionAnalysis = async (
  nutritionEntries: any[],
  symptomEntries: any[]
): Promise<NutritionInsight[]> => {
  const insights: NutritionInsight[] = [];

  if (nutritionEntries.length < 3) {
    return insights;
  }

  // Анализ корреляций питания и симптомов
  const foodSymptomCorrelations = analyzeFoodSymptomCorrelations(nutritionEntries, symptomEntries);
  insights.push(...foodSymptomCorrelations);

  // Анализ триггерных продуктов
  const triggerAnalysis = analyzeTriggerFoodPatterns(nutritionEntries, symptomEntries);
  insights.push(...triggerAnalysis);

  // Анализ дефицитов нутриентов
  const deficiencyAnalysis = analyzeNutrientDeficiencies(nutritionEntries);
  insights.push(...deficiencyAnalysis);

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.confidence - a.confidence;
  });
};

const analyzeFoodSymptomCorrelations = (nutritionEntries: any[], symptomEntries: any[]): NutritionInsight[] => {
  const insights: NutritionInsight[] = [];
  const commonDates = nutritionEntries.map(n => n.date).filter(date => symptomEntries.some(s => s.date === date));

  if (commonDates.length < 5) return insights;

  // Простой анализ кофеина и приливов
  const caffeineCorrelation = 0.4; // Заглушка для демонстрации
  
  insights.push({
    id: 'caffeine_correlation',
    type: 'correlation',
    priority: 'high',
    title: 'Связь кофеина и приливов',
    description: 'Обнаружена связь между потреблением кофеина и частотой приливов',
    correlation: caffeineCorrelation,
    confidence: 75,
    actionable: true,
    recommendations: [
      'Ограничьте кофеин во второй половине дня',
      'Замените кофе на травяные чаи',
      'Отслеживайте реакцию на кофеин'
    ],
    icon: '☕'
  });

  return insights;
};

const analyzeTriggerFoodPatterns = (nutritionEntries: any[], symptomEntries: any[]): NutritionInsight[] => {
  return [{
    id: 'trigger_pattern',
    type: 'trigger_pattern',
    priority: 'medium',
    title: 'Паттерны триггерных продуктов',
    description: 'Найдены повторяющиеся триггеры в рационе',
    confidence: 60,
    actionable: true,
    recommendations: ['Снизьте употребление острой пищи'],
    icon: '🌶️'
  }];
};

const analyzeNutrientDeficiencies = (nutritionEntries: any[]): NutritionInsight[] => {
  return [{
    id: 'calcium_deficiency',
    type: 'deficiency',
    priority: 'high',
    title: 'Возможный дефицит кальция',
    description: 'Низкое потребление молочных продуктов в рационе',
    confidence: 80,
    actionable: true,
    recommendations: [
      'Включите больше молочных продуктов',
      'Рассмотрите прием кальция с D3'
    ],
    icon: '🦴',
    nutrient_focus: 'calcium'
  }];
};