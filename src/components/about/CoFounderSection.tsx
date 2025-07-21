import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { AdminImageUpload } from './AdminImageUpload';
import { Brain, Code, Sparkles, Users } from 'lucide-react';

interface CoFounderSectionProps {
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

export const CoFounderSection: React.FC<CoFounderSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-violet-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-32 h-32 bg-indigo-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-violet-300/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#53415B] mb-4 leading-tight animate-fade-in">
            Со-основательница и главный медицинский консультант
          </h2>
          <p className="text-xl text-[#6B73FF] max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Опытный врач-онколог, который привносит медицинскую экспертизу в заботу о женском здоровье
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Правая часть - Фото и основная информация */}
            <div className="text-center lg:text-right lg:order-2">
              {/* Фото в круге с градиентом */}
              <div className="inline-block relative mb-8 animate-fade-in">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/30 via-blue-400/30 to-violet-400/30 rounded-full blur-2xl"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                    <AdminImageUpload
                      currentImage={data.photo}
                      isEditing={isEditing}
                      onImageUpdate={(imageUrl) => onUpdate('photo', imageUrl)}
                      alt={data.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  {/* Декоративные элементы вокруг фото */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Имя и титул */}
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <AdminEditableSection
                  title="Имя со-основателя"
                  content={data.name}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('name', value)}
                  placeholder="Имя со-основателя"
                  className="text-3xl font-bold text-[#53415B] mb-2"
                />
                
                <AdminEditableSection
                  title="Должность со-основателя"
                  content={data.bio}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('bio', value)}
                  placeholder="Должность"
                  className="text-xl text-[#6B73FF] mb-3"
                />
                
                <AdminEditableSection
                  title="Дополнительная информация"
                  content={data.experience}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('experience', value)}
                  placeholder="Дополнительная информация"
                  className="text-lg text-[#6B73FF]/80 italic"
                />
              </div>

              {/* Цитата */}
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-indigo-200/30 shadow-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-4xl text-[#6B73FF] mb-4 text-center">"</div>
                <p className="text-lg text-[#53415B] italic text-center leading-relaxed">
                  Каждая женщина заслуживает профессиональной медицинской поддержки на всех этапах жизни.
                </p>
                <div className="text-4xl text-[#6B73FF] text-right">"</div>
              </div>
            </div>

            {/* Левая часть - Детальная информация */}
            <div className="space-y-6 lg:order-1">
              {/* История */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-indigo-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400/80 to-blue-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">Медицинский путь</h3>
                </div>
                <AdminEditableSection
                  title="История присоединения"
                  content={data.story}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('story', value)}
                  placeholder="История присоединения к проекту"
                  multiline
                  className="text-[#6B73FF] leading-relaxed"
                />
              </div>

              {/* Видение */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-violet-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-400/80 to-purple-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">Медицинское видение</h3>
                </div>
                <AdminEditableSection
                  title="Видение будущего"
                  content={data.vision}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('vision', value)}
                  placeholder="Технологическое видение"
                  multiline
                  className="text-[#6B73FF] leading-relaxed"
                />
              </div>

              {/* Подход к разработке */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-cyan-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">Профессиональная экспертиза</h3>
                </div>
                <p className="text-[#6B73FF] leading-relaxed">
                  Как врач-онколог с высшей категорией, привношу медицинскую экспертизу в разработку платформы. Мой опыт в диагностике заболеваний молочной железы помогает создавать действительно полезные инструменты для женщин.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};