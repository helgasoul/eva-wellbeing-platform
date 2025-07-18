import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Activity } from 'lucide-react';

export const PatientDashboardActivities = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Последняя активность
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Завершен онбординг</p>
              <p className="text-xs text-muted-foreground">Добро пожаловать в Eva!</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Сегодня
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-60">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Ожидание следующих записей</p>
              <p className="text-xs text-muted-foreground">Начните отслеживать свои симптомы</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};