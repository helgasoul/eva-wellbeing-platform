
import React from 'react';
import { User } from '@/types/auth';
import { UserRole } from '@/types/roles';
import { Bell, Search, User as UserIcon, LogOut, Settings, MessageCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RoleSwitcher } from './RoleSwitcher';
import { BackButton } from './BackButton';
import { useSubscription } from '@/context/SubscriptionContext';
import { Logo } from '@/components/ui/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavbarProps {
  user: User;
  role: UserRole;
  onLogout: () => void;
  title?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  user, 
  role, 
  onLogout, 
  title = 'Eva' 
}) => {
  const { currentPlan } = useSubscription();
  
  const getRoleColor = (userRole: UserRole) => {
    switch (userRole) {
      case UserRole.PATIENT:
        return 'text-eva-dusty-rose';
      case UserRole.DOCTOR:
        return 'text-blue-600';
      case UserRole.ADMIN:
        return 'text-gray-600';
      default:
        return 'text-primary';
    }
  };

  const getRoleDisplayName = (userRole: UserRole) => {
    switch (userRole) {
      case UserRole.PATIENT:
        return 'Пациентка';
      case UserRole.DOCTOR:
        return 'Врач';
      case UserRole.ADMIN:
        return 'Администратор';
      default:
        return 'Пользователь';
    }
  };

  // Helper function to get plan display info
  const getPlanDisplayInfo = (plan: any) => {
    if (!plan) return { icon: '🌿', name: 'Essential', color: 'bg-mint text-mint-foreground' };
    
    switch (plan.id) {
      case 'essential':
        return { icon: '🌿', name: 'Essential', color: 'bg-mint text-mint-foreground' };
      case 'plus':
        return { icon: '🌺', name: 'Plus', color: 'bg-orange text-orange-foreground' };
      case 'optimum':
        return { icon: '⭐', name: 'Optimum', color: 'bg-purple text-purple-foreground' };
      case 'digital_twin':
        return { icon: '🤖', name: 'Digital Twin', color: 'bg-soft-blue text-soft-blue-foreground' };
      default:
        return { icon: '🌿', name: 'Essential', color: 'bg-mint text-mint-foreground' };
    }
  };

  const planInfo = getPlanDisplayInfo(currentPlan);

  const handleContactTeam = () => {
    window.open('mailto:support@bezpauzy.com', '_blank');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title with Back Button */}
          <div className="flex items-center space-x-4">
            <BackButton />
            <div className="flex items-center space-x-3">
              {/* Логотип с иконкой */}
              <div className="flex items-center space-x-2">
                <Logo size="sm" showText={false} />
              </div>
              <div>
                <h1 className="text-xl font-playfair font-semibold text-foreground">
                  {title}
                </h1>
                <p className={`text-xs ${getRoleColor(role)}`}>
                  {getRoleDisplayName(role)}
                </p>
              </div>
            </div>
          </div>

          {/* Center actions for patients */}
          <div className="flex items-center space-x-3">
            {/* Тариф пользователя */}
            {role === UserRole.PATIENT && (
              <Badge variant="secondary" className={`${planInfo.color} px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1`}>
                <span>{planInfo.icon}</span>
                <span>{planInfo.name}</span>
                <Crown className="h-3 w-3" />
              </Badge>
            )}

            {/* Кнопка "Написать команде" */}
            {role === UserRole.PATIENT && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactTeam}
                className="flex items-center gap-2 text-xs hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Написать команде</span>
              </Button>
            )}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - только для врачей и админов */}
            {(role === UserRole.DOCTOR || role === UserRole.ADMIN) && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Поиск..."
                    className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {/* Role Switcher - только для администраторов */}
            <RoleSwitcher />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-eva-dusty-rose to-primary text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Профиль</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
