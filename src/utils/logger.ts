/**
 * Conditional logging utility for production/development environments
 * Replaces debug console.log statements with environment-aware logging
 */

interface LogContext {
  component?: string;
  user?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Debug logging - only shows in development
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logging - shows in development, structured in production
   */
  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    } else if (this.isProduction && context) {
      // In production, only log structured info with context
      console.info(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...context
      }));
    }
  }

  /**
   * Warning logging - always shows but formatted appropriately
   */
  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    } else {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...context
      }));
    }
  }

  /**
   * Error logging - always shows, structured for monitoring
   */
  error(message: string, error?: Error, context?: LogContext) {
    const errorLog = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : undefined,
      ...context
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, context || '');
    } else {
      console.error(JSON.stringify(errorLog));
    }
  }

  /**
   * Success logging - development only unless specifically needed
   */
  success(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[SUCCESS] ✓ ${message}`, context || '');
    }
  }

  /**
   * Performance logging - development only
   */
  performance(label: string, startTime: number, context?: LogContext) {
    if (this.isDevelopment) {
      const duration = performance.now() - startTime;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`, context || '');
    }
  }

  /**
   * Security logging - always logged for audit trails
   */
  security(message: string, context?: LogContext) {
    const securityLog = {
      level: 'security',
      message,
      timestamp: new Date().toISOString(),
      ...context
    };

    console.warn(JSON.stringify(securityLog));
  }
}

export const logger = new Logger();

// Convenience exports for common patterns
export const logDebug = logger.debug.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logError = logger.error.bind(logger);
export const logSuccess = logger.success.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logSecurity = logger.security.bind(logger);