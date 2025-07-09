import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepWrapper } from './StepWrapper';
import { useRegistration } from '@/context/RegistrationContext';
import { CheckCircle, Sparkles, Heart, Shield } from 'lucide-react';

interface MenopausePersona {
  id: 'first_signs' | 'active_phase' | 'postmenopause';
  title: string;
  subtitle: string;
  description: string;
  ageRange: string;
  keySymptoms: string[];
  mainConcerns: string[];
  recommendedFocus: string[];
  imageUrl: string;
  colorTheme: {
    primary: string;
    background: string;
    accent: string;
  };
  icon: React.ReactNode;
}

const menopausePersonas: MenopausePersona[] = [
  {
    id: 'first_signs',
    title: 'Первые признаки',
    subtitle: 'Понимание и подготовка',
    description: 'Вам 45+? Замечаете изменения в цикле? Получите ясность и возьмите ситуацию под контроль.',
    ageRange: '45-50 лет',
    keySymptoms: ['Нерегулярные месячные', 'Легкие приливы', 'Изменения сна', 'Перепады настроения'],
    mainConcerns: ['Понимание изменений', 'Профилактика', 'Подготовка к менопаузе'],
    recommendedFocus: ['Отслеживание цикла', 'Образ жизни', 'Профилактические обследования'],
    imageUrl: '/src/assets/beginning-changes-card.jpg',
    colorTheme: {
      primary: '#10B981',
      background: '#ECFDF5',
      accent: '#059669'
    },
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    id: 'active_phase',
    title: 'Активная фаза',
    subtitle: 'Управление симптомами',
    description: 'Приливы мешают жить? Настроение скачет? Верните контроль над своим телом и самочувствием.',
    ageRange: '48-55 лет',
    keySymptoms: ['Сильные приливы', 'Ночная потливость', 'Изменения настроения', 'Сухость кожи'],
    mainConcerns: ['Облегчение симптомов', 'Качество жизни', 'Сохранение активности'],
    recommendedFocus: ['Управление симптомами', 'ЗГТ при необходимости', 'Стресс-менеджмент'],
    imageUrl: '/src/assets/active-phase-card.jpg',
    colorTheme: {
      primary: '#F59E0B',
      background: '#FFFBEB',
      accent: '#D97706'
    },
    icon: <Heart className="h-6 w-6" />
  },
  {
    id: 'postmenopause',
    title: 'Постменопауза',
    subtitle: 'Здоровье и долголетие',
    description: 'Новый этап жизни начался. Сохраните здоровье, энергию и активность на долгие годы вперед.',
    ageRange: '55+ лет',
    keySymptoms: ['Стабилизация симптомов', 'Вопросы костей и сердца', 'Когнитивные изменения'],
    mainConcerns: ['Долгосрочное здоровье', 'Профилактика заболеваний', 'Активное долголетие'],
    recommendedFocus: ['Профилактика остеопороза', 'Здоровье сердца', 'Когнитивная функция'],
    imageUrl: '/src/assets/after-transition-card.jpg',
    colorTheme: {
      primary: '#8B5CF6',
      background: '#F5F3FF',
      accent: '#7C3AED'
    },
    icon: <Shield className="h-6 w-6" />
  }
];

interface PersonaCardProps {
  persona: MenopausePersona;
  isSelected: boolean;
  onSelect: () => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isSelected, onSelect }) => {
  return (
    <Card 
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg scale-105' 
          : 'hover:scale-102'
      }`}
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? persona.colorTheme.background : undefined
      }}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      )}
      
      <div className="p-6">
        {/* Иконка и заголовок */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: persona.colorTheme.primary + '20',
              color: persona.colorTheme.primary 
            }}
          >
            {persona.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{persona.title}</h3>
            <p className="text-sm text-muted-foreground">{persona.subtitle}</p>
          </div>
        </div>

        {/* Возрастной диапазон */}
        <Badge 
          variant="secondary" 
          className="mb-3"
          style={{
            backgroundColor: persona.colorTheme.primary + '15',
            color: persona.colorTheme.accent
          }}
        >
          {persona.ageRange}
        </Badge>

        {/* Описание */}
        <p className="text-sm text-foreground mb-4 leading-relaxed">
          {persona.description}
        </p>

        {/* Ключевые симптомы */}
        <div className="mb-4">
          <h4 className="font-medium text-sm text-foreground mb-2">Основные признаки:</h4>
          <div className="flex flex-wrap gap-1">
            {persona.keySymptoms.slice(0, 3).map((symptom, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {symptom}
              </span>
            ))}
            {persona.keySymptoms.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                +{persona.keySymptoms.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Фокус рекомендаций */}
        <div>
          <h4 className="font-medium text-sm text-foreground mb-2">Мы поможем с:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {persona.recommendedFocus.slice(0, 2).map((focus, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-primary rounded-full"></span>
                {focus}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

interface AdditionalQuestionsProps {
  personaId: string;
  answers: Record<string, string>;
  onAnswersChange: (answers: Record<string, string>) => void;
}

const AdditionalQuestions: React.FC<AdditionalQuestionsProps> = ({
  personaId,
  answers,
  onAnswersChange
}) => {
  // Можно добавить персонализированные вопросы в зависимости от выбранной персоны
  const questions = {
    first_signs: [
      {
        id: 'main_concern',
        question: 'Что вас больше всего беспокоит в данный момент?',
        options: ['Нерегулярность цикла', 'Изменения настроения', 'Качество сна', 'Другое']
      }
    ],
    active_phase: [
      {
        id: 'symptom_severity',
        question: 'Как бы вы оценили интенсивность ваших симптомов?',
        options: ['Легкие, не мешают жизни', 'Умеренные, иногда доставляют дискомфорт', 'Сильные, значительно влияют на качество жизни']
      }
    ],
    postmenopause: [
      {
        id: 'health_priority',
        question: 'Какой аспект здоровья для вас приоритетен?',
        options: ['Здоровье костей', 'Сердечно-сосудистая система', 'Когнитивные функции', 'Общее самочувствие']
      }
    ]
  };

  const currentQuestions = questions[personaId as keyof typeof questions] || [];

  if (currentQuestions.length === 0) return null;

  return (
    <div className="mt-6 p-6 bg-muted/30 rounded-lg">
      <h3 className="font-semibold text-foreground mb-4">Уточните ваши потребности</h3>
      <div className="space-y-4">
        {currentQuestions.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-foreground mb-2">{q.question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((option) => (
                <Button
                  key={option}
                  variant={answers[q.id] === option ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => onAnswersChange({ ...answers, [q.id]: option })}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Step3PersonaSelection: React.FC = () => {
  const { state, updateStep3Data, nextStep, prevStep, completeRegistration } = useRegistration();
  const { step3Data } = state;
  
  const [additionalAnswers, setAdditionalAnswers] = useState<Record<string, string>>({});

  const handlePersonaSelect = (personaId: 'first_signs' | 'active_phase' | 'postmenopause') => {
    updateStep3Data({ selectedPersona: personaId });
    setAdditionalAnswers({}); // Сброс дополнительных ответов при смене персоны
  };

  const handleComplete = () => {
    if (step3Data.selectedPersona) {
      updateStep3Data({ additionalAnswers });
      completeRegistration();
    }
  };

  return (
    <StepWrapper
      title="Какой этап ближе всего описывает ваше состояние?"
      subtitle="Это поможет нам персонализировать рекомендации специально для вас"
      step={3}
      totalSteps={3}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {menopausePersonas.map(persona => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            isSelected={step3Data.selectedPersona === persona.id}
            onSelect={() => handlePersonaSelect(persona.id)}
          />
        ))}
      </div>

      {step3Data.selectedPersona && (
        <AdditionalQuestions
          personaId={step3Data.selectedPersona}
          answers={additionalAnswers}
          onAnswersChange={setAdditionalAnswers}
        />
      )}

      <div className="text-center text-sm text-muted-foreground mt-6 p-4 bg-blue-50 rounded-lg">
        💡 <strong>Не беспокойтесь!</strong> Вы всегда сможете изменить это в настройках профиля. 
        Наша система адаптируется под ваши изменяющиеся потребности.
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          Назад
        </Button>
        <Button
          onClick={handleComplete}
          disabled={!step3Data.selectedPersona}
          className="bloom-button px-8"
        >
          Завершить регистрацию
        </Button>
      </div>
    </StepWrapper>
  );
};