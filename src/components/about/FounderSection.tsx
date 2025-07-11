import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Heart, Lightbulb, Globe, Mail } from 'lucide-react';

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
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-16 w-28 h-28 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 right-16 w-36 h-36 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Заголовок секции */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#53415B] mb-4 leading-tight animate-fade-in">
            Знакомьтесь с человеком, который стоит за Bloom
          </h2>
          <p className="text-xl text-[#A97FB2] max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Человеческая история, которая изменила подход к женскому здоровью
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Левая часть - Фото и основная информация */}
            <div className="text-center lg:text-left">
              {/* Фото в круге с градиентом */}
              <div className="inline-block relative mb-8 animate-fade-in">
                <div className="w-80 h-80 mx-auto relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-rose-400/30 rounded-full blur-2xl"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/50 shadow-2xl">
                    <img 
                      src={data.photo || "/lovable-uploads/73c908e4-72cf-4211-a489-8da3f189af53.png"}
                      alt={data.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  {/* Декоративные элементы вокруг фото */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Имя и титул */}
              <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <AdminEditableSection
                  title="Имя основателя"
                  content={data.name}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('name', value)}
                  placeholder="Имя основателя"
                  className="text-3xl font-bold text-[#53415B] mb-2"
                />
                
                <AdminEditableSection
                  title="Должность основателя"
                  content={data.bio}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('bio', value)}
                  placeholder="Должность"
                  className="text-xl text-[#A97FB2] mb-3"
                />
                
                <AdminEditableSection
                  title="Дополнительная информация"
                  content={data.experience}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('experience', value)}
                  placeholder="Дополнительная информация"
                  className="text-lg text-[#A97FB2]/80 italic"
                />
              </div>

              {/* Цитата */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-purple-200/30 shadow-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="text-4xl text-[#A97FB2] mb-4 text-center">"</div>
                <p className="text-lg text-[#53415B] italic text-center leading-relaxed">
                  Для меня Bloom — это не просто проект, а способ быть рядом с каждой женщиной в момент перемен.
                </p>
                <div className="text-4xl text-[#A97FB2] text-right">"</div>
              </div>

              {/* Microcopy внизу */}
              <div className="text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <p className="text-sm text-[#A97FB2] italic">
                  Спасибо, что выбираете заботу вместе с нами
                </p>
              </div>
            </div>

            {/* Правая часть - Детальная информация */}
            <div className="space-y-6">
              {/* История */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400/80 to-rose-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">История</h3>
                </div>
                <AdminEditableSection
                  title="История создания"
                  content={data.story}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('story', value)}
                  placeholder="История создания платформы"
                  multiline
                  className="text-[#A97FB2] leading-relaxed"
                />
              </div>

              {/* Видение */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400/80 to-indigo-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">Видение</h3>
                </div>
                <AdminEditableSection
                  title="Видение будущего"
                  content={data.vision}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate('vision', value)}
                  placeholder="Видение будущего"
                  multiline
                  className="text-[#A97FB2] leading-relaxed"
                />
              </div>

              {/* Контакт */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-cyan-500/80 rounded-xl flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#53415B]">Открыта к общению</h3>
                </div>
                <p className="text-[#A97FB2] leading-relaxed">
                  Пишите мне — я всегда открыта для обратной связи. Ваша история — часть нашей миссии.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};