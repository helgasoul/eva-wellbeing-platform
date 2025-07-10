
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { TestModeIndicator } from './TestModeIndicator';
import { UserRole } from '@/types/roles';
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
    <>
      <TestModeIndicator />
      <AppLayout 
        title={title} 
        role={UserRole.DOCTOR}
        breadcrumbs={breadcrumbs}
        quickActions={true}
      >
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <Sidebar 
          role={UserRole.DOCTOR} 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

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
    </>
  );
};
