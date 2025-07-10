import { authAuditService } from './authAuditService';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

export class RateLimitService {
  private storage = new Map<string, RateLimitEntry>();
  
  // Конфигурация для разных типов операций
  private configs: Record<string, RateLimitConfig> = {
    login: {
      maxAttempts: 5,           // 5 попыток
      windowMs: 15 * 60 * 1000, // за 15 минут
      blockDurationMs: 30 * 60 * 1000 // блокировка на 30 минут
    },
    register: {
      maxAttempts: 3,           // 3 попытки
      windowMs: 60 * 60 * 1000, // за 1 час
      blockDurationMs: 2 * 60 * 60 * 1000 // блокировка на 2 часа
    },
    passwordReset: {
      maxAttempts: 3,           // 3 попытки
      windowMs: 60 * 60 * 1000, // за 1 час
      blockDurationMs: 60 * 60 * 1000 // блокировка на 1 час
    }
  };

  private getClientIdentifier(): string {
    // Комбинируем IP и User Agent для уникальной идентификации
    const userAgent = navigator.userAgent;
    // В production можно добавить получение IP
    return btoa(userAgent).slice(0, 16);
  }

  private getKey(operation: string, identifier?: string): string {
    const clientId = identifier || this.getClientIdentifier();
    return `${operation}:${clientId}`;
  }

  private isBlocked(entry: RateLimitEntry): boolean {
    if (!entry.blockedUntil) return false;
    return Date.now() < entry.blockedUntil;
  }

  private shouldReset(entry: RateLimitEntry, windowMs: number): boolean {
    return Date.now() - entry.firstAttempt > windowMs;
  }

  async checkRateLimit(operation: string, identifier?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const config = this.configs[operation];
    if (!config) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    const key = this.getKey(operation, identifier);
    const now = Date.now();
    let entry = this.storage.get(key);

    // Инициализируем запись если её нет
    if (!entry) {
      entry = {
        count: 0,
        firstAttempt: now
      };
    }

    // Проверяем, заблокирован ли клиент
    if (this.isBlocked(entry)) {
      const retryAfter = Math.ceil((entry.blockedUntil! - now) / 1000);
      
      // Логируем попытку обойти блокировку
      await authAuditService.logSuspiciousActivity(
        'unknown',
        'rate_limit_bypass_attempt',
        {
          operation,
          blockedUntil: entry.blockedUntil,
          identifier: identifier || 'unknown'
        }
      );

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil!,
        retryAfter
      };
    }

    // Сбрасываем счётчик если прошло время окна
    if (this.shouldReset(entry, config.windowMs)) {
      entry = {
        count: 0,
        firstAttempt: now
      };
    }

    // Проверяем лимит
    if (entry.count >= config.maxAttempts) {
      // Блокируем клиента
      entry.blockedUntil = now + config.blockDurationMs;
      this.storage.set(key, entry);

      // Логируем блокировку
      await authAuditService.logSuspiciousActivity(
        'unknown',
        'rate_limit_exceeded',
        {
          operation,
          attempts: entry.count,
          blockDuration: config.blockDurationMs,
          identifier: identifier || 'unknown'
        }
      );

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil(config.blockDurationMs / 1000)
      };
    }

    // Увеличиваем счётчик и сохраняем
    entry.count++;
    this.storage.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxAttempts - entry.count,
      resetTime: entry.firstAttempt + config.windowMs
    };
  }

  async recordAttempt(operation: string, success: boolean, identifier?: string): Promise<void> {
    // Если операция успешна, сбрасываем счётчик
    if (success) {
      const key = this.getKey(operation, identifier);
      this.storage.delete(key);
    }
    // Если неуспешна, счётчик уже увеличен в checkRateLimit
  }

  // Метод для администраторов - сброс блокировки
  async resetRateLimit(operation: string, identifier: string): Promise<void> {
    const key = this.getKey(operation, identifier);
    this.storage.delete(key);
    
    await authAuditService.logAuthEvent({
      action: 'rate_limit_reset',
      success: true,
      metadata: {
        operation,
        identifier,
        resetBy: 'admin'
      }
    });
  }

  // Получить статус rate limiting для клиента
  async getRateLimitStatus(operation: string, identifier?: string): Promise<{
    blocked: boolean;
    attempts: number;
    maxAttempts: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const config = this.configs[operation];
    if (!config) {
      throw new Error(`Unknown operation: ${operation}`);
    }

    const key = this.getKey(operation, identifier);
    const entry = this.storage.get(key);

    if (!entry) {
      return {
        blocked: false,
        attempts: 0,
        maxAttempts: config.maxAttempts,
        resetTime: 0
      };
    }

    const blocked = this.isBlocked(entry);
    const retryAfter = blocked && entry.blockedUntil 
      ? Math.ceil((entry.blockedUntil - Date.now()) / 1000)
      : undefined;

    return {
      blocked,
      attempts: entry.count,
      maxAttempts: config.maxAttempts,
      resetTime: entry.firstAttempt + config.windowMs,
      retryAfter
    };
  }

  // Очистка старых записей (запускать периодически)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      // Удаляем записи старше 24 часов
      if (now - entry.firstAttempt > 24 * 60 * 60 * 1000) {
        this.storage.delete(key);
      }
    }
  }
}

export const rateLimitService = new RateLimitService();

// Запускаем очистку каждый час
setInterval(() => {
  rateLimitService.cleanup();
}, 60 * 60 * 1000);