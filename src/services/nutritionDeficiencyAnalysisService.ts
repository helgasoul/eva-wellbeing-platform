import { supabase } from '@/integrations/supabase/client';

export interface NutritionDeficiency {
  nutrient: string;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number;
  symptoms: string[];
  recommendations: string[];
  foodSources: string[];
  supplementSuggestions?: string[];
}

export interface NutritionAnalysisResult {
  deficiencies: NutritionDeficiency[];
  overallScore: number;
  mainConcerns: string[];
  dietaryPatterns: {
    pattern: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  recommendations: {
    immediate: string[];
    longTerm: string[];
    lifestyle: string[];
  };
}

export class NutritionDeficiencyAnalysisService {
  /**
   * Analyzes nutrition data from monthly health analysis to identify deficiencies
   */
  static async analyzeNutritionDeficiencies(
    userId: string, 
    monthlyAnalysisData: any,
    subscriptionTier: 'essential' | 'plus' | 'optimum'
  ): Promise<NutritionAnalysisResult> {
    try {
      // Get recent nutrition entries for comprehensive analysis
      const { data: nutritionEntries, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Analyze nutrition patterns and deficiencies
      const analysis = this.performNutritionAnalysis(
        nutritionEntries || [],
        monthlyAnalysisData,
        subscriptionTier
      );

      return analysis;
    } catch (error) {
      console.error('Error analyzing nutrition deficiencies:', error);
      throw error;
    }
  }

  private static performNutritionAnalysis(
    nutritionEntries: any[],
    monthlyData: any,
    subscriptionTier: 'essential' | 'plus' | 'optimum'
  ): NutritionAnalysisResult {
    const deficiencies: NutritionDeficiency[] = [];
    const dietaryPatterns: any[] = [];
    const mainConcerns: string[] = [];

    // Analyze key nutrients
    const nutrients = this.analyzeNutrientIntake(nutritionEntries);
    
    // Check for common deficiencies
    const commonDeficiencies = this.checkCommonDeficiencies(nutrients, monthlyData);
    deficiencies.push(...commonDeficiencies);

    // Analyze dietary patterns
    const patterns = this.analyzeDietaryPatterns(nutritionEntries);
    dietaryPatterns.push(...patterns);

    // Generate recommendations based on subscription tier
    const recommendations = this.generateRecommendations(
      deficiencies,
      patterns,
      subscriptionTier
    );

    // Calculate overall nutrition score
    const overallScore = this.calculateNutritionScore(nutrients, deficiencies);

    // Identify main concerns
    if (deficiencies.some(d => d.severity === 'severe')) {
      mainConcerns.push('Обнаружены серьезные дефициты питательных веществ');
    }
    if (patterns.some(p => p.impact === 'negative')) {
      mainConcerns.push('Выявлены нездоровые пищевые привычки');
    }

    return {
      deficiencies,
      overallScore,
      mainConcerns,
      dietaryPatterns: patterns,
      recommendations
    };
  }

  private static analyzeNutrientIntake(nutritionEntries: any[]): Record<string, number> {
    const nutrients: Record<string, number> = {
      iron: 0,
      vitaminD: 0,
      vitaminB12: 0,
      folate: 0,
      calcium: 0,
      magnesium: 0,
      omega3: 0,
      fiber: 0,
      protein: 0,
      vitaminC: 0
    };

    // Basic analysis based on food types and portions
    nutritionEntries.forEach(entry => {
      if (entry.meals) {
        entry.meals.forEach((meal: any) => {
          // Simple heuristic analysis based on food categories
          if (meal.foods) {
            meal.foods.forEach((food: any) => {
              this.estimateNutrientContent(food, nutrients);
            });
          }
        });
      }
    });

    return nutrients;
  }

  private static estimateNutrientContent(food: any, nutrients: Record<string, number>): void {
    const foodName = food.name?.toLowerCase() || '';
    const portion = food.portion || 1;

    // Simplified nutrient estimation based on food categories
    if (foodName.includes('мясо') || foodName.includes('говядина') || foodName.includes('печень')) {
      nutrients.iron += 3 * portion;
      nutrients.vitaminB12 += 2 * portion;
      nutrients.protein += 20 * portion;
    }
    
    if (foodName.includes('рыба') || foodName.includes('лосось') || foodName.includes('тунец')) {
      nutrients.omega3 += 1.5 * portion;
      nutrients.vitaminD += 400 * portion;
      nutrients.protein += 22 * portion;
    }

    if (foodName.includes('молоко') || foodName.includes('творог') || foodName.includes('сыр')) {
      nutrients.calcium += 300 * portion;
      nutrients.vitaminB12 += 1 * portion;
      nutrients.protein += 8 * portion;
    }

    if (foodName.includes('шпинат') || foodName.includes('салат') || foodName.includes('зелень')) {
      nutrients.folate += 100 * portion;
      nutrients.iron += 1 * portion;
      nutrients.vitaminC += 30 * portion;
    }

    if (foodName.includes('орехи') || foodName.includes('семена')) {
      nutrients.magnesium += 80 * portion;
      nutrients.omega3 += 0.5 * portion;
    }

    if (foodName.includes('овощи') || foodName.includes('фрукты')) {
      nutrients.fiber += 3 * portion;
      nutrients.vitaminC += 20 * portion;
    }
  }

  private static checkCommonDeficiencies(
    nutrients: Record<string, number>,
    monthlyData: any
  ): NutritionDeficiency[] {
    const deficiencies: NutritionDeficiency[] = [];
    const dailyTargets = {
      iron: 18, // mg/day for women
      vitaminD: 800, // IU/day
      vitaminB12: 2.4, // mcg/day
      folate: 400, // mcg/day
      calcium: 1000, // mg/day
      magnesium: 320, // mg/day
      omega3: 1.1, // g/day
      fiber: 25, // g/day
      protein: 50, // g/day
      vitaminC: 75 // mg/day
    };

    // Calculate daily averages (assuming 30 days of data)
    const avgIntake = Object.entries(nutrients).reduce((acc, [nutrient, total]) => {
      acc[nutrient] = total / 30;
      return acc;
    }, {} as Record<string, number>);

    // Check each nutrient
    Object.entries(dailyTargets).forEach(([nutrient, target]) => {
      const intake = avgIntake[nutrient] || 0;
      const percentage = intake / target;

      if (percentage < 0.5) {
        deficiencies.push({
          nutrient: this.getNutrientDisplayName(nutrient),
          severity: 'severe',
          confidence: 0.8,
          symptoms: this.getDeficiencySymptoms(nutrient, monthlyData),
          recommendations: this.getNutrientRecommendations(nutrient),
          foodSources: this.getNutrientFoodSources(nutrient),
          supplementSuggestions: this.getSupplementSuggestions(nutrient)
        });
      } else if (percentage < 0.75) {
        deficiencies.push({
          nutrient: this.getNutrientDisplayName(nutrient),
          severity: 'moderate',
          confidence: 0.6,
          symptoms: this.getDeficiencySymptoms(nutrient, monthlyData),
          recommendations: this.getNutrientRecommendations(nutrient),
          foodSources: this.getNutrientFoodSources(nutrient)
        });
      } else if (percentage < 0.9) {
        deficiencies.push({
          nutrient: this.getNutrientDisplayName(nutrient),
          severity: 'mild',
          confidence: 0.4,
          symptoms: [],
          recommendations: this.getNutrientRecommendations(nutrient),
          foodSources: this.getNutrientFoodSources(nutrient)
        });
      }
    });

    return deficiencies;
  }

  private static analyzeDietaryPatterns(nutritionEntries: any[]): any[] {
    const patterns = [];
    
    // Analyze meal frequency
    const mealsPerDay = nutritionEntries.reduce((acc, entry) => {
      if (entry.meals) {
        acc += entry.meals.length;
      }
      return acc;
    }, 0) / nutritionEntries.length;

    if (mealsPerDay < 3) {
      patterns.push({
        pattern: 'Нерегулярное питание',
        description: 'Менее 3 приемов пищи в день',
        impact: 'negative'
      });
    }

    // Analyze processed food consumption
    let processedFoodCount = 0;
    let totalFoodCount = 0;

    nutritionEntries.forEach(entry => {
      if (entry.meals) {
        entry.meals.forEach((meal: any) => {
          if (meal.foods) {
            meal.foods.forEach((food: any) => {
              totalFoodCount++;
              if (this.isProcessedFood(food.name)) {
                processedFoodCount++;
              }
            });
          }
        });
      }
    });

    const processedFoodRatio = processedFoodCount / totalFoodCount;
    if (processedFoodRatio > 0.3) {
      patterns.push({
        pattern: 'Высокое потребление обработанных продуктов',
        description: `${Math.round(processedFoodRatio * 100)}% рациона составляют обработанные продукты`,
        impact: 'negative'
      });
    }

    return patterns;
  }

  private static generateRecommendations(
    deficiencies: NutritionDeficiency[],
    patterns: any[],
    subscriptionTier: 'essential' | 'plus' | 'optimum'
  ): any {
    const recommendations = {
      immediate: [] as string[],
      longTerm: [] as string[],
      lifestyle: [] as string[]
    };

    // Immediate recommendations based on severe deficiencies
    const severeDeficiencies = deficiencies.filter(d => d.severity === 'severe');
    if (severeDeficiencies.length > 0) {
      recommendations.immediate.push(
        'Консультация с врачом для проверки уровня витаминов',
        'Включить в рацион продукты, богатые дефицитными веществами'
      );
    }

    // Tier-specific recommendations
    if (subscriptionTier === 'optimum') {
      recommendations.immediate.push('Персональный план питания на основе анализа');
      recommendations.longTerm.push('Регулярный мониторинг биомаркеров');
    } else if (subscriptionTier === 'plus') {
      recommendations.immediate.push('Персонализированные рекомендации по питанию');
    }

    // Pattern-based recommendations
    patterns.forEach(pattern => {
      if (pattern.impact === 'negative') {
        recommendations.lifestyle.push(`Улучшить: ${pattern.pattern}`);
      }
    });

    return recommendations;
  }

  private static calculateNutritionScore(
    nutrients: Record<string, number>,
    deficiencies: NutritionDeficiency[]
  ): number {
    let baseScore = 100;
    
    // Deduct points for deficiencies
    deficiencies.forEach(deficiency => {
      switch (deficiency.severity) {
        case 'severe':
          baseScore -= 15;
          break;
        case 'moderate':
          baseScore -= 10;
          break;
        case 'mild':
          baseScore -= 5;
          break;
      }
    });

    return Math.max(0, Math.min(100, baseScore));
  }

  private static getNutrientDisplayName(nutrient: string): string {
    const names: Record<string, string> = {
      iron: 'Железо',
      vitaminD: 'Витамин D',
      vitaminB12: 'Витамин B12',
      folate: 'Фолиевая кислота',
      calcium: 'Кальций',
      magnesium: 'Магний',
      omega3: 'Омега-3',
      fiber: 'Клетчатка',
      protein: 'Белок',
      vitaminC: 'Витамин C'
    };
    return names[nutrient] || nutrient;
  }

  private static getDeficiencySymptoms(nutrient: string, monthlyData: any): string[] {
    const symptomMap: Record<string, string[]> = {
      iron: ['усталость', 'слабость', 'бледность'],
      vitaminD: ['усталость', 'боль в костях', 'депрессия'],
      vitaminB12: ['усталость', 'проблемы с памятью', 'покалывание'],
      folate: ['усталость', 'раздражительность', 'проблемы с концентрацией'],
      calcium: ['слабость костей', 'мышечные спазмы'],
      magnesium: ['мышечные судороги', 'бессонница'],
      omega3: ['сухость кожи', 'проблемы с концентрацией'],
      fiber: ['проблемы с пищеварением', 'запоры'],
      protein: ['потеря мышечной массы', 'слабость'],
      vitaminC: ['частые простуды', 'медленное заживление']
    };

    return symptomMap[nutrient] || [];
  }

  private static getNutrientRecommendations(nutrient: string): string[] {
    const recommendations: Record<string, string[]> = {
      iron: ['Включить красное мясо, печень, шпинат'],
      vitaminD: ['Больше времени на солнце, жирная рыба'],
      vitaminB12: ['Мясо, рыба, молочные продукты'],
      folate: ['Листовые овощи, бобовые, цитрусовые'],
      calcium: ['Молочные продукты, зеленые овощи'],
      magnesium: ['Орехи, семена, темная зелень'],
      omega3: ['Жирная рыба, льняное семя, грецкие орехи'],
      fiber: ['Овощи, фрукты, цельнозерновые'],
      protein: ['Мясо, рыба, яйца, бобовые'],
      vitaminC: ['Цитрусовые, ягоды, болгарский перец']
    };

    return recommendations[nutrient] || [];
  }

  private static getNutrientFoodSources(nutrient: string): string[] {
    const sources: Record<string, string[]> = {
      iron: ['Говядина', 'Печень', 'Шпинат', 'Чечевица', 'Тыквенные семечки'],
      vitaminD: ['Лосось', 'Тунец', 'Яичные желтки', 'Молоко обогащенное'],
      vitaminB12: ['Мясо', 'Рыба', 'Молочные продукты', 'Яйца'],
      folate: ['Шпинат', 'Брокколи', 'Авокадо', 'Бобовые'],
      calcium: ['Молоко', 'Сыр', 'Йогурт', 'Кунжут', 'Брокколи'],
      magnesium: ['Миндаль', 'Шпинат', 'Кешью', 'Темный шоколад'],
      omega3: ['Лосось', 'Сардины', 'Льняное семя', 'Грецкие орехи'],
      fiber: ['Яблоки', 'Овсянка', 'Бобовые', 'Брокколи'],
      protein: ['Курица', 'Рыба', 'Яйца', 'Творог', 'Киноа'],
      vitaminC: ['Апельсины', 'Киви', 'Клубника', 'Болгарский перец']
    };

    return sources[nutrient] || [];
  }

  private static getSupplementSuggestions(nutrient: string): string[] {
    const supplements: Record<string, string[]> = {
      iron: ['Железо хелат', 'Железо с витамином C'],
      vitaminD: ['Витамин D3'],
      vitaminB12: ['Метилкобаламин', 'Цианокобаламин'],
      folate: ['Метилфолат', 'Фолиевая кислота'],
      calcium: ['Кальций цитрат', 'Кальций карбонат с магнием'],
      magnesium: ['Магний глицинат', 'Магний цитрат'],
      omega3: ['Рыбий жир', 'Льняное масло'],
      fiber: ['Псиллиум', 'Метилцеллюлоза'],
      protein: ['Сывороточный протеин', 'Растительный протеин']
    };

    return supplements[nutrient] || [];
  }

  private static isProcessedFood(foodName: string): boolean {
    const processedKeywords = [
      'колбаса', 'сосиски', 'чипсы', 'печенье', 'конфеты',
      'газировка', 'фастфуд', 'полуфабрикат', 'консервы'
    ];
    
    return processedKeywords.some(keyword => 
      foodName.toLowerCase().includes(keyword)
    );
  }
}