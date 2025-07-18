import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const PatientDashboardActivities = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние активности</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">Пока нет активностей</span>
            </div>
            <span className="text-xs text-muted-foreground">Сегодня</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};