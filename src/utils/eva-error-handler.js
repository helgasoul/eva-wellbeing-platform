class EvaAuditLogger {
  constructor() {
    this.logs = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, level };
    this.logs.push(logEntry);
    
    // Limit log size to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    console[level === 'error' ? 'error' : 'log'](`[EvaAuditLogger] ${timestamp}: ${message}`);
  }
}

class EvaErrorHandler {
  constructor() {
    // Initialize fallback values
    this.auditLogger = null;
    this.errorQueue = [];
    this.isOnline = true;
    this.isInitialized = false;
    
    try {
      // Initialize audit logger
      this.auditLogger = new EvaAuditLogger();
      this.auditLogger.log('EvaErrorHandler initialization started', 'info');
      
      // Setup global error handlers
      this.setupGlobalErrorHandlers();
      
      // Initialize error queue
      this.initializeErrorQueue();
      
      // Check online status
      this.checkOnlineStatus();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      this.isInitialized = true;
      this.auditLogger.log('EvaErrorHandler initialization completed successfully', 'info');
      
    } catch (error) {
      // Fallback error handling if initialization fails
      this.handleInitializationError(error);
    }
  }

  handleInitializationError(error) {
    // Create a basic console fallback since auditLogger might not be available
    const errorMessage = `EvaErrorHandler initialization failed: ${error.message}`;
    console.error(errorMessage, error);
    
    // Try to create a minimal logger if possible
    if (!this.auditLogger) {
      try {
        this.auditLogger = new EvaAuditLogger();
        this.auditLogger.log(errorMessage, 'error');
      } catch (loggerError) {
        console.error('Failed to create audit logger:', loggerError);
      }
    }
    
    // Set up minimal error handling
    this.setupMinimalErrorHandling();
  }

  setupGlobalErrorHandlers() {
    // Global error handler for unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        reason: event.reason
      });
    });
  }

  initializeErrorQueue() {
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.auditLogger?.log('Error queue initialized', 'info');
  }

  checkOnlineStatus() {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.auditLogger?.log(`Online status: ${this.isOnline}`, 'info');
    } else {
      this.auditLogger?.log('Navigator.onLine not available, assuming online', 'info');
      this.isOnline = true;
    }
  }

  setupNetworkMonitoring() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.auditLogger?.log('Network status: online', 'info');
        this.processErrorQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.auditLogger?.log('Network status: offline', 'info');
      });
    }
  }

  setupMinimalErrorHandling() {
    // Minimal error handling when full initialization fails
    this.errorQueue = [];
    this.isOnline = true;
    
    // Basic global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  handleError(errorInfo) {
    try {
      const timestamp = new Date().toISOString();
      const errorEntry = {
        ...errorInfo,
        timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Add to queue
      this.addToErrorQueue(errorEntry);
      
      // Log the error
      this.auditLogger?.log(`Error handled: ${errorInfo.message}`, 'error');
      
      // Process queue if online
      if (this.isOnline) {
        this.processErrorQueue();
      }
      
    } catch (handlingError) {
      console.error('Error while handling error:', handlingError);
      console.error('Original error:', errorInfo);
    }
  }

  addToErrorQueue(errorEntry) {
    this.errorQueue.push(errorEntry);
    
    // Prevent memory issues by limiting queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  processErrorQueue() {
    if (!this.isOnline || this.errorQueue.length === 0) {
      return;
    }

    // Process errors in batches
    const batchSize = 10;
    const batch = this.errorQueue.splice(0, batchSize);
    
    // Here you would typically send errors to your error tracking service
    // For now, we'll just log them
    batch.forEach(error => {
      this.auditLogger?.log(`Processing queued error: ${error.message}`, 'info');
    });
  }

  // Public method to manually report errors
  reportError(error, context = {}) {
    this.handleError({
      type: 'manual_report',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      error
    });
  }

  // Get initialization status
  isReady() {
    return this.isInitialized;
  }

  // Get current error queue length
  getQueueLength() {
    return this.errorQueue.length;
  }

  // Get recent logs
  getRecentLogs(limit = 50) {
    return this.auditLogger?.logs.slice(-limit) || [];
  }
}

// Export singleton instance
export const evaErrorHandler = new EvaErrorHandler();
export default evaErrorHandler;