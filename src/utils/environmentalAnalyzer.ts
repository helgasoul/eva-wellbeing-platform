import { EnvironmentalFactors } from '../services/environmentalService';

interface EnvironmentalInsight {
  type: 'pressure_correlation' | 'humidity_impact' | 'air_quality_alert' | 'weather_prediction';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  correlation: number; // -1 to 1
  confidence: number; // 0-100%
  recommendations: string[];
  forecast: {
    tomorrow: 'better' | 'same' | 'worse';
    reason: string;
    suggestions: string[];
  };
}

interface EnvironmentalTrigger {
  factor: 'pressure' | 'humidity' | 'temperature' | 'air_quality' | 'uv_index';
  threshold: number;
  direction: 'above' | 'below' | 'change';
  impact_on_symptoms: {
    hot_flashes: number;
    sleep_quality: number;
    mood: number;
    headaches: number;
    joint_pain: number;
  };
  personal_sensitivity: number; // 0-100%
}

interface PredictionResult {
  tomorrow_predictions: {
    hot_flashes: { likelihood: number; predicted_value?: number };
    sleep_quality: { likelihood: number; predicted_value?: number };
    mood: { likelihood: number; predicted_value?: number };
    headaches: { likelihood: number; predicted_value?: number };
  };
  tomorrow_reason: string;
  weekly_trend: 'improving' | 'stable' | 'declining';
  confidence: number;
  preparation_tips: string[];
}

interface WeatherAlert {
  type: 'pressure_drop' | 'high_humidity' | 'poor_air_quality' | 'uv_warning';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  action: string;
  showUntil: string;
}

export const analyzeEnvironmentalCorrelations = (
  symptoms: any[], 
  environmentalData: EnvironmentalFactors[]
): EnvironmentalInsight[] => {
  const insights: EnvironmentalInsight[] = [];

  if (symptoms.length < 5 || environmentalData.length < 5) {
    return insights;
  }

  // Анализ корреляции с атмосферным давлением
  const pressureAnalysis = analyzePressureCorrelation(symptoms, environmentalData);
  if (Math.abs(pressureAnalysis.correlation) > 0.3) {
    insights.push({
      type: 'pressure_correlation',
      severity: Math.abs(pressureAnalysis.correlation) > 0.6 ? 'high' : 'medium',
      title: 'Влияние атмосферного давления',
      description: `Обнаружена ${pressureAnalysis.correlation > 0 ? 'положительная' : 'отрицательная'} связь между изменениями давления и вашими приливами. Корреляция: ${Math.round(pressureAnalysis.correlation * 100)}%`,
      correlation: pressureAnalysis.correlation,
      confidence: Math.round(Math.abs(pressureAnalysis.correlation) * 100),
      recommendations: pressureAnalysis.recommendations,
      forecast: pressureAnalysis.forecast
    });
  }

  // Анализ влияния влажности
  const humidityAnalysis = analyzeHumidityImpact(symptoms, environmentalData);
  if (Math.abs(humidityAnalysis.correlation) > 0.25) {
    insights.push({
      type: 'humidity_impact',
      severity: humidityAnalysis.severity,
      title: 'Влияние влажности воздуха',
      description: humidityAnalysis.description,
      correlation: humidityAnalysis.correlation,
      confidence: Math.round(Math.abs(humidityAnalysis.correlation) * 100),
      recommendations: humidityAnalysis.recommendations,
      forecast: humidityAnalysis.forecast
    });
  }

  // Анализ качества воздуха
  const airQualityAnalysis = analyzeAirQualityImpact(symptoms, environmentalData);
  if (airQualityAnalysis.hasImpact) {
    insights.push({
      type: 'air_quality_alert',
      severity: airQualityAnalysis.severity,
      title: 'Влияние качества воздуха',
      description: airQualityAnalysis.description,
      correlation: airQualityAnalysis.correlation,
      confidence: airQualityAnalysis.confidence,
      recommendations: airQualityAnalysis.recommendations,
      forecast: airQualityAnalysis.forecast
    });
  }

  return insights;
};

const analyzePressureCorrelation = (symptoms: any[], environmentalData: EnvironmentalFactors[]) => {
  // Рассчитываем изменения давления
  const pressureChanges = environmentalData.map((env, index) => {
    if (index === 0) return 0;
    return env.weather.current.pressure - environmentalData[index - 1].weather.current.pressure;
  }).slice(1);

  const hotFlashCounts = symptoms.slice(1).map(s => s.hotFlashes?.count || 0);

  const correlation = calculateCorrelation(pressureChanges, hotFlashCounts);

  return {
    correlation,
    recommendations: correlation < -0.3 ? [
      'Отслеживайте прогноз атмосферного давления',
      'При падении давления >5 hPa готовьтесь к возможным приливам',
      'Носите многослойную одежду в дни с перепадами давления',
      'Практикуйте дыхательные упражнения при метеочувствительности'
    ] : correlation > 0.3 ? [
      'Обратите внимание на рост давления перед приливами',
      'Ведите дневник давления и симптомов',
      'При высоком давлении избегайте стрессов и кофеина'
    ] : [
      'Продолжайте отслеживать связь с погодными условиями',
      'Ведите дневник для выявления индивидуальных паттернов'
    ],
    forecast: {
      tomorrow: (correlation < -0.3 ? 'worse' : correlation > 0.3 ? 'better' : 'same') as 'worse' | 'same' | 'better',
      reason: correlation < -0.3 ? 'Ожидается падение давления' : 
              correlation > 0.3 ? 'Давление стабилизируется' : 'Изменения давления незначительные',
      suggestions: correlation < -0.3 ? [
        'Подготовьте сменную одежду',
        'Избегайте горячих напитков',
        'Планируйте отдых в прохладном месте'
      ] : [
        'Используйте день для активности',
        'Планируйте важные дела'
      ]
    }
  };
};

const analyzeHumidityImpact = (symptoms: any[], environmentalData: EnvironmentalFactors[]) => {
  const humidityLevels = environmentalData.map(env => env.weather.current.humidity);
  const sleepQuality = symptoms.map(s => s.sleep?.quality || 3);

  const correlation = calculateCorrelation(humidityLevels, sleepQuality);
  const highHumidityDays = humidityLevels.filter(h => h > 70).length;
  const totalDays = humidityLevels.length;
  const highHumidityPercentage = (highHumidityDays / totalDays) * 100;

  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';

  if (correlation < -0.4 && highHumidityPercentage > 30) {
    severity = 'high';
    description = `Высокая влажность (>${Math.round(highHumidityPercentage)}% дней) значительно ухудшает качество сна. Корреляция: ${Math.round(correlation * 100)}%`;
  } else if (correlation < -0.25) {
    severity = 'medium';
    description = `Обнаружено умеренное влияние влажности на качество сна. Корреляция: ${Math.round(correlation * 100)}%`;
  } else {
    description = `Влажность воздуха оказывает минимальное влияние на ваш сон. Корреляция: ${Math.round(correlation * 100)}%`;
  }

  return {
    correlation,
    severity,
    description,
    recommendations: correlation < -0.3 ? [
      'Используйте осушитель воздуха в спальне',
      'Проветривайте помещение перед сном',
      'Выбирайте дышащие ткани для постельного белья',
      'Избегайте горячего душа перед сном в влажные дни'
    ] : [
      'Поддерживайте комфортную влажность в доме (40-60%)',
      'Следите за прогнозом влажности'
    ],
    forecast: {
      tomorrow: (correlation < -0.3 ? 'worse' : 'same') as 'worse' | 'same' | 'better',
      reason: correlation < -0.3 ? 'Высокая влажность может ухудшить сон' : 'Влажность не окажет значительного влияния',
      suggestions: correlation < -0.3 ? [
        'Подготовьте осушитель воздуха',
        'Выберите легкую одежду для сна',
        'Планируйте более раннее время отхода ко сну'
      ] : [
        'Обычный режим сна',
        'Поддерживайте комфортную температуру'
      ]
    }
  };
};

const analyzeAirQualityImpact = (symptoms: any[], environmentalData: EnvironmentalFactors[]) => {
  const pm25Levels = environmentalData.map(env => env.airQuality.current.pm2_5);
  const moodScores = symptoms.map(s => s.mood?.overall || 3);

  const correlation = calculateCorrelation(pm25Levels, moodScores);
  const poorAirDays = pm25Levels.filter(pm => pm > 35).length;
  const totalDays = pm25Levels.length;
  const avgPM25 = pm25Levels.reduce((sum, pm) => sum + pm, 0) / pm25Levels.length;

  const hasImpact = Math.abs(correlation) > 0.2 || avgPM25 > 25;

  let severity: 'low' | 'medium' | 'high' = 'low';
  let description = '';

  if (correlation < -0.4 && avgPM25 > 35) {
    severity = 'high';
    description = `Плохое качество воздуха (PM2.5: ${Math.round(avgPM25)} μg/m³) значительно влияет на ваше настроение. Корреляция: ${Math.round(correlation * 100)}%`;
  } else if (correlation < -0.25 || avgPM25 > 25) {
    severity = 'medium';
    description = `Умеренное влияние качества воздуха на самочувствие. Средний PM2.5: ${Math.round(avgPM25)} μg/m³`;
  } else {
    description = `Качество воздуха в вашем регионе удовлетворительное. Средний PM2.5: ${Math.round(avgPM25)} μg/m³`;
  }

  return {
    hasImpact,
    correlation,
    severity,
    description,
    confidence: Math.round(Math.abs(correlation) * 100),
    recommendations: severity === 'high' ? [
      'Используйте очиститель воздуха дома',
      'Ограничьте время на улице в дни с плохим воздухом',
      'Носите защитную маску при выходе на улицу',
      'Планируйте прогулки в утренние часы'
    ] : severity === 'medium' ? [
      'Следите за индексом качества воздуха',
      'Проветривайте дом в утренние часы',
      'Избегайте интенсивных тренировок на улице в смогливые дни'
    ] : [
      'Продолжайте мониторинг качества воздуха',
      'Поддерживайте активный образ жизни'
    ],
    forecast: {
      tomorrow: (severity === 'high' ? 'worse' : 'same') as 'worse' | 'same' | 'better',
      reason: severity === 'high' ? 'Ожидается плохое качество воздуха' : 'Качество воздуха удовлетворительное',
      suggestions: severity === 'high' ? [
        'Минимизируйте время на улице',
        'Используйте очиститель воздуха',
        'Планируйте домашние активности'
      ] : [
        'Используйте день для прогулок',
        'Планируйте активности на свежем воздухе'
      ]
    }
  };
};

export const predictSymptomsByWeather = (
  symptoms: any[],
  personalTriggers: EnvironmentalTrigger[],
  tomorrowWeather: any
): PredictionResult => {
  if (symptoms.length < 3) {
    return {
      tomorrow_predictions: {
        hot_flashes: { likelihood: 50 },
        sleep_quality: { likelihood: 50 },
        mood: { likelihood: 50 },
        headaches: { likelihood: 50 }
      },
      tomorrow_reason: 'Недостаточно данных для точного прогноза',
      weekly_trend: 'stable',
      confidence: 30,
      preparation_tips: ['Продолжайте вести дневник симптомов']
    };
  }

  // Базовые вероятности на основе исторических данных
  const recentSymptoms = symptoms.slice(-7);
  const avgHotFlashes = recentSymptoms.reduce((sum, s) => sum + (s.hotFlashes?.count || 0), 0) / recentSymptoms.length;
  const avgSleepQuality = recentSymptoms.reduce((sum, s) => sum + (s.sleep?.quality || 3), 0) / recentSymptoms.length;
  const avgMood = recentSymptoms.reduce((sum, s) => sum + (s.mood?.overall || 3), 0) / recentSymptoms.length;

  // Корректировки на основе завтрашней погоды
  let hotFlashRisk = (avgHotFlashes / 10) * 100; // Преобразуем в процент
  let sleepQualityRisk = ((5 - avgSleepQuality) / 5) * 100;
  let moodRisk = ((5 - avgMood) / 5) * 100;
  let headacheRisk = 30; // Базовая вероятность

  let reasons: string[] = [];

  // Анализ атмосферного давления
  if (tomorrowWeather?.pressure < 1000) {
    hotFlashRisk += 25;
    headacheRisk += 20;
    reasons.push('низкое атмосферное давление');
  }

  // Анализ влажности
  if (tomorrowWeather?.humidity > 70) {
    sleepQualityRisk += 30;
    reasons.push('высокая влажность');
  } else if (tomorrowWeather?.humidity < 30) {
    hotFlashRisk += 15;
    reasons.push('низкая влажность');
  }

  // Анализ температуры
  if (tomorrowWeather?.temperature > 25) {
    hotFlashRisk += 20;
    reasons.push('высокая температура');
  }

  // Ограничиваем значения в пределах 0-100
  hotFlashRisk = Math.min(100, Math.max(0, hotFlashRisk));
  sleepQualityRisk = Math.min(100, Math.max(0, sleepQualityRisk));
  moodRisk = Math.min(100, Math.max(0, moodRisk));
  headacheRisk = Math.min(100, Math.max(0, headacheRisk));

  const tomorrow_reason = reasons.length > 0 
    ? `Прогноз основан на: ${reasons.join(', ')}`
    : 'Погодные условия благоприятные';

  const preparation_tips: string[] = [];
  
  if (hotFlashRisk > 60) {
    preparation_tips.push('Носите многослойную одежду');
    preparation_tips.push('Подготовьте вентилятор или охлаждающие средства');
  }
  
  if (sleepQualityRisk > 60) {
    preparation_tips.push('Обеспечьте хорошую вентиляцию спальни');
    preparation_tips.push('Избегайте кофеина во второй половине дня');
  }
  
  if (moodRisk > 60) {
    preparation_tips.push('Планируйте приятные активности');
    preparation_tips.push('Практикуйте техники релаксации');
  }

  if (preparation_tips.length === 0) {
    preparation_tips.push('Погодные условия благоприятные - используйте день активно!');
  }

  return {
    tomorrow_predictions: {
      hot_flashes: { 
        likelihood: Math.round(hotFlashRisk),
        predicted_value: Math.round((hotFlashRisk / 100) * (avgHotFlashes + 2))
      },
      sleep_quality: { 
        likelihood: Math.round(sleepQualityRisk),
        predicted_value: Math.round(5 - (sleepQualityRisk / 100) * 2)
      },
      mood: { 
        likelihood: Math.round(moodRisk),
        predicted_value: Math.round(5 - (moodRisk / 100) * 2)
      },
      headaches: { 
        likelihood: Math.round(headacheRisk)
      }
    },
    tomorrow_reason,
    weekly_trend: 'stable', // Можно добавить более сложную логику
    confidence: Math.round(Math.min(90, 40 + (symptoms.length * 2))),
    preparation_tips
  };
};

export const generateWeatherAlerts = (
  currentWeather: any,
  forecast: any,
  personalSensitivity: EnvironmentalTrigger[]
): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const showUntil = tomorrow.toISOString();

  // Предупреждение о падении давления
  if (forecast?.pressure && currentWeather?.pressure && 
      (currentWeather.pressure - forecast.pressure) > 5) {
    alerts.push({
      type: 'pressure_drop',
      severity: 'warning',
      title: 'Падение атмосферного давления',
      message: `Завтра ожидается снижение давления на ${Math.round(currentWeather.pressure - forecast.pressure)} hPa. Это может усилить приливы.`,
      action: 'Подготовьтесь: носите многослойную одежду, избегайте горячих напитков.',
      showUntil
    });
  }

  // Предупреждение о высокой влажности
  if (forecast?.humidity > 75) {
    alerts.push({
      type: 'high_humidity',
      severity: 'info',
      title: 'Высокая влажность',
      message: `Завтра влажность достигнет ${forecast.humidity}%. Это может ухудшить качество сна.`,
      action: 'Используйте осушитель воздуха, проветрите спальню перед сном.',
      showUntil
    });
  }

  // Предупреждение об УФ-излучении
  if (forecast?.uv_index > 6) {
    alerts.push({
      type: 'uv_warning',
      severity: 'warning',
      title: 'Высокий УФ-индекс',
      message: `УФ-индекс завтра: ${forecast.uv_index}. Высокий риск солнечных ожогов.`,
      action: 'Используйте солнцезащитный крем, носите головной убор, ограничьте время на солнце.',
      showUntil
    });
  }

  return alerts;
};

const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n === 0 || n !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};

export type { 
  EnvironmentalInsight, 
  EnvironmentalTrigger, 
  PredictionResult, 
  WeatherAlert 
};