
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MenstrualHistory } from '@/types/onboarding';

interface MenstrualHistoryStepProps {
  data?: MenstrualHistory;
  onChange: (data: MenstrualHistory) => void;
}

export const MenstrualHistoryStep: React.FC<MenstrualHistoryStepProps> = ({ data, onChange }) => {
  const updateField = (field: keyof MenstrualHistory, value: any) => {
    onChange({
      ...data,
      [field]: value
    } as MenstrualHistory);
  };

  return (
    <div className="space-y-6">
      {/* Age of first period */}
      <div className="space-y-2">
        <Label htmlFor="ageOfFirstPeriod">Возраст первой менструации *</Label>
        <Input
          id="ageOfFirstPeriod"
          type="number"
          placeholder="Например, 13"
          value={data?.ageOfFirstPeriod || ''}
          onChange={(e) => updateField('ageOfFirstPeriod', parseInt(e.target.value))}
          min="8"
          max="20"
        />
      </div>

      {/* Average cycle length */}
      <div className="space-y-2">
        <Label htmlFor="averageCycleLength">Средняя длина цикла (дни)</Label>
        <Input
          id="averageCycleLength"
          type="number"
          placeholder="Например, 28"
          value={data?.averageCycleLength || ''}
          onChange={(e) => updateField('averageCycleLength', parseInt(e.target.value))}
          min="20"
          max="45"
        />
        <p className="text-sm text-muted-foreground">
          От первого дня одной менструации до первого дня следующей
        </p>
      </div>

      {/* Last period date */}
      <div className="space-y-2">
        <Label htmlFor="lastPeriodDate">Дата последней менструации</Label>
        <Input
          id="lastPeriodDate"
          type="date"
          value={data?.lastPeriodDate || ''}
          onChange={(e) => updateField('lastPeriodDate', e.target.value)}
        />
      </div>

      {/* Regular periods */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPeriodsRegular"
          checked={data?.isPeriodsRegular || false}
          onCheckedChange={(checked) => updateField('isPeriodsRegular', checked)}
        />
        <Label htmlFor="isPeriodsRegular">Мои циклы регулярные</Label>
      </div>

      {/* Stopped completely */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasStoppedCompletely"
            checked={data?.hasStoppedCompletely || false}
            onCheckedChange={(checked) => updateField('hasStoppedCompletely', checked)}
          />
          <Label htmlFor="hasStoppedCompletely">Менструации полностью прекратились</Label>
        </div>

        {data?.hasStoppedCompletely && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="whenStoppedCompletely">Когда это произошло?</Label>
            <Input
              id="whenStoppedCompletely"
              type="month"
              value={data?.whenStoppedCompletely || ''}
              onChange={(e) => updateField('whenStoppedCompletely', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Pregnancies */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pregnanciesCount">Количество беременностей</Label>
          <Input
            id="pregnanciesCount"
            type="number"
            placeholder="0"
            value={data?.pregnanciesCount ?? ''}
            onChange={(e) => updateField('pregnanciesCount', parseInt(e.target.value) || 0)}
            min="0"
            max="15"
          />
        </div>

        {(data?.pregnanciesCount ?? 0) > 0 && (
          <div className="space-y-2">
            <Label htmlFor="lastPregnancyYear">Год последней беременности</Label>
            <Input
              id="lastPregnancyYear"
              type="number"
              placeholder="Например, 2010"
              value={data?.lastPregnancyYear || ''}
              onChange={(e) => updateField('lastPregnancyYear', parseInt(e.target.value))}
              min="1950"
              max={new Date().getFullYear()}
            />
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <p>
          💡 <strong>Конфиденциально:</strong> Информация о менструальном цикле критически важна 
          для определения вашей фазы менопаузы и создания персонализированных рекомендаций.
        </p>
      </div>
    </div>
  );
};
