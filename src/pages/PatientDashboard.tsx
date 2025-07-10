import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  Leaf,
  Database,
  Clock,
  BarChart3,
  Utensils,
  Moon,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { healthDataAggregator, HealthDataTimelineEntry } from '@/services/healthDataAggregator';
import { wearableIntegration } from '@/services/wearableIntegration';

interface HealthStats {
  totalEntries: number;
  symptomEntries: number;
  nutritionEntries: number;
  wearableEntries: number;
  daysWithData: number;
  lastEntry?: string;
  dataCompleteness: number;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<HealthDataTimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ НОВОЕ: Получаем данные онбординга для персонализации
  const onboardingData = user?.onboardingData || 
                        JSON.parse(localStorage.getItem('onboardingData') || '{}');
  
  const menopausePhase = onboardingData?.phaseResult?.phase || 
                        onboardingData?.formData?.menopausePhase ||
                        user?.menopausePhase;
  
  const breadcrumbs = [
    { label: 'Главная' }
  ];

  useEffect(() => {
    loadHealthData();
    // Настраиваем автосинхронизацию устройств
    wearableIntegration.setupAutoSync();
  }, []);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем статистику данных
      const stats = healthDataAggregator.getDataStats();
      
      // Рассчитываем полноту данных (оптимально 30 записей за месяц)
      const dataCompleteness = Math.min(100, (stats.totalEntries / 30) * 100);
      
      setHealthStats({
        ...stats,
        dataCompleteness
      });
      
      // Получаем последние события
      const timeline = healthDataAggregator.getTimeline(7);
      setRecentEvents(timeline.slice(0, 5)); // Показываем последние 5 событий
      
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'symptom':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'nutrition':
        return <Utensils className="h-4 w-4 text-green-500" />;
      case 'wearable':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'weather':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventDescription = (event: HealthDataTimelineEntry) => {
    switch (event.type) {
      case 'symptom':
        const symptomData = event.data as any;
        return `Записаны симптомы: ${symptomData.symptoms?.slice(0, 2).join(', ') || 'данные о самочувствии'}`;
      case 'nutrition':
        return 'Добавлена запись о питании';
      case 'wearable':
        const wearableData = event.data as any;
        return `Синхронизированы данные: ${wearableData.steps ? `${wearableData.steps} шагов` : 'активность и сон'}`;
      case 'weather':
        return 'Собраны экологические данные';
      default:
        return 'Данные о здоровье';
    }
  };

  const getCompletenessLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'excellent', color: 'text-green-600', text: 'Отличная' };
    if (percentage >= 60) return { level: 'good', color: 'text-blue-600', text: 'Хорошая' };
    if (percentage >= 40) return { level: 'fair', color: 'text-yellow-600', text: 'Удовлетв.' };
    return { level: 'poor', color: 'text-red-600', text: 'Низкая' };
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'symptoms':
        navigate('/patient/symptoms');
        break;
      case 'cycle':
        navigate('/patient/cycle');
        break;
      case 'nutrition':
        navigate('/patient/nutrition');
        break;
      case 'sleep':
        navigate('/patient/sleep-dashboard');
        break;
      case 'data-sources':
        navigate('/patient/data-sources');
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
        navigate('/patient/documents');
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
              <h1 className="text-3xl font-bold mb-2">
                Добро пожаловать в bloom, {user?.firstName || 'дорогая'}! 🌸
              </h1>
              <p className="text-white/95 text-lg leading-relaxed">
                Сегодня — идеальный день для заботы о себе
              </p>
              
              {/* ✅ НОВОЕ: Персонализированное сообщение на основе онбординга */}
              {menopausePhase && (
                <div className="mt-3 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <p className="text-white/90 text-sm font-medium">
                    🎯 Ваша текущая фаза: {menopausePhase}
                  </p>
                  <p className="text-white/80 text-xs mt-1">
                    Ваша панель адаптирована под ваши потребности
                  </p>
                </div>
              )}
              
              <p className="text-white/80 text-sm mt-2 italic">
                Мы рядом с вами на каждом шаге вашего пути к здоровью
              </p>
            </div>
          </div>
        </div>

        {/* Health Data Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего записей
              </CardTitle>
              <Database className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : healthStats?.totalEntries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {healthStats?.daysWithData || 0} дней с данными 📊
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Записи симптомов
              </CardTitle>
              <Heart className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : healthStats?.symptomEntries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Отслеживание самочувствия 💪
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Данные устройств
              </CardTitle>
              <Smartphone className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : healthStats?.wearableEntries || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Автоматический сбор 🔄
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-accent/10 border-primary/20 shadow-elegant hover:shadow-soft transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Полнота данных
                {healthStats && (
                  <Badge variant="secondary" className={getCompletenessLevel(healthStats.dataCompleteness).color}>
                    {getCompletenessLevel(healthStats.dataCompleteness).text}
                  </Badge>
                )}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {isLoading ? '...' : `${healthStats?.dataCompleteness.toFixed(0) || 0}%`}
              </div>
              <Progress 
                value={healthStats?.dataCompleteness || 0} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Health Events */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-foreground">Последние события</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ваша активность по заботе о здоровье за последнюю неделю
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-3 p-4">
                          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center space-x-3 p-4 bg-primary/10 rounded-2xl transition-all duration-300 hover:bg-primary/15">
                      {getEventIcon(event.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getEventDescription(event)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.timestamp), 'd MMM, HH:mm', { locale: ru })} • 
                          Отличная работа! 🌟
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Пока нет записей</p>
                    <p className="text-xs">Начните с добавления симптомов или питания</p>
                  </div>
                )}
                
                {recentEvents.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/patient/data-sources')}
                    className="w-full mt-4"
                  >
                    Посмотреть все данные
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Progress */}
          <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary animate-gentle-float" />
                <span className="text-foreground">Качество ваших данных</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Чем больше данных, тем точнее персональные рекомендации! 🎯
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {healthStats && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
                    <p className="text-sm text-primary font-medium mb-2">
                      Общая полнота данных: {healthStats.dataCompleteness.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      {healthStats.dataCompleteness >= 80 
                        ? "Отличная база для ИИ-анализа! Вы собираете достаточно данных для точных инсайтов 🎉"
                        : healthStats.dataCompleteness >= 60
                        ? "Хорошее начало! Добавьте еще немного данных для более точных рекомендаций 📈"
                        : "Начните регулярно добавлять данные — каждая запись делает анализ точнее 🌱"
                      }
                    </p>
                  </div>
                )}
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Симптомы и самочувствие <Heart className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">
                      {healthStats?.symptomEntries || 0} записей
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, ((healthStats?.symptomEntries || 0) / 30) * 100)} 
                    className="h-3" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Данные носимых устройств <Smartphone className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">
                      {healthStats?.wearableEntries || 0} дней
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, ((healthStats?.wearableEntries || 0) / 30) * 100)} 
                    className="h-3" 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-foreground flex items-center gap-2">
                      Питание и добавки <Utensils className="h-4 w-4 text-primary" />
                    </span>
                    <span className="font-medium text-primary">
                      {healthStats?.nutritionEntries || 0} записей
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, ((healthStats?.nutritionEntries || 0) / 90) * 100)} 
                    className="h-3" 
                  />
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
                onClick={() => handleQuickAction('nutrition')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Utensils className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Дневник питания</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('sleep')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Moon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Анализ сна</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('data-sources')}
                className="h-auto py-6 px-3 flex flex-col items-center space-y-3 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[120px]"
              >
                <Database className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-tight break-words hyphens-auto">Мои данные</span>
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