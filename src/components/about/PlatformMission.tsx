import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Heart, Shield, Star } from 'lucide-react';
import caringIllustration from '@/assets/caring-support-illustration.jpg';

interface PlatformMissionProps {
  data: {
    title: string;
    description: string;
    heroImage?: string;
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string) => void;
}

export const PlatformMission: React.FC<PlatformMissionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-accent/5 to-muted/20 relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Левая часть - Иллюстрация */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="relative inline-block animate-fade-in">
                <div className="w-full max-w-md mx-auto relative">
                  {/* Аура вокруг иллюстрации */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/15 to-primary/10 rounded-3xl blur-2xl transform scale-110"></div>
                  
                  {/* Основная иллюстрация */}
                  <div className="relative bg-card rounded-3xl overflow-hidden shadow-elegant border border-primary/10">
                    <img 
                      src={caringIllustration}
                      alt="Заботливая поддержка"
                      className="w-full h-auto rounded-2xl"
                    />
                  </div>
                  
                  {/* Декоративные элементы */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - Контент */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              {/* Заголовок */}
              <AdminEditableSection
                title="Заголовок миссии"
                content={data.title}
                isEditing={isEditing}
                onUpdate={(value) => onUpdate('title', value)}
                placeholder="Заголовок миссии платформы"
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight animate-fade-in text-foreground"
              />
              
              {/* Описание */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <AdminEditableSection
                  title="Описание миссии"
                  content={data.description}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('description', value)}
                  placeholder="Описание миссии и ценностей платформы"
                  multiline
                  className="text-xl md:text-2xl leading-relaxed mb-12 text-muted-foreground"
                />
              </div>

              {/* Основная цитата */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-primary/20 shadow-elegant animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <Heart className="w-8 h-8 text-primary mr-3 animate-pulse" />
                  <Shield className="w-8 h-8 text-secondary animate-pulse" />
                </div>
                <p className="text-xl md:text-2xl font-medium italic text-foreground leading-relaxed">
                  "Мы верим, что каждая женщина заслуживает заботы, поддержки и индивидуального внимания — в любой момент жизни."
                </p>
              </div>

              {/* Microcopy */}
              <div className="text-center lg:text-left animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <p className="text-lg text-muted-foreground font-medium">
                  Ваш путь к спокойствию начинается здесь
                </p>
              </div>
            </div>
          </div>

          {/* Дополнительный блок миссии */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm rounded-3xl p-12 border border-primary/20 shadow-elegant max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mr-4">
                  <Heart className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-3xl font-bold text-foreground">Миссия платформы</h3>
              </div>
              
              <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground mb-6">
                Мы создаём пространство, где вам всегда рады — и где здоровье воспринимается с теплом и уважением.
              </p>
              
              {/* Три ключевых элемента */}
              <div className="grid md:grid-cols-3 gap-8 mt-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-current" style={{ display: 'block' }} />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Забота</h4>
                  <p className="text-muted-foreground">Каждое взаимодействие наполнено теплом</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white fill-current" style={{ display: 'block' }} />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Поддержка</h4>
                  <p className="text-muted-foreground">Вы никогда не остаётесь одна</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Star className="w-8 h-8 text-white fill-current" style={{ display: 'block' }} />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">Индивидуальность</h4>
                  <p className="text-muted-foreground">Решения специально для вас</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
