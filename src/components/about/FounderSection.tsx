import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { AdminImageUpload } from './AdminImageUpload';

interface FounderSectionProps {
  data: {
    name: string;
    story: string;
    experience: string;
    vision: string;
    photo?: string;
    bio: string;
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string) => void;
}

export const FounderSection: React.FC<FounderSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  return (
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">О создателе</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="text-center">
            <AdminImageUpload
              currentImage={data.photo}
              isEditing={isEditing}
              onImageUpdate={(imageUrl) => onUpdate('photo', imageUrl)}
              alt={data.name}
              className="w-48 h-48 rounded-full object-cover mx-auto mb-6 shadow-lg"
            />
            
            <AdminEditableSection
              title="Имя основателя"
              content={data.name}
              isEditing={isEditing}
              onUpdate={(value) => onUpdate('name', value)}
              placeholder="Имя и фамилия основателя"
              className="text-2xl font-bold text-white mb-4"
            />
            
            <AdminEditableSection
              title="Краткое описание"
              content={data.bio}
              isEditing={isEditing}
              onUpdate={(value) => onUpdate('bio', value)}
              placeholder="Краткое описание основателя"
              className="text-lg text-white/90"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">История создания</h3>
              <AdminEditableSection
                title="История"
                content={data.story}
                isEditing={isEditing}
                onUpdate={(value) => onUpdate('story', value)}
                placeholder="История создания платформы"
                multiline
                className="text-white/90 leading-relaxed"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Опыт</h3>
              <AdminEditableSection
                title="Опыт"
                content={data.experience}
                isEditing={isEditing}
                onUpdate={(value) => onUpdate('experience', value)}
                placeholder="Профессиональный опыт"
                multiline
                className="text-white/90 leading-relaxed"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Видение</h3>
              <AdminEditableSection
                title="Видение"
                content={data.vision}
                isEditing={isEditing}
                onUpdate={(value) => onUpdate('vision', value)}
                placeholder="Видение будущего платформы"
                multiline
                className="text-white/90 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};