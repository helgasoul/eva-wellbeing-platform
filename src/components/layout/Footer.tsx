
import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-bloom-soft-pink to-bloom-warm-beige border-t border-bloom-dusty-rose/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary to-bloom-mauve rounded-full">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-poppins font-semibold text-foreground bloom-brand">
                bloom
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Платформа поддержки женщин в период менопаузы. Мы помогаем женщинам 
              справляться с изменениями в организме, предоставляя профессиональную 
              медицинскую поддержку и создавая сообщество взаимопомощи.
            </p>
            <div className="flex space-x-4">
              <div className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors cursor-pointer">
                <Heart className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair font-semibold text-foreground mb-4">
              Быстрые ссылки
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'О платформе', path: '/about' },
                { label: 'Услуги', path: '/services' },
                { label: 'Специалисты', path: '/doctors' },
                { label: 'Поддержка', path: '/support' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-playfair font-semibold text-foreground mb-4">
              Контакты
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/70 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">+7 (800) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/70 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">info@bloom-health.ru</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/70 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Москва, Россия</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-bloom-dusty-rose/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 bloom. Все права защищены.
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
