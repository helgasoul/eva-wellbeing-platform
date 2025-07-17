import React from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';

const DataSourcesDashboard: React.FC = () => {
  return (
    <PatientLayout title="Data Sources">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Sources</h1>
        <p>Data source management will be implemented here.</p>
      </div>
    </PatientLayout>
  );
};

export default DataSourcesDashboard;