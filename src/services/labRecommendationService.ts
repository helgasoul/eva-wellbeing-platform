interface LabTest {
  id: string;
  name: string;
  category: 'hormones' | 'general' | 'genetics' | 'microbiome' | 'vitamins' | 'metabolic' | 'cancer_markers';
  description: string;
  preparation_requirements: string[];
  sample_type: 'blood' | 'saliva' | 'urine' | 'stool' | 'buccal_swab';
  price: number;
  currency: 'RUB';
  duration_days: number;
  lab_provider: 'dnkom' | 'genetico' | 'atlas' | 'helix' | 'other';
  menopause_relevance: 'essential' | 'recommended' | 'optional';
  frequency_recommendation: 'once' | 'yearly' | 'every_6_months' | 'every_3_months' | 'monthly';
  biomarkers: string[];
  reference_ranges?: {
    premenopause?: { min: number; max: number; unit: string };
    perimenopause?: { min: number; max: number; unit: string };
    postmenopause?: { min: number; max: number; unit: string };
  };
  prerequisites?: string[];
}

export const getPersonalizedLabRecommendations = async (
  patientProfile: any,
  symptomEntries: any[]
): Promise<LabTest[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const recommendations = generateLabRecommendations(patientProfile, symptomEntries);
      resolve(recommendations);
    }, 1000);
  });
};

const generateLabRecommendations = (
  patientProfile: any,
  symptomEntries: any[]
): LabTest[] => {
  const tests: LabTest[] = [];

  // Базовая гормональная панель для всех женщин в менопаузе
  tests.push({
    id: 'hormone_panel_menopause',
    name: 'Гормональная панель менопауза',
    category: 'hormones',
    description: 'Комплексная оценка гормонального статуса в период менопаузы: ФСГ, ЛГ, эстрадиол, прогестерон',
    preparation_requirements: [
      'Сдавать на 3-5 день цикла (при наличии)',
      'Натощак утром (8-11 часов)',
      'Исключить стресс за день до анализа',
      'Не принимать гормональные препараты за 3 дня'
    ],
    sample_type: 'blood',
    price: 2400,
    currency: 'RUB',
    duration_days: 1,
    lab_provider: 'dnkom',
    menopause_relevance: 'essential',
    frequency_recommendation: 'every_6_months',
    biomarkers: ['ФСГ', 'ЛГ', 'Эстрадиол', 'Прогестерон', 'Тестостерон'],
    reference_ranges: {
      premenopause: { min: 20, max: 400, unit: 'пг/мл' },
      perimenopause: { min: 10, max: 200, unit: 'пг/мл' },
      postmenopause: { min: 5, max: 50, unit: 'пг/мл' }
    }
  });

  // Анализ симптомов для дополнительных рекомендаций
  const hasHotFlashes = symptomEntries.some(entry => 
    entry.hotFlashes && entry.hotFlashes.count > 0
  );
  
  const hasMoodSymptoms = symptomEntries.some(entry =>
    entry.mood && (entry.mood.anxiety > 3 || entry.mood.overall < 3)
  );

  const hasSleepIssues = symptomEntries.some(entry =>
    entry.sleep && entry.sleep.quality < 3
  );

  // Витамин D и кальций для костей
  tests.push({
    id: 'vitamin_d_calcium',
    name: 'Витамин D + Кальций + Фосфор',
    category: 'vitamins',
    description: 'Оценка костного метаболизма и риска остеопороза в менопаузе',
    preparation_requirements: [
      'Натощак утром',
      'Не принимать препараты кальция и витамина D за 3 дня'
    ],
    sample_type: 'blood',
    price: 1200,
    currency: 'RUB',
    duration_days: 1,
    lab_provider: 'dnkom',
    menopause_relevance: 'essential',
    frequency_recommendation: 'every_6_months',
    biomarkers: ['25(OH)D3', 'Кальций общий', 'Кальций ионизированный', 'Фосфор']
  });

  // При приливах - дополнительные гормоны
  if (hasHotFlashes) {
    tests.push({
      id: 'thyroid_panel',
      name: 'Функция щитовидной железы',
      category: 'hormones',
      description: 'ТТГ, Т3, Т4, антитела. Исключение тиреотоксикоза как причины приливов',
      preparation_requirements: [
        'Натощак утром',
        'Не принимать препараты йода за неделю'
      ],
      sample_type: 'blood',
      price: 1800,
      currency: 'RUB',
      duration_days: 1,
      lab_provider: 'dnkom',
      menopause_relevance: 'recommended',
      frequency_recommendation: 'yearly',
      biomarkers: ['ТТГ', 'Т3 свободный', 'Т4 свободный', 'АТ к ТПО']
    });
  }

  // При нарушениях настроения
  if (hasMoodSymptoms) {
    tests.push({
      id: 'neurotransmitters',
      name: 'Нейротрансмиттеры и стресс',
      category: 'hormones',
      description: 'Кортизол, серотонин, дофамин для оценки психоэмоционального состояния',
      preparation_requirements: [
        'Сдавать утром до 10:00',
        'Исключить стресс за день до анализа',
        'Хорошо выспаться'
      ],
      sample_type: 'blood',
      price: 2200,
      currency: 'RUB',
      duration_days: 3,
      lab_provider: 'dnkom',
      menopause_relevance: 'recommended',
      frequency_recommendation: 'every_3_months',
      biomarkers: ['Кортизол', 'Серотонин', 'Дофамин', 'ДГЭА-С']
    });
  }

  // Генетическое тестирование (при семейной истории)
  if (patientProfile?.familyHistory?.breastCancer || patientProfile?.familyHistory?.ovairianCancer) {
    tests.push({
      id: 'brca_genetics',
      name: 'Генетика рака груди и яичников',
      category: 'genetics',
      description: 'Анализ генов BRCA1, BRCA2, PALB2 для оценки наследственного риска рака',
      preparation_requirements: [
        'Специальной подготовки не требуется',
        'Генетическое консультирование рекомендуется'
      ],
      sample_type: 'buccal_swab',
      price: 12000,
      currency: 'RUB',
      duration_days: 14,
      lab_provider: 'genetico',
      menopause_relevance: 'recommended',
      frequency_recommendation: 'once',
      biomarkers: ['BRCA1', 'BRCA2', 'PALB2', 'CHEK2', 'ATM']
    });
  }

  // Микробиом кишечника
  tests.push({
    id: 'gut_microbiome',
    name: 'Микробиом кишечника Atlas',
    category: 'microbiome',
    description: 'Анализ микрофлоры кишечника с рекомендациями по питанию и пробиотикам',
    preparation_requirements: [
      'Не принимать антибиотики 2 недели',
      'Не принимать пробиотики 3 дня',
      'Обычное питание'
    ],
    sample_type: 'stool',
    price: 7900,
    currency: 'RUB',
    duration_days: 21,
    lab_provider: 'atlas',
    menopause_relevance: 'optional',
    frequency_recommendation: 'yearly',
    biomarkers: ['Bacteroidetes', 'Firmicutes', 'Bifidobacterium', 'Lactobacillus', 'Эстроболом']
  });

  // Онкомаркеры для женщин 45+
  if (patientProfile?.age >= 45) {
    tests.push({
      id: 'cancer_markers_women',
      name: 'Онкомаркеры для женщин',
      category: 'cancer_markers',
      description: 'CA 125, CA 15-3, СЕА для раннего выявления онкологических заболеваний',
      preparation_requirements: [
        'Натощак утром',
        'Не сдавать во время менструации',
        'Исключить физические нагрузки за день'
      ],
      sample_type: 'blood',
      price: 1600,
      currency: 'RUB',
      duration_days: 1,
      lab_provider: 'dnkom',
      menopause_relevance: 'recommended',
      frequency_recommendation: 'yearly',
      biomarkers: ['CA 125', 'CA 15-3', 'СЕА', 'CA 19-9']
    });
  }

  return tests;
};

// Получить все доступные анализы
export const getAllLabTests = async (): Promise<LabTest[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const allTests = [
        // Все анализы из рекомендаций плюс дополнительные
        ...generateLabRecommendations({}, []),
        // Дополнительные анализы
        {
          id: 'lipid_profile',
          name: 'Липидный профиль расширенный',
          category: 'metabolic' as const,
          description: 'Холестерин, ЛПВП, ЛПНП, триглицериды для оценки сердечно-сосудистых рисков',
          preparation_requirements: [
            'Натощак 12-14 часов',
            'Исключить алкоголь за 3 дня',
            'Обычная диета за неделю'
          ],
          sample_type: 'blood' as const,
          price: 900,
          currency: 'RUB' as const,
          duration_days: 1,
          lab_provider: 'dnkom' as const,
          menopause_relevance: 'recommended' as const,
          frequency_recommendation: 'yearly' as const,
          biomarkers: ['Холестерин общий', 'ЛПВП', 'ЛПНП', 'Триглицериды', 'Коэффициент атерогенности']
        }
      ];
      resolve(allTests);
    }, 800);
  });
};

export type { LabTest };