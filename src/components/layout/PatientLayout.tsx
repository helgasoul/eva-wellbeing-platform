
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { TestModeIndicator } from './TestModeIndicator';
import { MobileNavigation } from './MobileNavigation';
import { UserRole } from '@/types/roles';
import { BreadcrumbItem } from './Breadcrumbs';

interface PatientLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ 
  children, 
  title = 'без | паузы - Ваш персональный помощник',
  breadcrumbs = []
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <TestModeIndicator />
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
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <main className="flex-1 p-6 pb-20 md:pb-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <MobileNavigation role={UserRole.PATIENT} />
      </AppLayout>
    </>
  );
};
