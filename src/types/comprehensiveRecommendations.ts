export interface ComprehensiveRecommendation {
  id: string;
  category: 'lab_tests' | 'instrumental_studies' | 'specialist_consultation' | 'lifestyle' | 'screening';
  title: string;
  description: string;
  who_recommendations: WHOGuideline;
  age_specific: boolean;
  urgency: 'urgent' | 'recommended' | 'optional';
  estimated_cost?: string;
  preparation_required?: string[];
  actions: RecommendationAction[];
}

export interface WHOGuideline {
  age_group: '40-49' | '50-59' | '60-69' | '70+';
  frequency: string;
  evidence_level: 'A' | 'B' | 'C';
  source: string;
}

export interface RecommendationAction {
  type: 'lab_booking' | 'study_booking' | 'doctor_booking' | 'completed' | 'schedule';
  label: string;
  provider_type: 'laboratory' | 'diagnostic_center' | 'clinic' | 'calendar';
  available_providers?: Provider[];
  modal_config?: ActionModalConfig;
}

export interface Provider {
  id: string;
  name: string;
  type: 'laboratory' | 'diagnostic_center' | 'clinic';
  rating: number;
  location: string;
  distance?: number;
  price_range?: { min: number; max: number };
  features: string[];
}

export interface Laboratory extends Provider {
  network_type: 'federal' | 'regional' | 'premium';
  specializations: string[];
  available_tests: LabTest[];
  locations: LabLocation[];
  online_booking: boolean;
  home_collection: boolean;
  rapid_results: boolean;
  quality_certificates: string[];
}

export interface LabTest {
  code: string;
  name: string;
  category: 'hormones' | 'oncology' | 'cardio' | 'metabolism' | 'genetics';
  price: number;
  preparation_time: string;
  result_time: string;
  sample_type: 'blood' | 'urine' | 'saliva' | 'stool';
}

export interface LabLocation {
  id: string;
  address: string;
  working_hours: string;
  phone: string;
  services: string[];
}

export interface DiagnosticCenter extends Provider {
  equipment_type: 'premium' | 'standard';
  available_studies: InstrumentalStudy[];
  accreditations: string[];
  female_friendly: boolean;
  locations: CenterLocation[];
}

export interface InstrumentalStudy {
  code: string;
  name: string;
  category: 'mammography' | 'colonoscopy' | 'gastroscopy' | 'dexa' | 'ultrasound' | 'mri' | 'ct';
  duration: number;
  preparation_required: string[];
  sedation_available: boolean;
  female_staff_available: boolean;
  price_range: { min: number; max: number };
}

export interface CenterLocation {
  id: string;
  address: string;
  working_hours: string;
  phone: string;
  equipment: string[];
}

export interface ActionModalConfig {
  title: string;
  filters?: string[];
  recommended_panel?: string;
  preparation_info?: string[];
  booking_options?: {
    online_booking: boolean;
    phone_booking: boolean;
    home_collection: boolean;
  };
}

export interface HealthCalendarEvent {
  id: string;
  type: 'lab_test' | 'study' | 'doctor_visit' | 'medication_reminder';
  title: string;
  date: Date;
  reminder_settings: {
    advance_notifications: ('1_week' | '3_days' | '1_day' | '2_hours')[];
    preparation_reminders: string[];
  };
  location?: string;
  preparation_checklist: string[];
  provider_info: {
    name: string;
    phone: string;
    address: string;
    booking_reference?: string;
  };
}

export const WHO_SCREENING_GUIDELINES = {
  '40-49': {
    annual: [
      'blood_pressure', 'cholesterol', 'diabetes_screening', 
      'thyroid_function', 'vitamin_d'
    ],
    biennial: ['mammography'],
    as_needed: ['pap_smear_if_due', 'bone_density_if_risk_factors']
  },
  '50-59': {
    annual: [
      'blood_pressure', 'cholesterol', 'diabetes_screening',
      'mammography', 'thyroid_function', 'vitamin_d',
      'colon_cancer_screening_start'
    ],
    biennial: ['bone_density_dexa'],
    triennial: ['cervical_cancer_screening']
  },
  '60-69': {
    annual: [
      'blood_pressure', 'cholesterol', 'diabetes_screening',
      'mammography', 'colon_cancer_screening'
    ],
    biennial: ['bone_density_dexa'],
    as_needed: ['gastroscopy_if_symptoms', 'cardiac_screening']
  },
  '70+': {
    annual: [
      'blood_pressure', 'mammography', 'cognitive_assessment',
      'fall_risk_assessment'
    ],
    biennial: ['bone_density_dexa', 'colon_cancer_screening'],
    discuss_individually: ['mammography_continuation', 'advanced_screenings']
  }
} as const;

export const MENOPAUSE_LAB_PANELS = {
  basic_hormonal: {
    tests: ['FSH', 'LH', 'Estradiol', 'AMH', 'TSH', 'Free_T4'],
    indication: 'Определение статуса менопаузы',
    frequency: 'При симптомах, затем annually'
  },
  comprehensive_hormonal: {
    tests: ['FSH', 'LH', 'Estradiol', 'Progesterone', 'Testosterone', 'DHEAS', 'SHBG', 'AMH'],
    indication: 'Полная гормональная оценка',
    frequency: 'При планировании ЗГТ'
  },
  cardiovascular_risk: {
    tests: ['Total_cholesterol', 'HDL', 'LDL', 'Triglycerides', 'ApoB', 'Lp(a)', 'hsCRP'],
    indication: 'Оценка сердечно-сосудистых рисков',
    frequency: 'Annually after 50'
  },
  bone_metabolism: {
    tests: ['Calcium', 'Phosphorus', 'Vitamin_D', 'PTH', 'CTX', 'P1NP'],
    indication: 'Оценка метаболизма костной ткани',
    frequency: 'При планировании лечения остеопороза'
  },
  oncology_screening: {
    tests: ['CA125', 'HE4', 'CEA', 'CA15-3', 'CA19-9'],
    indication: 'Онкологический скрининг',
    frequency: 'Annually if family history'
  }
} as const;