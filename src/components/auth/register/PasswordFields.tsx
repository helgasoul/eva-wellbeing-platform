
import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { EnhancedPasswordField } from '@/components/auth/EnhancedPasswordField';
import { ErrorMessage } from '@/components/ui/error-message';
import { RegisterFormData } from '@/types/auth';

interface PasswordFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  setValue: (name: keyof RegisterFormData, value: any) => void;
}

export const PasswordFields: React.FC<PasswordFieldsProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const email = watch('email');
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const userInfo = {
    email: email || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
  };

  return (
    <>
      <EnhancedPasswordField
        id="password"
        label="Пароль"
        placeholder="Создайте надежный пароль"
        value={password || ''}
        onChange={(value) => setValue('password', value)}
        error={errors.password?.message}
        showStrengthIndicator={true}
        showGenerateButton={true}
        userInfo={userInfo}
      />

      <EnhancedPasswordField
        id="confirmPassword"
        label="Подтвердите пароль"
        placeholder="Повторите пароль"
        value={confirmPassword || ''}
        onChange={(value) => setValue('confirmPassword', value)}
        error={errors.confirmPassword?.message}
        showStrengthIndicator={false}
      />

      {/* Hidden inputs for react-hook-form integration */}
      <input
        type="hidden"
        {...register('password')}
        value={password || ''}
      />
      <input
        type="hidden"
        {...register('confirmPassword')}
        value={confirmPassword || ''}
      />
    </>
  );
};
