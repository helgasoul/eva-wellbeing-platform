import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Trophy, Users, Award, Target } from 'lucide-react';

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

  const statIcons = [Users, Target, Trophy, Award];

  return (
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Наши достижения</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Цифры и факты, которые говорят о нашем успехе
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {data.stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <AdminEditableSection
                  title={`Число ${index + 1}`}
                  content={stat.number}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'number', value)}
                  placeholder="Число"
                  className="text-4xl font-bold text-white mb-2"
                />
                
                <AdminEditableSection
                  title={`Описание ${index + 1}`}
                  content={stat.description}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'description', value)}
                  placeholder="Описание достижения"
                  className="text-white/90"
                />
                
                {isEditing && (
                  <button
                    onClick={() => removeStat(index)}
                    className="text-red-400 hover:text-red-300 text-sm mt-2"
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
              className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 transition-colors cursor-pointer flex items-center justify-center min-h-[150px]"
            >
              <div className="text-center text-white/70">
                <div className="text-2xl mb-2">+</div>
                <p>Добавить статистику</p>
              </div>
            </div>
          )}
        </div>

        {/* Партнерства и награды */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Партнерства</h3>
            <div className="space-y-2">
              {data.partnerships.map((partnership, index) => (
                <div key={index} className="flex items-center justify-between">
                  <AdminEditableSection
                    title={`Партнерство ${index + 1}`}
                    content={partnership}
                    isEditing={isEditing}
                    onUpdate={(value) => {
                      const newPartnerships = [...data.partnerships];
                      newPartnerships[index] = value;
                      updatePartnerships(newPartnerships);
                    }}
                    placeholder="Название партнера"
                    className="text-white/90 flex-1"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newPartnerships = data.partnerships.filter((_, i) => i !== index);
                        updatePartnerships(newPartnerships);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updatePartnerships([...data.partnerships, ''])}
                  className="text-white/70 hover:text-white text-sm mt-2"
                >
                  + Добавить партнера
                </button>
              )}
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Награды</h3>
            <div className="space-y-2">
              {data.awards.map((award, index) => (
                <div key={index} className="flex items-center justify-between">
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
                    className="text-white/90 flex-1"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newAwards = data.awards.filter((_, i) => i !== index);
                        updateAwards(newAwards);
                      }}
                      className="text-red-400 hover:text-red-300 ml-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updateAwards([...data.awards, ''])}
                  className="text-white/70 hover:text-white text-sm mt-2"
                >
                  + Добавить награду
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};