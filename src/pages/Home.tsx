
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
      {/* Hero Section */}
      <section className="min-h-screen bg-hero-gradient relative overflow-hidden flex items-center">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-accent/20 blur-3xl animate-gentle-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-accent/15 to-secondary/20 blur-3xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-2/3 left-1/6 w-48 h-48 rounded-full bg-gradient-to-br from-secondary/20 to-primary/10 blur-2xl animate-gentle-float" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Enhanced Logo Section */}
            <div className="mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-bloom border border-primary/20 mb-8 animate-gentle-float">
                <img 
                  src="/lovable-uploads/7a0ec4e6-a4a7-4b76-b29d-c8ce93cce8c9.png" 
                  alt="BLOOM - Платформа поддержки женщин в период менопаузы" 
                  className="h-16 w-auto"
                />
                <div className="ml-4 flex items-center gap-1">
                  <Heart className="h-6 w-6 text-primary animate-soft-pulse" />
                  <Heart className="h-4 w-4 text-accent animate-soft-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full shadow-soft border border-primary/15">
                <div className="w-3 h-3 bg-primary rounded-full animate-soft-pulse"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  Основано на рекомендациях ВОЗ • Одобрено врачами
                </span>
                <div className="w-3 h-3 bg-accent rounded-full animate-soft-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-inter font-light text-foreground mb-6 leading-[1.1] tracking-tight">
                Мы поддерживаем{' '}
                <span className="font-bold text-gradient">
                  женщин
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-normal text-muted-foreground block mt-4">
                  во всём мире
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light">
                в заботе о своём здоровье, предоставляя персонализированные, 
                научно обоснованные рекомендации для поддержки в период менопаузы
              </p>
            </div>
            
            {/* Enhanced CTA Section */}
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link to="/register" className="group">
                  <Button 
                    size="xl" 
                    className="bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground px-12 py-6 rounded-2xl font-semibold text-xl transition-all duration-500 hover:scale-105 hover:shadow-bloom group-hover:shadow-2xl border-0 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Heart className="mr-3 h-6 w-6 transition-transform group-hover:scale-110 relative z-10" />
                    <span className="relative z-10">Начать заботу о себе</span>
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2 relative z-10" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-4 text-muted-foreground/60">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-muted-foreground/30"></div>
                  <span className="font-light">или</span>
                  <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-muted-foreground/30"></div>
                </div>
                
                <Link to="/about" className="group">
                  <Button 
                    variant="outline" 
                    size="xl"
                    className="border-2 border-primary/30 text-foreground hover:bg-white/80 hover:border-primary/50 px-10 py-6 rounded-2xl font-medium text-xl transition-all duration-300 hover:scale-105 bg-white/50 backdrop-blur-sm hover:shadow-gentle"
                  >
                    <Book className="mr-3 h-5 w-5" />
                    Узнать больше
                  </Button>
                </Link>
              </div>
              
              {/* Trust Statistics */}
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-gentle border border-primary/10 max-w-2xl mx-auto">
                <p className="text-lg font-medium text-foreground mb-6">
                  Уже доверились здоровью с BLOOM
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">15,000+</div>
                    <div className="text-sm text-muted-foreground">женщин</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">50+</div>
                    <div className="text-sm text-muted-foreground">стран</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">4.9/5</div>
                    <div className="text-sm text-muted-foreground">рейтинг</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Community Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-accent/30 to-background">
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

          <div className="relative overflow-hidden rounded-2xl shadow-bloom animate-fade-in group cursor-pointer bg-white">
            <img 
              src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
              alt="Глобальное сообщество женщин BLOOM — поддержка и взаимопонимание"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-xl font-playfair font-semibold mb-2">
                Тысячи женщин уже с нами
              </h3>
              <p className="text-base opacity-95">
                Присоединяйтесь к глобальному сообществу поддержки
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-background to-accent/20">
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
      <section className="py-20 px-6 bg-gradient-to-br from-accent/10 to-background">
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
      <section className="py-20 px-6 bg-gradient-to-r from-primary via-primary/95 to-primary">
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
