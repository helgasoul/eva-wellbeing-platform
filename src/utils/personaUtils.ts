// Mock persona utilities
export const getPersonaTitle = (personaId: string): string => {
  const titles: Record<string, string> = {
    'first_signs': 'Первые признаки',
    'active_phase': 'Активная фаза',
    'postmenopause': 'Постменопауза',
    'default': 'Персонализированный профиль'
  };
  
  return titles[personaId] || titles.default;
};