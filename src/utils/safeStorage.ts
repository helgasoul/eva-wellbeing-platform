// Mock SafeStorage service
export const SafeStorage = {
  setItemWithTimestamp: (key: string, data: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  setItem: (key: string, data: any): boolean => {
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Storage error:', error);
      return false;
    }
  },

  getItem: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      try {
        return JSON.parse(item);
      } catch {
        // Return as string if not JSON
        return item as T;
      }
    } catch (error) {
      console.error('Storage retrieval error:', error);
      return null;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removal error:', error);
      return false;
    }
  }
};