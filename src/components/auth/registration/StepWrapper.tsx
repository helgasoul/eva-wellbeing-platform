import React, { ReactNode } from 'react';

interface StepWrapperProps {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  children: ReactNode;
}

export const StepWrapper: React.FC<StepWrapperProps> = ({
  title,
  subtitle,
  step,
  totalSteps,
  children
}) => {
  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <div className="bloom-card p-8 w-full max-w-2xl mx-auto">
        {/* Прогресс-бар */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Шаг {step} из {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-playfair font-bold text-foreground mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">
              {subtitle}
            </p>
          )}
        </div>

        {/* Контент */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};