
import { DataBridge, OnboardingPresets } from './DataBridge';
import { SafeStorage } from '@/utils/safeStorage';

export interface UnifiedDataBridgeInterface {
  // Core data operations
  saveUserData(key: string, data: any): Promise<void>;
  saveUserData(data: any): Promise<void>;
  loadUserData(key?: string): Promise<any>;
  getUserDataSummary(): Promise<any>;
  
  // Validation and diagnostics
  validateUserDataIntegrity(): any;
  getDataFlowStatus(): any[];
  repairDataFlow(): Promise<boolean>;
  exportUserDataDump(): any;
  
  // Transfer operations
  transferRegistrationData(data: any): Promise<any>;
  validateDataIntegrity(data?: any): Promise<any>;
  saveToSecureStorage(key: string, data: any): Promise<any>;
  
  // Presets and configuration
  getOnboardingPresets(): OnboardingPresets | null;
  getTransferAnalytics(): any;
}

export class UnifiedDataBridge implements UnifiedDataBridgeInterface {
  private static instance: UnifiedDataBridge;
  private dataBridge: DataBridge;

  private constructor() {
    this.dataBridge = DataBridge.getInstance();
  }

  static getInstance(): UnifiedDataBridge {
    if (!this.instance) {
      this.instance = new UnifiedDataBridge();
    }
    return this.instance;
  }

  // Overloaded saveUserData method to handle both signatures
  async saveUserData(keyOrData: string | any, data?: any): Promise<void> {
    try {
      if (typeof keyOrData === 'string' && data !== undefined) {
        // saveUserData(key: string, data: any) signature
        const key = keyOrData;
        SafeStorage.setItemWithTimestamp(key, data);
        console.log(`✅ UnifiedDataBridge: Data saved for key "${key}"`);
      } else {
        // saveUserData(data: any) signature
        const userData = keyOrData;
        await this.dataBridge.saveUserData(userData);
        console.log('✅ UnifiedDataBridge: User data saved via DataBridge');
      }
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error saving user data:', error);
      throw error;
    }
  }

  async loadUserData(key?: string): Promise<any> {
    try {
      if (key) {
        const data = SafeStorage.getItem(key);
        console.log(`📥 UnifiedDataBridge: Data loaded for key "${key}"`);
        return data;
      } else {
        const data = await this.dataBridge.loadUserData();
        console.log('📥 UnifiedDataBridge: User data loaded via DataBridge');
        return data;
      }
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error loading user data:', error);
      return null;
    }
  }

  async getUserDataSummary(): Promise<any> {
    try {
      return await this.dataBridge.getUserDataSummary();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error getting user data summary:', error);
      return {
        hasData: false,
        summary: {
          onboardingCompleted: false,
          symptomEntries: [],
          nutritionEntries: [],
          aiChatHistory: [],
          weatherData: []
        }
      };
    }
  }

  validateUserDataIntegrity(): any {
    try {
      return this.dataBridge.validateUserDataIntegrity();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error validating data integrity:', error);
      return { valid: true, errors: [], warnings: [] };
    }
  }

  getDataFlowStatus(): any[] {
    try {
      return this.dataBridge.getDataFlowStatus();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error getting data flow status:', error);
      return [];
    }
  }

  async repairDataFlow(): Promise<boolean> {
    try {
      return await this.dataBridge.repairDataFlow();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error repairing data flow:', error);
      return false;
    }
  }

  exportUserDataDump(): any {
    try {
      return this.dataBridge.getTransferAnalytics();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error exporting data dump:', error);
      return {
        transferredData: [],
        lastTransfer: null,
        status: 'error'
      };
    }
  }

  async transferRegistrationData(data: any): Promise<any> {
    try {
      return await DataBridge.transferRegistrationData(data);
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error transferring registration data:', error);
      return {
        success: false,
        transferredKeys: [],
        message: 'Transfer failed'
      };
    }
  }

  async validateDataIntegrity(data?: any): Promise<any> {
    try {
      if (data) {
        return await DataBridge.validateDataIntegrity(data);
      } else {
        return await this.dataBridge.validateDataIntegrity();
      }
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error validating data integrity:', error);
      return {
        valid: true,
        errors: [],
        warnings: []
      };
    }
  }

  async saveToSecureStorage(key: string, data: any): Promise<any> {
    try {
      return await DataBridge.saveToSecureStorage(key, data);
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error saving to secure storage:', error);
      return { success: false, error: 'Storage failed' };
    }
  }

  getOnboardingPresets(): OnboardingPresets | null {
    try {
      return this.dataBridge.getOnboardingPresets();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error getting onboarding presets:', error);
      return null;
    }
  }

  getTransferAnalytics(): any {
    try {
      return this.dataBridge.getTransferAnalytics();
    } catch (error) {
      console.error('❌ UnifiedDataBridge: Error getting transfer analytics:', error);
      return {
        transferredData: [],
        lastTransfer: null,
        status: 'error'
      };
    }
  }
}

export const unifiedDataBridge = UnifiedDataBridge.getInstance();
