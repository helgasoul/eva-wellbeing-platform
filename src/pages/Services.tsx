import React from 'react';
import { Heart, Users, Shield, Clock, MessageCircle, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TariffPlansSection from '@/components/landing/TariffPlansSection';
import { Link } from 'react-router-dom';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Персональное сопровождение',
      description: 'Индивидуальный подход к каждой женщине с учетом её уникальных потребностей и симптомов',
      features: ['Трекер симптомов', 'Календарь циклов', 'Персональные рекомендации']
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Консультации специалистов',
      description: 'Доступ к квалифицированным врачам и психологам, специализирующимся на женском здоровье',
      features: ['Онлайн консультации', 'Запись к врачу', 'Экспертная поддержка']
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: 'Поддержка сообщества',
      description: 'Безопасное пространство для общения с другими женщинами, переживающими подобные изменения',
      features: ['Группы поддержки', 'Анонимное общение', 'Обмен опытом']
    },
    {
      icon: <TestTube className="h-8 w-8 text-primary" />,
      title: 'Анализ здоровья',
      description: 'Интерпретация лабораторных результатов и рекомендации по улучшению показателей',
      features: ['Анализ результатов', 'Интеграция с лабораториями', 'Персональные рекомендации']
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Конфиденциальность',
      description: 'Полная безопасность и конфиденциальность всех ваших данных и медицинской информации',
      features: ['Шифрование данных', 'Соответствие 152-ФЗ', 'Контроль доступа']
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: 'Поддержка 24/7',
      description: 'Круглосуточная техническая поддержка и возможность получения помощи в любое время',
      features: ['Техподдержка', 'Неотложная помощь', 'Чат с экспертами']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-pink-50/10">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Как мы помогаем
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            bloom предоставляет комплексную поддержку для женщин на всех этапах жизни. 
            Мы создали экосистему заботы, где каждая находит то, что нужно именно ей.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-glow">
                Начать бесплатно
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="px-8 py-3 text-lg">
                Узнать больше
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            Наши услуги
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-elegant transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-fit">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-center">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-foreground flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tariff Plans Section */}
      <TariffPlansSection />

      {/* Contact Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-purple-50/40 to-pink-50/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Есть вопросы?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Наша команда готова помочь вам выбрать подходящий план и ответить на все вопросы
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-8 py-3 text-lg" variant="outline">
              Связаться с нами
            </Button>
            <Button className="px-8 py-3 text-lg bg-gradient-to-r from-primary to-secondary hover:shadow-glow">
              Получить консультацию
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;