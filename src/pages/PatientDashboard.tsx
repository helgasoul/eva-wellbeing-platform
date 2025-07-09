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
  Plus,
  Brain,
  Stethoscope,
  Sparkles,
  Leaf
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
      case 'cycle':
        navigate('/patient/cycle');
        break;
      case 'insights':
        navigate('/patient/insights');
        break;
      case 'ai-chat':
        navigate('/patient/ai-chat');
        break;
      case 'doctors':
        navigate('/patient/doctors');
        break;
      case 'community':
        navigate('/patient/community');
        break;
      case 'documents':
        // TODO: Implement documents
        console.log('Documents coming soon');
        break;
    }
  };

  return (
    <PatientLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-8 bg-gradient-to-br from-background via-accent/5 to-muted/20 min-h-screen -m-6 p-6">
        {/* Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/80 via-primary/90 to-primary/70 p-8 rounded-3xl text-white shadow-elegant">
          {/* Soft decorative elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-6">
            <div className="p-4 bg-white/20 rounded-full animate-gentle-float backdrop-blur-sm">
              <Heart className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Добро пожаловать в bloom! 🌸</h1>
              <p className="text-white/95 text-lg leading-relaxed">
                Сегодня — идеальный день для заботы о себе
              </p>
              <p className="text-white/80 text-sm mt-2 italic">
                Мы рядом с вами на каждом шаге вашего пути к здоровью
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Записи самочувствия
              </CardTitle>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">15</div>
              <p className="text-xs text-muted-foreground">
                +2 за последнюю неделю 💪
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Дней заботы о себе
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">28</div>
              <p className="text-xs text-muted-foreground">
                Последовательно за месяц 🌷
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Советы получено
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground">
                Полезных диалогов ✨
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-foreground">Ваши шаги к здоровью</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Каждый шаг важен — вы делаете потрясающую работу!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-2xl transition-all duration-300 hover:bg-primary/15">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Записано самочувствие: Приливы</p>
                    <p className="text-xs text-muted-foreground">2 часа назад • Отличная осознанность!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-2xl transition-all duration-300 hover:bg-primary/15">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Получен совет от ИИ-помощника</p>
                    <p className="text-xs text-muted-foreground">Вчера в 14:30 • Вы на правильном пути</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-primary/10 rounded-2xl transition-all duration-300 hover:bg-primary/15">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Поддержка в сообществе</p>
                    <p className="text-xs text-muted-foreground">3 дня назад • Вы не одна в этом</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Progress */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary animate-gentle-float" />
                <span className="text-foreground">Ваш прогресс заботы</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Вы делаете потрясающую работу для своего здоровья! 🌷
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
                  <p className="text-sm text-primary font-medium mb-3 italic">
                    Пусть забота о себе станет новой привычкой — вы не одни!
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Регулярность записей <Sparkles className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Активность в сообществе <Users className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">60%</span>
                  </div>
                  <Progress value={60} className="h-3" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Использование советов <Brain className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">70%</span>
                  </div>
                  <Progress value={70} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Мой следующий шаг к себе
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Выберите то, что откликается вашему сердцу сегодня
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button
                variant="outline"
                onClick={() => handleQuickAction('symptoms')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Plus className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Сегодняшнее самочувствие</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('cycle')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Мой цикл и гормоны</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('insights')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Brain className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Мои открытия</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('ai-chat')}  
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Спросить совет у ассистента Eva</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('community')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Users className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Поддержка от женщин</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('doctors')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Stethoscope className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Задать вопрос врачу</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;