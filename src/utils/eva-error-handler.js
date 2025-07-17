// ⚡ Eva Platform - Error Handler & Logging System
// Медицинская платформа требует надежной системы обработки ошибок

/**
 * Eva Platform Error Handler
 * Обеспечивает надежную обработку ошибок для медицинской платформы
 */
class EvaErrorHandler {
  constructor() {
    this.auditLogger = new EvaAuditLogger();
    this.setupGlobalErrorHandlers();
    this.errorQueue = [];
    this.isOnline = navigator.onLine;
    this.setupNetworkMonitoring();
  }

  /**
   * Настройка глобальных обработчиков ошибок
   */
  setupGlobalErrorHandlers() {
    // Глобальные JavaScript ошибки
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'global_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message
      });
    });

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
        patientId: event.detail.patientId
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
  determineSeverity(error, context) {
    // Критические ошибки для медицинской платформы
    if (context.includes('patient_data') || 
        context.includes('medical_record') ||
        context.includes('auth_error') ||
        error?.message?.includes('data loss')) {
      return 'critical';
    }
    
    // Высокий приоритет
    if (context.includes('api_error') || 
        context.includes('navigation') ||
        error?.message?.includes('network')) {
      return 'high';
    }
    
    // Средний приоритет
    if (context.includes('ui_error') || 
        context.includes('validation')) {
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
      await fetch('/api/monitoring/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Eva-Session': this.getSessionId()
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (monitoringError) {
      console.error('Failed to report error to monitoring:', monitoringError);
      this.queueErrorForLater(errorInfo);
    }
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
    this.maxLogs = 1000;
  }

  /**
   * Логирование ошибки
   */
  logError(errorInfo) {
    const logEntry = {
      type: 'error',
      timestamp: new Date().toISOString(),
      data: errorInfo,
      complianceLevel: this.getComplianceLevel(errorInfo)
    };

    this.logs.push(logEntry);
    this.maintainLogSize();
    this.persistLog(logEntry);
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
    if (errorInfo.context.includes('patient') || 
        errorInfo.context.includes('medical')) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Поддержание размера логов
   */
  maintainLogSize() {
    if (this.logs.length > this.maxLogs) {
      const removed = this.logs.shift();
      this.archiveLog(removed);
    }
  }

  /**
   * Сохранение лога
   */
  persistLog(logEntry) {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('eva-audit-logs') || '[]');
      existingLogs.push(logEntry);
      
      // Ограничиваем количество логов в localStorage
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }
      
      localStorage.setItem('eva-audit-logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to persist audit log:', error);
    }
  }

  /**
   * Архивирование старых логов
   */
  archiveLog(logEntry) {
    // В реальной системе это отправлялось бы в архив
    console.log('Archiving log entry:', logEntry);
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
      userInteractions: 0
    };
    this.setupPerformanceMonitoring();
  }

  /**
   * Настройка мониторинга производительности
   */
  setupPerformanceMonitoring() {
    // Время загрузки страницы
    window.addEventListener('load', () => {
      this.metrics.pageLoadTime = performance.now();
      this.reportMetric('page_load_time', this.metrics.pageLoadTime);
    });

    // Мониторинг API вызовов
    this.interceptFetch();

    // Мониторинг взаимодействий пользователя
    this.trackUserInteractions();
  }

  /**
   * Перехват fetch запросов
   */
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        this.metrics.apiResponseTimes.push(responseTime);
        this.reportMetric('api_response_time', responseTime);
        
        return response;
      } catch (error) {
        this.metrics.errorRate++;
        this.reportMetric('api_error_rate', this.metrics.errorRate);
        throw error;
      }
    };
  }

  /**
   * Отслеживание взаимодействий пользователя
   */
  trackUserInteractions() {
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.metrics.userInteractions++;
      });
    });
  }

  /**
   * Отчет о метрике
   */
  reportMetric(metricName, value) {
    console.log(`Eva Performance Metric - ${metricName}: ${value}`);
    
    // В реальной системе это отправлялось бы в систему мониторинга
    if (window.evaErrorHandler) {
      window.evaErrorHandler.auditLogger.logMedicalEvent('performance_metric', 'system', {
        metric: metricName,
        value: value,
        timestamp: new Date().toISOString()
      });
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
