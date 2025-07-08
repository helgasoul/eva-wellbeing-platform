
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Shield, CheckCircle, Book } from 'lucide-react';
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
      {/* Clean Hero Section */}
      <section className="min-h-screen bg-background flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Logo Section */}
            <div className="mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center p-4 bg-card rounded-2xl shadow-clean mb-8 animate-gentle-float">
                <img 
                  src="/lovable-uploads/7a0ec4e6-a4a7-4b76-b29d-c8ce93cce8c9.png" 
                  alt="BLOOM - Платформа поддержки женщин в период менопаузы" 
                  className="h-12 w-auto"
                />
                <Heart className="ml-3 h-6 w-6 text-primary" />
              </div>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
                Основано на рекомендациях ВОЗ • Одобрено врачами
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h1 className="mb-4 leading-tight">
                Мы поддерживаем{' '}
                <span className="text-primary">женщин</span>
                <br />
                во всём мире
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                в заботе о своём здоровье, предоставляя персонализированные, 
                научно обоснованные рекомендации для поддержки в период менопаузы
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-medium text-base btn-hover shadow-clean"
                >
                  Начать заботу о себе
                </Button>
              </Link>
              
              <span className="text-muted-foreground text-sm">или</span>
              
              <Link to="/about">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border border-border text-foreground hover:bg-accent px-8 py-4 rounded-xl font-medium text-base btn-hover"
                >
                  Узнать больше
                </Button>
              </Link>
            </div>
            
            {/* Trust Statistics */}
            <div className="bg-card rounded-2xl p-8 shadow-clean max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <p className="text-foreground font-medium mb-6">
                Уже доверились здоровью с BLOOM
              </p>
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">15,000+</div>
                  <div className="text-sm text-muted-foreground">женщин</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">50+</div>
                  <div className="text-sm text-muted-foreground">стран</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-1">4.9/5</div>
                  <div className="text-sm text-muted-foreground">рейтинг</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Community Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Вы не одни в этом важном жизненном периоде
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Период менопаузы — это естественная и важная часть жизни каждой женщины. 
              Мы здесь, чтобы поддержать вас на этом пути с пониманием, заботой и профессиональной помощью.
            </p>
          </div>

          <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
            <img 
              src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
              alt="Глобальное сообщество женщин BLOOM — поддержка и взаимопонимание"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Почему женщины выбирают BLOOM?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Мы объединили медицинскую экспертизу, передовые технологии 
              и глубокое понимание потребностей женщин
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card p-8 text-center rounded-xl shadow-clean hover:shadow-soft transition-all duration-200"
                >
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-6">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
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
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Комплексная поддержка на каждом этапе
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Каждая женщина уникальна, и её путь через менопаузу тоже особенный. 
                С BLOOM вы получите индивидуальную поддержку, основанную на последних 
                научных исследованиях и многолетнем опыте специалистов.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-base text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-clean">
              <div className="text-center">
                <div className="inline-flex p-6 bg-primary/10 rounded-full mb-6">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Готовы присоединиться?
                </h3>
                <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                  Тысячи женщин во всём мире уже доверили своё здоровье 
                  и благополучие платформе BLOOM
                </p>
                <Link to="/register">
                 <Button className="w-full text-lg py-3 bg-primary text-primary-foreground font-medium rounded-xl btn-hover shadow-clean">
                    Присоединиться бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Начните заботу о себе уже сегодня
            </h2>
            <p className="text-lg text-white/90 mb-10 leading-relaxed">
              Не откладывайте заботу о своём здоровье и благополучии. 
              Присоединяйтесь к BLOOM и получите доступ к персонализированной 
              поддержке уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-3 font-medium rounded-xl btn-hover">
                  Создать аккаунт бесплатно
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg px-8 py-3 border-2 border-white/40 text-white hover:bg-white/10 font-medium rounded-xl btn-hover">
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
