import { DataBridge } from './DataBridge';
import { logger } from '@/utils/logger';
import type {
  IDataBridgeService,
  DataValidationRule,
  DataValidationResult,
  DataBackupConfig,
  DataBackupEntry,
  DataTransferConfig,
  DataTransferResult,
  DataAuditEntry,
  DataBridgeMetrics,
  DataBridgeConfig,
  DataExportOptions,
  DataImportOptions,
  DataHealthReport,
  DataBridgeEvent,
  DataBridgeEventListener
} from '@/types/dataBridgeService';

export class DataBridgeService implements IDataBridgeService {
  private static instance: DataBridgeService;
  private dataBridge: DataBridge;
  private config: DataBridgeConfig;
  private eventListeners: Map<string, Set<DataBridgeEventListener>>;
  private metricsCache: DataBridgeMetrics | null = null;
  private lastMetricsUpdate: number = 0;

  private constructor() {
    this.dataBridge = DataBridge.getInstance();
    this.eventListeners = new Map();
    this.config = this.getDefaultConfig();
    this.initializeService();
  }

  static getInstance(): DataBridgeService {
    if (!DataBridgeService.instance) {
      DataBridgeService.instance = new DataBridgeService();
    }
    return DataBridgeService.instance;
  }

  private getDefaultConfig(): DataBridgeConfig {
    return {
      version: '1.0.0',
      storagePrefix: 'eva_bridge_',
      validation: {
        enabled: true,
        rules: {
          email: [
            { field: 'email', type: 'required', message: 'Email is required' },
            { field: 'email', type: 'email', message: 'Invalid email format' }
          ],
          phone: [
            { field: 'phone', type: 'required', message: 'Phone is required' },
            { field: 'phone', type: 'phone', message: 'Invalid phone format' }
          ],
          persona: [
            { field: 'personaId', type: 'required', message: 'Persona selection is required' }
          ]
        }
      },
      backup: {
        enabled: true,
        retentionDays: 30,
        compressionLevel: 'medium',
        encryptionEnabled: true,
        autoBackupInterval: 24
      },
      transfer: {
        validateBefore: true,
        backupBefore: true,
        atomicTransfer: true,
        retryAttempts: 3,
        timeoutMs: 30000
      },
      audit: {
        enabled: true,
        retentionDays: 90,
        sensitiveFields: ['password', 'token', 'secret']
      },
      performance: {
        maxCacheSize: 100,
        cacheExpiryMinutes: 60,
        compressionThreshold: 1024
      }
    };
  }

  private initializeService(): void {
    // Initialize audit system
    this.ensureAuditTable();
    
    // Set up automatic backup cleanup
    this.scheduleBackupCleanup();
    
    logger.info('DataBridgeService initialized');
  }

  private ensureAuditTable(): void {
    const auditTable = this.getStorageItem('audit_entries') || [];
    if (!Array.isArray(auditTable)) {
      this.setStorageItem('audit_entries', []);
    }
  }

  private scheduleBackupCleanup(): void {
    // Schedule periodic cleanup of expired backups
    setInterval(() => {
      this.cleanupExpiredBackups().catch(error => {
        logger.error('Auto backup cleanup failed:', error);
      });
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  // Core validation
  validateData(data: any, rules: DataValidationRule[]): DataValidationResult {
    const result: DataValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldErrors: {}
    };

    for (const rule of rules) {
      const value = this.getNestedValue(data, rule.field);
      const validation = this.validateField(value, rule);
      
      if (!validation.isValid) {
        result.isValid = false;
        result.errors.push(validation.message);
        
        if (!result.fieldErrors[rule.field]) {
          result.fieldErrors[rule.field] = [];
        }
        result.fieldErrors[rule.field].push(validation.message);
      }
    }

    return result;
  }

  private validateField(value: any, rule: DataValidationRule): { isValid: boolean; message: string } {
    switch (rule.type) {
      case 'required':
        return {
          isValid: value != null && value !== '' && value !== undefined,
          message: rule.message
        };
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: !value || emailRegex.test(value),
          message: rule.message
        };
      
      case 'phone':
        const phoneRegex = /^\+?[\d\s-()]+$/;
        return {
          isValid: !value || phoneRegex.test(value),
          message: rule.message
        };
      
      case 'custom':
        return {
          isValid: !rule.validator || rule.validator(value),
          message: rule.message
        };
      
      default:
        return { isValid: true, message: '' };
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Enhanced transfer with full pipeline
  async transferData(from: string, to: string, data: any, config?: DataTransferConfig): Promise<DataTransferResult> {
    const startTime = Date.now();
    const transferConfig = { ...this.config.transfer, ...config };
    
    const result: DataTransferResult = {
      success: false,
      transferredKeys: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
      duration: 0
    };

    try {
      // 1. Validation phase
      if (transferConfig.validateBefore && this.config.validation.enabled) {
        const rules = this.config.validation.rules[from] || [];
        const validationResult = this.validateData(data, rules);
        result.validationResult = validationResult;
        
        if (!validationResult.isValid) {
          result.errors.push(...validationResult.errors);
          throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
        }
      }

      // 2. Backup phase
      if (transferConfig.backupBefore && this.config.backup.enabled) {
        const existingData = this.getStorageItem(to);
        if (existingData) {
          const backup = await this.createBackup(to, existingData);
          result.backupId = backup.id;
        }
      }

      // 3. Atomic transfer
      if (transferConfig.atomicTransfer) {
        await this.performAtomicTransfer(from, to, data, result);
      } else {
        await this.performSimpleTransfer(from, to, data, result);
      }

      // 4. Audit logging
      if (this.config.audit.enabled) {
        await this.logAction('transfer', from, {
          to,
          dataKeys: result.transferredKeys,
          success: result.success
        });
      }

      result.success = true;
      result.duration = Date.now() - startTime;

      // 5. Success callback
      if (transferConfig.onSuccess) {
        transferConfig.onSuccess(result);
      }

      this.emit({
        type: 'transfer',
        timestamp: new Date().toISOString(),
        data: { from, to, success: true }
      });

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.duration = Date.now() - startTime;

      if (transferConfig.onError) {
        transferConfig.onError(error instanceof Error ? error : new Error(String(error)));
      }

      this.emit({
        type: 'error',
        timestamp: new Date().toISOString(),
        data: { from, to, error: error instanceof Error ? error.message : String(error) }
      });

      logger.error('Data transfer failed:', error);
    }

    return result;
  }

  private async performAtomicTransfer(from: string, to: string, data: any, result: DataTransferResult): Promise<void> {
    // Create transaction-like behavior using temporary storage
    const tempKey = `${to}_temp_${Date.now()}`;
    
    try {
      // Store data temporarily
      this.setStorageItem(tempKey, data);
      
      // Verify temporary storage
      const tempData = this.getStorageItem(tempKey);
      if (!tempData) {
        throw new Error('Failed to create temporary storage');
      }

      // Move from temp to final location
      this.setStorageItem(to, tempData);
      
      // Verify final storage
      const finalData = this.getStorageItem(to);
      if (!finalData) {
        throw new Error('Failed to store data in final location');
      }

      // Clean up temp storage
      this.removeStorageItem(tempKey);
      
      result.transferredKeys = Object.keys(data);
      
    } catch (error) {
      // Rollback: clean up temp storage
      this.removeStorageItem(tempKey);
      throw error;
    }
  }

  private async performSimpleTransfer(from: string, to: string, data: any, result: DataTransferResult): Promise<void> {
    this.setStorageItem(to, data);
    result.transferredKeys = Object.keys(data);
  }

  // Backup system
  async createBackup(dataType: string, data: any): Promise<DataBackupEntry> {
    const backupId = `backup_${dataType}_${Date.now()}`;
    const compressed = this.config.backup.compressionLevel !== 'none' ? this.compressData(data) : JSON.stringify(data);
    const encrypted = this.config.backup.encryptionEnabled ? this.encryptData(compressed) : compressed;
    
    const backup: DataBackupEntry = {
      id: backupId,
      timestamp: new Date().toISOString(),
      dataType,
      size: encrypted.length,
      checksum: this.calculateChecksum(data),
      metadata: { originalSize: JSON.stringify(data).length },
      isCompressed: this.config.backup.compressionLevel !== 'none',
      isEncrypted: this.config.backup.encryptionEnabled
    };

    // Store backup data
    this.setStorageItem(`backup_data_${backupId}`, encrypted);
    
    // Update backup index
    const backups = this.getStorageItem('backup_index') || [];
    backups.push(backup);
    this.setStorageItem('backup_index', backups);

    this.emit({
      type: 'backup',
      timestamp: new Date().toISOString(),
      data: { backupId, dataType, size: backup.size }
    });

    return backup;
  }

  async restoreFromBackup(backupId: string): Promise<any> {
    const backups = this.getStorageItem('backup_index') || [];
    const backup = backups.find((b: DataBackupEntry) => b.id === backupId);
    
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const encryptedData = this.getStorageItem(`backup_data_${backupId}`);
    if (!encryptedData) {
      throw new Error(`Backup data not found: ${backupId}`);
    }

    let data = encryptedData;
    
    // Decrypt if needed
    if (backup.isEncrypted) {
      data = this.decryptData(data);
    }
    
    // Decompress if needed
    if (backup.isCompressed) {
      data = this.decompressData(data);
    } else {
      data = JSON.parse(data);
    }

    // Verify checksum
    const calculatedChecksum = this.calculateChecksum(data);
    if (calculatedChecksum !== backup.checksum) {
      throw new Error('Backup data integrity check failed');
    }

    this.emit({
      type: 'restore',
      timestamp: new Date().toISOString(),
      data: { backupId, dataType: backup.dataType }
    });

    return data;
  }

  async listBackups(dataType?: string): Promise<DataBackupEntry[]> {
    const backups = this.getStorageItem('backup_index') || [];
    return dataType ? backups.filter((b: DataBackupEntry) => b.dataType === dataType) : backups;
  }

  async cleanupExpiredBackups(): Promise<number> {
    const backups = this.getStorageItem('backup_index') || [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.backup.retentionDays);

    const expiredBackups = backups.filter((backup: DataBackupEntry) => 
      new Date(backup.timestamp) < cutoffDate
    );

    // Remove expired backup data
    for (const backup of expiredBackups) {
      this.removeStorageItem(`backup_data_${backup.id}`);
    }

    // Update backup index
    const remainingBackups = backups.filter((backup: DataBackupEntry) => 
      new Date(backup.timestamp) >= cutoffDate
    );
    this.setStorageItem('backup_index', remainingBackups);

    return expiredBackups.length;
  }

  // Audit system
  async logAction(action: DataAuditEntry['action'], dataType: string, metadata: Record<string, any>): Promise<void> {
    const auditEntry: DataAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId: 'current_user', // Would come from auth context
      action,
      dataType,
      affectedKeys: metadata.dataKeys || [],
      metadata: this.sanitizeMetadata(metadata),
      sessionId: this.getSessionId()
    };

    const auditEntries = this.getStorageItem('audit_entries') || [];
    auditEntries.push(auditEntry);
    
    // Keep only recent entries based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.audit.retentionDays);
    
    const filteredEntries = auditEntries.filter((entry: DataAuditEntry) => 
      new Date(entry.timestamp) >= cutoffDate
    );
    
    this.setStorageItem('audit_entries', filteredEntries);
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    
    for (const field of this.config.audit.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }

  private getSessionId(): string {
    return sessionStorage.getItem('session_id') || 'anonymous';
  }

  async getAuditTrail(filters?: { startDate?: string; endDate?: string; userId?: string; action?: string }): Promise<DataAuditEntry[]> {
    const auditEntries = this.getStorageItem('audit_entries') || [];
    
    if (!filters) {
      return auditEntries;
    }

    return auditEntries.filter((entry: DataAuditEntry) => {
      if (filters.startDate && new Date(entry.timestamp) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(entry.timestamp) > new Date(filters.endDate)) {
        return false;
      }
      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }
      if (filters.action && entry.action !== filters.action) {
        return false;
      }
      return true;
    });
  }

  // Health monitoring
  async performHealthCheck(): Promise<DataHealthReport> {
    const issues: DataHealthReport['issues'] = [];
    const metrics = await this.getMetrics();
    
    // Check for data corruption
    const storageKeys = this.getAllStorageKeys();
    for (const key of storageKeys) {
      try {
        const data = this.getStorageItem(key);
        if (data === null && key.includes('_data_')) {
          issues.push({
            type: 'missing',
            severity: 'high',
            description: `Missing data for key: ${key}`,
            affectedData: [key],
            suggestedAction: 'Restore from backup if available'
          });
        }
      } catch (error) {
        issues.push({
          type: 'corruption',
          severity: 'high',
          description: `Corrupted data for key: ${key}`,
          affectedData: [key],
          suggestedAction: 'Restore from backup or recreate data'
        });
      }
    }

    // Check backup health
    const backups = await this.listBackups();
    const oldBackups = backups.filter(b => {
      const age = Date.now() - new Date(b.timestamp).getTime();
      return age > 7 * 24 * 60 * 60 * 1000; // 7 days
    });

    if (oldBackups.length === backups.length && backups.length > 0) {
      issues.push({
        type: 'outdated',
        severity: 'medium',
        description: 'All backups are older than 7 days',
        affectedData: ['backups'],
        suggestedAction: 'Create fresh backups'
      });
    }

    const overall = issues.some(i => i.severity === 'high') ? 'critical' :
                   issues.some(i => i.severity === 'medium') ? 'degraded' : 'healthy';

    return {
      overall,
      issues,
      metrics,
      recommendations: this.generateRecommendations(issues),
      lastCheckTime: new Date().toISOString()
    };
  }

  private generateRecommendations(issues: DataHealthReport['issues']): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'corruption')) {
      recommendations.push('Schedule regular data integrity checks');
    }
    
    if (issues.some(i => i.type === 'missing')) {
      recommendations.push('Implement automated backup verification');
    }
    
    if (issues.some(i => i.type === 'outdated')) {
      recommendations.push('Increase backup frequency');
    }
    
    return recommendations;
  }

  async getMetrics(): Promise<DataBridgeMetrics> {
    // Use cached metrics if recent
    if (this.metricsCache && Date.now() - this.lastMetricsUpdate < 60000) {
      return this.metricsCache;
    }

    const auditEntries = this.getStorageItem('audit_entries') || [];
    const transfers = auditEntries.filter((e: DataAuditEntry) => e.action === 'transfer');
    const backups = await this.listBackups();
    
    const successfulTransfers = transfers.filter((t: DataAuditEntry) => t.metadata.success).length;
    const totalTransfers = transfers.length;
    
    const metrics: DataBridgeMetrics = {
      totalTransfers,
      successfulTransfers,
      failedTransfers: totalTransfers - successfulTransfers,
      averageTransferTime: this.calculateAverageTransferTime(transfers),
      dataIntegrityScore: this.calculateDataIntegrityScore(),
      lastBackupTime: backups.length > 0 ? backups[backups.length - 1].timestamp : 'never',
      storageUtilization: this.calculateStorageUtilization(),
      errorRate: totalTransfers > 0 ? (totalTransfers - successfulTransfers) / totalTransfers : 0
    };

    this.metricsCache = metrics;
    this.lastMetricsUpdate = Date.now();
    
    return metrics;
  }

  private calculateAverageTransferTime(transfers: DataAuditEntry[]): number {
    if (transfers.length === 0) return 0;
    
    const times = transfers
      .map(t => t.metadata.duration)
      .filter(d => typeof d === 'number');
    
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  private calculateDataIntegrityScore(): number {
    const storageKeys = this.getAllStorageKeys();
    let validKeys = 0;
    
    for (const key of storageKeys) {
      try {
        const data = this.getStorageItem(key);
        if (data !== null) {
          validKeys++;
        }
      } catch {
        // Invalid key
      }
    }
    
    return storageKeys.length > 0 ? (validKeys / storageKeys.length) * 100 : 100;
  }

  private calculateStorageUtilization(): number {
    // Estimate storage usage (simplified)
    const storageKeys = this.getAllStorageKeys();
    let totalSize = 0;
    
    for (const key of storageKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      } catch {
        // Skip invalid keys
      }
    }
    
    // Return as percentage of estimated 5MB quota
    return Math.min((totalSize / (5 * 1024 * 1024)) * 100, 100);
  }

  // Export/Import
  async exportData(options: DataExportOptions): Promise<Blob> {
    const data: any = {};
    const storageKeys = this.getAllStorageKeys();
    
    for (const key of storageKeys) {
      if (options.dataTypes && !options.dataTypes.some(type => key.includes(type))) {
        continue;
      }
      
      try {
        const value = this.getStorageItem(key);
        if (value) {
          data[key] = value;
        }
      } catch (error) {
        console.warn(`Failed to export key ${key}:`, error);
      }
    }

    if (options.includeMetadata) {
      data._metadata = {
        exportTime: new Date().toISOString(),
        version: this.config.version,
        totalKeys: Object.keys(data).length
      };
    }

    let content: string;
    let mimeType: string;

    switch (options.format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        break;
      case 'csv':
        content = this.convertToCSV(data);
        mimeType = 'text/csv';
        break;
      case 'xml':
        content = this.convertToXML(data);
        mimeType = 'application/xml';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    return new Blob([content], { type: mimeType });
  }

  async importData(data: any, options: DataImportOptions): Promise<DataTransferResult> {
    const result: DataTransferResult = {
      success: false,
      transferredKeys: [],
      errors: [],
      warnings: [],
      timestamp: new Date().toISOString(),
      duration: 0
    };

    const startTime = Date.now();

    try {
      // Backup before import if requested
      if (options.backupBefore) {
        await this.createBackup('import_backup', this.exportAllData());
      }

      // Process each data entry
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith('_')) continue; // Skip metadata

        try {
          switch (options.mergeStrategy) {
            case 'replace':
              this.setStorageItem(key, value);
              break;
            case 'merge':
              const existing = this.getStorageItem(key);
              if (existing && typeof existing === 'object' && typeof value === 'object') {
                this.setStorageItem(key, { ...existing, ...value });
              } else {
                this.setStorageItem(key, value);
              }
              break;
            case 'append':
              const existingArray = this.getStorageItem(key);
              if (Array.isArray(existingArray) && Array.isArray(value)) {
                this.setStorageItem(key, [...existingArray, ...value]);
              } else {
                this.setStorageItem(key, value);
              }
              break;
          }
          
          result.transferredKeys.push(key);
        } catch (error) {
          const errorMsg = `Failed to import key ${key}: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          
          if (!options.ignoreErrors) {
            throw new Error(errorMsg);
          }
        }
      }

      result.success = true;
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  private convertToCSV(data: any): string {
    const rows: string[] = [];
    rows.push('Key,Value,Type');
    
    for (const [key, value] of Object.entries(data)) {
      const type = Array.isArray(value) ? 'array' : typeof value;
      const csvValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      rows.push(`"${key}","${csvValue.replace(/"/g, '""')}","${type}"`);
    }
    
    return rows.join('\n');
  }

  private convertToXML(data: any): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    
    for (const [key, value] of Object.entries(data)) {
      xml += `  <item key="${key}">\n`;
      xml += `    <value>${this.escapeXML(JSON.stringify(value))}</value>\n`;
      xml += `  </item>\n`;
    }
    
    xml += '</data>';
    return xml;
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  private exportAllData(): any {
    const data: any = {};
    const storageKeys = this.getAllStorageKeys();
    
    for (const key of storageKeys) {
      try {
        const value = this.getStorageItem(key);
        if (value !== null) {
          data[key] = value;
        }
      } catch (error) {
        console.warn(`Failed to export key ${key}:`, error);
      }
    }
    
    return data;
  }

  // Configuration
  updateConfig(config: Partial<DataBridgeConfig>): void {
    this.config = { ...this.config, ...config };
    this.setStorageItem('bridge_config', this.config);
  }

  getConfig(): DataBridgeConfig {
    return { ...this.config };
  }

  // Event system
  addEventListener(type: string, listener: DataBridgeEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: DataBridgeEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit(event: DataBridgeEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // Utility methods
  calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  compressData(data: any): string {
    // Simple compression using JSON.stringify with reduced spacing
    // In a real implementation, you'd use a proper compression library
    return JSON.stringify(data);
  }

  decompressData(compressed: string): any {
    return JSON.parse(compressed);
  }

  encryptData(data: any): string {
    // Simple XOR encryption for demo - use proper encryption in production
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    const key = 'bridge_encryption_key';
    let encrypted = '';
    
    for (let i = 0; i < str.length; i++) {
      encrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    return btoa(encrypted);
  }

  decryptData(encrypted: string): any {
    const str = atob(encrypted);
    const key = 'bridge_encryption_key';
    let decrypted = '';
    
    for (let i = 0; i < str.length; i++) {
      decrypted += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

  // Storage utilities
  private getAllStorageKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.config.storagePrefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  private getStorageItem(key: string): any {
    try {
      const item = localStorage.getItem(`${this.config.storagePrefix}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  private setStorageItem(key: string, value: any): void {
    try {
      localStorage.setItem(`${this.config.storagePrefix}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      throw error;
    }
  }

  private removeStorageItem(key: string): void {
    try {
      localStorage.removeItem(`${this.config.storagePrefix}${key}`);
    } catch (error) {
      console.error(`Failed to remove storage item ${key}:`, error);
    }
  }
}

// Export singleton instance
export const dataBridgeService = DataBridgeService.getInstance();

// Export hooks for React components
export const useDataBridge = () => {
  return {
    validateData: dataBridgeService.validateData.bind(dataBridgeService),
    transferData: dataBridgeService.transferData.bind(dataBridgeService),
    createBackup: dataBridgeService.createBackup.bind(dataBridgeService),
    restoreFromBackup: dataBridgeService.restoreFromBackup.bind(dataBridgeService),
    performHealthCheck: dataBridgeService.performHealthCheck.bind(dataBridgeService),
    getMetrics: dataBridgeService.getMetrics.bind(dataBridgeService),
    getAuditTrail: dataBridgeService.getAuditTrail.bind(dataBridgeService),
    exportData: dataBridgeService.exportData.bind(dataBridgeService),
    importData: dataBridgeService.importData.bind(dataBridgeService),
    addEventListener: dataBridgeService.addEventListener.bind(dataBridgeService),
    removeEventListener: dataBridgeService.removeEventListener.bind(dataBridgeService)
  };
};
