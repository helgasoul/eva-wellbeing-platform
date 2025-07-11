import React from 'react';
import { cn } from '@/lib/utils';
import type { SymptomEntry } from '@/types/healthData';

interface SymptomEntryViewProps {
  entry: SymptomEntry | null;
  entries?: SymptomEntry[]; // Все записи за день
  date: string;
  onEdit: () => void;
}

export const SymptomEntryView: React.FC<SymptomEntryViewProps> = ({
  entry,
  entries,
  date,
  onEdit
}) => {
  if (!entry) {
    return (
      <div className="bloom-card p-8 text-center bg-white/90 backdrop-blur-sm">
        <div className="text-6xl mb-4 animate-gentle-float">📝</div>
        <h3 className="text-xl font-semibold gentle-text mb-2">
          Нет записи за эту дату
        </h3>
        <p className="soft-text mb-6 leading-relaxed">
          Создайте запись, чтобы отследить свои симптомы за{' '}
          {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </p>
        <button
          onClick={onEdit}
          className="bloom-button interactive-hover"
        >
          Создать запись
        </button>
      </div>
    );
  }

  const getScaleLabel = (value: number, labels: string[]) => {
    return labels[value - 1] || 'Не указано';
  };

  const severityLabels = ['Легкая', 'Умеренная', 'Средняя', 'Сильная', 'Очень сильная'];
  const moodLabels = ['Очень плохое', 'Плохое', 'Нейтральное', 'Хорошее', 'Отличное'];
  const energyLabels = ['Очень низкий', 'Низкий', 'Средний', 'Высокий', 'Очень высокий'];

  const physicalSymptomsMap: { [key: string]: string } = {
    'headache': 'Головная боль',
    'joint_pain': 'Боль в суставах',
    'fatigue': 'Усталость',
    'bloating': 'Вздутие',
    'breast_tenderness': 'Болезненность груди',
    'weight_gain': 'Увеличение веса'
  };

  // Получаем все записи за день для отображения
  const dayEntries = entries?.filter(e => e.entry_date === entry.entry_date) || [entry];

  return (
    <div className="space-y-6">
      {/* Если есть несколько записей за день, показываем список */}
      {dayEntries.length > 1 && (
        <div className="bloom-card p-4">
          <h3 className="text-lg font-semibold gentle-text mb-4">
            📋 Записи за {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('ru-RU')}
          </h3>
          <div className="grid gap-2">
            {dayEntries
              .sort((a, b) => (b.entry_time || '00:00:00').localeCompare(a.entry_time || '00:00:00'))
              .map((dayEntry, index) => (
              <div key={dayEntry.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-primary">
                    {(dayEntry.entry_time || '12:00:00').substring(0, 5)}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    {dayEntry.hot_flashes?.count ? `🔥 ${dayEntry.hot_flashes.count}` : ''}
                    {dayEntry.night_sweats?.occurred ? ' 💦' : ''}
                    {dayEntry.energy_level && dayEntry.energy_level <= 2 ? ' ⚡↓' : ''}
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-xs text-muted-foreground">Последняя</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Основная карточка с деталями записи */}
      <div className="bloom-card p-6 bg-white/90 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-playfair font-bold gentle-text">
              Запись за {new Date(entry.entry_date + 'T00:00:00').toLocaleDateString('ru-RU')}
            </h2>
            {entry.entry_time && (
              <p className="text-muted-foreground">
                Время: {entry.entry_time.substring(0, 5)}
              </p>
            )}
          </div>
          <button
            onClick={onEdit}
            className="bloom-button interactive-hover"
          >
            Редактировать
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Приливы */}
          <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              🔥 Приливы
            </h3>
            <p className="text-sm soft-text">
              <strong>Количество:</strong> {entry.hot_flashes?.count || 0}
            </p>
            <p className="text-sm soft-text">
              <strong>Интенсивность:</strong> {getScaleLabel(entry.hot_flashes?.severity || 1, severityLabels)}
            </p>
          </div>

          {/* Ночная потливость */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              💦 Ночная потливость
            </h3>
            <p className="text-sm soft-text">
              <strong>Наличие:</strong> {entry.night_sweats?.occurred ? 'Да' : 'Нет'}
            </p>
            {entry.night_sweats?.occurred && (
              <p className="text-sm soft-text">
                <strong>Интенсивность:</strong> {getScaleLabel(entry.night_sweats.severity, severityLabels)}
              </p>
            )}
          </div>

          {/* Сон */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              😴 Сон
            </h3>
            <p className="text-sm soft-text">
              <strong>Часов сна:</strong> {entry.sleep_data?.hours_slept || 0}
            </p>
            <p className="text-sm soft-text">
              <strong>Качество:</strong> {getScaleLabel(entry.sleep_data?.quality || 3, moodLabels)}
            </p>
          </div>

          {/* Настроение */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              😊 Настроение
            </h3>
            <p className="text-sm soft-text">
              <strong>Общее:</strong> {getScaleLabel(entry.mood_data?.overall || 3, moodLabels)}
            </p>
            <p className="text-sm soft-text">
              <strong>Тревожность:</strong> {getScaleLabel(entry.mood_data?.anxiety || 1, severityLabels)}
            </p>
            <p className="text-sm soft-text">
              <strong>Раздражительность:</strong> {getScaleLabel(entry.mood_data?.irritability || 1, severityLabels)}
            </p>
          </div>

          {/* Энергия */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              ⚡ Энергия
            </h3>
            <p className="text-sm soft-text">
              <strong>Уровень:</strong> {getScaleLabel(entry.energy_level || 3, energyLabels)}
            </p>
          </div>

          {/* Физические симптомы */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              🏃‍♀️ Физические симптомы
            </h3>
            {entry.physical_symptoms && entry.physical_symptoms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {entry.physical_symptoms.map((symptom: string) => (
                  <span key={symptom} className="bg-orange-200/70 text-orange-800 px-2 py-1 rounded text-xs interactive-hover">
                    {physicalSymptomsMap[symptom] || symptom.replace('_', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm soft-text">Нет отмеченных симптомов</p>
            )}
          </div>
        </div>

        {/* Заметки */}
        {entry.notes && (
          <div className="mt-6 bg-gradient-to-br from-bloom-vanilla to-bloom-warm-cream rounded-lg p-4 shadow-gentle">
            <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
              📝 Заметки
            </h3>
            <p className="gentle-text leading-relaxed">{entry.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};