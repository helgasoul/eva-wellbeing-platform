import React from 'react';
import { Stethoscope, BookOpen, Lock, CheckCircle } from 'lucide-react';

const TrustIndicatorsSection: React.FC = () => {
  const trustFactors = [
    {
      title: "Медицинская команда",
      description: "Врачи-гинекологи с опытом 10+ лет",
      Icon: Stethoscope
    },
    {
      title: "Научная база",
      description: "Рекомендации основаны на международных протоколах",
      Icon: BookOpen
    },
    {
      title: "Безопасность данных",
      description: "Соответствие GDPR и 152-ФЗ",
      Icon: Lock
    },
    {
      title: "Качество проверки",
      description: "Каждый инсайт проверяется врачами",
      Icon: CheckCircle
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Доверие - основа здоровья
          </h2>
          <p className="text-xl text-muted-foreground">
            Медицинская экспертиза и научный подход
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFactors.map((factor, index) => {
            const IconComponent = factor.Icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{factor.title}</h3>
                <p className="text-muted-foreground">{factor.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-muted/50 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Гарантии качества
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center">
                <span className="text-success mr-2">✓</span>
                <span className="text-foreground">Возврат средств в течение 30 дней</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-success mr-2">✓</span>
                <span className="text-foreground">Лицензированные врачи</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-success mr-2">✓</span>
                <span className="text-foreground">Аккредитованные лаборатории</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicatorsSection;