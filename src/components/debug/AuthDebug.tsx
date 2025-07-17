import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { diagnoseAuthState, clearAuthStorage } from '../../utils/auth-diagnostics';
import { logger } from '../../utils/logger';

const AuthDebug = () => {
  // Только показываем в development режиме
  if (import.meta.env.PROD) {
    return null;
  }
  const [isVisible, setIsVisible] = useState(true);
  let authStatus = 'unknown';
  let authError = null;
  let authData = null;

  try {
    const auth = useAuth();
    authStatus = 'working';
    authData = {
      user: auth.user ? {
        id: auth.user.id,
        email: auth.user.email,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        role: auth.user.role
      } : null,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading
    };
  } catch (error: any) {
    authStatus = 'error';
    authError = error.message;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm z-50"
      >
        🔍 Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-gray-900">🔍 AuthContext Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Статус:</strong> 
          <span className={authStatus === 'working' ? 'text-green-600' : 'text-red-600'}>
            {authStatus}
          </span>
        </div>
        
        <div>
          <strong>URL:</strong>
          <div className="text-xs text-gray-600">{window.location.pathname}</div>
        </div>
        
        {authError && (
          <div>
            <strong>Ошибка:</strong>
            <div className="text-red-600 text-xs mt-1 bg-red-50 p-2 rounded">
              {authError}
            </div>
          </div>
        )}
        
        {authData && (
          <div>
            <strong>Данные:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(authData, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <strong>localStorage:</strong>
          <div className="text-xs text-gray-600">
            eva_user: {localStorage.getItem('eva_user') ? '✅' : '❌'}
            <br />
            eva_auth_token: {localStorage.getItem('eva_auth_token') ? '✅' : '❌'}
          </div>
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="flex gap-2">
            <button
              onClick={async () => {
                const result = await diagnoseAuthState();
                logger.info('Full diagnostic:', result);
                alert(`Diagnostics complete. Check console for details. Issues: ${result.inconsistencies.length}`);
              }}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Full Diagnostic
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all auth storage?')) {
                  clearAuthStorage();
                  window.location.reload();
                }
              }}
              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
            >
              Clear Storage
            </button>
          </div>
          <a 
            href="/login-safe" 
            className="text-blue-600 hover:text-blue-800 text-xs underline block"
          >
            → Перейти к безопасному входу
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;