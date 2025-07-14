export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: CourseInstructor;
  category: 'menopause_basics' | 'hormones' | 'nutrition' | 'mental_health' | 'sexuality' | 'lifestyle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  total_lessons: number;
  thumbnail_url: string;
  preview_video_url?: string;
  required_subscription: 'essential' | 'plus' | 'optimum';
  tags: string[];
  created_at: string;
  updated_at: string;
  average_rating: number;
  total_reviews: number;
  is_featured: boolean;
  is_new: boolean;
  completion_rate: number;
}

export interface CourseInstructor {
  id: string;
  name: string;
  title: string;
  credentials: string[];
  bio: string;
  photo_url: string;
  specialization: string[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  duration_seconds: number;
  order_index: number;
  transcript?: string;
  resources: LessonResource[];
  is_preview: boolean;
  key_takeaways: string[];
}

export interface LessonResource {
  id: string;
  type: 'pdf' | 'checklist' | 'worksheet' | 'recipe' | 'exercise_plan';
  title: string;
  url: string;
  description: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_lesson: number;
  completion_percentage: number;
  quiz_scores: { lesson_id: string; score: number }[];
  certificates_earned: string[];
  started_at: string;
  last_accessed: string;
  completed_at?: string;
}

export interface LearningStats {
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_hours_watched: number;
  current_streak_days: number;
  certificates_earned: number;
  favorite_topics: string[];
  learning_goals: LearningGoal[];
}

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  target_date: string;
  progress_percentage: number;
  related_courses: string[];
  is_completed: boolean;
}

export interface Quiz {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
  passing_score: number;
  max_attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correct_answer: string;
  explanation: string;
}