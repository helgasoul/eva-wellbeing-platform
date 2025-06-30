
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen eva-gradient flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
