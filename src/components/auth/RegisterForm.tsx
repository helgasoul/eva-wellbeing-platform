
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { RoleSelector } from './RoleSelector';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { RegisterFormData, registerSchema } from '@/types/auth';

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const selectedRole = watch('role');
  const agreeToTerms = watch('agreeToTerms');
  const agreeToPrivacy = watch('agreeToPrivacy');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        agreeToTerms: data.agreeToTerms,
        agreeToPrivacy: data.agreeToPrivacy,
      });
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Registration error:', error);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setValue('role', role);
  };

  return (
    <div className="eva-card p-8 w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair font-semibold text-foreground mb-2">
          Присоединяйтесь к Eva
        </h2>
        <p className="text-muted-foreground">
          Создайте аккаунт для доступа к платформе
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <div className="relative">
              <Input
                id="firstName"
                type="text"
                {...register('firstName')}
                className={`eva-input pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                placeholder="Ваше имя"
                autoComplete="given-name"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.firstName && (
              <ErrorMessage message={errors.firstName.message!} />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <div className="relative">
              <Input
                id="lastName"
                type="text"
                {...register('lastName')}
                className={`eva-input pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
                placeholder="Ваша фамилия"
                autoComplete="family-name"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.lastName && (
              <ErrorMessage message={errors.lastName.message!} />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={`eva-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
              placeholder="your@email.com"
              autoComplete="email"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.email && (
            <ErrorMessage message={errors.email.message!} />
          )}
        </div>

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

        <div className="space-y-2">
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />
          {errors.role && (
            <ErrorMessage message={errors.role.message!} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
            />
            <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground cursor-pointer">
              Я согласен(а) с{' '}
              <Link to="/terms" className="text-primary hover:underline">
                условиями использования
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <ErrorMessage message={errors.agreeToTerms.message!} />
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToPrivacy"
              checked={agreeToPrivacy}
              onCheckedChange={(checked) => setValue('agreeToPrivacy', !!checked)}
            />
            <label htmlFor="agreeToPrivacy" className="text-sm text-muted-foreground cursor-pointer">
              Я согласен(а) с{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                политикой конфиденциальности
              </Link>
            </label>
          </div>
          {errors.agreeToPrivacy && (
            <ErrorMessage message={errors.agreeToPrivacy.message!} />
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="eva-button w-full flex items-center justify-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{isLoading ? 'Создаём аккаунт...' : 'Создать аккаунт'}</span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};
