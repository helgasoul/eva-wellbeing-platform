import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Lock, Zap, ShoppingCart, BarChart3, Users } from 'lucide-react';

interface PremiumTeaserProps {
  onUpgrade?: () => void;
  className?: string;
}

export const PremiumTeaser: React.FC<PremiumTeaserProps> = ({ onUpgrade, className }) => {
  const premiumFeatures = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Персональные планы питания',
      description: 'Индивидуальные рекомендации на основе ваших симптомов и предпочтений',
      tier: 'Plus',
      color: 'text-primary'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Анализ дефицитов',
      description: 'Выявление недостатка витаминов и минералов с персональными советами',
      tier: 'Plus',
      color: 'text-primary'
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: 'Умные списки покупок',
      description: 'Автоматические списки продуктов для ваших планов питания',
      tier: 'Plus',
      color: 'text-primary'
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: 'Адаптация под симптомы',
      description: 'Рецепты автоматически подстраиваются под ваши текущие симптомы',
      tier: 'Optimum',
      color: 'text-secondary'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Консультации нутрициолога',
      description: 'Индивидуальные консультации со специалистом по питанию',
      tier: 'Optimum',
      color: 'text-secondary'
    }
  ];

  const subscriptionTiers = [
    {
      name: 'Plus',
      price: '990 ₽/мес',
      features: [
        'Полные рецепты и планы',
        'Анализ дефицитов',
        'Списки покупок',
        'Трекинг питания'
      ],
      color: 'from-primary to-accent',
      textColor: 'text-primary',
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: 'Optimum',
      price: '1490 ₽/мес',
      features: [
        'Всё из Plus',
        'Персональные адаптации',
        'Консультации специалистов',
        'Приоритетная поддержка'
      ],
      color: 'from-secondary to-accent',
      textColor: 'text-secondary',
      icon: <Star className="h-5 w-5" />
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Основная карточка с тизером */}
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background backdrop-blur-sm border-primary/20 shadow-elegant rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Lock className="h-6 w-6 text-primary" />
            Откройте полный потенциал питания
          </CardTitle>
          <p className="text-muted-foreground">
            Получите персональные планы питания, разработанные специально для вашей фазы менопаузы
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Список премиум функций */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-background/50 to-accent/5 rounded-xl border border-border/50">
                <div className={`${feature.color} flex-shrink-0 mt-0.5`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${feature.color} border-current`}
                    >
                      {feature.tier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Тарифные планы */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionTiers.map((tier, index) => (
              <Card key={index} className="bg-gradient-to-br from-background/80 to-accent/5 border-primary/10">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className={tier.textColor}>{tier.icon}</span>
                    {tier.name}
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">{tier.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onUpgrade}
                    className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 transition-opacity`}
                  >
                    Выбрать {tier.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Основная CTA */}
          <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Начните заботиться о себе уже сегодня
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Получите персональные рекомендации по питанию, основанные на науке и вашей уникальной ситуации
            </p>
            <Button
              onClick={onUpgrade}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Crown className="h-5 w-5 mr-2" />
              Улучшить подписку
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные преимущества */}
      <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Научный подход</h4>
              <p className="text-sm text-muted-foreground">
                Рекомендации основаны на последних исследованиях в области питания при менопаузе
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Поддержка экспертов</h4>
              <p className="text-sm text-muted-foreground">
                Команда нутрициологов и врачей всегда готова помочь вам
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground">Результат</h4>
              <p className="text-sm text-muted-foreground">
                95% пользователей отмечают улучшение самочувствия через месяц
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};