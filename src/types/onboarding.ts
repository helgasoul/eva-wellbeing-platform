
export interface BasicInfo {
  age: number;
  height: number; // см
  weight: number; // кг
  location: string; // город
  occupation: string;
  hasChildren: boolean;
  childrenCount?: number;
}

export interface MenstrualHistory {
  ageOfFirstPeriod: number;
  averageCycleLength: number; // дни
  lastPeriodDate: string | null;
  isPeriodsRegular: boolean;
  hasStoppedCompletely: boolean;
  whenStoppedCompletely?: string;
  pregnanciesCount: number;
  lastPregnancyYear?: number;
}

export interface MenopauseSymptoms {
  hotFlashes: {
    frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    severity: number; // 1-10
    triggers?: string[]; // ['stress', 'heat', 'alcohol', 'caffeine', 'spicy_food']
  };
  nightSweats: {
    frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    severity: number;
  };
  sleepProblems: {
    frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    types: string[]; // ['difficulty_falling_asleep', 'frequent_waking', 'early_waking']
    sleepQuality?: number; // 1-10
  };
  moodChanges: {
    frequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
    types: string[]; // ['irritability', 'anxiety', 'depression', 'mood_swings']
  };
  physicalSymptoms: string[]; // ['joint_pain', 'headaches', 'fatigue', 'weight_gain', 'dry_skin', 'none_of_the_above']
  cognitiveSymptoms: string[]; // ['memory_issues', 'concentration_problems', 'brain_fog', 'none_of_the_above']
}

export interface MedicalHistory {
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  isOnHRT: boolean;
  hrtDetails?: {
    type: string;
    startDate: string;
    satisfaction: number; // 1-10
  };
  chronicConditions: string[]; // ['diabetes', 'hypertension', 'thyroid', 'heart_disease', 'none_of_the_above']
  familyHistory: {
    breastCancer: boolean;
    ovairianCancer: boolean;
    heartDisease: boolean;
    osteoporosis: boolean;
    earlyMenopause: boolean;
    noneOfTheAbove: boolean; // New field for "none of the above"
  };
  surgicalHistory: string[]; // ['hysterectomy', 'ovary_removal', 'breast_surgery', 'none_of_the_above']
}

export interface LifestyleInfo {
  exerciseFrequency: 'never' | 'rarely' | '1-2_weekly' | '3-4_weekly' | 'daily';
  exerciseTypes: string[]; // ['cardio', 'strength', 'yoga', 'walking', 'none_of_the_above']
  dietType: 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'mediterranean' | 'other';
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'never' | 'rarely' | 'moderate' | 'frequent';
  stressLevel: number; // 1-10
  sleepHours: number;
  supplementsUsed: string[]; // ['Витамин D', 'Кальций', 'Магний', 'Омега-3', 'Мультивитамины', 'Фитоэстрогены', 'none_of_the_above']
}

export interface GoalsAndPriorities {
  primaryConcerns: string[]; // ['symptom_management', 'weight_control', 'bone_health', 'heart_health']
  goals: string[]; // ['reduce_hot_flashes', 'improve_sleep', 'maintain_weight', 'prevent_diseases']
  preferredApproach: 'medical' | 'natural' | 'combination';
  informationPreferences: string[]; // ['research_based', 'peer_experiences', 'doctor_advice']
  communicationFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
}

export interface LocationData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  region?: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    uv_index: number;
    wind_speed: number;
    weather_condition: string;
  };
  today: {
    temperature_max: number;
    temperature_min: number;
    precipitation: number;
    sunrise: string;
    sunset: string;
  };
  air_quality: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
  };
}

export interface GeolocationInfo {
  location: LocationData;
  weather: WeatherData;
  recordedAt: string;
}

export interface OnboardingData {
  basicInfo?: BasicInfo;
  geolocation?: GeolocationInfo;
  menstrualHistory?: MenstrualHistory;
  symptoms?: MenopauseSymptoms;
  medicalHistory?: MedicalHistory;
  lifestyle?: LifestyleInfo;
  goals?: GoalsAndPriorities;
  // ✅ НОВОЕ: Поля для персонализации
  registrationPersona?: string;
  fromRegistration?: boolean;
  expectedPath?: any;
  onboardingConfig?: {
    estimatedDuration?: string;
    prioritySteps?: number[];
    customQuestions?: any;
    skipValidations?: string[];
    prefilledSections?: string[];
  };
}

export enum MenopausePhase {
  PREMENOPAUSE = 'premenopause',
  PERIMENOPAUSE = 'perimenopause',
  MENOPAUSE = 'menopause',
  POSTMENOPAUSE = 'postmenopause'
}

export interface PhaseResult {
  phase: MenopausePhase;
  confidence: number; // 0-100%
  reasoning: string[];
  recommendations: string[];
}

export interface PersonalizedRecommendations {
  immediateActions: string[];
  lifestyleChanges: string[];
  medicalConsultations: string[];
  trackingPriorities: string[];
  educationalResources: string[];
}
