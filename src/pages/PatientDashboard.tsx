
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  
  const breadcrumbs = [
    { label: 'Главная' }
  ];

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'symptoms':
        navigate('/patient/symptoms');
        break;
      case 'ai-chat':
        navigate('/patient/ai-chat');
        break;
      case 'community':
        // TODO: Implement community
        console.log('Community coming soon');
        break;
      case 'documents':
        // TODO: Implement documents
        console.log('Documents coming soon');
        break;
    }
  };

  return (
    <PatientLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bloom-warm-gradient p-6 rounded-2xl text-white shadow-warm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full animate-gentle-float">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-playfair font-bold">Добро пожаловать в bloom!</h1>
              <p className="text-white/90 mt-1">
                Ваш персональный помощник для поддержки здоровья и благополучия
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bloom-card-interactive bg-gradient-to-br from-white to-bloom-vanilla">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium warm-text">
                Записи симптомов
              </CardTitle>
              <Activity className="h-4 w-4 text-primary animate-warm-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gentle-text">15</div>
              <p className="text-xs soft-text">
                +2 за последнюю неделю
              </p>
            </CardContent>
          </Card>

          <Card className="bloom-card-interactive bg-gradient-to-br from-white to-bloom-soft-peach">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium warm-text">
                Дней отслеживания
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary animate-warm-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gentle-text">28</div>
              <p className="text-xs soft-text">
                Последовательно за месяц
              </p>
            </CardContent>
          </Card>

          <Card className="bloom-card-interactive bg-gradient-to-br from-white to-bloom-warm-cream">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium warm-text">
                ИИ-консультации
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-primary animate-warm-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gentle-text">8</div>
              <p className="text-xs soft-text">
                Активных диалогов
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bloom-card bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="gentle-text">Недавняя активность</span>
              </CardTitle>
              <CardDescription className="soft-text">
                Ваши последние записи и взаимодействия
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg interactive-hover">
                  <div className="w-2 h-2 bg-primary rounded-full animate-warm-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium gentle-text">Записан симптом: Приливы</p>
                    <p className="text-xs soft-text">2 часа назад</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg interactive-hover">
                  <div className="w-2 h-2 bg-primary rounded-full animate-warm-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium gentle-text">Консультация с ИИ-помощником</p>
                    <p className="text-xs soft-text">Вчера в 14:30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg interactive-hover">
                  <div className="w-2 h-2 bg-primary rounded-full animate-warm-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium gentle-text">Участие в обсуждении сообщества</p>
                    <p className="text-xs soft-text">3 дня назад</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Progress */}
          <Card className="bloom-card bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary animate-gentle-float" />
                <span className="gentle-text">Прогресс здоровья</span>
              </CardTitle>
              <CardDescription className="soft-text">
                Отслеживание ваших показателей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="gentle-text">Регулярность записей</span>
                    <span className="font-medium warm-text">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-bloom-vanilla" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="gentle-text">Активность в сообществе</span>
                    <span className="font-medium warm-text">60%</span>
                  </div>
                  <Progress value={60} className="h-2 bg-bloom-vanilla" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="gentle-text">Использование ИИ-помощника</span>
                    <span className="font-medium warm-text">70%</span>
                  </div>
                  <Progress value={70} className="h-2 bg-bloom-vanilla" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bloom-card bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="gentle-text">Быстрые действия</CardTitle>
            <CardDescription className="soft-text">
              Часто используемые функции для удобного доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleQuickAction('symptoms')}
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 gentle-border interactive-hover bg-gradient-to-b from-white to-bloom-vanilla"
              >
                <Plus className="h-6 w-6 text-primary" />
                <span className="text-sm gentle-text">Записать симптом</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAction('ai-chat')}
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 gentle-border interactive-hover bg-gradient-to-b from-white to-bloom-soft-peach"
              >
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="text-sm gentle-text">Чат с ИИ</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAction('community')}
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 gentle-border interactive-hover bg-gradient-to-b from-white to-bloom-warm-cream"
              >
                <Users className="h-6 w-6 text-primary" />
                <span className="text-sm gentle-text">Сообщество</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickAction('documents')}
                className="h-auto py-4 px-6 flex flex-col items-center space-y-2 gentle-border interactive-hover bg-gradient-to-b from-white to-bloom-blush"
              >
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-sm gentle-text">Мои документы</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;
