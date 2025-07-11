import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, FileText, Calendar, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { MonthlyAnalysisService } from '@/services/monthlyAnalysisService';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface MonthlyAnalysisPanelProps {
  className?: string;
}

export const MonthlyAnalysisPanel = ({ className }: MonthlyAnalysisPanelProps) => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [monthlyInsights, setMonthlyInsights] = useState<any[]>([]);
  const [documentInsights, setDocumentInsights] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    const [analysis, insights, docInsights, monthlyTrends] = await Promise.all([
      MonthlyAnalysisService.getLatestMonthlyAnalysis(user.id),
      MonthlyAnalysisService.getMonthlyInsights(user.id, 3),
      MonthlyAnalysisService.getDocumentInsights(user.id, 3),
      MonthlyAnalysisService.getMonthlyTrends(user.id, 6)
    ]);

    setLatestAnalysis(analysis);
    setMonthlyInsights(insights);
    setDocumentInsights(docInsights);
    setTrends(monthlyTrends);
  };

  const handleTriggerAnalysis = async () => {
    if (!user?.id) return;

    setIsAnalyzing(true);
    try {
      const result = await MonthlyAnalysisService.triggerMonthlyAnalysis(
        user.id, 
        selectedMonth, 
        selectedYear
      );
      
      if (result.success) {
        toast.success('Месячный анализ запущен успешно');
        await loadData();
      } else {
        toast.error(`Ошибка анализа: ${result.error}`);
      }
    } catch (error) {
      toast.error('Не удалось запустить месячный анализ');
      console.error('Monthly analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleAutoAnalysis = async (enabled: boolean) => {
    if (!user?.id) return;

    const success = await MonthlyAnalysisService.scheduleMonthlyAnalysis(user.id, enabled, 1);
    
    if (success) {
      setAutoAnalysisEnabled(enabled);
      toast.success(enabled ? 'Автоматический месячный анализ включен' : 'Автоматический месячный анализ отключен');
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
            <BarChart3 className="w-5 h-5 text-primary" />
            Ежемесячный анализ здоровья
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Автоматический месячный анализ</h4>
              <p className="text-sm text-muted-foreground">
                Анализ будет выполняться 1 числа каждого месяца в 09:00
              </p>
            </div>
            <Switch
              checked={autoAnalysisEnabled}
              onCheckedChange={handleToggleAutoAnalysis}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Месяц</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium">Год</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleTriggerAnalysis} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализируем...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Запустить месячный анализ
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Последний анализ */}
      {latestAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Последний месячный анализ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(latestAnalysis.analysis_date).toLocaleDateString('ru-RU', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
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

              {latestAnalysis.trends_identified && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Выявленные тренды:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(latestAnalysis.trends_identified).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-2 bg-muted/50 rounded text-xs">
                        <div className="font-medium capitalize">{key}</div>
                        <div className="text-muted-foreground">
                          {Array.isArray(value) ? `${value.length} элементов` : 'Данные'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Инсайты из документов */}
      {documentInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Анализ медицинских документов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentInsights.map((insight) => (
                <div key={insight.id} className="border-l-2 border-blue-200 pl-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{insight.insight_data?.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.insight_data?.description}
                  </p>
                  {insight.insight_data?.document_count && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {insight.insight_data.document_count} документов
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Месячные инсайты */}
      {monthlyInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Месячные инсайты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyInsights.map((insight) => (
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