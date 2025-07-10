import { DataChange } from '@/types/sync';

class OfflineStorage {
  private dbName = 'eva_offline_db';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Основные таблицы данных
        if (!db.objectStoreNames.contains('symptom_entries')) {
          const symptomsStore = db.createObjectStore('symptom_entries', { keyPath: 'id' });
          symptomsStore.createIndex('user_id', 'user_id');
          symptomsStore.createIndex('entry_date', 'entry_date');
        }

        if (!db.objectStoreNames.contains('nutrition_entries')) {
          const nutritionStore = db.createObjectStore('nutrition_entries', { keyPath: 'id' });
          nutritionStore.createIndex('user_id', 'user_id');
          nutritionStore.createIndex('entry_date', 'entry_date');
        }

        if (!db.objectStoreNames.contains('community_posts')) {
          const postsStore = db.createObjectStore('community_posts', { keyPath: 'id' });
          postsStore.createIndex('author_id', 'author_id');
          postsStore.createIndex('created_at', 'created_at');
        }

        // Система синхронизации
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          queueStore.createIndex('timestamp', 'timestamp');
          queueStore.createIndex('table', 'table');
        }

        if (!db.objectStoreNames.contains('sync_metadata')) {
          db.createObjectStore('sync_metadata', { keyPath: 'key' });
        }

        // Кэш для статических данных
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry');
        }
      };
    });
  }

  // === ОСНОВНЫЕ CRUD ОПЕРАЦИИ ===
  async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string, indexName?: string, value?: any): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (indexName && value !== undefined) {
        const index = store.index(indexName);
        request = index.getAll(value);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === СИНХРОНИЗАЦИЯ ===
  async addToSyncQueue(change: DataChange): Promise<void> {
    await this.put('sync_queue', change);
  }

  async getSyncQueue(): Promise<DataChange[]> {
    return await this.getAll('sync_queue');
  }

  async removeFromSyncQueue(changeId: string): Promise<void> {
    await this.delete('sync_queue', changeId);
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // === МЕТАДАННЫЕ СИНХРОНИЗАЦИИ ===
  async setSyncMetadata(key: string, value: any): Promise<void> {
    await this.put('sync_metadata', { key, value, timestamp: Date.now() });
  }

  async getSyncMetadata(key: string): Promise<any> {
    const result = await this.get('sync_metadata', key);
    return result?.value;
  }

  // === КЭШИРОВАНИЕ ===
  async setCache(key: string, data: any, ttl: number = 3600000): Promise<void> {
    const expiry = Date.now() + ttl;
    await this.put('cache', { key, data, expiry });
  }

  async getCache(key: string): Promise<any> {
    const cached = await this.get('cache', key);
    if (!cached) return null;

    if (cached.expiry < Date.now()) {
      await this.delete('cache', key);
      return null;
    }

    return cached.data;
  }

  async clearExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiry');
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // === УТИЛИТЫ ===
  async getStorageSize(): Promise<number> {
    if (!navigator.storage?.estimate) return 0;
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const storeNames = Array.from(this.db.objectStoreNames);
    const transaction = this.db.transaction(storeNames, 'readwrite');

    await Promise.all(
      storeNames.map(storeName => 
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore(storeName).clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      )
    );
  }
}

// Singleton экземпляр
export const offlineStorage = new OfflineStorage();