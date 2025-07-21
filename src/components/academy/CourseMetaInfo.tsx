
import React from 'react';
import { Clock, Users, Star } from 'lucide-react';

interface CourseMetaInfoProps {
  durationMinutes: number;
  totalLessons: number;
  averageRating: number;
  className?: string;
}

export const CourseMetaInfo: React.FC<CourseMetaInfoProps> = ({
  durationMinutes,
  totalLessons,
  averageRating,
  className = ''
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${remainingMinutes}м`;
    }
    return `${minutes}м`;
  };

  return (
    <div className={`flex items-center gap-4 text-sm text-muted-foreground ${className}`}>
      <div className="flex items-center gap-1" title={`Продолжительность: ${formatDuration(durationMinutes)}`}>
        <Clock className="w-4 h-4" aria-hidden="true" />
        <span>{formatDuration(durationMinutes)}</span>
      </div>
      <div className="flex items-center gap-1" title={`Количество уроков: ${totalLessons}`}>
        <Users className="w-4 h-4" aria-hidden="true" />
        <span>{totalLessons} {totalLessons === 1 ? 'урок' : totalLessons < 5 ? 'урока' : 'уроков'}</span>
      </div>
      <div className="flex items-center gap-1" title={`Рейтинг: ${averageRating.toFixed(1)} из 5`}>
        <Star className="w-4 h-4 fill-current text-yellow-400" aria-hidden="true" />
        <span>{averageRating.toFixed(1)}</span>
      </div>
    </div>
  );
};
