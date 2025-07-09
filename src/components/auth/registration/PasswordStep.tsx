import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepWrapper } from './StepWrapper';
import { useRegistration } from '@/context/RegistrationContext';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';

interface PasswordStepProps {
  onComplete: (data: { password: string; firstName: string; lastName: string }) => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = isPasswordValid && doPasswordsMatch && firstName.trim() && lastName.trim();

  const handleSubmit = () => {
    if (isFormValid) {
      onComplete({ password, firstName, lastName });
    }
  };

  return (
    <StepWrapper
      title="Создайте ваш аккаунт"
      subtitle="Последний шаг - установите пароль и введите ваши данные"
      step={4}
      totalSteps={4}
    >
      <div className="space-y-6">
        {/* Личные данные */}
        <div className="space-y-4 p-6 border border-muted rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Личные данные</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Анна"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванова"
              />
            </div>
          </div>
        </div>

        {/* Пароль */}
        <div className="space-y-4 p-6 border border-muted rounded-lg bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Безопасность</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Пароль *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 8 символов"
                  className={!isPasswordValid && password ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {!isPasswordValid && password && (
                <p className="text-sm text-destructive">Пароль должен содержать минимум 8 символов</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className={!doPasswordsMatch && confirmPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {!doPasswordsMatch && confirmPassword && (
                <p className="text-sm text-destructive">Пароли не совпадают</p>
              )}
            </div>
          </div>

          {/* Требования к паролю */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm text-foreground mb-2">Требования к паролю:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                <span className={`w-1 h-1 rounded-full ${password.length >= 8 ? 'bg-green-600' : 'bg-muted-foreground'}`}></span>
                Минимум 8 символов
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                Рекомендуем использовать буквы, цифры и спецсимволы
              </li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="bloom-button w-full"
        >
          Создать аккаунт
        </Button>
      </div>
    </StepWrapper>
  );
};