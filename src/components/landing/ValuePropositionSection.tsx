import React from 'react';
import { Heart, Users, Sparkles } from 'lucide-react';

const ValuePropositionSection: React.FC = () => {
  const benefits = [
    {
      Icon: Heart,
      title: "Забота",
      description: "Каждое взаимодействие наполнено теплом"
    },
    {
      Icon: Users,
      title: "Поддержка",
      description: "Вы никогда не остаётесь одна"
    },
    {
      Icon: Sparkles,
      title: "Индивидуальность",
      description: "Решения специально для вас"
    }
  ];

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Мы создаём пространство, где вам всегда рады — и где здоровье воспринимается с теплом и уважением.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.Icon;
            return (
              <div 
                key={index} 
                className="text-center group p-6 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-6 bg-primary rounded-full mb-6 shadow-lg">
                  <IconComponent className="h-8 w-8 text-primary-foreground" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        {/* Закрывающее послание */}
        <div className="bg-gradient-to-r from-accent/20 via-background to-muted/30 rounded-3xl p-8 border border-border/30 shadow-clean">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              С заботой о вашем будущем, команда без | паузы
            </p>
            <p className="text-muted-foreground text-sm">
              Если возникнут вопросы — мы всегда рядом, чтобы поддержать
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;