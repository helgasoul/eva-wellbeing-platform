import { supabase } from '@/integrations/supabase/client';
import type { DiaryEntry } from '@/components/nutrition/AddToDiaryModal';

export interface NutritionEntryDB {
  id?: string;
  user_id: string;
  entry_date: string;
  meal_type: string;
  food_items: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion_size: number;
    ingredients?: string[];
    benefits?: string[];
    source: 'recipe' | 'manual';
    recipe_id?: string;
  }[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at?: string;
}

class NutritionDiaryService {
  async saveDiaryEntry(userId: string, diaryEntry: DiaryEntry): Promise<void> {
    const nutritionEntry: NutritionEntryDB = {
      user_id: userId,
      entry_date: diaryEntry.date,
      meal_type: diaryEntry.mealType,
      food_items: [{
        name: diaryEntry.name,
        calories: diaryEntry.calories,
        protein: diaryEntry.protein,
        carbs: diaryEntry.carbs,
        fat: diaryEntry.fat,
        portion_size: diaryEntry.portionSize,
        ingredients: diaryEntry.ingredients,
        benefits: diaryEntry.benefits,
        source: diaryEntry.source,
        recipe_id: diaryEntry.recipeId
      }],
      calories: diaryEntry.calories,
      macros: {
        protein: diaryEntry.protein,
        carbs: diaryEntry.carbs,
        fat: diaryEntry.fat
      }
    };

    const { error } = await supabase
      .from('nutrition_entries')
      .insert(nutritionEntry);

    if (error) {
      console.error('Error saving diary entry:', error);
      throw error;
    }
  }

  async getDiaryEntries(userId: string, startDate: string, endDate: string): Promise<DiaryEntry[]> {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching diary entries:', error);
      throw error;
    }

    // Convert DB entries back to DiaryEntry format
    const diaryEntries: DiaryEntry[] = [];
    
    data?.forEach(entry => {
      const foodItems = Array.isArray(entry.food_items) ? entry.food_items : [];
      foodItems.forEach((item: any, index: number) => {
        diaryEntries.push({
          id: `${entry.id}_${index}`,
          recipeId: item.recipe_id || '',
          name: item.name,
          mealType: entry.meal_type as DiaryEntry['mealType'],
          date: entry.entry_date,
          time: '12:00', // Default time since we don't store it in DB yet
          portionSize: item.portion_size,
          ingredients: item.ingredients || [],
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          benefits: item.benefits || [],
          addedAt: new Date(entry.created_at || ''),
          source: item.source
        });
      });
    });

    return diaryEntries;
  }

  async deleteDiaryEntry(userId: string, entryId: string): Promise<void> {
    const { error } = await supabase
      .from('nutrition_entries')
      .delete()
      .eq('user_id', userId)
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting diary entry:', error);
      throw error;
    }
  }

  async updateDiaryEntry(userId: string, entryId: string, updates: Partial<DiaryEntry>): Promise<void> {
    // For now, we'll delete and recreate since our current structure is complex
    // In a production app, you'd want a more sophisticated update mechanism
    await this.deleteDiaryEntry(userId, entryId);
    
    if (updates.id) {
      const fullEntry = updates as DiaryEntry;
      await this.saveDiaryEntry(userId, fullEntry);
    }
  }
}

export const nutritionDiaryService = new NutritionDiaryService();