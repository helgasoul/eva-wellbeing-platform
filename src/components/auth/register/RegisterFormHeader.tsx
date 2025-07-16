import React from 'react';
import { Logo } from '@/components/ui/logo';

export const RegisterFormHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <Logo size="lg" showText={true} showSlogan={true} />
      </div>
      
      <h2 className="text-2xl font-playfair font-semibold text-foreground mb-2">
        Создать аккаунт
      </h2>
      
      <p className="text-muted-foreground">
        Присоединяйтесь к сообществу заботы о женском здоровье
      </p>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Создание персонального помощника для менопаузы</p>
      </div>
    </div>
  );
};