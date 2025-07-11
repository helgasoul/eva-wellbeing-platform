import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface SymptomsSelectionStepProps {
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  consultationReason: string;
  onReasonChange: (reason: string) => void;
  onNext: () => void;
  isLoading?: boolean;
}

export const SymptomsSelectionStep: React.FC<SymptomsSelectionStepProps> = ({
  selectedSymptoms,
  onSymptomsChange,
  consultationReason,
  onReasonChange,
  onNext,
  isLoading = false
}) => {
  const symptomCategories = [
    {
      category: 'Основные симптомы менопаузы',
      icon: '🔥',
      symptoms: [
        { id: 'hot_flashes', label: 'Приливы', icon: '🔥', urgency: 'medium' },
        { id: 'night_sweats', label: 'Ночная потливость', icon: '💦', urgency: 'medium' },
        { id: 'irregular_periods', label: 'Нерегулярные месячные', icon: '📅', urgency: 'medium' },
        { id: 'mood_changes', label: 'Перепады настроения', icon: '😔', urgency: 'high' },
        { id: 'sleep_problems', label: 'Проблемы со сном', icon: '😴', urgency: 'high' },
        { id: 'low_libido', label: 'Снижение либидо', icon: '💝', urgency: 'low' }
      ]
    },
    {
      category: 'Физические симптомы',
      icon: '🏃‍♀️',
      symptoms: [
        { id: 'weight_gain', label: 'Увеличение веса', icon: '⚖️', urgency: 'medium' },
        { id: 'joint_pain', label: 'Боли в суставах', icon: '🦴', urgency: 'medium' },
        { id: 'headaches', label: 'Головные боли', icon: '🤕', urgency: 'high' },
        { id: 'fatigue', label: 'Усталость', icon: '😴', urgency: 'medium' },
        { id: 'dry_skin', label: 'Сухость кожи', icon: '🧴', urgency: 'low' },
        { id: 'hair_loss', label: 'Выпадение волос', icon: '💇‍♀️', urgency: 'low' }
      ]
    },
    {
      category: 'Психологические симптомы',
      icon: '🧠',
      symptoms: [
        { id: 'anxiety', label: 'Тревожность', icon: '😰', urgency: 'high' },
        { id: 'depression', label: 'Депрессия', icon: '😢', urgency: 'high' },
        { id: 'irritability', label: 'Раздражительность', icon: '😠', urgency: 'medium' },
        { id: 'memory_issues', label: 'Проблемы с памятью', icon: '🧠', urgency: 'medium' },
        { id: 'concentration', label: 'Сложности с концентрацией', icon: '🎯', urgency: 'medium' },
        { id: 'brain_fog', label: 'Туман в голове', icon: '☁️', urgency: 'medium' }
      ]
    },
    {
      category: 'Специфические проблемы',
      icon: '🩺',
      symptoms: [
        { id: 'vaginal_dryness', label: 'Сухость влагалища', icon: '🌸', urgency: 'medium' },
        { id: 'urinary_issues', label: 'Проблемы с мочеиспусканием', icon: '🚽', urgency: 'high' },
        { id: 'bone_health', label: 'Беспокойство о костях', icon: '🦴', urgency: 'medium' },
        { id: 'heart_palpitations', label: 'Сердцебиение', icon: '❤️', urgency: 'high' },
        { id: 'digestive_issues', label: 'Проблемы с пищеварением', icon: '🫄', urgency: 'medium' }
      ]
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-300 bg-red-50 hover:bg-red-100';
      case 'medium': return 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100';
      case 'low': return 'border-green-300 bg-green-50 hover:bg-green-100';
      default: return 'border-gray-300 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getRecommendedSpecialist = () => {
    const hasHighUrgency = selectedSymptoms.some(symptomId => {
      const symptom = symptomCategories
        .flatMap(cat => cat.symptoms)
        .find(s => s.id === symptomId);
      return symptom?.urgency === 'high';
    });

    const hasPsychological = selectedSymptoms.some(s => 
      ['anxiety', 'depression', 'mood_changes'].includes(s)
    );

    const hasHormonal = selectedSymptoms.some(s => 
      ['hot_flashes', 'irregular_periods', 'night_sweats'].includes(s)
    );

    if (hasHighUrgency && hasPsychological) {
      return {
        type: 'urgent',
        specialist: 'Гинеколог-эндокринолог + Психолог',
        message: 'Рекомендуется комплексная консультация в ближайшее время'
      };
    } else if (hasHormonal) {
      return {
        type: 'standard',
        specialist: 'Гинеколог-эндокринолог',
        message: 'Специалист по гормональным изменениям в менопаузе'
      };
    } else if (hasPsychological) {
      return {
        type: 'standard',
        specialist: 'Психотерапевт',
        message: 'Специалист по психологическим аспектам менопаузы'
      };
    }

    return {
      type: 'general',
      specialist: 'Гинеколог',
      message: 'Общая консультация по женскому здоровью'
    };
  };

  const recommendation = getRecommendedSpecialist();

  return (
    <div className="space-y-6">
      
      {/* ИИ-рекомендация специалиста */}
      {selectedSymptoms.length > 0 && (
        <div className={cn(
          "border-2 rounded-xl p-4",
          recommendation.type === 'urgent' ? 'border-red-300 bg-red-50' :
          recommendation.type === 'standard' ? 'border-blue-300 bg-blue-50' :
          'border-green-300 bg-green-50'
        )}>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <h3 className="font-semibold gentle-text mb-1">
                ИИ-рекомендация: {recommendation.specialist}
              </h3>
              <p className="text-sm soft-text">{recommendation.message}</p>
              {recommendation.type === 'urgent' && (
                <div className="mt-2 text-sm text-red-700 font-medium">
                  ⚠️ Некоторые симптомы требуют скорейшего внимания специалиста
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Основной блок выбора симптомов */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold gentle-text mb-6">
          🩺 Выберите ваши симптомы и жалобы
        </h2>
        
        <div className="space-y-8">
          {symptomCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-lg font-medium gentle-text mb-4 flex items-center">
                <span className="mr-2">{category.icon}</span>
                {category.category}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.symptoms.map((symptom) => (
                  <label
                    key={symptom.id}
                    className={cn(
                      "flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200",
                      selectedSymptoms.includes(symptom.id)
                        ? "border-primary bg-primary/10"
                        : getUrgencyColor(symptom.urgency)
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSymptomsChange([...selectedSymptoms, symptom.id]);
                        } else {
                          onSymptomsChange(selectedSymptoms.filter(s => s !== symptom.id));
                        }
                      }}
                      className="mr-3 rounded"
                    />
                    <span className="mr-2">{symptom.icon}</span>
                    <span className="text-sm font-medium gentle-text">{symptom.label}</span>
                    {symptom.urgency === 'high' && (
                      <span className="ml-auto text-red-500 text-xs">⚠️</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8">
          <label className="block text-sm font-medium gentle-text mb-2">
            Дополнительная информация о вашем состоянии:
          </label>
          <Textarea
            value={consultationReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Опишите, что вас беспокоит больше всего, как долго наблюдаются симптомы, что усугубляет или облегчает состояние..."
            rows={4}
            className="w-full"
          />
        </div>

        {/* Кнопка далее */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={onNext}
            disabled={selectedSymptoms.length === 0 || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                Подбираем врачей...
              </>
            ) : (
              'Найти подходящих врачей →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};