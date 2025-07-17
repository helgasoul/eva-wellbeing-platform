
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { SeverityScale } from '@/components/onboarding/SeverityScale';
import { MedicalHistory } from '@/types/onboarding';
import { Plus, X } from 'lucide-react';

interface MedicalHistoryStepProps {
  data?: MedicalHistory;
  onChange: (data: MedicalHistory) => void;
}

const defaultData: MedicalHistory = {
  currentMedications: [],
  isOnHRT: false,
  chronicConditions: [],
  familyHistory: {
    breastCancer: false,
    ovairianCancer: false,
    heartDisease: false,
    osteoporosis: false,
    earlyMenopause: false,
    noneOfTheAbove: false
  },
  surgicalHistory: []
};

export const MedicalHistoryStep: React.FC<MedicalHistoryStepProps> = ({ 
  data = defaultData, 
  onChange 
}) => {
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });

  const updateField = (field: keyof MedicalHistory, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      updateField('currentMedications', [...data.currentMedications, newMedication]);
      setNewMedication({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeMedication = (index: number) => {
    const updated = data.currentMedications.filter((_, i) => i !== index);
    updateField('currentMedications', updated);
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const updateFamilyHistory = (condition: keyof typeof data.familyHistory, value: boolean) => {
    updateField('familyHistory', {
      ...data.familyHistory,
      [condition]: value
    });
  };

  return (
    <div className="space-y-8">
      {/* Current Medications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Текущие препараты</h3>
        
        {/* Medication List */}
        {data.currentMedications.length > 0 && (
          <div className="space-y-2">
            {data.currentMedications.map((med, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {med.dosage} - {med.frequency}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Medication */}
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Название препарата"
            value={newMedication.name}
            onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
          />
          <Input
            placeholder="Дозировка"
            value={newMedication.dosage}
            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
          />
          <Input
            placeholder="Частота приема"
            value={newMedication.frequency}
            onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
          />
        </div>
        <Button onClick={addMedication} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Добавить препарат
        </Button>
      </div>

      {/* HRT */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isOnHRT"
            checked={data.isOnHRT}
            onCheckedChange={(checked) => updateField('isOnHRT', checked)}
          />
          <Label htmlFor="isOnHRT">Принимаю заместительную гормональную терапию (ЗГТ)</Label>
        </div>

        {data.isOnHRT && (
          <div className="ml-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hrtType">Тип ЗГТ</Label>
              <Input
                id="hrtType"
                placeholder="Например, эстрогель + утрожестан"
                value={data.hrtDetails?.type || ''}
                onChange={(e) => updateField('hrtDetails', {
                  ...data.hrtDetails,
                  type: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hrtStartDate">Дата начала ЗГТ</Label>
              <Input
                id="hrtStartDate"
                type="date"
                value={data.hrtDetails?.startDate || ''}
                onChange={(e) => updateField('hrtDetails', {
                  ...data.hrtDetails,
                  startDate: e.target.value
                })}
              />
            </div>
            <SeverityScale
              label="Насколько вы довольны эффектом ЗГТ?"
              value={data.hrtDetails?.satisfaction || 5}
              onChange={(satisfaction) => updateField('hrtDetails', {
                ...data.hrtDetails,
                satisfaction
              })}
            />
          </div>
        )}
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Хронические заболевания</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'diabetes', label: 'Диабет' },
            { value: 'hypertension', label: 'Гипертония' },
            { value: 'thyroid', label: 'Заболевания щитовидной железы' },
            { value: 'heart_disease', label: 'Заболевания сердца' }
          ].map((condition) => (
            <div key={condition.value} className="flex items-center space-x-2">
              <Checkbox
                id={condition.value}
                checked={data.chronicConditions.includes(condition.value)}
                disabled={data.chronicConditions.includes('none_of_the_above')}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.chronicConditions, condition.value);
                  updateField('chronicConditions', updated);
                }}
              />
              <Label htmlFor={condition.value}>{condition.label}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="chronic_none"
              checked={data.chronicConditions.includes('none_of_the_above')}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('chronicConditions', ['none_of_the_above']);
                } else {
                  updateField('chronicConditions', []);
                }
              }}
            />
            <Label htmlFor="chronic_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>

      {/* Family History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Семейная история</h3>
        <div className="space-y-2">
          {[
            { key: 'breastCancer', label: 'Рак молочной железы' },
            { key: 'ovairianCancer', label: 'Рак яичников' },
            { key: 'heartDisease', label: 'Заболевания сердца' },
            { key: 'osteoporosis', label: 'Остеопороз' },
            { key: 'earlyMenopause', label: 'Ранняя менопауза (до 45 лет)' }
          ].map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={data.familyHistory[item.key as keyof typeof data.familyHistory]}
                disabled={data.familyHistory.noneOfTheAbove}
                onCheckedChange={(checked) => updateFamilyHistory(
                  item.key as keyof typeof data.familyHistory, 
                  !!checked
                )}
              />
              <Label htmlFor={item.key}>{item.label}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="family_none"
              checked={data.familyHistory.noneOfTheAbove}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('familyHistory', {
                    breastCancer: false,
                    ovairianCancer: false,
                    heartDisease: false,
                    osteoporosis: false,
                    earlyMenopause: false,
                    noneOfTheAbove: true
                  });
                } else {
                  updateFamilyHistory('noneOfTheAbove', false);
                }
              }}
            />
            <Label htmlFor="family_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>

      {/* Surgical History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">Хирургические вмешательства</h3>
        <div className="space-y-2">
          {[
            { value: 'hysterectomy', label: 'Удаление матки' },
            { value: 'ovary_removal', label: 'Удаление яичников' },
            { value: 'breast_surgery', label: 'Операции на молочной железе' }
          ].map((surgery) => (
            <div key={surgery.value} className="flex items-center space-x-2">
              <Checkbox
                id={surgery.value}
                checked={data.surgicalHistory.includes(surgery.value)}
                disabled={data.surgicalHistory.includes('none_of_the_above')}
                onCheckedChange={(checked) => {
                  const updated = toggleArrayItem(data.surgicalHistory, surgery.value);
                  updateField('surgicalHistory', updated);
                }}
              />
              <Label htmlFor={surgery.value}>{surgery.label}</Label>
            </div>
          ))}
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="surgical_none"
              checked={data.surgicalHistory.includes('none_of_the_above')}
              onCheckedChange={(checked) => {
                if (checked) {
                  updateField('surgicalHistory', ['none_of_the_above']);
                } else {
                  updateField('surgicalHistory', []);
                }
              }}
            />
            <Label htmlFor="surgical_none" className="text-muted-foreground">
              Ничего из перечисленного
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
