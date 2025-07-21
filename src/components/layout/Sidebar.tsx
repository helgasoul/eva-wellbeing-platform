
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { getNavigationForRole } from '@/config/navigation';

interface SidebarProps {
  role: UserRole;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed = false }) => {
  const location = useLocation();
  const navigation = getNavigationForRole(role);
  const isActive = (path: string) => location.pathname === path;

  // Show all navigation items in demo mode
  const filteredNavigation = navigation;

  const getRoleStyles = (userRole: UserRole) => {
    switch (userRole) {
      case UserRole.PATIENT:
        return {
          gradient: 'from-primary to-primary-foreground',
          bg: 'bg-background/95 backdrop-blur-sm border-primary/20',
          activeGradient: 'from-primary to-primary-foreground',
          hoverBg: 'hover:bg-primary/10 hover:text-primary',
          iconColor: 'text-primary',
          textColor: 'text-primary'
        };
      case UserRole.DOCTOR:
        return {
          gradient: 'from-blue-600 to-green-600',
          bg: 'bg-white border-blue-200',
          activeGradient: 'from-blue-600 to-green-600',
          hoverBg: 'hover:bg-blue-50 hover:text-blue-700',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-600'
        };
      case UserRole.ADMIN:
        return {
          gradient: 'from-gray-600 to-blue-600',
          bg: 'bg-white border-gray-200',
          activeGradient: 'from-gray-600 to-blue-600',
          hoverBg: 'hover:bg-gray-50 hover:text-gray-900',
          iconColor: 'text-gray-600',
          textColor: 'text-gray-600'
        };
      default:
        return {
          gradient: 'from-primary to-primary',
          bg: 'bg-white',
          activeGradient: 'from-primary to-primary',
          hoverBg: 'hover:bg-gray-50',
          iconColor: 'text-primary',
          textColor: 'text-primary'
        };
    }
  };

  const styles = getRoleStyles(role);

  if (filteredNavigation.length === 0) return null;

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 hidden md:flex md:flex-col`}>
      <div className={`flex flex-col flex-grow pt-5 overflow-y-auto ${styles.bg} border-r`}>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const isSymptomButton = item.href.includes('/symptoms');
              const linkClasses = isSymptomButton 
                ? `eva-symptom-button group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? `bg-gradient-to-r ${styles.activeGradient} text-white shadow-md`
                      : `${styles.hoverBg}`
                  }`
                : `group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? `bg-gradient-to-r ${styles.activeGradient} text-white shadow-md`
                      : `${styles.textColor} ${styles.hoverBg}`
                  }`;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={linkClasses}
                  data-symptom={isSymptomButton ? 'true' : undefined}
                >
                  <Icon className={`${isCollapsed ? 'mr-0' : 'mr-3'} h-5 w-5 ${
                    isActive(item.href) ? 'text-white' : styles.iconColor
                  }`} />
                  {!isCollapsed && (
                    <>
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};
