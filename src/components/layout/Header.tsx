
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/about', label: 'О платформе' },
    { path: '/services', label: 'Услуги', badge: 'НОВОЕ' },
    { path: '/contact', label: 'Контакты' }
  ];

  return (
    <header className="bg-background/98 backdrop-blur-md border-b border-border/60 sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <div className="logo-hover">
              <img 
                src="/lovable-uploads/7a0ec4e6-a4a7-4b76-b29d-c8ce93cce8c9.png" 
                alt="BLOOM - Платформа поддержки женщин" 
                className="h-16 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-12">
            {navItems.map((item) => (
              <div key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`nav-link text-base font-medium tracking-wide ${
                    isActive(item.path) 
                      ? 'text-primary active' 
                      : 'text-foreground/80'
                  }`}
                >
                  {item.label}
                </Link>
                {item.badge && (
                  <span className="absolute -top-2 -right-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/login">
              <Button 
                variant="ghost"
                className="cta-secondary text-foreground/80 font-medium px-6 py-3 rounded-xl h-auto group"
              >
                <LogIn className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Войти
              </Button>
            </Link>
            <Link to="/register">
              <Button className="cta-primary text-primary-foreground font-semibold px-8 py-3 rounded-xl h-auto group">
                <Sparkles className="mr-2 h-4 w-4 transition-all group-hover:rotate-12" />
                Начать заботу о себе
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-3 rounded-xl hover:bg-muted/50 transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Открыть меню"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" /> 
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-8 border-t border-border/30 animate-fade-in bg-card/95 backdrop-blur-sm rounded-b-2xl shadow-soft">
            <nav className="flex flex-col space-y-6">
              {navItems.map((item) => (
                <div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`block text-lg font-medium px-6 py-4 rounded-xl transition-all duration-200 ${
                      isActive(item.path) 
                        ? 'text-primary bg-primary/10 border-l-4 border-primary' 
                        : 'text-foreground hover:text-primary hover:bg-primary/5'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
              
              <div className="flex flex-col space-y-4 pt-8 border-t border-border/30 px-6">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full cta-secondary justify-center py-4 text-lg font-medium rounded-xl group"
                  >
                    <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Войти
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full cta-primary text-primary-foreground py-4 text-lg font-semibold rounded-xl group">
                    <Sparkles className="mr-2 h-5 w-5 transition-all group-hover:rotate-12" />
                    Начать заботу о себе
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
