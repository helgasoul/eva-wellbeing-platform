import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Download,
  ArrowRight,
  Database,
  Users,
  Activity,
  Target
} from 'lucide-react';
import { DataFlowValidator } from '@/services/dataFlowValidator';
import { DataFlowDiagnostics as DataFlowDiagnosticsType, DataFlowCheck } from '@/types/dataFlow';

interface DataFlowDiagnosticsProps {
  className?: string;
}

export const DataFlowDiagnostics: React.FC<DataFlowDiagnosticsProps> = ({ className }) => {
  const [diagnostics, setDiagnostics] = useState<DataFlowDiagnosticsType | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  const validator = new DataFlowValidator();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const results = validator.runFullDiagnostics();
      setDiagnostics(results);
      setLastCheck(new Date().toLocaleString('ru-RU'));
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const repairDataFlow = async () => {
    setIsRunning(true);
    try {
      const success = await validator.repairDataFlow();
      if (success) {
        // Повторяем диагностику после восстановления
        await runDiagnostics();
      }
    } catch (error) {
      console.error('Error repairing data flow:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportDataDump = () => {
    const dataDump = validator.exportUserDataDump();
    const blob = new Blob([JSON.stringify(dataDump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-data-dump-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: DataFlowCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: DataFlowCheck['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
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
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const stageIcons = {
    registration: Users,
    onboarding: Database,
    tracker: Activity,
    recommendations: Target
  };

  const stageNames = {
    registration: 'Регистрация',
    onboarding: 'Онбординг',
    tracker: 'Трекер симптомов',
    recommendations: 'Рекомендации'
  };

  if (!diagnostics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isRunning ? 'animate-spin' : ''}`} />
            Диагностика Data Flow
          </CardTitle>
          <CardDescription>
            Загрузка диагностических данных...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и управление */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Диагностика Data Flow
              </CardTitle>
              <CardDescription>
                Последняя проверка: {lastCheck}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportDataDump}
              >
                <Download className="h-4 w-4 mr-1" />
                Экспорт
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={repairDataFlow}
                disabled={isRunning}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
                Восстановить
              </Button>
              <Button
                size="sm"
                onClick={runDiagnostics}
                disabled={isRunning}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getOverallStatusColor(diagnostics.overall_status)}`}>
                {diagnostics.overall_status === 'healthy' && <CheckCircle className="h-4 w-4 mr-1" />}
                {diagnostics.overall_status === 'degraded' && <AlertTriangle className="h-4 w-4 mr-1" />}
                {diagnostics.overall_status === 'critical' && <XCircle className="h-4 w-4 mr-1" />}
                Статус: {diagnostics.overall_status === 'healthy' ? 'Здоровый' : 
                         diagnostics.overall_status === 'degraded' ? 'Деградированный' : 'Критический'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{diagnostics.integrity_score}%</div>
              <div className="text-sm text-muted-foreground">Целостность данных</div>
            </div>
          </div>
          <Progress value={diagnostics.integrity_score} className="mt-4" />
        </CardContent>
      </Card>

      {/* Визуальная карта data flow */}
      <Card>
        <CardHeader>
          <CardTitle>Карта Data Flow</CardTitle>
          <CardDescription>
            Визуализация потока данных между этапами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {diagnostics.stages.map((stage, index) => {
              const Icon = stageIcons[stage.stage];
              return (
                <React.Fragment key={stage.stage}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-3 rounded-full border-2 ${
                      stage.status === 'passed' ? 'border-green-500 bg-green-50' :
                      stage.status === 'failed' ? 'border-red-500 bg-red-50' :
                      stage.status === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-300 bg-gray-50'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        stage.status === 'passed' ? 'text-green-600' :
                        stage.status === 'failed' ? 'text-red-600' :
                        stage.status === 'warning' ? 'text-yellow-600' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{stageNames[stage.stage]}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getStatusIcon(stage.status)}
                        <span>{stage.data_integrity}%</span>
                      </div>
                    </div>
                  </div>
                  {index < diagnostics.stages.length - 1 && (
                    <div className="flex items-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Детальная информация по этапам */}
      <Tabs defaultValue="stages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stages">Этапы</TabsTrigger>
          <TabsTrigger value="data">Данные</TabsTrigger>
          <TabsTrigger value="issues">Проблемы</TabsTrigger>
        </TabsList>

        <TabsContent value="stages" className="space-y-4">
          {diagnostics.stages.map((stage) => (
            <Card key={stage.stage}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(stage.status)}
                    {stageNames[stage.stage]}
                  </CardTitle>
                  <Badge variant={stage.status === 'passed' ? 'default' : 
                                 stage.status === 'failed' ? 'destructive' : 'secondary'}>
                    {stage.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Целостность данных</div>
                    <div className="text-2xl font-bold">{stage.data_integrity}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Размер данных</div>
                    <div className="text-2xl font-bold">{stage.data_size}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Последнее обновление</div>
                    <div className="text-sm">{new Date(stage.last_updated).toLocaleString('ru-RU')}</div>
                  </div>
                </div>

                {stage.missing_fields.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Отсутствующие поля:</strong> {stage.missing_fields.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}

                {stage.errors && stage.errors.length > 0 && (
                  <Alert variant="destructive" className="mt-2">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Ошибки:</strong>
                      <ul className="mt-1 list-disc list-inside">
                        {stage.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Карта данных</CardTitle>
              <CardDescription>
                Состояние всех хранилищ данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(diagnostics.data_map).map(([key, data]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{key.replace('_', ' ')}</div>
                      <Badge variant={data ? 'default' : 'secondary'}>
                        {data ? 'Присутствует' : 'Отсутствует'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {data ? `${Object.keys(data).length} полей` : 'Нет данных'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Выявленные проблемы</CardTitle>
              <CardDescription>
                Список всех найденных проблем и рекомендации по устранению
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics.stages
                  .filter(stage => stage.status !== 'passed')
                  .map((stage) => (
                    <Alert key={stage.stage} variant={stage.status === 'failed' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{stageNames[stage.stage]}:</strong>
                        <ul className="mt-1 list-disc list-inside">
                          {stage.missing_fields.map((field, index) => (
                            <li key={index}>Отсутствует: {field}</li>
                          ))}
                          {stage.errors?.map((error, index) => (
                            <li key={`error-${index}`}>Ошибка: {error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ))}

                {diagnostics.stages.every(stage => stage.status === 'passed') && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Проблем не обнаружено! Все этапы data flow работают корректно.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};