
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { BasicInfo } from '@/types/onboarding';

interface BasicInfoStepProps {
  data?: BasicInfo;
  onChange: (data: BasicInfo) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof BasicInfo, value: any) => {
    onChange({
      ...data,
      [field]: value
    } as BasicInfo);
  };

  return (
    <div className="space-y-6">
      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age">Возраст *</Label>
        <Input
          id="age"
          type="number"
          placeholder="Например, 45"
          value={data?.age || ''}
          onChange={(e) => updateField('age', parseInt(e.target.value))}
          min="18"
          max="100"
        />
      </div>

      {/* Height and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Рост (см) *</Label>
          <Input
            id="height"
            type="number"
            placeholder="Например, 165"
            value={data?.height || ''}
            onChange={(e) => updateField('height', parseInt(e.target.value))}
            min="100"
            max="250"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Вес (кг) *</Label>
          <Input
            id="weight"
            type="number"
            placeholder="Например, 65"
            value={data?.weight || ''}
            onChange={(e) => updateField('weight', parseInt(e.target.value))}
            min="30"
            max="200"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Город проживания</Label>
        <Input
          id="location"
          type="text"
          placeholder="Например, Москва"
          value={data?.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
        />
      </div>

      {/* Occupation */}
      <div className="space-y-2">
        <Label htmlFor="occupation">Род деятельности</Label>
        <Input
          id="occupation"
          type="text"
          placeholder="Например, менеджер"
          value={data?.occupation || ''}
          onChange={(e) => updateField('occupation', e.target.value)}
        />
      </div>

      {/* Children */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasChildren"
            checked={data?.hasChildren || false}
            onCheckedChange={(checked) => updateField('hasChildren', checked)}
          />
          <Label htmlFor="hasChildren">У меня есть дети</Label>
        </div>

        {data?.hasChildren && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="childrenCount">Количество детей</Label>
            <Input
              id="childrenCount"
              type="number"
              placeholder="Например, 2"
              value={data?.childrenCount || ''}
              onChange={(e) => updateField('childrenCount', parseInt(e.target.value))}
              min="1"
              max="10"
            />
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground bg-eva-soft-pink/20 rounded-lg p-3">
        <p>
          💡 <strong>Почему мы спрашиваем:</strong> Эти данные помогают нам лучше понять ваш профиль здоровья 
          и предоставить более точные рекомендации с учетом вашего образа жизни.
        </p>
      </div>
    </div>
  );
};
