import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { AdminImageUpload } from './AdminImageUpload';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface Expert {
  id: string;
  name: string;
  specialization: string;
  achievements: string;
  interests: string;
  role: string;
  photo?: string;
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
      photo: undefined
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
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Команда врачей-экспертов
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Медицинский совет платформы bloom объединяет ведущих специалистов в области женского здоровья
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((expert) => (
            <div key={expert.id} className="bg-white/20 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/30 transition-all duration-300">
              <div className="p-6">
                <div className="text-center mb-4">
                  <AdminImageUpload
                    currentImage={expert.photo}
                    isEditing={isEditing}
                    onImageUpdate={(imageUrl) => updateExpert(expert.id, 'photo', imageUrl)}
                    alt={expert.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  
                  <AdminEditableSection
                    title="Имя эксперта"
                    content={expert.name}
                    isEditing={isEditing}
                    onUpdate={(value) => updateExpert(expert.id, 'name', value)}
                    placeholder="Имя эксперта"
                    className="text-xl font-bold text-white mb-2"
                  />

                  <AdminEditableSection
                    title="Роль"
                    content={expert.role}
                    isEditing={isEditing}
                    onUpdate={(value) => updateExpert(expert.id, 'role', value)}
                    placeholder="Роль в команде"
                    className="text-sm text-white/70 mb-3"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Специализация</h4>
                    <AdminEditableSection
                      title="Специализация"
                      content={expert.specialization}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'specialization', value)}
                      placeholder="Специализация врача"
                      multiline
                      className="text-sm text-white/90"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Достижения</h4>
                    <AdminEditableSection
                      title="Достижения"
                      content={expert.achievements}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'achievements', value)}
                      placeholder="Ключевые достижения"
                      multiline
                      className="text-sm text-white/90"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Интересы</h4>
                    <AdminEditableSection
                      title="Интересы"
                      content={expert.interests}
                      isEditing={isEditing}
                      onUpdate={(value) => updateExpert(expert.id, 'interests', value)}
                      placeholder="Научные интересы"
                      multiline
                      className="text-sm text-white/90"
                    />
                  </div>
                </div>

                {isEditing && (
                  <Button
                    onClick={() => removeExpert(expert.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
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
              className="bg-white/10 backdrop-blur-sm rounded-xl border-2 border-dashed border-white/30 hover:border-white/50 transition-colors cursor-pointer flex items-center justify-center min-h-[400px]"
            >
              <div className="text-center text-white/70">
                <Plus className="w-12 h-12 mx-auto mb-2" />
                <p>Добавить эксперта</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};