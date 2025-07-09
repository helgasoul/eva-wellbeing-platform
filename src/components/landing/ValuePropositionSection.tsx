import React from 'react';
import { Microscope, Target, Stethoscope, DollarSign } from 'lucide-react';

const ValuePropositionSection: React.FC = () => {
  const benefits = [
    {
      Icon: Microscope,
      title: "Превентивная медицина",
      description: "Предотвращение заболеваний, а не лечение симптомов",
      feature: "Комплексное тестирование 100+ биомаркеров"
    },
    {
      Icon: Target,
      title: "Персонализированный подход",
      description: "Индивидуальные рекомендации на основе ваших данных",
      feature: "Учет семейной истории и образа жизни"
    },
    {
      Icon: Stethoscope,
      title: "Медицинская экспертиза",
      description: "Рекомендации создают врачи-гинекологи",
      feature: "Специализация на менопаузе"
    },
    {
      Icon: DollarSign,
      title: "Доступная цена",
      description: "Демократизация премиальной медицины",
      feature: "В 5 раз дешевле частных клиник"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Почему Bloom меняет подход к женскому здоровью
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Мы объединили лучшие практики превентивной медицины с современными технологиями
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.Icon;
            return (
              <div 
                key={index} 
                className="text-center group hover:bg-muted/50 p-6 rounded-xl transition-all duration-300 hover:shadow-soft"
              >
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground mb-4">{benefit.description}</p>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {benefit.feature}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionSection;