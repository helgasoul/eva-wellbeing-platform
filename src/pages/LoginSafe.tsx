import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginSafe = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // БЕЗОПАСНАЯ ИМИТАЦИЯ ВХОДА
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // СОЗДАТЬ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
      const testUser = {
        id: 'test_user_' + Date.now(),
        email: email,
        firstName: 'Тест',
        lastName: 'Пользователь',
        role: 'patient' as const,
        isVerified: true
      };

      // СОХРАНИТЬ В localStorage
      localStorage.setItem('eva_user', JSON.stringify(testUser));
      localStorage.setItem('eva_auth_token', 'safe_token_' + Date.now());

      console.log('✅ Safe login successful');
      
      // БЕЗОПАСНЫЙ РЕДИРЕКТ
      navigate('/patient/dashboard');
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Ошибка входа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (role: 'patient' | 'doctor' | 'admin') => {
    setLoading(true);
    setError('');

    try {
      const testUsers = {
        patient: {
          id: 'test_patient_' + Date.now(),
          email: 'test-patient@eva.com',
          firstName: 'Тест',
          lastName: 'Пациент',
          role: 'patient' as const,
          isVerified: true
        },
        doctor: {
          id: 'test_doctor_' + Date.now(),
          email: 'test-doctor@eva.com',
          firstName: 'Тест',
          lastName: 'Врач',
          role: 'doctor' as const,
          isVerified: true
        },
        admin: {
          id: 'test_admin_' + Date.now(),
          email: 'test-admin@eva.com',
          firstName: 'Тест',
          lastName: 'Админ',
          role: 'admin' as const,
          isVerified: true
        }
      };

      const testUser = testUsers[role];
      
      // СОХРАНИТЬ В localStorage
      localStorage.setItem('eva_user', JSON.stringify(testUser));
      localStorage.setItem('eva_auth_token', 'safe_token_' + Date.now());

      console.log(`✅ Test ${role} login successful`);
      
      // РЕДИРЕКТ В ЗАВИСИМОСТИ ОТ РОЛИ
      const redirectPaths = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard'
      };
      
      navigate(redirectPaths[role]);
      
    } catch (err) {
      console.error('❌ Test login error:', err);
      setError('Ошибка тестового входа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Вход в bloom</h2>
          <p className="text-gray-600">Безопасная версия входа</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ваш пароль"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-gray-600 font-medium">
            Быстрый тестовый вход:
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleTestLogin('patient')}
              disabled={loading}
              className="bg-blue-100 text-blue-700 py-2 px-3 rounded text-xs hover:bg-blue-200 disabled:opacity-50 transition-colors"
            >
              Пациент
            </button>
            <button
              onClick={() => handleTestLogin('doctor')}
              disabled={loading}
              className="bg-green-100 text-green-700 py-2 px-3 rounded text-xs hover:bg-green-200 disabled:opacity-50 transition-colors"
            >
              Врач
            </button>
            <button
              onClick={() => handleTestLogin('admin')}
              disabled={loading}
              className="bg-red-100 text-red-700 py-2 px-3 rounded text-xs hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              Админ
            </button>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Link to="/register" className="text-purple-600 hover:text-purple-700 text-sm">
            Нет аккаунта? Зарегистрироваться
          </Link>
          <br />
          <Link to="/forgot-password" className="text-gray-500 hover:text-gray-700 text-sm">
            Забыли пароль?
          </Link>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            ⚠️ Временная безопасная версия входа. Для восстановления полной функциональности обратитесь к разработчику.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSafe;