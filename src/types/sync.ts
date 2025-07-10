export interface DataChange {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: number;
  userId: string;
  local: boolean;
  synced: boolean;
}

export interface DataConflict {
  id: string;
  table: string;
  local: any;
  remote: any;
  localTimestamp: number;
  remoteTimestamp: number;
  conflictType: 'update_update' | 'update_delete' | 'delete_update';
}

export interface SyncResult {
  success: boolean;
  syncedTables: string[];
  conflicts: DataConflict[];
  errors: SyncError[];
  timestamp: number;
  totalChanges: number;
  processedChanges: number;
}

export interface SyncError {
  table: string;
  operation: string;
  error: string;
  data?: any;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingChanges: number;
  isSimcing: boolean;
  syncProgress: number;
  errors: SyncError[];
}

export interface BackupData {
  id: string;
  userId: string;
  data: Record<string, any[]>;
  timestamp: number;
  version: string;
  checksum: string;
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  retryAttempts: number;
  batchSize: number;
  conflictResolution: 'last_write_wins' | 'manual' | 'merge';
  priorityTables: string[];
}