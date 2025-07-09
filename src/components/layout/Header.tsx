import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Домой' },
    { path: '/about', label: 'Почему Bloom' },
    { path: '/services', label: 'Как мы помогаем' },
    { path: '/contact', label: 'Написать команде' }
  ];

  return (
    <header className="bg-background/98 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-elegant">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Логотип */}
          <Link to="/" className="flex items-center group hover:scale-105 transition-transform duration-200">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                BLOOM
              </h1>
            </div>
          </Link>

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
            <Link to="/login">
              <Button 
                variant="ghost"
                className="text-foreground/80 hover:text-foreground hover:bg-muted/50 font-medium px-4 py-2 rounded-xl transition-all duration-200"
              >
                Мой Bloom
              </Button>
            </Link>
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
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center py-3 font-medium rounded-xl"
                  >
                    Мой Bloom
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <div className="flex flex-col items-center">
                    <Button className="w-full bg-gradient-to-r from-primary/90 via-primary to-primary/85 text-primary-foreground py-3 font-semibold group rounded-2xl border border-primary/20">
                      <Cloud className="mr-2 h-4 w-4 transition-all duration-300 group-hover:animate-gentle-float" />
                      С заботой о себе
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Сделайте шаг к спокойствию
                    </p>
                  </div>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};