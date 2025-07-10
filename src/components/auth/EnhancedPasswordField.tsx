import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { passwordPolicyService, PasswordStrength } from '@/services/passwordPolicyService';

interface EnhancedPasswordFieldProps {
  id?: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
  showGenerateButton?: boolean;
  userInfo?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
  className?: string;
}

export const EnhancedPasswordField: React.FC<EnhancedPasswordFieldProps> = ({
  id = 'password',
  label,
  placeholder = 'Введите пароль',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  showStrengthIndicator = true,
  showGenerateButton = false,
  userInfo,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength | undefined>();
  const [isValidating, setIsValidating] = useState(false);

  // Calculate password strength with debouncing
  useEffect(() => {
    if (!value || !showStrengthIndicator) {
      setStrength(undefined);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const validation = await passwordPolicyService.validatePassword(value, userInfo);
        setStrength(validation.strength);
      } catch (error) {
        console.warn('Failed to validate password:', error);
      } finally {
        setIsValidating(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [value, userInfo, showStrengthIndicator]);

  const handleGeneratePassword = () => {
    try {
      const generatedPassword = passwordPolicyService.generateSecurePassword(16);
      onChange(generatedPassword);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {showGenerateButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGeneratePassword}
            disabled={disabled}
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Сгенерировать
          </Button>
        )}
      </div>
      
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`eva-input pr-10 ${error ? 'border-destructive' : ''} ${
            strength && value ? 
              strength.score >= 3 ? 'border-green-500' : 
              strength.score >= 2 ? 'border-yellow-500' : 
              'border-red-500'
            : ''
          }`}
          placeholder={placeholder}
          disabled={disabled || isValidating}
          autoComplete="new-password"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {showStrengthIndicator && value && (
        <PasswordStrengthIndicator 
          password={value} 
          strength={strength}
          className="mt-3"
        />
      )}
    </div>
  );
};