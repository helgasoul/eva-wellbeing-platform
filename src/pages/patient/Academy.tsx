import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { CourseCard } from '@/components/academy/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import { Course, UserProgress, LearningStats } from '@/types/academy';
import { AcademyService } from '@/services/academyService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';

const categoryOptions = [
  { value: 'all', label: 'Все категории' },
  { value: 'menopause_basics', label: 'Основы менопаузы' },
  { value: 'hormones', label: 'Гормоны' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'mental_health', label: 'Психическое здоровье' },
  { value: 'sexuality', label: 'Сексуальность' },
  { value: 'lifestyle', label: 'Образ жизни' }
];

const difficultyOptions = [
  { value: 'all', label: 'Все уровни' },
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' }
];

const Academy: React.FC = () => {
  const { user } = useAuth();
  const { executeWithErrorHandling, isLoading: errorHandlerLoading } = useSupabaseErrorHandler();
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadAcademyData();
  }, [user]);

  const loadAcademyData = async () => {
    if (!user) {
      console.log('📚 Academy: No user found, skipping data load');
      setLoading(false);
      return;
    }

    console.log('📚 Academy: Loading data for user:', user.email);
    setLoading(true);
    try {
      const coursesData = await executeWithErrorHandling(
        () => AcademyService.getCourses(),
        [],
        {
          successMessage: 'Данные Академии загружены',
          skipErrorToast: false
        }
      );
      
      if (coursesData) {
        console.log('📚 Academy: Loaded courses:', coursesData.length);
        setCourses(coursesData);

        // Загружаем прогресс пользователя
        const progressPromises = coursesData.map(course => 
          executeWithErrorHandling(
            () => AcademyService.getUserProgress(course.id, user.id),
            null,
            { skipErrorToast: true }
          )
        );
        const progressResults = await Promise.all(progressPromises);
        
        const progressMap: Record<string, UserProgress> = {};
        progressResults.forEach((progress, index) => {
          if (progress) {
            progressMap[coursesData[index].id] = progress;
          }
        });
        setUserProgress(progressMap);
        console.log('📚 Academy: Loaded progress for courses:', Object.keys(progressMap).length);

        // Загружаем статистику обучения
        const stats = await executeWithErrorHandling(
          () => AcademyService.getLearningStats(user.id),
          null,
          { skipErrorToast: true }
        );
        
        if (stats) {
          setLearningStats(stats);
          console.log('📚 Academy: Loaded learning stats:', stats);
        }
      }
    } catch (error) {
      console.error('📚 Academy: Error loading data:', error);
      toast.error('Ошибка при загрузке данных Академии');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    if (!user) return;

    const progress = await executeWithErrorHandling(
      () => AcademyService.enrollInCourse(courseId, user.id),
      null,
      {
        successMessage: 'Вы записались на курс!',
        skipErrorToast: false
      }
    );
    
    if (progress) {
      setUserProgress(prev => ({ ...prev, [courseId]: progress }));
    }
  };

  const handleContinueCourse = (courseId: string) => {
    // Перенаправляем на страницу курса
    window.location.href = `/academy/course/${courseId}`;
  };

  const handlePreviewCourse = (courseId: string) => {
    // Показываем превью курса
    console.log('Preview course:', courseId);
    toast.info('Функция превью будет доступна скоро');
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    if (activeTab === 'enrolled') {
      return matchesSearch && matchesCategory && matchesDifficulty && userProgress[course.id];
    }
    if (activeTab === 'completed') {
      return matchesSearch && matchesCategory && matchesDifficulty && 
             userProgress[course.id]?.completion_percentage === 100;
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const enrolledCourses = courses.filter(course => userProgress[course.id]);
  const featuredCourses = courses.filter(course => course.is_featured);

  if (loading) {
    return (
      <PatientLayout title="Академия без|паузы">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!user) {
    console.log('📚 Academy: No user found, showing auth required message');
    return (
      <PatientLayout title="Академия без|паузы">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Требуется авторизация</h3>
          <p className="text-muted-foreground mb-4">
            Войдите в систему, чтобы получить доступ к образовательным материалам
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="mt-4"
          >
            Войти в систему
          </Button>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout title="Академия без|паузы">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Академия без|паузы</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Образовательная платформа для женского здоровья и благополучия
          </p>
        </div>

        {/* Stats */}
        {learningStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Курсы</span>
              </div>
              <p className="text-2xl font-bold">{learningStats.total_courses_enrolled}</p>
              <p className="text-xs text-muted-foreground">записано</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Завершено</span>
              </div>
              <p className="text-2xl font-bold">{learningStats.total_courses_completed}</p>
              <p className="text-xs text-muted-foreground">курсов</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Время</span>
              </div>
              <p className="text-2xl font-bold">{learningStats.total_hours_watched}</p>
              <p className="text-xs text-muted-foreground">часов</p>
            </div>
            
            <div className="bg-card rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Сертификаты</span>
              </div>
              <p className="text-2xl font-bold">{learningStats.certificates_earned}</p>
              <p className="text-xs text-muted-foreground">получено</p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск курсов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Уровень" />
            </SelectTrigger>
            <SelectContent>
              {difficultyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && activeTab === 'all' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Популярные курсы</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 3).map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={userProgress[course.id]}
                  onEnroll={handleEnrollInCourse}
                  onContinue={handleContinueCourse}
                  onPreview={handlePreviewCourse}
                />
              ))}
            </div>
            <Separator className="mt-8" />
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Все курсы</TabsTrigger>
            <TabsTrigger value="enrolled">Мои курсы</TabsTrigger>
            <TabsTrigger value="completed">Завершенные</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={userProgress[course.id]}
                  onEnroll={handleEnrollInCourse}
                  onContinue={handleContinueCourse}
                  onPreview={handlePreviewCourse}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="mt-6">
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={userProgress[course.id]}
                    onEnroll={handleEnrollInCourse}
                    onContinue={handleContinueCourse}
                    onPreview={handlePreviewCourse}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Вы еще не записались ни на один курс</h3>
                <p className="text-muted-foreground mb-4">
                  Начните свое обучение с популярных курсов
                </p>
                <Button onClick={() => setActiveTab('all')}>
                  Посмотреть все курсы
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={userProgress[course.id]}
                  onEnroll={handleEnrollInCourse}
                  onContinue={handleContinueCourse}
                  onPreview={handlePreviewCourse}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Курсы не найдены</h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры поиска или фильтры
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default Academy;