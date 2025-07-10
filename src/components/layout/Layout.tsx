
import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { BackButton } from './BackButton';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 relative">
        {/* Дополнительная кнопка назад для контента */}
        <div className="absolute top-4 left-4 z-10">
          <BackButton 
            variant="outline" 
            className="bg-background/80 backdrop-blur-sm shadow-sm" 
          />
        </div>
        {children}
      </main>
      <Footer />
    </div>
  );
};
