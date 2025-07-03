
import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg animate-fade-in">
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
