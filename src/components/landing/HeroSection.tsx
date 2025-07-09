import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-background py-20">
      {/* Декоративные элементы - убираем для чистого белого фона */}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Иконка */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-foreground">
            Добавьте годы к жизни
            <br />
            <span className="text-primary">
              и жизнь к годам
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Первая проактивная платформа для женского здоровья в период менопаузы
          </p>

          {/* Изображение женщин */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-soft max-w-2xl mx-auto mb-8">
            <img 
              src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
              alt="Глобальное сообщество женщин BLOOM — поддержка и взаимопонимание"
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <p className="text-lg md:text-xl font-medium text-foreground">
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
            
            <p className="text-muted-foreground max-w-sm">
              То, что могло бы стоить ₽50,000 в частных клиниках, стоит всего ₽9,990
            </p>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-muted/30 border border-border rounded-full text-sm font-medium">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Основано на рекомендациях ВОЗ • Одобрено врачами</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;