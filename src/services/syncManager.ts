import { supabase } from '@/integrations/supabase/client';
import { offlineStorage } from './offlineStorage';
import { 
  DataChange, 
  DataConflict, 
  SyncResult, 
  SyncStatus, 
  SyncError, 
  BackupData,
  SyncConfig 
} from '@/types/sync';
import { toast } from 'sonner';

class SyncManager {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private syncConfig: SyncConfig = {
    autoSync: true,
    syncInterval: 30000, // 30 секунд
    retryAttempts: 3,
    batchSize: 50,
    conflictResolution: 'last_write_wins',
    priorityTables: ['symptom_entries', 'nutrition_entries', 'medical_events']
  };
  private eventListeners: Map<string, Function[]> = new Map();
  private syncInterval: number | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await offlineStorage.init();
    this.setupNetworkListeners();
    this.startAutoSync();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('status-change', this.getSyncStatusSync());
      if (this.syncConfig.autoSync) {
        this.syncAllData();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('status-change', this.getSyncStatusSync());
    });
  }

  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.syncConfig.autoSync) {
      this.syncInterval = window.setInterval(() => {
        if (this.isOnline && !this.syncInProgress) {
          this.syncAllData();
        }
      }, this.syncConfig.syncInterval);
    }
  }

  // === ОСНОВНАЯ СИНХРОНИЗАЦИЯ ===
  async syncAllData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    this.emit('sync-start');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result: SyncResult = {
        success: true,
        syncedTables: [],
        conflicts: [],
        errors: [],
        timestamp: Date.now(),
        totalChanges: 0,
        processedChanges: 0
      };

      // Синхронизируем приоритетные таблицы сначала
      const allTables = [...this.syncConfig.priorityTables];
      
      for (const table of allTables) {
        try {
          await this.syncTable(table, user.id);
          result.syncedTables.push(table);
        } catch (error) {
          result.errors.push({
            table,
            operation: 'sync',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          result.success = false;
        }
      }

      // Обрабатываем очередь локальных изменений
      await this.processQueue();

      await offlineStorage.setSyncMetadata('lastSync', Date.now());
      
      this.emit('sync-complete', result);
      return result;

    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        syncedTables: [],
        conflicts: [],
        errors: [{
          table: 'all',
          operation: 'sync',
          error: error instanceof Error ? error.message : 'Unknown error'
        }],
        timestamp: Date.now(),
        totalChanges: 0,
        processedChanges: 0
      };

      this.emit('sync-error', errorResult);
      return errorResult;
    } finally {
      this.syncInProgress = false;
      this.emit('sync-end');
    }
  }

  async syncTable(tableName: string, userId: string): Promise<void> {
    if (!this.isOnline) return;

    try {
      // Получаем последний timestamp синхронизации
      const lastSync = await offlineStorage.getSyncMetadata(`lastSync_${tableName}`) || 0;

      // Загружаем новые данные с сервера
      let query = supabase
        .from(tableName as any)
        .select('*')
        .eq('user_id', userId);

      if (lastSync > 0) {
        query = query.gt('updated_at', new Date(lastSync).toISOString());
      }

      const { data: remoteData, error } = await query;
      if (error) throw error;

      // Сохраняем в локальное хранилище
      if (remoteData) {
        for (const item of remoteData) {
          await offlineStorage.put(tableName, item);
        }
      }

      // Обновляем timestamp синхронизации
      await offlineStorage.setSyncMetadata(`lastSync_${tableName}`, Date.now());

    } catch (error) {
      console.error(`Error syncing table ${tableName}:`, error);
      throw error;
    }
  }

  // === УПРАВЛЕНИЕ ОЧЕРЕДЬЮ ===
  async queueLocalChanges(changes: DataChange[]): Promise<void> {
    for (const change of changes) {
      await offlineStorage.addToSyncQueue(change);
    }
    this.emit('queue-updated');
  }

  async processQueue(): Promise<void> {
    if (!this.isOnline) return;

    const queue = await offlineStorage.getSyncQueue();
    if (queue.length === 0) return;

    const batches = this.createBatches(queue, this.syncConfig.batchSize);

    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(changes: DataChange[]): Promise<void> {
    for (const change of changes) {
      try {
        await this.processChange(change);
        await offlineStorage.removeFromSyncQueue(change.id);
      } catch (error) {
        console.error('Error processing change:', error);
        // Оставляем в очереди для повторной попытки
      }
    }
  }

  private async processChange(change: DataChange): Promise<void> {
    let query: any;

    switch (change.operation) {
      case 'insert':
        query = supabase.from(change.table as any).insert(change.data);
        break;
      case 'update':
        query = supabase.from(change.table as any).update(change.data).eq('id', change.data.id);
        break;
      case 'delete':
        query = supabase.from(change.table as any).delete().eq('id', change.data.id);
        break;
    }

    const { error } = await query;
    if (error) throw error;
  }

  // === РАЗРЕШЕНИЕ КОНФЛИКТОВ ===
  async resolveConflicts(conflicts: DataConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      switch (this.syncConfig.conflictResolution) {
        case 'last_write_wins':
          await this.resolveLastWriteWins(conflict);
          break;
        case 'merge':
          await this.resolveMerge(conflict);
          break;
        case 'manual':
          // Сохраняем конфликт для пользователя
          await this.saveConflictForManualResolution(conflict);
          break;
      }
    }
  }

  private async resolveLastWriteWins(conflict: DataConflict): Promise<void> {
    const winner = conflict.localTimestamp > conflict.remoteTimestamp 
      ? conflict.local 
      : conflict.remote;

    await offlineStorage.put(conflict.table, winner);
    
    // Синхронизируем с сервером
    if (conflict.localTimestamp > conflict.remoteTimestamp) {
      await this.queueLocalChanges([{
        id: `conflict_${Date.now()}`,
        table: conflict.table,
        operation: 'update',
        data: winner,
        timestamp: Date.now(),
        userId: winner.user_id,
        local: true,
        synced: false
      }]);
    }
  }

  private async resolveMerge(conflict: DataConflict): Promise<void> {
    // Простая стратегия слияния - объединяем поля
    const merged = { ...conflict.remote, ...conflict.local };
    merged.updated_at = new Date().toISOString();

    await offlineStorage.put(conflict.table, merged);
    await this.queueLocalChanges([{
      id: `merge_${Date.now()}`,
      table: conflict.table,
      operation: 'update',
      data: merged,
      timestamp: Date.now(),
      userId: merged.user_id,
      local: true,
      synced: false
    }]);
  }

  private async saveConflictForManualResolution(conflict: DataConflict): Promise<void> {
    await offlineStorage.put('conflicts', {
      ...conflict,
      id: `conflict_${Date.now()}`,
      status: 'pending'
    });
  }

  // === СТАТУС И МОНИТОРИНГ ===
  async getSyncStatus(): Promise<SyncStatus> {
    const pendingChanges = (await offlineStorage.getSyncQueue()).length;
    const lastSync = await offlineStorage.getSyncMetadata('lastSync');

    return {
      isOnline: this.isOnline,
      lastSync,
      pendingChanges,
      isSyncing: this.syncInProgress,
      syncProgress: 0, // TODO: реализовать расчет прогресса
      errors: []
    };
  }

  private getSyncStatusSync(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: null,
      pendingChanges: 0,
      isSyncing: this.syncInProgress,
      syncProgress: 0,
      errors: []
    };
  }

  // === РЕЗЕРВНОЕ КОПИРОВАНИЕ ===
  async createBackup(userId: string): Promise<string> {
    const backupId = `backup_${userId}_${Date.now()}`;
    
    const data: Record<string, any[]> = {};
    const tables = ['symptom_entries', 'nutrition_entries', 'medical_events'];

    for (const table of tables) {
      data[table] = await offlineStorage.getAll(table, 'user_id', userId);
    }

    const backup: BackupData = {
      id: backupId,
      userId,
      data,
      timestamp: Date.now(),
      version: '1.0',
      checksum: this.calculateChecksum(data)
    };

    // Сохраняем локально
    await offlineStorage.put('backups', backup);

    // Загружаем в Supabase Storage
    if (this.isOnline) {
      try {
        const { error } = await supabase.storage
          .from('medical-records')
          .upload(`backups/${userId}/${backupId}.json`, JSON.stringify(backup));

        if (error) console.error('Error uploading backup:', error);
      } catch (error) {
        console.error('Error uploading backup:', error);
      }
    }

    return backupId;
  }

  async restoreFromBackup(userId: string, backupId: string): Promise<void> {
    let backup: BackupData | null = null;

    // Пытаемся загрузить из локального хранилища
    backup = await offlineStorage.get('backups', backupId);

    // Если нет локально, пытаемся загрузить с сервера
    if (!backup && this.isOnline) {
      try {
        const { data, error } = await supabase.storage
          .from('medical-records')
          .download(`backups/${userId}/${backupId}.json`);

        if (!error && data) {
          const text = await data.text();
          backup = JSON.parse(text);
        }
      } catch (error) {
        console.error('Error downloading backup:', error);
      }
    }

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Проверяем целостность
    if (this.calculateChecksum(backup.data) !== backup.checksum) {
      throw new Error('Backup is corrupted');
    }

    // Восстанавливаем данные
    for (const [table, records] of Object.entries(backup.data)) {
      for (const record of records) {
        await offlineStorage.put(table, record);
      }
    }

    toast.success('Данные успешно восстановлены из резервной копии');
  }

  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  // === КОНФИГУРАЦИЯ ===
  updateConfig(config: Partial<SyncConfig>): void {
    this.syncConfig = { ...this.syncConfig, ...config };
    if (config.autoSync !== undefined || config.syncInterval !== undefined) {
      this.startAutoSync();
    }
  }

  // === СОБЫТИЯ ===
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // === ОЧИСТКА ===
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.eventListeners.clear();
  }
}

// Singleton экземпляр
export const syncManager = new SyncManager();