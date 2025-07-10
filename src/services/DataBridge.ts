import { logger } from '@/utils/logger';

interface UserDataState {
  registration: {
    completed: boolean;
    timestamp: string;
    data: any;
  };
  onboarding: {
    completed: boolean;
    timestamp: string;
    data: any;
  };
  preferences: {
    persona: any;
    consents: any;
  };
}

interface DataTransferResult {
  success: boolean;
  transferredKeys: string[];
  errors: string[];
  timestamp: string;
}

export class DataBridge {
  private static instance: DataBridge;
  private syncQueue: Array<any> = [];
  private storagePrefix = 'eva_';

  static getInstance(): DataBridge {
    if (!DataBridge.instance) {
      DataBridge.instance = new DataBridge();
    }
    return DataBridge.instance;
  }

  // Сохранение данных
  async saveData(key: string, data: any): Promise<void> {
    try {
      const dataWithMeta = {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(dataWithMeta));
      logger.debug('DataBridge: Data saved', { key });
    } catch (error) {
      console.error(`❌ DataBridge: Ошибка сохранения ${key}:`, error);
      throw error;
    }
  }

  // Загрузка данных
  async loadData(key: string): Promise<any> {
    try {
      const storedData = localStorage.getItem(`${this.storagePrefix}${key}`);
      if (!storedData) {
        logger.debug('DataBridge: No data found', { key });
        return null;
      }

      const parsed = JSON.parse(storedData);
      logger.debug('DataBridge: Data loaded', { key });
      return parsed.data;
    } catch (error) {
      console.error(`❌ DataBridge: Ошибка загрузки ${key}:`, error);
      return null;
    }
  }

  // Проверка целостности данных
  async validateDataIntegrity(): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const report = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    try {
      const userData = await this.loadData('user_data');
      if (!userData) {
        report.errors.push('Отсутствуют данные пользователя');
        report.valid = false;
      }

      const onboardingData = await this.loadData('onboarding_data');
      if (!onboardingData && userData?.role === 'patient') {
        report.warnings.push('Отсутствуют данные онбординга');
      }

      return report;
    } catch (error: any) {
      report.valid = false;
      report.errors.push(`Ошибка валидации: ${error.message}`);
      return report;
    }
  }

  // Получить сводку данных пользователя
  async getUserDataSummary(userId: string): Promise<any> {
    try {
      const summary = {
        userData: await this.loadData('user_data'),
        onboardingData: await this.loadData('onboarding_data'),
        symptomEntries: await this.loadData(`symptom_entries_${userId}`) || [],
        nutritionEntries: await this.loadData(`nutrition_entries_${userId}`) || [],
        aiChatHistory: await this.loadData(`ai_chat_history_${userId}`) || [],
        weatherData: await this.loadData(`weather_data_${userId}`) || [],
        timestamp: new Date().toISOString()
      };

      logger.debug('DataBridge: User data summary', { summary });
      return {
        hasData: true,
        summary: {
          onboardingCompleted: summary.userData?.onboardingCompleted || false,
          symptomEntries: summary.symptomEntries,
          nutritionEntries: summary.nutritionEntries,
          aiChatHistory: summary.aiChatHistory,
          weatherData: summary.weatherData
        }
      };
    } catch (error) {
      console.error('❌ DataBridge: Ошибка получения сводки:', error);
      return {
        hasData: false,
        summary: {}
      };
    }
  }

  // ✅ ГЛАВНАЯ ФУНКЦИЯ: Безопасная передача данных между этапами
  transferRegistrationToOnboarding(user: any, registrationData: any): DataTransferResult {
    const result: DataTransferResult = {
      success: false,
      transferredKeys: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Создаем комплексный набор данных для онбординга
      const onboardingPresets = this.createOnboardingPresets(user, registrationData);
      
      // 2. Сохраняем в специальном ключе для онбординга
      this.setStorageItem('onboarding_presets', onboardingPresets);
      result.transferredKeys.push('onboarding_presets');

      // 3. Создаем mapping для быстрого доступа
      const dataMapping = this.createDataMapping(registrationData);
      this.setStorageItem('data_mapping', dataMapping);
      result.transferredKeys.push('data_mapping');

      // 4. Сохраняем метаданные о переносе
      const transferMetadata = {
        sourceStage: 'registration',
        targetStage: 'onboarding',
        timestamp: result.timestamp,
        userId: user.id,
        personaId: registrationData.step3?.personaId,
        dataIntegrity: this.calculateDataIntegrity(registrationData)
      };
      this.setStorageItem('transfer_metadata', transferMetadata);
      result.transferredKeys.push('transfer_metadata');

      // 5. Проверяем целостность переноса
      const integrityCheck = this.verifyDataIntegrity(onboardingPresets, registrationData);
      if (!integrityCheck.isValid) {
        result.errors.push(`Data integrity check failed: ${integrityCheck.errors.join(', ')}`);
      }

      result.success = result.errors.length === 0;
      
      logger.info('DataBridge: Registration data transferred successfully', { userId: transferMetadata.userId });
      return result;

    } catch (error) {
      result.errors.push(`Transfer failed: ${error.message}`);
      console.error('❌ DataBridge: Transfer failed', error);
      return result;
    }
  }

  // Создание оптимизированных presets для онбординга
  private createOnboardingPresets(user: any, registrationData: any) {
    return {
      // Метаинформация
      fromRegistration: true,
      transferTimestamp: new Date().toISOString(),
      version: '1.0',
      
      // Основные данные пользователя
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: registrationData.step1?.phone
      },

      // Персонализация
      persona: {
        id: registrationData.step3?.personaId,
        selectedAt: new Date().toISOString(),
        additionalData: registrationData.step3?.additionalData || {},
        onboardingPath: this.getOnboardingPathForPersona(registrationData.step3?.personaId)
      },

      // Согласия и предпочтения
      consents: {
        ...registrationData.step2,
        verificationTimestamp: new Date().toISOString()
      },

      // Предзаполненные данные для онбординга
      prefills: {
        basicInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: registrationData.step1?.phone,
          emailVerified: registrationData.step1?.emailVerified,
          phoneVerified: registrationData.step1?.phoneVerified
        },
        preferences: {
          communicationChannels: this.inferCommunicationPreferences(registrationData),
          privacyLevel: this.inferPrivacyLevel(registrationData.step2),
          contentPersonalization: true
        }
      },

      // Конфигурация онбординга
      onboardingConfig: {
        estimatedDuration: this.getEstimatedDuration(registrationData.step3?.personaId),
        prioritySteps: this.getPrioritySteps(registrationData.step3?.personaId),
        customQuestions: this.getCustomQuestions(registrationData.step3?.personaId),
        skipValidations: [], // Какие валидации можно пропустить
        prefilledSections: ['basicInfo'] // Какие секции уже заполнены
      }
    };
  }

  // Создание mapping для быстрого доступа к данным
  private createDataMapping(registrationData: any) {
    return {
      'user.email': registrationData.step1?.email,
      'user.phone': registrationData.step1?.phone,
      'user.emailVerified': registrationData.step1?.emailVerified,
      'user.phoneVerified': registrationData.step1?.phoneVerified,
      'persona.id': registrationData.step3?.personaId,
      'persona.additionalData': registrationData.step3?.additionalData,
      'consents.medical_data': registrationData.step2?.medical_data,
      'consents.ai_analysis': registrationData.step2?.ai_analysis,
      'consents.research_participation': registrationData.step2?.research_participation
    };
  }

  // ✅ ПОЛУЧЕНИЕ ДАННЫХ В ОНБОРДИНГЕ
  getOnboardingPresets(): any | null {
    try {
      const presets = this.getStorageItem('onboarding_presets');
      if (presets && this.isValidPresets(presets)) {
        logger.debug('DataBridge: Onboarding presets loaded successfully');
        return presets;
      }
      return null;
    } catch (error) {
      console.error('❌ DataBridge: Failed to load onboarding presets', error);
      return null;
    }
  }

  // Получение конкретного значения по пути
  getPresetValue(path: string, defaultValue: any = null): any {
    try {
      const mapping = this.getStorageItem('data_mapping');
      return mapping?.[path] || defaultValue;
    } catch (error) {
      console.error(`❌ DataBridge: Failed to get preset value for path: ${path}`, error);
      return defaultValue;
    }
  }

  // ✅ ОЧИСТКА ДАННЫХ ПОСЛЕ ЗАВЕРШЕНИЯ ОНБОРДИНГА
  cleanupTransferData(): void {
    try {
      const keysToClean = [
        'onboarding_presets',
        'data_mapping', 
        'transfer_metadata',
        'onboarding_data' // Временные данные онбординга
      ];

      keysToClean.forEach(key => {
        localStorage.removeItem(`${this.storagePrefix}${key}`);
      });

      logger.debug('DataBridge: Transfer data cleaned up successfully');
    } catch (error) {
      console.error('❌ DataBridge: Cleanup failed', error);
    }
  }

  // ✅ ВАЛИДАЦИЯ ЦЕЛОСТНОСТИ ДАННЫХ
  verifyDataIntegrity(onboardingPresets: any, originalRegistrationData: any) {
    const errors = [];
    
    // Проверка обязательных полей
    if (!onboardingPresets.user?.email) {
      errors.push('Missing user email');
    }
    
    if (!onboardingPresets.persona?.id) {
      errors.push('Missing persona ID');
    }

    if (!onboardingPresets.consents) {
      errors.push('Missing consents data');
    }

    // Проверка соответствия исходным данным
    if (onboardingPresets.user?.email !== originalRegistrationData.step1?.email) {
      errors.push('Email mismatch between registration and onboarding presets');
    }

    if (onboardingPresets.persona?.id !== originalRegistrationData.step3?.personaId) {
      errors.push('Persona ID mismatch');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ АНАЛИТИКА И МОНИТОРИНГ
  getTransferAnalytics() {
    try {
      const metadata = this.getStorageItem('transfer_metadata');
      if (!metadata) return null;

      return {
        ...metadata,
        dataAge: Date.now() - new Date(metadata.timestamp).getTime(),
        isExpired: this.isTransferDataExpired(metadata.timestamp)
      };
    } catch (error) {
      console.error('❌ DataBridge: Failed to get transfer analytics', error);
      return null;
    }
  }

  // Проверка, не устарели ли данные переноса (24 часа)
  private isTransferDataExpired(timestamp: string): boolean {
    const transferTime = new Date(timestamp).getTime();
    const now = Date.now();
    const expirationPeriod = 24 * 60 * 60 * 1000; // 24 часа
    
    return (now - transferTime) > expirationPeriod;
  }

  // ✅ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
  private getOnboardingPathForPersona(personaId: string) {
    const paths = {
      'first_signs': {
        focus: ['education', 'prevention', 'cycle_tracking'],
        priority: ['menstrualHistory', 'lifestyle', 'goals'],
        estimatedTime: '5-6 minutes'
      },
      'active_phase': {
        focus: ['symptom_management', 'treatment_options', 'quality_of_life'],
        priority: ['symptoms', 'medicalHistory', 'goals'],
        estimatedTime: '6-7 minutes'
      },
      'postmenopause': {
        focus: ['long_term_health', 'prevention', 'wellness'],
        priority: ['medicalHistory', 'lifestyle', 'goals'],
        estimatedTime: '6-8 minutes'
      }
    };
    
    return paths[personaId] || paths['active_phase'];
  }

  private getEstimatedDuration(personaId: string): string {
    const durations = {
      'first_signs': '5-6 минут',
      'active_phase': '6-7 минут',
      'postmenopause': '6-8 минут'
    };
    return durations[personaId] || '6-7 минут';
  }

  private getPrioritySteps(personaId: string): number[] {
    const priorities = {
      'first_signs': [3, 6, 7], // Menstrual history, lifestyle, goals
      'active_phase': [4, 5, 7], // Symptoms, medical history, goals
      'postmenopause': [5, 6, 7] // Medical history, lifestyle, goals
    };
    return priorities[personaId] || [4, 5, 7];
  }

  private getCustomQuestions(personaId: string): any {
    return {
      'first_signs': {
        symptoms: ['cycle_irregularity', 'mood_changes', 'sleep_quality'],
        lifestyle: ['stress_management', 'exercise_routine', 'nutrition_awareness']
      },
      'active_phase': {
        symptoms: ['hot_flashes_severity', 'night_sweats_frequency', 'impact_on_daily_life'],
        medicalHistory: ['current_treatments', 'treatment_effectiveness', 'side_effects']
      },
      'postmenopause': {
        medicalHistory: ['screening_compliance', 'medication_management', 'health_monitoring'],
        lifestyle: ['physical_activity_level', 'social_support', 'preventive_care']
      }
    }[personaId] || {};
  }

  private inferCommunicationPreferences(registrationData: any) {
    const preferences = ['email']; // Email всегда доступен
    
    if (registrationData.step1?.phone && registrationData.step1?.phoneVerified) {
      preferences.push('sms');
    }
    
    if (registrationData.step2?.marketing_communications) {
      preferences.push('newsletters', 'notifications');
    }
    
    return preferences;
  }

  private inferPrivacyLevel(consents: any): 'high' | 'medium' | 'low' {
    let privacyScore = 0;
    
    if (!consents.research_participation) privacyScore += 1;
    if (!consents.marketing_communications) privacyScore += 1;
    if (consents.gdpr_basic && consents.medical_data) privacyScore -= 1;
    
    if (privacyScore >= 1) return 'high';
    if (privacyScore === 0) return 'medium';
    return 'low';
  }

  private calculateDataIntegrity(data: any): number {
    let score = 0;
    let maxScore = 0;
    
    // Проверка Step 1
    maxScore += 20;
    if (data.step1?.email) score += 10;
    if (data.step1?.emailVerified) score += 10;
    
    // Проверка Step 2 
    maxScore += 30;
    if (data.step2?.gdpr_basic) score += 10;
    if (data.step2?.medical_data) score += 10;
    if (data.step2?.ai_analysis) score += 10;
    
    // Проверка Step 3
    maxScore += 20;
    if (data.step3?.personaId) score += 20;
    
    return Math.round((score / maxScore) * 100);
  }

  private isValidPresets(presets: any): boolean {
    return presets && 
           presets.fromRegistration === true &&
           presets.user?.email &&
           presets.persona?.id &&
           !this.isTransferDataExpired(presets.transferTimestamp);
  }

  // Утилиты для работы с localStorage
  private setStorageItem(key: string, value: any): void {
    localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(value));
  }

  private getStorageItem(key: string): any | null {
    const item = localStorage.getItem(`${this.storagePrefix}${key}`);
    return item ? JSON.parse(item) : null;
  }
}

// ✅ ЭКСПОРТ SINGLETON INSTANCE
export const dataBridge = DataBridge.getInstance();

// ✅ ХУКИ ДЛЯ ИСПОЛЬЗОВАНИЯ В КОМПОНЕНТАХ
export const useDataBridge = () => {
  return {
    transferData: dataBridge.transferRegistrationToOnboarding.bind(dataBridge),
    getPresets: dataBridge.getOnboardingPresets.bind(dataBridge),
    getValue: dataBridge.getPresetValue.bind(dataBridge),
    cleanup: dataBridge.cleanupTransferData.bind(dataBridge),
    analytics: dataBridge.getTransferAnalytics.bind(dataBridge)
  };
};

// ✅ ТАЙПСКРИПТ ИНТЕРФЕЙСЫ ДЛЯ ЭКСПОРТА
export interface OnboardingPresets {
  fromRegistration: boolean;
  transferTimestamp: string;
  version: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  persona: {
    id: string;
    selectedAt: string;
    additionalData: any;
    onboardingPath: any;
  };
  consents: any;
  prefills: any;
  onboardingConfig: any;
}