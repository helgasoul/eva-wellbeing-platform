import { supabase } from '@/integrations/supabase/client';

export interface NutritionPlan {
  id: string;
  user_id: string;
  analysis_session_id?: string;
  plan_date: string;
  subscription_tier: 'plus' | 'optimum';
  meal_plan: Meal[];
  nutritional_goals: NutritionGoals;
  dietary_restrictions: string[];
  calorie_target: number;
  macro_targets: MacroTargets;
  personalization_factors: PersonalizationFactors;
  is_generated: boolean;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner';
  name: string;
  description: string;
  calories: number;
  macros: MacroTargets;
  ingredients: Ingredient[];
  preparation_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cooking_tips?: string[];
  alternatives?: string[];
}

export interface Snack {
  name: string;
  description: string;
  calories: number;
  preparation_time: number;
  ingredients: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  calories_per_serving?: number;
}

export interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  macroTargets: MacroTargets;
  hydrationGoal: number;
}

export interface PersonalizationFactors {
  specialConsiderations: string[];
  shoppingList: string[];
  preparationTips: string[];
  snacks: Snack[];
}

export class NutritionPlanService {
  static async getDailyNutritionPlan(userId: string, date: string): Promise<NutritionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('daily_nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('plan_date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.transformDatabaseRecord(data) : null;
    } catch (error) {
      console.error('Error fetching nutrition plan:', error);
      return null;
    }
  }

  static async getLatestNutritionPlan(userId: string): Promise<NutritionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('daily_nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('plan_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? this.transformDatabaseRecord(data) : null;
    } catch (error) {
      console.error('Error fetching latest nutrition plan:', error);
      return null;
    }
  }

  static async getNutritionPlanHistory(userId: string, limit: number = 7): Promise<NutritionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('daily_nutrition_plans')
        .select('*')
        .eq('user_id', userId)
        .order('plan_date', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data ? data.map(record => this.transformDatabaseRecord(record)) : [];
    } catch (error) {
      console.error('Error fetching nutrition plan history:', error);
      return [];
    }
  }

  static async updateNutritionPlan(planId: string, updates: Partial<NutritionPlan>): Promise<boolean> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Преобразуем типизированные поля в Json
      if (updates.meal_plan) {
        updateData.meal_plan = updates.meal_plan as any;
      }
      if (updates.nutritional_goals) {
        updateData.nutritional_goals = updates.nutritional_goals as any;
      }
      if (updates.macro_targets) {
        updateData.macro_targets = updates.macro_targets as any;
      }
      if (updates.personalization_factors) {
        updateData.personalization_factors = updates.personalization_factors as any;
      }
      if (updates.dietary_restrictions) {
        updateData.dietary_restrictions = updates.dietary_restrictions as any;
      }

      const { error } = await supabase
        .from('daily_nutrition_plans')
        .update(updateData)
        .eq('id', planId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating nutrition plan:', error);
      return false;
    }
  }

  static async deleteNutritionPlan(planId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('daily_nutrition_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting nutrition plan:', error);
      return false;
    }
  }

  static async createCustomNutritionPlan(userId: string, planData: Omit<NutritionPlan, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'generated_at' | 'is_generated'>): Promise<NutritionPlan | null> {
    try {
      const insertData: any = {
        user_id: userId,
        analysis_session_id: planData.analysis_session_id,
        plan_date: planData.plan_date,
        subscription_tier: planData.subscription_tier,
        meal_plan: planData.meal_plan as any,
        nutritional_goals: planData.nutritional_goals as any,
        dietary_restrictions: planData.dietary_restrictions as any,
        calorie_target: planData.calorie_target,
        macro_targets: planData.macro_targets as any,
        personalization_factors: planData.personalization_factors as any,
        is_generated: false
      };

      const { data, error } = await supabase
        .from('daily_nutrition_plans')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data ? this.transformDatabaseRecord(data) : null;
    } catch (error) {
      console.error('Error creating custom nutrition plan:', error);
      return null;
    }
  }

  private static transformDatabaseRecord(data: any): NutritionPlan {
    return {
      id: data.id,
      user_id: data.user_id,
      analysis_session_id: data.analysis_session_id,
      plan_date: data.plan_date,
      subscription_tier: data.subscription_tier,
      meal_plan: Array.isArray(data.meal_plan) ? data.meal_plan : [],
      nutritional_goals: data.nutritional_goals || {},
      dietary_restrictions: Array.isArray(data.dietary_restrictions) ? data.dietary_restrictions : [],
      calorie_target: data.calorie_target || 0,
      macro_targets: data.macro_targets || { protein: 0, carbs: 0, fat: 0 },
      personalization_factors: data.personalization_factors || { 
        specialConsiderations: [], 
        shoppingList: [], 
        preparationTips: [], 
        snacks: [] 
      },
      is_generated: data.is_generated || false,
      generated_at: data.generated_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

  static calculateTotalCalories(meals: Meal[], snacks: Snack[] = []): number {
    const mealCalories = meals.reduce((total, meal) => total + meal.calories, 0);
    const snackCalories = snacks.reduce((total, snack) => total + snack.calories, 0);
    return mealCalories + snackCalories;
  }

  static calculateTotalMacros(meals: Meal[], snacks: Snack[] = []): MacroTargets {
    const totalMacros = meals.reduce(
      (total, meal) => ({
        protein: total.protein + meal.macros.protein,
        carbs: total.carbs + meal.macros.carbs,
        fat: total.fat + meal.macros.fat
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    // Примерные макросы для перекусов (если не указаны точные значения)
    snacks.forEach(snack => {
      const estimatedMacros = this.estimateSnackMacros(snack.calories);
      totalMacros.protein += estimatedMacros.protein;
      totalMacros.carbs += estimatedMacros.carbs;
      totalMacros.fat += estimatedMacros.fat;
    });

    return totalMacros;
  }

  private static estimateSnackMacros(calories: number): MacroTargets {
    // Примерное распределение макронутриентов для перекусов
    // 15% белки, 50% углеводы, 35% жиры
    return {
      protein: Math.round((calories * 0.15) / 4), // 4 ккал на грамм белка
      carbs: Math.round((calories * 0.50) / 4),   // 4 ккал на грамм углеводов
      fat: Math.round((calories * 0.35) / 9)      // 9 ккал на грамм жира
    };
  }

  static generateShoppingList(plan: NutritionPlan): string[] {
    const ingredients = new Set<string>();
    
    plan.meal_plan.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        ingredients.add(`${ingredient.name} - ${ingredient.amount} ${ingredient.unit}`);
      });
    });

    plan.personalization_factors.snacks.forEach(snack => {
      snack.ingredients.forEach(ingredient => {
        ingredients.add(ingredient);
      });
    });

    return Array.from(ingredients).sort();
  }

  static formatMealTime(mealType: string): string {
    const mealTimes: Record<string, string> = {
      breakfast: 'Завтрак (8:00-9:00)',
      lunch: 'Обед (13:00-14:00)',
      dinner: 'Ужин (19:00-20:00)'
    };
    
    return mealTimes[mealType] || mealType;
  }

  static getMealIcon(mealType: string): string {
    const mealIcons: Record<string, string> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙'
    };
    
    return mealIcons[mealType] || '🍽️';
  }
}