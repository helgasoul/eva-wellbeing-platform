import { supabase } from '@/integrations/supabase/client';
import type { 
  SymptomEntry, 
  NutritionEntry, 
  MenstrualEntry, 
  WeatherData, 
  WearableData, 
  AggregatedHealthData, 
  DateRange 
} from '@/types/healthData';
import type { Database } from '@/integrations/supabase/types';

type SymptomEntryDB = Database['public']['Tables']['symptom_entries']['Row'];
type NutritionEntryDB = Database['public']['Tables']['nutrition_entries']['Row'];
type MenstrualEntryDB = Database['public']['Tables']['menstrual_entries']['Row'];
type WeatherDataDB = Database['public']['Tables']['weather_data']['Row'];
type WearableDataDB = Database['public']['Tables']['wearable_data']['Row'];

// Функции преобразования типов
const convertSymptomEntry = (dbEntry: SymptomEntryDB): SymptomEntry => ({
  id: dbEntry.id,
  user_id: dbEntry.user_id,
  entry_date: dbEntry.entry_date,
  hot_flashes: dbEntry.hot_flashes as any,
  night_sweats: dbEntry.night_sweats as any,
  sleep_data: dbEntry.sleep_data as any,
  mood_data: dbEntry.mood_data as any,
  physical_symptoms: dbEntry.physical_symptoms || [],
  energy_level: dbEntry.energy_level || undefined,
  notes: dbEntry.notes || undefined,
  created_at: dbEntry.created_at,
  updated_at: dbEntry.updated_at
});

const convertNutritionEntry = (dbEntry: NutritionEntryDB): NutritionEntry => ({
  id: dbEntry.id,
  user_id: dbEntry.user_id,
  entry_date: dbEntry.entry_date,
  meal_type: dbEntry.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  food_items: dbEntry.food_items as any,
  calories: dbEntry.calories || undefined,
  macros: dbEntry.macros as any,
  symptoms_after: dbEntry.symptoms_after as any,
  created_at: dbEntry.created_at
});

const convertMenstrualEntry = (dbEntry: MenstrualEntryDB): MenstrualEntry => ({
  id: dbEntry.id,
  user_id: dbEntry.user_id,
  entry_date: dbEntry.entry_date,
  flow_level: dbEntry.flow_level,
  symptoms: dbEntry.symptoms as any,
  cycle_day: dbEntry.cycle_day || undefined,
  is_period_start: dbEntry.is_period_start,
  notes: dbEntry.notes || undefined,
  created_at: dbEntry.created_at
});

const convertWeatherData = (dbEntry: WeatherDataDB): WeatherData => ({
  id: dbEntry.id,
  user_id: dbEntry.user_id,
  recorded_date: dbEntry.recorded_date,
  location_data: dbEntry.location_data as any,
  weather_metrics: dbEntry.weather_metrics as any,
  air_quality: dbEntry.air_quality as any,
  menopause_impact_score: dbEntry.menopause_impact_score || undefined,
  created_at: dbEntry.created_at
});

const convertWearableData = (dbEntry: WearableDataDB): WearableData => ({
  id: dbEntry.id,
  user_id: dbEntry.user_id,
  recorded_date: dbEntry.recorded_date,
  device_type: dbEntry.device_type,
  steps: dbEntry.steps || undefined,
  sleep_data: dbEntry.sleep_data as any,
  heart_rate_data: dbEntry.heart_rate_data as any,
  stress_level: dbEntry.stress_level || undefined,
  calories_burned: dbEntry.calories_burned || undefined,
  created_at: dbEntry.created_at
});

export class HealthDataService {
  
  // ==================== СИМПТОМЫ ====================
  
  async saveSymptomEntry(userId: string, entry: Omit<SymptomEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SymptomEntry | null> {
    const { data, error } = await supabase
      .from('symptom_entries')
      .upsert({
        user_id: userId,
        entry_date: entry.entry_date,
        hot_flashes: entry.hot_flashes,
        night_sweats: entry.night_sweats,
        sleep_data: entry.sleep_data,
        mood_data: entry.mood_data,
        physical_symptoms: entry.physical_symptoms,
        energy_level: entry.energy_level,
        notes: entry.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving symptom entry:', error);
      throw error;
    }

    return data ? convertSymptomEntry(data) : null;
  }

  async getSymptomEntries(userId: string, dateRange?: DateRange): Promise<SymptomEntry[]> {
    let query = supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching symptom entries:', error);
      throw error;
    }

    return (data || []).map(convertSymptomEntry);
  }

  async getSymptomEntry(userId: string, date: string): Promise<SymptomEntry | null> {
    const { data, error } = await supabase
      .from('symptom_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching symptom entry:', error);
      throw error;
    }

    return data ? convertSymptomEntry(data) : null;
  }

  // ==================== ПИТАНИЕ ====================
  
  async saveNutritionEntry(userId: string, entry: Omit<NutritionEntry, 'id' | 'user_id' | 'created_at'>): Promise<NutritionEntry | null> {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .insert({
        user_id: userId,
        entry_date: entry.entry_date,
        meal_type: entry.meal_type,
        food_items: entry.food_items,
        calories: entry.calories,
        macros: entry.macros,
        symptoms_after: entry.symptoms_after
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving nutrition entry:', error);
      throw error;
    }

    return data ? convertNutritionEntry(data) : null;
  }

  async getNutritionEntries(userId: string, dateRange?: DateRange): Promise<NutritionEntry[]> {
    let query = supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (dateRange) {
      query = query
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching nutrition entries:', error);
      throw error;
    }

    return (data || []).map(convertNutritionEntry);
  }

  async getNutritionEntriesForDate(userId: string, date: string): Promise<NutritionEntry[]> {
    const { data, error } = await supabase
      .from('nutrition_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching nutrition entries for date:', error);
      throw error;
    }

    return (data || []).map(convertNutritionEntry);
  }

  // ==================== МЕНСТРУАЛЬНЫЙ ЦИКЛ ====================
  
  async saveMenstrualEntry(userId: string, entry: Omit<MenstrualEntry, 'id' | 'user_id' | 'created_at'>): Promise<MenstrualEntry | null> {
    const { data, error } = await supabase
      .from('menstrual_entries')
      .upsert({
        user_id: userId,
        entry_date: entry.entry_date,
        flow_level: entry.flow_level,
        symptoms: entry.symptoms,
        cycle_day: entry.cycle_day,
        is_period_start: entry.is_period_start,
        notes: entry.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving menstrual entry:', error);
      throw error;
    }

    return data ? convertMenstrualEntry(data) : null;
  }

  async getMenstrualEntries(userId: string, dateRange?: DateRange): Promise<MenstrualEntry[]> {
    let query = supabase
      .from('menstrual_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching menstrual entries:', error);
      throw error;
    }

    return (data || []).map(convertMenstrualEntry);
  }

  // ==================== ПОГОДА ====================
  
  async saveWeatherData(userId: string, weatherData: Omit<WeatherData, 'id' | 'user_id' | 'created_at'>): Promise<WeatherData | null> {
    const { data, error } = await supabase
      .from('weather_data')
      .upsert({
        user_id: userId,
        recorded_date: weatherData.recorded_date,
        location_data: weatherData.location_data,
        weather_metrics: weatherData.weather_metrics,
        air_quality: weatherData.air_quality,
        menopause_impact_score: weatherData.menopause_impact_score
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }

    return data ? convertWeatherData(data) : null;
  }

  async getWeatherData(userId: string, date: string): Promise<WeatherData | null> {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('user_id', userId)
      .eq('recorded_date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching weather data:', error);
      throw error;
    }

    return data ? convertWeatherData(data) : null;
  }

  async getWeatherDataRange(userId: string, dateRange: DateRange): Promise<WeatherData[]> {
    const { data, error } = await supabase
      .from('weather_data')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_date', dateRange.start)
      .lte('recorded_date', dateRange.end)
      .order('recorded_date', { ascending: false });

    if (error) {
      console.error('Error fetching weather data range:', error);
      throw error;
    }

    return (data || []).map(convertWeatherData);
  }

  // ==================== НОСИМЫЕ УСТРОЙСТВА ====================
  
  async saveWearableData(userId: string, wearableData: Omit<WearableData, 'id' | 'user_id' | 'created_at'>): Promise<WearableData | null> {
    const { data, error } = await supabase
      .from('wearable_data')
      .insert({
        user_id: userId,
        recorded_date: wearableData.recorded_date,
        device_type: wearableData.device_type,
        steps: wearableData.steps,
        sleep_data: wearableData.sleep_data,
        heart_rate_data: wearableData.heart_rate_data,
        stress_level: wearableData.stress_level,
        calories_burned: wearableData.calories_burned
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving wearable data:', error);
      throw error;
    }

    return data ? convertWearableData(data) : null;
  }

  async getWearableData(userId: string, dateRange?: DateRange): Promise<WearableData[]> {
    let query = supabase
      .from('wearable_data')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_date', { ascending: false });

    if (dateRange) {
      query = query
        .gte('recorded_date', dateRange.start)
        .lte('recorded_date', dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching wearable data:', error);
      throw error;
    }

    return (data || []).map(convertWearableData);
  }

  // ==================== АГРЕГИРОВАННЫЕ ДАННЫЕ ====================
  
  async getAggregatedHealthData(userId: string, dateRange?: DateRange): Promise<AggregatedHealthData> {
    const defaultRange: DateRange = dateRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 дней назад
      end: new Date().toISOString().split('T')[0] // сегодня
    };

    try {
      const [symptoms, nutrition, menstrual, weather, wearables] = await Promise.all([
        this.getSymptomEntries(userId, defaultRange),
        this.getNutritionEntries(userId, defaultRange),
        this.getMenstrualEntries(userId, defaultRange),
        this.getWeatherDataRange(userId, defaultRange),
        this.getWearableData(userId, defaultRange)
      ]);

      return {
        user_id: userId,
        date_range: defaultRange,
        symptoms,
        nutrition,
        menstrual,
        weather,
        wearables,
        insights: {
          patterns: [],
          correlations: [],
          recommendations: []
        }
      };
    } catch (error) {
      console.error('Error fetching aggregated health data:', error);
      throw error;
    }
  }

  // ==================== УТИЛИТЫ ====================
  
  async syncOfflineData(userId: string, offlineData: any[]): Promise<{ success: number; errors: any[] }> {
    const results = {
      success: 0,
      errors: [] as any[]
    };

    for (const item of offlineData) {
      try {
        switch (item.type) {
          case 'symptom':
            await this.saveSymptomEntry(userId, item.data);
            break;
          case 'nutrition':
            await this.saveNutritionEntry(userId, item.data);
            break;
          case 'menstrual':
            await this.saveMenstrualEntry(userId, item.data);
            break;
          case 'weather':
            await this.saveWeatherData(userId, item.data);
            break;
          case 'wearable':
            await this.saveWearableData(userId, item.data);
            break;
        }
        results.success++;
      } catch (error) {
        results.errors.push({ item, error });
      }
    }

    return results;
  }

  // Проверка подключения и синхронизация
  async isOnline(): Promise<boolean> {
    try {
      const { error } = await supabase.from('user_profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
}

export const healthDataService = new HealthDataService();