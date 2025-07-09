import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { StepWrapper } from './StepWrapper';
import { verificationService, isValidEmail, isValidPhone, formatPhone } from '@/services/verificationService';
import { useRegistration } from '@/context/RegistrationContext';
import { CheckCircle, Clock, Mail, Phone, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailVerificationSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  code: string;
  onCodeChange: (code: string) => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  isCodeSent: boolean;
  countdown: number;
  isVerified: boolean;
  isLoading: boolean;
}

const EmailVerificationSection: React.FC<EmailVerificationSectionProps> = ({
  email,
  onEmailChange,
  code,
  onCodeChange,
  onSendCode,
  onVerifyCode,
  isCodeSent,
  countdown,
  isVerified,
  isLoading
}) => {
  const isValidEmailFormat = isValidEmail(email);

  return (
    <div className="space-y-4 p-6 border border-muted rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Email адрес</h3>
        {isVerified && <CheckCircle className="h-5 w-5 text-green-500" />}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          disabled={isVerified}
          className={isVerified ? 'bg-green-50 border-green-200' : ''}
        />
      </div>

      {!isVerified && (
        <>
          {!isCodeSent ? (
            <Button
              onClick={onSendCode}
              disabled={!isValidEmailFormat || isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              Отправить код подтверждения
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-code">Код из email</Label>
                <Input
                  id="email-code"
                  type="text"
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={onVerifyCode}
                  disabled={code.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading && <LoadingSpinner size="sm" />}
                  Подтвердить
                </Button>
                
                {countdown > 0 ? (
                  <Button variant="outline" disabled className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {countdown}с
                  </Button>
                ) : (
                  <Button variant="outline" onClick={onSendCode}>
                    Повторить
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {isVerified && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="h-4 w-4" />
          Email подтвержден
        </div>
      )}
    </div>
  );
};

export const Step1ContactVerification: React.FC = () => {
  const { state, updateStep1Data, nextStep, canProceedToStep } = useRegistration();
  const { step1Data } = state;

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Таймер обратного отсчета
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendEmailVerification = async () => {
    if (!isValidEmail(step1Data.email)) {
      setError('Введите корректный email адрес');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await verificationService.sendEmailCode(step1Data.email);
      
      if (result.success) {
        setEmailCodeSent(true);
        setCountdown(60);
        toast({
          title: 'Код отправлен',
          description: result.message,
        });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка отправки кода. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verificationService.verifyEmailCode(step1Data.email, emailCode);
      
      if (result.success) {
        updateStep1Data({ emailVerified: true });
        toast({
          title: 'Email подтвержден',
          description: result.message,
        });
        setEmailCode('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Ошибка верификации кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (canProceedToStep(2)) {
      nextStep();
    }
  };

  return (
    <StepWrapper
      title="Подтвердите ваш email"
      subtitle="Это обеспечит безопасность вашего аккаунта и позволит получать важные уведомления"
      step={1}
      totalSteps={4}
    >
      {error && (
        <ErrorMessage message={error} />
      )}

      <EmailVerificationSection
        email={step1Data.email}
        onEmailChange={(email) => updateStep1Data({ email })}
        code={emailCode}
        onCodeChange={setEmailCode}
        onSendCode={sendEmailVerification}
        onVerifyCode={verifyEmailCode}
        isCodeSent={emailCodeSent}
        countdown={countdown}
        isVerified={step1Data.emailVerified}
        isLoading={isLoading}
      />

      {/* Информация о безопасности */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Защита ваших данных
            </h4>
            <p className="text-sm text-blue-700">
              Мы используем двухфакторную аутентификацию для защиты ваших медицинских данных. 
              Ваш email будет использоваться только для важных уведомлений и никогда не будет передан третьим лицам.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <div></div> {/* Пустое место для кнопки "Назад" */}
        <Button
          onClick={handleNext}
          disabled={!canProceedToStep(2)}
          className="bloom-button px-8"
        >
          Продолжить к согласиям
        </Button>
      </div>
    </StepWrapper>
  );
};