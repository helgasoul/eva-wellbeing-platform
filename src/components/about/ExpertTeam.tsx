import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { AdminImageUpload } from './AdminImageUpload';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Heart, Stethoscope, Award } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  specialization: string;
  achievements: string;
  interests: string;
  role: string;
  photo?: string;
  quote?: string;
  approach?: string;
}

interface ExpertTeamProps {
  data: Expert[];
  isEditing: boolean;
  onUpdate: (experts: Expert[]) => void;
}

export const ExpertTeam: React.FC<ExpertTeamProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  const addNewExpert = () => {
    const newExpert: Expert = {
      id: Date.now().toString(),
      name: '',
      specialization: '',
      achievements: '',
      interests: '',
      role: '',
      photo: undefined,
      quote: '',
      approach: ''
    };
    onUpdate([...data, newExpert]);
  };

  const updateExpert = (id: string, field: string, value: string) => {
    const updatedExperts = data.map(expert => 
      expert.id === id ? { ...expert, [field]: value } : expert
    );
    onUpdate(updatedExperts);
  };

  const removeExpert = (id: string) => {
    const updatedExperts = data.filter(expert => expert.id !== id);
    onUpdate(updatedExperts);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl mb-8 relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-15">
         <div className="absolute top-20 left-20 w-32 h-32 bg-soft-purple/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-soft-pink/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-soft-pink/15 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#53415B] mb-6 leading-tight animate-fade-in">
            Наша команда заботливых врачей
          </h2>
          <p className="text-xl md:text-2xl text-[#A97FB2] max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Каждая из нас — эксперт, но прежде всего человек, который понимает женские потребности. 
            Вместе с вами — эксперты, которые умеют не только лечить, но и слушать, поддерживать и объяснять.
          </p>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {data.map((expert, index) => (
            <div 
              key={expert.id} 
              className="group bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-border/30 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="p-8">
                {/* Верхняя часть с фото и основной информацией */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
                  {/* Портрет с градиентным фоном */}
                  <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-rose-400/30 rounded-full blur-xl"></div>
                      <AdminImageUpload
                        currentImage={expert.photo}
                        isEditing={isEditing}
                        onImageUpdate={(imageUrl) => updateExpert(expert.id, 'photo', imageUrl)}
                        alt={`Портрет ${expert.name} — ${expert.role}, ${expert.specialization}`}
                        className="relative w-full h-full rounded-full object-cover border-4 border-white/70 shadow-xl"
                      />
                    </div>
                    {/* Декоративные элементы */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full animate-pulse"></div>
                  </div>

                  {/* Основная информация */}
                  <div className="flex-1 text-center sm:text-left">
                    <AdminEditableSection
                      title="Имя эксперта"
                      content={expert.name}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'name', value)}
                      placeholder="Имя эксперта"
                      className="text-2xl font-bold text-[#53415B] mb-2"
                    />

                    <AdminEditableSection
                      title="Роль"
                      content={expert.role}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'role', value)}
                      placeholder="Роль в команде"
                      className="text-lg text-[#A97FB2] font-medium mb-2"
                    />

                    <AdminEditableSection
                      title="Специализация"
                      content={expert.specialization}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'specialization', value)}
                      placeholder="Специализация врача"
                      className="text-[#A97FB2] mb-4"
                    />
                  </div>
                </div>

                {/* Цитата врача */}
                <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl p-6 mb-6 border border-purple-200/30">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-primary mr-2 animate-pulse" />
                    <h4 className="text-lg font-semibold text-[#53415B]">Мое обращение к вам</h4>
                  </div>
                  <div className="text-[#A97FB2] mb-2">"</div>
                  <AdminEditableSection
                    title="Цитата врача"
                    content={expert.quote || "Моя миссия — чтобы каждая пациентка чувствовала себя услышанной и поддержанной"}
                    isEditing={isEditing}
                    onUpdate={(value) => updateExpert(expert.id, 'quote', value)}
                    placeholder="Цитата или обращение врача"
                    multiline
                    className="text-[#53415B] italic leading-relaxed"
                  />
                  <div className="text-[#A97FB2] text-right">"</div>
                </div>

                {/* Детальная информация в карточках */}
                <div className="space-y-4">
                  {/* Достижения */}
                  <div className="bg-card/50 rounded-xl p-4 border border-soft-pink/30">
                    <div className="flex items-center mb-2">
                      <Award className="w-5 h-5 text-primary mr-2" />
                      <h4 className="text-base font-semibold text-[#53415B]">Чем горжусь</h4>
                    </div>
                    <AdminEditableSection
                      title="Достижения"
                      content={expert.achievements}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'achievements', value)}
                      placeholder="Достижения в человечном формате"
                      multiline
                      className="text-sm text-[#A97FB2] leading-relaxed"
                    />
                  </div>

                  {/* Интересы/подход */}
                  <div className="bg-card/50 rounded-xl p-4 border border-soft-purple/30">
                    <div className="flex items-center mb-2">
                      <Stethoscope className="w-5 h-5 text-primary mr-2" />
                      <h4 className="text-base font-semibold text-[#53415B]">Особое внимание уделяю</h4>
                    </div>
                    <AdminEditableSection
                      title="Интересы"
                      content={expert.interests}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'interests', value)}
                      placeholder="Области особого внимания"
                      multiline
                      className="text-sm text-[#A97FB2] leading-relaxed"
                    />
                  </div>

                  {/* Подход к работе */}
                  {isEditing && (
                    <div className="bg-card/50 rounded-xl p-4 border border-soft-blue/30">
                      <div className="flex items-center mb-2">
                        <Heart className="w-5 h-5 text-primary mr-2" />
                        <h4 className="text-base font-semibold text-[#53415B]">Мой подход</h4>
                      </div>
                      <AdminEditableSection
                        title="Подход к работе"
                        content={expert.approach || ""}
                        isEditing={isEditing}
                        onUpdate={(value) => updateExpert(expert.id, 'approach', value)}
                        placeholder="Подход к работе с пациентками"
                        multiline
                        className="text-sm text-[#A97FB2] leading-relaxed"
                      />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <Button
                    onClick={() => removeExpert(expert.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-6"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить эксперта
                  </Button>
                )}
              </div>
            </div>
          ))}

          {isEditing && (
            <div 
              onClick={addNewExpert}
              className="bg-card/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-soft-purple/40 hover:border-soft-purple/60 transition-colors cursor-pointer flex items-center justify-center min-h-[500px] group"
            >
              <div className="text-center text-[#A97FB2] group-hover:text-[#53415B] transition-colors">
                <Plus className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-lg font-medium">Добавить врача</p>
              </div>
            </div>
          )}
        </div>

        {/* Microcopy внизу */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="inline-flex items-center space-x-2 bg-card/70 backdrop-blur-sm rounded-full px-8 py-4 border border-primary/20 shadow-lg">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium text-[#53415B] italic">
              Врачи без | паузы — всегда на связи и готовы поддержать вас на любом этапе пути
            </p>
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};