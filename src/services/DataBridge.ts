
// Mock DataBridge service for m4p version
export class DataBridge {
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
}
