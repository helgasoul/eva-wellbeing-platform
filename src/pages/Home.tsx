
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
    <div className="min-h-screen bg-gradient-to-br from-bloom-pearl via-bloom-vanilla to-bloom-warm-cream">
      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="inline-flex p-6 bg-gradient-to-br from-bloom-blush/20 to-bloom-soft-peach/30 rounded-full mb-8 animate-gentle-float backdrop-blur-sm">
              <Heart className="h-16 w-16 text-bloom-golden" />
            </div>
            
            {/* Empathetic main message */}
            <h1 className="text-5xl md:text-7xl font-playfair font-bold text-bloom-warm-brown mb-8 leading-tight">
              Мы поддерживаем женщин{' '}
              <span className="text-bloom-golden bg-gradient-to-r from-bloom-golden to-bloom-caramel bg-clip-text text-transparent">
                во всём мире
              </span>
            </h1>
            
            <div className="text-2xl md:text-3xl text-bloom-taupe mb-10 leading-relaxed max-w-4xl mx-auto font-medium">
              в заботе о своём здоровье, предоставляя персонализированные, 
              научно обоснованные рекомендации для поддержки женщин в период менопаузы
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link to="/register">
                <Button className="text-xl px-10 py-6 bg-bloom-golden hover:bg-bloom-caramel text-white font-semibold rounded-full shadow-cozy hover:shadow-warm transition-all duration-300 hover:scale-105">
                  Начать заботу о себе
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="text-xl px-10 py-6 border-2 border-bloom-golden/40 text-bloom-warm-brown hover:bg-bloom-golden/10 font-semibold rounded-full transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm">
                  Узнать больше о платформе
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust and Community Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-bloom-vanilla to-bloom-cream">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-bloom-warm-brown mb-8">
              Вы не одни в этом важном жизненном периоде
            </h2>
            <p className="text-xl text-bloom-taupe leading-relaxed max-w-3xl mx-auto">
              Период менопаузы — это естественная и важная часть жизни каждой женщины. 
              Мы здесь, чтобы поддержать вас на этом пути с пониманием, заботой и профессиональной помощью.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl shadow-cozy animate-fade-in group cursor-pointer">
            <img 
              src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
              alt="Глобальное сообщество женщин bloom — поддержка и взаимопонимание"
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bloom-golden/20 via-transparent to-transparent"></div>
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
      <section className="py-24 px-6 bg-bloom-pearl">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-bloom-warm-brown mb-6">
              Почему женщины выбирают bloom?
            </h2>
            <p className="text-xl text-bloom-taupe max-w-3xl mx-auto leading-relaxed">
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
                  className="bg-white/90 backdrop-blur-sm p-10 text-center group hover:scale-105 transition-all duration-300 rounded-2xl shadow-gentle hover:shadow-warm cursor-pointer"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex p-6 bg-gradient-to-br from-bloom-golden to-bloom-caramel rounded-full mb-8 group-hover:scale-110 transition-transform duration-300 animate-warm-pulse">
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-playfair font-semibold text-bloom-warm-brown mb-6">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-bloom-taupe leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-bloom-warm-cream to-bloom-vanilla">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-slide-in">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-bloom-warm-brown mb-8">
                Комплексная поддержка на каждом этапе
              </h2>
              <p className="text-xl text-bloom-taupe mb-10 leading-relaxed">
                Каждая женщина уникальна, и её путь через менопаузу тоже особенный. 
                С bloom вы получите индивидуальную поддержку, основанную на последних 
                научных исследованиях и многолетнем опыте специалистов.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/50 transition-all duration-200">
                    <CheckCircle className="h-6 w-6 text-bloom-golden flex-shrink-0" />
                    <span className="text-lg text-bloom-taupe">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-12 rounded-2xl shadow-cozy hover:shadow-warm transition-all duration-300 hover:scale-105">
              <div className="text-center">
                <div className="inline-flex p-8 bg-gradient-to-br from-bloom-soft-peach to-bloom-blush rounded-full mb-8 animate-gentle-float">
                  <Heart className="h-16 w-16 text-bloom-golden" />
                </div>
                <h3 className="text-3xl font-playfair font-semibold text-bloom-warm-brown mb-6">
                  Готовы присоединиться?
                </h3>
                <p className="text-lg text-bloom-taupe mb-8 leading-relaxed">
                  Тысячи женщин во всём мире уже доверили своё здоровье 
                  и благополучие платформе bloom
                </p>
                <Link to="/register">
                  <Button className="w-full text-xl py-4 bg-bloom-golden hover:bg-bloom-caramel text-white font-semibold rounded-full transition-all duration-300 hover:scale-105">
                    Присоединиться бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-bloom-golden via-bloom-caramel to-bloom-golden">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-8">
              Начните заботу о себе уже сегодня
            </h2>
            <p className="text-xl text-white/95 mb-12 leading-relaxed">
              Не откладывайте заботу о своём здоровье и благополучии. 
              Присоединяйтесь к bloom и получите доступ к персонализированной 
              поддержке уже сегодня
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button className="bg-white text-bloom-golden hover:bg-white/90 text-xl px-10 py-6 font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-cozy">
                  Создать аккаунт бесплатно
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-xl px-10 py-6 border-2 border-white/40 text-white hover:bg-white/10 font-semibold rounded-full transition-all duration-300 hover:scale-105">
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
