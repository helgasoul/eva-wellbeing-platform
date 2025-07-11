import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Cloud, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from './BackButton';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import bloomLogo from '@/assets/bloom-logo-white-bg.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { currentPlan } = useSubscription();

  // Helper function to get plan display info
  const getPlanDisplayInfo = (plan: any) => {
    if (!plan) return null;
    
    switch (plan.id) {
      case 'essential':
        return { icon: '🌿', name: 'Essential', color: 'from-mint to-mint-light' };
      case 'plus':
        return { icon: '🌺', name: 'Plus', color: 'from-orange-500 to-red-500' };
      case 'optimum':
        return { icon: '⭐', name: 'Optimum', color: 'from-purple-500 to-indigo-500' };
      case 'digital_twin':
        return { icon: '🤖', name: 'Digital Twin', color: 'from-cyan-500 to-blue-600' };
      default:
        return { icon: '🌿', name: 'Essential', color: 'from-green-500 to-emerald-500' };
    }
  };

  const planInfo = getPlanDisplayInfo(currentPlan);

  // Проверяем, нужно ли показывать кнопку "Назад" в хедере
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/login-safe', '/emergency-access'].includes(location.pathname);
  const shouldShowBackButton = !isAuthPage;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Домой' },
    { path: '/about', label: 'Почему Bloom' },
    { path: '/how-we-help', label: 'Как мы помогаем' },
    { path: '/contact', label: 'Написать команде' }
  ];

  // Smart navigation for "Мой Bloom" button with enhanced error handling
  const handleMyBloomClick = React.useCallback(async () => {
    if (isNavigating || authLoading) {
      console.log('🔄 Navigation blocked: already navigating or loading auth');
      return;
    }
    
    setIsNavigating(true);
    console.log('🚀 Starting navigation:', { user: !!user, userRole: user?.role, currentPath: location.pathname });
    
    try {
      // Add a small delay to ensure auth state is stable
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (user) {
        // User is authenticated - go to dashboard
        const dashboardPath = user.role === 'doctor' ? '/doctor/dashboard' 
                            : user.role === 'admin' ? '/admin/dashboard' 
                            : '/patient/dashboard';
        
        console.log('✅ Navigating authenticated user:', { 
          userId: user.id, 
          role: user.role, 
          path: dashboardPath 
        });
        
        navigate(dashboardPath);
      } else {
        // User is not authenticated - go to registration for new users
        console.log('➡️ Navigating unauthenticated user to registration');
        navigate('/register');
      }
    } catch (error) {
      console.error('❌ Navigation error:', error);
      
      // Enhanced fallback with user feedback
      try {
        console.log('🔄 Attempting fallback navigation');
        navigate('/register');
      } catch (fallbackError) {
        console.error('❌ Fallback navigation also failed:', fallbackError);
        // Force page reload as last resort
        window.location.href = '/register';
      }
    } finally {
      // Reset navigation state after a reasonable delay
      setTimeout(() => {
        setIsNavigating(false);
        console.log('🏁 Navigation state reset');
      }, 1000);
    }
  }, [user, navigate, isNavigating, authLoading, location.pathname]);

  return (
    <header className="bg-background/98 backdrop-blur-md border-b border-border sticky top-0 z-[100] shadow-elegant">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Кнопка назад и логотип */}
          <div className="flex items-center gap-4">
            {shouldShowBackButton && <BackButton />}
            <Link to="/" className="flex items-center group hover:scale-105 transition-transform duration-200">
              <div className="flex items-center relative">
                <img 
                  src={bloomLogo} 
                  alt="Bloom - Ваш заботливый помощник в мире женского здоровья"
                  className="h-24 w-auto object-contain group-hover:animate-bloom-glow transition-all duration-300"
                />
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
                <div className={`bg-gradient-to-r ${planInfo.color} text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer flex items-center gap-2`}>
                  <span className="text-base">{planInfo.icon}</span>
                  <span>{planInfo.name}</span>
                  <Crown className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            )}
            
            <Button 
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-muted/50 font-medium px-4 py-2 rounded-xl transition-all duration-200"
              onClick={handleMyBloomClick}
              disabled={isNavigating}
            >
              {user ? (
                <User className="mr-2 h-4 w-4" />
              ) : null}
              {user ? 'Мой профиль' : 'Мой Bloom'}
            </Button>
            
            {!user && (
              <div className="flex flex-col items-center">
                <Link to="/register">
                  <Button 
                    className="bg-gradient-to-r from-primary/90 via-primary to-primary/85 text-primary-foreground font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-elegant hover:shadow-soft hover:scale-105 group border border-primary/20"
                  >
                    <Cloud className="mr-2 h-4 w-4 transition-all duration-300 group-hover:animate-gentle-float" />
                    С заботой о себе
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Сделайте шаг к спокойствию
                </p>
              </div>
            )}
          </div>

          {/* Мобильное меню */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Открыть меню"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 text-foreground" /> 
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Мобильная навигация */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-border/30 animate-fade-in bg-card/95 backdrop-blur-sm rounded-b-xl relative z-50">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`flex items-center text-base font-medium px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path) 
                        ? 'text-primary bg-primary/10' 
                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              
              <div className="flex flex-col space-y-3 pt-4 border-t border-border/30">
                {/* Отображение текущего тарифа в мобильной версии */}
                {user && planInfo && (
                  <Link 
                    to="/how-we-help" 
                    className="group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className={`bg-gradient-to-r ${planInfo.color} text-white px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 w-full`}>
                      <span className="text-base">{planInfo.icon}</span>
                      <span>Мой тариф: {planInfo.name}</span>
                      <Crown className="h-3 w-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                )}

                <Button 
                  variant="ghost" 
                  className="w-full justify-center py-3 font-medium rounded-xl"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleMyBloomClick();
                  }}
                  disabled={isNavigating}
                >
                  {user ? (
                    <User className="mr-2 h-4 w-4" />
                  ) : null}
                  {user ? 'Мой профиль' : 'Мой Bloom'}
                </Button>
                
                {!user && (
                  <div className="flex flex-col items-center">
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-primary/90 via-primary to-primary/85 text-primary-foreground py-3 font-semibold group rounded-2xl border border-primary/20">
                        <Cloud className="mr-2 h-4 w-4 transition-all duration-300 group-hover:animate-gentle-float" />
                        С заботой о себе
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Сделайте шаг к спокойствию
                    </p>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};