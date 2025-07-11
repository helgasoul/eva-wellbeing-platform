export interface SymptomEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  entry_time?: string; // HH:MM:SS format
  hot_flashes?: {
    count: number;
    severity: number; // 1-5
    triggers?: string[];
  };
  night_sweats?: {
    occurred: boolean;
    severity: number; // 1-5
  };
  sleep_data?: {
    hours_slept: number;
    quality: number; // 1-5
    fall_asleep_time?: string;
    wake_up_time?: string;
  };
  mood_data?: {
    overall: number; // 1-5
    anxiety: number; // 1-5
    irritability: number; // 1-5
  };
  physical_symptoms?: string[];
  energy_level?: number; // 1-5
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: {
    name: string;
    category: string;
    portion_size: string;
    estimated_calories?: number;
    contains_trigger_foods?: string[];
    time?: string;
  }[];
  calories?: number;
  macros?: {
    proteins: number;
    fats: number;
    carbs: number;
    fiber?: number;
  };
  symptoms_after?: {
    digestive_comfort: number;
    energy_change: number;
    mood_change: number;
    symptoms: string[];
  };
  created_at: string;
}

export interface MenstrualEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  flow_level: number; // 0-5
  symptoms?: {
    cramps: number; // 1-5
    bloating: number; // 1-5
    mood_changes: string[];
    other_symptoms: string[];
  };
  cycle_day?: number;
  is_period_start: boolean;
  notes?: string;
  created_at: string;
}

export interface WeatherData {
  id: string;
  user_id: string;
  recorded_date: string; // YYYY-MM-DD
  location_data: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  weather_metrics: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    uv_index: number;
    weather_condition: string;
  };
  air_quality?: {
    aqi: number;
    pm25: number;
    pm10: number;
    pollutants: Record<string, number>;
  };
  menopause_impact_score?: number; // 1-10
  created_at: string;
}

export interface WearableData {
  id: string;
  user_id: string;
  recorded_date: string; // YYYY-MM-DD
  device_type: string;
  steps?: number;
  sleep_data?: {
    total_minutes: number;
    deep_sleep_minutes: number;
    rem_sleep_minutes: number;
    light_sleep_minutes: number;
    awake_minutes: number;
    sleep_efficiency: number;
    bedtime: string;
    wake_time: string;
    sleep_score?: number;
  };
  heart_rate_data?: {
    resting: number;
    average: number;
    max: number;
    variability: number; // HRV
    stress_score?: number;
  };
  stress_level?: number; // 1-10
  calories_burned?: number;
  created_at: string;
}

export interface AggregatedHealthData {
  user_id: string;
  date_range: {
    start: string;
    end: string;
  };
  symptoms: SymptomEntry[];
  nutrition: NutritionEntry[];
  menstrual: MenstrualEntry[];
  weather: WeatherData[];
  wearables: WearableData[];
  insights: {
    patterns: Array<{
      type: string;
      description: string;
      confidence: number;
    }>;
    correlations: Array<{
      factor1: string;
      factor2: string;
      correlation: number;
      significance: number;
    }>;
    recommendations: string[];
  };
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}