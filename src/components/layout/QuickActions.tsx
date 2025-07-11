
import React from 'react';
import { UserRole } from '@/types/roles';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  AlertTriangle, 
  FileText,
  Users,
  Settings,
  Database,
  Shield
} from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

interface QuickActionsProps {
  role: UserRole;
  onAction?: (actionType: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ role, onAction }) => {
  const getActionsForRole = (userRole: UserRole): QuickAction[] => {
    switch (userRole) {
      case UserRole.PATIENT:
        return [
          {
            label: 'Записать симптом',
            icon: Plus,
            action: () => onAction?.('add-symptom')
          },
          {
            label: 'Задать вопрос ИИ',
            icon: MessageSquare,
            action: () => onAction?.('ai-chat')
          }
        ];
      
      case UserRole.DOCTOR:
        return [
          {
            label: 'Найти пациентку',
            icon: Search,
            action: () => onAction?.('search-patient')
          },
          {
            label: 'Критические уведомления',
            icon: AlertTriangle,
            action: () => onAction?.('critical-alerts'),
            variant: 'destructive'
          },
          {
            label: 'Новая консультация',
            icon: FileText,
            action: () => onAction?.('new-consultation')
          }
        ];
      
      case UserRole.ADMIN:
        return [
          {
            label: 'Создать пользователя',
            icon: Users,
            action: () => onAction?.('create-user')
          },
          {
            label: 'Системные алерты',
            icon: AlertTriangle,
            action: () => onAction?.('system-alerts'),
            variant: 'destructive'
          },
          {
            label: 'Настройки системы',
            icon: Settings,
            action: () => onAction?.('system-settings')
          },
          {
            label: 'Бэкап данных',
            icon: Database,
            action: () => onAction?.('backup-data')
          }
        ];
      
      default:
        return [];
    }
  };

  const actions = getActionsForRole(role);

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.action}
            className="flex items-center space-x-2"
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
