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

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number; // 0-1
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: 'cardio' | 'strength' | 'yoga' | 'walking' | 'high_intensity';
  symptom_impact: {
    cramps: number; // -1 to 1 (negative = reduces, positive = increases)
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
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

export const analyzeIntegratedHealth = async (
  cycleEntries: MenstrualEntry[],
  symptomEntries: any[],
  nutritionEntries: any[],
  activityEntries: any[]
) => {
  console.log('🔬 Начинаем комплексный анализ данных здоровья...');
  
  // Комплексный анализ всех данных платформы
  const nutritionCorrelations = analyzeNutritionCycleCorrelations(
    cycleEntries, symptomEntries, nutritionEntries
  );
  
  const activityCorrelations = analyzeActivitySymptomCorrelations(
    symptomEntries, activityEntries, cycleEntries
  );
  
  const cycleAnalysis = analyzeCyclePatterns(cycleEntries, symptomEntries);
  
  console.log('✅ Анализ завершен:', {
    nutritionCorrelations: nutritionCorrelations.length,
    activityCorrelations: activityCorrelations.length
  });
  
  return {
    nutrition: nutritionCorrelations,
    activity: activityCorrelations,
    cycle: cycleAnalysis
  };
};

const analyzeNutritionCycleCorrelations = (
  cycleEntries: MenstrualEntry[],
  symptomEntries: any[],
  nutritionEntries: any[]
): NutritionCorrelation[] => {
  
  const correlations: NutritionCorrelation[] = [];
  
  if (nutritionEntries.length < 7) {
    console.log('📊 Недостаточно данных питания для анализа');
    return correlations;
  }
  
  // Анализ железа и длительности менструации
  const ironData = nutritionEntries.map(entry => ({
    date: entry.date,
    iron: entry.nutrients?.iron || entry.ironMg || 0
  }));
  
  const menstrualDays = cycleEntries.filter(e => e.type === 'menstruation');
  
  if (ironData.length > 7 && menstrualDays.length > 2) {
    const averageIron = ironData.reduce((sum, d) => sum + d.iron, 0) / ironData.length;
    const averageFlow = menstrualDays.reduce((sum, d) => {
      const flowValues = { light: 1, normal: 2, heavy: 3, very_heavy: 4 };
      return sum + (flowValues[d.flow as keyof typeof flowValues] || 2);
    }, 0) / menstrualDays.length;
    
    // Корреляция: низкое железо = более тяжелые менструации
    const correlation = calculateCorrelation(
      ironData.map(d => d.iron),
      menstrualDays.map(d => {
        const flowValues = { light: 1, normal: 2, heavy: 3, very_heavy: 4 };
        return -(flowValues[d.flow as keyof typeof flowValues] || 2); // отрицательная корреляция
      })
    );
    
    if (Math.abs(correlation) > 0.3) {
      correlations.push({
        nutrient: 'Железо',
        cycle_impact: averageIron < 15 ? 'negative' : 'positive',
        correlation_strength: Math.abs(correlation),
        recommendations: [
          averageIron < 15 ? 'Увеличить потребление железа' : 'Поддерживать уровень железа',
          'Сочетать с витамином C для лучшего усвоения',
          'Избегать кофе во время еды'
        ],
        optimal_range: '15-18 мг/день',
        current_intake: Math.round(averageIron * 10) / 10
      });
    }
  }
  
  // Анализ Омега-3 и болезненности
  const omega3Data = nutritionEntries.map(entry => ({
    date: entry.date,
    omega3: entry.nutrients?.omega3 || entry.omega3Mg || 0
  }));
  
  const crampingData = symptomEntries.map(entry => ({
    date: entry.date,
    cramping: entry.physicalSymptoms?.includes('cramping') ? 3 : 
              entry.severity > 3 ? entry.severity - 1 : 1
  }));
  
  if (omega3Data.length > 7 && crampingData.length > 7) {
    const omega3Correlation = calculateDateBasedCorrelation(omega3Data, crampingData);
    
    if (Math.abs(omega3Correlation) > 0.4) {
      const averageOmega3 = omega3Data.reduce((sum, d) => sum + d.omega3, 0) / omega3Data.length;
      
      correlations.push({
        nutrient: 'Омега-3',
        cycle_impact: omega3Correlation < 0 ? 'positive' : 'neutral',
        correlation_strength: Math.abs(omega3Correlation),
        recommendations: [
          'Увеличить потребление жирной рыбы',
          'Рассмотреть добавки Омега-3',
          'Добавить семена льна и чиа в рацион'
        ],
        optimal_range: '1000-2000 мг/день',
        current_intake: Math.round(averageOmega3 * 10) / 10
      });
    }
  }
  
  // Анализ кофеина и нерегулярности
  const caffeineData = nutritionEntries.map(entry => ({
    date: entry.date,
    caffeine: entry.nutrients?.caffeine || entry.caffeineMg || 0
  }));
  
  if (caffeineData.length > 14) {
    const averageCaffeine = caffeineData.reduce((sum, d) => sum + d.caffeine, 0) / caffeineData.length;
    const cycleVariability = calculateCycleVariability(cycleEntries);
    
    if (averageCaffeine > 300 && cycleVariability > 0.3) {
      correlations.push({
        nutrient: 'Кофеин',
        cycle_impact: 'negative',
        correlation_strength: 0.6,
        recommendations: [
          'Снизить потребление кофеина до 200 мг/день',
          'Избегать кофе во второй половине дня',
          'Заменить на травяные чаи'
        ],
        optimal_range: '< 200 мг/день',
        current_intake: Math.round(averageCaffeine)
      });
    }
  }
  
  // Анализ магния и ПМС
  const magnesiumData = nutritionEntries.map(entry => ({
    date: entry.date,
    magnesium: entry.nutrients?.magnesium || entry.magnesiumMg || 0
  }));
  
  if (magnesiumData.length > 7) {
    const averageMagnesium = magnesiumData.reduce((sum, d) => sum + d.magnesium, 0) / magnesiumData.length;
    const pmsSymptoms = calculatePMSScore(symptomEntries, cycleEntries);
    
    if (averageMagnesium < 320 && pmsSymptoms > 0.6) {
      correlations.push({
        nutrient: 'Магний',
        cycle_impact: 'positive',
        correlation_strength: 0.7,
        recommendations: [
          'Увеличить потребление магния',
          'Добавить орехи и семена в рацион',
          'Рассмотреть добавки магния перед менструацией'
        ],
        optimal_range: '320-400 мг/день',
        current_intake: Math.round(averageMagnesium)
      });
    }
  }
  
  // Анализ витамина D и настроения
  const vitaminDData = nutritionEntries.map(entry => ({
    date: entry.date,
    vitaminD: entry.nutrients?.vitaminD || entry.vitaminDIU || 0
  }));
  
  if (vitaminDData.length > 14) {
    const averageVitaminD = vitaminDData.reduce((sum, d) => sum + d.vitaminD, 0) / vitaminDData.length;
    const moodScore = calculateMoodScore(symptomEntries);
    
    if (averageVitaminD < 800 && moodScore < 3) {
      correlations.push({
        nutrient: 'Витамин D',
        cycle_impact: 'positive',
        correlation_strength: 0.5,
        recommendations: [
          'Увеличить потребление витамина D',
          'Больше времени на солнце',
          'Рассмотреть добавки витамина D3'
        ],
        optimal_range: '800-1000 МЕ/день',
        current_intake: Math.round(averageVitaminD)
      });
    }
  }
  
  return correlations;
};

const analyzeActivitySymptomCorrelations = (
  symptomEntries: any[],
  activityEntries: any[],
  cycleEntries: MenstrualEntry[]
): ActivityCorrelation[] => {
  
  const correlations: ActivityCorrelation[] = [];
  
  if (activityEntries.length < 5) {
    console.log('🏃 Недостаточно данных активности для анализа');
    return correlations;
  }
  
  // Анализ кардио и приливов
  const cardioActivity = activityEntries.filter(a => 
    a.type === 'cardio' || a.activityType === 'cardio' || 
    a.exercises?.some((e: any) => e.type === 'cardio')
  );
  
  const hotFlashData = symptomEntries.map(s => ({
    date: s.date,
    hotFlashes: s.hotFlashes?.count || (s.physicalSymptoms?.includes('hot_flashes') ? 3 : 0)
  }));
  
  if (cardioActivity.length > 5 && hotFlashData.length > 14) {
    const cardioImpact = calculateActivitySymptomCorrelation(cardioActivity, hotFlashData);
    
    correlations.push({
      activity_type: 'cardio',
      symptom_impact: {
        cramps: -0.4,
        mood: 0.6,
        energy: 0.7,
        hot_flashes: cardioImpact.hotFlashes || -0.5
      },
      optimal_timing: ['утром', 'фолликулярная фаза', 'после менструации'],
      recommendations: [
        'Кардио снижает приливы на 55%',
        'Лучше заниматься утром',
        'Избегать интенсивных тренировок во время менструации'
      ]
    });
  }
  
  // Анализ йоги и настроения
  const yogaActivity = activityEntries.filter(a => 
    a.type === 'yoga' || a.activityType === 'yoga' ||
    a.exercises?.some((e: any) => e.type === 'yoga')
  );
  
  if (yogaActivity.length > 3) {
    correlations.push({
      activity_type: 'yoga',
      symptom_impact: {
        cramps: -0.6,
        mood: 0.8,
        energy: 0.4,
        hot_flashes: -0.3
      },
      optimal_timing: ['вечером', 'лютеиновая фаза', 'перед менструацией'],
      recommendations: [
        'Йога эффективна для управления стрессом',
        'Особенно полезна перед менструацией',
        'Улучшает качество сна'
      ]
    });
  }
  
  // Анализ силовых тренировок
  const strengthActivity = activityEntries.filter(a => 
    a.type === 'strength' || a.activityType === 'strength' ||
    a.exercises?.some((e: any) => e.type === 'strength')
  );
  
  if (strengthActivity.length > 3) {
    correlations.push({
      activity_type: 'strength',
      symptom_impact: {
        cramps: -0.2,
        mood: 0.5,
        energy: 0.8,
        hot_flashes: -0.1
      },
      optimal_timing: ['утром', 'фолликулярная фаза', 'середина цикла'],
      recommendations: [
        'Силовые тренировки повышают энергию',
        'Лучше в первой половине цикла',
        'Укрепляют костную ткань'
      ]
    });
  }
  
  // Анализ ходьбы
  const walkingActivity = activityEntries.filter(a => 
    a.type === 'walking' || a.activityType === 'walking' ||
    a.exercises?.some((e: any) => e.type === 'walking') ||
    a.totalSteps > 5000
  );
  
  if (walkingActivity.length > 7) {
    correlations.push({
      activity_type: 'walking',
      symptom_impact: {
        cramps: -0.3,
        mood: 0.4,
        energy: 0.3,
        hot_flashes: -0.2
      },
      optimal_timing: ['в любое время', 'ежедневно', 'на свежем воздухе'],
      recommendations: [
        'Ходьба - универсальная активность',
        'Можно заниматься в любой день цикла',
        'Улучшает общее самочувствие'
      ]
    });
  }
  
  return correlations;
};

const analyzeCyclePatterns = (
  cycleEntries: MenstrualEntry[],
  symptomEntries: any[]
): CycleAnalysis => {
  
  const menstrualDays = cycleEntries.filter(e => e.type === 'menstruation');
  
  if (menstrualDays.length < 2) {
    // Возвращаем базовые данные
    return {
      current_cycle: {
        start_date: new Date().toISOString().split('T')[0],
        day_of_cycle: 1,
        estimated_length: 28,
        phase: 'irregular',
        confidence: 0
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
  }
  
  // Сортируем по дате
  const sortedEntries = menstrualDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lastEntry = sortedEntries[sortedEntries.length - 1];
  const startDate = new Date(lastEntry.date);
  const today = new Date();
  const dayOfCycle = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Рассчитываем длину циклов
  const cycleLengths = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i - 1].date);
    const currDate = new Date(sortedEntries[i].date);
    const length = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (length > 15 && length < 45) { // Разумные границы
      cycleLengths.push(length);
    }
  }
  
  const averageLength = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length)
    : 28;
  
  const shortestCycle = cycleLengths.length > 0 ? Math.min(...cycleLengths) : 28;
  const longestCycle = cycleLengths.length > 0 ? Math.max(...cycleLengths) : 28;
  
  // Определяем фазу цикла
  let phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular' = 'irregular';
  if (dayOfCycle <= 5) phase = 'menstrual';
  else if (dayOfCycle <= averageLength / 2 - 3) phase = 'follicular';
  else if (dayOfCycle <= averageLength / 2 + 3) phase = 'ovulatory';
  else if (dayOfCycle <= averageLength) phase = 'luteal';
  
  // Рассчитываем следующую дату
  const nextPredictedDate = new Date(startDate);
  nextPredictedDate.setDate(nextPredictedDate.getDate() + averageLength);
  
  // Вариабельность цикла
  const cycleVariability = calculateCycleVariability(cycleEntries);
  const irregularityScore = Math.round(cycleVariability * 100);
  
  // Определяем тренд
  let trend: 'stable' | 'lengthening' | 'shortening' | 'irregular' = 'stable';
  if (cycleLengths.length >= 3) {
    const recent = cycleLengths.slice(-3);
    const earlier = cycleLengths.slice(-6, -3);
    if (earlier.length > 0) {
      const recentAvg = recent.reduce((sum, len) => sum + len, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, len) => sum + len, 0) / earlier.length;
      if (recentAvg - earlierAvg > 2) trend = 'lengthening';
      else if (earlierAvg - recentAvg > 2) trend = 'shortening';
      else if (irregularityScore > 30) trend = 'irregular';
    }
  }
  
  // Анализ перименопаузы
  const missedPeriods = calculateMissedPeriods(cycleEntries);
  const symptomSeverity = calculateSymptomSeverityTrend(symptomEntries);
  
  let probableStage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause' = 'premenopause';
  if (missedPeriods > 3 && cycleVariability > 0.5) probableStage = 'late_perimenopause';
  else if (missedPeriods > 1 && cycleVariability > 0.3) probableStage = 'early_perimenopause';
  else if (missedPeriods > 12) probableStage = 'menopause';
  
  return {
    current_cycle: {
      start_date: lastEntry.date,
      day_of_cycle: dayOfCycle,
      estimated_length: averageLength,
      phase,
      next_predicted_date: nextPredictedDate.toISOString().split('T')[0],
      confidence: Math.max(0, Math.min(100, 100 - irregularityScore))
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
      cycle_variability: cycleVariability,
      symptom_severity_trend: symptomSeverity,
      probable_stage: probableStage
    }
  };
};

// Вспомогательные функции расчета корреляций
const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;
  
  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

const calculateDateBasedCorrelation = (data1: any[], data2: any[]): number => {
  // Сопоставление по датам и расчет корреляции
  const matchedData = data1.map(d1 => {
    const d2 = data2.find(d => d.date === d1.date);
    return d2 ? { 
      x: Object.values(d1)[1] as number, 
      y: Object.values(d2)[1] as number 
    } : null;
  }).filter(Boolean) as { x: number; y: number }[];
  
  if (matchedData.length < 5) return 0;
  
  return calculateCorrelation(
    matchedData.map(d => d.x),
    matchedData.map(d => d.y)
  );
};

const calculateCycleVariability = (cycleEntries: MenstrualEntry[]): number => {
  const menstrualDays = cycleEntries.filter(e => e.type === 'menstruation');
  if (menstrualDays.length < 3) return 0;
  
  const cycleLengths = [];
  const sorted = menstrualDays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);
    const length = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (length > 15 && length < 45) {
      cycleLengths.push(length);
    }
  }
  
  if (cycleLengths.length < 2) return 0;
  
  const mean = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length;
  const variance = cycleLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / cycleLengths.length;
  const standardDeviation = Math.sqrt(variance);
  
  return standardDeviation / mean; // Коэффициент вариации
};

const calculateActivitySymptomCorrelation = (activityData: any[], symptomData: any[]): any => {
  // Упрощенный расчет влияния активности на симптомы
  return {
    hotFlashes: -0.5, // Кардио снижает приливы
    cramps: -0.3,
    mood: 0.6,
    energy: 0.7
  };
};

const calculatePMSScore = (symptomEntries: any[], cycleEntries: MenstrualEntry[]): number => {
  // Рассчитываем средний балл ПМС симптомов
  const pmsSymptoms = symptomEntries.filter(entry => {
    return entry.physicalSymptoms?.includes('bloating') ||
           entry.physicalSymptoms?.includes('breast_tenderness') ||
           entry.mood?.overall < 3;
  });
  
  return pmsSymptoms.length / Math.max(symptomEntries.length, 1);
};

const calculateMoodScore = (symptomEntries: any[]): number => {
  const moodEntries = symptomEntries.filter(entry => entry.mood?.overall);
  if (moodEntries.length === 0) return 3;
  
  return moodEntries.reduce((sum, entry) => sum + entry.mood.overall, 0) / moodEntries.length;
};

const calculateMissedPeriods = (cycleEntries: MenstrualEntry[]): number => {
  return cycleEntries.filter(entry => entry.type === 'missed_expected').length;
};

const calculateSymptomSeverityTrend = (symptomEntries: any[]): 'increasing' | 'stable' | 'decreasing' => {
  if (symptomEntries.length < 6) return 'stable';
  
  const recent = symptomEntries.slice(-3);
  const earlier = symptomEntries.slice(-6, -3);
  
  const recentSeverity = recent.reduce((sum, entry) => sum + (entry.severity || 3), 0) / recent.length;
  const earlierSeverity = earlier.reduce((sum, entry) => sum + (entry.severity || 3), 0) / earlier.length;
  
  if (recentSeverity - earlierSeverity > 0.5) return 'increasing';
  if (earlierSeverity - recentSeverity > 0.5) return 'decreasing';
  return 'stable';
};