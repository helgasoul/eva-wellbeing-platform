
export interface DataValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'custom';
  validator?: (value: any) => boolean;
  message: string;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string[]>;
}

export interface DataBackupConfig {
  enabled: boolean;
  retentionDays: number;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  encryptionEnabled: boolean;
  autoBackupInterval: number; // hours
}

export interface DataBackupEntry {
  id: string;
  timestamp: string;
  dataType: string;
  size: number;
  checksum: string;
  metadata: Record<string, any>;
  isCompressed: boolean;
  isEncrypted: boolean;
}

export interface DataTransferConfig {
  validateBefore: boolean;
  backupBefore: boolean;
  atomicTransfer: boolean;
  retryAttempts: number;
  timeoutMs: number;
  onSuccess?: (result: DataTransferResult) => void;
  onError?: (error: Error) => void;
}

export interface DataTransferResult {
  success: boolean;
  transferredKeys: string[];
  errors: string[];
  warnings: string[];
  timestamp: string;
  duration: number;
  backupId?: string;
  validationResult?: DataValidationResult;
}

export interface DataAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'transfer' | 'backup' | 'restore';
  dataType: string;
  affectedKeys: string[];
  before?: any;
  after?: any;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface DataBridgeMetrics {
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  averageTransferTime: number;
  dataIntegrityScore: number;
  lastBackupTime: string;
  storageUtilization: number;
  errorRate: number;
}

export interface DataBridgeConfig {
  version: string;
  storagePrefix: string;
  validation: {
    enabled: boolean;
    rules: Record<string, DataValidationRule[]>;
  };
  backup: DataBackupConfig;
  transfer: DataTransferConfig;
  audit: {
    enabled: boolean;
    retentionDays: number;
    sensitiveFields: string[];
  };
  performance: {
    maxCacheSize: number;
    cacheExpiryMinutes: number;
    compressionThreshold: number;
  };
}

export interface DataSyncStatus {
  lastSync: string;
  pendingChanges: number;
  conflictCount: number;
  isOnline: boolean;
  syncInProgress: boolean;
}

export interface DataExportOptions {
  format: 'json' | 'csv' | 'xml';
  includeMetadata: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  dataTypes?: string[];
  compressionEnabled: boolean;
}

export interface DataImportOptions {
  format: 'json' | 'csv' | 'xml';
  validateSchema: boolean;
  backupBefore: boolean;
  mergeStrategy: 'replace' | 'merge' | 'append';
  ignoreErrors: boolean;
}

export interface DataHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  issues: {
    type: 'corruption' | 'missing' | 'outdated' | 'invalid';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedData: string[];
    suggestedAction: string;
  }[];
  metrics: DataBridgeMetrics;
  recommendations: string[];
  lastCheckTime: string;
}

export interface DataBridgeEvent {
  type: 'transfer' | 'backup' | 'restore' | 'validation' | 'error' | 'sync';
  timestamp: string;
  data: any;
  metadata?: Record<string, any>;
}

export type DataBridgeEventListener = (event: DataBridgeEvent) => void;

export interface IDataBridgeService {
  // Core operations
  validateData(data: any, rules: DataValidationRule[]): DataValidationResult;
  transferData(from: string, to: string, data: any, config?: DataTransferConfig): Promise<DataTransferResult>;
  
  // Backup & Recovery
  createBackup(dataType: string, data: any): Promise<DataBackupEntry>;
  restoreFromBackup(backupId: string): Promise<any>;
  listBackups(dataType?: string): Promise<DataBackupEntry[]>;
  cleanupExpiredBackups(): Promise<number>;
  
  // Audit & Monitoring
  logAction(action: DataAuditEntry['action'], dataType: string, metadata: Record<string, any>): Promise<void>;
  getAuditTrail(filters?: { startDate?: string; endDate?: string; userId?: string; action?: string }): Promise<DataAuditEntry[]>;
  
  // Health & Diagnostics
  performHealthCheck(): Promise<DataHealthReport>;
  getMetrics(): Promise<DataBridgeMetrics>;
  
  // Data Management
  exportData(options: DataExportOptions): Promise<Blob>;
  importData(data: any, options: DataImportOptions): Promise<DataTransferResult>;
  
  // Configuration
  updateConfig(config: Partial<DataBridgeConfig>): void;
  getConfig(): DataBridgeConfig;
  
  // Event System
  addEventListener(type: string, listener: DataBridgeEventListener): void;
  removeEventListener(type: string, listener: DataBridgeEventListener): void;
  emit(event: DataBridgeEvent): void;
  
  // Utility
  calculateChecksum(data: any): string;
  compressData(data: any): string;
  decompressData(compressed: string): any;
  encryptData(data: any): string;
  decryptData(encrypted: string): any;
}
