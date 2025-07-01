
import React from 'react';
import { Heart, FileText, Calendar, MessageCircle, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Heart,
      title: 'Мои симптомы',
      description: 'Отслеживание самочувствия и симптомов',
      status: 'В разработке',
      color: 'from-eva-dusty-rose to-primary'
    },
    {
      icon: FileText,
      title: 'Мои документы',
      description: 'Результаты анализов и медицинские записи',
      status: 'В разработке',
      color: 'from-eva-soft-pink to-eva-warm-beige'
    },
    {
      icon: Calendar,
      title: 'Консультации',
      description: 'Запись на приём к специалистам',
      status: 'В разработке',
      color: 'from-eva-blush to-eva-mauve'
    },
    {
      icon: MessageCircle,
      title: 'Сообщества',
      description: 'Общение с другими женщинами',
      status: 'В разработке',
      color: 'from-eva-pearl to-eva-cream'
    },
    {
      icon: TrendingUp,
      title: 'Мой прогресс',
      description: 'Аналитика здоровья и рекомендации',
      status: 'В разработке',
      color: 'from-eva-taupe to-eva-dusty-rose'
    },
    {
      icon: User,
      title: 'Профиль',
      description: 'Управление личными данными',
      status: 'В разработке',
      color: 'from-eva-warm-beige to-eva-soft-pink'
    }
  ];

  return (
    <div className="min-h-screen eva-gradient py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex p-6 bg-gradient-to-br from-eva-dusty-rose to-primary rounded-full mb-6">
            <Heart className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Добро пожаловать, {user?.firstName}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ваш персональный помощник для заботы о здоровье в период менопаузы. 
            Здесь вы найдете поддержку, информацию и инструменты для комфортного перехода.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="eva-card p-6 text-center hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="eva-card p-8 text-center">
          <div className="inline-flex p-6 bg-gradient-to-br from-eva-soft-pink to-eva-warm-beige rounded-full mb-6">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-foreground mb-4">
            Начните свой путь к здоровью
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            Мы активно работаем над созданием персональных инструментов поддержки. 
            Скоро здесь появятся функции отслеживания симптомов, персональные рекомендации 
            и возможность записи на консультации с врачами.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="eva-button">
              Заполнить профиль здоровья
            </button>
            <button className="eva-button bg-eva-soft-pink hover:bg-eva-blush">
              Присоединиться к сообществу
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
