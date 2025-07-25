import React from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp, Calendar, Download } from 'lucide-react';

export default function DoctorAnalytics() {
  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📊 Аналитика</h1>
            <p className="text-muted-foreground">Аналитика по вашим пациенткам и практике</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Период
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Экспорт отчета
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Консультации</p>
                  <p className="text-2xl font-bold text-foreground">142</p>
                  <p className="text-xs text-green-600">+8% от прошлого месяца</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Новые пациентки</p>
                  <p className="text-2xl font-bold text-foreground">23</p>
                  <p className="text-xs text-green-600">+15% от прошлого месяца</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Средний рейтинг</p>
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-xs text-muted-foreground">из 5 звезд</p>
                </div>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Доход</p>
                  <p className="text-2xl font-bold text-foreground">₽89,450</p>
                  <p className="text-xs text-green-600">+12% от прошлого месяца</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Динамика показателей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">Графики аналитики</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800">
                🔄 Интерактивные графики и детальная аналитика находятся в разработке.
                Скоро здесь появятся подробные отчеты по эффективности лечения,
                анализ трендов и предиктивная аналитика.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}