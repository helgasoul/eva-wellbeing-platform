import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboardHeader = () => {
  const { user } = useAuth();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Добро пожаловать, {user?.firstName}! 👋
      </h1>
      <p className="text-gray-600">
        Ваша персональная платформа поддержки в период менопаузы
      </p>
    </div>
  );
};