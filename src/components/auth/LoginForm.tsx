
import React, { useState } from 'react';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAuth } from '@/context/AuthContext';
import { LoginFormData, loginSchema } from '@/types/auth';
import { migrateLocalStorageUser, clearLocalStorageUserData } from '@/utils/userMigration';
import { useToast } from '@/hooks/use-toast';

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showMigrationForm, setShowMigrationForm] = useState(false);
  const [migrationPassword, setMigrationPassword] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const { login, isLoading, error } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
    } catch (error: any) {
      // Если ошибка входа, проверяем localStorage
      const localUser = localStorage.getItem('eva_user_data');
      if (localUser && error.message === 'Invalid login credentials') {
        const userData = JSON.parse(localUser);
        if (userData.email === data.email) {
          // Показываем форму миграции
          setShowMigrationForm(true);
          return;
        }
      }
      console.error('Login error:', error);
    }
  };

  const handleMigration = async () => {
    const formData = watch();
    
    if (!formData.email || !migrationPassword) {
      toast({
        title: "Ошибка",
        description: "Введите email и новый пароль",
        variant: "destructive",
      });
      return;
    }
    
    setIsMigrating(true);
    try {
      const result = await migrateLocalStorageUser(formData.email, migrationPassword);
      
      if (result.success) {
        // Очищаем localStorage
        clearLocalStorageUserData();
        
        // Входим с новым паролем
        await login({
          email: formData.email,
          password: migrationPassword,
          rememberMe: formData.rememberMe,
        });
        
        toast({
          title: "Успешно!",
          description: "Аккаунт успешно обновлен!",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Ошибка миграции:', error);
      toast({
        title: "Ошибка",
        description: "Ошибка обновления аккаунта",
        variant: "destructive",
      });
    }
    setIsMigrating(false);
  };

  return (
    <AuthErrorBoundary>
      <div className="bloom-card p-8 w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair font-semibold text-foreground mb-2">
          Добро пожаловать в bloom
        </h2>
        <p className="text-muted-foreground">
          Войдите в свой аккаунт
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              {...register('email')}
              className={`bloom-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
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
              className={`bloom-input pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              placeholder="Введите пароль"
              autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
            />
            <Label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
              Запомнить меня
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Забыли пароль?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="bloom-button w-full flex items-center justify-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{isLoading ? 'Входим...' : 'Войти'}</span>
        </Button>
      </form>

      {showMigrationForm && (
        <div className="migration-form mt-6 p-6 bloom-card-secondary rounded-lg border border-primary/20">
          <h3 className="text-lg font-playfair font-semibold text-primary mb-2">
            Обновление аккаунта
          </h3>
          <p className="text-muted-foreground mb-4">
            Ваш аккаунт нужно обновить для работы с новой системой. 
            Придумайте новый пароль:
          </p>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="migrationPassword" className="block text-sm font-medium text-foreground mb-2">
                Новый пароль
              </Label>
              <Input
                id="migrationPassword"
                type="password"
                value={migrationPassword}
                onChange={(e) => setMigrationPassword(e.target.value)}
                className="bloom-input"
                placeholder="Введите новый пароль"
                minLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleMigration}
                disabled={isMigrating}
                className="bloom-button flex-1"
              >
                {isMigrating && <LoadingSpinner size="sm" className="mr-2" />}
                {isMigrating ? 'Обновляем...' : 'Обновить аккаунт'}
              </Button>
              
              <Button
                onClick={() => setShowMigrationForm(false)}
                variant="outline"
                className="px-4"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 ЭКСТРЕННЫЙ ДОСТУП */}
      <div className="mt-6 border-t pt-6">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-3">
            Проблемы с входом? Используйте экстренный доступ:
          </p>
          <Link 
            to="/emergency-access"
            className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 transition-colors border border-red-200"
          >
            🚨 Экстренное восстановление
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
    </AuthErrorBoundary>
  );
};
