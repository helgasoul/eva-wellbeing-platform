
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/landing/HeroSection';
import ValuePropositionSection from '@/components/landing/ValuePropositionSection';
import UserPersonasSection from '@/components/landing/UserPersonasSection';
import TrustIndicatorsSection from '@/components/landing/TrustIndicatorsSection';

const Home = () => {
  const benefits = [
    {
      emoji: '💜',
      text: 'Советы, подобранные лично для вас',
      tooltip: 'Вы всегда можете спросить'
    },
    {
      emoji: '💬',
      text: 'Возможность поговорить с врачом в любое время',
      tooltip: 'Доступно бесплатно'
    },
    {
      emoji: '📚',
      text: 'Понятные и полезные материалы — когда удобно вам',
      tooltip: 'В вашем темпе'
    },
    {
      emoji: '🤗',
      text: 'Поддержка других женщин — делитесь и получайте тепло',
      tooltip: 'Вы не одна в этом'
    },
    {
      emoji: '🔒',
      text: 'Ваши данные всегда защищены',
      tooltip: 'Полная конфиденциальность'
    },
    {
      emoji: '🌙',
      text: 'Помогаем 24/7 — в любое время дня и ночи',
      tooltip: 'Всегда рядом'
    }
  ];

  return (
    <div className="bg-background">
      {/* Новая героическая секция */}
      <HeroSection />
      
      {/* Ценностное предложение */}
      <ValuePropositionSection />
      
      {/* Пользовательские персоны */}
      <UserPersonasSection />
      
      {/* Показатели доверия */}
      <TrustIndicatorsSection />

      {/* Empathetic Support Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
              Вы не одна: забота и помощь рядом
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              В BLOOM мы рядом с вами — чтобы поддержать, объяснить, выслушать и помочь подобрать лучшее для вас решение.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-white/50 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {benefit.emoji}
                  </div>
                  <div className="flex-1 relative">
                    <span className="text-lg text-foreground font-medium leading-relaxed">{benefit.text}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                      <span className="text-sm text-primary/80 italic">{benefit.tooltip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
              {/* Supportive illustration placeholder */}
              <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-rose-50/40 rounded-3xl p-12 mb-8 border border-purple-200/20 shadow-soft">
                <div className="inline-flex p-8 bg-gradient-to-br from-purple-100/60 to-pink-100/60 rounded-full mb-8 animate-gentle-float relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl scale-150 animate-pulse"></div>
                  <Heart className="h-16 w-16 text-primary relative z-10 animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                  Присоединяйтесь к кругу заботы
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
                  Вы не одна — вместе уже столько удивительных женщин
                </p>
                <Link to="/register">
                  <Button className="w-full text-lg py-4 bg-gradient-to-r from-purple-500/90 via-primary to-pink-500/85 text-white font-semibold rounded-3xl transition-all duration-300 shadow-elegant hover:shadow-glow hover:scale-105 group border border-primary/20 mb-4">
                    <Heart className="mr-3 h-5 w-5 group-hover:animate-pulse transition-all duration-300" />
                    Стать частью сообщества
                  </Button>
                </Link>
                
                <p className="text-sm text-muted-foreground/70 italic">
                  Можно начать в любое время. Выбор всегда за вами.
                </p>
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
