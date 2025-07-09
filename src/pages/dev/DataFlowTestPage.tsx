import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataFlowDiagnostics } from '@/components/dev/DataFlowDiagnostics';
import { DataFlowValidator } from '@/services/dataFlowValidator';
import { TestStep, TestResult } from '@/types/dataFlow';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  TestTube,
  Users,
  Database,
  Activity,
  Target,
  RefreshCw
} from 'lucide-react';

const DataFlowTestPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(true);

  const validator = new DataFlowValidator();

  // Интерактивные тестовые шаги
  const testSteps: TestStep[] = [
    {
      title: "Проверьте регистрацию нового пользователя",
      instruction: "Зарегистрируйтесь с персоной 'active_phase' и проверьте сохранение данных",
      check: async () => validator.validateRegistrationData()
    },
    {
      title: "Проверьте переход к онбордингу", 
      instruction: "Завершите регистрацию и убедитесь, что данные передались в онбординг",
      check: async () => {
        const registrationCheck = validator.validateRegistrationData();
        const presets = JSON.parse(localStorage.getItem('eva_onboarding_presets') || 'null');
        
        return {
          ...registrationCheck,
          stage: 'registration',
          data_present: !!presets,
          missing_fields: presets ? [] : ['onboarding_presets'],
          errors: presets ? undefined : ['Onboarding presets not created']
        };
      }
    },
    {
      title: "Проверьте персонализацию онбординга",
      instruction: "Убедитесь, что вопросы адаптированы под выбранную персону",
      check: async () => {
        const presets = JSON.parse(localStorage.getItem('eva_onboarding_presets') || 'null');
        const userData = JSON.parse(localStorage.getItem('eva_user_data') || 'null');
        
        return {
          stage: 'onboarding',
          status: (presets?.persona?.id === userData?.selectedPersona?.id) ? 'passed' : 'failed',
          data_present: !!presets,
          data_integrity: presets ? 100 : 0,
          missing_fields: presets ? [] : ['persona_mapping'],
          last_updated: presets?.transferTimestamp || 'never',
          data_size: presets ? Object.keys(presets).length : 0,
          errors: !presets ? ['Persona mapping not found'] : undefined
        };
      }
    },
    {
      title: "Проверьте завершение онбординга",
      instruction: "Заполните все 7 шагов и проверьте определение фазы менопаузы",
      check: async () => validator.validateOnboardingData()
    },
    {
      title: "Проверьте трекер симптомов",
      instruction: "Добавьте записи в трекер и убедитесь в сохранении данных",
      check: async () => validator.validateTrackerData()
    },
    {
      title: "Проверьте агрегацию данных",
      instruction: "Убедитесь, что все данные агрегируются в healthDataAggregator",
      check: async () => validator.validateHealthDataAggregator()
    }
  ];

  const executeStep = async () => {
    if (currentStep >= testSteps.length) return;

    setIsRunningTest(true);
    try {
      const startTime = Date.now();
      const result = await testSteps[currentStep].check();
      const endTime = Date.now();

      const testResult: TestResult = {
        test_name: testSteps[currentStep].title,
        steps: [{
          step: testSteps[currentStep].title,
          passed: result.status === 'passed',
          details: result
        }],
        overall_status: result.status === 'passed' ? 'passed' : 'failed',
        execution_time: endTime - startTime,
        errors: result.errors
      };

      setTestResults([...testResults, testResult]);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const runAutomaticTests = async () => {
    setIsRunningTest(true);
    setInteractiveMode(false);
    
    try {
      const allResults: TestResult[] = [];
      
      for (let i = 0; i < testSteps.length; i++) {
        const startTime = Date.now();
        const result = await testSteps[i].check();
        const endTime = Date.now();

        const testResult: TestResult = {
          test_name: testSteps[i].title,
          steps: [{
            step: testSteps[i].title,
            passed: result.status === 'passed',
            details: result
          }],
          overall_status: result.status === 'passed' ? 'passed' : 'failed',
          execution_time: endTime - startTime,
          errors: result.errors
        };

        allResults.push(testResult);
      }

      setTestResults(allResults);
      setCurrentStep(testSteps.length);
    } catch (error) {
      console.error('Automatic test error:', error);
    } finally {
      setIsRunningTest(false);
    }
  };

  const resetTests = () => {
    setCurrentStep(0);
    setTestResults([]);
    setInteractiveMode(true);
  };

  const checkLocalStorageData = () => {
    const keys = [
      'eva_auth_token',
      'eva_user_data',
      'eva_onboarding_data',
      'eva_onboarding_presets',
      'eva_symptom_entries',
      'eva_health_data',
      'eva_last_weather_update'
    ];

    keys.forEach(key => {
      const data = localStorage.getItem(key);
      console.log(`${key}:`, data ? JSON.parse(data) : 'Отсутствует');
    });
  };

  const stageIcons = {
    registration: Users,
    onboarding: Database,
    tracker: Activity,
    recommendations: Target
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Flow Test Page</h1>
          <p className="text-muted-foreground mt-2">
            Комплексное тестирование потока данных между этапами онбординга
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkLocalStorageData}>
            Проверить localStorage
          </Button>
          <Button variant="outline" onClick={resetTests}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Сбросить тесты
          </Button>
        </div>
      </div>

      <Tabs defaultValue="diagnostics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
          <TabsTrigger value="interactive">Интерактивные тесты</TabsTrigger>
          <TabsTrigger value="results">Результаты</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics">
          <DataFlowDiagnostics />
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Интерактивное тестирование
                  </CardTitle>
                  <CardDescription>
                    Пошаговая проверка data flow между этапами
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={runAutomaticTests}
                    disabled={isRunningTest}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Автоматический тест
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {interactiveMode && currentStep < testSteps.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    {currentStep + 1}
                  </span>
                  {testSteps[currentStep].title}
                </CardTitle>
                <CardDescription>
                  {testSteps[currentStep].instruction}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Шаг {currentStep + 1} из {testSteps.length}
                  </div>
                  <Button 
                    onClick={executeStep}
                    disabled={isRunningTest}
                  >
                    {isRunningTest ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Проверить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Тестирование завершено!
                </CardTitle>
                <CardDescription>
                  Все шаги выполнены. Перейдите на вкладку "Результаты" для просмотра отчета.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={resetTests}>
                  Начать заново
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Прогресс бар */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Прогресс тестирования</span>
                <span className="text-sm font-medium">{currentStep}/{testSteps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / testSteps.length) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* История выполненных тестов */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>История выполнения</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {result.overall_status === 'passed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-medium">{result.test_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {result.execution_time}ms
                        </span>
                        <Badge variant={result.overall_status === 'passed' ? 'default' : 'destructive'}>
                          {result.overall_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Сводка результатов тестирования</CardTitle>
              <CardDescription>
                Общий отчет по всем выполненным тестам
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.filter(r => r.overall_status === 'passed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Успешно</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.filter(r => r.overall_status === 'failed').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Неудачно</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {testResults.reduce((sum, r) => sum + r.execution_time, 0)}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Общее время</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {testResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {result.overall_status === 'passed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="font-medium">{result.test_name}</span>
                            </div>
                            <Badge variant={result.overall_status === 'passed' ? 'default' : 'destructive'}>
                              {result.overall_status}
                            </Badge>
                          </div>

                          {result.errors && result.errors.length > 0 && (
                            <Alert variant="destructive" className="mt-3">
                              <XCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Ошибки:</strong>
                                <ul className="mt-1 list-disc list-inside">
                                  {result.errors.map((error, errorIndex) => (
                                    <li key={errorIndex}>{error}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Результаты тестирования появятся здесь после выполнения тестов
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataFlowTestPage;