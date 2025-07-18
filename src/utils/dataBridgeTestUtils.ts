
import { dataBridgeService } from '@/services/DataBridgeService';
import type { 
  DataValidationRule, 
  DataTransferConfig,
  DataExportOptions,
  DataImportOptions 
} from '@/types/dataBridgeService';

export class DataBridgeTestUtils {
  private static instance: DataBridgeTestUtils;
  
  static getInstance(): DataBridgeTestUtils {
    if (!DataBridgeTestUtils.instance) {
      DataBridgeTestUtils.instance = new DataBridgeTestUtils();
    }
    return DataBridgeTestUtils.instance;
  }

  // Test data generators
  generateTestRegistrationData(overrides: Partial<any> = {}): any {
    return {
      step1: {
        email: 'test@example.com',
        phone: '+1234567890',
        emailVerified: true,
        phoneVerified: true,
        ...overrides.step1
      },
      step2: {
        gdpr_basic: true,
        medical_data: true,
        ai_analysis: true,
        research_participation: false,
        marketing_communications: false,
        ...overrides.step2
      },
      step3: {
        personaId: 'active_phase',
        additionalData: {},
        ...overrides.step3
      },
      step4: {
        firstName: 'Test',
        lastName: 'User',
        password: 'testPassword123',
        ...overrides.step4
      }
    };
  }

  generateTestOnboardingData(overrides: Partial<any> = {}): any {
    return {
      basicInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        dateOfBirth: '1980-01-01',
        ...overrides.basicInfo
      },
      menstrualHistory: {
        lastPeriod: '2024-01-01',
        cycleLength: 28,
        irregularities: false,
        ...overrides.menstrualHistory
      },
      symptoms: {
        hotFlashes: { frequency: 'daily', severity: 'moderate' },
        nightSweats: { frequency: 'weekly', severity: 'mild' },
        moodChanges: { frequency: 'occasional', severity: 'mild' },
        ...overrides.symptoms
      },
      medicalHistory: {
        conditions: [],
        medications: [],
        surgeries: [],
        allergies: [],
        ...overrides.medicalHistory
      },
      lifestyle: {
        exerciseFrequency: 'regular',
        dietType: 'balanced',
        smokingStatus: 'never',
        alcoholConsumption: 'occasional',
        ...overrides.lifestyle
      },
      goals: {
        primary: 'symptom_management',
        secondary: ['better_sleep', 'mood_stability'],
        ...overrides.goals
      }
    };
  }

  // Test scenarios
  async testRegistrationToOnboardingFlow(): Promise<{
    success: boolean;
    errors: string[];
    metrics: {
      transferTime: number;
      validationPassed: boolean;
      backupCreated: boolean;
    };
  }> {
    const results = { success: false, errors: [], metrics: { transferTime: 0, validationPassed: false, backupCreated: false } };
    
    try {
      const startTime = Date.now();
      
      // Generate test data
      const registrationData = this.generateTestRegistrationData();
      const mockUser = { id: 'test-user', email: 'test@example.com' };
      
      // Test validation
      const validationRules: DataValidationRule[] = [
        { field: 'step1.email', type: 'required', message: 'Email required' },
        { field: 'step1.email', type: 'email', message: 'Valid email required' },
        { field: 'step3.personaId', type: 'required', message: 'Persona required' }
      ];
      
      const validation = dataBridgeService.validateData(registrationData, validationRules);
      results.metrics.validationPassed = validation.isValid;
      
      if (!validation.isValid) {
        results.errors.push(...validation.errors);
        return results;
      }
      
      // Test transfer
      const transferConfig: DataTransferConfig = {
        validateBefore: true,
        backupBefore: true,
        atomicTransfer: true,
        retryAttempts: 3,
        timeoutMs: 30000
      };
      
      const transferResult = await dataBridgeService.transferData(
        'registration_data',
        'onboarding_presets',
        registrationData,
        transferConfig
      );
      
      results.metrics.transferTime = Date.now() - startTime;
      results.metrics.backupCreated = !!transferResult.backupId;
      results.success = transferResult.success;
      
      if (!transferResult.success) {
        results.errors.push(...transferResult.errors);
      }
      
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
    
    return results;
  }

  async testOnboardingDataPersistence(): Promise<{
    success: boolean;
    errors: string[];
    metrics: {
      saveTime: number;
      retrieveTime: number;
      dataIntegrity: boolean;
    };
  }> {
    const results = { success: false, errors: [], metrics: { saveTime: 0, retrieveTime: 0, dataIntegrity: false } };
    
    try {
      const onboardingData = this.generateTestOnboardingData();
      
      // Test save
      const saveStart = Date.now();
      const saveResult = await dataBridgeService.transferData(
        'onboarding_input',
        'onboarding_data',
        onboardingData
      );
      results.metrics.saveTime = Date.now() - saveStart;
      
      if (!saveResult.success) {
        results.errors.push(...saveResult.errors);
        return results;
      }
      
      // Test retrieve
      const retrieveStart = Date.now();
      const backup = await dataBridgeService.createBackup('onboarding_data', onboardingData);
      const retrievedData = await dataBridgeService.restoreFromBackup(backup.id);
      results.metrics.retrieveTime = Date.now() - retrieveStart;
      
      // Test data integrity
      const originalChecksum = dataBridgeService.calculateChecksum(onboardingData);
      const retrievedChecksum = dataBridgeService.calculateChecksum(retrievedData);
      results.metrics.dataIntegrity = originalChecksum === retrievedChecksum;
      
      if (!results.metrics.dataIntegrity) {
        results.errors.push('Data integrity check failed');
      }
      
      results.success = results.metrics.dataIntegrity;
      
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
    
    return results;
  }

  async testBackupAndRecovery(): Promise<{
    success: boolean;
    errors: string[];
    metrics: {
      backupTime: number;
      recoveryTime: number;
      compressionRatio: number;
    };
  }> {
    const results = { success: false, errors: [], metrics: { backupTime: 0, recoveryTime: 0, compressionRatio: 0 } };
    
    try {
      const testData = this.generateTestOnboardingData();
      const originalSize = JSON.stringify(testData).length;
      
      // Test backup
      const backupStart = Date.now();
      const backup = await dataBridgeService.createBackup('test_data', testData);
      results.metrics.backupTime = Date.now() - backupStart;
      results.metrics.compressionRatio = backup.size / originalSize;
      
      // Test recovery
      const recoveryStart = Date.now();
      const recoveredData = await dataBridgeService.restoreFromBackup(backup.id);
      results.metrics.recoveryTime = Date.now() - recoveryStart;
      
      // Verify data integrity
      const originalChecksum = dataBridgeService.calculateChecksum(testData);
      const recoveredChecksum = dataBridgeService.calculateChecksum(recoveredData);
      
      if (originalChecksum !== recoveredChecksum) {
        results.errors.push('Data integrity check failed during recovery');
        return results;
      }
      
      results.success = true;
      
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
    
    return results;
  }

  async testDataExportImport(): Promise<{
    success: boolean;
    errors: string[];
    metrics: {
      exportTime: number;
      importTime: number;
      dataSize: number;
    };
  }> {
    const results = { success: false, errors: [], metrics: { exportTime: 0, importTime: 0, dataSize: 0 } };
    
    try {
      const testData = {
        registration: this.generateTestRegistrationData(),
        onboarding: this.generateTestOnboardingData()
      };
      
      // Store test data
      await dataBridgeService.transferData('test_reg', 'test_registration', testData.registration);
      await dataBridgeService.transferData('test_onb', 'test_onboarding', testData.onboarding);
      
      // Test export
      const exportStart = Date.now();
      const exportOptions: DataExportOptions = {
        format: 'json',
        includeMetadata: true,
        compressionEnabled: true,
        dataTypes: ['test_registration', 'test_onboarding']
      };
      
      const exportBlob = await dataBridgeService.exportData(exportOptions);
      results.metrics.exportTime = Date.now() - exportStart;
      results.metrics.dataSize = exportBlob.size;
      
      // Test import
      const importStart = Date.now();
      const exportText = await exportBlob.text();
      const exportedData = JSON.parse(exportText);
      
      const importOptions: DataImportOptions = {
        format: 'json',
        validateSchema: true,
        backupBefore: true,
        mergeStrategy: 'replace',
        ignoreErrors: false
      };
      
      const importResult = await dataBridgeService.importData(exportedData, importOptions);
      results.metrics.importTime = Date.now() - importStart;
      
      if (!importResult.success) {
        results.errors.push(...importResult.errors);
        return results;
      }
      
      results.success = true;
      
    } catch (error) {
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
    
    return results;
  }

  async runFullTestSuite(): Promise<{
    overall: 'passed' | 'failed';
    results: {
      registrationFlow: any;
      dataPersistence: any;
      backupRecovery: any;
      exportImport: any;
    };
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
      totalErrors: number;
    };
  }> {
    console.log('🧪 Running DataBridge Test Suite...');
    
    const results = {
      registrationFlow: await this.testRegistrationToOnboardingFlow(),
      dataPersistence: await this.testOnboardingDataPersistence(),
      backupRecovery: await this.testBackupAndRecovery(),
      exportImport: await this.testDataExportImport()
    };
    
    const testResults = Object.values(results);
    const passedTests = testResults.filter(r => r.success).length;
    const failedTests = testResults.filter(r => !r.success).length;
    const totalErrors = testResults.reduce((sum, r) => sum + r.errors.length, 0);
    
    const summary = {
      totalTests: testResults.length,
      passedTests,
      failedTests,
      totalErrors
    };
    
    const overall = failedTests === 0 ? 'passed' : 'failed';
    
    console.log(`📊 Test Suite Complete: ${overall.toUpperCase()}`);
    console.log(`✅ Passed: ${passedTests}/${summary.totalTests}`);
    console.log(`❌ Failed: ${failedTests}/${summary.totalTests}`);
    console.log(`⚠️  Total Errors: ${totalErrors}`);
    
    return {
      overall,
      results,
      summary
    };
  }

  // Utility methods for testing
  clearAllTestData(): void {
    const testKeys = [
      'test_registration',
      'test_onboarding',
      'onboarding_presets',
      'registration_data',
      'onboarding_data'
    ];
    
    testKeys.forEach(key => {
      try {
        localStorage.removeItem(`eva_bridge_${key}`);
      } catch (error) {
        console.warn(`Failed to clear test data for ${key}:`, error);
      }
    });
  }

  generateStressTestData(count: number = 100): Array<{ key: string; data: any }> {
    const testData: Array<{ key: string; data: any }> = [];
    
    for (let i = 0; i < count; i++) {
      testData.push({
        key: `stress_test_${i}`,
        data: {
          id: i,
          timestamp: new Date().toISOString(),
          randomData: Math.random().toString(36).substring(2),
          nestedObject: {
            level1: {
              level2: {
                value: `test_value_${i}`
              }
            }
          }
        }
      });
    }
    
    return testData;
  }
}

// Export singleton instance
export const dataBridgeTestUtils = DataBridgeTestUtils.getInstance();
