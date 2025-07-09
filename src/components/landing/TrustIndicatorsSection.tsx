import React from 'react';
import { Heart, Users, Shield, UserCheck } from 'lucide-react';

const TrustIndicatorsSection: React.FC = () => {
  const trustFactors = [
    {
      title: "Опытные женщины-врачи рядом с вами",
      description: "Наши специалисты заботятся о вас на каждом этапе",
      Icon: Users
    },
    {
      title: "Современные знания — для вашего спокойствия",
      description: "Мы используем только научно доказанные подходы",
      Icon: Heart
    },
    {
      title: "Ваши данные под надёжной защитой",
      description: "Строгое соблюдение конфиденциальности и стандартов безопасности",
      Icon: Shield
    },
    {
      title: "Каждый совет — под контролем экспертов",
      description: "Все рекомендации проверяются нашими специалистами",
      Icon: UserCheck
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Доверие. Забота. <br />
            <span className="text-primary">Ваше здоровье — в надёжных руках</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Мы объединяем внимание к деталям и мировую медицину
          </p>
          <p className="text-base text-muted-foreground italic">
            "Нам важна ваша уверенность — именно поэтому мы делаем всё, чтобы вы чувствовали себя защищённо."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFactors.map((factor, index) => {
            const IconComponent = factor.Icon;
            return (
              <div 
                key={index} 
                className="bg-card rounded-3xl p-6 text-center shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105 animate-fade-in border border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-6 animate-gentle-float">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight">{factor.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{factor.description}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-success/10 via-background to-primary/10 rounded-3xl p-8 border border-border/30 shadow-clean">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-success/20 rounded-full mb-4">
              <Heart className="h-6 w-6 text-success animate-pulse" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              Наши специалисты всегда на связи
            </p>
            <p className="text-muted-foreground text-sm">
              Постоянная поддержка и забота о вашем здоровье
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicatorsSection;