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

  // Method to show error modal with proper XSS protection
  showErrorModal(errorInfo) {
    try {
      // Remove existing modal if present
      const existingModal = document.getElementById('eva-error-modal');
      if (existingModal) {
        existingModal.remove();
      }

      // Create modal elements safely
      const modal = document.createElement('div');
      modal.id = 'eva-error-modal';
      modal.className = 'eva-error-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'eva-error-title');
      modal.setAttribute('aria-describedby', 'eva-error-description');

      const modalContent = document.createElement('div');
      modalContent.className = 'eva-error-modal-content';

      const title = document.createElement('h3');
      title.id = 'eva-error-title';
      title.textContent = 'Error Report';

      const description = document.createElement('p');
      description.id = 'eva-error-description';
      description.textContent = 'An error has occurred. You can report this issue to support.';

      const errorDetails = document.createElement('div');
      errorDetails.className = 'eva-error-details';
      
      // Safely set error information with proper escaping
      const errorIdElement = document.createElement('p');
      errorIdElement.innerHTML = '<strong>Error ID:</strong> ';
      const errorIdSpan = document.createElement('span');
      errorIdSpan.textContent = this.sanitizeText(errorInfo.id || 'N/A');
      errorIdElement.appendChild(errorIdSpan);

      const errorMessageElement = document.createElement('p');
      errorMessageElement.innerHTML = '<strong>Message:</strong> ';
      const errorMessageSpan = document.createElement('span');
      errorMessageSpan.textContent = this.sanitizeText(errorInfo.message || 'Unknown error');
      errorMessageElement.appendChild(errorMessageSpan);

      const errorTimeElement = document.createElement('p');
      errorTimeElement.innerHTML = '<strong>Time:</strong> ';
      const errorTimeSpan = document.createElement('span');
      errorTimeSpan.textContent = this.sanitizeText(errorInfo.timestamp || new Date().toISOString());
      errorTimeElement.appendChild(errorTimeSpan);

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'eva-error-buttons';

      const reportButton = document.createElement('button');
      reportButton.textContent = 'Report to Support';
      reportButton.className = 'eva-error-report-btn';
      reportButton.type = 'button';

      const closeButton = document.createElement('button');
      closeButton.textContent = 'Close';
      closeButton.className = 'eva-error-close-btn';
      closeButton.type = 'button';

      // Assemble modal structure
      errorDetails.appendChild(errorIdElement);
      errorDetails.appendChild(errorMessageElement);
      errorDetails.appendChild(errorTimeElement);

      buttonContainer.appendChild(reportButton);
      buttonContainer.appendChild(closeButton);

      modalContent.appendChild(title);
      modalContent.appendChild(description);
      modalContent.appendChild(errorDetails);
      modalContent.appendChild(buttonContainer);

      modal.appendChild(modalContent);

      // Add event listeners securely (not inline handlers)
      const boundReportError = this.reportErrorToSupport.bind(this);
      reportButton.addEventListener('click', () => {
        boundReportError(errorInfo);
      });

      closeButton.addEventListener('click', () => {
        this.closeErrorModal();
      });

      // Close modal on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeErrorModal();
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('eva-error-modal')) {
          this.closeErrorModal();
        }
      });

      // Append to document
      document.body.appendChild(modal);

      // Focus management for accessibility
      reportButton.focus();

      this.auditLogger?.log(`Error modal displayed for error: ${errorInfo.id}`, 'info');

    } catch (modalError) {
      console.error('Failed to create error modal:', modalError);
      this.auditLogger?.log(`Failed to create error modal: ${modalError.message}`, 'error');
    }
  }

  // Method to report error to support
  reportErrorToSupport(errorInfo) {
    try {
      // Sanitize error information before reporting
      const sanitizedErrorInfo = {
        id: this.sanitizeText(errorInfo.id || ''),
        message: this.sanitizeText(errorInfo.message || ''),
        timestamp: this.sanitizeText(errorInfo.timestamp || ''),
        type: this.sanitizeText(errorInfo.type || ''),
        userAgent: this.sanitizeText(navigator.userAgent || ''),
        url: this.sanitizeText(window.location.href || ''),
        stack: this.sanitizeText(errorInfo.stack || '')
      };

      // Here you would typically send to your error reporting service
      // For now, we'll log it and show a confirmation
      this.auditLogger?.log(`Error reported to support: ${sanitizedErrorInfo.id}`, 'info');
      
      // Show confirmation
      const confirmationMessage = document.createElement('div');
      confirmationMessage.className = 'eva-error-confirmation';
      confirmationMessage.textContent = 'Error reported successfully. Thank you for your feedback.';
      
      const modal = document.getElementById('eva-error-modal');
      if (modal) {
        const modalContent = modal.querySelector('.eva-error-modal-content');
        if (modalContent) {
          modalContent.appendChild(confirmationMessage);
          setTimeout(() => {
            this.closeErrorModal();
          }, 2000);
        }
      }

    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      this.auditLogger?.log(`Failed to report error: ${reportError.message}`, 'error');
    }
  }

  // Method to close error modal
  closeErrorModal() {
    const modal = document.getElementById('eva-error-modal');
    if (modal) {
      modal.remove();
      this.auditLogger?.log('Error modal closed', 'info');
    }
  }

  // Utility method to sanitize text content and prevent XSS
  sanitizeText(text) {
    if (typeof text !== 'string') {
      return String(text || '');
    }
    
    // Create a temporary element to use browser's built-in text sanitization
    const tempDiv = document.createElement('div');
    tempDiv.textContent = text;
    return tempDiv.innerHTML;
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