
import React from 'react';
import { UserRole } from '@/types/auth';
import { Heart, Briefcase, Shield } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onRoleChange
}) => {
  const roles = [
    {
      value: 'patient' as UserRole,
      label: 'Пациентка',
      description: 'Я хочу получать поддержку и консультации',
      icon: Heart,
      color: 'from-eva-coral to-primary'
    },
    {
      value: 'doctor' as UserRole,
      label: 'Врач',
      description: 'Я хочу консультировать пациенток',
      icon: Briefcase,
      color: 'from-eva-sage to-eva-sage-dark'
    },
    {
      value: 'admin' as UserRole,
      label: 'Администратор',
      description: 'Управление платформой',
      icon: Shield,
      color: 'from-eva-lavender to-eva-lavender-dark'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground mb-3">
        Выберите вашу роль
      </label>
      {roles.map((role) => {
        const IconComponent = role.icon;
        const isSelected = selectedRole === role.value;
        
        return (
          <div
            key={role.value}
            className={`
              relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-eva-rose-dark/30 bg-white/70 hover:border-primary/50 hover:bg-primary/5'
              }
            `}
            onClick={() => onRoleChange(role.value)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${role.color}`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-foreground">{role.label}</h3>
                  {isSelected && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {role.description}
                </p>
              </div>
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={isSelected}
                onChange={() => onRoleChange(role.value)}
                className="sr-only"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
