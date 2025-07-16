import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Wifi, RefreshCw } from 'lucide-react';
import { useNetworkDiagnostics } from '@/hooks/useNetworkDiagnostics';

const LoginSafe = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { runDiagnostics, isRunning: isDiagnosticRunning } = useNetworkDiagnostics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnostics = async () => {
    await runDiagnostics();
  };

  const handleOfflineMode = () => {
    // Temporarily save credentials to localStorage for offline mode
    localStorage.setItem('eva_offline_credentials', JSON.stringify({ email, password }));
    navigate('/dashboard?offline=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Safe Mode Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-blue-900">Безопасный вход</h1>
          </div>
          <p className="text-sm text-blue-700">
            Альтернативный метод входа с улучшенной обработкой сетевых ошибок
          </p>
        </div>

        {/* Emergency Options */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDiagnostics}
            disabled={isDiagnosticRunning}
            className="flex items-center justify-center gap-2"
          >
            <Wifi className="h-4 w-4" />
            {isDiagnosticRunning ? 'Проверка...' : 'Диагностика сети'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleOfflineMode}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Автономный режим
          </Button>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>
              Введите ваши учетные данные для входа в Eva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Введите ваш email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Введите ваш пароль"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Выполняется вход...' : 'Войти'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Обычный вход
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Network Status */}
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Статус: {navigator.onLine ? 'Онлайн' : 'Оффлайн'} | 
            Режим: Безопасный вход с расширенными таймаутами
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default LoginSafe;