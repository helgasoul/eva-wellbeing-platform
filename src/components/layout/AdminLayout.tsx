
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import { UserRole } from '@/types/auth';
import { BreadcrumbItem } from './Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, Database } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Eva - Панель администратора',
  breadcrumbs = []
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [systemStatus] = useState('operational');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Работает</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Предупреждение</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Критично</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  return (
    <AppLayout 
      title={title} 
      role={UserRole.ADMIN}
      breadcrumbs={breadcrumbs}
      quickActions={true}
    >
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Sidebar */}
        <div className="flex">
          <Sidebar 
            role={UserRole.ADMIN} 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* System Status Cards - внутри sidebar области */}
          <div className="hidden md:block absolute bottom-4 left-4 right-4 max-w-56 space-y-3">
            <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-700 text-sm flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Статус системы
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-600">
                    Все системы
                  </span>
                  {getStatusBadge(systemStatus)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-700 text-sm flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Система
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-600">Пользователи:</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Активность:</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600">Нагрузка:</span>
                    <span className="font-medium">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-yellow-700 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-600">Требуют модерации</span>
                    <Badge variant="outline" className="text-xs">12</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600">Системные алерты</span>
                    <Badge variant="outline" className="text-xs">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};
