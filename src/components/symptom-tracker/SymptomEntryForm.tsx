
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SymptomEntryFormProps {
  date: string;
  entry: any | null;
  onSave: (entry: any) => void;
  onCancel: () => void;
}

export const SymptomEntryForm: React.FC<SymptomEntryFormProps> = ({
  date,
  entry,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    hotFlashes: {
      count: 0,
      severity: 1,
      triggers: [] as string[]
    },
    nightSweats: {
      occurred: false,
      severity: 1
    },
    sleep: {
      hoursSlept: 7,
      quality: 3,
      fallAsleepTime: '',
      wakeUpTime: ''
    },
    mood: {
      overall: 3,
      anxiety: 1,
      irritability: 1
    },
    physicalSymptoms: [] as string[],
    energy: 3,
    notes: '',
    time: new Date().toTimeString().split(' ')[0].substring(0, 5) // HH:MM
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        hotFlashes: entry.hotFlashes || { count: 0, severity: 1, triggers: [] },
        nightSweats: entry.nightSweats || { occurred: false, severity: 1 },
        sleep: entry.sleep || { hoursSlept: 7, quality: 3, fallAsleepTime: '', wakeUpTime: '' },
        mood: entry.mood || { overall: 3, anxiety: 1, irritability: 1 },
        physicalSymptoms: entry.physicalSymptoms || [],
        energy: entry.energy || 3,
        notes: entry.notes || '',
        time: entry.time || new Date().toTimeString().split(' ')[0].substring(0, 5)
      });
    }
  }, [entry]);

  const handleSave = () => {
    const newEntry = {
      id: entry?.id || Date.now().toString(),
      date,
      ...formData,
      createdAt: entry?.createdAt || new Date().toISOString()
    };
    onSave(newEntry);
  };

  const ScaleSelector = ({ 
    value, 
    onChange, 
    labels, 
    colors = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100']
  }: {
    value: number;
    onChange: (value: number) => void;
    labels: string[];
    colors?: string[];
  }) => (
    <div className="flex space-x-2">
      {labels.map((label, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(index + 1)}
          className={cn(
            "flex-1 p-2 rounded-lg text-sm font-medium transition-colors",
            value === index + 1
              ? `${colors[index]} border-2 border-primary`
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {index + 1}
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="bloom-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-playfair font-bold text-foreground">
          Запись за {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h2>
        <button
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="space-y-8">
        {/* Время записи */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">🕐 Время записи</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Время
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full p-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  time: new Date().toTimeString().split(' ')[0].substring(0, 5) 
                })}
                className="px-4 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                Сейчас
              </button>
            </div>
          </div>
        </div>
        {/* Приливы */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">🔥 Приливы</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Количество приливов
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.hotFlashes.count}
                onChange={(e) => setFormData({
                  ...formData,
                  hotFlashes: {
                    ...formData.hotFlashes,
                    count: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Интенсивность (в среднем)
              </label>
              <ScaleSelector
                value={formData.hotFlashes.severity}
                onChange={(value) => setFormData({
                  ...formData,
                  hotFlashes: { ...formData.hotFlashes, severity: value }
                })}
                labels={['Легкая', 'Умеренная', 'Средняя', 'Сильная', 'Очень сильная']}
              />
            </div>
          </div>
        </div>

        {/* Ночная потливость */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">💦 Ночная потливость</h3>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.nightSweats.occurred}
                onChange={(e) => setFormData({
                  ...formData,
                  nightSweats: {
                    ...formData.nightSweats,
                    occurred: e.target.checked
                  }
                })}
                className="mr-3"
              />
              <span>Была ночная потливость</span>
            </label>
            
            {formData.nightSweats.occurred && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Интенсивность
                </label>
                <ScaleSelector
                  value={formData.nightSweats.severity}
                  onChange={(value) => setFormData({
                    ...formData,
                    nightSweats: { ...formData.nightSweats, severity: value }
                  })}
                  labels={['Легкая', 'Умеренная', 'Средняя', 'Сильная', 'Очень сильная']}
                />
              </div>
            )}
          </div>
        </div>

        {/* Сон */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">😴 Сон</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Часов сна
              </label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep.hoursSlept}
                onChange={(e) => setFormData({
                  ...formData,
                  sleep: {
                    ...formData.sleep,
                    hoursSlept: parseFloat(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Качество сна
              </label>
              <ScaleSelector
                value={formData.sleep.quality}
                onChange={(value) => setFormData({
                  ...formData,
                  sleep: { ...formData.sleep, quality: value }
                })}
                labels={['Очень плохое', 'Плохое', 'Среднее', 'Хорошее', 'Отличное']}
              />
            </div>
          </div>
        </div>

        {/* Настроение */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">😊 Настроение</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Общее настроение
              </label>
              <ScaleSelector
                value={formData.mood.overall}
                onChange={(value) => setFormData({
                  ...formData,
                  mood: { ...formData.mood, overall: value }
                })}
                labels={['Очень плохое', 'Плохое', 'Нейтральное', 'Хорошее', 'Отличное']}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Уровень тревожности
                </label>
                <ScaleSelector
                  value={formData.mood.anxiety}
                  onChange={(value) => setFormData({
                    ...formData,
                    mood: { ...formData.mood, anxiety: value }
                  })}
                  labels={['Нет', 'Легкая', 'Умеренная', 'Высокая', 'Очень высокая']}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Раздражительность
                </label>
                <ScaleSelector
                  value={formData.mood.irritability}
                  onChange={(value) => setFormData({
                    ...formData,
                    mood: { ...formData.mood, irritability: value }
                  })}
                  labels={['Нет', 'Легкая', 'Умеренная', 'Высокая', 'Очень высокая']}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Физические симптомы */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">🏃‍♀️ Физические симптомы</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'headache', label: 'Головная боль', icon: '🤕' },
              { id: 'joint_pain', label: 'Боль в суставах', icon: '🦴' },
              { id: 'fatigue', label: 'Усталость', icon: '😴' },
              { id: 'bloating', label: 'Вздутие', icon: '🤰' },
              { id: 'breast_tenderness', label: 'Болезненность груди', icon: '🤱' },
              { id: 'weight_gain', label: 'Увеличение веса', icon: '⚖️' }
            ].map(symptom => (
              <label key={symptom.id} className="flex items-center p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.physicalSymptoms.includes(symptom.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        physicalSymptoms: [...formData.physicalSymptoms, symptom.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        physicalSymptoms: formData.physicalSymptoms.filter(s => s !== symptom.id)
                      });
                    }
                  }}
                  className="mr-3"
                />
                <span className="mr-2">{symptom.icon}</span>
                <span className="text-sm">{symptom.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Уровень энергии */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">⚡ Уровень энергии</h3>
          <ScaleSelector
            value={formData.energy}
            onChange={(value) => setFormData({ ...formData, energy: value })}
            labels={['Очень низкий', 'Низкий', 'Средний', 'Высокий', 'Очень высокий']}
          />
        </div>

        {/* Заметки */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">📝 Заметки</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Добавьте любые дополнительные заметки о вашем самочувствии..."
            rows={4}
            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
          />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-border">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};
