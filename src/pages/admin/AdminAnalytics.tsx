import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, TrendingUp, Calendar, Download } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📈 Аналитика системы</h1>
            <p className="text-muted-foreground">Глобальная аналитика платформы Bloom</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Активные пользователи</p>
                  <p className="text-2xl font-bold text-foreground">1,847</p>
                  <p className="text-xs text-green-600">+15% за месяц</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Консультации</p>
                  <p className="text-2xl font-bold text-foreground">3,247</p>
                  <p className="text-xs text-green-600">+22% за месяц</p>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Записи данных</p>
                  <p className="text-2xl font-bold text-foreground">47,892</p>
                  <p className="text-xs text-blue-600">+8% за месяц</p>
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
                  <p className="text-2xl font-bold text-foreground">₽2,847,950</p>
                  <p className="text-xs text-green-600">+18% за месяц</p>
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
              Системная аналитика
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-muted-foreground">Графики системной аналитики</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <p className="text-purple-800">
                🔄 Детальная аналитика системы находится в разработке.
                Скоро здесь появятся интерактивные дашборды с метриками производительности,
                пользовательской активности и финансовыми показателями.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}