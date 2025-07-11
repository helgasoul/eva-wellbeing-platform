import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { 
  Home, 
  Activity, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Calendar,
  LayoutDashboard,
  Calculator,
  BarChart3,
  BookOpen,
  Stethoscope,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  role: UserRole;
  className?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ role, className }) => {
  const location = useLocation();

  const getMainNavigationForRole = (userRole: UserRole): NavigationItem[] => {
    switch (userRole) {
      case UserRole.PATIENT:
        return [
          { name: 'Главная', href: '/patient/dashboard', icon: Home },
          { name: 'Симптомы', href: '/patient/symptoms', icon: Activity },
          { name: 'Питание', href: '/patient/nutrition', icon: Calculator },
          { name: 'ИИ-помощник', href: '/patient/ai-chat', icon: MessageSquare, badge: 2 },
          { name: 'Настройки', href: '/patient/settings', icon: Settings },
        ];
      
      case UserRole.DOCTOR:
        return [
          { name: 'Панель', href: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Пациентки', href: '/doctor/patients', icon: Users, badge: 5 },
          { name: 'Калькуляторы', href: '/doctor/embedded-calculators', icon: Calculator },
          { name: 'Консультации', href: '/doctor/consultations', icon: Stethoscope },
          { name: 'Настройки', href: '/doctor/settings', icon: Settings },
        ];
      
      case UserRole.ADMIN:
        return [
          { name: 'Панель', href: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Пользователи', href: '/admin/users', icon: Users },
          { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Отчеты', href: '/admin/reports', icon: FileText },
          { name: 'Настройки', href: '/admin/settings', icon: Settings },
        ];
      
      default:
        return [];
    }
  };

  const navigation = getMainNavigationForRole(role);
  const isActive = (path: string) => location.pathname === path;

  const getRoleStyles = (userRole: UserRole) => {
    switch (userRole) {
      case UserRole.PATIENT:
        return {
          activeColor: 'text-eva-dusty-rose',
          activeBg: 'bg-eva-dusty-rose/10',
          inactiveColor: 'text-muted-foreground'
        };
      case UserRole.DOCTOR:
        return {
          activeColor: 'text-blue-600',
          activeBg: 'bg-blue-50',
          inactiveColor: 'text-muted-foreground'
        };
      case UserRole.ADMIN:
        return {
          activeColor: 'text-gray-600',
          activeBg: 'bg-gray-50',
          inactiveColor: 'text-muted-foreground'
        };
      default:
        return {
          activeColor: 'text-primary',
          activeBg: 'bg-primary/10',
          inactiveColor: 'text-muted-foreground'
        };
    }
  };

  const styles = getRoleStyles(role);

  if (navigation.length === 0) return null;

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden",
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200 relative",
                active ? styles.activeBg : "hover:bg-muted/50"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 mb-1",
                  active ? styles.activeColor : styles.inactiveColor
                )} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate max-w-full",
                active ? styles.activeColor : styles.inactiveColor
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};