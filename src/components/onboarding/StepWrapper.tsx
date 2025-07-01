
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  description,
  children,
  onNext,
  onPrev,
  canGoNext,
  isFirstStep,
  isLastStep
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-playfair font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Step Content */}
      <div className="bg-white/80 backdrop-blur-sm border border-eva-dusty-rose/20 rounded-2xl p-6 mb-8">
        {children}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isFirstStep}
          className={cn(
            "flex items-center space-x-2",
            isFirstStep && "invisible"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Назад</span>
        </Button>

        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="flex items-center space-x-2 bg-eva-dusty-rose hover:bg-eva-mauve"
        >
          <span>{isLastStep ? 'Завершить' : 'Далее'}</span>
          {!isLastStep && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
