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

interface CycleInfo {
  id: string;
  start_date: string;
  end_date: string;
  length: number;
  index: number;
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

// Расчет циклов на основе записей
export const calculateCycles = (entries: MenstrualEntry[], period: string): CycleInfo[] => {
  const menstruationEntries = entries
    .filter(e => e.type === 'menstruation')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (menstruationEntries.length < 2) return [];

  const cycles: CycleInfo[] = [];
  
  for (let i = 1; i < menstruationEntries.length; i++) {
    const startDate = new Date(menstruationEntries[i-1].date);
    const endDate = new Date(menstruationEntries[i].date);
    const length = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (length > 15 && length < 60) { // Фильтр разумных длин циклов
      cycles.push({
        id: `cycle_${i}`,
        start_date: menstruationEntries[i-1].date,
        end_date: menstruationEntries[i].date,
        length,
        index: i
      });
    }
  }

  // Фильтр по выбранному периоду
  const cutoffDate = new Date();
  const daysToSubtract = period === '3months' ? 90 : period === '6months' ? 180 : 365;
  cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
  
  return cycles.filter(cycle => new Date(cycle.start_date) >= cutoffDate);
};

// Расчет дня цикла для конкретной даты
export const calculateDayOfCycle = (date: string, entries: MenstrualEntry[]): number | null => {
  const targetDate = new Date(date);
  const menstruationEntries = entries
    .filter(e => e.type === 'menstruation')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Найти последнюю менструацию до или в день target date
  const lastPeriod = menstruationEntries.find(e => new Date(e.date) <= targetDate);
  
  if (!lastPeriod) return null;

  const lastPeriodDate = new Date(lastPeriod.date);
  const daysDiff = Math.round((targetDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysDiff + 1; // День 1 = первый день менструации
};

// Определение фазы цикла
export const determineCyclePhase = (dayOfCycle: number, averageCycleLength: number): string => {
  if (dayOfCycle <= 5) return 'menstrual';
  if (dayOfCycle <= averageCycleLength / 2 - 3) return 'follicular';
  if (dayOfCycle <= averageCycleLength / 2 + 3) return 'ovulatory';
  return 'luteal';
};

// Расчет предполагаемой овуляции
export const calculateEstimatedOvulation = (analysis: CycleAnalysis): string | null => {
  if (!analysis?.current_cycle) return null;
  
  const currentCycleStart = new Date(analysis.current_cycle.start_date);
  const estimatedOvulationDay = Math.round(analysis.current_cycle.estimated_length / 2);
  
  const ovulationDate = new Date(currentCycleStart);
  ovulationDate.setDate(ovulationDate.getDate() + estimatedOvulationDay - 1);
  
  return ovulationDate.toISOString().split('T')[0];
};

// Анализ симптомов по фазам цикла
export const analyzeSymptomsByPhase = (entries: MenstrualEntry[]): Record<string, Record<string, number>> => {
  const symptomsByPhase: Record<string, Record<string, number>> = {};
  
  // Получаем данные симптомов из трекера симптомов
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user.id}`) || '[]');
  
  symptomEntries.forEach((symptomEntry: any) => {
    const dayOfCycle = calculateDayOfCycle(symptomEntry.date, entries);
    if (!dayOfCycle) return;
    
    const phase = determineCyclePhase(dayOfCycle, 28); // Используем средний цикл 28 дней
    
    if (!symptomsByPhase[phase]) {
      symptomsByPhase[phase] = {};
    }
    
    // Агрегируем симптомы
    if (symptomEntry.hotFlashes?.count > 0) {
      symptomsByPhase[phase].hot_flashes = (symptomsByPhase[phase].hot_flashes || 0) + 1;
    }
    
    if (symptomEntry.mood?.overall) {
      symptomsByPhase[phase].mood = ((symptomsByPhase[phase].mood || 0) + symptomEntry.mood.overall) / 2;
    }
    
    if (symptomEntry.sleep?.quality) {
      symptomsByPhase[phase].sleep = ((symptomsByPhase[phase].sleep || 0) + symptomEntry.sleep.quality) / 2;
    }
    
    if (symptomEntry.energy) {
      symptomsByPhase[phase].energy = ((symptomsByPhase[phase].energy || 0) + symptomEntry.energy) / 2;
    }
  });
  
  return symptomsByPhase;
};

// Вариабельность цикла
export const calculateCycleVariability = (entries: MenstrualEntry[]): number => {
  const cycles = calculateCycles(entries, '1year');
  if (cycles.length < 3) return 0;
  
  const lengths = cycles.map(c => c.length);
  const average = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - average, 2), 0) / lengths.length;
  
  return Math.sqrt(variance) / average; // Коэффициент вариации
};

// Получение названий фаз и стадий
export const getPhaseName = (phase: string): string => {
  const phaseNames: Record<string, string> = {
    menstrual: 'Менструальная',
    follicular: 'Фолликулярная', 
    ovulatory: 'Овуляторная',
    luteal: 'Лютеиновая',
    irregular: 'Нерегулярная'
  };
  return phaseNames[phase] || 'Неизвестно';
};

export const getStageLabel = (stage: string): string => {
  const stageLabels: Record<string, string> = {
    premenopause: 'Пременопауза',
    early_perimenopause: 'Ранняя перименопауза',
    late_perimenopause: 'Поздняя перименопауза', 
    menopause: 'Менопауза',
    postmenopause: 'Постменопауза'
  };
  return stageLabels[stage] || 'Определение...';
};

export const getRegularityDescription = (irregularityScore: number): string => {
  if (irregularityScore < 20) return 'Очень регулярный';
  if (irregularityScore < 40) return 'Регулярный';
  if (irregularityScore < 60) return 'Умеренно нерегулярный';
  if (irregularityScore < 80) return 'Нерегулярный';
  return 'Очень нерегулярный';
};

// Рекомендации по стадиям
export const getStageRecommendations = (stage: string): string[] => {
  const recommendations: Record<string, string[]> = {
    premenopause: [
      'Ведите дневник циклов для раннего выявления изменений',
      'Поддерживайте здоровый образ жизни',
      'Регулярные профилактические осмотры у гинеколога'
    ],
    early_perimenopause: [
      'Обратитесь к гинекологу для обследования',
      'Рассмотрите добавки кальция и витамина D',
      'Обсудите с врачом возможность ЗГТ'
    ],
    late_perimenopause: [
      'Консультация эндокринолога-гинеколога',
      'Контроль плотности костной ткани',
      'Поддержка сердечно-сосудистой системы'
    ],
    menopause: [
      'Подтверждение диагноза с врачом',
      'Обсуждение долгосрочной ЗГТ',
      'Профилактика остеопороза и ССЗ'
    ]
  };
  
  return recommendations[stage] || ['Проконсультируйтесь с врачом'];
};

// Совет дня на основе фазы цикла
export const getDailyTip = (cycleAnalysis: CycleAnalysis | null): string => {
  if (!cycleAnalysis?.current_cycle) {
    return 'Начните отслеживать цикл, чтобы получать персональные советы каждый день!';
  }
  
  const phase = cycleAnalysis.current_cycle.phase;
  const dayOfCycle = cycleAnalysis.current_cycle.day_of_cycle;
  
  const tips: Record<string, string[]> = {
    menstrual: [
      'Пейте больше воды и отдыхайте. Легкая йога поможет с болями.',
      'Железосодержащие продукты помогут восстановить уровень железа.',
      'Теплая ванна или грелка облегчат спазмы.'
    ],
    follicular: [
      'Отличное время для новых проектов и физических нагрузок!',
      'Уровень эстрогена растет - вы чувствуете прилив энергии.',
      'Хорошее время для планирования и принятия решений.'
    ],
    ovulatory: [
      'Пик фертильности и энергии. Отличное время для важных дел!',
      'Повышенное либидо и коммуникабельность - это нормально.',
      'Следите за изменениями выделений - признак овуляции.'
    ],
    luteal: [
      'Время замедлиться и сосредоточиться на самозаботе.',
      'Уменьшите потребление кофеина и сахара для стабильного настроения.',
      'Легкие упражнения помогут справиться с ПМС.'
    ]
  };
  
  const phaseTips = tips[phase] || tips.menstrual;
  return phaseTips[Math.floor(Math.random() * phaseTips.length)];
};

// Генерация рекомендаций по циклу
export const generateCycleRecommendations = (analysis: CycleAnalysis): any[] => {
  const recommendations = [];
  
  // Рекомендации по регулярности
  if (analysis.cycle_history.irregularity_score > 40) {
    recommendations.push({
      icon: '📅',
      title: 'Регулярность цикла',
      items: [
        'Обратитесь к гинекологу для обследования',
        'Ведите дневник стресса и питания',
        'Рассмотрите влияние веса и физических нагрузок'
      ]
    });
  }
  
  // Рекомендации по стадии
  recommendations.push({
    icon: '🌸',
    title: 'Для вашей стадии',
    items: getStageRecommendations(analysis.perimenopause_indicators.probable_stage)
  });
  
  // Рекомендации по образу жизни
  recommendations.push({
    icon: '💪',
    title: 'Образ жизни',
    items: [
      'Регулярные кардиотренировки 3-4 раза в неделю',
      'Достаточное потребление кальция (1200 мг/день)',
      'Управление стрессом через медитацию или йогу'
    ]
  });
  
  // Рекомендации по питанию
  recommendations.push({
    icon: '🥗',
    title: 'Питание',
    items: [
      'Увеличьте потребление омега-3 жирных кислот',
      'Ограничьте кофеин до 200 мг в день',
      'Включите продукты, богатые фитоэстрогенами'
    ]
  });
  
  return recommendations;
};