
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  BarChart3,
  Clock,
  FileText,
  Calculator,
  Activity
} from 'lucide-react';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const breadcrumbs = [
    { label: 'Панель врача' }
  ];

  return (
    <DoctorLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-2xl text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Врачебная панель Eva</h1>
              <p className="text-white/90 mt-1">
                Профессиональные инструменты для поддержки женского здоровья
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Активные пациентки
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">45</div>
              <p className="text-xs text-muted-foreground">
                +3 за последнюю неделю
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Консультации сегодня
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">
                Следующая в 14:30
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Критические случаи
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">2</div>
              <p className="text-xs text-muted-foreground">
                Требуют внимания
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Расчеты рисков
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">28</div>
              <p className="text-xs text-muted-foreground">
                За последний месяц
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Patients */}
          <Card className="bg-white border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Недавние пациентки</span>
              </CardTitle>
              <CardDescription>
                Последние консультации и обновления
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Анна К.', time: '2 часа назад', status: 'high-risk', condition: 'Высокий риск' },
                  { name: 'Мария П.', time: '4 часа назад', status: 'normal', condition: 'Плановая консультация' },
                  { name: 'Елена С.', time: '6 часов назад', status: 'attention', condition: 'Требует наблюдения' },
                ].map((patient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-primary-foreground font-medium">
                        {patient.name.split(' ')[0][0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.time}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={patient.status === 'high-risk' ? 'destructive' : 
                              patient.status === 'attention' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {patient.condition}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="bg-white border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Анализ рисков</span>
              </CardTitle>
              <CardDescription>
                Распределение рисков среди пациенток
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Высокий риск</span>
                  </div>
                  <Badge variant="destructive">8 пациенток</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Средний риск</span>
                  </div>
                  <Badge variant="outline">15 пациенток</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Низкий риск</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">22 пациентки</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Профессиональные инструменты для эффективной работы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/doctor/embedded-calculators')}
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-blue-300 hover:bg-blue-50"
              >
                <Calculator className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Калькуляторы</span>
                <span className="text-xs text-blue-500">Встроенные</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-green-300 hover:bg-green-50"
              >
                <FileText className="h-6 w-6 text-green-600" />
                <span className="text-sm">Новая запись</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-purple-300 hover:bg-purple-50"
              >
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <span className="text-sm">Аналитика</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-orange-300 hover:bg-orange-50"
              >
                <Activity className="h-6 w-6 text-orange-600" />
                <span className="text-sm">Мониторинг</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-pink-300 hover:bg-pink-50"
              >
                <Users className="h-6 w-6 text-pink-600" />
                <span className="text-sm">Пациентки</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
