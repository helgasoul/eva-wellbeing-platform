
import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="w-full bg-eva-cream rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-eva-dusty-rose to-eva-mauve h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center mb-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300",
                isCompleted && "bg-eva-dusty-rose text-white",
                isCurrent && "bg-eva-mauve text-white ring-4 ring-eva-soft-pink",
                !isCompleted && !isCurrent && "bg-eva-cream text-eva-dusty-rose"
              )}
            >
              {stepNumber}
            </div>
          );
        })}
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Шаг {currentStep} из {totalSteps}
        </p>
        <h2 className="text-lg font-playfair font-semibold text-foreground mt-1">
          {stepTitles[currentStep - 1]}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(progressPercentage)}% завершено
        </p>
      </div>
    </div>
  );
};
