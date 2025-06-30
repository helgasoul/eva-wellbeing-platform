
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error-message';
import { RegisterFormData } from '@/types/auth';

interface PersonalInfoFieldsProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({
  register,
  errors,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя</Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={`eva-input pl-10 ${errors.firstName ? 'border-destructive' : ''}`}
              placeholder="Ваше имя"
              autoComplete="given-name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.firstName && (
            <ErrorMessage message={errors.firstName.message!} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия</Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={`eva-input pl-10 ${errors.lastName ? 'border-destructive' : ''}`}
              placeholder="Ваша фамилия"
              autoComplete="family-name"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {errors.lastName && (
            <ErrorMessage message={errors.lastName.message!} />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={`eva-input pl-10 ${errors.email ? 'border-destructive' : ''}`}
            placeholder="your@email.com"
            autoComplete="email"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.email && (
          <ErrorMessage message={errors.email.message!} />
        )}
      </div>
    </>
  );
};
