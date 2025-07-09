// Продвинутая интеграция с Oura, Whoop, Libra с детальными метриками сна и восстановления
import { format, subDays } from 'date-fns';

export interface AdvancedSleepData {
  date: string;
  source: 'oura' | 'whoop' | 'libra' | 'apple_health' | 'fitbit';
  
  // Детальные фазы сна
  sleepPhases: {
    light: number;    // минуты
    deep: number;     // минуты  
    rem: number;      // минуты
    awake: number;    // минуты пробуждений
  };
  
  // Готовность и восстановление (Oura/Whoop специфика)
  readinessScore?: number;  // 0-100 (Oura)
  strainScore?: number;     // 0-21 (Whoop)
  recoveryScore?: number;   // 0-100 (Whoop)
  
  // Температурные тренды (важно для менопаузы)
  bodyTemperature: {
    deviation: number;      // отклонение от базовой температуры
    trend: 'rising' | 'falling' | 'stable';
    nightSweatsDetected: boolean;
  };
  
  // HRV и сердечные метрики
  heartRateVariability: {
    rmssd: number;          // основной показатель HRV
    averageHR: number;      // средний пульс во сне
    lowestHR: number;       // минимальный пульс
    trend: 'improving' | 'stable' | 'declining';
  };
  
  // Дыхательные метрики
  respiratoryRate?: number;  // дыханий в минуту
  oxygenSaturation?: number; // % насыщения кислородом (если доступно)
  
  // Женское здоровье (Libra специфика)
  menstrualCycleCorrelation?: {
    cycleDay?: number;
    phase?: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual';
    symptoms?: string[];
    moodImpact?: number;    // 1-10
  };
}

export interface RecoveryInsights {
  overallReadiness: number;         // 0-100
  sleepContribution: number;        // вклад сна в восстановление
  hrvContribution: number;          // вклад HRV
  temperatureContribution: number;  // вклад температуры тела
  
  // Рекомендации на основе данных
  recommendations: {
    sleepOptimization: string[];
    stressManagement: string[];
    menopauseSpecific: string[];
  };
  
  // Предсказания
  predictions: {
    sleepQualityTonight: number;     // 1-10
    energyLevelTomorrow: number;     // 1-10
    symptomLikelihood: {
      hotFlashes: number;            // 0-100%
      nightSweats: number;           // 0-100%
      moodChanges: number;           // 0-100%
    };
  };
}

class AdvancedWearableIntegration {
  private static instance: AdvancedWearableIntegration;
  
  static getInstance(): AdvancedWearableIntegration {
    if (!AdvancedWearableIntegration.instance) {
      AdvancedWearableIntegration.instance = new AdvancedWearableIntegration();
    }
    return AdvancedWearableIntegration.instance;
  }

  // Генерация продвинутых данных Oura Ring
  generateOuraData(date: string): AdvancedSleepData {
    const totalSleep = 7 + (Math.random() - 0.5) * 2; // 6-8 часов
    
    return {
      date,
      source: 'oura',
      sleepPhases: {
        light: Math.round(totalSleep * 60 * 0.5),   // 50% легкий сон
        deep: Math.round(totalSleep * 60 * 0.25),   // 25% глубокий сон
        rem: Math.round(totalSleep * 60 * 0.2),     // 20% REM сон
        awake: Math.round(totalSleep * 60 * 0.05)   // 5% пробуждения
      },
      readinessScore: Math.round(65 + Math.random() * 30), // 65-95
      bodyTemperature: {
        deviation: (Math.random() - 0.5) * 0.6, // ±0.3°C
        trend: Math.random() > 0.6 ? 'stable' : Math.random() > 0.5 ? 'rising' : 'falling',
        nightSweatsDetected: Math.random() < 0.25 // 25% вероятность
      },
      heartRateVariability: {
        rmssd: Math.round(25 + Math.random() * 30), // 25-55ms
        averageHR: Math.round(55 + Math.random() * 15), // 55-70 bpm
        lowestHR: Math.round(45 + Math.random() * 10), // 45-55 bpm
        trend: Math.random() > 0.6 ? 'stable' : Math.random() > 0.5 ? 'improving' : 'declining'
      },
      respiratoryRate: Math.round(12 + Math.random() * 6), // 12-18 breaths/min
      oxygenSaturation: Math.round(96 + Math.random() * 3) // 96-99%
    };
  }

  // Генерация продвинутых данных Whoop
  generateWhoopData(date: string): AdvancedSleepData {
    const data = this.generateOuraData(date);
    
    return {
      ...data,
      source: 'whoop',
      strainScore: Math.round(8 + Math.random() * 10), // 8-18 (умеренно-высокая нагрузка)
      recoveryScore: Math.round(60 + Math.random() * 35), // 60-95%
      readinessScore: undefined // Whoop не использует readiness
    };
  }

  // Генерация данных Libra (фокус на женском здоровье)
  generateLibraData(date: string): AdvancedSleepData {
    const data = this.generateOuraData(date);
    const cycleDay = Math.round(1 + Math.random() * 28); // день цикла
    
    let phase: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual';
    if (cycleDay <= 5) phase = 'menstrual';
    else if (cycleDay <= 13) phase = 'follicular';
    else if (cycleDay <= 17) phase = 'ovulatory';
    else phase = 'luteal';
    
    return {
      ...data,
      source: 'libra',
      menstrualCycleCorrelation: {
        cycleDay,
        phase,
        symptoms: phase === 'luteal' ? ['mood_changes', 'fatigue'] : 
                  phase === 'menstrual' ? ['cramps', 'fatigue'] : [],
        moodImpact: phase === 'luteal' ? Math.round(6 + Math.random() * 3) : 
                   Math.round(4 + Math.random() * 4)
      }
    };
  }

  // Анализ восстановления на основе всех метрик
  analyzeRecovery(sleepData: AdvancedSleepData[]): RecoveryInsights {
    if (sleepData.length === 0) {
      return {
        overallReadiness: 50,
        sleepContribution: 50,
        hrvContribution: 50,
        temperatureContribution: 50,
        recommendations: {
          sleepOptimization: ['Недостаточно данных для анализа'],
          stressManagement: ['Подключите устройство для получения рекомендаций'],
          menopauseSpecific: ['Собираем данные...']
        },
        predictions: {
          sleepQualityTonight: 5,
          energyLevelTomorrow: 5,
          symptomLikelihood: { hotFlashes: 30, nightSweats: 25, moodChanges: 40 }
        }
      };
    }

    const recent = sleepData.slice(0, 7); // последние 7 дней
    const avgReadiness = recent.reduce((sum, d) => sum + (d.readinessScore || d.recoveryScore || 70), 0) / recent.length;
    const avgHRV = recent.reduce((sum, d) => sum + d.heartRateVariability.rmssd, 0) / recent.length;
    const nightSweatsFreq = recent.filter(d => d.bodyTemperature.nightSweatsDetected).length / recent.length * 100;

    return {
      overallReadiness: Math.round(avgReadiness),
      sleepContribution: Math.round(avgReadiness * 0.6), // сон - 60% восстановления
      hrvContribution: Math.round(avgHRV / 50 * 100), // нормализуем HRV
      temperatureContribution: Math.round(100 - nightSweatsFreq * 2), // температурная стабильность
      
      recommendations: {
        sleepOptimization: [
          avgReadiness < 70 ? 'Увеличьте время сна до 7-8 часов' : 'Поддерживайте регулярный режим сна',
          'Избегайте экранов за 1 час до сна',
          'Поддерживайте прохладную температуру в спальне (18-20°C)'
        ],
        stressManagement: [
          avgHRV < 30 ? 'Попробуйте дыхательные упражнения' : 'Ваш уровень стресса в норме',
          'Регулярная медитация улучшает HRV',
          'Умеренная физическая активность снижает стресс'
        ],
        menopauseSpecific: [
          nightSweatsFreq > 30 ? 'Рассмотрите консультацию с гинекологом о ночной потливости' : 'Температурный режим стабилен',
          'Фитоэстрогены могут помочь с регуляцией температуры',
          'Ведите дневник триггеров приливов'
        ]
      },
      
      predictions: {
        sleepQualityTonight: Math.round(5 + (avgReadiness - 50) / 10),
        energyLevelTomorrow: Math.round(5 + (avgHRV - 30) / 5),
        symptomLikelihood: {
          hotFlashes: Math.round(nightSweatsFreq * 1.5),
          nightSweats: Math.round(nightSweatsFreq),
          moodChanges: Math.round(50 - avgHRV + nightSweatsFreq)
        }
      }
    };
  }

  // Получение данных за период
  async getAdvancedSleepData(days: number = 30): Promise<AdvancedSleepData[]> {
    const data: AdvancedSleepData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      
      // Имитируем разные устройства
      const deviceType = Math.random();
      let sleepData: AdvancedSleepData;
      
      if (deviceType < 0.4) {
        sleepData = this.generateOuraData(date);
      } else if (deviceType < 0.7) {
        sleepData = this.generateWhoopData(date);
      } else {
        sleepData = this.generateLibraData(date);
      }
      
      data.push(sleepData);
    }
    
    return data.reverse(); // сортируем по возрастанию даты
  }
}

export const advancedWearableIntegration = AdvancedWearableIntegration.getInstance();