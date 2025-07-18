import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, Heart, BarChart3 } from 'lucide-react';

export const PatientDashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Симптомы за неделю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">График симптомов</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Настроение и самочувствие
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">График настроения</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};