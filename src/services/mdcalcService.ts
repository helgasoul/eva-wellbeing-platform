export interface MDCalcTool {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  relevanceToMenopause: number; // 1-5 (5 = очень релевантно)
  mdcalcId: string; // ID калькулятора в MDCalc
  isPopular: boolean;
  tags: string[];
  icon: string;
}

export interface CalculatorCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  relevantTools: MDCalcTool[];
}

export const getMDCalcIntegration = async (): Promise<{ categories: CalculatorCategory[] }> => {
  // В реальной интеграции здесь будет API вызов к MDCalc
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        categories: getMockCalculatorCategories()
      });
    }, 1000);
  });
};

const getMockCalculatorCategories = (): CalculatorCategory[] => [
  {
    id: 'menopause-relevant',
    name: 'Калькуляторы для менопаузы',
    icon: '🌸',
    description: 'Специально отобранные калькуляторы для женского здоровья в период менопаузы',
    count: 15,
    relevantTools: [
      {
        id: 'frax',
        title: 'FRAX® Calculator',
        description: 'Оценка 10-летнего риска остеопоротических переломов у женщин в постменопаузе',
        category: 'bone-health',
        relevanceToMenopause: 5,
        mdcalcId: '3975',
        isPopular: true,
        tags: ['остеопороз', 'переломы', 'постменопауза', 'кости'],
        icon: '🦴'
      },
      {
        id: 'gail-model',
        title: 'Gail Model',
        description: 'Оценка риска развития рака молочной железы в течение 5 лет и пожизненно',
        category: 'oncology',
        relevanceToMenopause: 5,
        mdcalcId: '1862',
        isPopular: true,
        tags: ['рак груди', 'онкориск', 'скрининг', 'профилактика'],
        icon: '🎗️'
      },
      {
        id: 'ascvd-risk',
        title: 'ASCVD Risk Calculator',
        description: 'Оценка 10-летнего риска сердечно-сосудистых событий (инфаркт, инсульт)',
        category: 'cardiovascular',
        relevanceToMenopause: 4,
        mdcalcId: '3986',
        isPopular: true,
        tags: ['кардиориск', 'инфаркт', 'инсульт', 'статины'],
        icon: '❤️'
      },
      {
        id: 'framingham-risk',
        title: 'Framingham Risk Score',
        description: 'Оценка 10-летнего риска ишемической болезни сердца',
        category: 'cardiovascular',
        relevanceToMenopause: 4,
        mdcalcId: '38',
        isPopular: false,
        tags: ['ИБС', 'холестерин', 'артериальное давление'],
        icon: '💓'
      },
      {
        id: 'wells-score-pe',
        title: 'Wells Score for PE',
        description: 'Оценка вероятности тромбоэмболии легочной артерии',
        category: 'pulmonology',
        relevanceToMenopause: 3,
        mdcalcId: '1304',
        isPopular: false,
        tags: ['ТЭЛА', 'тромбоз', 'ЗГТ', 'эмболия'],
        icon: '🫁'
      },
      {
        id: 'osteoporosis-risk',
        title: 'OST (Osteoporosis Self-Assessment Tool)',
        description: 'Простой скрининг-инструмент для выявления остеопороза у азиатских женщин',
        category: 'bone-health',
        relevanceToMenopause: 4,
        mdcalcId: '3988',
        isPopular: false,
        tags: ['остеопороз', 'скрининг', 'женщины'],
        icon: '🦴'
      }
    ]
  },
  {
    id: 'cardiovascular',
    name: 'Кардиология',
    icon: '❤️',
    description: 'Калькуляторы для оценки сердечно-сосудистых рисков',
    count: 85,
    relevantTools: [
      {
        id: 'ascvd-risk-cardio',
        title: 'ASCVD Risk Calculator',
        description: 'Оценка 10-летнего риска сердечно-сосудистых событий',
        category: 'cardiovascular',
        relevanceToMenopause: 4,
        mdcalcId: '3986',
        isPopular: true,
        tags: ['кардиориск', 'инфаркт', 'инсульт'],
        icon: '❤️'
      },
      {
        id: 'framingham-cardio',
        title: 'Framingham Risk Score',
        description: 'Оценка 10-летнего риска ишемической болезни сердца',
        category: 'cardiovascular',
        relevanceToMenopause: 4,
        mdcalcId: '38',
        isPopular: true,
        tags: ['ИБС', 'холестерин'],
        icon: '💓'
      },
      {
        id: 'reynolds-risk',
        title: 'Reynolds Risk Score',
        description: 'Оценка сердечно-сосудистого риска с учетом воспаления',
        category: 'cardiovascular',
        relevanceToMenopause: 3,
        mdcalcId: '4021',
        isPopular: false,
        tags: ['СРБ', 'воспаление', 'женщины'],
        icon: '🩸'
      }
    ]
  },
  {
    id: 'endocrinology',
    name: 'Эндокринология',
    icon: '🦋',
    description: 'Калькуляторы для эндокринных расстройств',
    count: 45,
    relevantTools: [
      {
        id: 'homa-ir',
        title: 'HOMA-IR Calculator',
        description: 'Оценка инсулинорезистентности',
        category: 'endocrinology',
        relevanceToMenopause: 4,
        mdcalcId: '3933',
        isPopular: true,
        tags: ['инсулин', 'диабет', 'метаболизм'],
        icon: '📊'
      },
      {
        id: 'thyroid-risk',
        title: 'Thyroid Cancer Risk Calculator',
        description: 'Оценка риска рака щитовидной железы',
        category: 'endocrinology',
        relevanceToMenopause: 3,
        mdcalcId: '3958',
        isPopular: false,
        tags: ['щитовидная железа', 'рак', 'узлы'],
        icon: '🦋'
      }
    ]
  },
  {
    id: 'oncology',
    name: 'Онкология',
    icon: '🎗️',
    description: 'Калькуляторы онкологических рисков',
    count: 38,
    relevantTools: [
      {
        id: 'gail-oncology',
        title: 'Gail Model',
        description: 'Оценка риска развития рака молочной железы',
        category: 'oncology',
        relevanceToMenopause: 5,
        mdcalcId: '1862',
        isPopular: true,
        tags: ['рак груди', 'скрининг'],
        icon: '🎗️'
      },
      {
        id: 'tyrer-cuzick',
        title: 'Tyrer-Cuzick Model',
        description: 'Расширенная модель оценки риска рака груди',
        category: 'oncology',
        relevanceToMenopause: 5,
        mdcalcId: '4023',
        isPopular: false,
        tags: ['рак груди', 'BRCA', 'генетика'],
        icon: '🧬'
      }
    ]
  },
  {
    id: 'bone-health',
    name: 'Здоровье костей',
    icon: '🦴',
    description: 'Калькуляторы для оценки здоровья костной системы',
    count: 12,
    relevantTools: [
      {
        id: 'frax-bone',
        title: 'FRAX® Calculator',
        description: 'Оценка риска остеопоротических переломов',
        category: 'bone-health',
        relevanceToMenopause: 5,
        mdcalcId: '3975',
        isPopular: true,
        tags: ['остеопороз', 'переломы'],
        icon: '🦴'
      },
      {
        id: 'ost-bone',
        title: 'OST Calculator',
        description: 'Скрининг остеопороза',
        category: 'bone-health',
        relevanceToMenopause: 4,
        mdcalcId: '3988',
        isPopular: false,
        tags: ['остеопороз', 'скрининг'],
        icon: '🦴'
      }
    ]
  }
];

export const openMDCalcCalculator = (calculator: MDCalcTool) => {
  // Открываем калькулятор MDCalc в новом окне
  const mdcalcUrl = `https://www.mdcalc.com/calc/${calculator.mdcalcId}`;
  window.open(mdcalcUrl, '_blank', 'width=1200,height=800');
};

export const getCalculatorById = (categories: CalculatorCategory[], calculatorId: string): MDCalcTool | undefined => {
  for (const category of categories) {
    const calculator = category.relevantTools.find(tool => tool.id === calculatorId);
    if (calculator) return calculator;
  }
  return undefined;
};