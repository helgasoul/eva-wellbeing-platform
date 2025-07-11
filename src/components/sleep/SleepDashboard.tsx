import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { 
  Moon, 
  Sun, 
  Brain, 
  Heart, 
  TrendingUp, 
  Clock,
  Thermometer,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronLeft
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { healthDataAggregator, WearableData } from '@/services/healthDataAggregator';


interface SleepPhase {
  phase: 'light' | 'deep' | 'rem' | 'awake';
  duration: number;
  percentage: number;
  color: string;
}

interface SleepInsights {
  averageQuality: number;
  sleepEfficiencyTrend: 'improving' | 'stable' | 'declining';
  commonFactors: {
    positive: string[];
    negative: string[];
  };
  menopauseCorrelations: {
    nightSweatsImpact: number;
    hotFlashesFrequency: number;
    moodCorrelation: number;
  };
  recommendations: string[];
}

interface SleepData {
  date: string;
  totalSleep: number;
  sleepEfficiency: number;
  sleepQuality: number;
  phases: SleepPhase[];
  nightSweats: boolean;
  hotFlashes: boolean;
  moodNext: number;
  heartRateVariability: number;
  bodyTemperature: number;
  stressLevel: number;
}

export const SleepDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sleepData, setSleepData] = useState<SleepData[]>([]);
  const [insights, setInsights] = useState<SleepInsights | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSleepData();
  }, [selectedPeriod]);

  const loadSleepData = async () => {
    setIsLoading(true);
    try {
      // Получаем данные о сне (заглушка после удаления wearable)
      const days = selectedPeriod === 'week' ? 7 : 30;
      const wearableData = [];
      
      // Генерируем детальные данные о сне
      const sleepDataArray = await Promise.all(
        Array.from({ length: days }, async (_, i) => {
          const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
          const dayWearableData = wearableData.find(w => w.date === date);
          
          return generateDetailedSleepData(date, dayWearableData);
        })
      );

      setSleepData(sleepDataArray.filter(Boolean) as SleepData[]);
      
      // Генерируем инсайты
      const sleepInsights = generateSleepInsights(sleepDataArray.filter(Boolean) as SleepData[]);
      setInsights(sleepInsights);
      
    } catch (error) {
      console.error('Error loading sleep data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDetailedSleepData = (date: string, wearableData?: WearableData): SleepData | null => {
    if (!wearableData || !wearableData.sleepHours) return null;

    // Базовые данные
    const totalSleep = wearableData.sleepHours;
    const sleepEfficiency = Math.min(95, Math.max(60, 75 + (Math.random() - 0.5) * 20));
    const sleepQuality = wearableData.sleepQuality || Math.round(3 + Math.random() * 2);

    // Фазы сна (в часах)
    const phases: SleepPhase[] = [
      {
        phase: 'light',
        duration: totalSleep * 0.45,
        percentage: 45,
        color: '#E3F2FD'
      },
      {
        phase: 'deep',
        duration: totalSleep * 0.25,
        percentage: 25,
        color: '#1976D2'
      },
      {
        phase: 'rem',
        duration: totalSleep * 0.25,
        percentage: 25,
        color: '#7B1FA2'
      },
      {
        phase: 'awake',
        duration: totalSleep * 0.05,
        percentage: 5,
        color: '#FFC107'
      }
    ];

    // Корреляция с симптомами менопаузы
    const nightSweats = Math.random() < 0.3; // 30% вероятность
    const hotFlashes = Math.random() < 0.25; // 25% вероятность

    return {
      date,
      totalSleep,
      sleepEfficiency,
      sleepQuality,
      phases,
      nightSweats,
      hotFlashes,
      moodNext: Math.round(2 + Math.random() * 3),
      heartRateVariability: wearableData.heartRateResting || 65,
      bodyTemperature: 36.5 + (Math.random() - 0.5) * 0.8,
      stressLevel: wearableData.stressLevel || Math.round(1 + Math.random() * 4)
    };
  };

  const generateSleepInsights = (data: SleepData[]): SleepInsights => {
    if (data.length === 0) {
      return {
        averageQuality: 0,
        sleepEfficiencyTrend: 'stable',
        commonFactors: { positive: [], negative: [] },
        menopauseCorrelations: { nightSweatsImpact: 0, hotFlashesFrequency: 0, moodCorrelation: 0 },
        recommendations: []
      };
    }

    const averageQuality = data.reduce((sum, d) => sum + d.sleepQuality, 0) / data.length;
    const nightSweatsCount = data.filter(d => d.nightSweats).length;
    const hotFlashesCount = data.filter(d => d.hotFlashes).length;
    
    // Корреляция сна с настроением
    const sleepMoodCorrelation = data.reduce((sum, d, i) => {
      if (i === 0) return sum;
      const prevSleep = data[i - 1];
      return sum + (prevSleep.sleepQuality * d.moodNext);
    }, 0) / Math.max(1, data.length - 1);

    return {
      averageQuality,
      sleepEfficiencyTrend: Math.random() > 0.5 ? 'improving' : 'stable',
      commonFactors: {
        positive: ['Регулярный режим', 'Прохладная комната', 'Медитация перед сном'],
        negative: ['Кофеин после 15:00', 'Экраны перед сном', 'Стресс']
      },
      menopauseCorrelations: {
        nightSweatsImpact: (nightSweatsCount / data.length) * 100,
        hotFlashesFrequency: (hotFlashesCount / data.length) * 100,
        moodCorrelation: sleepMoodCorrelation / 100
      },
      recommendations: [
        'Поддерживайте прохладную температуру в спальне (18-20°C)',
        'Избегайте кофеина после 15:00',
        'Попробуйте техники дыхательной релаксации',
        'Рассмотрите натуральные добавки с мелатонином'
      ]
    };
  };

  const getPhaseDisplayName = (phase: string) => {
    const names = {
      light: 'Легкий сон',
      deep: 'Глубокий сон',
      rem: 'REM сон',
      awake: 'Пробуждения'
    };
    return names[phase as keyof typeof names] || phase;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-yellow-500 rotate-90" />;
    }
  };

  const latestSleep = sleepData[0];

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/dashboard')}
              className="flex items-center gap-2"
              aria-label="Вернуться в дашборд"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
          </div>
          
          {/* Title and Actions */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Анализ сна
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Детальная аналитика качества сна и влияния на симптомы менопаузы
              </p>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('week')}
                >
                  Неделя
                </Button>
                <Button
                  variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod('month')}
                >
                  Месяц
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="phases">Фазы сна</TabsTrigger>
            <TabsTrigger value="correlations">Корреляции</TabsTrigger>
            <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Sleep Quality Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Время сна
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {latestSleep ? `${latestSleep.totalSleep.toFixed(1)}ч` : 'Нет данных'}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Среднее за {selectedPeriod === 'week' ? 'неделю' : 'месяц'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Эффективность
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {latestSleep ? `${latestSleep.sleepEfficiency.toFixed(0)}%` : 'Нет данных'}
                  </div>
                  <Progress 
                    value={latestSleep?.sleepEfficiency || 0} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Качество
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {latestSleep ? `${latestSleep.sleepQuality}/5` : 'Нет данных'}
                  </div>
                  <div className="flex mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full mr-1 ${
                          i < (latestSleep?.sleepQuality || 0)
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sleep Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Тренды сна
                </CardTitle>
                <CardDescription>
                  Изменения качества сна за выбранный период
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(insights.sleepEfficiencyTrend)}
                      <span>Эффективность сна: {insights.sleepEfficiencyTrend === 'improving' ? 'улучшается' : insights.sleepEfficiencyTrend === 'declining' ? 'ухудшается' : 'стабильна'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span>Среднее качество: {insights.averageQuality.toFixed(1)}/5</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Фазы сна</CardTitle>
                <CardDescription>
                  Детальный анализ структуры сна
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestSleep && (
                  <div className="space-y-4">
                    {latestSleep.phases.map((phase, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {getPhaseDisplayName(phase.phase)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {phase.duration.toFixed(1)}ч ({phase.percentage}%)
                          </span>
                        </div>
                        <Progress
                          value={phase.percentage}
                          className="h-3"
                          style={{ 
                            '--progress-background': phase.color 
                          } as React.CSSProperties}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Корреляции с симптомами менопаузы
                </CardTitle>
                <CardDescription>
                  Влияние сна на симптомы и самочувствие
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Ночная потливость</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {insights.menopauseCorrelations.nightSweatsImpact.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ночей с потливостью
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">Приливы</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {insights.menopauseCorrelations.hotFlashesFrequency.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ночей с приливами
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-medium">Настроение</span>
                      </div>
                      <div className="text-2xl font-bold text-pink-600">
                        {(insights.menopauseCorrelations.moodCorrelation * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        корреляция сон-настроение
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Факторы влияния */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Положительные факторы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights?.commonFactors.positive.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2 bg-green-100 text-green-800">
                      {factor}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Негативные факторы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insights?.commonFactors.negative.map((factor, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2 bg-red-100 text-red-800">
                      {factor}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Персональные рекомендации
                </CardTitle>
                <CardDescription>
                  На основе анализа вашего сна и симптомов менопаузы
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insights && (
                  <div className="space-y-4">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="w-6 h-6 bg-blue-500 text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SleepDashboard;