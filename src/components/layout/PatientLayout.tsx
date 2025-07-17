
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
  hideSidebar?: boolean;
  hideQuickActions?: boolean;
}

export const PatientLayout: React.FC<PatientLayoutProps> = ({ 
  children, 
  title = 'без | паузы - Ваш персональный помощник',
  breadcrumbs = [],
  hideSidebar = false,
  hideQuickActions = false
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <TestModeIndicator />
      <div className="min-h-screen bg-gradient-to-br from-bloom-cream via-bloom-vanilla to-bloom-warm-cream">
        <AppLayout 
          title={title} 
          role={UserRole.PATIENT}
          breadcrumbs={breadcrumbs}
          quickActions={!hideQuickActions}
          showNavigation={true}
        >
          <div className="flex min-h-screen">
            {/* Sidebar - conditionally rendered */}
            {!hideSidebar && (
              <Sidebar 
                role={UserRole.PATIENT} 
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />
            )}

            {/* Main Content */}
            <div className="flex flex-col flex-1">
              <main className="flex-1 p-6 pb-20 md:pb-6">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AppLayout>
        
        {/* Mobile Navigation - conditionally rendered */}
        {!hideSidebar && <MobileNavigation role={UserRole.PATIENT} />}
      </div>
    </>
  );
};
