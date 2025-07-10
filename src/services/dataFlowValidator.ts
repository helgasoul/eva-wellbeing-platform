import { DataFlowCheck, DataFlowDiagnostics, UserValidation } from '@/types/dataFlow';
import { DataBridge } from '@/services/DataBridge';

export class DataFlowValidator {
  private getStorageItem(key: string): any | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing localStorage item ${key}:`, error);
      return null;
    }
  }

  private calculateIntegrity(data: any, requiredFields: string[]): number {
    if (!data) return 0;
    
    let presentFields = 0;
    const totalFields = requiredFields.length;
    
    requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value = data;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      if (value !== undefined && value !== null && value !== '') {
        presentFields++;
      }
    });
    
    return Math.round((presentFields / totalFields) * 100);
  }

  // Проверка целостности данных регистрации
  validateRegistrationData(): DataFlowCheck {
    const registrationData = this.getStorageItem('eva_user_data');
    const presets = this.getStorageItem('eva_onboarding_presets');
    
    const requiredFields = [
      'firstName',
      'lastName', 
      'email',
      'selectedPersona.id',
      'consents'
    ];
    
    const missing_fields: string[] = [];
    const errors: string[] = [];
    
    if (!registrationData) {
      errors.push('Registration data not found in localStorage');
      return {
        stage: 'registration',
        status: 'failed',
        data_present: false,
        data_integrity: 0,
        missing_fields: requiredFields,
        last_updated: 'never',
        data_size: 0,
        errors
      };
    }

    // Проверяем обязательные поля
    requiredFields.forEach(field => {
      const fieldPath = field.split('.');
      let value = registrationData;
      
      for (const path of fieldPath) {
        value = value?.[path];
      }
      
      if (value === undefined || value === null || value === '') {
        missing_fields.push(field);
      }
    });

    // Проверяем, созданы ли onboarding presets
    if (!presets || !presets.fromRegistration) {
      errors.push('Onboarding presets not created or invalid');
      missing_fields.push('onboarding_presets');
    }

    const integrity = this.calculateIntegrity(registrationData, requiredFields);
    
    return {
      stage: 'registration',
      status: errors.length === 0 ? (missing_fields.length === 0 ? 'passed' : 'warning') : 'failed',
      data_present: true,
      data_integrity: integrity,
      missing_fields,
      last_updated: registrationData.createdAt || new Date().toISOString(),
      data_size: Object.keys(registrationData).length,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Проверка онбординг данных
  validateOnboardingData(): DataFlowCheck {
    const onboardingData = this.getStorageItem('eva_onboarding_data');
    const userData = this.getStorageItem('eva_user_data');
    
    const requiredFields = [
      'basicInfo',
      'menstrualHistory',
      'symptoms',
      'medicalHistory',
      'lifestyle',
      'goals'
    ];
    
    const missing_fields: string[] = [];
    const errors: string[] = [];
    
    if (!onboardingData) {
      errors.push('Onboarding data not found');
      return {
        stage: 'onboarding',
        status: 'failed',
        data_present: false,
        data_integrity: 0,
        missing_fields: requiredFields,
        last_updated: 'never',
        data_size: 0,
        errors
      };
    }

    // Проверяем завершение онбординга
    if (!userData?.onboardingCompleted) {
      errors.push('Onboarding not marked as completed in user data');
    }

    // Проверяем определение фазы менопаузы
    if (!userData?.menopausePhase) {
      errors.push('Menopause phase not determined');
      missing_fields.push('menopausePhase');
    }

    requiredFields.forEach(field => {
      if (!onboardingData[field] || Object.keys(onboardingData[field]).length === 0) {
        missing_fields.push(field);
      }
    });

    const integrity = this.calculateIntegrity(onboardingData, requiredFields);
    
    return {
      stage: 'onboarding',
      status: errors.length === 0 ? (missing_fields.length === 0 ? 'passed' : 'warning') : 'failed',
      data_present: true,
      data_integrity: integrity,
      missing_fields,
      last_updated: onboardingData.updatedAt || userData?.updatedAt || new Date().toISOString(),
      data_size: Object.keys(onboardingData).length,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Проверка данных трекера симптомов
  validateTrackerData(): DataFlowCheck {
    const symptomEntries = this.getStorageItem('eva_symptom_entries');
    const healthData = this.getStorageItem('eva_health_data');
    
    const missing_fields: string[] = [];
    const errors: string[] = [];
    
    if (!symptomEntries && !healthData?.symptomEntries) {
      errors.push('No symptom tracking data found');
      return {
        stage: 'tracker',
        status: 'failed',
        data_present: false,
        data_integrity: 0,
        missing_fields: ['symptom_entries'],
        last_updated: 'never',
        data_size: 0,
        errors
      };
    }

    const entries = symptomEntries || healthData?.symptomEntries || [];
    const dataSize = Array.isArray(entries) ? entries.length : 0;
    
    if (dataSize === 0) {
      missing_fields.push('symptom_entries');
    }

    // Проверяем структуру записей
    if (Array.isArray(entries) && entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const requiredEntryFields = ['date', 'symptoms'];
      
      requiredEntryFields.forEach(field => {
        if (!lastEntry[field]) {
          missing_fields.push(`entry.${field}`);
        }
      });
    }

    const integrity = dataSize > 0 ? 85 : 0; // Простая оценка на основе наличия данных
    
    return {
      stage: 'tracker',
      status: errors.length === 0 ? (dataSize > 0 ? 'passed' : 'warning') : 'failed',
      data_present: dataSize > 0,
      data_integrity: integrity,
      missing_fields,
      last_updated: entries.length > 0 ? entries[entries.length - 1]?.date || new Date().toISOString() : 'never',
      data_size: dataSize,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Проверка агрегированных данных здоровья
  validateHealthDataAggregator(): DataFlowCheck {
    const healthData = this.getStorageItem('eva_health_data');
    const weatherData = this.getStorageItem('eva_last_weather_update');
    
    const requiredFields = [
      'patientProfile',
      'symptomEntries',
      'environmentalData',
      'lastUpdated'
    ];
    
    const missing_fields: string[] = [];
    const errors: string[] = [];
    
    if (!healthData) {
      errors.push('Health data aggregator not initialized');
      return {
        stage: 'tracker',
        status: 'failed',
        data_present: false,
        data_integrity: 0,
        missing_fields: requiredFields,
        last_updated: 'never',
        data_size: 0,
        errors
      };
    }

    requiredFields.forEach(field => {
      if (!healthData[field]) {
        missing_fields.push(field);
      }
    });

    // Проверяем интеграцию с экологическими данными
    if (!weatherData) {
      missing_fields.push('weather_data');
      errors.push('Weather data not integrated');
    }

    const integrity = this.calculateIntegrity(healthData, requiredFields);
    
    return {
      stage: 'tracker',
      status: errors.length === 0 ? (missing_fields.length <= 1 ? 'passed' : 'warning') : 'failed',
      data_present: true,
      data_integrity: integrity,
      missing_fields,
      last_updated: healthData.lastUpdated?.symptoms || healthData.updatedAt || new Date().toISOString(),
      data_size: (healthData.symptomEntries?.length || 0) + (healthData.environmentalData?.length || 0),
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Проверка данных для рекомендаций
  validateRecommendationsData(): DataFlowCheck {
    const healthData = this.getStorageItem('eva_health_data');
    const userData = this.getStorageItem('eva_user_data');
    
    const missing_fields: string[] = [];
    const errors: string[] = [];
    
    if (!healthData || !userData) {
      errors.push('Required data for recommendations not found');
      return {
        stage: 'recommendations',
        status: 'failed',
        data_present: false,
        data_integrity: 0,
        missing_fields: ['health_data', 'user_data'],
        last_updated: 'never',
        data_size: 0,
        errors
      };
    }

    // Проверяем наличие данных для персонализации рекомендаций
    if (!userData.menopausePhase) {
      missing_fields.push('menopause_phase');
    }

    if (!healthData.patientProfile) {
      missing_fields.push('patient_profile');
    }

    if (!healthData.symptomEntries || healthData.symptomEntries.length === 0) {
      missing_fields.push('symptom_history');
    }

    // Проверяем корреляции и паттерны
    if (!healthData.correlations) {
      missing_fields.push('correlations');
    }

    const dataPoints = (healthData.symptomEntries?.length || 0) + 
                      (healthData.environmentalData?.length || 0) +
                      (userData.onboardingData ? Object.keys(userData.onboardingData).length : 0);
    
    const integrity = dataPoints > 10 ? 90 : Math.min(dataPoints * 9, 90);
    
    return {
      stage: 'recommendations',
      status: errors.length === 0 ? (missing_fields.length <= 2 ? 'passed' : 'warning') : 'failed',
      data_present: dataPoints > 0,
      data_integrity: integrity,
      missing_fields,
      last_updated: healthData.lastUpdated?.symptoms || new Date().toISOString(),
      data_size: dataPoints,
      errors: errors.length > 0 ? errors : undefined
    };
  }
  
  // Комплексная проверка всех этапов
  runFullDiagnostics(): DataFlowDiagnostics {
    const userData = this.getStorageItem('eva_user_data');
    const user_id = userData?.id || 'unknown';
    
    const stages = [
      this.validateRegistrationData(),
      this.validateOnboardingData(),
      this.validateTrackerData(),
      this.validateRecommendationsData()
    ];

    // Получаем все данные для карты
    const data_map = {
      registration_data: this.getStorageItem('eva_user_data'),
      onboarding_data: this.getStorageItem('eva_onboarding_data'),
      tracker_data: this.getStorageItem('eva_symptom_entries'),
      aggregated_health_data: this.getStorageItem('eva_health_data'),
      recommendations_data: null // Будет добавлено позже
    };

    // Вычисляем общий score
    const totalIntegrity = stages.reduce((sum, stage) => sum + stage.data_integrity, 0);
    const integrity_score = Math.round(totalIntegrity / stages.length);

    // Определяем общий статус
    const failedStages = stages.filter(s => s.status === 'failed').length;
    const warningStages = stages.filter(s => s.status === 'warning').length;
    
    let overall_status: 'healthy' | 'degraded' | 'critical';
    if (failedStages > 1) {
      overall_status = 'critical';
    } else if (failedStages === 1 || warningStages > 2) {
      overall_status = 'degraded';
    } else {
      overall_status = 'healthy';
    }

    return {
      user_id,
      test_timestamp: new Date().toISOString(),
      overall_status,
      stages,
      data_map,
      integrity_score
    };
  }

  // Метод для восстановления data flow
  async repairDataFlow(): Promise<boolean> {
    try {
      const diagnostics = this.runFullDiagnostics();
      
      // Восстанавливаем onboarding presets если они отсутствуют
      const registrationStage = diagnostics.stages.find(s => s.stage === 'registration');
      if (registrationStage?.missing_fields.includes('onboarding_presets')) {
        const userData = this.getStorageItem('eva_user_data');
        if (userData) {
          const dataBridge = DataBridge.getInstance();
          // Пересоздаем presets на основе существующих данных
          // dataBridge.transferData(userData, userData); // Если нужно
        }
      }

      // Восстанавливаем health data aggregator
      const healthStage = diagnostics.stages.find(s => s.stage === 'tracker');
      if (healthStage?.missing_fields.includes('patientProfile')) {
        // Восстанавливаем профиль пациента на основе onboarding данных
        const onboardingData = this.getStorageItem('eva_onboarding_data');
        const userData = this.getStorageItem('eva_user_data');
        
        if (onboardingData && userData) {
          const healthData = {
            patientProfile: {
              userId: userData.id,
              menopausePhase: userData.menopausePhase,
              ...onboardingData.basicInfo
            },
            symptomEntries: this.getStorageItem('eva_symptom_entries') || [],
            environmentalData: [],
            lastUpdated: {
              symptoms: new Date().toISOString(),
              weather: new Date().toISOString()
            }
          };
          
          localStorage.setItem('eva_health_data', JSON.stringify(healthData));
        }
      }

      return true;
    } catch (error) {
      console.error('Error repairing data flow:', error);
      return false;
    }
  }

  // Экспорт всех данных пользователя для отладки
  exportUserDataDump(): any {
    const localStorageKeys = [
      'eva_auth_token',
      'eva_user_data',
      'eva_onboarding_data',
      'eva_onboarding_presets',
      'eva_symptom_entries',
      'eva_health_data',
      'eva_last_weather_update'
    ];

    const dataDump: any = {
      timestamp: new Date().toISOString(),
      browser_info: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      },
      localStorage: {}
    };

    localStorageKeys.forEach(key => {
      const data = this.getStorageItem(key);
      dataDump.localStorage[key] = data;
    });

    return dataDump;
  }
}