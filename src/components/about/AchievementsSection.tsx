import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Heart, Users, Award, MessageCircle } from 'lucide-react';

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

  const statIcons = [Heart, Users, MessageCircle, Award];
  const statGradients = [
    'from-soft-pink to-soft-pink/80',
    'from-soft-purple to-soft-purple/80',
    'from-soft-blue to-soft-blue/80',
    'from-orange to-orange/80'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-soft-purple/20 via-soft-pink/15 to-background relative overflow-hidden mb-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-soft-purple/5 via-transparent to-soft-pink/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="text-5xl mb-6">💖</div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Сила сообщества — ваши истории и наша поддержка
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Спасибо, что выбираете нас — вместе мы делаем женское здоровье понятнее, доступнее и теплее
          </p>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {data.stats.map((stat, index) => {
            const Icon = statIcons[index % statIcons.length];
            const gradient = statGradients[index % statGradients.length];
            return (
              <div key={index} className="group text-center bg-card/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-card/90 hover:shadow-elegant hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                
                <AdminEditableSection
                  title={`Число ${index + 1}`}
                  content={stat.number}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'number', value)}
                  placeholder="Число"
                  className="text-4xl font-bold text-foreground mb-4"
                />
                
                <AdminEditableSection
                  title={`Описание ${index + 1}`}
                  content={stat.description}
                  isEditing={isEditing}
                  onUpdate={(value) => updateStat(index, 'description', value)}
                  placeholder="Описание достижения"
                  className="text-muted-foreground text-lg leading-relaxed"
                />
                
                {isEditing && (
                  <button
                    onClick={() => removeStat(index)}
                    className="text-destructive hover:text-destructive/80 text-sm mt-4 bg-destructive/10 hover:bg-destructive/20 px-3 py-1 rounded-full transition-colors"
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
              className="bg-card/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-soft-pink/50 hover:border-soft-pink hover:bg-card/80 transition-all cursor-pointer flex items-center justify-center min-h-[200px] group"
            >
              <div className="text-center text-muted-foreground group-hover:text-foreground transition-colors">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">+</div>
                <p className="text-lg">Добавить статистику</p>
              </div>
            </div>
          )}
        </div>

        {/* Партнерства и награды */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
           <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-card/90 transition-colors">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-2xl font-bold text-foreground">Наши партнёры</h3>
              <p className="text-muted-foreground mt-2">Гордимся сотрудничеством с ведущими центрами</p>
            </div>
            <div className="space-y-4">
              {data.partnerships.map((partnership, index) => (
                <div key={index} className="flex items-center justify-between bg-soft-pink/50 rounded-2xl p-4">
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
                    className="text-muted-foreground flex-1 text-lg"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newPartnerships = data.partnerships.filter((_, i) => i !== index);
                        updatePartnerships(newPartnerships);
                      }}
                       className="text-destructive hover:text-destructive/80 ml-4 bg-destructive/10 hover:bg-destructive/20 p-2 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updatePartnerships([...data.partnerships, ''])}
                  className="w-full text-muted-foreground hover:text-foreground text-lg mt-4 bg-soft-pink/30 hover:bg-soft-pink/50 py-3 rounded-2xl transition-colors"
                >
                  + Добавить партнера
                </button>
              )}
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 hover:bg-card/90 transition-colors">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-2xl font-bold text-foreground">Награды и признания</h3>
              <p className="text-muted-foreground mt-2">Наши достижения — признание вашей веры в нас</p>
            </div>
            <div className="space-y-4">
              {data.awards.map((award, index) => (
                <div key={index} className="flex items-center justify-between bg-soft-purple/50 rounded-2xl p-4">
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
                    className="text-muted-foreground flex-1 text-lg"
                  />
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newAwards = data.awards.filter((_, i) => i !== index);
                        updateAwards(newAwards);
                      }}
                      className="text-destructive hover:text-destructive/80 ml-4 bg-destructive/10 hover:bg-destructive/20 p-2 rounded-full transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={() => updateAwards([...data.awards, ''])}
                  className="w-full text-muted-foreground hover:text-foreground text-lg mt-4 bg-soft-purple/30 hover:bg-soft-purple/50 py-3 rounded-2xl transition-colors"
                >
                  + Добавить награду
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Final message */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-soft-purple/30 to-soft-pink/30 rounded-3xl p-8 border border-soft-purple/30 max-w-4xl mx-auto">
            <div className="text-4xl mb-4">🌸</div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Ваше здоровье и благополучие — наш главный приоритет.
              Каждая цифра здесь — это реальная история поддержки и заботы.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};