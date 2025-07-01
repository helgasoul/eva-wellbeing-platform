
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { UserRole } from '@/types/auth';
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  FileText,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Eva - Панель администратора' 
}) => {
  const location = useLocation();
  const [systemStatus, setSystemStatus] = useState('operational');

  const navigation = [
    { name: 'Панель управления', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Настройки системы', href: '/admin/settings', icon: Settings },
    { name: 'Модерация контента', href: '/admin/moderation', icon: FileText },
    { name: 'Безопасность', href: '/admin/security', icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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
    <AppLayout title={title} role={UserRole.ADMIN}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-gray-600 to-blue-600 rounded-full">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-playfair font-semibold text-foreground">
                  Администрирование
                </span>
              </div>
            </div>
            
            {/* System Status */}
            <div className="mt-6 px-4">
              <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-gray-700 text-sm flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Статус системы
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${getStatusColor(systemStatus)}`}>
                      Все системы
                    </span>
                    {getStatusBadge(systemStatus)}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-gray-600 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-white' : 'text-gray-600'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* System Metrics */}
              <div className="p-4 space-y-3">
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

                {/* Alerts */}
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
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 md:pl-0">
          {/* Admin Tools Bar */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-playfair font-semibold text-foreground">
                  Панель администратора
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Система работает
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Активных пользователей: 234
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gray-600 to-blue-600 hover:from-gray-700 hover:to-blue-700 text-white"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Система
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Отчеты
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
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
