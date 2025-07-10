
import React, { useState } from 'react';
import { AppLayout } from './AppLayout';
import { Sidebar } from './Sidebar';
import { RoleSwitcher } from './RoleSwitcher';
import { UserRole } from '@/types/roles';
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
