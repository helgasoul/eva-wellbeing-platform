import React from 'react';
import { Check, Heart, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface TariffPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  buttonText: string;
  specialOffer?: string;
}

const TariffPlansSection: React.FC = () => {
  const plans: TariffPlan[] = [
    {
      id: 'basic',
      name: 'Базовый',
      price: 0,
      period: 'навсегда',
      description: 'Основные инструменты для отслеживания здоровья',
      features: [
        'Трекер симптомов',
        'Календарь менструального цикла',
        'Базовые рекомендации',
        'Поддержка сообщества',
        'Напоминания о приеме препаратов'
      ],
      icon: <Heart className="h-8 w-8" />,
      color: 'from-purple-100 to-pink-100',
      buttonText: 'Начать бесплатно'
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 2990,
      period: 'в месяц',
      description: 'Персональный подход к вашему здоровью',
      features: [
        'Все из базового тарифа',
        'Консультации с врачами',
        'Персональные рекомендации по питанию',
        'Интеграция с носимыми устройствами',
        'Анализ лабораторных результатов',
        'Приоритетная поддержка'
      ],
      popular: true,
      icon: <Star className="h-8 w-8" />,
      color: 'from-primary/20 to-secondary/20',
      buttonText: 'Выбрать премиум',
      specialOffer: 'Первый месяц за 1990 ₽'
    },
    {
      id: 'optimum',
      name: 'Оптимум',
      price: 4990,
      period: 'в месяц',
      description: 'Максимальная персонализация на основе генетики',
      features: [
        'Все из премиум тарифа',
        'Генетическое тестирование',
        'Анализ микробиома',
        'Индивидуальные планы питания',
        'Персональные программы тренировок',
        'Экспертная поддержка 24/7',
        'Семейная программа'
      ],
      icon: <Crown className="h-8 w-8" />,
      color: 'from-gradient-primary via-gradient-secondary to-gradient-primary',
      buttonText: 'Выбрать оптимум'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-background via-purple-50/30 to-pink-50/20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Выберите план заботы о себе
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Мы создали три варианта поддержки — от базового до максимально персонализированного. 
            Начните с того, что подходит именно вам.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-elegant hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary shadow-glow' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 text-sm font-semibold">
                  ⭐ Самый популярный
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-br ${plan.color} text-center relative ${plan.popular ? 'pt-12' : ''}`}>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-3 bg-white/70 rounded-full">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  <div className="text-center">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-3xl font-bold text-foreground">
                        {plan.price === 0 ? 'Бесплатно' : `${plan.price.toLocaleString()} ₽`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground">/{plan.period}</span>
                      )}
                    </div>
                    {plan.specialOffer && (
                      <Badge variant="secondary" className="mt-2">
                        {plan.specialOffer}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-muted-foreground mb-6 text-center">
                  {plan.description}
                </p>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Link to="/register" className="w-full">
                  <Button 
                    className={`w-full py-3 text-lg transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-secondary hover:shadow-glow' 
                        : 'hover:scale-105'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Все тарифы включают полную конфиденциальность и безопасность ваших данных
          </p>
          <p className="text-sm text-muted-foreground">
            Можете в любое время изменить или отменить подписку
          </p>
        </div>
      </div>
    </section>
  );
};

export default TariffPlansSection;