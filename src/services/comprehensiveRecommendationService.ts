import { 
  ComprehensiveRecommendation, 
  WHOGuideline, 
  WHO_SCREENING_GUIDELINES,
  MENOPAUSE_LAB_PANELS,
  Laboratory,
  DiagnosticCenter,
  Provider
} from '@/types/comprehensiveRecommendations';
import { OnboardingData } from '@/types/onboarding';
import { PhaseResult } from '@/types/onboarding';

// Мок-данные партнеров (в реальном проекте из API)
const PARTNER_LABORATORIES: Laboratory[] = [
  {
    id: 'dnkom-1',
    name: 'ДНКОМ',
    type: 'laboratory',
    rating: 4.8,
    location: 'Москва',
    price_range: { min: 1500, max: 15000 },
    features: ['Онлайн-запись', 'Забор на дому', 'Быстрые результаты'],
    network_type: 'federal',
    specializations: ['hormones', 'genetics', 'oncology'],
    available_tests: [],
    locations: [],
    online_booking: true,
    home_collection: true,
    rapid_results: true,
    quality_certificates: ['ISO 15189', 'CAP']
  },
  {
    id: 'invitro-1',
    name: 'Инвитро',
    type: 'laboratory',
    rating: 4.6,
    location: 'Москва',
    price_range: { min: 1200, max: 12000 },
    features: ['Федеральная сеть', 'Онлайн-результаты'],
    network_type: 'federal',
    specializations: ['hormones', 'cardio', 'metabolism'],
    available_tests: [],
    locations: [],
    online_booking: true,
    home_collection: false,
    rapid_results: false,
    quality_certificates: ['ISO 15189']
  },
  {
    id: 'helix-1',
    name: 'Хеликс',
    type: 'laboratory',
    rating: 4.7,
    location: 'Москва',
    price_range: { min: 1800, max: 18000 },
    features: ['Генетические тесты', 'Премиум-сервис'],
    network_type: 'premium',
    specializations: ['genetics', 'hormones', 'oncology'],
    available_tests: [],
    locations: [],
    online_booking: true,
    home_collection: true,
    rapid_results: true,
    quality_certificates: ['ISO 15189', 'CAP', 'CLIA']
  }
];

const PARTNER_DIAGNOSTIC_CENTERS: DiagnosticCenter[] = [
  {
    id: 'emc-1',
    name: 'European Medical Center',
    type: 'diagnostic_center',
    rating: 4.9,
    location: 'Москва',
    price_range: { min: 5000, max: 50000 },
    features: ['Европейские стандарты', 'Женский персонал', 'Седация'],
    equipment_type: 'premium',
    available_studies: [],
    accreditations: ['JCI', 'ISO 9001'],
    female_friendly: true,
    locations: []
  },
  {
    id: 'medsi-1',
    name: 'МЕДСИ',
    type: 'diagnostic_center',
    rating: 4.5,
    location: 'Москва',
    price_range: { min: 3000, max: 25000 },
    features: ['Федеральная сеть', 'Современное оборудование'],
    equipment_type: 'standard',
    available_studies: [],
    accreditations: ['ISO 9001'],
    female_friendly: true,
    locations: []
  },
  {
    id: 'sm-clinic-1',
    name: 'СМ-Клиника',
    type: 'diagnostic_center',
    rating: 4.4,
    location: 'Москва',
    price_range: { min: 2500, max: 20000 },
    features: ['Доступные цены', 'Удобное расположение'],
    equipment_type: 'standard',
    available_studies: [],
    accreditations: ['ISO 9001'],
    female_friendly: false,
    locations: []
  }
];

export const generateComprehensiveRecommendations = (
  phaseResult: PhaseResult,
  onboardingData: OnboardingData
): ComprehensiveRecommendation[] => {
  const recommendations: ComprehensiveRecommendation[] = [];
  const age = onboardingData.basicInfo?.age || 50;
  const ageGroup = getAgeGroup(age);

  // 1. Гормональная панель менопаузы
  recommendations.push({
    id: 'hormonal-panel',
    category: 'lab_tests',
    title: 'Гормональная панель менопаузы',
    description: 'Комплексная оценка гормонального статуса для подтверждения фазы менопаузы и планирования терапии',
    who_recommendations: {
      age_group: ageGroup,
      frequency: 'При симптомах, затем ежегодно',
      evidence_level: 'B',
      source: 'WHO Guidelines on Menopause Management'
    },
    age_specific: true,
    urgency: phaseResult.phase === 'perimenopause' ? 'recommended' : 'optional',
    estimated_cost: '2400-4500 руб.',
    preparation_required: [
      'Сдавать на 3-5 день цикла (при наличии)',
      'Натощак утром (8-11 часов)',
      'Исключить стресс за день до анализа'
    ],
    actions: [
      {
        type: 'lab_booking',
        label: 'Записаться в лабораторию',
        provider_type: 'laboratory',
        available_providers: PARTNER_LABORATORIES,
        modal_config: {
          title: 'Выберите лабораторию для гормональной панели',
          filters: ['location', 'price_range', 'home_collection', 'rapid_results'],
          recommended_panel: 'comprehensive_hormonal',
          booking_options: {
            online_booking: true,
            phone_booking: true,
            home_collection: true
          }
        }
      },
      {
        type: 'schedule',
        label: 'Запланировать',
        provider_type: 'calendar'
      }
    ]
  });

  // 2. Маммография (для женщин 40+)
  if (age >= 40) {
    recommendations.push({
      id: 'mammography',
      category: 'instrumental_studies',
      title: 'Маммография',
      description: `${age >= 50 ? 'Ежегодный' : 'Раз в 2 года'} скрининг рака молочной железы согласно рекомендациям ВОЗ`,
      who_recommendations: {
        age_group: ageGroup,
        frequency: age >= 50 ? 'ежегодно' : 'каждые 2 года',
        evidence_level: 'A',
        source: 'WHO Breast Cancer Screening Guidelines'
      },
      age_specific: true,
      urgency: 'recommended',
      estimated_cost: '3000-8000 руб.',
      preparation_required: [
        'Планируйте исследование на 5-12 день цикла (при наличии)',
        'Не используйте дезодорант в день процедуры',
        'Возьмите с собой предыдущие снимки для сравнения'
      ],
      actions: [
        {
          type: 'study_booking',
          label: 'Записаться на маммографию',
          provider_type: 'diagnostic_center',
          available_providers: PARTNER_DIAGNOSTIC_CENTERS.filter(center => center.female_friendly),
          modal_config: {
            title: 'Запись на маммографию',
            preparation_info: [
              'Исследование проводится на 5-12 день цикла',
              'Не используйте дезодорант в день процедуры',
              'Возьмите с собой предыдущие снимки'
            ]
          }
        },
        {
          type: 'schedule',
          label: 'Запланировать',
          provider_type: 'calendar'
        }
      ]
    });
  }

  // 3. Колоноскопия (для женщин 50+)
  if (age >= 50) {
    recommendations.push({
      id: 'colonoscopy',
      category: 'instrumental_studies',
      title: 'Колоноскопия (скрининг колоректального рака)',
      description: 'Первичный скрининг колоректального рака для женщин после 50 лет',
      who_recommendations: {
        age_group: ageGroup,
        frequency: 'каждые 10 лет или каждые 5 лет с флексибельной сигмоидоскопией',
        evidence_level: 'A',
        source: 'WHO Colorectal Cancer Screening Guidelines'
      },
      age_specific: true,
      urgency: 'recommended',
      estimated_cost: '8000-25000 руб.',
      preparation_required: [
        'Соблюдение специальной диеты за 3 дня до процедуры',
        'Прием препаратов для очищения кишечника',
        'Сопровождающий для поездки домой при седации'
      ],
      actions: [
        {
          type: 'study_booking',
          label: 'Записаться на колоноскопию',
          provider_type: 'diagnostic_center',
          available_providers: PARTNER_DIAGNOSTIC_CENTERS,
          modal_config: {
            title: 'Запись на колоноскопию',
            preparation_info: [
              'Соблюдение специальной диеты за 3 дня',
              'Прием препаратов для очищения кишечника',
              'Сопровождающий для поездки домой при седации'
            ]
          }
        },
        {
          type: 'doctor_booking',
          label: 'Консультация гастроэнтеролога',
          provider_type: 'clinic'
        }
      ]
    });
  }

  // 4. DEXA-сканирование (плотность костной ткани)
  if (age >= 50 || phaseResult.phase === 'postmenopause') {
    recommendations.push({
      id: 'dexa-scan',
      category: 'instrumental_studies',
      title: 'DEXA-сканирование (плотность костной ткани)',
      description: 'Оценка риска остеопороза и переломов у женщин в постменопаузе',
      who_recommendations: {
        age_group: ageGroup,
        frequency: 'каждые 2 года после 50 лет',
        evidence_level: 'B',
        source: 'WHO Osteoporosis Guidelines'
      },
      age_specific: true,
      urgency: 'recommended',
      estimated_cost: '2500-5000 руб.',
      actions: [
        {
          type: 'study_booking',
          label: 'Записаться на DEXA-сканирование',
          provider_type: 'diagnostic_center',
          available_providers: PARTNER_DIAGNOSTIC_CENTERS
        },
        {
          type: 'schedule',
          label: 'Запланировать',
          provider_type: 'calendar'
        }
      ]
    });
  }

  // 5. Сердечно-сосудистый профиль
  recommendations.push({
    id: 'cardiovascular-profile',
    category: 'lab_tests',
    title: 'Сердечно-сосудистый профиль',
    description: 'Оценка липидного спектра и маркеров воспаления для профилактики сердечно-сосудистых заболеваний',
    who_recommendations: {
      age_group: ageGroup,
      frequency: 'ежегодно после 40 лет',
      evidence_level: 'A',
      source: 'WHO Cardiovascular Disease Prevention Guidelines'
    },
    age_specific: false,
    urgency: 'recommended',
    estimated_cost: '1500-3000 руб.',
    preparation_required: [
      'Натощак 12-14 часов',
      'Исключить алкоголь за 3 дня',
      'Обычная диета за неделю до анализа'
    ],
    actions: [
      {
        type: 'lab_booking',
        label: 'Записаться на анализы',
        provider_type: 'laboratory',
        available_providers: PARTNER_LABORATORIES
      },
      {
        type: 'schedule',
        label: 'Запланировать',
        provider_type: 'calendar'
      }
    ]
  });

  // 6. Онкомаркеры (при семейной истории)
  if (hasOncologyRisk(onboardingData)) {
    recommendations.push({
      id: 'oncology-markers',
      category: 'lab_tests',
      title: 'Онкомаркеры для женщин',
      description: 'Скрининговые онкомаркеры при повышенном семейном риске онкологических заболеваний',
      who_recommendations: {
        age_group: ageGroup,
        frequency: 'ежегодно при семейной истории',
        evidence_level: 'C',
        source: 'WHO Cancer Screening Guidelines'
      },
      age_specific: false,
      urgency: 'optional',
      estimated_cost: '2000-4000 руб.',
      preparation_required: [
        'Натощак утром',
        'Не сдавать во время менструации',
        'Исключить физические нагрузки за день'
      ],
      actions: [
        {
          type: 'lab_booking',
          label: 'Записаться на анализы',
          provider_type: 'laboratory',
          available_providers: PARTNER_LABORATORIES.filter(lab => 
            lab.specializations.includes('oncology')
          )
        },
        {
          type: 'doctor_booking',
          label: 'Консультация онколога',
          provider_type: 'clinic'
        }
      ]
    });
  }

  return recommendations;
};

const getAgeGroup = (age: number): '40-49' | '50-59' | '60-69' | '70+' => {
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 70) return '60-69';
  return '70+';
};

const hasOncologyRisk = (onboardingData: OnboardingData): boolean => {
  const medicalHistory = onboardingData.medicalHistory;
  if (!medicalHistory || !medicalHistory.familyHistory) return false;
  
  return medicalHistory.familyHistory.breastCancer || 
         medicalHistory.familyHistory.ovairianCancer ||
         (medicalHistory.chronicConditions?.some(condition => 
           condition.toLowerCase().includes('рак') || 
           condition.toLowerCase().includes('онко') ||
           condition.toLowerCase().includes('cancer')
         ) || false);
};

export const getProvidersByType = (
  type: 'laboratory' | 'diagnostic_center' | 'clinic'
): Provider[] => {
  switch (type) {
    case 'laboratory':
      return PARTNER_LABORATORIES;
    case 'diagnostic_center':
      return PARTNER_DIAGNOSTIC_CENTERS;
    default:
      return [];
  }
};