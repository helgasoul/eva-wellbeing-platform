
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { UserRole } from '@/types/auth';
import { 
  Home, 
  Activity, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Phone,
  Plus,
  Calendar,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PatientLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ 
  children, 
  title = 'Eva - Ваш персональный помощник' 
}) => {
  const location = useLocation();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const navigation = [
    { name: 'Главная', href: '/patient/dashboard', icon: Home },
    { name: 'Мои симптомы', href: '/patient/symptoms', icon: Activity },
    { name: 'Документы', href: '/patient/documents', icon: FileText },
    { name: 'ИИ-консультант', href: '/patient/ai-chat', icon: MessageSquare },
    { name: 'Сообщество', href: '/patient/community', icon: Users },
    { name: 'Настройки', href: '/patient/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppLayout title={title} role={UserRole.PATIENT}>
      <div className="flex min-h-screen bg-gradient-to-br from-eva-cream via-eva-warm-beige to-eva-soft-pink">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white/80 backdrop-blur-sm border-r border-eva-dusty-rose/20">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-eva-dusty-rose to-eva-mauve rounded-full">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-playfair font-semibold text-foreground">
                  Мой Eva
                </span>
              </div>
            </div>
            
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-eva-dusty-rose to-eva-mauve text-white shadow-md'
                          : 'text-gray-700 hover:bg-eva-soft-pink hover:text-eva-dusty-rose'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 ${
                        isActive(item.href) ? 'text-white' : 'text-eva-dusty-rose'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Emergency Contact Card */}
              <div className="p-4">
                <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Экстренная помощь
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-600">Скорая помощь:</span>
                        <span className="font-medium">103</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Психологическая поддержка:</span>
                        <span className="font-medium">8-800-2000-122</span>
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
          {/* Quick Actions Bar */}
          <div className="bg-white/70 backdrop-blur-sm border-b border-eva-dusty-rose/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-playfair font-semibold text-foreground">
                  Добро пожаловать в ваш персональный кабинет
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-eva-dusty-rose to-eva-mauve hover:from-eva-mauve hover:to-eva-dusty-rose text-white"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Быстрое действие
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Календарь
                </Button>
              </div>
            </div>

            {/* Quick Actions Panel */}
            {showQuickActions && (
              <div className="mt-4 p-4 bg-eva-soft-pink/50 rounded-xl border border-eva-dusty-rose/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col">
                    <Activity className="h-5 w-5 mb-1 text-eva-dusty-rose" />
                    <span className="text-xs">Записать симптом</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col">
                    <MessageSquare className="h-5 w-5 mb-1 text-eva-dusty-rose" />
                    <span className="text-xs">Чат с ИИ</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col">
                    <Calendar className="h-5 w-5 mb-1 text-eva-dusty-rose" />
                    <span className="text-xs">Напоминание</span>
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-3 flex-col">
                    <Users className="h-5 w-5 mb-1 text-eva-dusty-rose" />
                    <span className="text-xs">Сообщество</span>
                  </Button>
                </div>
              </div>
            )}
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
