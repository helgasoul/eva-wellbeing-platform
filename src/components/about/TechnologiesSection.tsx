import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Code, Database, Shield, Smartphone, Bot, Cloud } from 'lucide-react';

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
  const techIcons = [Code, Database, Shield, Smartphone, Bot, Cloud];

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
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <AdminEditableSection
            title="Заголовок технологий"
            content={data.title}
            isEditing={isEditing}
            onUpdate={(value) => onUpdate('title', value)}
            placeholder="Заголовок раздела технологий"
            className="text-4xl font-bold text-white mb-4"
          />
          
          <AdminEditableSection
            title="Описание технологий"
            content={data.description}
            isEditing={isEditing}
            onUpdate={(value) => onUpdate('description', value)}
            placeholder="Описание технологического подхода"
            multiline
            className="text-xl text-white/90 max-w-3xl mx-auto"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features.map((feature, index) => {
            const Icon = techIcons[index % techIcons.length];
            return (
              <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <AdminEditableSection
                          title={`Технология ${index + 1}`}
                          content={feature}
                          isEditing={isEditing}
                          onUpdate={(value) => updateFeature(index, value)}
                          placeholder="Название технологии"
                          className="text-white font-medium"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-white font-medium">{feature}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isEditing && (
            <div 
              onClick={addFeature}
              className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 transition-colors cursor-pointer flex items-center justify-center min-h-[120px]"
            >
              <div className="text-center text-white/70">
                <div className="text-2xl mb-2">+</div>
                <p>Добавить технологию</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};