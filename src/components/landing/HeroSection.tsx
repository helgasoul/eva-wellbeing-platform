import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/5 to-muted/20 py-20">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Иконка */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full shadow-elegant animate-gentle-float">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground animate-fade-in">
            Больше жизни в
            <br />
            <span className="text-primary bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              каждом этапе
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Поддержка, знания и забота для женщин в период перемен — всё для вашего комфорта, уверенности и новых открытий
          </p>

          {/* Изображение женщин с мягкой аурой */}
          <div className="relative max-w-2xl mx-auto mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 rounded-3xl blur-2xl transform scale-110"></div>
            <div className="relative bg-card rounded-3xl overflow-hidden shadow-elegant border border-primary/10">
              <img 
                src="/lovable-uploads/fe3895a3-05ff-4913-93b4-996d4825fe84.png" 
                alt="Группа улыбающихся женщин разных возрастов — поддержка и радость вместе"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          {/* Эмпатичная цитата */}
          <div className="mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <p className="text-lg italic text-muted-foreground/90 leading-relaxed">
              "Меняться — это нормально. Главное — быть в гармонии с собой."
            </p>
          </div>
          
          <div className="flex flex-col gap-6 justify-center items-center mb-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Link to="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary/90 via-primary to-primary/85 text-primary-foreground px-12 py-6 rounded-3xl font-semibold text-lg shadow-elegant hover:shadow-soft hover:scale-105 transition-all duration-300 group border border-primary/20"
              >
                <Heart className="mr-3 h-6 w-6 group-hover:animate-pulse transition-all duration-300" />
                Узнать, как заботиться о себе сегодня
              </Button>
            </Link>
            
            <div className="bg-gradient-to-r from-accent/20 via-background to-muted/30 rounded-2xl px-6 py-3 border border-border/30">
              <p className="text-muted-foreground text-sm">
                Качественная забота без переплат • Доступно каждой женщине
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full text-sm font-medium shadow-clean animate-fade-in" style={{ animationDelay: '1s' }}>
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold">Научные данные • Экспертная поддержка • Ваша безопасность</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;