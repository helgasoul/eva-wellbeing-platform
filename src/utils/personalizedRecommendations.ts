
import { PhaseResult, MenopauseSymptoms, LifestyleInfo, PersonalizedRecommendations, MenopausePhase } from '@/types/onboarding';

export function generateRecommendations(
  phase: PhaseResult,
  symptoms: MenopauseSymptoms,
  lifestyle: LifestyleInfo
): PersonalizedRecommendations {
  const recommendations: PersonalizedRecommendations = {
    immediateActions: [],
    lifestyleChanges: [],
    medicalConsultations: [],
    trackingPriorities: [],
    educationalResources: []
  };

  // Базовые рекомендации по фазе
  addPhaseSpecificRecommendations(recommendations, phase.phase);
  
  // Рекомендации по симптомам
  addSymptomSpecificRecommendations(recommendations, symptoms);
  
  // Рекомендации по образу жизни
  addLifestyleRecommendations(recommendations, lifestyle);
  
  return recommendations;
}

function addPhaseSpecificRecommendations(rec: PersonalizedRecommendations, phase: MenopausePhase) {
  switch (phase) {
    case MenopausePhase.PREMENOPAUSE:
      rec.immediateActions.push('Начните отслеживать свой менструальный цикл');
      rec.lifestyleChanges.push('Поддерживайте здоровый вес');
      rec.medicalConsultations.push('Ежегодный осмотр у гинеколога');
      rec.trackingPriorities.push('Регулярность циклов', 'Общее самочувствие');
      rec.educationalResources.push('Подготовка к менопаузе: что нужно знать');
      break;
      
    case MenopausePhase.PERIMENOPAUSE:
      rec.immediateActions.push('Обратитесь к гинекологу для оценки состояния');
      rec.immediateActions.push('Рассмотрите варианты облегчения симптомов');
      rec.lifestyleChanges.push('Увеличьте потребление кальция и витамина D');
      rec.medicalConsultations.push('Консультация по заместительной гормональной терапии');
      rec.trackingPriorities.push('Частота и интенсивность приливов', 'Качество сна', 'Настроение');
      rec.educationalResources.push('Управление симптомами перименопаузы');
      break;
      
    case MenopausePhase.MENOPAUSE:
      rec.immediateActions.push('Подтвердите статус менопаузы анализами');
      rec.lifestyleChanges.push('Усильте профилактику остеопороза');
      rec.medicalConsultations.push('Обсуждение долгосрочной стратегии здоровья');
      rec.trackingPriorities.push('Костное здоровье', 'Сердечно-сосудистые риски');
      rec.educationalResources.push('Жизнь после менопаузы: новые возможности');
      break;
      
    case MenopausePhase.POSTMENOPAUSE:
      rec.immediateActions.push('Регулярный мониторинг плотности костной ткани');
      rec.lifestyleChanges.push('Поддерживайте активный образ жизни');
      rec.medicalConsultations.push('Кардиологический скрининг');
      rec.trackingPriorities.push('Физическая активность', 'Здоровье костей');
      rec.educationalResources.push('Активное долголетие после менопаузы');
      break;
  }
}

function addSymptomSpecificRecommendations(rec: PersonalizedRecommendations, symptoms: MenopauseSymptoms) {
  // Приливы
  if (symptoms.hotFlashes.frequency === 'often' || symptoms.hotFlashes.frequency === 'daily') {
    rec.immediateActions.push('Ведите дневник приливов для выявления триггеров');
    rec.lifestyleChanges.push('Избегайте известных триггеров (острая пища, алкоголь, стресс)');
    if (symptoms.hotFlashes.severity >= 7) {
      rec.medicalConsultations.push('Консультация по медикаментозному лечению приливов');
    }
  }

  // Проблемы со сном
  if (symptoms.sleepProblems.frequency === 'often' || symptoms.sleepProblems.frequency === 'daily') {
    rec.immediateActions.push('Создайте режим здорового сна');
    rec.lifestyleChanges.push('Избегайте кофеина после 14:00');
  }

  // Перепады настроения
  if (symptoms.moodChanges.frequency === 'often' || symptoms.moodChanges.frequency === 'daily') {
    rec.immediateActions.push('Рассмотрите техники управления стрессом');
    rec.lifestyleChanges.push('Регулярная медитация или йога');
    if (symptoms.moodChanges.types.includes('depression')) {
      rec.medicalConsultations.push('Консультация психотерапевта');
    }
  }

  // Когнитивные симптомы
  if (symptoms.cognitiveSymptoms.length > 0) {
    rec.lifestyleChanges.push('Упражнения для тренировки памяти и внимания');
    rec.educationalResources.push('Когнитивное здоровье в менопаузе');
  }
}

function addLifestyleRecommendations(rec: PersonalizedRecommendations, lifestyle: LifestyleInfo) {
  // Физическая активность
  if (lifestyle.exerciseFrequency === 'never' || lifestyle.exerciseFrequency === 'rarely') {
    rec.immediateActions.push('Начните с ежедневных прогулок по 30 минут');
    rec.lifestyleChanges.push('Постепенно увеличивайте физическую активность');
  }

  // Курение
  if (lifestyle.smokingStatus === 'current') {
    rec.immediateActions.push('Обратитесь за помощью в отказе от курения');
    rec.medicalConsultations.push('Консультация по программам отказа от курения');
  }

  // Алкоголь
  if (lifestyle.alcoholConsumption === 'frequent') {
    rec.lifestyleChanges.push('Сократите потребление алкоголя');
  }

  // Стресс
  if (lifestyle.stressLevel >= 7) {
    rec.immediateActions.push('Изучите техники управления стрессом');
    rec.lifestyleChanges.push('Регулярная практика релаксации');
  }

  // Сон
  if (lifestyle.sleepHours < 7) {
    rec.immediateActions.push('Улучшите гигиену сна');
    rec.lifestyleChanges.push('Стремитесь к 7-9 часам сна ежедневно');
  }
}
