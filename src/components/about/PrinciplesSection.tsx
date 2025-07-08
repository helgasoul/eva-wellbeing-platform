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
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      key: 'personalization',
      data: data.personalization,
      icon: User,
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      key: 'empathy',
      data: data.empathy,
      icon: Heart,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      key: 'security',
      data: data.security,
      icon: Shield,
      gradient: 'from-green-500 to-teal-600'
    }
  ];

  return (
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Наши принципы</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Четыре основополагающих принципа, которые определяют подход bloom к заботе о женском здоровье
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.key}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/30 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${principle.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <AdminEditableSection
                  title={`Принцип: ${principle.key}`}
                  content={principle.data.title}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate(`${principle.key}.title`, value)}
                  placeholder="Название принципа"
                  className="text-xl font-bold text-foreground mb-3"
                />

                <AdminEditableSection
                  title={`Описание: ${principle.key}`}
                  content={principle.data.description}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate(`${principle.key}.description`, value)}
                  placeholder="Описание принципа"
                  multiline
                  className="text-muted-foreground leading-relaxed"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};