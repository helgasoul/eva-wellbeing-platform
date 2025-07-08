import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MenstrualEntry {
  id: string;
  date: string;
  type: 'menstruation' | 'spotting' | 'missed_expected' | 'ovulation_predicted';
  flow: 'light' | 'normal' | 'heavy' | 'very_heavy' | null;
  duration_days?: number;
  symptoms: {
    cramping: number;
    breast_tenderness: number;
    bloating: number;
    mood_changes: number;
    headache: boolean;
    back_pain: boolean;
  };
  notes?: string;
  created_at: string;
}

interface AddCycleEntryModalProps {
  date: string;
  onClose: () => void;
  onSave: (entry: MenstrualEntry) => void;
}

export const AddCycleEntryModal: React.FC<AddCycleEntryModalProps> = ({
  date,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    type: 'menstruation' as const,
    flow: 'normal' as const,
    duration_days: 1,
    symptoms: {
      cramping: 0,
      breast_tenderness: 0,
      bloating: 0,
      mood_changes: 0,
      headache: false,
      back_pain: false,
    },
    notes: ''
  });

  const handleSave = () => {
    const entry: MenstrualEntry = {
      id: crypto.randomUUID(),
      date: date,
      type: formData.type,
      flow: formData.type === 'menstruation' ? formData.flow : null,
      duration_days: formData.duration_days,
      symptoms: formData.symptoms,
      notes: formData.notes,
      created_at: new Date().toISOString()
    };

    onSave(entry);
  };

  const updateSymptom = (symptom: string, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: value
      }
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить запись о цикле</DialogTitle>
          <p className="text-sm text-gray-600">
            Дата: {new Date(date).toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Тип записи */}
          <div className="space-y-2">
            <Label>Тип записи</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menstruation">🩸 Менструация</SelectItem>
                <SelectItem value="spotting">💧 Кровянистые выделения</SelectItem>
                <SelectItem value="ovulation_predicted">🥚 Овуляция (предполагаемая)</SelectItem>
                <SelectItem value="missed_expected">❌ Пропущенная ожидаемая</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Интенсивность (только для менструации) */}
          {formData.type === 'menstruation' && (
            <div className="space-y-2">
              <Label>Интенсивность потока</Label>
              <Select value={formData.flow} onValueChange={(value: any) => setFormData(prev => ({ ...prev, flow: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">💧 Слабые</SelectItem>
                  <SelectItem value="normal">🩸 Обычные</SelectItem>
                  <SelectItem value="heavy">🩸🩸 Обильные</SelectItem>
                  <SelectItem value="very_heavy">🩸🩸🩸 Очень обильные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Продолжительность */}
          <div className="space-y-2">
            <Label>Продолжительность (дни)</Label>
            <Input
              type="number"
              min="1"
              max="15"
              value={formData.duration_days}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
            />
          </div>

          {/* Симптомы */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Симптомы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Слайдеры для интенсивности симптомов */}
              <div className="space-y-4">
                <div>
                  <Label className="flex justify-between">
                    <span>Спазмы/боли</span>
                    <span className="text-sm text-gray-500">{formData.symptoms.cramping}/5</span>
                  </Label>
                  <Slider
                    value={[formData.symptoms.cramping]}
                    onValueChange={(value) => updateSymptom('cramping', value[0])}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex justify-between">
                    <span>Болезненность груди</span>
                    <span className="text-sm text-gray-500">{formData.symptoms.breast_tenderness}/5</span>
                  </Label>
                  <Slider
                    value={[formData.symptoms.breast_tenderness]}
                    onValueChange={(value) => updateSymptom('breast_tenderness', value[0])}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex justify-between">
                    <span>Вздутие живота</span>
                    <span className="text-sm text-gray-500">{formData.symptoms.bloating}/5</span>
                  </Label>
                  <Slider
                    value={[formData.symptoms.bloating]}
                    onValueChange={(value) => updateSymptom('bloating', value[0])}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="flex justify-between">
                    <span>Изменения настроения</span>
                    <span className="text-sm text-gray-500">{formData.symptoms.mood_changes}/5</span>
                  </Label>
                  <Slider
                    value={[formData.symptoms.mood_changes]}
                    onValueChange={(value) => updateSymptom('mood_changes', value[0])}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Чекбоксы для да/нет симптомов */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headache"
                    checked={formData.symptoms.headache}
                    onCheckedChange={(checked) => updateSymptom('headache', !!checked)}
                  />
                  <Label htmlFor="headache">Головная боль</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="back_pain"
                    checked={formData.symptoms.back_pain}
                    onCheckedChange={(checked) => updateSymptom('back_pain', !!checked)}
                  />
                  <Label htmlFor="back_pain">Боль в спине</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Заметки */}
          <div className="space-y-2">
            <Label>Дополнительные заметки</Label>
            <Textarea
              placeholder="Опишите особенности этого дня, настроение, активность..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Отмена
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Сохранить запись
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};