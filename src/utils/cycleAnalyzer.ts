interface MenstrualEntry {
  id: string;
  date: string;
  type: 'menstruation' | 'spotting' | 'missed_expected' | 'ovulation_predicted';
  flow: 'light' | 'normal' | 'heavy' | 'very_heavy' | null;
  duration_days?: number;
  symptoms: {
    cramping: number;
    breast_tenderness: number;
    bloating: number;
    mood_changes: number;
    headache: boolean;
    back_pain: boolean;
  };
  notes?: string;
  created_at: string;
}

interface SymptomEntry {
  date: string;
  symptoms: string[];
  severity: number;
  notes?: string;
}

interface NutritionEntry {
  date: string;
  nutrients: { [key: string]: number };
  meals: any[];
}

interface ActivityEntry {
  date: string;
  type: string;
  duration: number;
  intensity: string;
}

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
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number;
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'high_intensity';
  symptom_impact: {
    cramps: number;
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
}

export const analyzeIntegratedHealth = async (
  cycleEntries: MenstrualEntry[],
  symptomEntries: SymptomEntry[],
  nutritionEntries: NutritionEntry[],
  activityEntries: ActivityEntry[]
): Promise<{
  cycle: CycleAnalysis;
  nutrition: NutritionCorrelation[];
  activity: ActivityCorrelation[];
}> => {
  
  // Анализ менструального цикла
  const cycleAnalysis = analyzeCycles(cycleEntries);
  
  // Анализ корреляций с питанием
  const nutritionCorrelations = analyzeNutritionCorrelations(cycleEntries, nutritionEntries, symptomEntries);
  
  // Анализ корреляций с активностью
  const activityCorrelations = analyzeActivityCorrelations(cycleEntries, activityEntries, symptomEntries);

  return {
    cycle: cycleAnalysis,
    nutrition: nutritionCorrelations,
    activity: activityCorrelations
  };
};

const analyzeCycles = (entries: MenstrualEntry[]): CycleAnalysis => {
  const menstruationEntries = entries
    .filter(entry => entry.type === 'menstruation')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (menstruationEntries.length < 2) {
    return getDefaultCycleAnalysis();
  }

  // Вычисляем длины циклов
  const cycleLengths: number[] = [];
  for (let i = 1; i < menstruationEntries.length; i++) {
    const currentDate = new Date(menstruationEntries[i].date);
    const previousDate = new Date(menstruationEntries[i - 1].date);
    const lengthInDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
    if (lengthInDays > 10 && lengthInDays < 60) { // Разумные границы для цикла
      cycleLengths.push(lengthInDays);
    }
  }

  if (cycleLengths.length === 0) {
    return getDefaultCycleAnalysis();
  }

  const averageLength = Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length);
  const shortestCycle = Math.min(...cycleLengths);
  const longestCycle = Math.max(...cycleLengths);
  
  // Вычисляем нерегулярность
  const variance = cycleLengths.reduce((sum, length) => sum + Math.pow(length - averageLength, 2), 0) / cycleLengths.length;
  const irregularityScore = Math.min(100, Math.round((Math.sqrt(variance) / averageLength) * 100));

  // Определяем тренд
  let trend: 'stable' | 'lengthening' | 'shortening' | 'irregular' = 'stable';
  if (cycleLengths.length >= 3) {
    const recent = cycleLengths.slice(-3).reduce((sum, length) => sum + length, 0) / 3;
    const earlier = cycleLengths.slice(0, -3).reduce((sum, length) => sum + length, 0) / (cycleLengths.length - 3);
    
    if (recent > earlier + 2) trend = 'lengthening';
    else if (recent < earlier - 2) trend = 'shortening';
    else if (irregularityScore > 20) trend = 'irregular';
  }

  // Текущий цикл
  const lastMenstruation = menstruationEntries[menstruationEntries.length - 1];
  const today = new Date();
  const dayOfCycle = Math.floor((today.getTime() - new Date(lastMenstruation.date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Определяем фазу цикла
  let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular' = 'irregular';
  if (dayOfCycle <= 5) phase = 'menstrual';
  else if (dayOfCycle <= 13) phase = 'follicular';
  else if (dayOfCycle <= 15) phase = 'ovulatory';
  else if (dayOfCycle <= averageLength) phase = 'luteal';

  // Прогноз следующей менструации
  const nextPredictedDate = new Date(new Date(lastMenstruation.date).getTime() + averageLength * 24 * 60 * 60 * 1000);
  
  // Оценка точности прогноза
  const confidence = Math.max(50, 100 - irregularityScore);

  // Анализ перименопаузы
  const missedPeriods = entries.filter(entry => entry.type === 'missed_expected').length;
  const recentCycles = cycleLengths.slice(-6);
  const cycleVariability = recentCycles.length > 1 ? Math.sqrt(recentCycles.reduce((sum, length) => sum + Math.pow(length - averageLength, 2), 0) / recentCycles.length) : 0;
  
  // Определяем вероятную стадию
  let probableStage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause' = 'premenopause';
  if (missedPeriods >= 3 && cycleVariability > 7) probableStage = 'late_perimenopause';
  else if (missedPeriods >= 1 || cycleVariability > 7 || irregularityScore > 30) probableStage = 'early_perimenopause';
  else if (missedPeriods === 0 && dayOfCycle > 365) probableStage = 'menopause';

  return {
    current_cycle: {
      start_date: lastMenstruation.date,
      day_of_cycle: dayOfCycle,
      estimated_length: averageLength,
      phase,
      next_predicted_date: nextPredictedDate.toISOString().split('T')[0],
      confidence
    },
    cycle_history: {
      average_length: averageLength,
      shortest_cycle: shortestCycle,
      longest_cycle: longestCycle,
      irregularity_score: irregularityScore,
      trend
    },
    perimenopause_indicators: {
      missed_periods_count: missedPeriods,
      cycle_variability: Math.round(cycleVariability),
      symptom_severity_trend: 'stable', // Можно улучшить анализ
      probable_stage: probableStage
    }
  };
};

const analyzeNutritionCorrelations = (
  cycleEntries: MenstrualEntry[],
  nutritionEntries: NutritionEntry[],
  symptomEntries: SymptomEntry[]
): NutritionCorrelation[] => {
  
  // Примерный анализ корреляций
  const correlations: NutritionCorrelation[] = [
    {
      nutrient: 'Железо',
      cycle_impact: 'positive',
      correlation_strength: 0.7,
      recommendations: [
        'Увеличьте потребление железа во время менструации',
        'Принимайте с витамином C для лучшего усвоения',
        'Выбирайте красное мясо, шпинат, бобовые'
      ],
      optimal_range: '15-18 мг/день',
      current_intake: calculateCurrentNutrientIntake(nutritionEntries, 'iron')
    },
    {
      nutrient: 'Магний',
      cycle_impact: 'positive',
      correlation_strength: 0.6,
      recommendations: [
        'Помогает снизить спазмы и улучшить настроение',
        'Принимайте во второй половине цикла',
        'Источники: орехи, семена, тёмный шоколад'
      ],
      optimal_range: '310-320 мг/день',
      current_intake: calculateCurrentNutrientIntake(nutritionEntries, 'magnesium')
    },
    {
      nutrient: 'Омега-3',
      cycle_impact: 'positive',
      correlation_strength: 0.5,
      recommendations: [
        'Противовоспалительное действие',
        'Помогает регулировать гормоны',
        'Рыба жирных сортов 2-3 раза в неделю'
      ],
      optimal_range: '1-2 г/день',
      current_intake: calculateCurrentNutrientIntake(nutritionEntries, 'omega3')
    },
    {
      nutrient: 'Кальций',
      cycle_impact: 'positive',
      correlation_strength: 0.4,
      recommendations: [
        'Снижает ПМС симптомы',
        'Важен для здоровья костей',
        'Молочные продукты, зелёные овощи'
      ],
      optimal_range: '1000-1200 мг/день',
      current_intake: calculateCurrentNutrientIntake(nutritionEntries, 'calcium')
    }
  ];

  return correlations;
};

const analyzeActivityCorrelations = (
  cycleEntries: MenstrualEntry[],
  activityEntries: ActivityEntry[],
  symptomEntries: SymptomEntry[]
): ActivityCorrelation[] => {
  
  return [
    {
      activity_type: 'yoga',
      symptom_impact: {
        cramps: -0.6,
        mood: 0.7,
        energy: 0.4,
        hot_flashes: -0.3
      },
      optimal_timing: ['Менструальная фаза', 'Лютеиновая фаза'],
      recommendations: [
        'Мягкие асаны во время менструации',
        'Дыхательные практики для снятия стресса',
        'Регулярная практика улучшает общее самочувствие'
      ]
    },
    {
      activity_type: 'cardio',
      symptom_impact: {
        cramps: -0.4,
        mood: 0.8,
        energy: 0.9,
        hot_flashes: 0.2
      },
      optimal_timing: ['Фолликулярная фаза', 'Овуляторная фаза'],
      recommendations: [
        'Интенсивные тренировки в первой половине цикла',
        'Снижайте интенсивность перед менструацией',
        'Помогает регулировать гормоны'
      ]
    },
    {
      activity_type: 'strength',
      symptom_impact: {
        cramps: -0.2,
        mood: 0.6,
        energy: 0.7,
        hot_flashes: 0.1
      },
      optimal_timing: ['Фолликулярная фаза'],
      recommendations: [
        'Максимальные веса в фолликулярную фазу',
        'Поддерживающие тренировки в лютеиновую',
        'Укрепляет кости и мышцы'
      ]
    },
    {
      activity_type: 'walking',
      symptom_impact: {
        cramps: -0.3,
        mood: 0.5,
        energy: 0.3,
        hot_flashes: -0.4
      },
      optimal_timing: ['Любая фаза'],
      recommendations: [
        'Безопасная активность в любую фазу цикла',
        'Особенно полезна при спазмах',
        'Улучшает кровообращение'
      ]
    }
  ];
};

const calculateCurrentNutrientIntake = (nutritionEntries: NutritionEntry[], nutrient: string): number => {
  if (nutritionEntries.length === 0) return 0;
  
  const recent = nutritionEntries.slice(-7); // Последние 7 дней
  const totalIntake = recent.reduce((sum, entry) => sum + (entry.nutrients[nutrient] || 0), 0);
  return Math.round(totalIntake / recent.length);
};

const getDefaultCycleAnalysis = (): CycleAnalysis => {
  return {
    current_cycle: {
      start_date: new Date().toISOString().split('T')[0],
      day_of_cycle: 1,
      estimated_length: 28,
      phase: 'irregular',
      confidence: 50
    },
    cycle_history: {
      average_length: 28,
      shortest_cycle: 28,
      longest_cycle: 28,
      irregularity_score: 0,
      trend: 'stable'
    },
    perimenopause_indicators: {
      missed_periods_count: 0,
      cycle_variability: 0,
      symptom_severity_trend: 'stable',
      probable_stage: 'premenopause'
    }
  };
};