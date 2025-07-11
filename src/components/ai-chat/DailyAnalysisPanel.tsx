import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { DailyAnalysisService } from '@/services/dailyAnalysisService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface DailyAnalysisPanelProps {
  className?: string;
}

export const DailyAnalysisPanel = ({ className }: DailyAnalysisPanelProps) => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadLatestAnalysis();
      loadDailyInsights();
    }
  }, [user?.id]);

  const loadLatestAnalysis = async () => {
    if (!user?.id) return;
    
    const analysis = await DailyAnalysisService.getLatestAnalysis(user.id);
    setLatestAnalysis(analysis);
  };

  const loadDailyInsights = async () => {
    if (!user?.id) return;
    
    const dailyInsights = await DailyAnalysisService.getDailyInsights(user.id, 5);
    setInsights(dailyInsights);
  };

  const handleTriggerAnalysis = async () => {
    if (!user?.id) return;

    setIsAnalyzing(true);
    try {
      const result = await DailyAnalysisService.triggerDailyAnalysis(user.id);
      
      if (result.success) {
        toast.success('Анализ запущен успешно');
        await loadLatestAnalysis();
        await loadDailyInsights();
      } else {
        toast.error(`Ошибка анализа: ${result.error}`);
      }
    } catch (error) {
      toast.error('Не удалось запустить анализ');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleAutoAnalysis = async (enabled: boolean) => {
    if (!user?.id) return;

    const success = await DailyAnalysisService.scheduleAutomaticAnalysis(user.id, enabled);
    
    if (success) {
      setAutoAnalysisEnabled(enabled);
      toast.success(enabled ? 'Автоматический анализ включен' : 'Автоматический анализ отключен');
    } else {
      toast.error('Не удалось изменить настройки автоанализа');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Завершен</Badge>;
      case 'running':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Выполняется</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Ошибка</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Панель управления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Ежедневный анализ здоровья
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Автоматический анализ</h4>
              <p className="text-sm text-muted-foreground">
                Анализ будет выполняться каждый день в 22:00
              </p>
            </div>
            <Switch
              checked={autoAnalysisEnabled}
              onCheckedChange={handleToggleAutoAnalysis}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleTriggerAnalysis} 
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Анализируем...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Запустить анализ
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Последний анализ */}
      {latestAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Последний анализ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(latestAnalysis.analysis_date).toLocaleDateString('ru-RU')}
                </span>
                {getStatusBadge(latestAnalysis.processing_status)}
              </div>
              
              {latestAnalysis.confidence_score && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Уверенность анализа</span>
                    <span>{Math.round(latestAnalysis.confidence_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${latestAnalysis.confidence_score * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {latestAnalysis.key_findings && latestAnalysis.key_findings.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Ключевые находки:</h4>
                  <ul className="space-y-1">
                    {latestAnalysis.key_findings.slice(0, 3).map((finding: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Инсайты */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Недавние инсайты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="border-l-2 border-primary/20 pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{insight.insight_data?.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.insight_data?.description}
                  </p>
                  {insight.confidence_score && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Точность:</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};