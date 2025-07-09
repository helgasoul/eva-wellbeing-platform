import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Heart, Users, Award, Target, Sparkles, Shield } from 'lucide-react';

interface AchievementsSectionProps {
  data: {
    stats: Array<{
      number: string;
      description: string;
    }>;
    partnerships: string[];
    awards: string[];
  };
  isEditing: boolean;
  onUpdate: (field: string, value: any) => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  const updateStats = (stats: Array<{number: string; description: string}>) => {
    onUpdate('stats', stats);
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateStats(newStats);
  };

  const addStat = () => {
    const newStats = [...data.stats, { number: '', description: '' }];
    updateStats(newStats);
  };

  const removeStat = (index: number) => {
    const newStats = data.stats.filter((_, i) => i !== index);
    updateStats(newStats);
  };

  const updatePartnerships = (partnerships: string[]) => {
    onUpdate('partnerships', partnerships);
  };

  const updateAwards = (awards: string[]) => {
    onUpdate('awards', awards);
  };

  const statIcons = [Heart, Users, Sparkles, Shield];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#53415B] mb-6 leading-tight animate-fade-in">
            Сила сообщества — ваши истории и наша поддержка
          </h2>
          <p className="text-xl md:text-2xl text-[#A97FB2] max-w-4xl mx-auto leading-relaxed animate-fade-in mb-6" style={{ animationDelay: '0.2s' }}>
            Спасибо, что выбираете нас — вместе мы делаем женское здоровье понятнее, доступнее и теплее
          </p>
          <p className="text-lg text-[#A97FB2] italic animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Наше сообщество — в цифрах и историях
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {data.stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            const gradients = [
              'from-pink-400/80 to-rose-500/80',
              'from-purple-400/80 to-indigo-500/80', 
              'from-blue-400/80 to-cyan-500/80',
              'from-green-400/80 to-teal-500/80'
            ];
            return (
              <div 
                key={index} 
                className="text-center group animate-fade-in bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  <Icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <AdminEditableSection
                  title={`Число ${index + 1}`}
                  content={stat.number}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'number', value)}
                  placeholder="Число"
                  className="text-4xl md:text-5xl font-bold text-[#53415B] mb-4"
                />
                
                <AdminEditableSection
                  title={`Описание ${index + 1}`}
                  content={stat.description}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'description', value)}
                  placeholder="Описание достижения"
                  className="text-[#A97FB2] leading-relaxed"
                />
                
                {isEditing && (
                  <button
                    onClick={() => removeStat(index)}
                    className="text-red-400 hover:text-red-300 text-sm mt-4 px-3 py-1 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Удалить
                  </button>
                )}
              </div>
            );
          })}

          {isEditing && (
            <div 
              onClick={addStat}
              className="bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-300/40 hover:border-purple-400/60 transition-colors cursor-pointer flex items-center justify-center min-h-[280px] group"
            >
              <div className="text-center text-[#A97FB2] group-hover:text-[#53415B] transition-colors">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">+</div>
                <p className="font-medium">Добавить статистику</p>
              </div>
            </div>
          )}
        </div>

        {/* Партнерства и награды */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Партнерства */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400/80 to-indigo-500/80 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#53415B]">Наши партнёры</h3>
            </div>
            <div className="space-y-4">
              {data.partnerships.map((partnership, index) => (
                <div key={index} className="flex items-center justify-between bg-white/50 rounded-xl p-4 border border-purple-200/30">
                  <AdminEditableSection
                    title={`Партнерство ${index + 1}`}
                    content={partnership}
                    isEditing={isEditing}
                    onUpdate={(value) => {
                      const newPartnerships = [...data.partnerships];
                      newPartnerships[index] = value;
                      updatePartnerships(newPartnerships);
                    }}
                    placeholder="Описание партнерства"
                    className="text-[#A97FB2] flex-1 leading-relaxed"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newPartnerships = data.partnerships.filter((_, i) => i !== index);
                        updatePartnerships(newPartnerships);
                      }}
                      className="text-red-400 hover:text-red-300 ml-4 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updatePartnerships([...data.partnerships, ''])}
                  className="w-full text-[#A97FB2] hover:text-[#53415B] border-2 border-dashed border-purple-300/40 hover:border-purple-400/60 rounded-xl p-4 transition-colors"
                >
                  + Добавить партнера
                </button>
              )}
            </div>
          </div>

          {/* Награды */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400/80 to-rose-500/80 rounded-xl flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#53415B]">Наши достижения</h3>
            </div>
            <div className="space-y-4">
              {data.awards.map((award, index) => (
                <div key={index} className="flex items-center justify-between bg-white/50 rounded-xl p-4 border border-pink-200/30">
                  <AdminEditableSection
                    title={`Награда ${index + 1}`}
                    content={award}
                    isEditing={isEditing}
                    onUpdate={(value) => {
                      const newAwards = [...data.awards];
                      newAwards[index] = value;
                      updateAwards(newAwards);
                    }}
                    placeholder="Название награды"
                    className="text-[#A97FB2] flex-1 leading-relaxed"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newAwards = data.awards.filter((_, i) => i !== index);
                        updateAwards(newAwards);
                      }}
                      className="text-red-400 hover:text-red-300 ml-4 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updateAwards([...data.awards, ''])}
                  className="w-full text-[#A97FB2] hover:text-[#53415B] border-2 border-dashed border-pink-300/40 hover:border-pink-400/60 rounded-xl p-4 transition-colors"
                >
                  + Добавить награду
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Закрывающее послание */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/20 shadow-lg">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium text-[#53415B] italic">
              Ваша история — важна для нас. Bloom — это не только сервис, это сообщество поддержки.
            </p>
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};