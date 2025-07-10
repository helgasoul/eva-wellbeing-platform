import React from 'react';
import { Sparkles } from 'lucide-react';

export const RegisterFormHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h2 className="text-2xl font-playfair font-semibold text-foreground mb-2">
        Создать аккаунт в Eva
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