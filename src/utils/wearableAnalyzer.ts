import type { WearableData } from '@/pages/patient/WearableDevices';

// Интерфейс для инсайтов носимых устройств
export interface WearableInsight {
  id: string;
  type: 'sleep_pattern' | 'heart_rate_variability' | 'activity_correlation' | 'temperature_tracking' | 'recovery_analysis';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  correlation?: number;
  confidence: number;
  actionable: boolean;
  recommendations?: string[];
  icon: string;
  trend?: 'improving' | 'stable' | 'declining';
}

export const performWearableAnalysis = async (
  wearableData: WearableData[],
  symptomEntries: any[]
): Promise<WearableInsight[]> => {
  const insights: WearableInsight[] = [];

  if (wearableData.length < 5) {
    return insights;
  }

  // Анализ паттернов сна и симптомов менопаузы
  const sleepAnalysis = analyzeSleepPatterns(wearableData, symptomEntries);
  insights.push(...sleepAnalysis);

  // Анализ вариабельности сердечного ритма
  const hrvAnalysis = analyzeHeartRateVariability(wearableData);
  insights.push(...hrvAnalysis);

  // Анализ активности и энергии
  const activityAnalysis = analyzeActivityCorrelations(wearableData, symptomEntries);
  insights.push(...activityAnalysis);

  // Анализ температурных паттернов
  const temperatureAnalysis = analyzeTemperaturePatterns(wearableData, symptomEntries);
  insights.push(...temperatureAnalysis);

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.confidence - a.confidence;
  });
};

const analyzeSleepPatterns = (
  wearableData: WearableData[],
  symptomEntries: any[]
): WearableInsight[] => {
  const insights: WearableInsight[] = [];

  // Находим пересекающиеся даты
  const commonDates = wearableData
    .map(w => w.date)
    .filter(date => symptomEntries.some(s => s.date === date))
    .sort();

  if (commonDates.length < 5) return insights;

  // Анализ корреляции качества сна и приливов
  const sleepHotFlashCorrelation = analyzeSleepHotFlashCorrelation(wearableData, symptomEntries, commonDates);
  
  if (Math.abs(sleepHotFlashCorrelation.correlation) > 0.3) {
    insights.push({
      id: 'sleep_hotflash_correlation',
      type: 'sleep_pattern',
      priority: Math.abs(sleepHotFlashCorrelation.correlation) > 0.5 ? 'high' : 'medium',
      title: 'Связь сна и приливов',
      description: `${sleepHotFlashCorrelation.correlation < 0 ? 'Плохой' : 'Хороший'} сон коррелирует с ${sleepHotFlashCorrelation.correlation < 0 ? 'увеличением' : 'уменьшением'} приливов (корреляция: ${Math.round(Math.abs(sleepHotFlashCorrelation.correlation) * 100)}%)`,
      correlation: sleepHotFlashCorrelation.correlation,
      confidence: Math.round(Math.abs(sleepHotFlashCorrelation.correlation) * 100),
      actionable: true,
      recommendations: sleepHotFlashCorrelation.recommendations,
      icon: '😴',
      trend: sleepHotFlashCorrelation.trend
    });
  }

  // Анализ фаз сна
  const remSleepAnalysis = analyzeRemSleepDeficiency(wearableData);
  if (remSleepAnalysis.hasDeficiency) {
    insights.push({
      id: 'rem_sleep_deficiency',
      type: 'sleep_pattern',
      priority: 'high',
      title: 'Дефицит REM сна',
      description: `Фаза быстрого сна составляет только ${remSleepAnalysis.averageRem}% от общего времени сна. В менопаузе REM сон особенно важен для регуляции настроения.`,
      confidence: 85,
      actionable: true,
      recommendations: [
        'Избегайте алкоголя за 3 часа до сна',
        'Поддерживайте прохладную температуру в спальне (18-20°C)',
        'Практикуйте релаксацию перед сном',
        'Обсудите с врачом возможные причины нарушения REM сна'
      ],
      icon: '🧠',
      trend: remSleepAnalysis.trend
    });
  }

  return insights;
};

const analyzeHeartRateVariability = (wearableData: WearableData[]): WearableInsight[] => {
  const insights: WearableInsight[] = [];

  const recentData = wearableData.slice(-14); // последние 2 недели
  const hrvValues = recentData
    .map(d => d.heart_rate?.variability)
    .filter(hrv => hrv !== undefined) as number[];

  if (hrvValues.length < 7) return insights;

  const avgHrv = hrvValues.reduce((sum, hrv) => sum + hrv, 0) / hrvValues.length;
  const hrvTrend = calculateTrend(hrvValues);

  // Низкая вариабельность пульса - индикатор стресса и гормональных изменений
  if (avgHrv < 30) {
    insights.push({
      id: 'low_hrv_stress',
      type: 'heart_rate_variability',
      priority: 'high',
      title: 'Низкая вариабельность пульса',
      description: `Средняя ВСР составляет ${Math.round(avgHrv)} мс. Низкая ВСР может указывать на повышенный стресс и гормональные изменения в менопаузе.`,
      confidence: 80,
      actionable: true,
      recommendations: [
        'Практикуйте дыхательные упражнения 5-10 минут ежедневно',
        'Регулярные медитации или йога',
        'Ограничьте кофеин после 14:00',
        'Обеспечьте 7-9 часов качественного сна',
        'Рассмотрите консультацию эндокринолога'
      ],
      icon: '❤️',
      trend: hrvTrend
    });
  }

  // Анализ восстановления после физической активности
  const recoveryAnalysis = analyzeRecoveryPatterns(wearableData);
  if (recoveryAnalysis.needsAttention) {
    insights.push({
      id: 'poor_recovery',
      type: 'recovery_analysis',
      priority: 'medium',
      title: 'Замедленное восстановление',
      description: `Ваш пульс восстанавливается медленнее обычного после активности. Это может быть связано с гормональными изменениями в менопаузе.`,
      confidence: 70,
      actionable: true,
      recommendations: [
        'Снизьте интенсивность тренировок на 10-15%',
        'Увеличьте время разминки и заминки',
        'Добавьте больше дней отдыха между интенсивными тренировками',
        'Сосредоточьтесь на низкоинтенсивных упражнениях (ходьба, плавание)'
      ],
      icon: '🔄',
      trend: recoveryAnalysis.trend
    });
  }

  return insights;
};

const analyzeActivityCorrelations = (
  wearableData: WearableData[],
  symptomEntries: any[]
): WearableInsight[] => {
  const insights: WearableInsight[] = [];

  if (wearableData.length < 7 || symptomEntries.length < 5) return insights;

  // Анализ корреляции активности и настроения
  const activityMoodCorrelation = analyzeActivityMoodCorrelation(wearableData, symptomEntries);
  
  if (Math.abs(activityMoodCorrelation.correlation) > 0.4) {
    insights.push({
      id: 'activity_mood_correlation',
      type: 'activity_correlation',
      priority: activityMoodCorrelation.correlation > 0 ? 'medium' : 'high',
      title: 'Активность и настроение',
      description: `Физическая активность ${activityMoodCorrelation.correlation > 0 ? 'положительно' : 'отрицательно'} влияет на ваше настроение (корреляция: ${Math.round(Math.abs(activityMoodCorrelation.correlation) * 100)}%)`,
      correlation: activityMoodCorrelation.correlation,
      confidence: Math.round(Math.abs(activityMoodCorrelation.correlation) * 100),
      actionable: true,
      recommendations: activityMoodCorrelation.recommendations,
      icon: '🏃‍♀️',
      trend: activityMoodCorrelation.trend
    });
  }

  return insights;
};

const analyzeTemperaturePatterns = (
  wearableData: WearableData[],
  symptomEntries: any[]
): WearableInsight[] => {
  const insights: WearableInsight[] = [];

  const temperatureData = wearableData.filter(d => d.body_metrics?.body_temperature);
  if (temperatureData.length < 7) return insights;

  // Анализ флуктуаций температуры
  const tempFluctuations = analyzeTemperatureFluctuations(temperatureData);
  
  if (tempFluctuations.hasSignificantFluctuations) {
    insights.push({
      id: 'temperature_fluctuations',
      type: 'temperature_tracking',
      priority: tempFluctuations.severity === 'high' ? 'high' : 'medium',
      title: 'Колебания температуры тела',
      description: `Обнаружены значительные колебания температуры тела (разброс: ${tempFluctuations.range.toFixed(1)}°C). Это характерно для менопаузы и может быть связано с приливами.`,
      confidence: 75,
      actionable: true,
      recommendations: [
        'Отслеживайте триггеры приливов (острая пища, алкоголь, стресс)',
        'Используйте многослойную одежду',
        'Поддерживайте прохладную температуру в помещении',
        'Избегайте горячих напитков и бань перед сном',
        'Обсудите с врачом гормональную терапию'
      ],
      icon: '🌡️',
      trend: tempFluctuations.trend
    });
  }

  return insights;
};

// Вспомогательные функции для анализа

const calculateTrend = (values: number[]): 'improving' | 'stable' | 'declining' => {
  if (values.length < 3) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const changePercent = Math.abs((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (changePercent < 5) return 'stable';
  return secondAvg > firstAvg ? 'improving' : 'declining';
};

const analyzeSleepHotFlashCorrelation = (
  wearableData: WearableData[],
  symptomEntries: any[],
  commonDates: string[]
) => {
  const pairs = commonDates.map(date => {
    const wearableEntry = wearableData.find(w => w.date === date);
    const symptomEntry = symptomEntries.find(s => s.date === date);
    
    const sleepEfficiency = wearableEntry?.sleep?.sleep_efficiency || 0;
    const hotFlashes = symptomEntry?.symptoms?.hot_flashes?.severity || 0;
    
    return { sleepEfficiency, hotFlashes };
  }).filter(pair => pair.sleepEfficiency > 0);

  if (pairs.length < 5) {
    return { correlation: 0, trend: 'stable' as const, recommendations: [] };
  }

  const correlation = calculateCorrelation(
    pairs.map(p => p.sleepEfficiency),
    pairs.map(p => p.hotFlashes)
  );

  const recommendations = correlation < -0.3 ? [
    'Создайте прохладную спальню (18-20°C)',
    'Используйте дышащие постельные принадлежности',
    'Избегайте тяжелой пищи за 3 часа до сна',
    'Практикуйте техники релаксации перед сном',
    'Рассмотрите консультацию гинеколога-эндокринолога'
  ] : [];

  return {
    correlation,
    trend: calculateTrend(pairs.map(p => p.sleepEfficiency)),
    recommendations
  };
};

const analyzeRemSleepDeficiency = (wearableData: WearableData[]) => {
  const sleepData = wearableData.filter(d => d.sleep?.rem_sleep_minutes);
  
  if (sleepData.length < 5) {
    return { hasDeficiency: false, averageRem: 0, trend: 'stable' as const };
  }

  const remPercentages = sleepData.map(d => {
    const total = d.sleep!.total_minutes;
    const rem = d.sleep!.rem_sleep_minutes;
    return (rem / total) * 100;
  });

  const averageRem = remPercentages.reduce((sum, pct) => sum + pct, 0) / remPercentages.length;
  
  return {
    hasDeficiency: averageRem < 15, // Нормальный REM сон должен составлять 20-25%
    averageRem: Math.round(averageRem),
    trend: calculateTrend(remPercentages)
  };
};

const analyzeRecoveryPatterns = (wearableData: WearableData[]) => {
  const recentData = wearableData.slice(-7);
  const heartRateData = recentData.filter(d => d.heart_rate?.resting);

  if (heartRateData.length < 5) {
    return { needsAttention: false, trend: 'stable' as const };
  }

  const restingHRs = heartRateData.map(d => d.heart_rate!.resting);
  const avgRestingHR = restingHRs.reduce((sum, hr) => sum + hr, 0) / restingHRs.length;
  
  // Если средний пульс в покое выше 75 уд/мин, это может указывать на плохое восстановление
  return {
    needsAttention: avgRestingHR > 75,
    trend: calculateTrend(restingHRs)
  };
};

const analyzeActivityMoodCorrelation = (
  wearableData: WearableData[],
  symptomEntries: any[]
) => {
  const commonDates = wearableData
    .map(w => w.date)
    .filter(date => symptomEntries.some(s => s.date === date));

  const pairs = commonDates.map(date => {
    const wearableEntry = wearableData.find(w => w.date === date);
    const symptomEntry = symptomEntries.find(s => s.date === date);
    
    const steps = wearableEntry?.activity?.steps || 0;
    const mood = symptomEntry?.symptoms?.mood_changes?.severity || 0;
    
    return { steps, mood };
  }).filter(pair => pair.steps > 0);

  if (pairs.length < 5) {
    return { correlation: 0, trend: 'stable' as const, recommendations: [] };
  }

  const correlation = calculateCorrelation(
    pairs.map(p => p.steps),
    pairs.map(p => -p.mood) // Инвертируем, так как больше шагов = лучше настроение
  );

  const recommendations = correlation > 0.3 ? [
    'Увеличьте ежедневную физическую активность',
    'Стремитесь к 8000+ шагов в день',
    'Добавьте утреннюю прогулку для лучшего настроения',
    'Попробуйте активности на свежем воздухе'
  ] : [
    'Найдите виды активности, которые вам нравятся',
    'Начните с коротких 10-минутных прогулок',
    'Рассмотрите групповые занятия для мотивации'
  ];

  return {
    correlation,
    trend: calculateTrend(pairs.map(p => p.steps)),
    recommendations
  };
};

const analyzeTemperatureFluctuations = (temperatureData: WearableData[]) => {
  const temperatures = temperatureData.map(d => d.body_metrics!.body_temperature!);
  
  const minTemp = Math.min(...temperatures);
  const maxTemp = Math.max(...temperatures);
  const range = maxTemp - minTemp;
  
  return {
    hasSignificantFluctuations: range > 1.0, // Разброс больше 1°C считается значительным
    range,
    severity: range > 1.5 ? 'high' as const : 'medium' as const,
    trend: calculateTrend(temperatures)
  };
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};