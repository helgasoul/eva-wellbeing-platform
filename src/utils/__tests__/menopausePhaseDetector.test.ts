import { describe, it, expect } from 'vitest';
import { detectMenopausePhase } from '../menopausePhaseDetector';
import { MenopausePhase, OnboardingData } from '@/types/onboarding';

function monthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString();
}

describe('detectMenopausePhase', () => {
  it('returns premenopause for regular cycles and minimal symptoms', () => {
    const data: OnboardingData = {
      basicInfo: {
        age: 35,
        height: 170,
        weight: 65,
        location: 'city',
        occupation: 'job',
        hasChildren: false
      },
      menstrualHistory: {
        ageOfFirstPeriod: 13,
        averageCycleLength: 28,
        lastPeriodDate: monthsAgo(1),
        isPeriodsRegular: true,
        hasStoppedCompletely: false,
        pregnanciesCount: 0
      },
      symptoms: {
        hotFlashes: { frequency: 'never', severity: 0 },
        nightSweats: { frequency: 'never', severity: 0 },
        sleepProblems: { frequency: 'never', types: [] },
        moodChanges: { frequency: 'never', types: [] },
        physicalSymptoms: [],
        cognitiveSymptoms: []
      }
    };
    const result = detectMenopausePhase(data);
    expect(result.phase).toBe(MenopausePhase.PREMENOPAUSE);
  });

  it('detects perimenopause for irregular periods and symptoms', () => {
    const data: OnboardingData = {
      basicInfo: {
        age: 47,
        height: 165,
        weight: 60,
        location: 'city',
        occupation: 'job',
        hasChildren: true,
        childrenCount: 2
      },
      menstrualHistory: {
        ageOfFirstPeriod: 12,
        averageCycleLength: 30,
        lastPeriodDate: monthsAgo(2),
        isPeriodsRegular: false,
        hasStoppedCompletely: false,
        pregnanciesCount: 2
      },
      symptoms: {
        hotFlashes: { frequency: 'often', severity: 6 },
        nightSweats: { frequency: 'often', severity: 5 },
        sleepProblems: { frequency: 'often', types: ['difficulty_falling_asleep'] },
        moodChanges: { frequency: 'often', types: ['irritability'] },
        physicalSymptoms: ['joint_pain'],
        cognitiveSymptoms: []
      }
    };
    const result = detectMenopausePhase(data);
    expect(result.phase).toBe(MenopausePhase.PERIMENOPAUSE);
  });

  it('detects menopause when periods stopped for over a year', () => {
    const data: OnboardingData = {
      basicInfo: {
        age: 52,
        height: 165,
        weight: 62,
        location: 'city',
        occupation: 'job',
        hasChildren: true
      },
      menstrualHistory: {
        ageOfFirstPeriod: 12,
        averageCycleLength: 28,
        lastPeriodDate: monthsAgo(14),
        isPeriodsRegular: false,
        hasStoppedCompletely: true,
        pregnanciesCount: 2
      },
      symptoms: {
        hotFlashes: { frequency: 'sometimes', severity: 3 },
        nightSweats: { frequency: 'sometimes', severity: 3 },
        sleepProblems: { frequency: 'sometimes', types: [] },
        moodChanges: { frequency: 'sometimes', types: [] },
        physicalSymptoms: [],
        cognitiveSymptoms: []
      }
    };
    const result = detectMenopausePhase(data);
    expect(result.phase).toBe(MenopausePhase.MENOPAUSE);
  });
});
