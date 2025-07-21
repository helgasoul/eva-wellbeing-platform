
// Mock logger for m4p version
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || '');
  },
  
  debug: (message: string, data?: any) => {
    console.log(`[DEBUG] ${message}`, data || '');
  },

  success: (message: string, data?: any) => {
    console.log(`[SUCCESS] ${message}`, data || '');
  }
};
