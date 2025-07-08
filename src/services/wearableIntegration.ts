// Мок-сервис для имитации данных носимых устройств
import { format, subDays } from 'date-fns';
import { healthDataAggregator, WearableData } from './healthDataAggregator';

export interface WearableDeviceInfo {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'health_monitor';
  brand: 'apple' | 'fitbit' | 'garmin' | 'samsung' | 'mock';
  isConnected: boolean;
  lastSync?: string;
  capabilities: string[];
}

class WearableIntegrationService {
  private static instance: WearableIntegrationService;
  private readonly DEVICES_KEY = 'eva_wearable_devices';
  private readonly LAST_SYNC_KEY = 'eva_last_wearable_sync';

  static getInstance(): WearableIntegrationService {
    if (!WearableIntegrationService.instance) {
      WearableIntegrationService.instance = new WearableIntegrationService();
    }
    return WearableIntegrationService.instance;
  }

  // Получение списка подключенных устройств
  getConnectedDevices(): WearableDeviceInfo[] {
    try {
      const stored = localStorage.getItem(this.DEVICES_KEY);
      if (!stored) {
        // Создаем мок-устройство при первом запуске
        const mockDevices = this.createMockDevices();
        this.saveDevices(mockDevices);
        return mockDevices;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading devices:', error);
      return this.createMockDevices();
    }
  }

  // Создание мок-устройств
  private createMockDevices(): WearableDeviceInfo[] {
    return [
      {
        id: 'mock_apple_watch',
        name: 'Apple Watch Series 9',
        type: 'smartwatch',
        brand: 'apple',
        isConnected: true,
        lastSync: new Date().toISOString(),
        capabilities: ['steps', 'heartRate', 'sleep', 'calories', 'stress']
      },
      {
        id: 'mock_fitbit',
        name: 'Fitbit Charge 5',
        type: 'fitness_tracker',
        brand: 'fitbit',
        isConnected: false,
        capabilities: ['steps', 'heartRate', 'sleep', 'calories']
      }
    ];
  }

  // Сохранение устройств
  private saveDevices(devices: WearableDeviceInfo[]): void {
    try {
      localStorage.setItem(this.DEVICES_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving devices:', error);
    }
  }

  // Подключение устройства
  connectDevice(deviceId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const devices = this.getConnectedDevices();
        const deviceIndex = devices.findIndex(d => d.id === deviceId);
        
        if (deviceIndex >= 0) {
          devices[deviceIndex].isConnected = true;
          devices[deviceIndex].lastSync = new Date().toISOString();
          this.saveDevices(devices);
          
          // Начинаем синхронизацию данных
          this.syncDeviceData(devices[deviceIndex]);
          
          console.log(`Device ${deviceId} connected successfully`);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1500); // Имитация времени подключения
    });
  }

  // Отключение устройства
  disconnectDevice(deviceId: string): void {
    const devices = this.getConnectedDevices();
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    
    if (deviceIndex >= 0) {
      devices[deviceIndex].isConnected = false;
      this.saveDevices(devices);
      console.log(`Device ${deviceId} disconnected`);
    }
  }

  // Синхронизация данных устройства
  async syncDeviceData(device: WearableDeviceInfo): Promise<void> {
    if (!device.isConnected) {
      console.warn(`Device ${device.id} is not connected`);
      return;
    }

    console.log(`Starting sync for device: ${device.name}`);
    
    try {
      // Генерируем данные за последние 7 дней
      const days = 7;
      for (let i = 0; i < days; i++) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const mockData = this.generateMockDataForDate(date, device);
        
        if (mockData) {
          healthDataAggregator.addWearableData(mockData);
        }
      }

      // Обновляем время последней синхронизации
      const devices = this.getConnectedDevices();
      const deviceIndex = devices.findIndex(d => d.id === device.id);
      if (deviceIndex >= 0) {
        devices[deviceIndex].lastSync = new Date().toISOString();
        this.saveDevices(devices);
      }

      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      console.log(`Sync completed for device: ${device.name}`);
      
    } catch (error) {
      console.error(`Error syncing device ${device.name}:`, error);
    }
  }

  // Генерация мок-данных для конкретной даты
  private generateMockDataForDate(date: string, device: WearableDeviceInfo): Omit<WearableData, 'id' | 'timestamp'> | null {
    // Базовые значения для реалистичности
    const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
    const daysSinceToday = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    // Добавляем некоторую случайность, но с реалистичными паттернами
    const baseSteps = isWeekend ? 6000 : 8500;
    const variation = (Math.random() - 0.5) * 0.3; // ±15% вариация
    
    const mockData: Omit<WearableData, 'id' | 'timestamp'> = {
      date,
      source: device.brand === 'apple' ? 'apple_health' : 'fitbit'
    };

    // Генерируем данные в зависимости от возможностей устройства
    if (device.capabilities.includes('steps')) {
      mockData.steps = Math.round(baseSteps * (1 + variation));
    }

    if (device.capabilities.includes('sleep')) {
      const baseSleep = isWeekend ? 8.2 : 7.1;
      mockData.sleepHours = Math.round((baseSleep * (1 + variation * 0.5)) * 10) / 10;
      mockData.sleepQuality = Math.min(5, Math.max(1, Math.round(4 + variation)));
    }

    if (device.capabilities.includes('heartRate')) {
      mockData.heartRateResting = Math.round(65 + variation * 10);
      mockData.heartRateAvg = Math.round(85 + variation * 15);
      mockData.heartRateMax = Math.round(150 + variation * 25);
    }

    if (device.capabilities.includes('calories')) {
      mockData.caloriesBurned = Math.round(2200 * (1 + variation * 0.3));
    }

    if (device.capabilities.includes('stress')) {
      // Стресс коррелирует с днем недели и качеством сна
      let baseStress = isWeekend ? 2 : 3.5;
      if (mockData.sleepHours && mockData.sleepHours < 7) {
        baseStress += 1;
      }
      mockData.stressLevel = Math.min(5, Math.max(1, Math.round(baseStress + variation)));
    }

    // Активные минуты зависят от шагов
    if (mockData.steps) {
      mockData.activeMinutes = Math.round(mockData.steps / 120); // примерно 120 шагов в минуту
    }

    console.log(`Generated mock data for ${date}:`, mockData);
    return mockData;
  }

  // Автоматическая синхронизация раз в день
  setupAutoSync(): void {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let shouldSync = true;
    if (lastSync) {
      const lastSyncDate = new Date(lastSync);
      shouldSync = lastSyncDate < oneDayAgo;
    }

    if (shouldSync) {
      console.log('Starting automatic wearable data sync...');
      const connectedDevices = this.getConnectedDevices().filter(d => d.isConnected);
      
      connectedDevices.forEach(device => {
        this.syncDeviceData(device);
      });
    } else {
      console.log('Wearable data is up to date, skipping sync');
    }
  }

  // Получение последних данных
  getLatestData(days: number = 7): WearableData[] {
    const data = healthDataAggregator.getAllData();
    const cutoffDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    return data.wearables
      .filter(w => w.date >= cutoffDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Статистика по устройствам
  getDeviceStats(): {
    connectedDevices: number;
    totalDevices: number;
    lastSyncTime?: string;
    dataPointsToday: number;
  } {
    const devices = this.getConnectedDevices();
    const connected = devices.filter(d => d.isConnected);
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    
    const todayData = this.getLatestData(1);
    
    return {
      connectedDevices: connected.length,
      totalDevices: devices.length,
      lastSyncTime: lastSync || undefined,
      dataPointsToday: todayData.length
    };
  }
}

export const wearableIntegration = WearableIntegrationService.getInstance();