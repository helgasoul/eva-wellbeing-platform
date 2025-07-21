
-- Add columns to courses table for better image management
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS image_keywords TEXT[],
ADD COLUMN IF NOT EXISTS image_description TEXT,
ADD COLUMN IF NOT EXISTS generated_image_url TEXT;

-- Update existing courses with relevant image keywords and descriptions
UPDATE courses 
SET 
  image_keywords = CASE 
    WHEN category = 'menopause_basics' THEN ARRAY['menopause', 'women health', 'wellness', 'mature woman', 'healthcare']
    WHEN category = 'hormones' THEN ARRAY['hormones', 'endocrine system', 'medical diagram', 'women health', 'science']
    WHEN category = 'nutrition' THEN ARRAY['healthy food', 'nutrition', 'vegetables', 'balanced diet', 'wellness']
    WHEN category = 'mental_health' THEN ARRAY['mental wellness', 'meditation', 'calm woman', 'mindfulness', 'peace']
    WHEN category = 'sexuality' THEN ARRAY['intimacy', 'couple', 'relationship', 'women wellness', 'health']
    WHEN category = 'lifestyle' THEN ARRAY['active lifestyle', 'yoga', 'exercise', 'wellness', 'healthy living']
    ELSE ARRAY['women health', 'wellness', 'healthcare']
  END,
  image_description = CASE 
    WHEN category = 'menopause_basics' THEN 'Professional image showing a confident mature woman in a healthcare or wellness setting, representing menopause education and support'
    WHEN category = 'hormones' THEN 'Clean medical or scientific illustration related to hormones and women''s health, educational and professional'
    WHEN category = 'nutrition' THEN 'Beautiful arrangement of healthy, colorful foods focusing on nutrition for women''s health and wellness'
    WHEN category = 'mental_health' THEN 'Serene image of a woman practicing mindfulness or meditation, representing mental wellness and peace'
    WHEN category = 'sexuality' THEN 'Tasteful image representing intimacy and relationship wellness for mature women'
    WHEN category = 'lifestyle' THEN 'Active, healthy woman engaging in wellness activities like yoga or exercise'
    ELSE 'Professional image related to women''s health and wellness education'
  END
WHERE image_keywords IS NULL;

-- Create table for storing course image metadata and AI generation logs
CREATE TABLE IF NOT EXISTS course_image_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL, -- 'placeholder', 'generated', 'uploaded'
  image_url TEXT NOT NULL,
  generation_prompt TEXT,
  keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on course_image_logs
ALTER TABLE course_image_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for course_image_logs
CREATE POLICY "Course image logs are viewable by everyone" 
  ON course_image_logs 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage course image logs" 
  ON course_image_logs 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
