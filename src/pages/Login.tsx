
import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

// 🔍 EMERGENCY DIAGNOSTIC LOGGING
console.log('🔍 Login page loading...');
console.log('🔍 Current URL:', window.location.pathname);
console.log('🔍 React Router working:', !!window.history);
console.log('🔍 localStorage data:', {
  eva_user: !!localStorage.getItem('eva_user'),
  eva_auth_token: !!localStorage.getItem('eva_auth_token')
});

const Login = () => {
  console.log('🔍 Login component rendering...');
  
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
