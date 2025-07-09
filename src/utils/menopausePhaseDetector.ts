
import { OnboardingData, MenopausePhase, PhaseResult } from '@/types/onboarding';

export function detectMenopausePhase(data: OnboardingData): PhaseResult {
  const { basicInfo, menstrualHistory, symptoms } = data;
  
  if (!basicInfo || !menstrualHistory) {
    return {
      phase: MenopausePhase.PREMENOPAUSE,
      confidence: 0,
      reasoning: ['Недостаточно данных для анализа'],
      recommendations: ['Пожалуйста, заполните базовую информацию']
    };
  }

  const age = basicInfo.age;
  const reasoning: string[] = [];
  const recommendations: string[] = [];

  // Анализ отсутствия менструации
  const monthsSinceLastPeriod = menstrualHistory.lastPeriodDate 
    ? Math.floor((new Date().getTime() - new Date(menstrualHistory.lastPeriodDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null;

  // Подсчет симптомов
  const symptomScore = calculateSymptomScore(symptoms);

  // Определение фазы
  if (menstrualHistory.hasStoppedCompletely && monthsSinceLastPeriod && monthsSinceLastPeriod >= 12) {
    reasoning.push(`Отсутствие менструации более ${monthsSinceLastPeriod} месяцев`);
    
    if (age >= 55) {
      reasoning.push('Возраст указывает на постменопаузу');
      recommendations.push('Регулярное наблюдение у гинеколога');
      recommendations.push('Профилактика остеопороза и сердечно-сосудистых заболеваний');
      
      return {
        phase: MenopausePhase.POSTMENOPAUSE,
        confidence: 95,
        reasoning,
        recommendations
      };
    } else {
      recommendations.push('Подтверждение статуса менопаузы анализами');
      recommendations.push('Обсуждение заместительной гормональной терапии');
      
      return {
        phase: MenopausePhase.MENOPAUSE,
        confidence: 90,
        reasoning,
        recommendations
      };
    }
  }

  // Перименопауза
  if (age >= 45 && (!menstrualHistory.isPeriodsRegular || symptomScore >= 5)) {
    reasoning.push('Возраст и симптомы указывают на перименопаузу');
    if (!menstrualHistory.isPeriodsRegular) {
      reasoning.push('Нерегулярные менструальные циклы');
    }
    if (symptomScore >= 5) {
      reasoning.push('Выраженные симптомы менопаузы');
    }
    
    recommendations.push('Отслеживание менструального цикла');
    recommendations.push('Управление симптомами');
    recommendations.push('Консультация с гинекологом');
    
    return {
      phase: MenopausePhase.PERIMENOPAUSE,
      confidence: 80,
      reasoning,
      recommendations
    };
  }

  // Пременопауза
  reasoning.push('Регулярные циклы и минимум симптомов указывают на пременопаузу');
  recommendations.push('Поддержание здорового образа жизни');
  recommendations.push('Регулярные профилактические осмотры');
  
  return {
    phase: MenopausePhase.PREMENOPAUSE,
    confidence: 75,
    reasoning,
    recommendations
  };
}

function calculateSymptomScore(symptoms: any): number {
  if (!symptoms) return 0;
  
  let score = 0;
  
  // Приливы
  if (symptoms.hotFlashes?.frequency === 'daily') score += 3;
  else if (symptoms.hotFlashes?.frequency === 'often') score += 2;
  else if (symptoms.hotFlashes?.frequency === 'sometimes') score += 1;
  
  // Ночная потливость
  if (symptoms.nightSweats?.frequency === 'daily') score += 3;
  else if (symptoms.nightSweats?.frequency === 'often') score += 2;
  else if (symptoms.nightSweats?.frequency === 'sometimes') score += 1;
  
  // Проблемы со сном
  if (symptoms.sleepProblems?.frequency === 'daily') score += 2;
  else if (symptoms.sleepProblems?.frequency === 'often') score += 1;
  
  // Перепады настроения
  if (symptoms.moodChanges?.frequency === 'daily') score += 2;
  else if (symptoms.moodChanges?.frequency === 'often') score += 1;
  
  // Физические симптомы
  score += (symptoms.physicalSymptoms?.length || 0) * 0.5;
  
  // Когнитивные симптомы
  score += (symptoms.cognitiveSymptoms?.length || 0) * 0.5;
  
  return Math.round(score);
}

// ✅ НОВОЕ: Добавляем функцию для расчета месяцев без менструации
function getMonthsSinceLastPeriod(lastPeriodDate: string | null): number {
  if (!lastPeriodDate) return 0;
  
  const lastDate = new Date(lastPeriodDate);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - lastDate.getFullYear()) * 12 + 
                     (now.getMonth() - lastDate.getMonth());
  
  return Math.max(0, monthsDiff);
}

// ✅ НОВОЕ: Добавляем функцию генерации рекомендаций по фазе
function generateRecommendations(phase: MenopausePhase, data: OnboardingData): string[] {
  const recommendations: string[] = [];
  
  switch (phase) {
    case MenopausePhase.PREMENOPAUSE:
      recommendations.push('Поддерживайте здоровый образ жизни');
      recommendations.push('Регулярные профилактические осмотры у гинеколога');
      recommendations.push('Следите за изменениями менструального цикла');
      break;
      
    case MenopausePhase.PERIMENOPAUSE:
      recommendations.push('Отслеживайте менструальный цикл');
      recommendations.push('Управление симптомами через питание и физические упражнения');
      recommendations.push('Консультация с гинекологом о возможных методах поддержки');
      recommendations.push('Рассмотрите прием кальция и витамина D');
      break;
      
    case MenopausePhase.MENOPAUSE:
      recommendations.push('Подтверждение статуса менопаузы анализами (ФСГ, ЛГ)');
      recommendations.push('Обсуждение заместительной гормональной терапии с врачом');
      recommendations.push('Профилактика остеопороза');
      recommendations.push('Поддержка сердечно-сосудистого здоровья');
      break;
      
    case MenopausePhase.POSTMENOPAUSE:
      recommendations.push('Регулярное наблюдение у гинеколога и кардиолога');
      recommendations.push('Профилактика остеопороза и сердечно-сосудистых заболеваний');
      recommendations.push('Маммографический скрининг');
      recommendations.push('Поддержание активного образа жизни');
      break;
  }
  
  return recommendations;
}

export function getPhaseName(phase: MenopausePhase): string {
  switch (phase) {
    case MenopausePhase.PREMENOPAUSE:
      return 'Пременопауза';
    case MenopausePhase.PERIMENOPAUSE:
      return 'Перименопауза';
    case MenopausePhase.MENOPAUSE:
      return 'Менопауза';
    case MenopausePhase.POSTMENOPAUSE:
      return 'Постменопауза';
    default:
      return 'Неопределено';
  }
}

export function getPhaseDescription(phase: MenopausePhase): string {
  switch (phase) {
    case MenopausePhase.PREMENOPAUSE:
      return 'Репродуктивный период с регулярными менструальными циклами. Симптомы менопаузы отсутствуют или минимальны.';
    case MenopausePhase.PERIMENOPAUSE:
      return 'Переходный период к менопаузе. Возможны нерегулярные циклы и первые симптомы менопаузы.';
    case MenopausePhase.MENOPAUSE:
      return 'Отсутствие менструации в течение 12 месяцев подряд. Симптомы могут быть выраженными.';
    case MenopausePhase.POSTMENOPAUSE:
      return 'Период после менопаузы. Симптомы могут продолжаться, важна профилактика возрастных заболеваний.';
    default:
      return '';
  }
}
