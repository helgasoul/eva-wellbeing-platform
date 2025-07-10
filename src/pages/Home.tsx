
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import ValuePropositionSection from '@/components/landing/ValuePropositionSection';
import UserPersonasSection from '@/components/landing/UserPersonasSection';
import TrustIndicatorsSection from '@/components/landing/TrustIndicatorsSection';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { OnboardingDemo } from '@/components/demo/OnboardingDemo';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ НОВОЕ: Проверка статуса онбординга при входе на главную страницу
  useEffect(() => {
    if (user && user.role === UserRole.PATIENT) {
      if (user.onboardingCompleted) {
        console.log('🔄 Redirecting authenticated user with completed onboarding to dashboard');
        navigate('/patient/dashboard');
      } else {
        console.log('🔄 Redirecting authenticated user without completed onboarding to onboarding');
        navigate('/patient/onboarding');
      }
    }
  }, [user, navigate]);

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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="bg-background flex-1">
      {/* Новая героическая секция */}
      <HeroSection />
      
      {/* Ценностное предложение */}
      <ValuePropositionSection />
      
      {/* Пользовательские персоны */}
      <UserPersonasSection />
      
      {/* Показатели доверия */}
      <TrustIndicatorsSection />

      {/* Демонстрация онбординга - только для администраторов */}
      {user?.role === UserRole.ADMIN && (
        <section className="py-16 px-6 bg-slate-50">
          <div className="container mx-auto">
            <OnboardingDemo />
          </div>
        </section>
      )}

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

      {/* Gentle CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-100/60 via-pink-100/40 to-rose-100/30 relative overflow-hidden">
        {/* Gentle gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 via-pink-200/20 to-purple-200/20 animate-pulse opacity-50"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6 animate-fade-in">
              <Heart className="h-8 w-8 text-primary mr-4 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Ваш путь к заботе начинается 
                <span className="text-primary ml-2">здесь</span>
              </h2>
            </div>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Здесь вы найдёте поддержку и внимание — просто попробуйте, когда будете готовы.
            </p>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-500/90 via-primary to-pink-500/85 text-white hover:shadow-glow text-xl px-12 py-6 font-semibold rounded-3xl transition-all duration-300 hover:scale-105 group border border-primary/20 mb-4">
                  <Heart className="mr-3 h-6 w-6 group-hover:animate-pulse transition-all duration-300" />
                  Присоединиться с заботой
                </Button>
              </Link>
              
              <p className="text-sm text-muted-foreground/70 italic mt-4 max-w-md mx-auto">
                Вы всегда в безопасности. Можно уйти в любой момент.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
