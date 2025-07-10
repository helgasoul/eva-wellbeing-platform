-- Создание таблиц для ИИ-аналитики и корреляций

-- Корреляционный анализ
CREATE TABLE IF NOT EXISTS public.correlation_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'symptoms_weather', 'nutrition_mood', etc.
  correlation_strength DECIMAL(3,2),
  insights JSONB NOT NULL,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ИИ инсайты
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  insight_data JSONB NOT NULL,
  actionable_recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Предсказания симптомов
CREATE TABLE IF NOT EXISTS public.symptom_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_symptoms JSONB NOT NULL,
  confidence_level DECIMAL(3,2),
  based_on_factors JSONB,
  actual_symptoms JSONB, -- заполняется после даты
  prediction_accuracy DECIMAL(3,2), -- вычисляется постфактум
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включение RLS для всех таблиц
ALTER TABLE public.correlation_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.symptom_predictions ENABLE ROW LEVEL SECURITY;

-- RLS политики для correlation_analysis
CREATE POLICY "Users can manage own correlation analysis" ON public.correlation_analysis
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для ai_insights
CREATE POLICY "Users can manage own ai insights" ON public.ai_insights
  FOR ALL USING (auth.uid() = user_id);

-- RLS политики для symptom_predictions
CREATE POLICY "Users can manage own symptom predictions" ON public.symptom_predictions
  FOR ALL USING (auth.uid() = user_id);

-- Создание триггеров для обновления updated_at
CREATE TRIGGER update_correlation_analysis_updated_at
    BEFORE UPDATE ON public.correlation_analysis
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_symptom_predictions_updated_at
    BEFORE UPDATE ON public.symptom_predictions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();