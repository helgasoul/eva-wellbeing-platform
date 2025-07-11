-- Create daily nutrition plans table
CREATE TABLE public.daily_nutrition_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_session_id UUID,
  plan_date DATE NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('plus', 'optimum')),
  meal_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  nutritional_goals JSONB DEFAULT '{}'::jsonb,
  dietary_restrictions JSONB DEFAULT '[]'::jsonb,
  calorie_target INTEGER,
  macro_targets JSONB DEFAULT '{}'::jsonb,
  personalization_factors JSONB DEFAULT '{}'::jsonb,
  is_generated BOOLEAN DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_daily_nutrition_plans_user_date ON public.daily_nutrition_plans(user_id, plan_date);
CREATE INDEX idx_daily_nutrition_plans_session ON public.daily_nutrition_plans(analysis_session_id);

-- Enable RLS
ALTER TABLE public.daily_nutrition_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own nutrition plans" 
ON public.daily_nutrition_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition plans" 
ON public.daily_nutrition_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition plans" 
ON public.daily_nutrition_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition plans" 
ON public.daily_nutrition_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_daily_nutrition_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_nutrition_plans_updated_at
    BEFORE UPDATE ON public.daily_nutrition_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_daily_nutrition_plans_updated_at();