
import React from 'react';
import { Heart, Calendar, MessageCircle, User } from 'lucide-react';

const Dashboard = () => {
  const features = [
    {
      icon: Heart,
      title: 'Мониторинг здоровья',
      description: 'Отслеживание симптомов и самочувствия',
      status: 'В разработке'
    },
    {
      icon: Calendar,
      title: 'Консультации',
      description: 'Запись на приём к специалисту',
      status: 'В разработке'
    },
    {
      icon: MessageCircle,
      title: 'Сообщество',
      description: 'Общение с другими женщинами',
      status: 'В разработке'
    },
    {
      icon: User,
      title: 'Профиль',
      description: 'Управление личными данными',
      status: 'В разработке'
    }
  ];

  return (
    <div className="min-h-screen eva-gradient py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Добро пожаловать в ваш личный кабинет
          </h1>
          <p className="text-lg text-muted-foreground">
            Здесь будут доступны все функции платформы Eva
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="eva-card p-6 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-eva-coral to-primary rounded-full mb-4">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <span className="inline-block px-3 py-1 bg-eva-sage/30 text-eva-sage-dark text-xs rounded-full">
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="eva-card p-8 text-center">
          <div className="inline-flex p-6 bg-gradient-to-br from-eva-lavender to-eva-lavender-dark rounded-full mb-6">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Скоро здесь будет много полезного!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Мы активно работаем над созданием полнофункциональной платформы для поддержки 
            женщин в период менопаузы. Здесь будут доступны персональные рекомендации, 
            консультации с врачами, образовательные материалы и многое другое.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
