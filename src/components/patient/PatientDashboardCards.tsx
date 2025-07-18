import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PatientDashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Симптомы</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">записей сегодня</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Питание</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">записей сегодня</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Активность</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground">активностей сегодня</p>
        </CardContent>
      </Card>
    </div>
  );
};