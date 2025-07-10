
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  
  return (
    <div className="min-h-screen bloom-gradient flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* EMERGENCY NOTICE */}
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800 text-center">
            ⚠️ Если возникают проблемы с входом, попробуйте{' '}
            <a href="/login-safe" className="underline font-medium">
              безопасную версию входа
            </a>
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
