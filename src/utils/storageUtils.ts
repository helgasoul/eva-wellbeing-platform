
// Mock storage utilities for m4p version
export const SafeStorage = {
  setItemWithTimestamp: (key: string, data: any): boolean => {
    try {
      const item = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(item));
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
      const parsed = JSON.parse(item);
      return parsed.data || parsed;
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

export const SafeTimer = {
  setTimeout: (callback: () => void, delay: number): NodeJS.Timeout => {
    return setTimeout(callback, delay);
  },

  clearTimeout: (timer: NodeJS.Timeout): void => {
    clearTimeout(timer);
  }
};

export const useSafeEffect = () => {
  const timers: NodeJS.Timeout[] = [];

  const safeSetTimeout = (callback: () => void, delay: number, id?: string) => {
    const timer = setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const cleanup = () => {
    timers.forEach(timer => clearTimeout(timer));
  };

  return { safeSetTimeout, cleanup };
};
