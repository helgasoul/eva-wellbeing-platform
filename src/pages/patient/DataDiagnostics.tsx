import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Trash2, 
  Download,
  Database,
  HardDrive,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { DataBridge } from '@/services/DataBridge';
import { formatFileSize, formatDateTime, showNotification } from '@/utils/dataUtils';
import { toast } from '@/hooks/use-toast';

interface DiagnosticReport {
  timestamp: string;
  validationReport: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  };
  userSummary: any;
  storageAnalysis: {
    totalKeys: number;
    evaKeys: number;
    totalSize: string;
    keyDetails: Array<{
      key: string;
      size: string;
      lastModified: string;
    }>;
  };
  recommendations: Array<{
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    action: string;
  }>;
}

const DataDiagnostics: React.FC = () => {
  const { user, getUserDataSummary, saveUserData, updateUser } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Диагностика данных' }
  ];

  // Автоматическая диагностика при загрузке
  useEffect(() => {
    if (user) {
      runDiagnostics();
    }
  }, [user]);

  const runDiagnostics = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 DataDiagnostics: Запуск диагностики...');

      const dataBridge = DataBridge.getInstance();
      
      // Проверка целостности данных
      const validationReport = await dataBridge.validateDataIntegrity();
      
      // Получение сводки данных пользователя
      const userSummary = await getUserDataSummary();
      
      // Анализ производительности localStorage
      const storageAnalysis = analyzeLocalStorage();
      
      // Создание отчета
      const report: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        validationReport,
        userSummary,
        storageAnalysis,
        recommendations: generateRecommendations(validationReport, userSummary, storageAnalysis)
      };

      setDiagnostics(report);
      console.log('✅ DataDiagnostics: Диагностика завершена');
      
    } catch (error) {
      console.error('❌ DataDiagnostics: Ошибка диагностики:', error);
      toast({
        title: 'Ошибка диагностики',
        description: 'Не удалось выполнить диагностику данных',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeLocalStorage = () => {
    try {
      const analysis = {
        totalKeys: Object.keys(localStorage).length,
        evaKeys: Object.keys(localStorage).filter(key => key.includes('eva_')).length,
        totalSize: '0 KB',
        keyDetails: [] as Array<{ key: string; size: string; lastModified: string }>
      };

      let totalBytes = 0;

      for (let key in localStorage) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          totalBytes += size;
          
          if (key.includes('eva_') || key.includes('onboarding') || key.includes('symptom') || key.includes('ai_chat')) {
            analysis.keyDetails.push({
              key,
              size: formatFileSize(size),
              lastModified: extractTimestamp(value)
            });
          }
        }
      }

      analysis.totalSize = formatFileSize(totalBytes);
      return analysis;
    } catch (error) {
      console.error('Ошибка анализа localStorage:', error);
      return { 
        totalKeys: 0,
        evaKeys: 0,
        totalSize: '0 KB',
        keyDetails: [],
        error: 'Ошибка анализа' 
      };
    }
  };

  const extractTimestamp = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return parsed.timestamp || parsed.createdAt || parsed.updatedAt || 'Не указано';
    } catch {
      return 'Не указано';
    }
  };

  const generateRecommendations = (validation: any, userSummary: any, storage: any) => {
    const recommendations = [];

    if (!validation.valid) {
      recommendations.push({
        type: 'error' as const,
        title: 'Критические ошибки данных',
        description: 'Обнаружены серьезные проблемы с данными. Требуется немедленное исправление.',
        action: 'Исправить автоматически'
      });
    }

    if (validation.warnings.length > 0) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Предупреждения',
        description: 'Есть некоторые проблемы, которые стоит исправить.',
        action: 'Проверить и обновить данные'
      });
    }

    if (!userSummary?.symptomEntries || userSummary.symptomEntries.length === 0) {
      recommendations.push({
        type: 'info' as const,
        title: 'Начните трекинг симптомов',
        description: 'Регулярное отслеживание симптомов поможет лучше понять ваше состояние.',
        action: 'Перейти к трекеру симптомов'
      });
    }

    if (!user?.onboardingCompleted) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Завершите онбординг',
        description: 'Незавершенный онбординг может привести к проблемам с персонализацией.',
        action: 'Завершить онбординг'
      });
    }

    const storageSizeInBytes = storage.totalSize ? parseFloat(storage.totalSize.replace(/[^\d.]/g, '')) * 1024 : 0;
    if (storageSizeInBytes > 1024 * 1024) { // Больше 1 MB
      recommendations.push({
        type: 'info' as const,
        title: 'Большой объем данных',
        description: 'Рассмотрите возможность очистки старых данных.',
        action: 'Очистить старые данные'
      });
    }

    return recommendations;
  };

  const handleFixIssues = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 DataDiagnostics: Исправление проблем...');

      // Исправить отсутствующие данные пользователя
      if (!diagnostics?.userSummary?.userData) {
        await saveUserData('user_data', {
          ...user,
          timestamp: new Date().toISOString()
        });
      }

      // Исправить флаг онбординга если данные есть
      if (diagnostics?.userSummary?.onboardingData && !user?.onboardingCompleted) {
        await updateUser({ onboardingCompleted: true });
      }

      // Перезапустить диагностику
      await runDiagnostics();
      
      console.log('✅ DataDiagnostics: Проблемы исправлены');
      showNotification('Проблемы исправлены', 'success');
      
    } catch (error) {
      console.error('❌ DataDiagnostics: Ошибка исправления:', error);
      showNotification('Ошибка исправления проблем', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    if (!diagnostics) return;

    const dataToExport = {
      user: user,
      diagnostics: diagnostics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eva-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (!confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      return;
    }

    try {
      // Очищаем все ключи Eva
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('eva_') || key.includes('onboarding') || key.includes('symptom') || key.includes('ai_chat')
      );

      keysToRemove.forEach(key => localStorage.removeItem(key));

      showNotification('Данные очищены', 'success');
      runDiagnostics();
    } catch (error) {
      console.error('Error clearing data:', error);
      showNotification('Ошибка очистки данных', 'error');
    }
  };

  const getStatusIcon = (valid: boolean) => {
    return valid ? (
      <CheckCircle className="h-8 w-8 text-green-500" />
    ) : (
      <AlertCircle className="h-8 w-8 text-red-500" />
    );
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <PatientLayout title="без | паузы - Диагностика данных" breadcrumbs={breadcrumbs}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="bloom-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-foreground mb-2">
                Диагностика данных 🔍
              </h1>
              <p className="text-muted-foreground">
                Проверка целостности и состояния всех данных пользователя
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={runDiagnostics}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Проверка...' : 'Обновить'}
              </Button>
              {diagnostics && (
                <Button
                  onClick={handleExportData}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт
                </Button>
              )}
            </div>
          </div>

          {/* Общий статус */}
          {diagnostics && (
            <div className={`p-4 rounded-lg border ${
              diagnostics.validationReport.valid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {getStatusIcon(diagnostics.validationReport.valid)}
                <div className="ml-3">
                  <h3 className="font-semibold text-lg">
                    {diagnostics.validationReport.valid ? 'Все данные в порядке' : 'Обнаружены проблемы'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Последняя проверка: {formatDateTime(diagnostics.timestamp)}
                  </p>
                </div>
                <div className="ml-auto">
                  {!diagnostics.validationReport.valid && (
                    <Button
                      onClick={handleFixIssues}
                      disabled={isLoading}
                      size="sm"
                    >
                      Исправить проблемы
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Детальная информация */}
        {diagnostics && (
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="errors">Ошибки</TabsTrigger>
                  <TabsTrigger value="storage">Хранилище</TabsTrigger>
                  <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
                </TabsList>

                {/* Обзор */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Database className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Профиль</p>
                            <p className="text-xs text-muted-foreground">
                              {diagnostics.userSummary?.userData ? '✅ Настроен' : '❌ Не настроен'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Записи симптомов</p>
                            <p className="text-xs text-muted-foreground">
                              {diagnostics.userSummary?.symptomEntries?.length || 0} записей
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">Размер данных</p>
                            <p className="text-xs text-muted-foreground">
                              {diagnostics.storageAnalysis.totalSize}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Info className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium">Ключей Eva</p>
                            <p className="text-xs text-muted-foreground">
                              {diagnostics.storageAnalysis.evaKeys} из {diagnostics.storageAnalysis.totalKeys}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress bar для состояния данных */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Состояние данных</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Целостность данных</span>
                          <span>{diagnostics.validationReport.valid ? '100%' : '75%'}</span>
                        </div>
                        <Progress value={diagnostics.validationReport.valid ? 100 : 75} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Ошибки и предупреждения */}
                <TabsContent value="errors" className="space-y-4">
                  {diagnostics.validationReport.errors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-700">Критические ошибки</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {diagnostics.validationReport.errors.map((error, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <span className="text-sm text-red-700">{error}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {diagnostics.validationReport.warnings.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-yellow-700">Предупреждения</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {diagnostics.validationReport.warnings.map((warning, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span className="text-sm text-yellow-700">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {diagnostics.validationReport.errors.length === 0 && diagnostics.validationReport.warnings.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-700 mb-2">Отлично!</h3>
                        <p className="text-green-600">Ошибок и предупреждений не обнаружено</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Анализ хранилища */}
                <TabsContent value="storage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Анализ локального хранилища</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Ключ</th>
                              <th className="text-left p-2">Размер</th>
                              <th className="text-left p-2">Последнее изменение</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnostics.storageAnalysis.keyDetails.map((detail, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2 font-mono text-xs">{detail.key}</td>
                                <td className="p-2">{detail.size}</td>
                                <td className="p-2">{detail.lastModified}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          onClick={handleClearData}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Очистить все данные
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Рекомендации */}
                <TabsContent value="recommendations" className="space-y-4">
                  {diagnostics.recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          {getRecommendationIcon(rec.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{rec.title}</h4>
                              <Badge variant={rec.type === 'error' ? 'destructive' : rec.type === 'warning' ? 'secondary' : 'default'}>
                                {rec.type === 'error' ? 'Критично' : rec.type === 'warning' ? 'Предупреждение' : 'Информация'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <p className="text-sm font-medium">Действие: {rec.action}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {diagnostics.recommendations.length === 0 && (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-700 mb-2">Все в порядке!</h3>
                        <p className="text-green-600">Рекомендаций нет - ваши данные в отличном состоянии</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
};

export default DataDiagnostics;