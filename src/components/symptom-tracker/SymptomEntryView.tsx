
import React from 'react';
import { cn } from '@/lib/utils';

interface SymptomEntryViewProps {
  entry: any | null;
  date: string;
  onEdit: () => void;
}

export const SymptomEntryView: React.FC<SymptomEntryViewProps> = ({
  entry,
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

  return (
    <div className="bloom-card p-6 bg-white/90 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-playfair font-bold gentle-text">
          Запись за {new Date(entry.date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h2>
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
            <strong>Количество:</strong> {entry.hotFlashes?.count || 0}
          </p>
          <p className="text-sm soft-text">
            <strong>Интенсивность:</strong> {getScaleLabel(entry.hotFlashes?.severity || 1, severityLabels)}
          </p>
        </div>

        {/* Ночная потливость */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
          <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
            💦 Ночная потливость
          </h3>
          <p className="text-sm soft-text">
            <strong>Наличие:</strong> {entry.nightSweats?.occurred ? 'Да' : 'Нет'}
          </p>
          {entry.nightSweats?.occurred && (
            <p className="text-sm soft-text">
              <strong>Интенсивность:</strong> {getScaleLabel(entry.nightSweats.severity, severityLabels)}
            </p>
          )}
        </div>

        {/* Сон */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
          <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
            😴 Сон
          </h3>
          <p className="text-sm soft-text">
            <strong>Часов сна:</strong> {entry.sleep?.hoursSlept || 0}
          </p>
          <p className="text-sm soft-text">
            <strong>Качество:</strong> {getScaleLabel(entry.sleep?.quality || 3, moodLabels)}
          </p>
        </div>

        {/* Настроение */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
          <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
            😊 Настроение
          </h3>
          <p className="text-sm soft-text">
            <strong>Общее:</strong> {getScaleLabel(entry.mood?.overall || 3, moodLabels)}
          </p>
          <p className="text-sm soft-text">
            <strong>Тревожность:</strong> {getScaleLabel(entry.mood?.anxiety || 1, severityLabels)}
          </p>
          <p className="text-sm soft-text">
            <strong>Раздражительность:</strong> {getScaleLabel(entry.mood?.irritability || 1, severityLabels)}
          </p>
        </div>

        {/* Энергия */}
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
          <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
            ⚡ Энергия
          </h3>
          <p className="text-sm soft-text">
            <strong>Уровень:</strong> {getScaleLabel(entry.energy || 3, energyLabels)}
          </p>
        </div>

        {/* Физические симптомы */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-4 interactive-hover shadow-gentle">
          <h3 className="text-lg font-semibold gentle-text mb-3 flex items-center">
            🏃‍♀️ Физические симптомы
          </h3>
          {entry.physicalSymptoms && entry.physicalSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entry.physicalSymptoms.map((symptom: string) => (
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
  );
};
