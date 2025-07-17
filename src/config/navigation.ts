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
  Brain,
  Link as LinkIcon,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { UserRole } from '@/types/roles';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const NAVIGATION_CONFIG: Record<UserRole, NavigationItem[]> = {
  [UserRole.PATIENT]: [
    { name: 'Главная', href: '/patient/dashboard', icon: Home },
    { name: 'Мои симптомы', href: '/patient/symptoms', icon: Activity },
    { name: 'Трекер питания', href: '/patient/nutrition', icon: Calculator },
    { name: 'Рецепты', href: '/patient/recipes', icon: BookOpen },
    { name: 'План питания', href: '/patient/nutrition-plan', icon: BookOpen },
    { name: 'Анализ питания', href: '/patient/nutrition-analysis', icon: BarChart3 },
    { name: 'Академия без|паузы', href: '/patient/academy', icon: GraduationCap },
    { name: 'Трекер цикла', href: '/patient/cycle', icon: Calendar },
    { name: 'Календарь здоровья', href: '/patient/calendar', icon: Calendar },
    { name: 'Анализ сна', href: '/patient/sleep-dashboard', icon: Brain },
    { name: 'Источники данных', href: '/patient/data-sources', icon: Database },
    { name: 'Платформа документов', href: '/patient/document-platform', icon: FileText },
    { name: 'Диагностика данных', href: '/patient/diagnostics', icon: Database },
    { name: 'Интеграции данных', href: '/patient/health-data-integrations', icon: LinkIcon },
    { name: 'Запись к врачу', href: '/patient/doctor-booking', icon: Stethoscope },
    { name: 'Анализы', href: '/patient/lab-tests', icon: FileText },
    { name: 'Мои инсайты', href: '/patient/insights', icon: BarChart3 },
    { name: 'ИИ-помощник', href: '/patient/ai-chat', icon: MessageSquare, badge: 2 },
    { name: 'Мои документы', href: '/patient/documents', icon: FileText },
    { name: 'Рекомендации Eva', href: '/patient/recommendations', icon: AlertTriangle },
    { name: 'Расширенные рекомендации', href: '/patient/advanced-recommendations', icon: Brain },
    { name: 'Сообщество', href: '/patient/community', icon: Users },
    { name: 'Настройки', href: '/patient/settings', icon: Settings },
  ],
  
  [UserRole.DOCTOR]: [
    { name: 'Панель врача', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Мои пациентки', href: '/doctor/patients', icon: Users, badge: 5 },
    { name: 'Поиск пациенток', href: '/doctor/search', icon: Search },
    { name: 'Калькуляторы', href: '/doctor/embedded-calculators', icon: Calculator },
    { name: 'Аналитика', href: '/doctor/analytics', icon: BarChart3 },
    { name: 'База знаний', href: '/doctor/knowledge', icon: BookOpen },
    { name: 'Консультации', href: '/doctor/consultations', icon: Stethoscope },
    { name: 'Настройки', href: '/doctor/settings', icon: Settings },
  ],
  
  [UserRole.EXPERT]: [
    { name: 'Блог экспертов', href: '/expert/blog', icon: BookOpen },
    { name: 'Мои статьи', href: '/expert/articles', icon: FileText },
    { name: 'Настройки', href: '/expert/settings', icon: Settings },
  ],
  
  [UserRole.ADMIN]: [
    { name: 'Панель управления', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Пользователи', href: '/admin/users', icon: Users },
    { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Модерация', href: '/admin/moderation', icon: FileX, badge: 12 },
    { name: 'Настройки системы', href: '/admin/settings', icon: Settings },
    { name: 'Безопасность', href: '/admin/security', icon: Shield },
    { name: 'Отчеты', href: '/admin/reports', icon: FileText },
    { name: 'Логи системы', href: '/admin/logs', icon: Database },
    { name: 'Навигация', href: '/admin/navigation', icon: MapPin },
  ]
};

// Функция для получения навигации по роли
export const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  return NAVIGATION_CONFIG[role] || [];
};

// Функция для извлечения всех путей из навигации
export const extractRoutesFromNavigation = (): string[] => {
  const allRoutes: string[] = [];
  Object.values(NAVIGATION_CONFIG).forEach(navigation => {
    navigation.forEach(item => {
      allRoutes.push(item.href);
    });
  });
  return allRoutes;
};