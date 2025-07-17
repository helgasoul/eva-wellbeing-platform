import React from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';

const SleepDashboard: React.FC = () => {
  return (
    <PatientLayout title="Sleep Dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Sleep Dashboard</h1>
        <p>Sleep tracking and analysis will be implemented here.</p>
      </div>
    </PatientLayout>
  );
};

export default SleepDashboard;