import React from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function DoctorAnalytics() {
  const stats = {
    totalPatients: 47,
    activePatients: 32,
    consultationsThisMonth: 89,
    avgResponseTime: '2.3 часа',
    riskPatients: 5,
    appointmentsToday: 8
  };

  const recentTrends = [
    { condition: 'СПКЯ', increase: '+12%', isPositive: false },
    { condition: 'Менопауза', increase: '+8%', isPositive: false },
    { condition: 'Профилактика', increase: '+15%', isPositive: true },
  ];

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Аналитика</h1>
          <p className="text-muted-foreground">Статистика вашей практики</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пациенток</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                Активных: {stats.activePatients}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Консультации в месяц</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consultationsThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                Сегодня: {stats.appointmentsToday}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Время ответа</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
              <p className="text-xs text-green-600">
                ↓ На 15% быстрее прошлого месяца
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Пациентки группы риска</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.riskPatients}</div>
              <p className="text-xs text-muted-foreground">
                Требуют внимания
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Тренды по состояниям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-foreground">{trend.condition}</span>
                    <Badge variant={trend.isPositive ? "default" : "destructive"}>
                      {trend.increase}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Популярные консультации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Нарушения цикла</span>
                  <span className="text-muted-foreground">34%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Планирование беременности</span>
                  <span className="text-muted-foreground">28%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Менопауза</span>
                  <span className="text-muted-foreground">18%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>СПКЯ</span>
                  <span className="text-muted-foreground">12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Другое</span>
                  <span className="text-muted-foreground">8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Эффективность лечения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Улучшение состояния</span>
                  <Badge variant="default">87%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Соблюдение рекомендаций</span>
                  <Badge variant="default">73%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Повторные консультации</span>
                  <Badge variant="secondary">65%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Удовлетворенность</span>
                  <Badge variant="default">94%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
}