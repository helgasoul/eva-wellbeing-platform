import { OnboardingData, MenopausePhase, PersonalizedRecommendations } from '@/types/onboarding';
import { generateRecommendations } from '@/utils/personalizedRecommendations';

export interface Recommendation {
  id: string;
  type: 'lifestyle' | 'medical' | 'nutrition' | 'exercise' | 'mental_health';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionSteps: string[];
  basedOn: string[];
  phaseSpecific: boolean;
  icon?: string;
}

export interface GoalProgress {
  goal: string;
  name: string;
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  icon?: string;
  unit?: string;
}

export interface UserAnalysis {
  phase: MenopausePhase;
  riskFactors: string[];
  symptoms: string[];
  goals: string[];
  healthScore: number;
}

export interface PersonalizationService {
  analyzeUserProfile(onboardingData: OnboardingData): UserAnalysis;
  generatePhaseRecommendations(userProfile: UserAnalysis): Recommendation[];
  calculateGoalProgress(goals: string[], symptomEntries: any[]): GoalProgress[];
  calculateHealthScore(userData: OnboardingData): number;
  getPersonalizedGreeting(userData: OnboardingData): string;
}

export class PersonalizationEngine implements PersonalizationService {
  analyzeUserProfile(onboardingData: OnboardingData): UserAnalysis {
    const phase = onboardingData.basicInfo?.age ? this.determinePhase(onboardingData) : MenopausePhase.PREMENOPAUSE;
    
    return {
      phase,
      riskFactors: this.extractRiskFactors(onboardingData),
      symptoms: this.extractCurrentSymptoms(onboardingData),
      goals: onboardingData.goals?.goals || [],
      healthScore: this.calculateHealthScore(onboardingData)
    };
  }

  private determinePhase(onboardingData: OnboardingData): MenopausePhase {
    const menstrualHistory = onboardingData.menstrualHistory;
    const age = onboardingData.basicInfo?.age || 45;
    
    if (!menstrualHistory) return MenopausePhase.PREMENOPAUSE;
    
    if (menstrualHistory.hasStoppedCompletely) {
      const stoppedDate = menstrualHistory.whenStoppedCompletely;
      if (stoppedDate) {
        const monthsStopped = this.getMonthsSince(stoppedDate);
        return monthsStopped >= 12 ? MenopausePhase.POSTMENOPAUSE : MenopausePhase.MENOPAUSE;
      }
    }
    
    if (!menstrualHistory.isPeriodsRegular || age >= 45) {
      return MenopausePhase.PERIMENOPAUSE;
    }
    
    return MenopausePhase.PREMENOPAUSE;
  }

  private getMonthsSince(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    return (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  }

  private extractRiskFactors(onboardingData: OnboardingData): string[] {
    const riskFactors: string[] = [];
    
    if (onboardingData.medicalHistory?.familyHistory?.earlyMenopause) {
      riskFactors.push('Ранняя менопауза в семье');
    }
    
    if (onboardingData.lifestyle?.smokingStatus === 'current') {
      riskFactors.push('Курение');
    }
    
    if (onboardingData.lifestyle?.stressLevel && onboardingData.lifestyle.stressLevel >= 7) {
      riskFactors.push('Высокий уровень стресса');
    }
    
    return riskFactors;
  }

  private extractCurrentSymptoms(onboardingData: OnboardingData): string[] {
    const symptoms: string[] = [];
    const symptomData = onboardingData.symptoms;
    
    if (!symptomData) return symptoms;
    
    if (symptomData.hotFlashes?.frequency === 'often' || symptomData.hotFlashes?.frequency === 'daily') {
      symptoms.push('Частые приливы');
    }
    
    if (symptomData.sleepProblems?.frequency === 'often' || symptomData.sleepProblems?.frequency === 'daily') {
      symptoms.push('Проблемы со сном');
    }
    
    if (symptomData.moodChanges?.frequency === 'often' || symptomData.moodChanges?.frequency === 'daily') {
      symptoms.push('Перепады настроения');
    }
    
    return symptoms;
  }

  generatePhaseRecommendations(userProfile: UserAnalysis): Recommendation[] {
    const phaseRecommendations: Record<MenopausePhase, Recommendation[]> = {
      [MenopausePhase.PREMENOPAUSE]: [
        {
          id: '1',
          type: 'lifestyle',
          priority: 'medium',
          title: 'Подготовка к переходному периоду',
          description: 'Начните отслеживать менструальный цикл и общее самочувствие',
          actionSteps: [
            'Ведите дневник менструального цикла',
            'Отслеживайте симптомы ПМС',
            'Поддерживайте здоровый образ жизни'
          ],
          basedOn: ['Возраст', 'Фаза менопаузы'],
          phaseSpecific: true,
          icon: 'calendar'
        },
        {
          id: '2',
          type: 'nutrition',
          priority: 'medium',
          title: 'Укрепление костей',
          description: 'Начните профилактику остеопороза с правильного питания',
          actionSteps: [
            'Увеличьте потребление кальция',
            'Добавьте витамин D',
            'Включите больше зелени в рацион'
          ],
          basedOn: ['Профилактика остеопороза'],
          phaseSpecific: true,
          icon: 'bone'
        }
      ],
      [MenopausePhase.PERIMENOPAUSE]: [
        {
          id: '3',
          type: 'lifestyle',
          priority: 'high',
          title: 'Управление приливами',
          description: 'Техники для снижения интенсивности и частоты приливов',
          actionSteps: [
            'Ведите дневник приливов',
            'Избегайте триггеров (острая пища, алкоголь)',
            'Практикуйте дыхательные техники'
          ],
          basedOn: ['Переходный период', 'Гормональные изменения'],
          phaseSpecific: true,
          icon: 'thermometer'
        },
        {
          id: '4',
          type: 'mental_health',
          priority: 'high',
          title: 'Поддержка эмоционального здоровья',
          description: 'Управление перепадами настроения и тревожностью',
          actionSteps: [
            'Практикуйте медитацию',
            'Регулярные физические упражнения',
            'Обратитесь к специалисту при необходимости'
          ],
          basedOn: ['Гормональные изменения', 'Эмоциональное состояние'],
          phaseSpecific: true,
          icon: 'heart'
        }
      ],
      [MenopausePhase.MENOPAUSE]: [
        {
          id: '5',
          type: 'medical',
          priority: 'high',
          title: 'Подтверждение статуса менопаузы',
          description: 'Консультация с врачом и необходимые анализы',
          actionSteps: [
            'Запишитесь к гинекологу',
            'Сдайте анализы на гормоны',
            'Обсудите варианты терапии'
          ],
          basedOn: ['Статус менопаузы', 'Медицинское наблюдение'],
          phaseSpecific: true,
          icon: 'stethoscope'
        }
      ],
      [MenopausePhase.POSTMENOPAUSE]: [
        {
          id: '6',
          type: 'medical',
          priority: 'high',
          title: 'Мониторинг здоровья костей',
          description: 'Регулярные проверки плотности костной ткани',
          actionSteps: [
            'Денситометрия раз в 2 года',
            'Контроль уровня кальция',
            'Регулярные физические нагрузки'
          ],
          basedOn: ['Постменопауза', 'Профилактика остеопороза'],
          phaseSpecific: true,
          icon: 'activity'
        }
      ]
    };

    return phaseRecommendations[userProfile.phase] || [];
  }

  calculateGoalProgress(goals: string[], symptomEntries: any[]): GoalProgress[] {
    const goalMap: Record<string, { name: string; icon: string; unit: string }> = {
      'reduce_hot_flashes': {
        name: 'Снижение приливов',
        icon: 'thermometer',
        unit: 'в день'
      },
      'improve_sleep': {
        name: 'Улучшение сна',
        icon: 'moon',
        unit: 'баллов'
      },
      'manage_mood': {
        name: 'Стабильность настроения',
        icon: 'heart',
        unit: 'баллов'
      },
      'weight_control': {
        name: 'Контроль веса',
        icon: 'activity',
        unit: 'кг'
      },
      'bone_health': {
        name: 'Здоровье костей',
        icon: 'bone',
        unit: 'баллов'
      }
    };

    return goals.map(goal => {
      const goalInfo = goalMap[goal];
      if (!goalInfo) return null;

      // Расчет прогресса на основе записей симптомов
      const progress = this.calculateSpecificGoalProgress(goal, symptomEntries);
      
      return {
        goal,
        name: goalInfo.name,
        progress,
        trend: progress >= 70 ? 'improving' : progress >= 40 ? 'stable' : 'declining',
        icon: goalInfo.icon,
        unit: goalInfo.unit
      };
    }).filter(Boolean) as GoalProgress[];
  }

  private calculateSpecificGoalProgress(goal: string, symptomEntries: any[]): number {
    // Базовая логика расчета прогресса
    // В реальном приложении здесь должна быть более сложная логика
    // анализа данных симптомов за определенный период
    
    const recentEntries = symptomEntries.slice(-7); // Последние 7 записей
    
    switch (goal) {
      case 'reduce_hot_flashes':
        // Анализ частоты приливов
        return Math.max(0, 100 - (recentEntries.length * 10));
      case 'improve_sleep':
        // Анализ качества сна
        return 60 + Math.random() * 30;
      case 'manage_mood':
        // Анализ настроения
        return 55 + Math.random() * 35;
      default:
        return 50 + Math.random() * 40;
    }
  }

  calculateHealthScore(userData: OnboardingData): number {
    let score = 70; // Базовый балл
    
    // Факторы, влияющие на балл
    const lifestyle = userData.lifestyle;
    
    if (lifestyle?.exerciseFrequency === 'daily') score += 10;
    else if (lifestyle?.exerciseFrequency === '3-4_weekly') score += 5;
    
    if (lifestyle?.smokingStatus === 'never') score += 5;
    else if (lifestyle?.smokingStatus === 'current') score -= 10;
    
    if (lifestyle?.stressLevel && lifestyle.stressLevel <= 3) score += 5;
    else if (lifestyle?.stressLevel && lifestyle.stressLevel >= 8) score -= 10;
    
    if (lifestyle?.sleepHours && lifestyle.sleepHours >= 7) score += 5;
    else if (lifestyle?.sleepHours && lifestyle.sleepHours < 6) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  getPersonalizedGreeting(userData: OnboardingData): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
    const firstName = 'дорогая'; // Используем общее обращение, так как имя хранится в AuthContext
    
    const phase = this.determinePhase(userData);
    const phaseText = {
      [MenopausePhase.PREMENOPAUSE]: 'подготовкой к переходному периоду',
      [MenopausePhase.PERIMENOPAUSE]: 'переходным периодом',
      [MenopausePhase.MENOPAUSE]: 'менопаузой',
      [MenopausePhase.POSTMENOPAUSE]: 'постменопаузальным периодом'
    };
    
    return `${timeGreeting}, ${firstName}! Как дела с ${phaseText[phase]}?`;
  }
}

export const personalizationEngine = new PersonalizationEngine();