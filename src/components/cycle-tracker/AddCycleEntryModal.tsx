import React, { useState } from 'react';
import { cn } from '@/lib/utils';

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
  const [step, setStep] = useState<'type' | 'details' | 'symptoms'>('type');
  const [entryData, setEntryData] = useState<Partial<MenstrualEntry>>({
    date,
    type: 'menstruation',
    flow: 'normal',
    symptoms: {
      cramping: 1,
      breast_tenderness: 1,
      bloating: 1,
      mood_changes: 1,
      headache: false,
      back_pain: false
    },
    notes: ''
  });

  const entryTypes = [
    {
      type: 'menstruation' as const,
      title: 'Менструация',
      description: 'Начало или день менструации',
      icon: '🔴',
      color: 'bg-red-50 border-red-300'
    },
    {
      type: 'spotting' as const,
      title: 'Кровянистые выделения',
      description: 'Мажущие выделения вне менструации',
      icon: '🟤',
      color: 'bg-orange-50 border-orange-300'
    },
    {
      type: 'ovulation_predicted' as const,
      title: 'Овуляция',
      description: 'Признаки или день овуляции',
      icon: '🌕',
      color: 'bg-yellow-50 border-yellow-300'
    },
    {
      type: 'missed_expected' as const,
      title: 'Пропущенная менструация',
      description: 'Ожидаемая, но не наступившая менструация',
      icon: '⚪',
      color: 'bg-gray-50 border-gray-300'
    }
  ];

  const handleSave = () => {
    const newEntry: MenstrualEntry = {
      id: Date.now().toString(),
      date: entryData.date!,
      type: entryData.type!,
      flow: entryData.flow || null,
      symptoms: entryData.symptoms!,
      notes: entryData.notes,
      created_at: new Date().toISOString()
    };

    onSave(newEntry);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Запись за {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl hover-scale"
          >
            ✕
          </button>
        </div>

        {/* Прогресс */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {['type', 'details', 'symptoms'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === stepName ? "bg-pink-500 text-white" :
                  index < ['type', 'details', 'symptoms'].indexOf(step) ? "bg-green-500 text-white" :
                  "bg-gray-200 text-gray-600"
                )}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={cn(
                    "w-12 h-1 mx-2 transition-colors",
                    index < ['type', 'details', 'symptoms'].indexOf(step) ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Что отметить за этот день?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entryTypes.map(type => (
                    <button
                      key={type.type}
                      onClick={() => setEntryData(prev => ({ ...prev, type: type.type }))}
                      className={cn(
                        "text-left p-4 border-2 rounded-xl transition-all hover-scale",
                        entryData.type === type.type 
                          ? "border-pink-500 bg-pink-50" 
                          : type.color + " hover:border-pink-300"
                      )}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{type.icon}</span>
                        <div className="font-semibold text-gray-800">{type.title}</div>
                      </div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setStep('details')}
                  disabled={!entryData.type}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 hover-scale"
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6 animate-fade-in">
              {entryData.type === 'menstruation' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Детали менструации
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Интенсивность выделений
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'light' as const, label: 'Легкая', icon: '💧', color: 'bg-blue-100' },
                          { value: 'normal' as const, label: 'Обычная', icon: '💧💧', color: 'bg-blue-200' },
                          { value: 'heavy' as const, label: 'Обильная', icon: '💧💧💧', color: 'bg-blue-300' },
                          { value: 'very_heavy' as const, label: 'Очень обильная', icon: '💧💧💧💧', color: 'bg-red-200' }
                        ].map(flow => (
                          <button
                            key={flow.value}
                            onClick={() => setEntryData(prev => ({ ...prev, flow: flow.value }))}
                            className={cn(
                              "p-3 border-2 rounded-lg transition-all text-center hover-scale",
                              entryData.flow === flow.value 
                                ? "border-pink-500 bg-pink-50" 
                                : `border-gray-200 ${flow.color} hover:border-pink-300`
                            )}
                          >
                            <div className="text-lg mb-1">{flow.icon}</div>
                            <div className="text-xs font-medium">{flow.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {entryData.type === 'ovulation_predicted' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Признаки овуляции
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'cervical_mucus', label: 'Изменения выделений', icon: '💧' },
                      { id: 'ovulation_pain', label: 'Овуляторная боль', icon: '⚡' },
                      { id: 'increased_libido', label: 'Повышение либидо', icon: '💝' },
                      { id: 'breast_changes', label: 'Изменения груди', icon: '🤱' }
                    ].map(sign => (
                      <label key={sign.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="checkbox" className="mr-3" />
                        <span className="mr-2">{sign.icon}</span>
                        <span className="text-sm">{sign.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('type')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors hover-scale"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setStep('symptoms')}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors hover-scale"
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {step === 'symptoms' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Сопутствующие симптомы
              </h3>

              {/* Шкалы симптомов */}
              <div className="space-y-4">
                {[
                  { key: 'cramping' as keyof MenstrualEntry['symptoms'], label: 'Спазмы/боли', icon: '⚡' },
                  { key: 'breast_tenderness' as keyof MenstrualEntry['symptoms'], label: 'Болезненность груди', icon: '🤱' },
                  { key: 'bloating' as keyof MenstrualEntry['symptoms'], label: 'Вздутие живота', icon: '🫄' },
                  { key: 'mood_changes' as keyof MenstrualEntry['symptoms'], label: 'Изменения настроения', icon: '😔' }
                ].map(symptom => (
                  <div key={symptom.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">{symptom.icon}</span>
                      {symptom.label}
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => setEntryData(prev => ({
                            ...prev,
                            symptoms: { ...prev.symptoms!, [symptom.key]: level }
                          }))}
                          className={cn(
                            "flex-1 p-2 rounded-lg text-sm font-medium transition-all hover-scale",
                            entryData.symptoms?.[symptom.key] === level
                              ? "bg-pink-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Нет</span>
                      <span>Сильно</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Дополнительные симптомы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительные симптомы
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'headache' as keyof MenstrualEntry['symptoms'], label: 'Головная боль', icon: '🤕' },
                    { key: 'back_pain' as keyof MenstrualEntry['symptoms'], label: 'Боль в спине', icon: '🦴' }
                  ].map(symptom => (
                    <label key={symptom.key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={entryData.symptoms?.[symptom.key] as boolean || false}
                        onChange={(e) => setEntryData(prev => ({
                          ...prev,
                          symptoms: { ...prev.symptoms!, [symptom.key]: e.target.checked }
                        }))}
                        className="mr-3"
                      />
                      <span className="mr-2">{symptom.icon}</span>
                      <span className="text-sm">{symptom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Заметки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительные заметки
                </label>
                <textarea
                  value={entryData.notes}
                  onChange={(e) => setEntryData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Любые дополнительные наблюдения..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep('details')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors hover-scale"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleSave}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors hover-scale"
                >
                  💾 Сохранить запись
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};