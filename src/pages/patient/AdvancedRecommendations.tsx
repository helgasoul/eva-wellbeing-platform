import React from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, TrendingUp, Clock, AlertCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdvancedRecommendations: React.FC = () => {
  return (
    <PatientLayout title="Расширенные рекомендации">
      <div className="space-y-6">
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Расширенные рекомендации</h1>
          <p className="text-muted-foreground">
            Персонализированные рекомендации на основе AI-анализа ваших данных
          </p>
        </div>

        {/* Статус разработки */}
        <Card className="border-eva-dusty-rose/20 bg-eva-soft-pink/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-eva-dusty-rose">
              <Brain className="h-5 w-5" />
              Скоро в Eva!
            </CardTitle>
            <CardDescription>
              Мы разрабатываем революционную систему персонализированных рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-eva-dusty-rose">Что вас ждет:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-eva-mauve" />
                    AI-анализ всех ваших симптомов
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-eva-mauve" />
                    Прогнозирование изменений
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-eva-mauve" />
                    Оптимальное время для активностей
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-eva-mauve" />
                    Персональные планы питания
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-eva-dusty-rose">Инновации:</h3>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-eva-sage" />
                    Машинное обучение для каждой пользователи
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-eva-sage" />
                    Предупреждения о рисках
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-eva-sage" />
                    Интеграция с носимыми устройствами
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-eva-sage" />
                    Долгосрочные тренды здоровья
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-4 border-t">
              <Badge variant="secondary" className="bg-eva-dusty-rose/10 text-eva-dusty-rose">
                В разработке
              </Badge>
              <span className="text-sm text-muted-foreground">
                Ожидаемый запуск: Q2 2024
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Предварительные функции */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Базовые рекомендации */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-eva-dusty-rose" />
                Пока доступно
              </CardTitle>
              <CardDescription>
                Используйте существующие функции Eva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Базовые рекомендации Eva
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Трекер симптомов
              </Button>
              <Button variant="outline" className="w-full justify-start">
                AI-помощник для консультаций
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Анализ менструального цикла
              </Button>
            </CardContent>
          </Card>

          {/* Уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-eva-mauve" />
                Получить уведомление
              </CardTitle>
              <CardDescription>
                Узнайте первыми о запуске новых функций
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Мы отправим вам уведомление, как только расширенные рекомендации станут доступны в вашем аккаунте.
              </p>
              <Button className="w-full bg-eva-dusty-rose hover:bg-eva-dusty-rose/90">
                Подписаться на уведомления
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle>Дорожная карта развития</CardTitle>
            <CardDescription>
              Что мы планируем добавить в ближайшее время
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-eva-dusty-rose rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">AI-Анализ паттернов</h3>
                  <p className="text-sm text-muted-foreground">
                    Автоматическое выявление закономерностей в ваших симптомах
                  </p>
                  <Badge variant="secondary" className="mt-1">Q1 2024</Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-eva-mauve rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">Персонализированные планы</h3>
                  <p className="text-sm text-muted-foreground">
                    Индивидуальные планы питания, упражнений и режима дня
                  </p>
                  <Badge variant="secondary" className="mt-1">Q2 2024</Badge>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 bg-eva-sage rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold">Интеграция с устройствами</h3>
                  <p className="text-sm text-muted-foreground">
                    Подключение фитнес-трекеров и умных весов
                  </p>
                  <Badge variant="secondary" className="mt-1">Q3 2024</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default AdvancedRecommendations;