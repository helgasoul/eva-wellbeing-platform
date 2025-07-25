
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
      <main className="flex-1 relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
};
