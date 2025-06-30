
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RoleSelector } from './RoleSelector';
import { UserRole } from '@/types/auth';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'patient' as UserRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Here you would implement actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      console.log('Register attempt:', formData);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <div className="relative">
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`eva-input pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
                placeholder="Ваше имя"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.firstName && (
              <p className="text-destructive text-sm">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <div className="relative">
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`eva-input pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
                placeholder="Ваша фамилия"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.lastName && (
              <p className="text-destructive text-sm">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`eva-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
              placeholder="your@email.com"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className={`eva-input pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
              placeholder="Минимум 6 символов"
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
            <p className="text-destructive text-sm">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`eva-input pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              placeholder="Повторите пароль"
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
            <p className="text-destructive text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <RoleSelector
          selectedRole={formData.role}
          onRoleChange={handleRoleChange}
        />

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 rounded border-eva-rose-dark/30 text-primary focus:ring-primary/30"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            Я согласен(а) с{' '}
            <Link to="/terms" className="text-primary hover:underline">
              условиями использования
            </Link>{' '}
            и{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              политикой конфиденциальности
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="eva-button w-full"
        >
          {isLoading ? 'Создаём аккаунт...' : 'Создать аккаунт'}
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
