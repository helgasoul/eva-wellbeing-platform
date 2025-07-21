// Mock auth service functions to fix function signature mismatches

export const mockAuthService = {
  saveUserData: (data: any): Promise<void> => {
    console.log('Mock: Saving user data', data);
    return Promise.resolve();
  },

  loadUserData: (): Promise<any> => {
    console.log('Mock: Loading user data');
    return Promise.resolve({});
  },

  getUserDataSummary: (): Promise<any> => {
    console.log('Mock: Getting user data summary');
    return Promise.resolve({});
  },

  validateUserDataIntegrity: (): any => {
    console.log('Mock: Validating user data integrity');
    return { isValid: true, errors: [] };
  },

  getDataFlowStatus: (): any[] => {
    console.log('Mock: Getting data flow status');
    return [];
  },

  repairDataFlow: (): Promise<boolean> => {
    console.log('Mock: Repairing data flow');
    return Promise.resolve(true);
  },

  exportUserDataDump: (): any => {
    console.log('Mock: Exporting user data dump');
    return {};
  },

  updatePassword: (password: string): Promise<{ user: any }> => {
    console.log('Mock: Updating password');
    return Promise.resolve({ user: {} });
  },

  completeOnboarding: (data: any): Promise<void> => {
    console.log('Mock: Completing onboarding', data);
    return Promise.resolve();
  }
};