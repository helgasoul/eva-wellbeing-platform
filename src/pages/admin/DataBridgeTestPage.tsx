
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  Activity
} from 'lucide-react';
import { dataBridgeTestUtils } from '@/utils/dataBridgeTestUtils';

export const DataBridgeTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runFullTestSuite = async () => {
    setIsRunning(true);
    setCurrentTest('Initializing...');
    
    try {
      const results = await dataBridgeTestUtils.runFullTestSuite();
      setTestResults(results);
    } catch (error) {
      console.error('Test suite failed:', error);
      setTestResults({
        overall: 'failed',
        results: {},
        summary: { totalTests: 0, passedTests: 0, failedTests: 1, totalErrors: 1 }
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runIndividualTest = async (testName: string) => {
    setIsRunning(true);
    setCurrentTest(testName);
    
    try {
      let result;
      switch (testName) {
        case 'registrationFlow':
          result = await dataBridgeTestUtils.testRegistrationToOnboardingFlow();
          break;
        case 'dataPersistence':
          result = await dataBridgeTestUtils.testOnboardingDataPersistence();
          break;
        case 'backupRecovery':
          result = await dataBridgeTestUtils.testBackupAndRecovery();
          break;
        case 'exportImport':
          result = await dataBridgeTestUtils.testDataExportImport();
          break;
        default:
          throw new Error(`Unknown test: ${testName}`);
      }
      
      setTestResults(prev => ({
        ...prev,
        results: {
          ...prev?.results,
          [testName]: result
        }
      }));
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const clearTestData = () => {
    dataBridgeTestUtils.clearAllTestData();
    setTestResults(null);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Bridge Testing</h1>
        <div className="flex gap-2">
          <Button 
            onClick={clearTestData} 
            variant="outline" 
            size="sm"
            disabled={isRunning}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Test Data
          </Button>
          <Button 
            onClick={runFullTestSuite} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Full Test Suite
          </Button>
        </div>
      </div>

      {/* Test Status */}
      {isRunning && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Running tests... Current: {currentTest}
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results Overview */}
      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
              {testResults.overall === 'passed' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                testResults.overall === 'passed' ? 'text-green-600' : 'text-red-600'
              }`}>
                {testResults.overall.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">
                Test Suite Status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Passed</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {testResults.summary.passedTests}
              </div>
              <p className="text-xs text-muted-foreground">
                of {testResults.summary.totalTests} tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Failed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {testResults.summary.failedTests}
              </div>
              <p className="text-xs text-muted-foreground">
                of {testResults.summary.totalTests} tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {testResults.summary.totalErrors}
              </div>
              <p className="text-xs text-muted-foreground">
                Error count
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Test Results */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registration">Registration Flow</TabsTrigger>
          <TabsTrigger value="persistence">Data Persistence</TabsTrigger>
          <TabsTrigger value="backup">Backup/Recovery</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'registrationFlow', name: 'Registration to Onboarding Flow', description: 'Tests data transfer from registration to onboarding' },
                  { key: 'dataPersistence', name: 'Data Persistence', description: 'Tests data saving and retrieval integrity' },
                  { key: 'backupRecovery', name: 'Backup & Recovery', description: 'Tests backup creation and data recovery' },
                  { key: 'exportImport', name: 'Export & Import', description: 'Tests data export and import functionality' }
                ].map((test) => (
                  <div key={test.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {testResults?.results?.[test.key] && getStatusIcon(testResults.results[test.key].success)}
                        <span className="font-medium">{test.name}</span>
                        {testResults?.results?.[test.key] && getStatusBadge(testResults.results[test.key].success)}
                      </div>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                    <Button
                      onClick={() => runIndividualTest(test.key)}
                      disabled={isRunning}
                      variant="outline"
                      size="sm"
                    >
                      {isRunning && currentTest === test.key ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-4">
          {testResults?.results?.registrationFlow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(testResults.results.registrationFlow.success)}
                  <span>Registration Flow Test</span>
                  {getStatusBadge(testResults.results.registrationFlow.success)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Transfer Time</label>
                      <div className="text-2xl font-bold">{testResults.results.registrationFlow.metrics.transferTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Validation</label>
                      <div className={`text-2xl font-bold ${testResults.results.registrationFlow.metrics.validationPassed ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.results.registrationFlow.metrics.validationPassed ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Backup Created</label>
                      <div className={`text-2xl font-bold ${testResults.results.registrationFlow.metrics.backupCreated ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.results.registrationFlow.metrics.backupCreated ? 'YES' : 'NO'}
                      </div>
                    </div>
                  </div>
                  
                  {testResults.results.registrationFlow.errors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Errors</label>
                      <div className="mt-2 space-y-1">
                        {testResults.results.registrationFlow.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="persistence" className="space-y-4">
          {testResults?.results?.dataPersistence && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(testResults.results.dataPersistence.success)}
                  <span>Data Persistence Test</span>
                  {getStatusBadge(testResults.results.dataPersistence.success)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Save Time</label>
                      <div className="text-2xl font-bold">{testResults.results.dataPersistence.metrics.saveTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Retrieve Time</label>
                      <div className="text-2xl font-bold">{testResults.results.dataPersistence.metrics.retrieveTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data Integrity</label>
                      <div className={`text-2xl font-bold ${testResults.results.dataPersistence.metrics.dataIntegrity ? 'text-green-600' : 'text-red-600'}`}>
                        {testResults.results.dataPersistence.metrics.dataIntegrity ? 'PASS' : 'FAIL'}
                      </div>
                    </div>
                  </div>
                  
                  {testResults.results.dataPersistence.errors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Errors</label>
                      <div className="mt-2 space-y-1">
                        {testResults.results.dataPersistence.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          {testResults?.results?.backupRecovery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(testResults.results.backupRecovery.success)}
                  <span>Backup & Recovery Test</span>
                  {getStatusBadge(testResults.results.backupRecovery.success)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Backup Time</label>
                      <div className="text-2xl font-bold">{testResults.results.backupRecovery.metrics.backupTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Recovery Time</label>
                      <div className="text-2xl font-bold">{testResults.results.backupRecovery.metrics.recoveryTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Compression Ratio</label>
                      <div className="text-2xl font-bold">{(testResults.results.backupRecovery.metrics.compressionRatio * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  
                  {testResults.results.backupRecovery.errors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Errors</label>
                      <div className="mt-2 space-y-1">
                        {testResults.results.backupRecovery.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          {testResults?.results?.exportImport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(testResults.results.exportImport.success)}
                  <span>Export & Import Test</span>
                  {getStatusBadge(testResults.results.exportImport.success)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Export Time</label>
                      <div className="text-2xl font-bold">{testResults.results.exportImport.metrics.exportTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Import Time</label>
                      <div className="text-2xl font-bold">{testResults.results.exportImport.metrics.importTime}ms</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Data Size</label>
                      <div className="text-2xl font-bold">{(testResults.results.exportImport.metrics.dataSize / 1024).toFixed(1)}KB</div>
                    </div>
                  </div>
                  
                  {testResults.results.exportImport.errors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Errors</label>
                      <div className="mt-2 space-y-1">
                        {testResults.results.exportImport.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
