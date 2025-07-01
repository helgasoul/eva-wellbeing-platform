
import React from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Heart,
  FileText,
  Users,
  Plus
} from 'lucide-react';

const PatientDashboard = () => {
  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-eva-dusty-rose to-eva-mauve p-6 rounded-2xl text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Добро пожаловать в Eva!</h1>
              <p className="text-white/90 mt-1">
                Ваш персональный помощник для поддержки здоровья и благополучия
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-white to-eva-soft-pink border-eva-dusty-rose/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-eva-dusty-rose">
                Записи симптомов
              </CardTitle>
              <Activity className="h-4 w-4 text-eva-dusty-rose" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">15</div>
              <p className="text-xs text-muted-foreground">
                +2 за последнюю неделю
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-eva-soft-pink border-eva-dusty-rose/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-eva-dusty-rose">
                Дней отслеживания
              </CardTitle>
              <Calendar className="h-4 w-4 text-eva-dusty-rose" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">28</div>
              <p className="text-xs text-muted-foreground">
                Последовательно за месяц
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-eva-soft-pink border-eva-dusty-rose/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-eva-dusty-rose">
                ИИ-консультации
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-eva-dusty-rose" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">
                Активных диалогов
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-eva-dusty-rose" />
                <span>Недавняя активность</span>
              </CardTitle>
              <CardDescription>
                Ваши последние записи и взаимодействия
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-eva-soft-pink/30 rounded-lg">
                  <div className="w-2 h-2 bg-eva-dusty-rose rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Записан симптом: Приливы</p>
                    <p className="text-xs text-muted-foreground">2 часа назад</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-eva-soft-pink/30 rounded-lg">
                  <div className="w-2 h-2 bg-eva-dusty-rose rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Консультация с ИИ-помощником</p>
                    <p className="text-xs text-muted-foreground">Вчера в 14:30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-eva-soft-pink/30 rounded-lg">
                  <div className="w-2 h-2 bg-eva-dusty-rose rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Участие в обсуждении сообщества</p>
                    <p className="text-xs text-muted-foreground">3 дня назад</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Progress */}
          <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-eva-dusty-rose" />
                <span>Прогресс здоровья</span>
              </CardTitle>
              <CardDescription>
                Отслеживание ваших показателей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Регулярность записей</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Активность в сообществе</span>
                    <span className="font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Использование ИИ-помощника</span>
                    <span className="font-medium">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-eva-dusty-rose/20">
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>
              Часто используемые функции для удобного доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-eva-dusty-rose/30 hover:bg-eva-soft-pink/50"
              >
                <Plus className="h-6 w-6 text-eva-dusty-rose" />
                <span className="text-sm">Записать симптом</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-eva-dusty-rose/30 hover:bg-eva-soft-pink/50"
              >
                <MessageSquare className="h-6 w-6 text-eva-dusty-rose" />
                <span className="text-sm">Чат с ИИ</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-eva-dusty-rose/30 hover:bg-eva-soft-pink/50"
              >
                <Users className="h-6 w-6 text-eva-dusty-rose" />
                <span className="text-sm">Сообщество</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 border-eva-dusty-rose/30 hover:bg-eva-soft-pink/50"
              >
                <FileText className="h-6 w-6 text-eva-dusty-rose" />
                <span className="text-sm">Мои документы</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
