
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoalsAndPriorities } from '@/types/onboarding';

interface GoalsStepProps {
  data?: GoalsAndPriorities;
  onChange: (data: GoalsAndPriorities) => void;
}

const defaultData: GoalsAndPriorities = {
  primaryConcerns: [],
  goals: [],
  preferredApproach: 'combination',
  informationPreferences: [],
  communicationFrequency: 'weekly'
};

export const GoalsStep: React.FC<GoalsStepProps> = ({ 
  data = defaultData, 
  onChange 
}) => {
  const updateField = (field: keyof GoalsAndPriorities, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="space-y-8">
      {/* Primary Concerns */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Основные беспокойства</h3>
        <Label>Что вас беспокоит больше всего? (можно выбрать несколько)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'symptom_management', label: 'Управление симптомами' },
            { value: 'weight_control', label: 'Контроль веса' },
            { value: 'bone_health', label: 'Здоровье костей' },
            { value: 'heart_health', label: 'Здоровье сердца' }
          ].map((concern) => (
            <div key={concern.value} className="flex items-center space-x-2">
              <Checkbox
                id={concern.value}
                checked={data.primaryConcerns.includes(concern.value)}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.primaryConcerns, concern.value);
                  updateField('primaryConcerns', updated);
                }}
              />
              <Label htmlFor={concern.value}>{concern.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Ваши цели</h3>
        <Label>Чего вы хотите достичь? (можно выбрать несколько)</Label>
        <div className="space-y-2">
          {[
            { value: 'reduce_hot_flashes', label: 'Уменьшить приливы' },
            { value: 'improve_sleep', label: 'Улучшить качество сна' },
            { value: 'maintain_weight', label: 'Поддерживать здоровый вес' },
            { value: 'prevent_diseases', label: 'Предотвратить возрастные заболевания' },
            { value: 'improve_mood', label: 'Улучшить настроение' },
            { value: 'increase_energy', label: 'Повысить уровень энергии' }
          ].map((goal) => (
            <div key={goal.value} className="flex items-center space-x-2">
              <Checkbox
                id={goal.value}
                checked={data.goals.includes(goal.value)}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.goals, goal.value);
                  updateField('goals', updated);
                }}
              />
              <Label htmlFor={goal.value}>{goal.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Preferred Approach */}
      <div className="space-y-2">
        <Label>Предпочитаемый подход к лечению</Label>
        <Select 
          value={data.preferredApproach} 
          onValueChange={(value) => updateField('preferredApproach', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical">Медицинский (лекарства, процедуры)</SelectItem>
            <SelectItem value="natural">Естественный (образ жизни, травы)</SelectItem>
            <SelectItem value="combination">Комбинированный подход</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Information Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Предпочтения в информации</h3>
        <Label>Какая информация для вас наиболее ценна? (можно выбрать несколько)</Label>
        <div className="space-y-2">
          {[
            { value: 'research_based', label: 'Научные исследования' },
            { value: 'peer_experiences', label: 'Опыт других женщин' },
            { value: 'doctor_advice', label: 'Советы врачей' },
            { value: 'practical_tips', label: 'Практические советы' }
          ].map((pref) => (
            <div key={pref.value} className="flex items-center space-x-2">
              <Checkbox
                id={pref.value}
                checked={data.informationPreferences.includes(pref.value)}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.informationPreferences, pref.value);
                  updateField('informationPreferences', updated);
                }}
              />
              <Label htmlFor={pref.value}>{pref.label}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Frequency */}
      <div className="space-y-2">
        <Label>Как часто вы хотели бы получать персональные рекомендации?</Label>
        <Select 
          value={data.communicationFrequency} 
          onValueChange={(value) => updateField('communicationFrequency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Ежедневно</SelectItem>
            <SelectItem value="weekly">Еженедельно</SelectItem>
            <SelectItem value="monthly">Ежемесячно</SelectItem>
            <SelectItem value="as_needed">По мере необходимости</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Final Message */}
      <div className="text-center bg-gradient-to-r from-accent/30 to-muted rounded-lg p-6">
        <h4 className="font-medium text-primary mb-2">Почти готово! 🎉</h4>
        <p className="text-sm text-muted-foreground">
          Спасибо за терпение. Мы используем вашу информацию для создания персонального 
          плана поддержки вашего здоровья и благополучия.
        </p>
      </div>
    </div>
  );
};
