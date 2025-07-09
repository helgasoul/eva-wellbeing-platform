import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Flame, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import beginningChangesImage from '@/assets/beginning-changes-card.jpg';
import activePhaseImage from '@/assets/active-phase-card.jpg';
import afterTransitionImage from '@/assets/after-transition-card.jpg';

const UserPersonasSection: React.FC = () => {
  const navigate = useNavigate();

  const handlePersonaClick = (planId: string) => {
    navigate(`/how-we-help#${planId}`);
  };

  const personas = [
    {
      title: "Начало перемен",
      subtitle: "Замечаете изменения в цикле?",
      description: "Почувствуйте уверенность на этом этапе",
      Icon: Sprout,
      colorClass: "from-success/80 to-success",
      features: ["Мягкий трекинг ощущений и симптомов", "Пошаговые полезные материалы", "Поддерживающее сообщество"],
      ctaText: "Узнать больше"
    },
    {
      title: "Активная фаза",
      subtitle: "Приливы или другие ощущения мешают вашему комфорту?",
      description: "Вместе найдём решения, подходящие именно вам",
      Icon: Flame,
      colorClass: "from-warning/80 to-warning",
      features: ["Современные биомаркеры", "Индивидуальные консультации", "Персональные рекомендации и планы"],
      ctaText: "Посмотреть решения"
    },
    {
      title: "После перемен",
      subtitle: "Поддержите здоровье и качество жизни в новом этапе",
      description: "Ваша забота о себе — в приоритете",
      Icon: Gem,
      colorClass: "from-primary/80 to-primary",
      features: ["Генетические тесты для профилактики", "Программы осознанного долголетия", "Персональный подход и поддержка"],
      ctaText: "Долгосрочные рекомендации"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Найдите свой путь к здоровью
          </h2>
          <p className="text-xl text-muted-foreground">
            Каждая фаза менопаузы требует особого подхода
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {personas.map((persona, index) => {
            const IconComponent = persona.Icon;
            return (
              <div key={index} className="bg-card rounded-xl shadow-clean overflow-hidden hover:shadow-soft transition-all duration-300 animate-fade-in">
                {index === 0 ? (
                  // Специальный дизайн для первой карточки с изображением
                  <div>
                    <div className="p-6 bg-gradient-to-r from-success/10 to-success/20">
                      <div className="flex items-center mb-4">
                        <div className="inline-flex p-2 bg-success rounded-full mr-3">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{persona.title}</h3>
                          <p className="text-muted-foreground">{persona.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    <img 
                      src={beginningChangesImage} 
                      alt="Поддержка для женщин на старте перемен"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : index === 1 ? (
                  // Специальный дизайн для второй карточки с изображением
                  <div>
                    <div className="p-6 bg-gradient-to-r from-warning/10 to-warning/20">
                      <div className="flex items-center mb-4">
                        <div className="inline-flex p-2 bg-warning rounded-full mr-3">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{persona.title}</h3>
                          <p className="text-muted-foreground">{persona.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    <img 
                      src={activePhaseImage} 
                      alt="Поддержка и решения для женщин в активной фазе перемен"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : index === 2 ? (
                  // Специальный дизайн для третьей карточки с изображением
                  <div>
                    <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/20">
                      <div className="flex items-center mb-4">
                        <div className="inline-flex p-2 bg-primary rounded-full mr-3">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{persona.title}</h3>
                          <p className="text-muted-foreground">{persona.subtitle}</p>
                        </div>
                      </div>
                    </div>
                    <img 
                      src={afterTransitionImage} 
                      alt="Поддержка и забота для женщин после менопаузы"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : (
                  <div className={`bg-gradient-to-br ${persona.colorClass} p-6 text-white`}>
                    <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{persona.title}</h3>
                    <p className="text-lg opacity-90">{persona.subtitle}</p>
                  </div>
                )}
                
                <div className="p-6">
                  <p className="text-muted-foreground mb-6">{persona.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {persona.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <span className="text-success mr-2">✓</span>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handlePersonaClick(index === 0 ? 'essential' : index === 1 ? 'plus' : 'optimum')}
                    className={`w-full bg-gradient-to-r ${persona.colorClass} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity`}
                  >
                    {index === 0 ? 'Выбрать план Essential' : index === 1 ? 'Выбрать план Plus' : 'Выбрать план Optimum'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UserPersonasSection;