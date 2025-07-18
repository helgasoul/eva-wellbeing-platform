
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/roles';
import { PatientDashboardHeader } from '@/components/patient/PatientDashboardHeader';
import { PatientDashboardCards } from '@/components/patient/PatientDashboardCards';
import { PatientDashboardCharts } from '@/components/patient/PatientDashboardCharts';
import { PatientDashboardActivities } from '@/components/patient/PatientDashboardActivities';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // 🔍 ДИАГНОСТИКА: Проверяем что роль загружается правильно после исправления
    console.group('🔍 ROLE DEBUG - After authService fix');
    console.log('1. User object:', user);
    console.log('2. User role:', user?.role);
    console.log('3. User role type:', typeof user?.role);
    console.log('4. Is patient?', user?.role === UserRole.PATIENT);
    console.log('5. Onboarding completed?', user?.onboardingCompleted);
    console.log('6. User firstName:', user?.firstName);
    console.log('7. User lastName:', user?.lastName);
    console.log('8. User email:', user?.email);
    
    // Проверить что роль соответствует ожиданиям
    if (user?.role === UserRole.PATIENT) {
      console.log('✅ Role loaded correctly: PATIENT');
    } else {
      console.warn('⚠️ Role issue detected:', user?.role);
    }
    
    console.groupEnd();
  }, [user]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <PatientDashboardHeader />
      <PatientDashboardCards />
      <PatientDashboardCharts />
      <PatientDashboardActivities />
    </div>
  );
};

export default PatientDashboard;
