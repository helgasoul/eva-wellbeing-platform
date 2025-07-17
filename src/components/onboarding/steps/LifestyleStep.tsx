
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SeverityScale } from '@/components/onboarding/SeverityScale';
import { LifestyleInfo } from '@/types/onboarding';

interface LifestyleStepProps {
  data?: LifestyleInfo;
  onChange: (data: LifestyleInfo) => void;
}

const defaultData: LifestyleInfo = {
  exerciseFrequency: 'rarely',
  exerciseTypes: [],
  dietType: 'regular',
  smokingStatus: 'never',
  alcoholConsumption: 'rarely',
  stressLevel: 5,
  sleepHours: 7,
  supplementsUsed: []
};

export const LifestyleStep: React.FC<LifestyleStepProps> = ({ 
  data = defaultData, 
  onChange 
}) => {
  const updateField = (field: keyof LifestyleInfo, value: any) => {
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
      <div className="text-sm text-muted-foreground bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-green-500 text-lg">🌟</div>
          <div>
            <p className="font-medium text-green-900 mb-1">Ваш образ жизни:</p>
            <p className="text-green-800">
              Информация о ваших привычках поможет создать реалистичные рекомендации. 
              Отвечайте честно - даже "не занимаюсь" или "никогда" являются важными ответами.
            </p>
          </div>
        </div>
      </div>
      {/* Exercise Frequency */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Физическая активность</h3>
        <div className="space-y-2">
          <Label>Как часто вы занимаетесь физическими упражнениями?</Label>
          <Select 
            value={data.exerciseFrequency} 
            onValueChange={(value) => updateField('exerciseFrequency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Никогда</SelectItem>
              <SelectItem value="rarely">Редко (менее 1 раза в неделю)</SelectItem>
              <SelectItem value="1-2_weekly">1-2 раза в неделю</SelectItem>
              <SelectItem value="3-4_weekly">3-4 раза в неделю</SelectItem>
              <SelectItem value="daily">Ежедневно</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.exerciseFrequency !== 'never' && (
          <div className="space-y-3">
            <Label>Какие виды активности вы предпочитаете? (можно выбрать несколько)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'cardio', label: 'Кардио (бег, велосипед)' },
                { value: 'strength', label: 'Силовые тренировки' },
                { value: 'yoga', label: 'Йога/пилатес' },
                { value: 'walking', label: 'Пешие прогулки' }
              ].map((exercise) => (
                <div key={exercise.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={exercise.value}
                    checked={data.exerciseTypes.includes(exercise.value)}
                    disabled={data.exerciseTypes.includes('none_of_the_above')}
                    onCheckedChange={(checked) => {
                      const updated = toggleArrayItem(data.exerciseTypes, exercise.value);
                      updateField('exerciseTypes', updated);
                    }}
                  />
                  <Label htmlFor={exercise.value}>{exercise.label}</Label>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exercise_none"
                  checked={data.exerciseTypes.includes('none_of_the_above')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateField('exerciseTypes', ['none_of_the_above']);
                    } else {
                      updateField('exerciseTypes', []);
                    }
                  }}
                />
                <Label htmlFor="exercise_none" className="text-muted-foreground">
                  Ничего из перечисленного
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diet Type */}
      <div className="space-y-2">
        <Label>Тип питания</Label>
        <Select 
          value={data.dietType} 
          onValueChange={(value) => updateField('dietType', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Обычное питание</SelectItem>
            <SelectItem value="vegetarian">Вегетарианское</SelectItem>
            <SelectItem value="vegan">Веганское</SelectItem>
            <SelectItem value="keto">Кето-диета</SelectItem>
            <SelectItem value="mediterranean">Средиземноморская диета</SelectItem>
            <SelectItem value="other">Другое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Smoking Status */}
      <div className="space-y-2">
        <Label>Курение</Label>
        <Select 
          value={data.smokingStatus} 
          onValueChange={(value) => updateField('smokingStatus', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Никогда не курила</SelectItem>
            <SelectItem value="former">Бросила курить</SelectItem>
            <SelectItem value="current">Курю в настоящее время</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alcohol Consumption */}
      <div className="space-y-2">
        <Label>Употребление алкоголя</Label>
        <Select 
          value={data.alcoholConsumption} 
          onValueChange={(value) => updateField('alcoholConsumption', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="never">Никогда</SelectItem>
            <SelectItem value="rarely">Редко (по особым случаям)</SelectItem>
            <SelectItem value="moderate">Умеренно (1-2 раза в неделю)</SelectItem>
            <SelectItem value="frequent">Часто (более 3 раз в неделю)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stress Level */}
      <div className="space-y-4">
        <SeverityScale
          label="Оцените ваш уровень стресса в повседневной жизни"
          value={data.stressLevel}
          onChange={(value) => updateField('stressLevel', value)}
        />
      </div>

      {/* Sleep Hours */}
      <div className="space-y-2">
        <Label htmlFor="sleepHours">Сколько часов вы спите в среднем?</Label>
        <Input
          id="sleepHours"
          type="number"
          placeholder="7"
          value={data.sleepHours}
          onChange={(e) => updateField('sleepHours', parseFloat(e.target.value))}
          min="4"
          max="12"
          step="0.5"
        />
      </div>

      {/* Supplements */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Добавки и витамины</h3>
        <Label>Какие добавки вы принимаете? (можно выбрать несколько)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Витамин D',
            'Кальций',
            'Магний',
            'Омега-3',
            'Мультивитамины',
            'Фитоэстрогены'
          ].map((supplement) => (
            <div key={supplement} className="flex items-center space-x-2">
              <Checkbox
                id={supplement}
                checked={data.supplementsUsed.includes(supplement)}
                disabled={data.supplementsUsed.includes('none_of_the_above')}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.supplementsUsed, supplement);
                  updateField('supplementsUsed', updated);
                }}
              />
              <Label htmlFor={supplement}>{supplement}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="supplements_none"
              checked={data.supplementsUsed.includes('none_of_the_above')}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('supplementsUsed', ['none_of_the_above']);
                } else {
                  updateField('supplementsUsed', []);
                }
              }}
            />
            <Label htmlFor="supplements_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <p>
          ✅ <strong>Отлично!</strong> Ваш профиль образа жизни составлен. 
          Эти данные помогут адаптировать рекомендации под ваши текущие привычки и возможности.
        </p>
      </div>
    </div>
  );
};
