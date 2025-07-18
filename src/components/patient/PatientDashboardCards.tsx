import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, TrendingUp } from 'lucide-react';

export const PatientDashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Трекер симптомов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Отслеживайте своё самочувствие</p>
          <Button className="w-full">
            Добавить запись
          </Button>
        </CardContent>
      </Card>
      
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Дневник питания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Записывайте приёмы пищи</p>
          <Button className="w-full">
            Добавить блюдо
          </Button>
        </CardContent>
      </Card>
      
      <Card className="hover-scale">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Активность
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Отслеживайте физическую активность</p>
          <Button className="w-full">
            Добавить активность
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};