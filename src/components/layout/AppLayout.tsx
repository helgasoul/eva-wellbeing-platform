
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { TopNavbar } from './TopNavbar';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { QuickActions } from './QuickActions';
import { logger } from '@/utils/logger';
import { generateBreadcrumbs } from '@/utils/breadcrumbGenerator';

interface AppLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  showNavigation?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  quickActions?: boolean;
  onQuickAction?: (actionType: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  title = 'без | паузы',
  role,
  showNavigation = true,
  breadcrumbs = [],
  quickActions = false,
  onQuickAction
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Auto-generate breadcrumbs if not provided
  const displayBreadcrumbs = breadcrumbs?.length > 0 ? breadcrumbs : generateBreadcrumbs(location.pathname);

  const handleQuickAction = (actionType: string) => {
    if (onQuickAction) {
      onQuickAction(actionType);
    } else {
      // Default action handlers
      switch (actionType) {
        case 'emergency':
          alert('Экстренная служба: 103');
          break;
        case 'ai-chat':
          window.location.href = '/patient/ai-chat';
          break;
        case 'add-symptom':
          window.location.href = '/patient/symptoms';
          break;
        case 'search-patient':
          window.location.href = '/doctor/search';
          break;
        case 'critical-alerts':
          logger.debug('Show critical notifications');
          break;
        case 'system-alerts':
          logger.debug('Show system alerts');
          break;
        default:
          logger.warn('Unknown action type', { actionType });
      }
    }
  };

  if (!user) {
    return <div>{children}</div>;
  }

  const userRole = role || user.role;

  return (
    <div className="min-h-screen bg-bloom-cream">
      {/* Top Navigation */}
      {showNavigation && (
        <TopNavbar 
          user={user} 
          role={userRole} 
          onLogout={logout}
          title={title}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs items={displayBreadcrumbs} />
          
          {/* Quick Actions */}
          {quickActions && userRole && (
            <div className="mb-6">
              <QuickActions role={userRole} onAction={handleQuickAction} />
            </div>
          )}
          
          {/* Page Content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-bloom-warm-cream to-bloom-soft-peach border-t border-primary/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-bloom-caramel rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">б</span>
              </div>
              <span className="text-sm soft-text">
                © 2024 без | паузы. Платформа поддержки женщин.
              </span>
            </div>
            <div className="flex space-x-4 text-sm soft-text">
              <a href="/privacy" className="hover:text-primary transition-colors interactive-hover">
                Конфиденциальность
              </a>
              <a href="/terms" className="hover:text-primary transition-colors interactive-hover">
                Условия использования
              </a>
              <a href="/contact" className="hover:text-primary transition-colors interactive-hover">
                Контакты
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
