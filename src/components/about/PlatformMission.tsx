import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { AdminImageUpload } from './AdminImageUpload';

interface PlatformMissionProps {
  data: {
    title: string;
    description: string;
    heroImage?: string;
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string) => void;
}

export const PlatformMission: React.FC<PlatformMissionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  return (
    <section className="py-20 text-center warm-bg">
      <div className="max-w-4xl mx-auto">
        <AdminEditableSection
          title="Заголовок миссии"
          content={data.title}
          isEditing={isEditing}
          onUpdate={(value) => onUpdate('title', value)}
          placeholder="Заголовок миссии платформы"
          className="text-5xl font-bold mb-8 text-foreground"
        />
        
        <AdminEditableSection
          title="Описание миссии"
          content={data.description}
          isEditing={isEditing}
          onUpdate={(value) => onUpdate('description', value)}
          placeholder="Описание миссии и ценностей платформы"
          multiline
          className="text-xl leading-relaxed mb-12 max-w-3xl mx-auto text-muted-foreground"
        />

        <div className="flex justify-center mb-8">
          <AdminImageUpload
            currentImage={data.heroImage}
            isEditing={isEditing}
            onImageUpdate={(imageUrl) => onUpdate('heroImage', imageUrl)}
            alt="Миссия платформы"
            className="w-64 h-40 rounded-lg object-cover shadow-lg"
            uploadText="Загрузить изображение"
          />
        </div>
      </div>
    </section>
  );
};