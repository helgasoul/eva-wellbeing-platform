interface CycleAnalysis {
  current_cycle: {
    start_date: string;
    day_of_cycle: number;
    estimated_length: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular';
    next_predicted_date?: string;
    confidence: number;
  };
  cycle_history: {
    average_length: number;
    shortest_cycle: number;
    longest_cycle: number;
    irregularity_score: number;
    trend: 'stable' | 'lengthening' | 'shortening' | 'irregular';
  };
  perimenopause_indicators: {
    missed_periods_count: number;
    cycle_variability: number;
    symptom_severity_trend: 'increasing' | 'stable' | 'decreasing';
    probable_stage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause';
  };
}

interface NutritionCorrelation {
  nutrient: string;
  correlation_strength: number;
  recommendations: string[];
}

interface ActivityCorrelation {
  activity_type: string;
  symptom_impact: {
    mood: number;
    energy: number;
  };
  recommendations: string[];
}

interface CycleInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'prediction' | 'recommendation' | 'warning';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  confidence: number; // 0-100
  based_on: string[];
  actionable: boolean;
  actions?: string[];
  icon: string;
}

interface CyclePrediction {
  id: string;
  title: string;
  description: string;
  timeframe: 'next_cycle' | 'next_month' | 'next_quarter';
  timeframe_label: string;
  probability: number; // 0-100
  influencing_factors: {
    name: string;
    impact: number; // -1 to 1
  }[];
}

export const analyzeCycleInsights = async (
  cycleAnalysis: CycleAnalysis | null,
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] }
): Promise<{ insights: CycleInsight[]; predictions: CyclePrediction[] }> => {
  
  const insights: CycleInsight[] = [];
  const predictions: CyclePrediction[] = [];
  
  if (!cycleAnalysis) {
    return { insights, predictions };
  }
  
  // 1. Анализ регулярности цикла
  if (cycleAnalysis.cycle_history.irregularity_score > 50) {
    insights.push({
      id: 'irregularity_high',
      type: 'warning',
      priority: 'high',
      title: 'Высокая нерегулярность цикла',
      description: `Ваши циклы варьируются от ${cycleAnalysis.cycle_history.shortest_cycle} до ${cycleAnalysis.cycle_history.longest_cycle} дней. Это может указывать на гормональные изменения.`,
      confidence: 85,
      based_on: ['длительность циклов', 'вариабельность'],
      actionable: true,
      actions: [
        'Обратитесь к гинекологу-эндокринологу',
        'Сдайте анализы на гормоны (ФСГ, ЛГ, эстрадиол)',
        'Ведите подробный дневник симптомов'
      ],
      icon: '⚠️'
    });
  }
  
  // 2. Анализ стадии перименопаузы
  if (cycleAnalysis.perimenopause_indicators.probable_stage === 'early_perimenopause') {
    insights.push({
      id: 'early_perimenopause',
      type: 'pattern',
      priority: 'medium',
      title: 'Ранние признаки перименопаузы',
      description: 'Анализ ваших данных указывает на начальную стадию перименопаузы. Это нормальный процесс, который обычно начинается в 40-45 лет.',
      confidence: 78,
      based_on: ['изменения цикла', 'возраст', 'симптомы'],
      actionable: true,
      actions: [
        'Изучите информацию о перименопаузе',
        'Обсудите с врачом возможности поддержки',
        'Начните принимать витамин D и кальций'
      ],
      icon: '🌸'
    });
  }
  
  // 3. Корреляции с питанием
  const strongNutritionCorrelations = correlations.nutrition.filter(c => c.correlation_strength > 0.6);
  if (strongNutritionCorrelations.length > 0) {
    const strongest = strongNutritionCorrelations[0];
    insights.push({
      id: 'nutrition_correlation',
      type: 'correlation',
      priority: 'medium',
      title: `${strongest.nutrient} влияет на ваш цикл`,
      description: `Обнаружена сильная связь между потреблением ${strongest.nutrient.toLowerCase()} и регулярностью вашего цикла.`,
      confidence: Math.round(strongest.correlation_strength * 100),
      based_on: ['дневник питания', 'данные цикла'],
      actionable: true,
      actions: strongest.recommendations.slice(0, 3),
      icon: '🍎'
    });
  }
  
  // 4. Корреляции с физической активностью
  const positiveActivityCorrelations = correlations.activity.filter(
    a => a.symptom_impact.mood > 0.5 || a.symptom_impact.energy > 0.5
  );
  if (positiveActivityCorrelations.length > 0) {
    const bestActivity = positiveActivityCorrelations[0];
    insights.push({
      id: 'activity_benefit',
      type: 'recommendation',
      priority: 'medium',
      title: `${bestActivity.activity_type} улучшает ваше состояние`,
      description: 'Данные показывают, что этот вид активности положительно влияет на ваше настроение и энергию во время цикла.',
      confidence: 82,
      based_on: ['трекер активности', 'симптомы', 'настроение'],
      actionable: true,
      actions: bestActivity.recommendations.slice(0, 3),
      icon: '🏃‍♀️'
    });
  }
  
  // 5. Паттерны пропущенных циклов
  if (cycleAnalysis.perimenopause_indicators.missed_periods_count > 2) {
    insights.push({
      id: 'missed_periods_pattern',
      type: 'pattern',
      priority: 'high',
      title: 'Участившиеся пропуски циклов',
      description: `За последнее время у вас было ${cycleAnalysis.perimenopause_indicators.missed_periods_count} пропущенных циклов. Это может указывать на прогрессирование перименопаузы.`,
      confidence: 88,
      based_on: ['пропущенные циклы', 'временные паттерны'],
      actionable: true,
      actions: [
        'Консультация с врачом для оценки гормонального статуса',
        'Обсуждение вариантов поддерживающей терапии',
        'Контроль плотности костной ткани'
      ],
      icon: '📅'
    });
  }
  
  // Генерация предсказаний
  
  // 1. Предсказание следующего цикла
  if (cycleAnalysis.current_cycle.confidence > 60) {
    const nextCycleProbability = Math.min(95, cycleAnalysis.current_cycle.confidence + 10);
    predictions.push({
      id: 'next_cycle_prediction',
      title: 'Следующая менструация',
      description: `На основе ваших данных, следующая менструация ожидается ${new Date(cycleAnalysis.current_cycle.next_predicted_date!).toLocaleDateString('ru-RU')}.`,
      timeframe: 'next_cycle',
      timeframe_label: 'Следующий цикл',
      probability: nextCycleProbability,
      influencing_factors: [
        { name: 'Регулярность циклов', impact: 0.6 },
        { name: 'Текущие симптомы', impact: 0.3 },
        { name: 'Стресс', impact: -0.2 }
      ]
    });
  }
  
  // 2. Предсказание симптомов
  if (cycleAnalysis.perimenopause_indicators.symptom_severity_trend === 'increasing') {
    predictions.push({
      id: 'symptom_progression',
      title: 'Усиление симптомов перименопаузы',
      description: 'Тренд показывает возможное усиление симптомов в ближайшие месяцы. Рекомендуется профилактическая подготовка.',
      timeframe: 'next_quarter',
      timeframe_label: 'Следующие 3 месяца',
      probability: 75,
      influencing_factors: [
        { name: 'Текущий тренд симптомов', impact: 0.8 },
        { name: 'Стадия перименопаузы', impact: 0.6 },
        { name: 'Образ жизни', impact: -0.4 }
      ]
    });
  }
  
  // 3. Предсказание эффективности изменений образа жизни
  if (correlations.nutrition.length > 0 || correlations.activity.length > 0) {
    predictions.push({
      id: 'lifestyle_impact',
      title: 'Улучшение от изменений в питании и активности',
      description: 'При следовании рекомендациям по питанию и физической активности ожидается улучшение симптомов.',
      timeframe: 'next_month',
      timeframe_label: 'Следующий месяц',
      probability: 70,
      influencing_factors: [
        { name: 'Соблюдение рекомендаций', impact: 0.9 },
        { name: 'Индивидуальная реакция', impact: 0.3 },
        { name: 'Внешние стрессы', impact: -0.3 }
      ]
    });
  }
  
  return { insights, predictions };
};

// Выявление персональных паттернов
export const identifyPersonalPatterns = (
  cycleAnalysis: CycleAnalysis | null,
  correlations: any
): any[] => {
  const patterns = [];
  
  if (!cycleAnalysis) return patterns;
  
  // Паттерн нерегулярности
  if (cycleAnalysis.cycle_history.irregularity_score > 30) {
    patterns.push({
      id: 'irregular_pattern',
      name: 'Нерегулярные циклы',
      description: 'Ваши циклы имеют тенденцию к нерегулярности, что характерно для перименопаузы',
      frequency: `Вариация: ±${Math.abs(cycleAnalysis.cycle_history.longest_cycle - cycleAnalysis.cycle_history.shortest_cycle)} дней`,
      icon: '📊'
    });
  }
  
  // Паттерн сезонности (если достаточно данных)
  patterns.push({
    id: 'seasonal_pattern',
    name: 'Сезонные изменения',
    description: 'Ваши симптомы могут усиливаться в определенные времена года',
    frequency: 'Требуется больше данных для точного анализа',
    icon: '🌦️'
  });
  
  // Паттерн стресса
  patterns.push({
    id: 'stress_pattern', 
    name: 'Влияние стресса',
    description: 'Стрессовые периоды влияют на регулярность вашего цикла',
    frequency: 'Наблюдается корреляция',
    icon: '😰'
  });
  
  return patterns;
};

// Генерация рекомендаций по оптимизации
export const generateOptimizationSuggestions = (
  insights: CycleInsight[],
  correlations: any
): any[] => {
  const optimizations = [
    {
      category: 'nutrition',
      icon: '🥗',
      title: 'Питание',
      suggestions: [
        'Увеличить потребление омега-3 жирных кислот',
        'Добавить больше железосодержащих продуктов',
        'Ограничить кофеин до 200 мг в день',
        'Включить фитоэстрогены (соя, льняное семя)'
      ],
      expected_impact: 'Улучшение регулярности цикла на 25-40%'
    },
    {
      category: 'activity',
      icon: '🏃‍♀️',
      title: 'Физическая активность',
      suggestions: [
        'Кардиотренировки 3-4 раза в неделю',
        'Йога для управления стрессом',
        'Силовые тренировки для костей',
        'Избегать переизбытка нагрузок'
      ],
      expected_impact: 'Снижение симптомов на 35-55%'
    },
    {
      category: 'lifestyle',
      icon: '🧘‍♀️',
      title: 'Образ жизни',
      suggestions: [
        'Поддерживать режим сна 7-9 часов',
        'Практиковать техники снятия стресса',
        'Ограничить алкоголь и курение',
        'Регулярные медицинские осмотры'
      ],
      expected_impact: 'Общее улучшение самочувствия на 30-50%'
    }
  ];
  
  return optimizations;
};