
import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  BarChart3, 
  Shield, 
  Database, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  FileText,
  Server
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-600 to-blue-600 p-6 rounded-2xl text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Панель администратора Eva</h1>
              <p className="text-white/90 mt-1">
                Управление платформой и мониторинг системы
              </p>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Пользователи
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1,234</div>
              <p className="text-xs text-muted-foreground">
                +89 за последний месяц
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Активность системы
              </CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">98.5%</div>
              <p className="text-xs text-muted-foreground">
                Время работы системы
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">
                Требуют модерации
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">
                Сообщений в очереди
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Загрузка сервера
              </CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">45%</div>
              <p className="text-xs text-muted-foreground">
                Средняя за день
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Statistics */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span>Статистика пользователей</span>
              </CardTitle>
              <CardDescription>
                Распределение пользователей по ролям и активности
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-eva-dusty-rose rounded-full"></div>
                      <span>Пациентки</span>
                    </span>
                    <span className="font-medium">1,089 (88%)</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Врачи</span>
                    </span>
                    <span className="font-medium">134 (11%)</span>
                  </div>
                  <Progress value={11} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span>Администраторы</span>
                    </span>
                    <span className="font-medium">11 (1%)</span>
                  </div>
                  <Progress value={1} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-gray-600" />
                <span>Состояние системы</span>
              </CardTitle>
              <CardDescription>
                Мониторинг ключевых компонентов платформы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">База данных</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Работает</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">API сервисы</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Работает</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Кэш система</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Обслуживание</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Файловое хранилище</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Работает</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span>Последние системные события</span>
            </CardTitle>
            <CardDescription>
              Логи и уведомления о работе системы
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'info', message: 'Новый пользователь зарегистрирован', time: '5 минут назад' },
                { type: 'warning', message: 'Превышено время отклика API на 200ms', time: '15 минут назад' },
                { type: 'success', message: 'Плановое обслуживание базы данных завершено', time: '1 час назад' },
                { type: 'info', message: 'Обновление системы безопасности установлено', time: '2 часа назад' },
                { type: 'warning', message: 'Обнаружен подозрительный трафик', time: '3 часа назад' },
              ].map((event, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'success' ? 'bg-green-500' :
                    event.type === 'warning' ? 'bg-yellow-500' :
                    event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle>Административные действия</CardTitle>
            <CardDescription>
              Инструменты для управления платформой
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-blue-300 hover:bg-blue-50"
              >
                <Users className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Управление пользователями</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-yellow-300 hover:bg-yellow-50"
              >
                <FileText className="h-6 w-6 text-yellow-600" />
                <span className="text-sm">Модерация</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-green-300 hover:bg-green-50"
              >
                <BarChart3 className="h-6 w-6 text-green-600" />
                <span className="text-sm">Аналитика</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-gray-300 hover:bg-gray-50"
              >
                <Settings className="h-6 w-6 text-gray-600" />
                <span className="text-sm">Настройки</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
