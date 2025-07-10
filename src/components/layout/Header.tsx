import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Cloud, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from './BackButton';
import { useAuth } from '@/context/AuthContext';
import bloomLogo from '@/assets/bloom-logo-white-bg.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNavigating, setIsNavigating] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

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

  // Smart navigation for "Мой Bloom" button
  const handleMyBloomClick = React.useCallback(() => {
    if (isNavigating || authLoading) {
      return; // Prevent multiple clicks during navigation or loading
    }
    
    setIsNavigating(true);
    
    try {
      if (user) {
        // User is authenticated - go to dashboard
        const dashboardPath = user.role === 'doctor' ? '/doctor/dashboard' 
                            : user.role === 'admin' ? '/admin/dashboard' 
                            : '/patient/dashboard';
        console.log('Navigating authenticated user to:', dashboardPath);
        navigate(dashboardPath);
      } else {
        // User is not authenticated - go to registration for new users
        console.log('Navigating unauthenticated user to registration');
        navigate('/register');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      navigate('/register');
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  }, [user, navigate, isNavigating, authLoading]);

  return (
    <header className="bg-background/98 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-elegant">
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
          <div className="md:hidden py-6 border-t border-border/30 animate-fade-in bg-card/95 backdrop-blur-sm rounded-b-xl">
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