import React from 'react';
import { cn } from '@/lib/utils';

interface BookingProgressBarProps {
  currentStep: 'symptoms' | 'doctors' | 'appointment' | 'confirmation';
}

export const BookingProgressBar: React.FC<BookingProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { id: 'symptoms', label: 'Симптомы', icon: '🩺' },
    { id: 'doctors', label: 'Врачи', icon: '👩‍⚕️' },
    { id: 'appointment', label: 'Время', icon: '📅' },
    { id: 'confirmation', label: 'Подтверждение', icon: '✅' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Круг шага */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-200",
              index <= currentStepIndex
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-gray-400 border-gray-300"
            )}>
              <span>{step.icon}</span>
            </div>
            
            {/* Название шага */}
            <div className="ml-3 min-w-0 flex-1">
              <p className={cn(
                "text-sm font-medium",
                index <= currentStepIndex ? "text-primary" : "text-gray-400"
              )}>
                {step.label}
              </p>
            </div>
            
            {/* Линия соединения */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 transition-all duration-200",
                index < currentStepIndex ? "bg-primary" : "bg-gray-300"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};