
export interface OnboardingPresets {
  persona: {
    id: string;
    name: string;
  };
  userName: string;
  startStep: number;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  consents: {
    terms: boolean;
    privacy: boolean;
  };
  onboardingConfig?: {
    estimatedDuration?: string;
    prefilledSections?: string[];
  };
}

// Mock DataBridge service for m4p version
export class DataBridge {
  private static instance: DataBridge;

  static getInstance(): DataBridge {
    if (!this.instance) {
      this.instance = new DataBridge();
    }
    return this.instance;
  }

  static async transferRegistrationData(registrationData: any) {
    // Mock implementation
    console.log('Mock: Transferring registration data', registrationData);
    return {
      success: true,
      transferredKeys: ['email', 'firstName', 'lastName', 'persona'],
      message: 'Data transferred successfully'
    };
  }

  static async validateDataIntegrity(data: any) {
    // Mock implementation
    return {
      isValid: true,
      errors: []
    };
  }

  static async saveToSecureStorage(key: string, data: any) {
    // Mock implementation using localStorage
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Storage failed' };
    }
  }

  async saveUserData(data: any): Promise<void> {
    // Mock implementation
    console.log('Mock: Saving user data', data);
  }

  async loadUserData(): Promise<any> {
    // Mock implementation
    return {};
  }

  async getUserDataSummary(): Promise<any> {
    // Mock implementation
    return {};
  }

  validateUserDataIntegrity(): any {
    // Mock implementation
    return { valid: true, errors: [], warnings: [] };
  }

  getDataFlowStatus(): any[] {
    // Mock implementation
    return [];
  }

  async repairDataFlow(): Promise<boolean> {
    // Mock implementation
    return true;
  }

  async validateDataIntegrity(data?: any) {
    // Mock implementation
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }

  getOnboardingPresets(): OnboardingPresets | null {
    // Mock implementation
    return null;
  }

  getTransferAnalytics(): any {
    // Mock implementation
    return {
      transferredData: [],
      lastTransfer: null,
      status: 'idle'
    };
  }
}
