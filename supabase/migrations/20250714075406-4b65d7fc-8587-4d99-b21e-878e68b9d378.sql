-- Создание новых типов данных для образовательной платформы
CREATE TYPE course_category AS ENUM (
  'menopause_basics',
  'hormones', 
  'nutrition',
  'mental_health',
  'sexuality',
  'lifestyle'
);

CREATE TYPE course_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

CREATE TYPE event_type AS ENUM (
  'webinar',
  'workshop', 
  'ama',
  'support_group',
  'masterclass'
);

CREATE TYPE event_status AS ENUM ('upcoming', 'live', 'completed', 'cancelled');

CREATE TYPE participation_status AS ENUM ('active', 'paused', 'completed', 'dropped');

CREATE TYPE subscription_tier AS ENUM ('essential', 'plus', 'optimum');

-- Таблица инструкторов
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  credentials TEXT[],
  bio TEXT,
  photo_url TEXT,
  specialization TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица курсов
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES instructors(id),
  category course_category NOT NULL,
  difficulty course_difficulty NOT NULL,
  duration_minutes INTEGER,
  total_lessons INTEGER,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  required_subscription subscription_tier NOT NULL DEFAULT 'essential',
  tags TEXT[],
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Таблица уроков
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  order_index INTEGER,
  transcript TEXT,
  is_preview BOOLEAN DEFAULT FALSE,
  key_takeaways TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ресурсы уроков
CREATE TABLE lesson_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'checklist', 'worksheet', 'recipe', 'exercise_plan')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Прогресс пользователя по курсам
CREATE TABLE user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  current_lesson INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  quiz_scores JSONB DEFAULT '[]',
  certificates_earned TEXT[],
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

-- Live события
CREATE TABLE live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type event_type NOT NULL,
  host_id UUID REFERENCES instructors(id),
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  required_subscription subscription_tier NOT NULL DEFAULT 'essential',
  zoom_link TEXT,
  recording_url TEXT,
  is_recorded BOOLEAN DEFAULT FALSE,
  registration_required BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  target_audience TEXT[],
  status event_status DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Материалы для событий
CREATE TABLE event_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES live_events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('slides', 'worksheet', 'checklist', 'resource_list')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  available_before BOOLEAN DEFAULT TRUE,
  available_after BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Регистрации на события
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID REFERENCES live_events(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  attended BOOLEAN DEFAULT FALSE,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_text TEXT,
  UNIQUE(user_id, event_id)
);

-- Bloom Reset программы
CREATE TABLE reset_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  enrollment_start TIMESTAMP WITH TIME ZONE,
  enrollment_end TIMESTAMP WITH TIME ZONE,
  program_start TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  includes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Фазы программ
CREATE TABLE program_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES reset_programs(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  goals TEXT[],
  success_criteria TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Участники программ
CREATE TABLE program_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID REFERENCES reset_programs(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_phase INTEGER DEFAULT 1,
  current_week INTEGER DEFAULT 1,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  assignments_completed INTEGER DEFAULT 0,
  assignments_total INTEGER DEFAULT 0,
  group_calls_attended INTEGER DEFAULT 0,
  peer_interactions INTEGER DEFAULT 0,
  coach_sessions INTEGER DEFAULT 0,
  status participation_status DEFAULT 'active',
  UNIQUE(user_id, program_id)
);

-- Цели обучения пользователей
CREATE TABLE learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_date DATE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  related_courses UUID[],
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- RLS политики для инструкторов (публичный просмотр)
CREATE POLICY "Instructors are viewable by everyone" ON instructors
  FOR SELECT USING (true);

-- RLS политики для курсов (доступ по подписке)
CREATE POLICY "Courses are viewable based on subscription" ON courses
  FOR SELECT USING (true); -- Пока разрешаем всем, позже добавим логику подписок

-- RLS политики для уроков (доступ по курсам)
CREATE POLICY "Lessons are viewable with course access" ON lessons
  FOR SELECT USING (true);

-- RLS политики для ресурсов уроков
CREATE POLICY "Lesson resources are viewable with lesson access" ON lesson_resources
  FOR SELECT USING (true);

-- RLS политики для прогресса пользователя
CREATE POLICY "Users can view their own progress" ON user_course_progress
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own progress" ON user_course_progress
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own progress" ON user_course_progress
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS политики для live событий
CREATE POLICY "Events are viewable by everyone" ON live_events
  FOR SELECT USING (true);

-- RLS политики для материалов событий
CREATE POLICY "Event materials are viewable by everyone" ON event_materials
  FOR SELECT USING (true);

-- RLS политики для регистраций на события
CREATE POLICY "Users can view their own registrations" ON event_registrations
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own registrations" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own registrations" ON event_registrations
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS политики для программ Reset
CREATE POLICY "Reset programs are viewable by everyone" ON reset_programs
  FOR SELECT USING (true);

CREATE POLICY "Program phases are viewable by everyone" ON program_phases
  FOR SELECT USING (true);

-- RLS политики для участников программ
CREATE POLICY "Users can view their own participation" ON program_participants
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own participation" ON program_participants
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own participation" ON program_participants
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS политики для целей обучения
CREATE POLICY "Users can manage their own learning goals" ON learning_goals
  FOR ALL USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Индексы для производительности
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_difficulty ON courses(difficulty);
CREATE INDEX idx_courses_featured ON courses(is_featured);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX idx_user_progress_user_id ON user_course_progress(user_id);
CREATE INDEX idx_events_scheduled_start ON live_events(scheduled_start);
CREATE INDEX idx_events_status ON live_events(status);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_program_participants_user_id ON program_participants(user_id);

-- Триггеры для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_events_updated_at BEFORE UPDATE ON live_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reset_programs_updated_at BEFORE UPDATE ON reset_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON learning_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления текущего количества участников события
CREATE OR REPLACE FUNCTION update_event_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE live_events 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE live_events 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.event_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_registration_count_trigger
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_event_participant_count();

-- Функция для обновления текущего количества участников программы
CREATE OR REPLACE FUNCTION update_program_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reset_programs 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reset_programs 
    SET current_participants = current_participants - 1 
    WHERE id = OLD.program_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER program_participation_count_trigger
  AFTER INSERT OR DELETE ON program_participants
  FOR EACH ROW EXECUTE FUNCTION update_program_participant_count();