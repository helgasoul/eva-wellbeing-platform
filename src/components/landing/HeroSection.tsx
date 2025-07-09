import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary-foreground/10 blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-primary-foreground/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-primary-foreground/15 blur-2xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Иконка */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-4 bg-primary-foreground/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Добавьте годы к жизни
            <br />
            <span className="bg-gradient-to-r from-warning to-warning/80 bg-clip-text text-transparent">
              и жизнь к годам
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Первая проактивная платформа для женского здоровья в период менопаузы
          </p>
          
          <div className="glass-effect rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl font-medium text-primary-foreground">
              Получите информацию о возможных рисках и их предотвращении раньше
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Link to="/register">
              <Button 
                size="lg" 
                className="btn-primary-enhanced text-primary-foreground px-10 py-5 rounded-2xl font-semibold text-lg group"
              >
                <Heart className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                Начать бесплатно
              </Button>
            </Link>
            
            <p className="text-primary-foreground/80 max-w-sm">
              То, что могло бы стоить ₽50,000 в частных клиниках, стоит всего ₽9,990
            </p>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-foreground/10 border border-primary-foreground/20 rounded-full text-sm font-medium">
            <Shield className="h-5 w-5 text-primary-foreground" />
            <span className="text-primary-foreground font-semibold">Основано на рекомендациях ВОЗ • Одобрено врачами</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;