import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  AlertTriangle, 
  Target, 
  Heart, 
  Stethoscope, 
  Trophy,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { EvaRecommendationEngine, EvaRecommendation, RecommendationType, RecommendationPriority } from '@/services/evaRecommendationEngine';
import { toast } from '@/hooks/use-toast';

const PatientRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<EvaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<RecommendationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<RecommendationPriority | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const engine = new EvaRecommendationEngine();

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await engine.analyzePatientData(user.id);
      setRecommendations(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить рекомендации. Попробуйте обновить страницу.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
    toast({
      title: "Обновлено",
      description: "Рекомендации успешно обновлены на основе ваших последних данных.",
    });
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const typeMatch = selectedType === 'all' || rec.type === selectedType;
    const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
    return typeMatch && priorityMatch;
  });

  const getTypeIcon = (type: RecommendationType) => {
    switch (type) {
      case 'urgent': return AlertTriangle;
      case 'lifestyle': return Target;
      case 'medical': return Stethoscope;
      case 'prevention': return Heart;
      case 'achievement': return Trophy;
      default: return Brain;
    }
  };

  const getTypeLabel = (type: RecommendationType) => {
    switch (type) {
      case 'urgent': return 'Срочно';
      case 'lifestyle': return 'Образ жизни';
      case 'medical': return 'Медицинские';
      case 'prevention': return 'Профилактика';
      case 'achievement': return 'Достижения';
      default: return type;
    }
  };

  const getPriorityColor = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical': return 'Критично';
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getTypeStats = () => {
    const stats = recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { type: 'urgent', count: stats.urgent || 0, label: 'Срочные' },
      { type: 'lifestyle', count: stats.lifestyle || 0, label: 'Образ жизни' },
      { type: 'medical', count: stats.medical || 0, label: 'Медицинские' },
      { type: 'prevention', count: stats.prevention || 0, label: 'Профилактика' },
      { type: 'achievement', count: stats.achievement || 0, label: 'Достижения' }
    ];
  };

  if (loading) {
    return (
      <PatientLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Рекомендации Eva</h1>
            <p className="text-muted-foreground">
              Персонализированные рекомендации на основе анализа ваших данных
            </p>
          </div>
          <Button 
            onClick={refreshRecommendations} 
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {getTypeStats().map(({ type, count, label }) => {
            const Icon = getTypeIcon(type as RecommendationType);
            return (
              <Card key={type} className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-eva-dusty-rose" />
                  <div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Фильтры:</span>
            </div>
            
            <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as RecommendationType | 'all')}>
              <TabsList>
                <TabsTrigger value="all">Все типы</TabsTrigger>
                <TabsTrigger value="urgent">Срочные</TabsTrigger>
                <TabsTrigger value="lifestyle">Образ жизни</TabsTrigger>
                <TabsTrigger value="medical">Медицинские</TabsTrigger>
                <TabsTrigger value="prevention">Профилактика</TabsTrigger>
                <TabsTrigger value="achievement">Достижения</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={selectedPriority} onValueChange={(v) => setSelectedPriority(v as RecommendationPriority | 'all')}>
              <TabsList>
                <TabsTrigger value="all">Все приоритеты</TabsTrigger>
                <TabsTrigger value="critical">Критичные</TabsTrigger>
                <TabsTrigger value="high">Высокие</TabsTrigger>
                <TabsTrigger value="medium">Средние</TabsTrigger>
                <TabsTrigger value="low">Низкие</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredRecommendations.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {recommendations.length === 0 ? 'Нет рекомендаций' : 'Нет рекомендаций по выбранным фильтрам'}
              </h3>
              <p className="text-muted-foreground">
                {recommendations.length === 0 
                  ? 'Заполните данные о симптомах и питании для получения персонализированных рекомендаций'
                  : 'Измените фильтры для просмотра других рекомендаций'
                }
              </p>
            </Card>
          ) : (
            filteredRecommendations.map((recommendation) => {
              const TypeIcon = getTypeIcon(recommendation.type);
              return (
                <Card key={recommendation.id} className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-eva-soft-pink rounded-lg">
                          <TypeIcon className="h-5 w-5 text-eva-dusty-rose" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{recommendation.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{getTypeLabel(recommendation.type)}</Badge>
                            <Badge className={getPriorityColor(recommendation.priority)}>
                              {getPriorityLabel(recommendation.priority)}
                            </Badge>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {recommendation.confidence}% уверенность
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {recommendation.timeframe}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground">{recommendation.description}</p>

                    {/* Reason */}
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm"><strong>Почему это важно:</strong> {recommendation.reason}</p>
                    </div>

                    {/* Action Steps */}
                    <div>
                      <h4 className="font-medium mb-2">Рекомендуемые действия:</h4>
                      <ul className="space-y-2">
                        {recommendation.actionSteps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Based on Data */}
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">
                        <strong>На основе данных:</strong> {recommendation.basedOnData.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Ожидаемый эффект:</strong> {recommendation.estimatedImpact === 'high' ? 'Высокий' : recommendation.estimatedImpact === 'medium' ? 'Средний' : 'Низкий'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientRecommendations;