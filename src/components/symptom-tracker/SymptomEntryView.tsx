
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
      <div className="bloom-card p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Нет записи за эту дату
        </h3>
        <p className="text-muted-foreground mb-6">
          Создайте запись, чтобы отследить свои симптомы за{' '}
          {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </p>
        <button
          onClick={onEdit}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
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
    <div className="bloom-card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-playfair font-bold text-foreground">
          Запись за {new Date(entry.date + 'T00:00:00').toLocaleDateString('ru-RU')}
        </h2>
        <button
          onClick={onEdit}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Редактировать
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Приливы */}
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            🔥 Приливы
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Количество:</strong> {entry.hotFlashes?.count || 0}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Интенсивность:</strong> {getScaleLabel(entry.hotFlashes?.severity || 1, severityLabels)}
          </p>
        </div>

        {/* Ночная потливость */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            💦 Ночная потливость
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Наличие:</strong> {entry.nightSweats?.occurred ? 'Да' : 'Нет'}
          </p>
          {entry.nightSweats?.occurred && (
            <p className="text-sm text-muted-foreground">
              <strong>Интенсивность:</strong> {getScaleLabel(entry.nightSweats.severity, severityLabels)}
            </p>
          )}
        </div>

        {/* Сон */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            😴 Сон
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Часов сна:</strong> {entry.sleep?.hoursSlept || 0}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Качество:</strong> {getScaleLabel(entry.sleep?.quality || 3, moodLabels)}
          </p>
        </div>

        {/* Настроение */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            😊 Настроение
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Общее:</strong> {getScaleLabel(entry.mood?.overall || 3, moodLabels)}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Тревожность:</strong> {getScaleLabel(entry.mood?.anxiety || 1, severityLabels)}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Раздражительность:</strong> {getScaleLabel(entry.mood?.irritability || 1, severityLabels)}
          </p>
        </div>

        {/* Энергия */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            ⚡ Энергия
          </h3>
          <p className="text-sm text-muted-foreground">
            <strong>Уровень:</strong> {getScaleLabel(entry.energy || 3, energyLabels)}
          </p>
        </div>

        {/* Физические симптомы */}
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            🏃‍♀️ Физические симптомы
          </h3>
          {entry.physicalSymptoms && entry.physicalSymptoms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entry.physicalSymptoms.map((symptom: string) => (
                <span key={symptom} className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs">
                  {physicalSymptomsMap[symptom] || symptom.replace('_', ' ')}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Нет отмеченных симптомов</p>
          )}
        </div>
      </div>

      {/* Заметки */}
      {entry.notes && (
        <div className="mt-6 bg-muted/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            📝 Заметки
          </h3>
          <p className="text-foreground">{entry.notes}</p>
        </div>
      )}
    </div>
  );
};
