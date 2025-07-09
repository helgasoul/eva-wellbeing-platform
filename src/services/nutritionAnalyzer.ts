import { BasicMealPlan } from '@/data/baseMealPlans';

interface LabResults {
  // Базовые показатели (Plus)
  vitamin_d: number;
  vitamin_b12: number;
  iron: number;
  ferritin: number;
  magnesium: number;
  omega3_index: number;
  glucose: number;
  hba1c: number;
  cholesterol_total: number;
  cholesterol_ldl: number;
  cholesterol_hdl: number;
  triglycerides: number;
  cortisol: number;
  
  // Гормоны
  estradiol: number;
  testosterone: number;
  fsh: number;
  lh: number;
  progesterone: number;
  thyroid_tsh: number;
  thyroid_t3: number;
  thyroid_t4: number;
  
  // Воспаление
  crp: number;
  homocysteine: number;
  
  // Расширенные показатели (Optimum)
  zinc?: number;
  selenium?: number;
  coq10?: number;
  vitamin_e?: number;
  vitamin_k?: number;
  folate?: number;
  vitamin_c?: number;
}

interface NutrientDeficiency {
  nutrient: string;
  currentLevel: number;
  targetRange: string;
  severity: 'mild' | 'moderate' | 'severe';
  healthImpact: string[];
  foodSources: string[];
  supplementRecommendation?: SupplementRecommendation;
  menopauseRelevance: string;
}

interface SupplementRecommendation {
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  form: string; // 'tablet', 'capsule', 'liquid', 'powder'
  withFood: boolean;
  contraindications: string[];
  interactions: string[];
  monitoringNeeded: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  menopausePhase: 'premenopause' | 'perimenopause' | 'menopause' | 'postmenopause';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  subscriptionTier: 'essential' | 'plus' | 'optimum';
  symptoms: string[];
  allergies?: string[];
  dietaryRestrictions?: string[];
}

export class NutritionAnalyzer {
  static analyzeDeficiencies(labResults: LabResults): NutrientDeficiency[] {
    const deficiencies: NutrientDeficiency[] = [];
    
    // Витамин D
    if (labResults.vitamin_d < 30) {
      deficiencies.push({
        nutrient: 'Витамин D',
        currentLevel: labResults.vitamin_d,
        targetRange: '30-50 нг/мл',
        severity: labResults.vitamin_d < 20 ? 'severe' : 'moderate',
        healthImpact: ['Здоровье костей', 'Иммунитет', 'Настроение'],
        foodSources: ['Жирная рыба', 'Яичные желтки', 'Грибы портобелло'],
        supplementRecommendation: {
          name: 'Витамин D3 (холекальциферол)',
          dosage: labResults.vitamin_d < 20 ? '4000 МЕ' : '2000 МЕ',
          timing: 'Утром',
          duration: '3 месяца с последующим контролем',
          form: 'капсула',
          withFood: true,
          contraindications: ['Гиперкальциемия', 'Саркоидоз'],
          interactions: ['Дигоксин', 'Тиазидные диуретики'],
          monitoringNeeded: true
        },
        menopauseRelevance: 'Критически важен для профилактики остеопороза в менопаузе'
      });
    }
    
    // Железо
    if (labResults.iron < 12 || labResults.ferritin < 15) {
      deficiencies.push({
        nutrient: 'Железо',
        currentLevel: labResults.iron,
        targetRange: '12-15 мг/л',
        severity: labResults.ferritin < 12 ? 'severe' : 'moderate',
        healthImpact: ['Энергия', 'Когнитивные функции', 'Иммунитет'],
        foodSources: ['Красное мясо', 'Печень', 'Шпинат', 'Чечевица', 'Тыквенные семечки'],
        supplementRecommendation: {
          name: 'Железо бисглицинат',
          dosage: '25 мг элементарного железа',
          timing: 'Натощак, за 1 час до еды',
          duration: '2-3 месяца',
          form: 'капсула',
          withFood: false,
          contraindications: ['Гемохроматоз', 'Талассемия'],
          interactions: ['Антациды', 'Тетрациклин', 'Левотироксин'],
          monitoringNeeded: true
        },
        menopauseRelevance: 'Дефицит усугубляет усталость и когнитивные симптомы менопаузы'
      });
    }
    
    // Магний
    if (labResults.magnesium < 0.85) {
      deficiencies.push({
        nutrient: 'Магний',
        currentLevel: labResults.magnesium,
        targetRange: '0.85-1.05 ммоль/л',
        severity: 'moderate',
        healthImpact: ['Сон', 'Стресс', 'Мышечная функция', 'Сердце'],
        foodSources: ['Темная листовая зелень', 'Орехи', 'Семена', 'Авокадо', 'Какао'],
        supplementRecommendation: {
          name: 'Магний глицинат',
          dosage: '400 мг',
          timing: 'Вечером, за 30 минут до сна',
          duration: 'Длительно',
          form: 'капсула',
          withFood: true,
          contraindications: ['Почечная недостаточность'],
          interactions: ['Антибиотики', 'Диуретики'],
          monitoringNeeded: false
        },
        menopauseRelevance: 'Помогает с приливами, нарушениями сна и раздражительностью'
      });
    }
    
    // Омега-3
    if (labResults.omega3_index < 8) {
      deficiencies.push({
        nutrient: 'Омега-3',
        currentLevel: labResults.omega3_index,
        targetRange: '8-12%',
        severity: 'moderate',
        healthImpact: ['Сердечно-сосудистая система', 'Мозг', 'Воспаление'],
        foodSources: ['Жирная рыба', 'Грецкие орехи', 'Семена льна', 'Семена чиа'],
        supplementRecommendation: {
          name: 'Омега-3 EPA/DHA',
          dosage: '1000 мг (500 EPA + 500 DHA)',
          timing: 'С едой',
          duration: '3 месяца',
          form: 'капсула',
          withFood: true,
          contraindications: ['Аллергия на рыбу'],
          interactions: ['Антикоагулянты'],
          monitoringNeeded: false
        },
        menopauseRelevance: 'Снижает воспаление и поддерживает здоровье сердца в менопаузе'
      });
    }
    
    // Витамин B12
    if (labResults.vitamin_b12 < 300) {
      deficiencies.push({
        nutrient: 'Витамин B12',
        currentLevel: labResults.vitamin_b12,
        targetRange: '300-900 пг/мл',
        severity: labResults.vitamin_b12 < 200 ? 'severe' : 'moderate',
        healthImpact: ['Энергия', 'Нервная система', 'Память'],
        foodSources: ['Мясо', 'Рыба', 'Молочные продукты', 'Яйца'],
        supplementRecommendation: {
          name: 'Метилкобаламин',
          dosage: '1000 мкг',
          timing: 'Утром',
          duration: '3 месяца',
          form: 'капсула',
          withFood: false,
          contraindications: ['Аллергия на кобальт'],
          interactions: ['Метформин', 'Омепразол'],
          monitoringNeeded: true
        },
        menopauseRelevance: 'Поддерживает энергию и когнитивные функции в менопаузе'
      });
    }
    
    return deficiencies;
  }
  
  static generatePersonalizedMealPlan(
    basePlans: BasicMealPlan[],
    deficiencies: NutrientDeficiency[],
    userProfile: UserProfile
  ): BasicMealPlan[] {
    let personalizedPlans = [...basePlans];
    
    // Модификация под дефициты
    deficiencies.forEach(deficiency => {
      personalizedPlans = this.modifyPlansForDeficiency(personalizedPlans, deficiency);
    });
    
    // Модификация под симптомы
    userProfile.symptoms.forEach(symptom => {
      personalizedPlans = this.modifyPlansForSymptom(personalizedPlans, symptom);
    });
    
    return personalizedPlans;
  }
  
  private static modifyPlansForDeficiency(
    plans: BasicMealPlan[],
    deficiency: NutrientDeficiency
  ): BasicMealPlan[] {
    return plans.map(plan => {
      const modifiedPlan = { ...plan };
      
      // Добавление продуктов для устранения дефицита
      switch (deficiency.nutrient) {
        case 'Витамин D':
          if (plan.mealType === 'breakfast' || plan.mealType === 'lunch') {
            modifiedPlan.ingredients.push('жирная рыба 100г');
            modifiedPlan.benefits.push('Поддержка витамина D');
          }
          break;
        case 'Железо':
          if (plan.mealType === 'lunch' || plan.mealType === 'dinner') {
            modifiedPlan.ingredients.push('шпинат 100г');
            modifiedPlan.benefits.push('Повышение уровня железа');
          }
          break;
        case 'Магний':
          if (plan.mealType === 'snack' || plan.mealType === 'dinner') {
            modifiedPlan.ingredients.push('миндаль 30г');
            modifiedPlan.benefits.push('Поддержка нервной системы');
          }
          break;
        case 'Омега-3':
          if (plan.mealType === 'breakfast') {
            modifiedPlan.ingredients.push('семена льна 15г');
            modifiedPlan.benefits.push('Противовоспалительное действие');
          }
          break;
        case 'Витамин B12':
          if (plan.mealType === 'breakfast' || plan.mealType === 'lunch') {
            modifiedPlan.ingredients.push('яйца 1шт');
            modifiedPlan.benefits.push('Поддержка энергии');
          }
          break;
      }
      
      return modifiedPlan;
    });
  }
  
  private static modifyPlansForSymptom(
    plans: BasicMealPlan[],
    symptom: string
  ): BasicMealPlan[] {
    const symptomModifications: Record<string, {
      add: string[];
      avoid: string[];
      benefits: string[];
    }> = {
      'приливы': {
        add: ['соевые продукты', 'семена льна', 'красный клевер'],
        avoid: ['острые специи', 'кофеин', 'алкоголь'],
        benefits: ['Снижение частоты приливов', 'Фитоэстрогены']
      },
      'нарушение сна': {
        add: ['индейка', 'вишневый сок', 'миндаль'],
        avoid: ['кофеин после 14:00', 'сахар перед сном'],
        benefits: ['Улучшение качества сна', 'Натуральный мелатонин']
      },
      'перепады настроения': {
        add: ['жирная рыба', 'темная зелень', 'ферментированные продукты'],
        avoid: ['рафинированный сахар', 'трансжиры'],
        benefits: ['Стабилизация настроения', 'Поддержка серотонина']
      }
    };
    
    const modification = symptomModifications[symptom];
    if (!modification) return plans;
    
    return plans.map(plan => {
      const modifiedPlan = { ...plan };
      
      // Добавление полезных ингредиентов
      modification.add.forEach(ingredient => {
        if (Math.random() > 0.7) { // 30% шанс добавления
          modifiedPlan.ingredients.push(ingredient);
        }
      });
      
      // Добавление специфических преимуществ
      modifiedPlan.benefits.push(...modification.benefits);
      
      return modifiedPlan;
    });
  }
  
  static getMockLabResults(): LabResults {
    return {
      vitamin_d: 18, // Дефицит
      vitamin_b12: 250, // Дефицит
      iron: 10, // Дефицит
      ferritin: 12, // Дефицит
      magnesium: 0.75, // Дефицит
      omega3_index: 6, // Дефицит
      glucose: 95,
      hba1c: 5.2,
      cholesterol_total: 200,
      cholesterol_ldl: 120,
      cholesterol_hdl: 55,
      triglycerides: 140,
      cortisol: 15,
      estradiol: 30,
      testosterone: 0.8,
      fsh: 45,
      lh: 35,
      progesterone: 2,
      thyroid_tsh: 2.5,
      thyroid_t3: 3.2,
      thyroid_t4: 12,
      crp: 2.1,
      homocysteine: 12,
      zinc: 80,
      selenium: 70,
      coq10: 0.8,
      vitamin_e: 12,
      vitamin_k: 1.2,
      folate: 450,
      vitamin_c: 60
    };
  }
}

export type { LabResults, NutrientDeficiency, SupplementRecommendation, UserProfile };