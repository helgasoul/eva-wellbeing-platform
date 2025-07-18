import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings, Shield, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GeolocationStep from '@/components/onboarding/steps/GeolocationStep';
import { supabase } from '@/integrations/supabase/client';
import { weatherService } from '@/services/weatherService';

export const ProfileSetup: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'geolocation' | 'complete'>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSetup = () => {
    setCurrentStep('geolocation');
  };

  const handleGeolocationComplete = async (data: { location: any, weather: any }) => {
    try {
      setIsLoading(true);
      const { location, weather } = data;
      
      const geolocationData = {
        location,
        weather,
        recordedAt: new Date().toISOString()
      };

      // Сохраняем местоположение пользователя в базу данных
      if (user?.id) {
        const { error: locationError } = await supabase
          .from('user_locations')
          .upsert({
            user_id: user.id,
            location_data: location,
            is_active: true
          });

        if (locationError) {
          console.error('Error saving user location:', locationError);
        }

        // Сохраняем погодные данные
        await weatherService.saveWeatherData(user.id, location, weather);
        
        // Обновляем пользователя
        await updateUser({ 
          locationData: geolocationData
        } as any);
        
        console.log('✅ Location and weather data saved for user:', user.id);
      }

      setCurrentStep('complete');
      
      toast({
        title: 'Геолокация настроена!',
        description: 'Теперь вы будете получать персонализированные рекомендации на основе климата.',
      });

    } catch (error) {
      console.error('Error handling geolocation completion:', error);
      toast({
        title: 'Ошибка геолокации',
        description: 'Не удалось сохранить данные местоположения. Вы можете настроить это позже.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipGeolocation = () => {
    console.log('📍 User skipped geolocation setup');
    navigate('/patient/dashboard');
  };

  const handleComplete = () => {
    navigate('/patient/dashboard');
  };

  if (currentStep === 'geolocation') {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <GeolocationStep
            onChange={handleGeolocationComplete}
            onSkip={handleSkipGeolocation}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-playfair">Настройка завершена!</CardTitle>
            <CardDescription>
              Ваш профиль полностью настроен. Теперь вы можете пользоваться всеми функциями приложения.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleComplete} className="bloom-button w-full">
              Перейти в дашборд
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-playfair mb-4">Завершение настройки профиля</CardTitle>
          <CardDescription className="text-lg">
            Осталось настроить несколько дополнительных параметров для получения персонализированных рекомендаций
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Геолокация */}
          <div className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Местоположение</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Позволяет получать рекомендации с учетом климата и погодных условий вашего региона
              </p>
              <div className="text-xs text-muted-foreground">
                • Персональные советы по питанию
                <br />
                • Рекомендации по физической активности
                <br />
                • Учет влияния погоды на симптомы
              </div>
            </div>
          </div>

          {/* Дополнительные настройки */}
          <div className="flex items-start gap-4 p-4 border rounded-lg opacity-50">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Дополнительные настройки</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Настройки уведомлений, приватности и интеграций (доступно позже)
              </p>
              <div className="text-xs text-muted-foreground">
                • Уведомления о приеме добавок
                <br />
                • Синхронизация с фитнес-трекерами
                <br />
                • Настройки приватности данных
              </div>
            </div>
          </div>

          {/* Безопасность */}
          <div className="flex items-start gap-4 p-4 border rounded-lg bg-green-50">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">Безопасность данных</h3>
              <p className="text-muted-foreground text-sm">
                Все данные шифруются и хранятся в соответствии с международными стандартами безопасности
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSkipGeolocation}
              className="flex-1"
            >
              Пропустить
            </Button>
            <Button 
              onClick={handleStartSetup}
              className="bloom-button flex-1"
            >
              Начать настройку
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;