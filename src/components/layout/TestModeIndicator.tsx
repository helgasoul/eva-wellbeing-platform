import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const TestModeIndicator: React.FC = () => {
  const { isTestingRole, returnToOriginalRole } = useAuth();

  // Показываем индикатор только в режиме тестирования
  if (!isTestingRole) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 shadow-lg">
        <div className="flex items-center space-x-3 p-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Режим тестирования активен
              </p>
              <p className="text-xs text-yellow-600">
                Вы тестируете интерфейс от имени администратора
              </p>
            </div>
          </div>
          
          <Button
            onClick={returnToOriginalRole}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <Shield className="h-4 w-4 mr-1" />
            <span className="text-xs">Админ-панель</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};