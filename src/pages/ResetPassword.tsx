import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EnhancedPasswordField } from '@/components/auth/EnhancedPasswordField';
import { resetPasswordSchema } from '@/types/auth';
import { passwordPolicyService } from '@/services/passwordPolicyService';

type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (!accessToken || !refreshToken) {
      setError('Недействительная ссылка для сброса пароля');
    }
  }, [accessToken, refreshToken]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    setIsLoading(true);

    try {
      // Validate password against policy before submitting
      const validation = await passwordPolicyService.validatePassword(data.password);
      
      if (!validation.isValid) {
        setError(validation.errors[0] || 'Пароль не соответствует требованиям безопасности');
        return;
      }

      if (!accessToken || !refreshToken) {
        setError('Недействительная ссылка для сброса пароля');
        return;
      }

      const { user: updatedUser } = await updatePassword(data.password, accessToken, refreshToken);
      
      toast({
        title: 'Пароль обновлен',
        description: 'Ваш пароль был успешно изменен',
      });
      
      // Проверяем статус онбординга и редиректим соответственно
      if (updatedUser?.role === 'patient') {
        if (updatedUser.onboardingCompleted) {
          navigate('/patient/dashboard');
        } else {
          navigate('/patient/onboarding');
        }
      } else {
        navigate('/login');
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при обновлении пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md bloom-card">
          <CardHeader>
            <CardTitle>Ошибка</CardTitle>
            <CardDescription>
              Недействительная или просроченная ссылка для сброса пароля
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="w-full"
            >
              Запросить новую ссылку
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bloom-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-playfair">Сброс пароля</CardTitle>
          <CardDescription>
            Введите новый пароль для вашего аккаунта
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <EnhancedPasswordField
              id="password"
              label="Новый пароль"
              placeholder="Создайте надежный пароль"
              value={password || ''}
              onChange={(value) => setValue('password', value)}
              error={errors.password?.message}
              disabled={isLoading}
              showStrengthIndicator={true}
              showGenerateButton={true}
            />

            <EnhancedPasswordField
              id="confirmPassword"
              label="Подтвердите новый пароль"
              placeholder="Повторите новый пароль"
              value={confirmPassword || ''}
              onChange={(value) => setValue('confirmPassword', value)}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
              showStrengthIndicator={false}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Обновить пароль
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}