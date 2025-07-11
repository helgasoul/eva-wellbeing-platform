import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Globe, 
  Wifi, 
  Shield,
  Clock,
  Info,
  Download
} from 'lucide-react';
import { useNetworkDiagnostics } from '@/hooks/useNetworkDiagnostics';
import { DiagnosticReport, NetworkDiagnosticResult } from '@/services/networkDiagnosticsService';

interface NetworkDiagnosticsPanelProps {
  autoRun?: boolean;
  compact?: boolean;
  onReportGenerated?: (report: DiagnosticReport) => void;
}

export const NetworkDiagnosticsPanel: React.FC<NetworkDiagnosticsPanelProps> = ({
  autoRun = false,
  compact = false,
  onReportGenerated
}) => {
  const { 
    isRunning, 
    currentReport, 
    error, 
    runDiagnostics, 
    getHistory,
    clearError 
  } = useNetworkDiagnostics();
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (autoRun) {
      runDiagnostics();
    }
  }, [autoRun, runDiagnostics]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.random() * 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isRunning]);

  useEffect(() => {
    if (currentReport && onReportGenerated) {
      onReportGenerated(currentReport);
    }
  }, [currentReport, onReportGenerated]);

  const handleRunDiagnostics = async () => {
    setProgress(0);
    await runDiagnostics();
  };

  const getStatusIcon = (status: NetworkDiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: NetworkDiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const exportReport = () => {
    if (!currentReport) return;
    
    const dataStr = JSON.stringify(currentReport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-diagnostics-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Диагностика сети</span>
              {currentReport && (
                <Badge className={getOverallStatusColor(currentReport.summary.overallStatus)}>
                  {currentReport.summary.overallStatus}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunDiagnostics}
              disabled={isRunning}
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {isRunning && (
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
            </div>
          )}
          
          {error && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-6 w-6" />
              <span>Диагностика сети</span>
            </CardTitle>
            <CardDescription>
              Комплексная проверка подключения и состояния сети
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {currentReport && (
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            )}
            <Button
              onClick={handleRunDiagnostics}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Выполняется...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Запустить диагностику
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Прогресс выполнения</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="link"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                Закрыть
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {currentReport && (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Результаты</TabsTrigger>
              <TabsTrigger value="environment">Окружение</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {currentReport.summary.passed}
                    </div>
                    <div className="text-sm text-muted-foreground">Успешно</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {currentReport.summary.warnings}
                    </div>
                    <div className="text-sm text-muted-foreground">Предупреждения</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {currentReport.summary.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">Ошибки</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge className={getOverallStatusColor(currentReport.summary.overallStatus)}>
                      {currentReport.summary.overallStatus}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">Общий статус</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {currentReport.results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getStatusIcon(result.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{result.test}</h4>
                            <div className="flex items-center space-x-2">
                              {result.duration && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {result.duration}ms
                                </Badge>
                              )}
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(result.status)}`} />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.message}
                          </p>
                          {result.details && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                Подробности
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="environment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Информация об окружении</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Браузер</label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {currentReport.environment.userAgent}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Хост</label>
                      <p className="text-sm text-muted-foreground">
                        {currentReport.environment.hostname}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Статус сети</label>
                      <div className="flex items-center space-x-2">
                        <Wifi className={`h-4 w-4 ${currentReport.environment.online ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="text-sm">
                          {currentReport.environment.online ? 'Онлайн' : 'Офлайн'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Тип соединения</label>
                      <p className="text-sm text-muted-foreground">
                        {currentReport.environment.connectionType || 'Неизвестно'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {getHistory().map((report, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {new Date(report.timestamp).toLocaleString('ru-RU')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {report.summary.totalTests} тестов, {report.summary.passed} успешно, {report.summary.failed} ошибок
                          </div>
                        </div>
                        <Badge className={getOverallStatusColor(report.summary.overallStatus)}>
                          {report.summary.overallStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};