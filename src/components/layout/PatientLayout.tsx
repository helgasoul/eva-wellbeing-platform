
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { UserRole } from '@/types/auth';
import { BreadcrumbItem } from './Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone } from 'lucide-react';

interface PatientLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ 
  children, 
  title = 'Eva - Ваш персональный помощник',
  breadcrumbs = []
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AppLayout 
      title={title} 
      role={UserRole.PATIENT}
      breadcrumbs={breadcrumbs}
      quickActions={true}
    >
      <div className="flex min-h-screen bg-gradient-to-br from-bloom-cream via-bloom-vanilla to-bloom-warm-cream">
        {/* Sidebar */}
        <div className="flex">
          <Sidebar 
            role={UserRole.PATIENT} 
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          
          {/* Emergency Contact Card - внутри sidebar области */}
          <div className="hidden md:block absolute bottom-4 left-4 right-4 max-w-56">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 shadow-gentle">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-600 text-sm flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Экстренная помощь
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-500">Скорая помощь:</span>
                    <span className="font-medium text-red-700">103</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-500">Психологическая поддержка:</span>
                    <span className="font-medium text-red-700">8-800-2000-122</span>
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
