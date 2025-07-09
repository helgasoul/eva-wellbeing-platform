export interface DataFlowCheck {
  stage: 'registration' | 'onboarding' | 'tracker' | 'recommendations';
  status: 'passed' | 'failed' | 'warning' | 'not_tested';
  data_present: boolean;
  data_integrity: number; // 0-100%
  missing_fields: string[];
  last_updated: string;
  data_size: number; // количество записей
  errors?: string[];
}

export interface DataFlowDiagnostics {
  user_id: string;
  test_timestamp: string;
  overall_status: 'healthy' | 'degraded' | 'critical';
  stages: DataFlowCheck[];
  data_map: {
    registration_data: any;
    onboarding_data: any;
    tracker_data: any;
    aggregated_health_data: any;
    recommendations_data: any;
  };
  integrity_score: number; // общий score 0-100%
}

export interface UserValidation {
  // Данные из регистрации
  basicData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  
  // Данные из персоны
  selectedPersona: {
    id: 'first_signs' | 'active_phase' | 'postmenopause';
    selectedAt: string;
  };
  
  // Согласия
  consents: {
    privacy: boolean;
    terms: boolean;
    marketing: boolean;
    timestamp: string;
  };
  
  // Данные онбординга
  onboardingData: {
    basicInfo: any;
    menstrualHistory: any;
    symptoms: any;
    medicalHistory: any;
    lifestyle: any;
    goals: any;
  };
  
  // Статусы завершения
  registrationCompleted: boolean;
  onboardingCompleted: boolean;
  menopausePhase?: string;
}

export interface DataFlowMetrics {
  // Успешность переходов
  transition_success_rates: {
    registration_to_onboarding: number; // %
    onboarding_to_tracker: number; // %
    tracker_to_recommendations: number; // %
  };
  
  // Время переходов
  average_transition_times: {
    registration_completion: number; // минуты
    onboarding_completion: number; // минуты  
    first_tracker_use: number; // часы
  };
  
  // Качество данных
  data_quality_scores: {
    completeness: number; // %
    accuracy: number; // %
    consistency: number; // %
  };
  
  // Проблемные области
  issues: {
    data_loss_incidents: number;
    sync_failures: number;
    validation_errors: string[];
  };
}

export interface TestStep {
  title: string;
  instruction: string;
  check: () => Promise<DataFlowCheck>;
}

export interface TestResult {
  test_name: string;
  steps: Array<{
    step: string;
    passed: boolean;
    details?: any;
  }>;
  overall_status: 'passed' | 'failed';
  execution_time: number;
  errors?: string[];
}