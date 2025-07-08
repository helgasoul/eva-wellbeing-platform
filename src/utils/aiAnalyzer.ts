import { format, subDays, parseISO } from 'date-fns';

interface HealthInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'prediction' | 'recommendation' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionable: boolean;
  actions?: string[];
  confidence: number; // 0-100%
  trend?: 'improving' | 'stable' | 'declining';
  icon: string;
}

interface HealthScore {
  overall: number; // 0-100
  categories: {
    symptoms: number;
    sleep: number;
    mood: number;
    energy: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  weeklyChange: number;
}

interface SymptomTrend {
  symptom: string;
  current_week: number;
  previous_week: number;
  trend: 'improving' | 'worsening' | 'stable';
  pattern: string;
  recommendations: string[];
}

interface Prediction {
  type: string;
  target: string;
  value: number;
  confidence: number;
  description: string;
}

interface AnalysisResult {
  healthScore: HealthScore;
  insights: HealthInsight[];
  trends: SymptomTrend[];
  predictions: Prediction[];
}

export const performAIAnalysis = (
  onboarding: any,
  symptoms: any[],
  chat: any[],
  period: 'week' | 'month' | 'quarter'
): AnalysisResult => {
  
  // Фильтруем данные по периоду
  const daysToAnalyze = period === 'week' ? 7 : period === 'month' ? 30 : 90;
  const cutoffDate = format(subDays(new Date(), daysToAnalyze), 'yyyy-MM-dd');
  const recentSymptoms = symptoms.filter(s => s.date >= cutoffDate);

  // Анализируем health score
  const healthScore = calculateHealthScore(recentSymptoms, onboarding);
  
  // Генерируем инсайты
  const insights = generateInsights(recentSymptoms, onboarding, chat);
  
  // Анализируем тренды
  const trends = analyzeSymptomTrends(recentSymptoms);
  
  // Создаем предсказания
  const predictions = generatePredictions(recentSymptoms, onboarding);

  return {
    healthScore,
    insights,
    trends,
    predictions
  };
};

const calculateHealthScore = (symptoms: any[], onboarding: any): HealthScore => {
  if (symptoms.length === 0) {
    return {
      overall: 70,
      categories: { symptoms: 70, sleep: 70, mood: 70, energy: 70 },
      trend: 'stable',
      weeklyChange: 0
    };
  }

  // Анализ симптомов
  const avgHotFlashes = symptoms.reduce((sum, s) => sum + (s.hotFlashes?.count || 0), 0) / symptoms.length;
  const symptomsScore = Math.max(0, 100 - (avgHotFlashes * 10));

  // Анализ сна
  const avgSleepQuality = symptoms.reduce((sum, s) => sum + (s.sleep?.quality || 3), 0) / symptoms.length;
  const sleepScore = (avgSleepQuality / 5) * 100;

  // Анализ настроения
  const avgMood = symptoms.reduce((sum, s) => sum + (s.mood?.overall || 3), 0) / symptoms.length;
  const moodScore = (avgMood / 5) * 100;

  // Анализ энергии
  const avgEnergy = symptoms.reduce((sum, s) => sum + (s.energy || 3), 0) / symptoms.length;
  const energyScore = (avgEnergy / 5) * 100;

  const overall = Math.round((symptomsScore + sleepScore + moodScore + energyScore) / 4);

  // Определяем тренд
  const recentWeek = symptoms.slice(-7);
  const previousWeek = symptoms.slice(-14, -7);
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  let weeklyChange = 0;

  if (recentWeek.length > 0 && previousWeek.length > 0) {
    const recentAvg = recentWeek.reduce((sum, s) => sum + (s.mood?.overall || 3), 0) / recentWeek.length;
    const previousAvg = previousWeek.reduce((sum, s) => sum + (s.mood?.overall || 3), 0) / previousWeek.length;
    
    weeklyChange = Math.round((recentAvg - previousAvg) * 20);
    
    if (weeklyChange > 5) trend = 'improving';
    else if (weeklyChange < -5) trend = 'declining';
  }

  return {
    overall,
    categories: {
      symptoms: Math.round(symptomsScore),
      sleep: Math.round(sleepScore),
      mood: Math.round(moodScore),
      energy: Math.round(energyScore)
    },
    trend,
    weeklyChange
  };
};

const generateInsights = (symptoms: any[], onboarding: any, chat: any[]): HealthInsight[] => {
  const insights: HealthInsight[] = [];

  // Анализ паттернов приливов
  if (symptoms.length > 0) {
    const hotFlashDays = symptoms.filter(s => s.hotFlashes?.count > 0);
    if (hotFlashDays.length > symptoms.length * 0.6) {
      insights.push({
        id: 'hot_flash_pattern',
        type: 'pattern',
        priority: 'high',
        title: 'Частые приливы',
        description: `У вас приливы ${Math.round((hotFlashDays.length / symptoms.length) * 100)}% дней. Это выше среднего для вашей фазы менопаузы.`,
        actionable: true,
        actions: [
          'Ведите дневник триггеров приливов',
          'Избегайте острой пищи и кофеина',
          'Попробуйте дыхательные техники',
          'Обсудите с врачом варианты лечения'
        ],
        confidence: 85,
        trend: 'stable',
        icon: '🔥'
      });
    }
  }

  // Анализ сна
  const sleepIssues = symptoms.filter(s => s.sleep?.quality <= 2);
  if (sleepIssues.length > 3) {
    insights.push({
      id: 'sleep_quality',
      type: 'correlation',
      priority: 'high',
      title: 'Проблемы со сном',
      description: `Качество сна снижено в ${sleepIssues.length} из ${symptoms.length} дней. Это может усиливать другие симптомы менопаузы.`,
      actionable: true,
      actions: [
        'Соблюдайте режим сна',
        'Избегайте экранов за час до сна',
        'Попробуйте медитацию перед сном',
        'Проветривайте спальню'
      ],
      confidence: 78,
      icon: '😴'
    });
  }

  // Корреляция настроения и симптомов
  const moodSymptomCorrelation = analyzeMoodSymptomCorrelation(symptoms);
  if (moodSymptomCorrelation.correlation > 0.6) {
    insights.push({
      id: 'mood_symptom_correlation',
      type: 'correlation',
      priority: 'medium',
      title: 'Связь настроения и симптомов',
      description: `Обнаружена сильная связь между вашим настроением и ${moodSymptomCorrelation.symptom}. Коэффициент корреляции: ${Math.round(moodSymptomCorrelation.correlation * 100)}%.`,
      actionable: true,
      actions: [
        'Практикуйте техники управления стрессом',
        'Регулярная физическая активность',
        'Общение с близкими людьми',
        'При необходимости обратитесь к психологу'
      ],
      confidence: 72,
      icon: '🔗'
    });
  }

  // Позитивные достижения
  const recentGoodDays = symptoms.slice(-7).filter(s => s.mood?.overall >= 4);
  if (recentGoodDays.length >= 5) {
    insights.push({
      id: 'positive_trend',
      type: 'achievement',
      priority: 'low',
      title: 'Хорошая неделя!',
      description: `${recentGoodDays.length} из 7 дней на этой неделе вы чувствовали себя хорошо. Отличная динамика!`,
      actionable: true,
      actions: [
        'Проанализируйте, что помогло',
        'Продолжайте в том же духе',
        'Поделитесь успехом в сообществе'
      ],
      confidence: 90,
      icon: '🏆'
    });
  }

  // Рекомендации на основе фазы менопаузы
  if (onboarding?.basicInfo?.hasStoppedPeriods) {
    insights.push({
      id: 'menopause_phase_advice',
      type: 'recommendation',
      priority: 'medium',
      title: 'Рекомендации для вашей фазы',
      description: 'Вы находитесь в постменопаузе. Важно уделить внимание профилактике остеопороза и сердечно-сосудистых заболеваний.',
      actionable: true,
      actions: [
        'Регулярные обследования плотности костей',
        'Увеличьте потребление кальция и витамина D',
        'Кардиотренировки 3-4 раза в неделю',
        'Обсудите с врачом необходимость ЗГТ'
      ],
      confidence: 88,
      icon: '💡'
    });
  }

  return insights;
};

const analyzeMoodSymptomCorrelation = (symptoms: any[]) => {
  // Простой анализ корреляции настроения с приливами
  if (symptoms.length < 3) {
    return { correlation: 0, symptom: 'недостаточно данных' };
  }

  const moodScores = symptoms.map(s => s.mood?.overall || 3);
  const hotFlashCounts = symptoms.map(s => s.hotFlashes?.count || 0);

  // Простая корреляция Пирсона
  const correlation = calculateCorrelation(moodScores, hotFlashCounts);
  
  return {
    correlation: Math.abs(correlation),
    symptom: 'приливами'
  };
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

const analyzeSymptomTrends = (symptoms: any[]): SymptomTrend[] => {
  // Анализируем тренды основных симптомов
  const trends: SymptomTrend[] = [];

  if (symptoms.length < 7) return trends;

  // Разделяем на две недели для сравнения
  const recentWeek = symptoms.slice(-7);
  const previousWeek = symptoms.slice(-14, -7);

  if (previousWeek.length === 0) return trends;

  // Анализ приливов
  const recentHotFlashes = recentWeek.reduce((sum, s) => sum + (s.hotFlashes?.count || 0), 0) / recentWeek.length;
  const previousHotFlashes = previousWeek.reduce((sum, s) => sum + (s.hotFlashes?.count || 0), 0) / previousWeek.length;
  
  trends.push({
    symptom: 'Приливы',
    current_week: Math.round(recentHotFlashes * 10) / 10,
    previous_week: Math.round(previousHotFlashes * 10) / 10,
    trend: recentHotFlashes > previousHotFlashes ? 'worsening' : 
           recentHotFlashes < previousHotFlashes ? 'improving' : 'stable',
    pattern: getSymptomPattern(recentWeek.map(s => s.hotFlashes?.count || 0)),
    recommendations: getHotFlashRecommendations(recentHotFlashes, previousHotFlashes)
  });

  // Анализ сна
  const recentSleep = recentWeek.reduce((sum, s) => sum + (s.sleep?.quality || 3), 0) / recentWeek.length;
  const previousSleep = previousWeek.reduce((sum, s) => sum + (s.sleep?.quality || 3), 0) / previousWeek.length;
  
  trends.push({
    symptom: 'Качество сна',
    current_week: Math.round(recentSleep * 10) / 10,
    previous_week: Math.round(previousSleep * 10) / 10,
    trend: recentSleep > previousSleep ? 'improving' : 
           recentSleep < previousSleep ? 'worsening' : 'stable',
    pattern: getSymptomPattern(recentWeek.map(s => s.sleep?.quality || 3)),
    recommendations: getSleepRecommendations(recentSleep, previousSleep)
  });

  return trends;
};

const getSymptomPattern = (values: number[]): string => {
  if (values.length < 3) return 'Недостаточно данных';
  
  const isIncreasing = values.slice(1).every((val, i) => val >= values[i]);
  const isDecreasing = values.slice(1).every((val, i) => val <= values[i]);
  
  if (isIncreasing) return 'Постоянное ухудшение';
  if (isDecreasing) return 'Постоянное улучшение';
  
  const variance = values.reduce((sum, val) => {
    const mean = values.reduce((a, b) => a + b) / values.length;
    return sum + Math.pow(val - mean, 2);
  }, 0) / values.length;
  
  return variance > 1 ? 'Нестабильно' : 'Стабильно';
};

const getHotFlashRecommendations = (recent: number, previous: number): string[] => {
  if (recent > previous) {
    return [
      'Ведите дневник триггеров',
      'Избегайте острой пищи',
      'Практикуйте глубокое дыхание',
      'Обратитесь к врачу при усилении'
    ];
  } else if (recent < previous) {
    return [
      'Продолжайте текущую стратегию',
      'Отметьте, что помогает',
      'Поделитесь успехом с врачом'
    ];
  }
  return ['Наблюдайте за изменениями', 'Продолжайте отслеживание'];
};

const getSleepRecommendations = (recent: number, previous: number): string[] => {
  if (recent < previous) {
    return [
      'Соблюдайте режим сна',
      'Избегайте кофеина вечером',
      'Создайте комфортную обстановку',
      'Попробуйте медитацию'
    ];
  } else if (recent > previous) {
    return [
      'Отличная динамика!',
      'Сохраняйте текущие привычки',
      'Продолжайте отслеживание'
    ];
  }
  return ['Поддерживайте стабильность', 'Следите за качеством сна'];
};

const generatePredictions = (symptoms: any[], onboarding: any): Prediction[] => {
  // Простые предсказания на основе трендов
  const predictions: Prediction[] = [];

  if (symptoms.length < 5) return predictions;

  // Предсказание приливов на завтра
  const recentHotFlashes = symptoms.slice(-3).map(s => s.hotFlashes?.count || 0);
  const avgRecent = recentHotFlashes.reduce((a, b) => a + b, 0) / recentHotFlashes.length;
  
  predictions.push({
    type: 'daily',
    target: 'hot_flashes',
    value: Math.round(avgRecent),
    confidence: 65,
    description: `Завтра вероятно ${Math.round(avgRecent)} приливов на основе недавних трендов`
  });

  return predictions;
};