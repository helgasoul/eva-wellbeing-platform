
import React from 'react';
import { UserRole, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/types/roles';
import { Heart, Stethoscope, Shield } from 'lucide-react';
import bloomIcon from '@/assets/bloom-icon.png';

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
      value: UserRole.PATIENT,
      label: ROLE_LABELS[UserRole.PATIENT],
      description: ROLE_DESCRIPTIONS[UserRole.PATIENT],
      icon: 'bloom',
      color: 'from-eva-dusty-rose to-primary'
    },
    {
      value: UserRole.DOCTOR,
      label: 'Врач',
      description: 'Врач',
      icon: Stethoscope,
      color: 'from-eva-mauve to-eva-taupe'
    }
    // Роль администратора убрана из публичной регистрации
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground mb-3">
        Выберите вашу роль
      </label>
      {roles.map((role) => {
        const isSelected = selectedRole === role.value;
        
        return (
          <div
            key={role.value}
            className={`
              relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200
              ${isSelected 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-eva-dusty-rose/30 bg-white/70 hover:border-primary/50 hover:bg-primary/5'
              }
            `}
            onClick={() => onRoleChange(role.value)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                {role.icon === 'bloom' ? (
                  <img src={bloomIcon} alt="Bloom" className="h-6 w-6" />
                ) : (
                  <role.icon className="h-6 w-6 text-white" />
                )}
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
