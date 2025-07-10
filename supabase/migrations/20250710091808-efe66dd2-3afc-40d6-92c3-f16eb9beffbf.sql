-- Создание таблиц для медицинских данных

-- Трекер симптомов
CREATE TABLE IF NOT EXISTS public.symptom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  hot_flashes JSONB,
  night_sweats JSONB,
  sleep_data JSONB,
  mood_data JSONB,
  physical_symptoms TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

-- Дневник питания
CREATE TABLE IF NOT EXISTS public.nutrition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_items JSONB NOT NULL,
  calories INTEGER,
  macros JSONB, -- proteins, fats, carbs
  symptoms_after JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Менструальный цикл  
CREATE TABLE IF NOT EXISTS public.menstrual_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  flow_level INTEGER CHECK (flow_level >= 0 AND flow_level <= 5),
  symptoms JSONB,
  cycle_day INTEGER,
  is_period_start BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Погодные данные
CREATE TABLE IF NOT EXISTS public.weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  location_data JSONB NOT NULL,
  weather_metrics JSONB NOT NULL,
  air_quality JSONB,
  menopause_impact_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recorded_date)
);

-- Данные носимых устройств
CREATE TABLE IF NOT EXISTS public.wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  device_type TEXT NOT NULL,
  steps INTEGER,
  sleep_data JSONB,
  heart_rate_data JSONB,
  stress_level INTEGER,
  calories_burned INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение RLS для всех таблиц
ALTER TABLE public.symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menstrual_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;

-- RLS политики для symptom_entries
CREATE POLICY "Users can manage own symptom entries" ON public.symptom_entries
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для nutrition_entries
CREATE POLICY "Users can manage own nutrition entries" ON public.nutrition_entries
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для menstrual_entries
CREATE POLICY "Users can manage own menstrual entries" ON public.menstrual_entries
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для weather_data
CREATE POLICY "Users can manage own weather data" ON public.weather_data
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для wearable_data
CREATE POLICY "Users can manage own wearable data" ON public.wearable_data
  FOR ALL USING (auth.uid() = user_id);

-- Создание триггеров для обновления updated_at
CREATE TRIGGER update_symptom_entries_updated_at
    BEFORE UPDATE ON public.symptom_entries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();