import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Star, Users, Play } from 'lucide-react';
import { Course, UserProgress } from '@/types/academy';

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${remainingMinutes}м`;
    }
    return `${minutes}м`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Превью изображение */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail_url || '/placeholder-course.jpg'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
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

        {/* Preview button */}
        {course.preview_video_url && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={() => onPreview?.(course.id)}
          >
            <Play className="w-4 h-4 mr-1" />
            Превью
          </Button>
        )}

        {/* Subscription tier indicator */}
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
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {course.title}
          </h3>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-2">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center gap-2 mt-2">
          <img
            src={course.instructor.photo_url || '/placeholder-avatar.jpg'}
            alt={course.instructor.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            {course.instructor.name}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Course meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(course.duration_minutes)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {course.total_lessons} уроков
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-current text-yellow-400" />
            {course.average_rating.toFixed(1)}
          </div>
        </div>

        {/* Category and difficulty */}
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[course.category]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {difficultyLabels[course.difficulty]}
          </Badge>
        </div>

        {/* Progress */}
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Прогресс</span>
              <span>{Math.round(progress.completion_percentage)}%</span>
            </div>
            <Progress value={progress.completion_percentage} className="h-2" />
            {isCompleted && (
              <p className="text-green-600 text-xs mt-1 font-medium">
                ✓ Курс завершен
              </p>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="flex gap-2">
          {!isEnrolled ? (
            <Button 
              onClick={() => onEnroll?.(course.id)}
              className="w-full"
            >
              Записаться на курс
            </Button>
          ) : (
            <Button 
              onClick={() => onContinue?.(course.id)}
              className="w-full"
              variant={isCompleted ? "outline" : "default"}
            >
              {isCompleted ? 'Пересмотреть' : 'Продолжить'}
            </Button>
          )}
        </div>

        {/* Tags */}
        {course.tags.length > 0 && (
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