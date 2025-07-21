
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Course, UserProgress } from '@/types/academy';
import { CourseImage } from './CourseImage';
import { InstructorAvatar } from './InstructorAvatar';
import { CourseMetaInfo } from './CourseMetaInfo';
import { CourseProgress } from './CourseProgress';

interface CourseCardProps {
  course: Course;
  progress?: UserProgress;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  onPreview?: (courseId: string) => void;
}

const categoryLabels = {
  menopause_basics: 'Основы менопаузы',
  hormones: 'Гормоны',
  nutrition: 'Питание',
  mental_health: 'Психическое здоровье',  
  sexuality: 'Сексуальность',
  lifestyle: 'Образ жизни'
};

const difficultyLabels = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый'
};

const subscriptionLabels = {
  essential: 'Essential',
  plus: 'Plus',
  optimum: 'Optimum'
};

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress,
  onEnroll,
  onContinue,
  onPreview
}) => {
  const isEnrolled = !!progress;
  const isCompleted = progress?.completion_percentage === 100;

  const handleEnrollClick = () => {
    onEnroll?.(course.id);
  };

  const handleContinueClick = () => {
    onContinue?.(course.id);
  };

  const handlePreviewClick = () => {
    onPreview?.(course.id);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
      role="article"
      aria-labelledby={`course-title-${course.id}`}
    >
      {/* Course Image */}
      <div className="relative">
        <CourseImage
          src={course.thumbnail_url}
          alt={`Превью курса: ${course.title}`}
        />
        
        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {course.is_featured && (
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              Популярный
            </Badge>
          )}
          {course.is_new && (
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              Новый
            </Badge>
          )}
        </div>

        {/* Preview Button */}
        {course.preview_video_url && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handlePreviewClick}
            aria-label={`Посмотреть превью курса: ${course.title}`}
          >
            <Play className="w-4 h-4 mr-1" aria-hidden="true" />
            Превью
          </Button>
        )}

        {/* Subscription Tier */}
        <div className="absolute bottom-2 right-2">
          <Badge 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm text-xs"
          >
            {subscriptionLabels[course.required_subscription]}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        {/* Course Title */}
        <h3 
          id={`course-title-${course.id}`}
          className="font-semibold text-lg leading-tight line-clamp-2"
        >
          {course.title}
        </h3>
        
        {/* Course Description */}
        <p className="text-muted-foreground text-sm line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mt-2">
          <InstructorAvatar instructor={course.instructor} size="sm" />
          <span className="text-sm text-muted-foreground">
            {course.instructor.name}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Course Meta Information */}
        <CourseMetaInfo
          durationMinutes={course.duration_minutes}
          totalLessons={course.total_lessons}
          averageRating={course.average_rating}
          className="mb-4"
        />

        {/* Category and Difficulty Badges */}
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[course.category]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {difficultyLabels[course.difficulty]}
          </Badge>
        </div>

        {/* Progress (for enrolled courses) */}
        {isEnrolled && progress && (
          <CourseProgress
            completionPercentage={progress.completion_percentage}
            className="mb-4"
          />
        )}

        {/* Action Button */}
        <div className="flex gap-2">
          {!isEnrolled ? (
            <Button 
              onClick={handleEnrollClick}
              className="w-full"
              aria-label={`Записаться на курс: ${course.title}`}
            >
              Записаться на курс
            </Button>
          ) : (
            <Button 
              onClick={handleContinueClick}
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
              aria-label={isCompleted ? `Пересмотреть курс: ${course.title}` : `Продолжить курс: ${course.title}`}
            >
              {isCompleted ? 'Пересмотреть' : 'Продолжить'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {course.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
