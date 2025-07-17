import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const DataSourcesDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/patient/dashboard');
  };

  return (
    <PatientLayout title="Источники данных">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад в дашборд
          </Button>
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Источники данных</h1>
        <p>Управление источниками данных будет реализовано здесь.</p>
      </div>
    </PatientLayout>
  );
};

export default DataSourcesDashboard;