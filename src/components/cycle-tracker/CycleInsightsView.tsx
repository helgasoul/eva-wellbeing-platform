import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Activity,
  Apple
} from 'lucide-react';

interface CycleAnalysis {
  current_cycle: {
    start_date: string;
    day_of_cycle: number;
    estimated_length: number;
    phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'irregular';
    next_predicted_date?: string;
    confidence: number;
  };
  cycle_history: {
    average_length: number;
    shortest_cycle: number;
    longest_cycle: number;
    irregularity_score: number;
    trend: 'stable' | 'lengthening' | 'shortening' | 'irregular';
  };
  perimenopause_indicators: {
    missed_periods_count: number;
    cycle_variability: number;
    symptom_severity_trend: 'increasing' | 'stable' | 'decreasing';
    probable_stage: 'early_perimenopause' | 'late_perimenopause' | 'menopause' | 'premenopause';
  };
}

interface NutritionCorrelation {
  nutrient: string;
  cycle_impact: 'positive' | 'negative' | 'neutral';
  correlation_strength: number;
  recommendations: string[];
  optimal_range: string;
  current_intake?: number;
}

interface ActivityCorrelation {
  activity_type: string;
  symptom_impact: {
    cramps: number;
    mood: number;
    energy: number;
    hot_flashes: number;
  };
  optimal_timing: string[];
  recommendations: string[];
}

interface CycleInsightsViewProps {
  cycleAnalysis: CycleAnalysis | null;
  correlations: {
    nutrition: NutritionCorrelation[];
    activity: ActivityCorrelation[];
  };
}

export const CycleInsightsView: React.FC<CycleInsightsViewProps> = ({
  cycleAnalysis,
  correlations
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  if (!cycleAnalysis) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">ИИ-анализ недоступен</h3>
          <p className="text-sm text-gray-500">Добавьте больше данных для получения персональных инсайтов</p>
        </CardContent>
      </Card>
    );
  }

  // Генерируем персональные инсайты
  const personalInsights = generatePersonalInsights(cycleAnalysis, correlations);
  const nutritionInsights = generateNutritionInsights(correlations.nutrition);
  const activityInsights = generateActivityInsights(correlations.activity);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">ИИ-инсайты</h2>
          <p className="text-gray-600">Персональные рекомендации на основе ваших данных</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="gap-2">
            <Brain className="h-4 w-4" />
            Персональные
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="gap-2">
            <Apple className="h-4 w-4" />
            Питание
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Активность
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personalInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activityInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  actionable: boolean;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'tip': return <Lightbulb className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'tip': return 'border-purple-200 bg-purple-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className={`${getCardColor(insight.type)} transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon(insight.type)}
            <CardTitle className="text-lg">{insight.title}</CardTitle>
          </div>
          <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
            {insight.priority === 'high' ? 'Высокий' :
             insight.priority === 'medium' ? 'Средний' : 'Низкий'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{insight.description}</p>
        
        {insight.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Рекомендации:</h4>
            <div className="space-y-1">
              {insight.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Target className="h-3 w-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {insight.actionable && (
          <Button size="sm" variant="outline" className="w-full">
            Применить рекомендации
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const generatePersonalInsights = (
  analysis: CycleAnalysis,
  correlations: { nutrition: NutritionCorrelation[]; activity: ActivityCorrelation[] }
): Insight[] => {
  const insights: Insight[] = [];

  // Анализ регулярности цикла
  if (analysis.cycle_history.irregularity_score < 15) {
    insights.push({
      type: 'success',
      title: 'Отличная регулярность цикла',
      description: `Ваш цикл очень стабильный с нерегулярностью всего ${analysis.cycle_history.irregularity_score}%. Это отличный показатель гормонального здоровья.`,
      actionable: false,
      recommendations: [
        'Продолжайте вести здоровый образ жизни',
        'Поддерживайте регулярное питание и сон',
        'Регулярно отслеживайте изменения'
      ],
      priority: 'low'
    });
  } else if (analysis.cycle_history.irregularity_score > 30) {
    insights.push({
      type: 'warning',
      title: 'Высокая нерегулярность цикла',
      description: `Нерегулярность ${analysis.cycle_history.irregularity_score}% может указывать на гормональный дисбаланс или другие факторы.`,
      actionable: true,
      recommendations: [
        'Обратитесь к гинекологу-эндокринологу',
        'Проверьте уровень гормонов',
        'Оцените уровень стресса и образ жизни',
        'Рассмотрите влияние питания и веса'
      ],
      priority: 'high'
    });
  }

  // Анализ фазы и точности
  if (analysis.current_cycle.confidence < 60) {
    insights.push({
      type: 'info',
      title: 'Низкая точность прогноза',
      description: `Точность прогноза ${analysis.current_cycle.confidence}% из-за недостатка данных или нерегулярности.`,
      actionable: true,
      recommendations: [
        'Ведите более подробные записи',
        'Отмечайте дополнительные симптомы',
        'Записывайте факторы стресса и изменения',
        'Используйте базальную температуру для точности'
      ],
      priority: 'medium'
    });
  }

  // Анализ перименопаузы
  if (analysis.perimenopause_indicators.probable_stage.includes('perimenopause')) {
    insights.push({
      type: 'info',
      title: 'Признаки перименопаузы',
      description: 'Ваши данные указывают на возможное начало перименопаузального периода.',
      actionable: true,
      recommendations: [
        'Консультация с гинекологом-эндокринологом',
        'Анализы на гормональный статус',
        'Рассмотрите поддерживающую терапию',
        'Уделите внимание питанию и витаминам'
      ],
      priority: 'high'
    });
  }

  // Анализ тренда
  if (analysis.cycle_history.trend === 'lengthening') {
    insights.push({
      type: 'warning',
      title: 'Удлинение циклов',
      description: 'Ваши циклы становятся длиннее. Это может быть признаком гормональных изменений.',
      actionable: true,
      recommendations: [
        'Проверьте функцию щитовидной железы',
        'Оцените уровень стресса',
        'Обратите внимание на изменения веса',
        'Обсудите с врачом гормональную коррекцию'
      ],
      priority: 'medium'
    });
  }

  return insights;
};

const generateNutritionInsights = (nutritionCorrelations: NutritionCorrelation[]): Insight[] => {
  const insights: Insight[] = [];

  // Находим лучшие корреляции
  const strongPositive = nutritionCorrelations.filter(
    c => c.cycle_impact === 'positive' && c.correlation_strength > 0.6
  );

  if (strongPositive.length > 0) {
    insights.push({
      type: 'success',
      title: 'Полезные питательные вещества',
      description: `${strongPositive.map(c => c.nutrient).join(', ')} показывают сильное положительное влияние на ваш цикл.`,
      actionable: true,
      recommendations: strongPositive.flatMap(c => c.recommendations.slice(0, 2)),
      priority: 'medium'
    });
  }

  // Дефициты
  const deficient = nutritionCorrelations.filter(
    c => c.current_intake !== undefined && c.current_intake < parseFloat(c.optimal_range.split('-')[0])
  );

  if (deficient.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Недостаток питательных веществ',
      description: `Недостаточное потребление: ${deficient.map(c => c.nutrient).join(', ')}.`,
      actionable: true,
      recommendations: [
        'Увеличьте потребление указанных нутриентов',
        'Рассмотрите прием добавок',
        'Проконсультируйтесь с нутрициологом',
        'Скорректируйте рацион питания'
      ],
      priority: 'high'
    });
  }

  // Общие рекомендации
  insights.push({
    type: 'tip',
    title: 'Оптимизация питания для цикла',
    description: 'Сбалансированное питание может значительно улучшить регулярность и симптомы цикла.',
    actionable: true,
    recommendations: [
      'Ешьте регулярно, избегайте длительных перерывов',
      'Включайте полезные жиры (омега-3)',
      'Ограничьте кофеин во второй половине цикла',
      'Увеличьте потребление клетчатки'
    ],
    priority: 'medium'
  });

  return insights;
};

const generateActivityInsights = (activityCorrelations: ActivityCorrelation[]): Insight[] => {
  const insights: Insight[] = [];

  // Лучшие виды активности
  const bestForMood = activityCorrelations.sort((a, b) => b.symptom_impact.mood - a.symptom_impact.mood)[0];
  const bestForCramps = activityCorrelations.sort((a, b) => a.symptom_impact.cramps - b.symptom_impact.cramps)[0];

  if (bestForMood) {
    insights.push({
      type: 'success',
      title: 'Лучший вид активности для настроения',
      description: `${bestForMood.activity_type === 'yoga' ? 'Йога' : 
                    bestForMood.activity_type === 'cardio' ? 'Кардио' :
                    bestForMood.activity_type === 'walking' ? 'Ходьба' : 
                    bestForMood.activity_type} показывает наилучшее влияние на ваше настроение.`,
      actionable: true,
      recommendations: bestForMood.recommendations,
      priority: 'medium'
    });
  }

  if (bestForCramps && bestForCramps.symptom_impact.cramps < -0.3) {
    insights.push({
      type: 'tip',
      title: 'Эффективно против спазмов',
      description: `${bestForCramps.activity_type === 'yoga' ? 'Йога' : 
                    bestForCramps.activity_type === 'walking' ? 'Ходьба' : 
                    bestForCramps.activity_type} эффективно снижает менструальные боли.`,
      actionable: true,
      recommendations: [
        'Используйте этот вид активности при болях',
        'Начинайте с легкой интенсивности',
        'Регулярность важнее интенсивности',
        'Прислушивайтесь к своему телу'
      ],
      priority: 'medium'
    });
  }

  // Рекомендации по циклическому планированию
  insights.push({
    type: 'info',
    title: 'Циклическое планирование тренировок',
    description: 'Адаптируйте интенсивность тренировок под фазы цикла для максимальной эффективности.',
    actionable: true,
    recommendations: [
      'Интенсивные тренировки в фолликулярную фазу',
      'Йога и растяжка во время менструации',
      'Силовые тренировки после овуляции',
      'Легкие кардио в лютеиновую фазу'
    ],
    priority: 'low'
  });

  return insights;
};