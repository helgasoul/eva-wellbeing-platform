
import React from 'react';
import { Link } from 'react-router-dom';
import { UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { ErrorMessage } from '@/components/ui/error-message';
import { RegisterFormData } from '@/types/auth';

interface AgreementCheckboxesProps {
  setValue: UseFormSetValue<RegisterFormData>;
  watch: UseFormWatch<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

export const AgreementCheckboxes: React.FC<AgreementCheckboxesProps> = ({
  setValue,
  watch,
  errors,
}) => {
  const agreeToTerms = watch('agreeToTerms');
  const agreeToPrivacy = watch('agreeToPrivacy');

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="agreeToTerms"
          checked={agreeToTerms}
          onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
        />
        <label htmlFor="agreeToTerms" className="text-sm text-muted-foreground cursor-pointer">
          Я согласен(а) с{' '}
          <Link to="/terms" className="text-primary hover:underline">
            условиями использования
          </Link>
        </label>
      </div>
      {errors.agreeToTerms && (
        <ErrorMessage message={errors.agreeToTerms.message!} />
      )}

      <div className="flex items-start space-x-2">
        <Checkbox
          id="agreeToPrivacy"
          checked={agreeToPrivacy}
          onCheckedChange={(checked) => setValue('agreeToPrivacy', !!checked)}
        />
        <label htmlFor="agreeToPrivacy" className="text-sm text-muted-foreground cursor-pointer">
          Я согласен(а) с{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>
        </label>
      </div>
      {errors.agreeToPrivacy && (
        <ErrorMessage message={errors.agreeToPrivacy.message!} />
      )}
    </div>
  );
};
