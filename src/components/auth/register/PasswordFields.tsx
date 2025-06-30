
import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error-message';
import { RegisterFormData } from '@/types/auth';

interface PasswordFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export const PasswordFields: React.FC<PasswordFieldsProps> = ({
  register,
  errors,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password')}
            className={`eva-input pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <ErrorMessage message={errors.password.message!} />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            className={`eva-input pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            placeholder="Повторите пароль"
            autoComplete="new-password"
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <ErrorMessage message={errors.confirmPassword.message!} />
        )}
      </div>
    </>
  );
};
