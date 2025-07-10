import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Heart, Briefcase, Shield, ChevronDown, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const RoleSwitcher: React.FC = () => {
  const { user, switchRole, isTestingRole } = useAuth();

  // Показываем компонент только для администраторов
  if (!user || (user.role !== UserRole.ADMIN && !isTestingRole)) {
    return null;
  }

  const roles = [
    {
      value: UserRole.ADMIN,
      label: 'Администратор',
      description: 'Управление платформой',
      icon: Shield,
      color: 'text-blue-600'
    },
    {
      value: UserRole.PATIENT,
      label: 'Пациентка',
      description: 'Тестирование интерфейса пациентки',
      icon: Heart,
      color: 'text-pink-600'
    },
    {
      value: UserRole.DOCTOR,
      label: 'Врач',
      description: 'Тестирование интерфейса врача',
      icon: Briefcase,
      color: 'text-green-600'
    }
  ];

  const getCurrentRole = () => {
    return roles.find(role => role.value === user.role);
  };

  const currentRole = getCurrentRole();

  return (
    <div className="flex items-center space-x-2">
      {isTestingRole && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <TestTube className="h-3 w-3 mr-1" />
          Режим тестирования
        </Badge>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-white/90 border-gray-200 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-2">
              {currentRole && (
                <>
                  <currentRole.icon className={`h-4 w-4 ${currentRole.color}`} />
                  <span className="text-sm font-medium text-gray-700">
                    {currentRole.label}
                  </span>
                </>
              )}
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-lg">
          <DropdownMenuLabel className="text-gray-700 font-medium">
            Переключение роли
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isCurrentRole = user.role === role.value;
            
            return (
              <DropdownMenuItem
                key={role.value}
                onClick={() => switchRole(role.value)}
                className={`
                  cursor-pointer p-3 
                  ${isCurrentRole ? 'bg-gray-50' : 'hover:bg-gray-50'}
                `}
                disabled={isCurrentRole}
              >
                <div className="flex items-start space-x-3 w-full">
                  <IconComponent className={`h-5 w-5 ${role.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {role.label}
                      </span>
                      {isCurrentRole && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Текущая
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <div className="p-2">
            <p className="text-xs text-gray-500 text-center">
              💡 Переключайтесь между ролями для тестирования функционала
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};