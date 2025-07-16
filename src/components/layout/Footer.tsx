
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background via-purple-50/20 to-pink-50/30 border-t border-purple-200/20 relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4 group relative">
              <Logo size="lg" showText={true} showSlogan={true} className="animate-petal-dance group-hover:animate-bloom-glow transition-all duration-300" />
              {/* Декоративная аура при hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-lg scale-150"></div>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed text-lg">
              без | паузы — пространство поддержки и заботы для женщин в период менопаузы.
              Мы рядом, чтобы помочь принять и понять все изменения, делиться знаниями 
              и теплом, и быть вместе в сообществе, где важна каждая история.
            </p>
            <div className="flex space-x-4">
              <div className="p-2 bg-white/70 rounded-full hover:bg-white transition-all duration-300 cursor-pointer hover:scale-110">
                <Heart className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Навигация
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'О нас', path: '/about' },
                { label: 'Как мы помогаем', path: '/services' },
                { label: 'Команда', path: '/doctors' },
                { label: 'Вопросы и поддержка', path: '/support' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-105 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Контакты
            </h3>
            <p className="text-sm text-muted-foreground mb-4 italic">
              Напишите или позвоните — мы всегда ответим с заботой
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">+7 (800) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">info@bezpauzy.ru</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Работаем онлайн для всей России и мира</span>
              </div>
            </div>
          </div>
        </div>

        {/* Care Message */}
        <div className="text-center mt-12 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-lg font-medium text-foreground italic">
              С заботой о вас, команда без | паузы
            </p>
            <Heart className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-200/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 без | паузы. Всё для вашего спокойствия и уверенности.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
