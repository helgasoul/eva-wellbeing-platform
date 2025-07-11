import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { PageHeader } from '@/components/layout/PageHeader';
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
  Smartphone,
  // ✅ НОВЫЕ ИМПОРТЫ для персонализации
  Target,
  Thermometer,
  AlertCircle,
  CheckCircle,
  Award,
  // ✅ НОВЫЕ ИМПОРТЫ для рекомендаций Eva
  Shield,
  Clipboard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { healthDataAggregator, HealthDataTimelineEntry } from '@/services/healthDataAggregator';

// ✅ НОВЫЙ ИМПОРТ сервиса персонализации
import { personalizationEngine, Recommendation, GoalProgress } from '@/services/personalizationService';
// ✅ НОВЫЙ ИМПОРТ сервиса рекомендаций Eva
import { evaRecommendationEngine, EvaRecommendation } from '@/services/evaRecommendationEngine';

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
  
  // ✅ НОВЫЕ СОСТОЯНИЯ для рекомендаций Eva
  const [evaRecommendations, setEvaRecommendations] = useState<EvaRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  
  // ✅ НОВОЕ: Получаем данные онбординга для персонализации
  const onboardingData = user?.onboardingData || 
                        JSON.parse(localStorage.getItem('onboardingData') || '{}');
  
  const menopausePhase = onboardingData?.phaseResult?.phase || 
                        onboardingData?.formData?.menopausePhase ||
                        user?.menopausePhase;
  
  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' }
  ];

  useEffect(() => {
    loadHealthData();
    loadEvaRecommendations();
    // Инициализация завершена (автосинхронизация wearable удалена)
  }, [user?.id]);

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

  // ✅ НОВАЯ ФУНКЦИЯ загрузки рекомендаций Eva
  const loadEvaRecommendations = async () => {
    if (!user?.id) return;
    
    setIsLoadingRecommendations(true);
    try {
      const recommendations = await evaRecommendationEngine.analyzePatientData(user.id);
      setEvaRecommendations(recommendations.slice(0, 6)); // Показываем топ-6 рекомендаций
    } catch (error) {
      console.error('Ошибка загрузки рекомендаций Eva:', error);
      // Показываем базовые рекомендации как fallback
      setEvaRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
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
        navigate('/patient/doctor-booking');
        break;
      case 'community':
        navigate('/patient/community');
        break;
      case 'documents':
        navigate('/patient/documents');
        break;
    }
  };

  // ✅ НОВЫЕ КОМПОНЕНТЫ ПЕРСОНАЛИЗАЦИИ

  // Призыв к прохождению онбординга для пользователей без данных
  const OnboardingPrompt = () => {
    if (onboardingData && Object.keys(onboardingData).length > 0) return null;
    
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Персонализируйте ваш опыт</h3>
              <p className="text-blue-700 text-sm">
                Пройдите онбординг, чтобы получить персональные рекомендации и адаптированную панель под вашу фазу менопаузы
              </p>
            </div>
            <Button 
              onClick={() => navigate('/patient/onboarding')}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Начать
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Фазо-специфичные рекомендации
  const PhaseRecommendations = () => {
    if (!onboardingData || Object.keys(onboardingData).length === 0) return null;
    
    const userProfile = personalizationEngine.analyzeUserProfile(onboardingData);
    const recommendations = personalizationEngine.generatePhaseRecommendations(userProfile);
    
    if (recommendations.length === 0) return null;
    
    const getIconComponent = (iconName: string) => {
      switch (iconName) {
        case 'thermometer': return <Thermometer className="w-5 h-5" />;
        case 'heart': return <Heart className="w-5 h-5" />;
        case 'calendar': return <Calendar className="w-5 h-5" />;
        case 'stethoscope': return <Stethoscope className="w-5 h-5" />;
        case 'activity': return <Activity className="w-5 h-5" />;
        default: return <Target className="w-5 h-5" />;
      }
    };
    
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Рекомендации для вашей фазы
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Персонализированные советы на основе {userProfile.phase} и ваших симптомов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg mr-3">
                    {getIconComponent(rec.icon || 'target')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{rec.title}</h4>
                    <Badge variant="outline" className={
                      rec.priority === 'high' ? 'border-red-300 text-red-700' :
                      rec.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                      'border-green-300 text-green-700'
                    }>
                      {rec.priority === 'high' ? 'Важно' : rec.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <div className="text-xs text-primary font-medium">
                  На основе: {rec.basedOn.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Отслеживание целей пользователя
  const GoalTracking = () => {
    if (!onboardingData?.goals?.goals || onboardingData.goals.goals.length === 0) return null;
    
    const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
    const goalProgress = personalizationEngine.calculateGoalProgress(onboardingData.goals.goals, symptomEntries);
    
    if (goalProgress.length === 0) return null;
    
    const getIconComponent = (iconName: string) => {
      switch (iconName) {
        case 'thermometer': return <Thermometer className="w-4 h-4" />;
        case 'moon': return <Moon className="w-4 h-4" />;
        case 'heart': return <Heart className="w-4 h-4" />;
        case 'activity': return <Activity className="w-4 h-4" />;
        default: return <Target className="w-4 h-4" />;
      }
    };
    
    return (
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Прогресс по вашим целям
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Отслеживание ваших личных целей в области здоровья
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {goalProgress.map((goal, idx) => (
              <div key={idx} className="p-4 border border-primary/20 rounded-xl bg-gradient-to-br from-card to-accent/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary/20 rounded-lg mr-2">
                      {getIconComponent(goal.icon || 'target')}
                    </div>
                    <span className="font-medium text-sm">{goal.name}</span>
                  </div>
                  <TrendingUp className={`w-4 h-4 ${
                    goal.trend === 'improving' ? 'text-green-500' : 
                    goal.trend === 'stable' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{goal.progress}% к цели</span>
                    <span className="text-primary font-medium">
                      {goal.trend === 'improving' ? '📈' : goal.trend === 'stable' ? '➡️' : '📉'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ✅ НОВЫЙ РАЗДЕЛ "Рекомендации Eva"
  const EvaRecommendationsSection = () => {
    if (isLoadingRecommendations) {
      return (
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary animate-pulse" />
              Рекомендации Eva
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Eva анализирует ваши данные...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (evaRecommendations.length === 0) {
      return (
        <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Рекомендации Eva
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              ИИ-помощник анализирует ваши данные для персональных советов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <Database className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p className="text-sm mb-2">Собираем ваши данные для персональных рекомендаций</p>
                <p className="text-xs text-muted-foreground">
                  Добавьте несколько записей в трекер симптомов, чтобы Eva могла создать персональные рекомендации
                </p>
              </div>
              <Button 
                onClick={() => navigate('/patient/symptoms')}
                className="mt-4"
              >
                Добавить симптомы
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20 shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Рекомендации Eva
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Персональные советы на основе анализа ваших данных
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              На основе ИИ-анализа
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {evaRecommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost"
              onClick={() => navigate('/patient/insights')}
              className="text-primary hover:text-primary/80"
            >
              Посмотреть все рекомендации →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ✅ КОМПОНЕНТ КАРТОЧКИ РЕКОМЕНДАЦИИ Eva
  const RecommendationCard = ({ recommendation }: { recommendation: EvaRecommendation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'critical': return { bg: 'bg-red-50 border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700' };
        case 'high': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-700' };
        case 'medium': return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' };
        case 'low': return { bg: 'bg-green-50 border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-700' };
        default: return { bg: 'bg-muted border-border', text: 'text-foreground', badge: 'bg-muted text-muted-foreground' };
      }
    };
    
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'urgent': return <AlertCircle className="w-5 h-5" />;
        case 'lifestyle': return <Leaf className="w-5 h-5" />;
        case 'medical': return <Stethoscope className="w-5 h-5" />;
        case 'prevention': return <Shield className="w-5 h-5" />;
        case 'achievement': return <Award className="w-5 h-5" />;
        default: return <Brain className="w-5 h-5" />;
      }
    };

    const getPriorityText = (priority: string) => {
      switch (priority) {
        case 'critical': return 'Критично';
        case 'high': return 'Важно';
        case 'medium': return 'Средне';
        case 'low': return 'Рекомендуется';
        default: return 'Обычное';
      }
    };
    
    const colors = getPriorityColor(recommendation.priority);
    
    return (
      <div className={`border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${colors.bg} ${recommendation.priority === 'critical' ? 'animate-pulse' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${colors.badge}`}>
                {getTypeIcon(recommendation.type)}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${colors.text} mb-1`}>{recommendation.title}</h3>
                <Badge variant="secondary" className={`text-xs ${colors.badge} border-0`}>
                  {getPriorityText(recommendation.priority)}
                </Badge>
              </div>
            </div>
            
            <p className={`text-sm mb-3 ${colors.text}`}>{recommendation.description}</p>
            
            <div className={`text-xs mb-3 p-2 bg-white/50 rounded-lg`}>
              <strong>Почему Eva рекомендует:</strong>{' '}
              <span className={colors.text}>{recommendation.reason}</span>
            </div>
            
            {isExpanded && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold mb-2 text-foreground">Рекомендуемые действия:</div>
                  <ul className="text-xs space-y-1">
                    {recommendation.actionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className={colors.text}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-2 bg-white/50 rounded">
                    <strong>На основе данных:</strong><br/>
                    <span className={colors.text}>{recommendation.basedOnData.join(', ')}</span>
                  </div>
                  <div className="p-2 bg-white/50 rounded">
                    <strong>Ожидаемый эффект:</strong><br/>
                    <span className={colors.text}>{recommendation.estimatedImpact === 'high' ? 'Высокий' : recommendation.estimatedImpact === 'medium' ? 'Средний' : 'Низкий'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs p-2 bg-white/50 rounded">
                  <span><strong>Уверенность ИИ:</strong> {recommendation.confidence}%</span>
                  <span><strong>Временные рамки:</strong> {recommendation.timeframe}</span>
                </div>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 p-1 h-auto"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    );
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

        {/* ✅ НОВАЯ СЕКЦИЯ: Призыв к онбордингу для пользователей без данных */}
        <OnboardingPrompt />

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

        {/* ✅ НОВЫЕ ПЕРСОНАЛИЗИРОВАННЫЕ СЕКЦИИ */}
        <PhaseRecommendations />
        <GoalTracking />
        
        {/* ✅ НОВЫЙ РАЗДЕЛ "Рекомендации Eva" */}
        <EvaRecommendationsSection />

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
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Plus className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Сегодняшнее самочувствие</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('cycle')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Calendar className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Мой цикл и гормоны</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('nutrition')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Utensils className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Дневник питания</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('sleep')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Moon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Анализ сна</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('data-sources')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Database className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Мои данные</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('insights')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Brain className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Мои открытия</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('ai-chat')}  
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <MessageSquare className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Спросить совет у ассистента</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('community')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Users className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Поддержка от женщин</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleQuickAction('doctors')}
                className="h-auto py-4 px-2 flex flex-col items-center justify-center space-y-2 border-primary/20 bg-gradient-to-b from-card to-accent/10 hover:bg-gradient-to-b hover:from-primary/10 hover:to-accent/20 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl min-h-[110px] max-h-[130px]"
              >
                <Stethoscope className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-xs text-center leading-relaxed break-words w-full px-1 overflow-hidden">Задать вопрос врачу</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default PatientDashboard;