
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: 'Персональная поддержка',
      description: 'Индивидуальный подход к каждой женщине с учетом особенностей периода менопаузы'
    },
    {
      icon: Users,
      title: 'Сообщество единомышленников',
      description: 'Общение с женщинами, проходящими через аналогичные изменения'
    },
    {
      icon: Shield,
      title: 'Медицинская экспертиза',
      description: 'Консультации квалифицированных врачей и специалистов'
    }
  ];

  const benefits = [
    'Комплексный подход к здоровью женщины',
    'Онлайн-консультации с врачами',
    'Образовательные материалы и ресурсы',
    'Персональные рекомендации',
    'Конфиденциальность и безопасность',
    'Поддержка 24/7'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="eva-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-foreground mb-6">
              Заботимся о вашем здоровье в период{' '}
              <span className="text-primary">менопаузы</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Eva — это современная платформа поддержки женщин, которая поможет 
              вам пройти через изменения в организме с уверенностью и заботой о себе.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="eva-button text-lg px-8 py-4">
                  Начать заботу о себе
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="text-lg px-8 py-4 border-2 border-primary/30 hover:bg-primary/5">
                  Узнать больше
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Image Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-eva-gradient to-eva-pearl">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl animate-fade-in">
              <img 
                src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
                alt="Сообщество женщин Eva - поддержка и взаимопонимание"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>
            </div>
            <div className="mt-8">
              <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-foreground mb-4">
                Вы не одни в этом пути
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Присоединяйтесь к тысячам женщин, которые поддерживают друг друга 
                и делятся опытом на пути к здоровью и благополучию
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-eva-warm">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
              Почему выбирают Eva?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Мы создали платформу, которая объединяет медицинскую экспертизу, 
              технологии и человеческое понимание
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="eva-card p-8 text-center group hover:shadow-xl transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="inline-flex p-4 bg-gradient-to-br from-eva-dusty-rose to-primary rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-6">
                Комплексная поддержка для каждой женщины
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Период менопаузы — это естественный этап в жизни женщины, который 
                не должен пугать. С Eva вы получите всю необходимую поддержку и 
                информацию для комфортного перехода.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="eva-card p-8">
              <div className="text-center">
                <div className="inline-flex p-6 bg-gradient-to-br from-eva-soft-pink to-eva-warm-beige rounded-full mb-6">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-foreground mb-4">
                  Готовы начать?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Присоединяйтесь к тысячам женщин, которые уже доверили 
                  свое здоровье платформе Eva
                </p>
                <Link to="/register">
                  <Button className="eva-button w-full">
                    Зарегистрироваться бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="eva-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-6">
              Начните заботу о себе уже сегодня
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Не откладывайте заботу о своем здоровье. Присоединяйтесь к Eva 
              и получите доступ к профессиональной поддержке
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button className="eva-button text-lg px-8 py-4">
                  Создать аккаунт
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg px-8 py-4 border-2 border-primary/30 hover:bg-primary/5">
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
