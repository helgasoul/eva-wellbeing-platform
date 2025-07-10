import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  className = '', 
  variant = 'ghost',
  size = 'sm',
  showText = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Проверяем, есть ли история для возврата
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Если истории нет, переходим на главную или дашборд в зависимости от текущего пути
      if (location.pathname.startsWith('/patient')) {
        navigate('/patient/dashboard');
      } else if (location.pathname.startsWith('/doctor')) {
        navigate('/doctor/dashboard');
      } else if (location.pathname.startsWith('/admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  // Не показываем кнопку "Назад" на главных страницах и страницах аутентификации
  const hideOnPages = [
    '/', 
    '/patient/dashboard', 
    '/doctor/dashboard', 
    '/admin/dashboard',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/login-safe',
    '/emergency-access'
  ];
  
  if (hideOnPages.includes(location.pathname)) {
    console.log('🔍 BackButton: Hidden on page:', location.pathname);
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBack}
      className={`flex items-center gap-2 ${className}`}
      aria-label="Вернуться назад"
    >
      <ChevronLeft className="h-4 w-4" />
      {showText && <span className="hidden sm:inline">Назад</span>}
    </Button>
  );
};