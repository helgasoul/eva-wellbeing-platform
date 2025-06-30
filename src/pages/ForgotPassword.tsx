
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAuth } from '@/context/AuthContext';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Введите корректный email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Forgot password error:', error);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    reset();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen eva-gradient flex items-center justify-center py-12 px-4">
        <div className="eva-card p-8 w-full max-w-md mx-auto text-center animate-fade-in">
          <div className="inline-flex p-4 bg-gradient-to-br from-eva-sage to-eva-sage-dark rounded-full mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Письмо отправлено
          </h2>
          <p className="text-muted-foreground mb-6">
            Мы отправили инструкции по восстановлению пароля на адрес{' '}
            <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Не видите письмо? Проверьте папку "Спам" или попробуйте еще раз
          </p>
          <div className="space-y-4">
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full"
            >
              Отправить еще раз
            </Button>
            <Link to="/login">
              <Button className="eva-button w-full">
                Вернуться к входу
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen eva-gradient flex items-center justify-center py-12 px-4">
      <div className="eva-card p-8 w-full max-w-md mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-2">
            Восстановление пароля
          </h2>
          <p className="text-muted-foreground">
            Введите ваш email для получения инструкций по восстановлению пароля
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

          <Button
            type="submit"
            disabled={isLoading}
            className="eva-button w-full flex items-center justify-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{isLoading ? 'Отправляем...' : 'Отправить инструкции'}</span>
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Вернуться к входу
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
