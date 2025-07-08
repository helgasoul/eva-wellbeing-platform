
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { 
  Home, 
  Activity, 
  FileText, 
  MessageSquare, 
  Users, 
  Settings,
  Calendar,
  LayoutDashboard,
  Search,
  Calculator,
  BarChart3,
  BookOpen,
  Stethoscope,
  Shield,
  AlertTriangle,
  Database,
  FileX,
  Brain
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isCollapsed = false }) => {
  const location = useLocation();

  const getNavigationForRole = (userRole: UserRole): NavigationItem[] => {
    switch (userRole) {
      case UserRole.PATIENT:
        return [
          { name: 'Главная', href: '/patient/dashboard', icon: Home },
          { name: 'Мои симптомы', href: '/patient/symptoms', icon: Activity },
          { name: 'Питание', href: '/patient/nutrition', icon: Calculator },
          { name: 'Устройства', href: '/patient/wearables', icon: Brain },
          { name: 'Запись к врачу', href: '/patient/doctors', icon: Stethoscope },
          { name: 'Мои инсайты', href: '/patient/insights', icon: BarChart3 },
          { name: 'ИИ-помощник', href: '/patient/ai-chat', icon: MessageSquare, badge: 2 },
          { name: 'Мои документы', href: '/patient/documents', icon: FileText },
          { name: 'Сообщество', href: '/patient/community', icon: Users },
          { name: 'Календарь здоровья', href: '/patient/calendar', icon: Calendar },
          { name: 'Настройки', href: '/patient/settings', icon: Settings },
        ];
      
      case UserRole.DOCTOR:
        return [
          { name: 'Панель врача', href: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Мои пациентки', href: '/doctor/patients', icon: Users, badge: 5 },
          { name: 'Поиск пациенток', href: '/doctor/search', icon: Search },
          { name: 'Калькуляторы', href: '/doctor/calculators', icon: Calculator },
          { name: 'Аналитика', href: '/doctor/analytics', icon: BarChart3 },
          { name: 'База знаний', href: '/doctor/knowledge', icon: BookOpen },
          { name: 'Консультации', href: '/doctor/consultations', icon: Stethoscope },
          { name: 'Настройки', href: '/doctor/settings', icon: Settings },
        ];
      
      case UserRole.ADMIN:
        return [
          { name: 'Панель управления', href: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Пользователи', href: '/admin/users', icon: Users },
          { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Модерация', href: '/admin/moderation', icon: FileX, badge: 12 },
          { name: 'Настройки системы', href: '/admin/settings', icon: Settings },
          { name: 'Безопасность', href: '/admin/security', icon: Shield },
          { name: 'Отчеты', href: '/admin/reports', icon: FileText },
          { name: 'Логи системы', href: '/admin/logs', icon: Database },
        ];
      
      default:
        return [];
    }
  };

  const navigation = getNavigationForRole(role);
  const isActive = (path: string) => location.pathname === path;

  const getRoleStyles = (userRole: UserRole) => {
    switch (userRole) {
      case UserRole.PATIENT:
        return {
          gradient: 'from-eva-dusty-rose to-eva-mauve',
          bg: 'bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20',
          activeGradient: 'from-eva-dusty-rose to-eva-mauve',
          hoverBg: 'hover:bg-eva-soft-pink hover:text-eva-dusty-rose',
          iconColor: 'text-eva-dusty-rose'
        };
      case UserRole.DOCTOR:
        return {
          gradient: 'from-blue-600 to-green-600',
          bg: 'bg-white border-blue-200',
          activeGradient: 'from-blue-600 to-green-600',
          hoverBg: 'hover:bg-blue-50 hover:text-blue-700',
          iconColor: 'text-blue-600'
        };
      case UserRole.ADMIN:
        return {
          gradient: 'from-gray-600 to-blue-600',
          bg: 'bg-white border-gray-200',
          activeGradient: 'from-gray-600 to-blue-600',
          hoverBg: 'hover:bg-gray-50 hover:text-gray-900',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          gradient: 'from-primary to-primary',
          bg: 'bg-white',
          activeGradient: 'from-primary to-primary',
          hoverBg: 'hover:bg-gray-50',
          iconColor: 'text-primary'
        };
    }
  };

  const styles = getRoleStyles(role);

  if (navigation.length === 0) return null;

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 hidden md:flex md:flex-col`}>
      <div className={`flex flex-col flex-grow pt-5 overflow-y-auto ${styles.bg} border-r`}>
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
                      ? `bg-gradient-to-r ${styles.activeGradient} text-white shadow-md`
                      : `text-gray-700 ${styles.hoverBg}`
                  }`}
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
