import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Brain, Dna, Shield, Microscope, Smartphone, Video, Heart } from 'lucide-react';

interface TechnologiesSectionProps {
  data: {
    title: string;
    description: string;
    features: string[];
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string | string[]) => void;
}

export const TechnologiesSection: React.FC<TechnologiesSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  const techData = [
    { icon: Brain, gradient: 'from-purple-400/80 to-indigo-500/80', bgColor: 'bg-purple-50/80', glowColor: 'hover:shadow-purple-200/40' },
    { icon: Dna, gradient: 'from-blue-400/80 to-cyan-500/80', bgColor: 'bg-blue-50/80', glowColor: 'hover:shadow-blue-200/40' },
    { icon: Shield, gradient: 'from-green-400/80 to-teal-500/80', bgColor: 'bg-green-50/80', glowColor: 'hover:shadow-green-200/40' },
    { icon: Microscope, gradient: 'from-pink-400/80 to-rose-500/80', bgColor: 'bg-pink-50/80', glowColor: 'hover:shadow-pink-200/40' },
    { icon: Smartphone, gradient: 'from-amber-400/80 to-orange-500/80', bgColor: 'bg-amber-50/80', glowColor: 'hover:shadow-amber-200/40' },
    { icon: Video, gradient: 'from-violet-400/80 to-purple-500/80', bgColor: 'bg-violet-50/80', glowColor: 'hover:shadow-violet-200/40' }
  ];

  const updateFeatures = (features: string[]) => {
    onUpdate('features', features);
  };

  const addFeature = () => {
    const newFeatures = [...data.features, ''];
    updateFeatures(newFeatures);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = value;
    updateFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = data.features.filter((_, i) => i !== index);
    updateFeatures(newFeatures);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-blue-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <AdminEditableSection
            title="Заголовок технологий"
            content={data.title}
            isEditing={isEditing}
            onUpdate={(value) => onUpdate('title', value)}
            placeholder="Заголовок раздела технологий"
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight animate-fade-in text-[#53415B]"
          />
          
          <AdminEditableSection
            title="Описание технологий"
            content={data.description}
            isEditing={isEditing}
            onUpdate={(value) => onUpdate('description', value)}
            placeholder="Описание технологического подхода"
            multiline
            className="text-xl max-w-4xl mx-auto leading-relaxed animate-fade-in text-[#A97FB2]"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.features.map((feature, index) => {
            const tech = techData[index % techData.length];
            const Icon = tech.icon;
            return (
              <div 
                key={index} 
                className={`group ${tech.bgColor} backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl ${tech.glowColor} transition-all duration-500 hover:scale-105 animate-fade-in border border-white/30`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${tech.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <Icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex items-center space-x-2 justify-center">
                      <AdminEditableSection
                        title={`Технология ${index + 1}`}
                        content={feature}
                        isEditing={isEditing}
                        onUpdate={(value) => updateFeature(index, value)}
                        placeholder="Название технологии"
                        className="text-lg font-semibold text-[#53415B] text-center"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="text-red-400 hover:text-red-300 text-sm ml-2"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-300 text-[#53415B]">
                      {feature}
                    </h3>
                  )}
                  
                  {/* Микрокопи при ховере */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
                    <p className="text-sm text-[#A97FB2] italic">
                      {index === 0 && "Персональные советы с помощью ИИ"}
                      {index === 1 && "Рекомендации на основе ваших индивидуальных данных"}
                      {index === 2 && "Доступ только у вас и у вашего врача"}
                      {index === 3 && "Без очередей, с быстрыми результатами"}
                      {index === 4 && "Интеграция с трекерами для вашего удобства"}
                      {index === 5 && "Консультации онлайн в удобное для вас время"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {isEditing && (
            <div 
              onClick={addFeature}
              className="bg-white/20 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-300/40 hover:border-purple-400/60 transition-colors cursor-pointer flex items-center justify-center min-h-[280px] group"
            >
              <div className="text-center text-[#A97FB2] group-hover:text-[#53415B] transition-colors">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">+</div>
                <p className="font-medium">Добавить технологию</p>
              </div>
            </div>
          )}
        </div>

        {/* Закрывающее послание */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/20 shadow-lg">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium italic text-[#53415B]">
              Всё только для вашего спокойствия и контроля
            </p>
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};