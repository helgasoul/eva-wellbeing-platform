// ✅ БЕЗОПАСНАЯ РАБОТА С LOCALSTORAGE
export class SafeStorage {
  /**
   * Безопасное сохранение в localStorage с обработкой ошибок
   */
  static setItem(key: string, value: any): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage недоступен');
        return false;
      }
      
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      
      // Проверяем, что данные действительно сохранились
      const saved = localStorage.getItem(key);
      if (saved !== serialized) {
        console.error('Данные не были сохранены корректно');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Ошибка сохранения в localStorage (${key}):`, error);
      
      // Проверяем, не превышен ли лимит хранилища
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage переполнен, очищаем старые данные');
        this.clearOldData();
        
        // Пытаемся сохранить еще раз
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryError) {
          console.error('Повторная попытка сохранения неудачна:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Безопасное получение из localStorage с обработкой ошибок
   */
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Безопасное удаление из localStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Ошибка удаления из localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Очистка старых данных при переполнении
   */
  private static clearOldData(): void {
    try {
      const keys = Object.keys(localStorage);
      const timestampKeys = keys.filter(key => key.includes('_timestamp'));
      
      // Сортируем по времени и удаляем самые старые
      timestampKeys
        .map(key => ({
          key: key.replace('_timestamp', ''),
          timestamp: parseInt(localStorage.getItem(key) || '0')
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, Math.floor(keys.length * 0.3)) // Удаляем 30% самых старых
        .forEach(({ key }) => {
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        });
    } catch (error) {
      console.error('Ошибка очистки старых данных:', error);
    }
  }

  /**
   * Сохранение с метаданными времени
   */
  static setItemWithTimestamp(key: string, value: any): boolean {
    const success = this.setItem(key, value);
    if (success) {
      this.setItem(`${key}_timestamp`, Date.now());
    }
    return success;
  }

  /**
   * Проверка актуальности данных
   */
  static isDataFresh(key: string, maxAgeMs: number): boolean {
    const timestamp = this.getItem<number>(`${key}_timestamp`);
    if (!timestamp) return false;
    
    return (Date.now() - timestamp) < maxAgeMs;
  }
}

// ✅ БЕЗОПАСНАЯ РАБОТА С ТАЙМЕРАМИ
export class SafeTimer {
  private static timers = new Map<string, number>();

  /**
   * Создание именованного таймера с автоочисткой
   */
  static setTimeout(callback: () => void, delay: number, name?: string): string {
    const timerId = name || `timer_${Date.now()}_${Math.random()}`;
    
    // Очищаем предыдущий таймер с таким же именем
    if (name && this.timers.has(name)) {
      this.clearTimeout(name);
    }
    
    const id = window.setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Ошибка в таймере ${timerId}:`, error);
      } finally {
        this.timers.delete(timerId);
      }
    }, delay);
    
    this.timers.set(timerId, id);
    return timerId;
  }

  /**
   * Очистка таймера по имени
   */
  static clearTimeout(name: string): boolean {
    const id = this.timers.get(name);
    if (id) {
      window.clearTimeout(id);
      this.timers.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Очистка всех таймеров
   */
  static clearAllTimers(): void {
    this.timers.forEach((id) => window.clearTimeout(id));
    this.timers.clear();
  }

  /**
   * Получение активных таймеров
   */
  static getActiveTimers(): string[] {
    return Array.from(this.timers.keys());
  }
}

// ✅ ХУК ДЛЯ БЕЗОПАСНОЙ РАБОТЫ С ЭФФЕКТАМИ И ТАЙМЕРАМИ
export const useSafeEffect = () => {
  const timers = new Set<string>();

  const safeSetTimeout = (callback: () => void, delay: number, name?: string): string => {
    const timerId = SafeTimer.setTimeout(callback, delay, name);
    timers.add(timerId);
    return timerId;
  };

  const cleanup = () => {
    timers.forEach(id => SafeTimer.clearTimeout(id));
    timers.clear();
  };

  return {
    safeSetTimeout,
    cleanup
  };
};