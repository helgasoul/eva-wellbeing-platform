
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface CourseProgressProps {
  completionPercentage: number;
  className?: string;
}

export const CourseProgress: React.FC<CourseProgressProps> = ({
  completionPercentage,
  className = ''
}) => {
  const isCompleted = completionPercentage === 100;
  const roundedProgress = Math.round(completionPercentage);

  return (
    <div className={className} role="progressbar" aria-valuenow={roundedProgress} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-sm mb-1">
        <span>Прогресс</span>
        <span>{roundedProgress}%</span>
      </div>
      <Progress 
        value={completionPercentage} 
        className="h-2"
        aria-label={`Прогресс курса: ${roundedProgress}%`}
      />
      {isCompleted && (
        <div className="flex items-center gap-1 text-green-600 text-xs mt-1 font-medium">
          <CheckCircle className="w-3 h-3" aria-hidden="true" />
          <span>Курс завершен</span>
        </div>
      )}
    </div>
  );
};
