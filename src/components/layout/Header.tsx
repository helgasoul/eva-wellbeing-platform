
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Cloud, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from './BackButton';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Logo } from '@/components/ui/logo';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = useSubscription();

  // Helper function to get plan display info
  const getPlanDisplayInfo = (plan: any) => {
    if (!plan) return null;
    
    switch (plan.id) {
      case 'essential':
        return { icon: '🌿', name: 'Essential', color: 'from-mint to-mint-light', textColor: 'hsl(var(--mint-foreground))' };
      case 'plus':
        return { icon: '🌺', name: 'Plus', color: 'from-orange to-orange-light', textColor: 'hsl(var(--orange-foreground))' };
      case 'optimum':
        return { icon: '⭐', name: 'Optimum', color: 'from-purple to-purple-light', textColor: 'hsl(var(--purple-foreground))' };
      case 'digital_twin':
        return { icon: '🤖', name: 'Digital Twin', color: 'from-soft-blue to-primary', textColor: 'hsl(var(--soft-blue-foreground))' };
      default:
        return { icon: '🌿', name: 'Essential', color: 'from-mint to-mint-light', textColor: 'hsl(var(--mint-foreground))' };
    }
  };

  const planInfo = getPlanDisplayInfo(currentPlan);

  // Проверяем, нужно ли показывать кнопку "Назад" в хедере
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/login-safe', '/emergency-access'].includes(location.pathname);
  const shouldShowBackButton = !isAuthPage;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Домой' },
    { path: '/about', label: 'Почему без | паузы' },
    { path: '/how-we-help', label: 'Как мы помогаем' },
    { path: '/contact', label: 'Написать команде' }
  ];

  // Simplified navigation for m4p version - always go to patient dashboard
  const handleMyProfileClick = React.useCallback(() => {
    navigate('/patient/dashboard');
  }, [navigate]);

  return (
    <header className="bg-background/98 backdrop-blur-md border-b border-border sticky top-0 z-[100] shadow-elegant">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Кнопка назад и логотип */}
          <div className="flex items-center gap-4">
            {shouldShowBackButton && <BackButton />}
            <Link to="/" className="flex items-center group hover:scale-105 transition-transform duration-200">
              <div className="flex items-center relative">
                <Logo size="md" showText={true} className="group-hover:animate-bloom-glow transition-all duration-300" />
                {/* Декоративная аура при hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-md scale-110"></div>
              </div>
            </Link>
          </div>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <div key={item.path} className="relative flex items-center">
                <Link
                  to={item.path}
                  className={`text-sm font-medium tracking-wide transition-all duration-200 relative pb-2 ${
                    isActive(item.path) 
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
                      : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Кнопки действий */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Отображение текущего тарифа для авторизованных пользователей */}
            {user && planInfo && (
              <Link to="/how-we-help" className="group">
                <div className={`bg-gradient-to-r ${planInfo.color} px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2`} style={{color: planInfo.textColor}}>
                  <span className="text-base">{planInfo.icon}</span>
                  <span>{planInfo.name}</span>
                  <Crown className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )}
            
            <Button 
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-muted/50 font-medium px-4 py-2 rounded-xl transition-all duration-200"
              onClick={handleMyProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              Мой профиль
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-muted/50 rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-foreground/80 hover:text-foreground hover:bg-muted/50 font-medium px-3 py-2 rounded-xl"
                onClick={() => {
                  handleMyProfileClick();
                  setIsMenuOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Мой профиль
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
