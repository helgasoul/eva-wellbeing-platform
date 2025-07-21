
import React, { useState, useEffect } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { CourseCard } from '@/components/academy/CourseCard';
import { CourseCardSkeleton } from '@/components/academy/CourseCardSkeleton';
import { AcademyFilters } from '@/components/academy/AcademyFilters';
import { AcademyStats } from '@/components/academy/AcademyStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  TrendingUp,
  Search
} from 'lucide-react';
import { Course, UserProgress, LearningStats } from '@/types/academy';
import { AcademyService } from '@/services/academyService';
import { CourseImageService } from '@/services/courseImageService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';

const Academy: React.FC = () => {
  const { user } = useAuth();
  const { executeWithErrorHandling } = useSupabaseErrorHandler();
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

        // Enhance course images in the background (non-blocking)
        CourseImageService.batchGenerateImages(coursesData).catch(error => {
          console.warn('📚 Academy: Image enhancement failed:', error);
        });

        // Load user progress
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

        // Load learning stats
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
    window.location.href = `/academy/course/${courseId}`;
  };

  const handlePreviewCourse = (courseId: string) => {
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

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  if (loading) {
    return (
      <PatientLayout title="Академия без|паузы">
        <div>
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Академия без|паузы</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Образовательная платформа для женского здоровья и благополучия
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </PatientLayout>
    );
  }

  if (!user) {
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
          <AcademyStats stats={learningStats} />
        )}

        {/* Filters */}
        <AcademyFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
        />

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
            <Button variant="outline" onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default Academy;
