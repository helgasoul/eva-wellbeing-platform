
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { UserRole } from '@/types/auth';
import { 
  LayoutDashboard,
  Users,
  Calculator,
  BarChart3,
  BookOpen,
  Settings,
  Search,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DoctorLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ 
  children, 
  title = 'Eva - Врачебная панель' 
}) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { name: 'Панель врача', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Мои пациентки', href: '/doctor/patients', icon: Users },
    { name: 'Калькуляторы рисков', href: '/doctor/calculators', icon: Calculator },
    { name: 'Аналитика', href: '/doctor/analytics', icon: BarChart3 },
    { name: 'База знаний', href: '/doctor/knowledge', icon: BookOpen },
    { name: 'Настройки', href: '/doctor/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppLayout title={title} role={UserRole.DOCTOR}>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-blue-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-green-600 rounded-full">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-playfair font-semibold text-foreground">
                  Врачебная панель
                </span>
              </div>
            </div>
            
            {/* Quick Search */}
            <div className="mt-6 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Поиск пациентки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-blue-50 border-blue-200 focus:border-blue-400"
                />
              </div>
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
                          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-white' : 'text-blue-600'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Critical Alerts */}
              <div className="p-4 space-y-3">
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-700 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Критические уведомления
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-600">Высокий риск</span>
                        <Badge variant="destructive" className="text-xs">2</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-600">Требует внимания</span>
                        <Badge variant="outline" className="text-xs">5</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-gradient-to-br from-blue-50 to-green-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-blue-700 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Сегодня
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-blue-600">Консультации:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Новые пациентки:</span>
                        <span className="font-medium">3</span>
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
          {/* Medical Tools Bar */}
          <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-playfair font-semibold text-foreground">
                  Медицинская панель
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Активные пациентки: 45
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Онлайн консультации: 3
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Калькулятор риска
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Новая запись
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
