import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

export const OnboardingDemo: React.FC = () => {
  const { login } = useAuth();

  const handleDemoLogin = async (scenario: 'new-user' | 'completed-user') => {
    const email = scenario === 'completed-user' ? 'completed@demo.com' : 'new@demo.com';
    
    try {
      await login({
        email,
        password: 'demo123',
        rememberMe: true
      });
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Демонстрация проверки онбординга
        </h3>
        <p className="text-muted-foreground">
          Попробуйте разные сценарии входа в систему
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-3">🆕 Новый пользователь</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Пользователь завершил регистрацию, но еще не прошел онбординг.
            <br />
            <strong>Ожидаемое поведение:</strong> Редирект на онбординг
          </p>
          <Button 
            onClick={() => handleDemoLogin('new-user')}
            className="w-full"
            variant="outline"
          >
            Войти как новый пользователь
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Email: new@demo.com | Password: demo123
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-lg mb-3">✅ Опытный пользователь</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Пользователь уже завершил онбординг ранее.
            <br />
            <strong>Ожидаемое поведение:</strong> Редирект на дашборд
          </p>
          <Button 
            onClick={() => handleDemoLogin('completed-user')}
            className="w-full"
          >
            Войти как опытный пользователь
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Email: completed@demo.com | Password: demo123
          </p>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50/50 border-blue-200">
        <h4 className="font-semibold text-lg mb-3">📋 Логика проверки</h4>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Если пользователь авторизован И onboardingCompleted = true → дашборд</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span>Если пользователь авторизован НО onboardingCompleted = false → онбординг</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            <span>Для врачей и админов проверка не применяется</span>
          </div>
        </div>
      </Card>
    </div>
  );
};