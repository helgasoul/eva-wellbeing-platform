
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { DataBridge } from '@/services/DataBridge';

interface WelcomeStepProps {
  onNext?: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  // ✅ НОВОЕ: Получаем данные персонализации
  const dataBridge = DataBridge.getInstance();
  const presets = dataBridge.getOnboardingPresets();
  const analytics = dataBridge.getTransferAnalytics();
  
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Welcome Header */}
      <div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-bloom-dusty-rose to-bloom-mauve rounded-full mb-6">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
          {presets ? 
            `Добро пожаловать в bloom, ${presets.user.firstName}!` : 
            'Добро пожаловать в bloom!'
          }
        </h1>
        <p className="text-lg text-muted-foreground">
          {presets ? 
            `Ваша персональная анкета готова для профиля "${getPersonaTitle(presets.persona.id)}"` :
            'Давайте создадим персональный план поддержки вашего здоровья и благополучия'
          }
        </p>
      </div>

      {/* Process Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-bloom-dusty-rose/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 text-bloom-dusty-rose">
            <Clock className="h-5 w-5" />
            <span>Что вас ждет</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Несколько простых вопросов</p>
              <p className="text-sm text-muted-foreground">О вашем здоровье и образе жизни</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Персональный анализ</p>
              <p className="text-sm text-muted-foreground">Определение вашей фазы менопаузы</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium">Индивидуальные рекомендации</p>
              <p className="text-sm text-muted-foreground">Специально подобранные для вас</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Estimate */}
      <div className="bg-bloom-soft-pink/30 rounded-lg p-4">
        <p className="text-bloom-dusty-rose font-medium">
          ⏱️ Это займет всего {presets?.onboardingConfig.estimatedDuration || '5-7 минут'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ваш прогресс автоматически сохраняется
        </p>
        {presets?.onboardingConfig.prefilledSections?.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            ✅ Базовая информация уже заполнена
          </p>
        )}
      </div>

      {/* Privacy Note */}
      <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-4">
        <p>
          🔒 <strong>Конфиденциальность:</strong> Вся информация надежно защищена и используется 
          только для персонализации вашего опыта в bloom
        </p>
        {analytics && (
          <p className="text-xs text-green-600 mt-2">
            ✅ Данные целостности: {analytics.dataIntegrity}%
          </p>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-4">
        <Button
          onClick={onNext}
          size="lg"
          className="bg-bloom-dusty-rose hover:bg-bloom-mauve text-white px-8 py-3 text-lg"
        >
          <span>Начать анкету</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

// ✅ НОВОЕ: Вспомогательная функция для получения названия персоны
const getPersonaTitle = (personaId: string) => {
  const titles = {
    'first_signs': 'Первые признаки',
    'active_phase': 'Активная фаза', 
    'postmenopause': 'Постменопауза'
  };
  return titles[personaId as keyof typeof titles] || 'Персональный профиль';
};
