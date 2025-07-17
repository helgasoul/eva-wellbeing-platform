
import React from 'react';
import { SymptomFrequencySelector } from '@/components/onboarding/SymptomFrequencySelector';
import { SeverityScale } from '@/components/onboarding/SeverityScale';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MenopauseSymptoms } from '@/types/onboarding';

interface SymptomsStepProps {
  data?: MenopauseSymptoms;
  onChange: (data: MenopauseSymptoms) => void;
}

const defaultSymptoms: MenopauseSymptoms = {
  hotFlashes: { frequency: 'never', severity: 1, triggers: [] },
  nightSweats: { frequency: 'never', severity: 1 },
  sleepProblems: { frequency: 'never', types: [], sleepQuality: 7 },
  moodChanges: { frequency: 'never', types: [] },
  physicalSymptoms: [],
  cognitiveSymptoms: []
};

export const SymptomsStep: React.FC<SymptomsStepProps> = ({ data = defaultSymptoms, onChange }) => {
  const updateField = (field: keyof MenopauseSymptoms, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateSymptomFrequency = (symptom: 'hotFlashes' | 'nightSweats', frequency: any) => {
    updateField(symptom, { ...data[symptom], frequency });
  };

  const updateSymptomSeverity = (symptom: 'hotFlashes' | 'nightSweats', severity: number) => {
    updateField(symptom, { ...data[symptom], severity });
  };

  const updateHotFlashTriggers = (triggers: string[]) => {
    updateField('hotFlashes', { ...data.hotFlashes, triggers });
  };

  const updateComplexSymptom = (symptom: 'sleepProblems' | 'moodChanges', field: string, value: any) => {
    updateField(symptom, { ...data[symptom], [field]: value });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-lg">💡</div>
          <div>
            <p className="font-medium text-blue-900 mb-1">Важно знать:</p>
            <p className="text-blue-800">
              Если вы не испытываете какой-то симптом, это тоже важная информация для вашего анализа. 
              Выбирайте "Никогда" или "Ничего из перечисленного" - это поможет нам лучше понять ваше состояние.
            </p>
          </div>
        </div>
      </div>
      {/* Hot Flashes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Приливы</h3>
        <SymptomFrequencySelector
          label="Как часто вы испытываете приливы?"
          value={data.hotFlashes.frequency}
          onChange={(frequency) => updateSymptomFrequency('hotFlashes', frequency)}
        />
        {data.hotFlashes.frequency !== 'never' && (
          <div className="space-y-4">
            <SeverityScale
              label="Насколько сильные приливы?"
              value={data.hotFlashes.severity}
              onChange={(severity) => updateSymptomSeverity('hotFlashes', severity)}
            />
            
            {/* Hot Flash Triggers */}
            <div className="space-y-3">
              <Label>Что чаще всего провоцирует приливы? (можно выбрать несколько)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'stress', label: 'Стресс' },
                  { value: 'heat', label: 'Жара' },
                  { value: 'alcohol', label: 'Алкоголь' },
                  { value: 'caffeine', label: 'Кофеин' },
                  { value: 'spicy_food', label: 'Острая пища' }
                ].map((trigger) => (
                  <div key={trigger.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={trigger.value}
                      checked={data.hotFlashes.triggers?.includes(trigger.value) || false}
                      onCheckedChange={(checked) => {
                        const currentTriggers = data.hotFlashes.triggers || [];
                        const newTriggers = checked
                          ? [...currentTriggers, trigger.value]
                          : currentTriggers.filter(t => t !== trigger.value);
                        updateHotFlashTriggers(newTriggers);
                      }}
                    />
                    <Label htmlFor={trigger.value}>{trigger.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Night Sweats */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Ночная потливость</h3>
        <SymptomFrequencySelector
          label="Как часто вы просыпаетесь от потливости?"
          value={data.nightSweats.frequency}
          onChange={(frequency) => updateSymptomFrequency('nightSweats', frequency)}
        />
        {data.nightSweats.frequency !== 'never' && (
          <SeverityScale
            label="Насколько сильная ночная потливость?"
            value={data.nightSweats.severity}
            onChange={(severity) => updateSymptomSeverity('nightSweats', severity)}
          />
        )}
      </div>

      {/* Sleep Problems */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Проблемы со сном</h3>
        <SymptomFrequencySelector
          label="Как часто у вас проблемы со сном?"
          value={data.sleepProblems.frequency}
          onChange={(frequency) => updateComplexSymptom('sleepProblems', 'frequency', frequency)}
        />
        {data.sleepProblems.frequency !== 'never' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Какие именно проблемы? (можно выбрать несколько)</Label>
              <div className="space-y-2">
                {[
                  { value: 'difficulty_falling_asleep', label: 'Трудно заснуть' },
                  { value: 'frequent_waking', label: 'Частые пробуждения' },
                  { value: 'early_waking', label: 'Раннее пробуждение' }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={data.sleepProblems.types.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked
                          ? [...data.sleepProblems.types, option.value]
                          : data.sleepProblems.types.filter(t => t !== option.value);
                        updateComplexSymptom('sleepProblems', 'types', newTypes);
                      }}
                    />
                    <Label htmlFor={option.value}>{option.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sleep Quality Scale */}
            <SeverityScale
              label="Как бы вы оценили качество своего сна?"
              value={data.sleepProblems.sleepQuality || 7}
              onChange={(quality) => updateComplexSymptom('sleepProblems', 'sleepQuality', quality)}
            />
          </div>
        )}
      </div>

      {/* Mood Changes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Изменения настроения</h3>
        <SymptomFrequencySelector
          label="Как часто вы замечаете перепады настроения?"
          value={data.moodChanges.frequency}
          onChange={(frequency) => updateComplexSymptom('moodChanges', 'frequency', frequency)}
        />
        {data.moodChanges.frequency !== 'never' && (
          <div className="space-y-3">
            <Label>Какие изменения настроения? (можно выбрать несколько)</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'irritability', label: 'Раздражительность' },
                { value: 'anxiety', label: 'Тревожность' },
                { value: 'depression', label: 'Подавленность' },
                { value: 'mood_swings', label: 'Резкие перепады' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={data.moodChanges.types.includes(option.value)}
                    onCheckedChange={(checked) => {
                      const newTypes = checked
                        ? [...data.moodChanges.types, option.value]
                        : data.moodChanges.types.filter(t => t !== option.value);
                      updateComplexSymptom('moodChanges', 'types', newTypes);
                    }}
                  />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Physical Symptoms */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Физические симптомы</h3>
        <Label>Какие физические симптомы вы испытываете? (можно выбрать несколько)</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'joint_pain', label: 'Боли в суставах' },
            { value: 'headaches', label: 'Головные боли' },
            { value: 'fatigue', label: 'Усталость' },
            { value: 'weight_gain', label: 'Набор веса' },
            { value: 'dry_skin', label: 'Сухость кожи' }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={data.physicalSymptoms.includes(option.value)}
                disabled={data.physicalSymptoms.includes('none_of_the_above')}
                onCheckedChange={(checked) => {
                  const newSymptoms = toggleArrayItem(data.physicalSymptoms, option.value);
                  updateField('physicalSymptoms', newSymptoms);
                }}
              />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="physical_none"
              checked={data.physicalSymptoms.includes('none_of_the_above')}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('physicalSymptoms', ['none_of_the_above']);
                } else {
                  updateField('physicalSymptoms', []);
                }
              }}
            />
            <Label htmlFor="physical_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>

      {/* Cognitive Symptoms */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Когнитивные симптомы</h3>
        <Label>Замечаете ли вы изменения в мышлении? (можно выбрать несколько)</Label>
        <div className="space-y-2">
          {[
            { value: 'memory_issues', label: 'Проблемы с памятью' },
            { value: 'concentration_problems', label: 'Трудности с концентрацией' },
            { value: 'brain_fog', label: 'Туман в голове' }
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={data.cognitiveSymptoms.includes(option.value)}
                disabled={data.cognitiveSymptoms.includes('none_of_the_above')}
                onCheckedChange={(checked) => {
                  const newSymptoms = toggleArrayItem(data.cognitiveSymptoms, option.value);
                  updateField('cognitiveSymptoms', newSymptoms);
                }}
              />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cognitive_none"
              checked={data.cognitiveSymptoms.includes('none_of_the_above')}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('cognitiveSymptoms', ['none_of_the_above']);
                } else {
                  updateField('cognitiveSymptoms', []);
                }
              }}
            />
            <Label htmlFor="cognitive_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <p>
          ✅ <strong>Готово!</strong> Вы заполнили все необходимые разделы о симптомах. 
          Эта информация поможет создать персонализированные рекомендации для вашего здоровья.
        </p>
      </div>
    </div>
  );
};
