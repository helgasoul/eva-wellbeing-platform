
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Clock, CheckCircle } from 'lucide-react';

export const WelcomeStep: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      {/* Welcome Header */}
      <div>
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-eva-dusty-rose to-eva-mauve rounded-full mb-6">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
          Добро пожаловать в Eva!
        </h1>
        <p className="text-lg text-muted-foreground">
          Давайте создадим персональный план поддержки вашего здоровья и благополучия
        </p>
      </div>

      {/* Process Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2 text-eva-dusty-rose">
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
      <div className="bg-eva-soft-pink/30 rounded-lg p-4">
        <p className="text-eva-dusty-rose font-medium">
          ⏱️ Это займет всего 5-7 минут
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ваш прогресс автоматически сохраняется
        </p>
      </div>

      {/* Privacy Note */}
      <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-4">
        <p>
          🔒 <strong>Конфиденциальность:</strong> Вся информация надежно защищена и используется 
          только для персонализации вашего опыта в Eva
        </p>
      </div>
    </div>
  );
};
