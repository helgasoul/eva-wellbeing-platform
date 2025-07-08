
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: 'Персонализированная поддержка',
      description: 'Научно обоснованные рекомендации, адаптированные к вашим уникальным потребностям в период менопаузы'
    },
    {
      icon: Users,
      title: 'Глобальное сообщество',
      description: 'Присоединяйтесь к тысячам женщин по всему миру, которые поддерживают друг друга'
    },
    {
      icon: Shield,
      title: 'Медицинская экспертиза',
      description: 'Консультации квалифицированных специалистов по женскому здоровью'
    }
  ];

  const benefits = [
    'Персонализированные научно обоснованные рекомендации',
    'Онлайн-консультации с экспертами по менопаузе',
    'Образовательные материалы и ресурсы',
    'Поддержка сообщества женщин',
    'Полная конфиденциальность ваших данных',
    'Круглосуточная техническая поддержка'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="inline-flex p-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full mb-8 animate-gentle-float backdrop-blur-sm">
              <Heart className="h-16 w-16 text-primary" />
            </div>
            
            {/* BLOOM Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/575c56ef-7422-45a9-8025-ff7e8011e21b.png" 
                alt="BLOOM" 
                className="h-16 md:h-20 mx-auto"
              />
            </div>
            
            {/* Empathetic main message */}
            <h1 className="text-3xl md:text-5xl font-playfair font-bold text-foreground mb-6 leading-tight">
              Мы поддерживаем женщин{' '}
              <span className="text-primary">
                во всём мире
              </span>
            </h1>
            
            <div className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              в заботе о своём здоровье, предоставляя персонализированные, 
              научно обоснованные рекомендации для поддержки женщин в период менопаузы
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-soft hover:shadow-gentle group">
                  Начать заботу о себе
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-primary/30 text-foreground hover:bg-accent px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105">
                  Узнать больше о платформе
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Community Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-6">
              Вы не одни в этом важном жизненном периоде
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Период менопаузы — это естественная и важная часть жизни каждой женщины. 
              Мы здесь, чтобы поддержать вас на этом пути с пониманием, заботой и профессиональной помощью.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl shadow-floating animate-fade-in group cursor-pointer">
            <img 
              src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
              alt="Глобальное сообщество женщин bloom — поддержка и взаимопонимание"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <h3 className="text-2xl font-playfair font-semibold mb-2">
                Тысячи женщин уже с нами
              </h3>
              <p className="text-lg opacity-90">
                Присоединяйтесь к глобальному сообществу поддержки
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-accent">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-6">
              Почему женщины выбирают BLOOM?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Мы объединили медицинскую экспертизу, передовые технологии 
              и глубокое понимание потребностей женщин
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 text-center group hover:scale-105 transition-all duration-300 rounded-xl shadow-soft hover:shadow-gentle cursor-pointer"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 animate-soft-pulse">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-muted to-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-slide-in">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-6">
                Комплексная поддержка на каждом этапе
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Каждая женщина уникальна, и её путь через менопаузу тоже особенный. 
                С BLOOM вы получите индивидуальную поддержку, основанную на последних 
                научных исследованиях и многолетнем опыте специалистов.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-all duration-200">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-gentle transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="inline-flex p-6 bg-primary/10 rounded-full mb-6 animate-gentle-float">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-foreground mb-4">
                  Готовы присоединиться?
                </h3>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  Тысячи женщин во всём мире уже доверили своё здоровье 
                  и благополучие платформе BLOOM
                </p>
                <Link to="/register">
                 <Button className="w-full text-lg py-3 bg-primary text-primary-foreground font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-soft">
                    Присоединиться бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-6">
              Начните заботу о себе уже сегодня
            </h2>
            <p className="text-lg text-white/95 mb-10 leading-relaxed">
              Не откладывайте заботу о своём здоровье и благополучии. 
              Присоединяйтесь к BLOOM и получите доступ к персонализированной 
              поддержке уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3 font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-soft">
                  Создать аккаунт бесплатно
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg px-8 py-3 border-2 border-white/40 text-white hover:bg-white/10 font-medium rounded-full transition-all duration-300 hover:scale-105">
                  Уже есть аккаунт?
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
