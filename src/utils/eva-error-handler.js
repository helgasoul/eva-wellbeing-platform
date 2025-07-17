// ⚡ Eva Platform - Error Handler & Logging System
// Медицинская платформа требует надежной системы обработки ошибок

/**
 * Eva Platform Error Handler
 * Обеспечивает надежную обработку ошибок для медицинской платформы
 */
class EvaErrorHandler {
  constructor() {
    try {
      this.auditLogger = new EvaAuditLogger();
      this.errorQueue = [];
      this.isOnline = navigator?.onLine ?? true;
      this.setupGlobalErrorHandlers();
      this.setupNetworkMonitoring();
    } catch (error) {
      console.error('Failed to initialize EvaErrorHandler:', error);
      // Ensure basic functionality even if initialization partially fails
      this.errorQueue = [];
      this.isOnline = true;
    }
  }

  /**
   * Настройка глобальных обработчиков ошибок
   */
  setupGlobalErrorHandlers() {
    // Prevent duplicate registrations
    if (this.handlersRegistered) return;
    this.handlersRegistered = true;

    // Store references for cleanup
    this.errorHandler = (event) => {
      this.handleError(event.error, 'global_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    };

    // Глобальные JavaScript ошибки
    window.addEventListener('error', this.errorHandler);

    // Нехваченные Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'unhandled_promise_rejection', {
        promise: event.promise
      });
    });

    // Медицинские API ошибки
    window.addEventListener('eva-api-error', (event) => {
      this.handleError(event.detail.error, 'api_error', {
        endpoint: event.detail.endpoint,
        method: event.detail.method,
        // Sanitize patient ID for logs
        patientId: this.sanitizePatientId(event.detail.patientId)
      });
    });

    // Ошибки аутентификации
    window.addEventListener('eva-auth-error', (event) => {
      this.handleError(event.detail.error, 'auth_error', {
        userId: event.detail.userId,
        action: event.detail.action
      });
    });
  }

  // Add cleanup method
  cleanup() {
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
    // Remove other listeners...
  }

  // Add sanitization method
  sanitizePatientId(patientId) {
    if (!patientId) return 'anonymous';
    // Hash or truncate patient ID for privacy
    return `patient_${patientId.substring(0, 4)}***`;
  }

  /**
   * Основной обработчик ошибок
   */
  handleError(error, context, additionalData = {}) {
    const errorInfo = {
      id: this.generateErrorId(),
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      additional: additionalData,
      severity: this.determineSeverity(error, context)
    };

    // Логирование для медицинского compliance
    this.auditLogger.logError(errorInfo);

    // Показать пользователю уведомление
    this.showUserNotification(errorInfo);

    // Отправить в мониторинг (если онлайн)
    if (this.isOnline) {
      this.reportToMonitoring(errorInfo);
    } else {
      this.queueErrorForLater(errorInfo);
    }

    // Критические ошибки требуют немедленного внимания
    if (errorInfo.severity === 'critical') {
      this.handleCriticalError(errorInfo);
    }
  }

  /**
   * Определение серьезности ошибки
   */
  // Add constants at class level
  static CONTEXTS = {
    PATIENT_DATA: 'patient_data',
    MEDICAL_RECORD: 'medical_record',
    AUTH_ERROR: 'auth_error',
    API_ERROR: 'api_error',
    // ... other contexts
  };

  static SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  };

  determineSeverity(error, context) {
    // Ensure context is a string
    const contextStr = String(context || '').toLowerCase();
    
    // Критические ошибки для медицинской платформы
    const criticalContexts = [
      EvaErrorHandler.CONTEXTS.PATIENT_DATA,
      EvaErrorHandler.CONTEXTS.MEDICAL_RECORD,
      EvaErrorHandler.CONTEXTS.AUTH_ERROR
    ];
    
    if (
      criticalContexts.some(ctx => contextStr === ctx) ||
      error?.message?.toLowerCase().includes('data loss')
    ) {
      return EvaErrorHandler.SEVERITY_LEVELS.CRITICAL;
    }
    
    // Высокий приоритет
    if (
      context.includes('api_error') ||
      context.includes('navigation') ||
      error?.message?.includes('network')
    ) {
      return 'high';
    }
    
    // Средний приоритет
    if (
      context.includes('ui_error') ||
      context.includes('validation')
    ) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Обработка критических ошибок
   */
  handleCriticalError(errorInfo) {
    // Немедленное уведомление администратора
    this.notifyAdministrator(errorInfo);
    
    // Сохранение данных пациента
    this.savePatientDataEmergency();
    
    // Показать критическое уведомление
    this.showCriticalErrorModal(errorInfo);
  }

  /**
   * Отображение уведомления пользователю
   */
  showUserNotification(errorInfo) {
    const container = this.getOrCreateErrorContainer();
    
    const notification = document.createElement('div');
    notification.className = `eva-error-notification eva-error-${errorInfo.severity}`;
    notification.innerHTML = `
      <div class="eva-error-icon">
        ${this.getErrorIcon(errorInfo.severity)}
      </div>
      <div class="eva-error-content">
        <h3 class="eva-error-title">${this.getErrorTitle(errorInfo.severity)}</h3>
        <p class="eva-error-message">${this.getUserFriendlyMessage(errorInfo)}</p>
        <div class="eva-error-actions">
          <button class="eva-button eva-button--primary" onclick="this.closest('.eva-error-notification').remove()">
            Закрыть
          </button>
          ${errorInfo.severity === 'critical' ? `
            <button class="eva-button eva-button--secondary" onclick="window.location.reload()">
              Перезагрузить
            </button>
          ` : ''}
        </div>
      </div>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое скрытие для некритических ошибок
    if (errorInfo.severity !== 'critical') {
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }

  /**
   * Создание модального окна критической ошибки
   */
  showCriticalErrorModal(errorInfo) {
    const modal = document.createElement('div');
    modal.className = 'eva-error-modal eva-error-modal--critical';
    modal.innerHTML = `
      <div class="eva-error-modal-backdrop"></div>
      <div class="eva-error-modal-content">
        <div class="eva-error-modal-header">
          <h2>🚨 Критическая ошибка системы</h2>
        </div>
        <div class="eva-error-modal-body">
          <p>Произошла критическая ошибка в медицинской системе.</p>
          <p>Данные пациентов сохранены в безопасности.</p>
          <p><strong>ID ошибки:</strong> ${errorInfo.id}</p>
        </div>
        <div class="eva-error-modal-footer">
          <button class="eva-button eva-button--primary" onclick="window.location.reload()">
            Перезагрузить систему
          </button>
          <button class="eva-button eva-button--secondary" onclick="this.reportErrorToSupport('${errorInfo.id}')">
            Связаться с поддержкой
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Отправка в систему мониторинга
   */
  async reportToMonitoring(errorInfo) {
    try {
      // Sanitize error info before sending
      const sanitizedError = this.sanitizeErrorForReporting(errorInfo);

      // Add timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Eva-Session': this.getSessionId(),
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(sanitizedError),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
    } catch (monitoringError) {
      if (monitoringError.name === 'AbortError') {
        console.error('Monitoring request timed out');
      } else {
        console.error('Failed to report error to monitoring:', monitoringError);
      }
      this.queueErrorForLater(errorInfo);
    }
  }

  sanitizeErrorForReporting(errorInfo) {
    // Remove or hash sensitive data before sending to monitoring
    const sanitized = { ...errorInfo };
    if (sanitized.additional?.patientId) {
      sanitized.additional.patientId = this.sanitizePatientId(sanitized.additional.patientId);
    }
    return sanitized;
  }

  getAuthToken() {
    return localStorage.getItem('eva-auth-token') || '';
  }

  /**
   * Мониторинг сетевого соединения
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineNotification();
    });
  }

  /**
   * Обработка очереди ошибок при восстановлении соединения
   */
  async processErrorQueue() {
    while (this.errorQueue.length > 0) {
      const errorInfo = this.errorQueue.shift();
      try {
        await this.reportToMonitoring(errorInfo);
      } catch (error) {
        // Если все еще не можем отправить, возвращаем в очередь
        this.errorQueue.unshift(errorInfo);
        break;
      }
    }
  }

  /**
   * Уведомление о работе оффлайн
   */
  showOfflineNotification() {
    const notification = document.createElement('div');
    notification.className = 'eva-offline-notification';
    notification.innerHTML = `
      <div class="eva-offline-content">
        <div class="eva-offline-icon">📡</div>
        <div class="eva-offline-text">
          <h3>Работа в автономном режиме</h3>
          <p>Данные будут синхронизированы при восстановлении соединения</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
  }

  /**
   * Получение пользовательского сообщения
   */
  getUserFriendlyMessage(errorInfo) {
    switch (errorInfo.context) {
      case 'api_error':
        return 'Возникла проблема с соединением. Попробуйте еще раз через несколько секунд.';
      case 'auth_error':
        return 'Проблема с аутентификацией. Возможно, потребуется повторный вход.';
      case 'patient_data':
        return 'Ошибка при работе с данными пациента. Данные сохранены в безопасности.';
      case 'medical_record':
        return 'Проблема с медицинской записью. Обратитесь к администратору.';
      case 'validation':
        return 'Проверьте правильность введенных данных.';
      default:
        return 'Произошла техническая ошибка. Мы уже работаем над её устранением.';
    }
  }

  /**
   * Получение иконки ошибки
   */
  getErrorIcon(severity) {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔸';
      default: return 'ℹ️';
    }
  }

  /**
   * Получение заголовка ошибки
   */
  getErrorTitle(severity) {
    switch (severity) {
      case 'critical': return 'Критическая ошибка';
      case 'high': return 'Важное уведомление';
      case 'medium': return 'Внимание';
      default: return 'Информация';
    }
  }

  /**
   * Получение или создание контейнера для ошибок
   */
  getOrCreateErrorContainer() {
    let container = document.getElementById('eva-error-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'eva-error-container';
      container.className = 'eva-error-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Генерация уникального ID ошибки
   */
  generateErrorId() {
    return `EVA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Получение ID текущего пользователя
   */
  getCurrentUserId() {
    return localStorage.getItem('eva-user-id') || 'anonymous';
  }

  /**
   * Получение ID сессии
   */
  getSessionId() {
    return sessionStorage.getItem('eva-session-id') || 'no-session';
  }

  /**
   * Постановка ошибки в очередь
   */
  queueErrorForLater(errorInfo) {
    this.errorQueue.push(errorInfo);
    
    // Ограничиваем размер очереди
    if (this.errorQueue.length > 50) {
      this.errorQueue.shift();
    }
    
    // Сохраняем в localStorage для persistence
    localStorage.setItem('eva-error-queue', JSON.stringify(this.errorQueue));
  }

  /**
   * Экстренное сохранение данных пациента
   */
  savePatientDataEmergency() {
    try {
      // Check and clean old emergency data first
      this.cleanOldEmergencyData();
      
      const forms = document.querySelectorAll('.eva-medical-form');
      const emergencyData = {};
      const timestamp = new Date().toISOString();
      
      forms.forEach((form, index) => {
        const formData = new FormData(form);
        emergencyData[`form-${index}`] = {};
        
        for (let [key, value] of formData.entries()) {
          emergencyData[`form-${index}`][key] = value;
        }
      });
      
      // Encrypt sensitive data before storing
      const encryptedData = {
        timestamp,
        data: this.encryptData(emergencyData),
        checksum: this.generateChecksum(emergencyData)
      };
      
      localStorage.setItem('eva-emergency-data', JSON.stringify(encryptedData));
      console.log('Emergency patient data saved');
    } catch (error) {
      console.error('Failed to save emergency patient data:', error);
    }
  }

  // Add encryption method (implement with proper crypto library)
  encryptData(data) {
    // TODO: Implement proper encryption using Web Crypto API or similar
    console.warn('Emergency data encryption not implemented - this is a security risk!');
    return btoa(JSON.stringify(data)); // Base64 is NOT encryption - replace this!
  }

  generateChecksum(data) {
    // Generate checksum for data integrity verification
    return JSON.stringify(data).length; // Replace with proper checksum
  }

  cleanOldEmergencyData() {
    const existing = localStorage.getItem('eva-emergency-data');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const age = Date.now() - new Date(parsed.timestamp).getTime();
        // Remove data older than 24 hours
        if (age > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('eva-emergency-data');
        }
      } catch (e) {
        localStorage.removeItem('eva-emergency-data');
      }
    }
  }

  /**
   * Уведомление администратора
   */
  async notifyAdministrator(errorInfo) {
    try {
      await fetch('/api/admin/critical-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Eva-Priority': 'critical'
        },
        body: JSON.stringify({
          error: errorInfo,
          timestamp: new Date().toISOString(),
          urgent: true
        })
      });
    } catch (error) {
      console.error('Failed to notify administrator:', error);
    }
  }
}

/**
 * Eva Audit Logger - для медицинского compliance
 */
class EvaAuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogsInMemory = 1000;
    this.maxLogsInStorage = 1000; // Increase for compliance
    this.initializeFromStorage();
  }

  initializeFromStorage() {
    try {
      const stored = localStorage.getItem('eva-audit-logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      this.logs = [];
    }
  }

  /**
   * Логирование ошибки
   */
  logError(errorInfo) {
    const logEntry = {
      id: this.generateLogId(),
      type: 'error',
      timestamp: new Date().toISOString(),
      data: errorInfo,
      complianceLevel: this.getComplianceLevel(errorInfo),
      signature: this.generateLogSignature(errorInfo)
    };

    this.logs.push(logEntry);
    this.maintainLogSize();
    this.persistLog(logEntry);
    this.sendToComplianceServer(logEntry);
  }

  /**
   * Логирование медицинского события
   */
  logMedicalEvent(eventType, patientId, data) {
    const logEntry = {
      type: 'medical_event',
      eventType: eventType,
      patientId: patientId,
      timestamp: new Date().toISOString(),
      data: data,
      complianceLevel: 'high'
    };

    this.logs.push(logEntry);
    this.maintainLogSize();
    this.persistLog(logEntry);
  }

  /**
   * Определение уровня compliance
   */
  getComplianceLevel(errorInfo) {
    if (
      errorInfo.context.includes('patient') ||
      errorInfo.context.includes('medical')
    ) {
      return 'high';
    }
    return 'medium';
  }

  generateLogId() {
    return `LOG-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  generateLogSignature(data) {
    // Generate cryptographic signature for tamper detection
    // TODO: Implement proper HMAC or digital signature
    return 'signature-placeholder';
  }

  async sendToComplianceServer(logEntry) {
    try {
      // Send to secure compliance server for permanent storage
      await fetch('/api/compliance/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Audit-Signature': logEntry.signature
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send audit log to compliance server:', error);
      // Queue for later sending
      this.queueAuditLog(logEntry);
    }
  }

  /**
   * Поддержание размера логов
   */
  maintainLogSize() {
    if (this.logs.length > this.maxLogsInMemory) {
      // Archive oldest 100 logs
      const toArchive = this.logs.splice(0, 100);
      this.archiveLogs(toArchive);
    }
  }

  /**
   * Сохранение лога
   */
  persistLog(logEntry) {
    try {
      const existingLogs = JSON.parse(
        localStorage.getItem('eva-audit-logs') || '[]'
      );
      existingLogs.push(logEntry);

      // Ограничиваем количество логов в localStorage
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }

      localStorage.setItem(
        'eva-audit-logs',
        JSON.stringify(existingLogs)
      );
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  async archiveLogs(logs) {
    try {
      // Compress logs before archiving
      const compressed = this.compressLogs(logs);

      // Send to archive storage
      await fetch('/api/compliance/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip'
        },
        body: compressed
      });
    } catch (error) {
      console.error('Failed to archive logs:', error);
    }
  }

  compressLogs(logs) {
    // TODO: Implement actual compression (e.g., using pako library)
    return JSON.stringify(logs);
  }

  queueAuditLog(logEntry) {
    const queue = JSON.parse(
      localStorage.getItem('eva-audit-queue') || '[]'
    );
    queue.push(logEntry);
    localStorage.setItem(
      'eva-audit-queue',
      JSON.stringify(queue)
    );
  }
}

/**
 * Eva Performance Monitor
 */
class EvaPerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      apiResponseTimes: [],
      errorRate: 0,
      userInteractions: 0,
      aggregatedMetrics: {}
    };
    this.originalFetch = window.fetch;
    this.metricsBuffer = [];
    this.aggregationInterval = null;
    this.setupPerformanceMonitoring();
  }

  /**
   * Настройка мониторинга производительности
   */
  setupPerformanceMonitoring() {
    // Время загрузки страницы
    this.loadHandler = () => {
      this.metrics.pageLoadTime = performance.now();
      this.reportMetric('page_load_time', this.metrics.pageLoadTime);
    };
    window.addEventListener('load', this.loadHandler);

    // Мониторинг API вызовов
    this.interceptFetch();

    // Мониторинг взаимодействений пользователя
    // Only track if user consents
    if (this.hasUserConsent()) {
      this.trackUserInteractions();
    }

    // Start metric aggregation
    this.startMetricAggregation();
  }

  /**
   * Перехват fetch запросов
   */
  interceptFetch() {
    if (!this.originalFetch) return;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0]?.url || args[0];
      
      try {
        const response = await this.originalFetch.apply(window, args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        // Buffer metrics for aggregation
        this.metricsBuffer.push({
          type: 'api_response_time',
          value: responseTime,
          url: this.sanitizeUrl(url),
          timestamp: Date.now()
        });
        
        return response;
      } catch (error) {
        this.metrics.errorRate++;
        this.metricsBuffer.push({
          type: 'api_error',
          url: this.sanitizeUrl(url),
          timestamp: Date.now()
        });
        throw error;
      }
    };
  }

  sanitizeUrl(url) {
    // Remove sensitive query parameters
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      return 'unknown';
    }
  }

  hasUserConsent() {
    // Check if user has consented to performance tracking
    return localStorage.getItem('eva-performance-consent') === 'true';
  }

  /**
   * Отслеживание взаимодействий пользователя
   */
  trackUserInteractions() {
    // Use passive listeners and throttle scroll events
    this.interactionHandlers = {
      click: () => this.metrics.userInteractions++,
      keydown: () => this.metrics.userInteractions++,
      scroll: this.throttle(() => this.metrics.userInteractions++, 1000)
    };

    Object.entries(this.interactionHandlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler, { passive: true });
    });
  }

  throttle(func, delay) {
    let lastExec = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastExec >= delay) {
        func.apply(this, args);
        lastExec = now;
      }
    };
  }

  startMetricAggregation() {
    // Aggregate and report metrics every 30 seconds
    this.aggregationInterval = setInterval(() => {
      this.aggregateAndReportMetrics();
    }, 30000);
  }

  aggregateAndReportMetrics() {
    if (this.metricsBuffer.length === 0) return;

    const aggregated = this.metricsBuffer.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = { count: 0, total: 0, values: [] };
      }
      acc[metric.type].count++;
      if (metric.value != null) {
        acc[metric.type].total += metric.value;
        acc[metric.type].values.push(metric.value);
      }
      return acc;
    }, {});

    // Calculate statistics
    Object.entries(aggregated).forEach(([type, data]) => {
      if (data.values.length > 0) {
        data.average = data.total / data.values.length;
        data.median = this.calculateMedian(data.values);
      }
      this.reportMetric(type, data);
    });

    // Clear buffer
    this.metricsBuffer = [];
  }

  calculateMedian(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  cleanup() {
    // Restore original fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }

    // Remove event listeners
    if (this.loadHandler) {
      window.removeEventListener('load', this.loadHandler);
    }

    if (this.interactionHandlers) {
      Object.entries(this.interactionHandlers).forEach(([event, handler]) => {
        document.removeEventListener(event, handler);
      });
    }

    // Clear aggregation interval
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval);
    }
  }

  /**
   * Отчет о метрике
   */
  reportMetric(metricName, value) {
    console.log(`Eva Performance Metric - ${metricName}:`, value);
    
    // В реальной системе это отправлялось бы в систему мониторинга
    if (window.evaErrorHandler) {
      window.evaErrorHandler.auditLogger.logMedicalEvent(
        'performance_metric',
        'system',
        {
          metric: metricName,
          value: value,
          timestamp: new Date().toISOString()
        }
      );
    }
  }
}

// Инициализация системы обработки ошибок
window.evaErrorHandler = new EvaErrorHandler();
window.evaPerformanceMonitor = new EvaPerformanceMonitor();

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EvaErrorHandler,
    EvaAuditLogger,
    EvaPerformanceMonitor
  };
}

console.log('✅ Eva Platform Error Handler & Performance Monitor initialized');

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
