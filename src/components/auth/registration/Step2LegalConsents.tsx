import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StepWrapper } from './StepWrapper';
import { useRegistration } from '@/context/RegistrationContext';
import { Shield, FileText, Users, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { PrivacyPolicyContent, MedicalDataPolicyContent } from '@/legal/PrivacyPolicy';

interface ConsentItem {
  id: keyof typeof initialConsents;
  title: string;
  description: string;
  isRequired: boolean;
  documentContent?: typeof PrivacyPolicyContent;
  category: 'legal' | 'medical' | 'research' | 'marketing';
  icon: React.ReactNode;
}

const initialConsents = {
  gdpr_basic: false,
  medical_data: false,
  ai_analysis: false,
  research_participation: false,
  marketing_communications: false
};

const consentItems: ConsentItem[] = [
  {
    id: 'gdpr_basic',
    title: 'Обработка персональных данных',
    description: 'Согласие на обработку основных персональных данных (имя, email, возраст) в соответствии с GDPR и 152-ФЗ',
    isRequired: true,
    category: 'legal',
    icon: <Shield className="h-5 w-5 text-blue-600" />,
    documentContent: PrivacyPolicyContent
  },
  {
    id: 'medical_data',
    title: 'Обработка медицинских данных',
    description: 'Согласие на обработку данных о симптомах, анализах и состоянии здоровья для персонализации рекомендаций',
    isRequired: true,
    category: 'medical',
    icon: <FileText className="h-5 w-5 text-red-600" />,
    documentContent: MedicalDataPolicyContent
  },
  {
    id: 'ai_analysis',
    title: 'Использование ИИ для анализа',
    description: 'Согласие на анализ ваших данных алгоритмами искусственного интеллекта для улучшения качества рекомендаций',
    isRequired: true,
    category: 'medical',
    icon: <Users className="h-5 w-5 text-purple-600" />
  },
  {
    id: 'research_participation',
    title: 'Участие в исследованиях',
    description: 'Анонимное использование ваших данных для медицинских исследований в области менопаузы (можно отключить в любое время)',
    isRequired: false,
    category: 'research',
    icon: <Users className="h-5 w-5 text-green-600" />
  },
  {
    id: 'marketing_communications',
    title: 'Маркетинговые коммуникации',
    description: 'Получение полезной информации о новых функциях, статьях экспертов и персональных рекомендациях',
    isRequired: false,
    category: 'marketing',
    icon: <Mail className="h-5 w-5 text-orange-600" />
  }
];

interface ConsentCardProps {
  item: ConsentItem;
  isAccepted: boolean;
  onToggle: (accepted: boolean) => void;
}

const ConsentCard: React.FC<ConsentCardProps> = ({ item, isAccepted, onToggle }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isAccepted ? 'border-primary bg-primary/5' : 'border-muted'
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {item.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {item.title}
                {item.isRequired && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Обязательно
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            </div>
            
            <Checkbox
              checked={isAccepted}
              onCheckedChange={(checked) => onToggle(checked as boolean)}
              className="ml-2"
            />
          </div>
          
          {item.documentContent && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Читать полный текст
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>{item.documentContent.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Последнее обновление: {item.documentContent.lastUpdated}
                    </p>
                    {item.documentContent.sections.map((section, index) => (
                      <div key={index}>
                        <h3 className="font-semibold text-lg mb-3">{section.title}</h3>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

const SecuritySummary: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 mb-2">
            Ваша безопасность - наш приоритет
          </h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>🔒 Все данные шифруются с использованием AES-256</li>
            <li>🛡️ Соответствие GDPR и российскому законодательству</li>
            <li>👥 Доступ к данным только у авторизованного медперсонала</li>
            <li>🔄 Регулярные аудиты безопасности и резервное копирование</li>
            <li>❌ Никогда не продаем ваши данные третьим лицам</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const Step2LegalConsents: React.FC = () => {
  const { state, updateStep2Data, nextStep, prevStep, canProceedToStep } = useRegistration();
  const { step2Data } = state;

  const handleConsentToggle = (consentId: keyof typeof initialConsents, accepted: boolean) => {
    updateStep2Data({
      [consentId]: accepted
    });
  };

  const allRequiredAccepted = consentItems
    .filter(item => item.isRequired)
    .every(item => step2Data[item.id]);

  const handleNext = () => {
    if (canProceedToStep(3)) {
      nextStep();
    }
  };

  return (
    <StepWrapper
      title="Согласия на обработку данных"
      subtitle="Ваша конфиденциальность и безопасность данных - наш главный приоритет"
      step={2}
      totalSteps={3}
    >
      <div className="space-y-4">
        {consentItems.map(item => (
          <ConsentCard
            key={item.id}
            item={item}
            isAccepted={step2Data[item.id]}
            onToggle={(accepted) => handleConsentToggle(item.id, accepted)}
          />
        ))}
      </div>

      <SecuritySummary />

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>
          Назад
        </Button>
        <Button
          onClick={handleNext}
          disabled={!allRequiredAccepted}
          className="bloom-button px-8"
        >
          Продолжить к выбору профиля
        </Button>
      </div>
    </StepWrapper>
  );
};