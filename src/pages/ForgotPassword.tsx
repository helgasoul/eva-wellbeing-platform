
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email обязателен');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Here you would implement actual password reset logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsSubmitted(true);
    } catch (error) {
      setError('Произошла ошибка. Попробуйте еще раз.');
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
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
              onClick={() => setIsSubmitted(false)}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`eva-input pl-10 ${error ? 'border-destructive' : ''}`}
                placeholder="your@email.com"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="eva-button w-full"
          >
            {isLoading ? 'Отправляем...' : 'Отправить инструкции'}
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
