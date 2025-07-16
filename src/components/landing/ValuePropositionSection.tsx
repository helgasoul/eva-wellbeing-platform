import React from 'react';
import { Microscope, Target, Stethoscope, DollarSign } from 'lucide-react';

const ValuePropositionSection: React.FC = () => {
  const benefits = [
    {
      Icon: Microscope,
      title: "Профилактика с заботой",
      description: "Помогаем вам заранее позаботиться о здоровье, чтобы больше времени оставалось на жизнь",
      feature: "Комплексное тестирование 100+ биомаркеров",
      subtitle: "Для нас ваше спокойствие — главное"
    },
    {
      Icon: Target,
      title: "Индивидуальный подход",
      description: "Ваша история и образ жизни уникальны — и наши советы тоже",
      feature: "Учет семейной истории и образа жизни",
      subtitle: "Всё внимание — к вашей истории и потребностям"
    },
    {
      Icon: Stethoscope,
      title: "Опытные специалисты",
      description: "Команда специалистов, которые понимают женские особенности менопаузы и поддерживают вас",
      feature: "Специализация на менопаузе",
      subtitle: "Понимаем менопаузу, поддерживаем без осуждения"
    },
    {
      Icon: DollarSign,
      title: "Доступность для всех",
      description: "Делаем заботу о здоровье возможной для каждой",
      feature: "В 5 раз дешевле частных клиник",
      subtitle: "Качественная забота не должна быть роскошью"
    }
  ];

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-6 leading-tight">
            Почему с без | паузы забота о себе становится проще
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Здесь сочетаются забота, наука и технологии — ради вашего комфорта и уверенности
          </p>
          <p className="text-base text-muted-foreground italic">
            "Всё, чтобы вы чувствовали себя спокойно, уверенно и поддержано"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.Icon;
            return (
              <div 
                key={index} 
                className="text-center group hover:bg-gradient-to-br hover:from-muted/60 hover:to-accent/30 p-6 rounded-3xl transition-all duration-300 hover:shadow-elegant hover:scale-105 animate-fade-in border border-border/30"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-6 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 animate-gentle-float">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{benefit.description}</p>
                <div className="bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-3 border border-primary/20">
                  {benefit.feature}
                </div>
                <p className="text-xs text-muted-foreground italic opacity-80">
                  {benefit.subtitle}
                </p>
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