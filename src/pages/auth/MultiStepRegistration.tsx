import React from 'react';
import { RegistrationProvider, useRegistration } from '@/context/RegistrationContext';
import { Step1ContactVerification } from '@/components/auth/registration/Step1ContactVerification';
import { Step2LegalConsents } from '@/components/auth/registration/Step2LegalConsents';
import { Step3PersonaSelection } from '@/components/auth/registration/Step3PersonaSelection';
import { PasswordStep } from '@/components/auth/registration/PasswordStep';
import { RegistrationComplete } from '@/components/auth/registration/RegistrationComplete';

const MultiStepRegistrationContent: React.FC = () => {
  const { state, updateStep4Data, completeRegistration } = useRegistration();

  // Если регистрация завершена, показываем экран завершения
  if (state.isCompleted) {
    return <RegistrationComplete />;
  }

  const handlePasswordComplete = (data: { password: string; firstName: string; lastName: string }) => {
    updateStep4Data(data);
    completeRegistration();
  };

  // Рендерим текущий шаг
  switch (state.currentStep) {
    case 1:
      return <Step1ContactVerification />;
    case 2:
      return <Step2LegalConsents />;
    case 3:
      return <Step3PersonaSelection />;
    case 4:
      return <PasswordStep onComplete={handlePasswordComplete} />;
    default:
      return <Step1ContactVerification />;
  }
};

const MultiStepRegistration: React.FC = () => {
  return (
    <RegistrationProvider>
      <MultiStepRegistrationContent />
    </RegistrationProvider>
  );
};

export default MultiStepRegistration;