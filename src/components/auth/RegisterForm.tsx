
import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { RoleSelector } from './RoleSelector';
import { RegisterFormHeader } from './register/RegisterFormHeader';
import { PersonalInfoFields } from './register/PersonalInfoFields';
import { PasswordFields } from './register/PasswordFields';
import { AgreementCheckboxes } from './register/AgreementCheckboxes';
import { UserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import { RegisterFormData, registerSchema } from '@/types/auth';

export const RegisterForm = () => {
  const { register: registerUser, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.PATIENT,
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        agreeToTerms: data.agreeToTerms,
        agreeToPrivacy: data.agreeToPrivacy,
      });
    } catch (error) {
      // Error handling is done in AuthContext
      console.error('Registration error:', error);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setValue('role', role);
  };

  return (
    <div className="bloom-card p-8 w-full max-w-lg mx-auto">
      <RegisterFormHeader />

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields register={register} errors={errors} />

        <PasswordFields register={register} errors={errors} />

        <div className="space-y-2">
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
          />
          {errors.role && (
            <ErrorMessage message={errors.role.message!} />
          )}
        </div>

        <AgreementCheckboxes setValue={setValue} watch={watch} errors={errors} />

        <Button
          type="submit"
          disabled={isLoading}
          className="bloom-button w-full flex items-center justify-center space-x-2"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          <span>{isLoading ? 'Создаём аккаунт...' : 'Создать аккаунт'}</span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
};
