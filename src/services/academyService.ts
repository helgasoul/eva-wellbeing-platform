import { supabase } from '@/integrations/supabase/client';
import { Course, CourseInstructor, Lesson, UserProgress, LearningStats, LearningGoal } from '@/types/academy';

export class AcademyService {
  // Получить все курсы с фильтрацией
  static async getCourses(filters?: {
    category?: string;
    difficulty?: string;  
    featured?: boolean;
    search?: string;
  }): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select(`
        *,
        instructor:instructors(*)
      `);

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category as any);
    }

    if (filters?.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty as any);
    }

    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(course => ({
      ...course,
      instructor: course.instructor as CourseInstructor
    })) || [];
  }

  // Получить курс по ID
  static async getCourse(courseId: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:instructors(*)
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;

    return data ? {
      ...data,
      instructor: data.instructor as CourseInstructor
    } : null;
  }

  // Получить уроки курса
  static async getLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select(`
        *,
        resources:lesson_resources(*)
      `)
      .eq('course_id', courseId)
      .order('order_index');

    if (error) throw error;

    return data?.map(lesson => ({
      ...lesson,
      resources: (lesson.resources || []).map((resource: any) => ({
        id: resource.id,
        type: resource.type as 'pdf' | 'checklist' | 'worksheet' | 'recipe' | 'exercise_plan',
        title: resource.title,
        url: resource.url,
        description: resource.description || ''
      }))
    })) || [];
  }

  // Получить прогресс пользователя по курсу
  static async getUserProgress(courseId: string, userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; 
    return data ? {
      ...data,
      quiz_scores: Array.isArray(data.quiz_scores) ? data.quiz_scores as { lesson_id: string; score: number }[] : []
    } : null;
  }

  // Создать или обновить прогресс пользователя
  static async updateUserProgress(
    courseId: string,
    userId: string,
    progress: Partial<UserProgress>
  ): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_course_progress')
      .upsert({
        course_id: courseId,
        user_id: userId,
        ...progress,
        last_accessed: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      quiz_scores: Array.isArray(data.quiz_scores) ? data.quiz_scores as { lesson_id: string; score: number }[] : []
    };
  }

  // Записать пользователя на курс
  static async enrollInCourse(courseId: string, userId: string): Promise<UserProgress> {
    return this.updateUserProgress(courseId, userId, {
      current_lesson: 0,
      completion_percentage: 0,
      started_at: new Date().toISOString()
    });
  }

  // Получить статистику обучения пользователя
  static async getLearningStats(userId: string): Promise<LearningStats> {
    // Получаем прогресс по всем курсам
    const { data: progressData, error: progressError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Получаем цели обучения
    const { data: goalsData, error: goalsError } = await supabase
      .from('learning_goals')
      .select('*')
      .eq('user_id', userId);

    if (goalsError) throw goalsError;

    const enrolledCourses = progressData?.length || 0;
    const completedCourses = progressData?.filter(p => p.completion_percentage === 100).length || 0;
    const certificatesEarned = progressData?.reduce((acc, p) => acc + (p.certificates_earned?.length || 0), 0) || 0;

    return {
      total_courses_enrolled: enrolledCourses,
      total_courses_completed: completedCourses,
      total_hours_watched: 0, // Будет рассчитываться позже
      current_streak_days: 0, // Будет рассчитываться позже
      certificates_earned: certificatesEarned,
      favorite_topics: [], // Будет рассчитываться на основе активности
      learning_goals: goalsData || []
    };
  }

  // Создать цель обучения
  static async createLearningGoal(goal: Omit<LearningGoal, 'id'>): Promise<LearningGoal> {
    const { data, error } = await supabase
      .from('learning_goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Обновить цель обучения
  static async updateLearningGoal(goalId: string, updates: Partial<LearningGoal>): Promise<LearningGoal> {
    const { data, error } = await supabase
      .from('learning_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Получить рекомендованные курсы для пользователя
  static async getRecommendedCourses(userId: string): Promise<Course[]> {
    // Простая логика рекомендаций - показываем популярные и новые курсы
    // В будущем можно добавить более сложную логику на основе интересов пользователя
    return this.getCourses({ featured: true });
  }

  // Поиск курсов
  static async searchCourses(query: string): Promise<Course[]> {
    return this.getCourses({ search: query });
  }
}