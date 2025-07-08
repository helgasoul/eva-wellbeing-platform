
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { UserRole } from '@/types/auth';
import { BreadcrumbItem } from './Breadcrumbs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';

interface DoctorLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const DoctorLayout: React.FC<DoctorLayoutProps> = ({ 
  children, 
  title = 'Eva - Врачебная панель',
  breadcrumbs = []
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppLayout 
      title={title} 
      role={UserRole.DOCTOR}
      breadcrumbs={breadcrumbs}
      quickActions={true}
    >
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <div className="flex">
          <Sidebar 
            role={UserRole.DOCTOR} 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* Medical Stats Cards - внутри sidebar области */}
          <div className="hidden md:block absolute bottom-4 left-4 right-4 max-w-56 space-y-3">
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
