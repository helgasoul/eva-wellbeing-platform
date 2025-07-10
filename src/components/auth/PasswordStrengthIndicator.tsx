import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { PasswordStrength } from '@/services/passwordPolicyService';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength?: PasswordStrength;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength,
  className = ""
}) => {
  if (!password) return null;

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0: return 'hsl(var(--destructive))';
      case 1: return 'hsl(15, 85%, 55%)'; // orange-red
      case 2: return 'hsl(45, 85%, 55%)'; // yellow
      case 3: return 'hsl(120, 40%, 50%)'; // green
      case 4: return 'hsl(120, 60%, 40%)'; // dark green
      default: return 'hsl(var(--muted))';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0: return 'Очень слабый';
      case 1: return 'Слабый';
      case 2: return 'Средний';
      case 3: return 'Сильный';
      case 4: return 'Очень сильный';
      default: return 'Неизвестно';
    }
  };

  const strengthColor = getStrengthColor(strength?.score || 0);
  const strengthText = getStrengthText(strength?.score || 0);
  const progressValue = ((strength?.score || 0) + 1) * 20; // Convert 0-4 to 20-100

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Сила пароля:</span>
          <span 
            className="font-medium" 
            style={{ color: strengthColor }}
          >
            {strengthText}
          </span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2"
          style={{ 
            '--progress-foreground': strengthColor 
          } as React.CSSProperties}
        />
      </div>

      {/* Requirements checklist */}
      {strength && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Требования к паролю:
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            <RequirementItem 
              met={strength.requirements.minLength} 
              text="Минимум 8 символов" 
            />
            <RequirementItem 
              met={strength.requirements.hasUppercase} 
              text="Заглавные буквы (A-Z)" 
            />
            <RequirementItem 
              met={strength.requirements.hasLowercase} 
              text="Строчные буквы (a-z)" 
            />
            <RequirementItem 
              met={strength.requirements.hasNumbers} 
              text="Цифры (0-9)" 
            />
            <RequirementItem 
              met={strength.requirements.hasSpecialChars} 
              text="Специальные символы (!@#$%^&*)" 
            />
            <RequirementItem 
              met={strength.requirements.noCommonPatterns} 
              text="Без простых паттернов" 
            />
            <RequirementItem 
              met={strength.requirements.noRepeatingChars} 
              text="Без повторяющихся символов" 
            />
          </div>
        </div>
      )}

      {/* Feedback */}
      {strength?.feedback && strength.feedback.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground">
            Рекомендации:
          </div>
          <div className="space-y-1">
            {strength.feedback.map((feedback, index) => (
              <div key={index} className="flex items-start space-x-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem: React.FC<RequirementItemProps> = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    {met ? (
      <Check className="h-3 w-3 text-green-600" />
    ) : (
      <X className="h-3 w-3 text-red-500" />
    )}
    <span className={met ? 'text-green-700' : 'text-muted-foreground'}>
      {text}
    </span>
  </div>
);