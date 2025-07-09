import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Microscope, User, Heart, Shield } from 'lucide-react';

interface PrinciplesSectionProps {
  data: {
    scientific: {
      title: string;
      description: string;
      icon?: string;
    };
    personalization: {
      title: string;
      description: string;
      icon?: string;
    };
    empathy: {
      title: string;
      description: string;
      icon?: string;
    };
    security: {
      title: string;
      description: string;
      icon?: string;
    };
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string) => void;
}

export const PrinciplesSection: React.FC<PrinciplesSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  const principles = [
    {
      key: 'scientific',
      data: data.scientific,
      icon: Microscope,
      gradient: 'from-blue-400/80 to-purple-500/80',
      bgColor: 'bg-blue-50/80',
      glowColor: 'hover:shadow-blue-200/40'
    },
    {
      key: 'personalization',
      data: data.personalization,
      icon: User,
      gradient: 'from-purple-400/80 to-pink-500/80',
      bgColor: 'bg-purple-50/80',
      glowColor: 'hover:shadow-purple-200/40'
    },
    {
      key: 'empathy',
      data: data.empathy,
      icon: Heart,
      gradient: 'from-pink-400/80 to-rose-500/80',
      bgColor: 'bg-pink-50/80',
      glowColor: 'hover:shadow-pink-200/40'
    },
    {
      key: 'security',
      data: data.security,
      icon: Shield,
      gradient: 'from-green-400/80 to-teal-500/80',
      bgColor: 'bg-green-50/80',
      glowColor: 'hover:shadow-green-200/40'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Мягкие декоративные элементы в углах */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <p className="text-lg text-primary/80 font-medium mb-4 italic animate-fade-in">
            Всё ради вашего спокойствия и уверенности
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in text-[#53415B]">
            Наши принципы заботы
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in text-[#A97FB2]" style={{ animationDelay: '0.2s' }}>
            Четыре основы, на которых строится наша забота о вас
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.key}
                className={`group ${principle.bgColor} backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl ${principle.glowColor} transition-all duration-500 hover:scale-105 animate-fade-in border border-white/30`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Иконка с анимацией */}
                <div className={`w-20 h-20 bg-gradient-to-br ${principle.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <Icon className={`w-10 h-10 text-white ${principle.key === 'empathy' ? 'animate-pulse' : ''} group-hover:scale-110 transition-transform duration-300`} />
                </div>

                <AdminEditableSection
                  title={`Принцип: ${principle.key}`}
                  content={principle.data.title}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate(`${principle.key}.title`, value)}
                  placeholder="Название принципа"
                  className="text-lg font-semibold mb-4 leading-tight group-hover:text-primary transition-colors duration-300 text-[#53415B]"
                />

                <AdminEditableSection
                  title={`Описание: ${principle.key}`}
                  content={principle.data.description}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate(`${principle.key}.description`, value)}
                  placeholder="Описание принципа"
                  multiline
                  className="text-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-300 text-[#A97FB2]"
                />
              </div>
            );
          })}
        </div>

        {/* Закрывающее послание */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium italic text-[#53415B]">
              С заботой о вашем будущем, команда bloom
            </p>
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};