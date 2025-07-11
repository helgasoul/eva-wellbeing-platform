import React, { useState } from 'react';
import { WearableDevice } from '@/pages/patient/WearableDevices';
import { AddDeviceModal } from './AddDeviceModal';

interface WearableDevicesContentProps {
  devices: WearableDevice[];
  onDevicesUpdate: (devices: WearableDevice[]) => void;
  isConnecting: boolean;
  onConnectingChange: (connecting: boolean) => void;
}

export const WearableDevicesContent: React.FC<WearableDevicesContentProps> = ({
  devices,
  onDevicesUpdate,
  isConnecting,
  onConnectingChange
}) => {
  const [showAddDevice, setShowAddDevice] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Статистика подключений */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{devices.length}</div>
              <div className="text-sm soft-text">Подключено устройств</div>
            </div>
          </div>
        </div>

        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <span className="text-2xl">🔗</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.connected).length}
              </div>
              <div className="text-sm soft-text">Активных</div>
            </div>
          </div>
        </div>

        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {devices.reduce((acc, d) => acc + d.data_types.length, 0)}
              </div>
              <div className="text-sm soft-text">Типов данных</div>
            </div>
          </div>
        </div>

        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <span className="text-2xl">🔄</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {devices.filter(d => d.last_sync && 
                  new Date(d.last_sync) > new Date(Date.now() - 24*60*60*1000)
                ).length}
              </div>
              <div className="text-sm soft-text">Синхронизировано сегодня</div>
            </div>
          </div>
        </div>
      </div>

      {/* Подключенные устройства */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-playfair font-bold gentle-text">Мои устройства</h2>
          <button
            onClick={() => setShowAddDevice(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2 interactive-hover"
          >
            <span>➕</span>
            <span>Добавить устройство</span>
          </button>
        </div>

        {devices.length === 0 ? (
          <NoDevicesState onAddDevice={() => setShowAddDevice(true)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map(device => (
              <DeviceCard 
                key={device.id}
                device={device}
                onDeviceUpdate={(updatedDevice) => {
                  const updated = devices.map(d => 
                    d.id === updatedDevice.id ? updatedDevice : d
                  );
                  onDevicesUpdate(updated);
                }}
                onDeviceRemove={(deviceId) => {
                  const updated = devices.filter(d => d.id !== deviceId);
                  onDevicesUpdate(updated);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Рекомендуемые устройства */}
      <RecommendedDevicesSection />

      {/* Модальное окно добавления устройства */}
      {showAddDevice && (
        <AddDeviceModal
          onClose={() => setShowAddDevice(false)}
          onDeviceAdd={(newDevice) => {
            onDevicesUpdate([...devices, newDevice]);
            setShowAddDevice(false);
          }}
          isConnecting={isConnecting}
          onConnectingChange={onConnectingChange}
        />
      )}
    </div>
  );
};

// Компонент состояния "нет устройств"
const NoDevicesState = ({ onAddDevice }: { onAddDevice: () => void }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4 animate-gentle-float">⌚</div>
    <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
      Нет подключенных устройств
    </h3>
    <p className="soft-text mb-6 max-w-md mx-auto">
      Подключите фитнес-трекер или смарт-часы для автоматического 
      отслеживания сна, активности и других показателей здоровья
    </p>
    <button
      onClick={onAddDevice}
      className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors interactive-hover"
    >
      🔗 Подключить первое устройство
    </button>
  </div>
);

// Карточка устройства
const DeviceCard = ({ 
  device, 
  onDeviceUpdate, 
  onDeviceRemove 
}: { 
  device: WearableDevice;
  onDeviceUpdate: (device: WearableDevice) => void;
  onDeviceRemove: (deviceId: string) => void;
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const getDeviceIcon = (brand: string) => {
    switch (brand) {
      case 'apple': return '⌚';
      case 'fitbit': return '📱';
      case 'garmin': return '🏃';
      case 'samsung': return '📱';
      case 'xiaomi': return '⌚';
      case 'polar': return '❤️';
      case 'oura': return '💍';
      default: return '📱';
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'apple': return 'from-gray-600 to-gray-800';
      case 'fitbit': return 'from-green-500 to-green-700';
      case 'garmin': return 'from-blue-500 to-blue-700';
      case 'samsung': return 'from-blue-600 to-purple-600';
      case 'xiaomi': return 'from-orange-500 to-red-500';
      case 'polar': return 'from-red-500 to-pink-500';
      case 'oura': return 'from-purple-600 to-indigo-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const syncDevice = async () => {
    setIsSyncing(true);
    try {
      // Имитация синхронизации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedDevice = {
        ...device,
        last_sync: new Date().toISOString(),
        connected: true
      };
      onDeviceUpdate(updatedDevice);
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const getLastSyncText = () => {
    if (!device.last_sync) return 'Никогда';
    
    const lastSync = new Date(device.last_sync);
    const now = new Date();
    const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'Только что';
    if (diffHours < 24) return `${Math.floor(diffHours)} ч назад`;
    return `${Math.floor(diffHours / 24)} дн назад`;
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-4 hover:shadow-md transition-shadow">
      
      {/* Заголовок устройства */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`bg-gradient-to-br ${getBrandColor(device.brand)} p-2 rounded-lg mr-3`}>
            <span className="text-white text-lg">{getDeviceIcon(device.brand)}</span>
          </div>
          <div>
            <div className="font-semibold gentle-text">{device.name}</div>
            <div className="text-sm soft-text capitalize">{device.brand} {device.model}</div>
          </div>
        </div>
        
        {/* Статус подключения */}
        <div className={`w-3 h-3 rounded-full ${
          device.connected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {/* Типы данных */}
      <div className="mb-4">
        <div className="text-sm font-medium gentle-text mb-2">Отслеживает:</div>
        <div className="flex flex-wrap gap-1">
          {device.data_types.map(type => (
            <span 
              key={type}
              className="bg-primary/10 text-primary px-2 py-1 rounded text-xs"
            >
              {getDataTypeIcon(type)} {getDataTypeLabel(type)}
            </span>
          ))}
        </div>
      </div>

      {/* Батарея */}
      {device.battery_level && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="soft-text">🔋 Батарея</span>
            <span className={`font-medium ${
              device.battery_level > 20 ? 'text-green-600' : 'text-red-600'
            }`}>
              {device.battery_level}%
            </span>
          </div>
          <div className="w-full bg-bloom-vanilla rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${
                device.battery_level > 20 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${device.battery_level}%` }}
            />
          </div>
        </div>
      )}

      {/* Последняя синхронизация */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="soft-text">🔄 Синхронизация</span>
          <span className="gentle-text">{getLastSyncText()}</span>
        </div>
      </div>

      {/* Действия */}
      <div className="flex space-x-2">
        <button
          onClick={syncDevice}
          disabled={isSyncing}
          className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm interactive-hover"
        >
          {isSyncing ? 'Синхронизация...' : '🔄 Синхронизировать'}
        </button>
        
        <button
          onClick={() => onDeviceRemove(device.id)}
          className="bg-destructive text-destructive-foreground p-2 rounded-lg hover:bg-destructive/90 transition-colors interactive-hover"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

// Рекомендуемые устройства
const RecommendedDevicesSection = () => (
  <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
    <h3 className="text-lg font-playfair font-semibold gentle-text mb-4">
      💡 Рекомендуемые устройства для менопаузы
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
          name: 'Oura Ring',
          description: 'Точное отслеживание температуры тела и фаз сна',
          price: 'от $299',
          rating: 4.8,
          specialFeatures: ['Температура тела', 'HRV', 'Качество сна']
        },
        {
          name: 'Apple Watch Series 9',
          description: 'Комплексный мониторинг здоровья женщин',
          price: 'от $399',
          rating: 4.7,
          specialFeatures: ['Цикл овуляции', 'ЭКГ', 'Уровень кислорода']
        },
        {
          name: 'Fitbit Sense 2',
          description: 'Управление стрессом и отслеживание настроения',
          price: 'от $249',
          rating: 4.5,
          specialFeatures: ['Стресс-менеджмент', 'GPS', 'Музыка']
        }
      ].map((device, index) => (
        <div key={index} className="border border-bloom-caramel/20 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold gentle-text">{device.name}</div>
              <div className="text-sm text-primary font-medium">{device.price}</div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-yellow-500">⭐</span>
              <span className="ml-1 soft-text">{device.rating}</span>
            </div>
          </div>
          
          <p className="text-sm soft-text mb-3">{device.description}</p>
          
          <div className="space-y-1">
            {device.specialFeatures.map((feature, featureIndex) => (
              <div key={featureIndex} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block mr-1">
                {feature}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Вспомогательные функции
const getDataTypeIcon = (type: string) => {
  switch (type) {
    case 'heart_rate': return '❤️';
    case 'sleep': return '😴';
    case 'steps': return '👣';
    case 'temperature': return '🌡️';
    case 'stress': return '😰';
    case 'calories': return '🔥';
    default: return '📊';
  }
};

const getDataTypeLabel = (type: string) => {
  switch (type) {
    case 'heart_rate': return 'Пульс';
    case 'sleep': return 'Сон';
    case 'steps': return 'Шаги';
    case 'temperature': return 'Температура';
    case 'stress': return 'Стресс';
    case 'calories': return 'Калории';
    default: return type;
  }
};