
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className 
}) => {
  return (
    <div className={cn(
      'flex items-center space-x-2 text-destructive text-sm',
      className
    )}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
