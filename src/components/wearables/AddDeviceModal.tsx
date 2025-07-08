import React, { useState } from 'react';
import { WearableDevice } from '@/pages/patient/WearableDevices';
import { useAuth } from '@/context/AuthContext';

interface AddDeviceModalProps {
  onClose: () => void;
  onDeviceAdd: (device: WearableDevice) => void;
  isConnecting: boolean;
  onConnectingChange: (connecting: boolean) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  onClose,
  onDeviceAdd,
  isConnecting,
  onConnectingChange
}) => {
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [step, setStep] = useState<'brand' | 'details' | 'permissions' | 'connecting'>('brand');

  const supportedDevices = [
    {
      brand: 'apple',
      name: 'Apple Watch',
      icon: '⌚',
      description: 'Apple Watch Series 4+',
      dataTypes: ['heart_rate', 'sleep', 'steps', 'temperature', 'stress'],
      popularity: 'Очень популярно'
    },
    {
      brand: 'fitbit',
      name: 'Fitbit',
      icon: '📱',
      description: 'Fitbit Versa, Charge, Sense',
      dataTypes: ['heart_rate', 'sleep', 'steps', 'calories'],
      popularity: 'Популярно'
    },
    {
      brand: 'garmin',
      name: 'Garmin',
      icon: '🏃',
      description: 'Forerunner, Vivoactive, Fenix',
      dataTypes: ['heart_rate', 'sleep', 'steps', 'stress', 'calories'],
      popularity: 'Для спорта'
    },
    {
      brand: 'samsung',
      name: 'Samsung Galaxy Watch',
      icon: '📱',
      description: 'Galaxy Watch 4+, Galaxy Fit',
      dataTypes: ['heart_rate', 'sleep', 'steps', 'temperature'],
      popularity: 'Android'
    },
    {
      brand: 'xiaomi',
      name: 'Xiaomi Mi Band',
      icon: '⌚',
      description: 'Mi Band 6+, Mi Watch',
      dataTypes: ['heart_rate', 'sleep', 'steps'],
      popularity: 'Бюджетный'
    },
    {
      brand: 'polar',
      name: 'Polar',
      icon: '❤️',
      description: 'Ignite, Vantage, Grit X',
      dataTypes: ['heart_rate', 'sleep', 'stress', 'calories'],
      popularity: 'Для фитнеса'
    },
    {
      brand: 'oura',
      name: 'Oura Ring',
      icon: '💍',
      description: 'Oura Ring Gen 3',
      dataTypes: ['heart_rate', 'sleep', 'temperature', 'stress'],
      popularity: 'Премиум сон'
    },
    {
      brand: 'other',
      name: 'Другое устройство',
      icon: '📱',
      description: 'Другие совместимые устройства',
      dataTypes: ['heart_rate', 'sleep', 'steps'],
      popularity: ''
    }
  ];

  const connectDevice = async () => {
    onConnectingChange(true);
    setStep('connecting');

    try {
      // Имитация процесса подключения
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newDevice: WearableDevice = {
        id: Date.now().toString(),
        name: deviceName || `${selectedBrand} Device`,
        type: 'fitness_tracker',
        brand: selectedBrand as any,
        model: deviceModel || 'Unknown',
        connected: true,
        last_sync: new Date().toISOString(),
        data_types: selectedDataTypes,
        sync_frequency: 'daily',
        battery_level: Math.floor(Math.random() * 100)
      };

      // Генерируем тестовые данные для устройства
      generateMockWearableData(newDevice.id, user?.id);

      onDeviceAdd(newDevice);

    } catch (error) {
      console.error('Ошибка подключения устройства:', error);
    } finally {
      onConnectingChange(false);
    }
  };

  const generateMockWearableData = (deviceId: string, userId?: string) => {
    if (!userId) return;

    const mockData = [];
    const today = new Date();
    
    // Генерируем данные за последние 14 дней
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        device_id: deviceId,
        date: date.toISOString().split('T')[0],
        heart_rate: {
          resting: 65 + Math.floor(Math.random() * 20),
          average: 80 + Math.floor(Math.random() * 30),
          max: 140 + Math.floor(Math.random() * 40),
          variability: 30 + Math.floor(Math.random() * 30),
          stress_score: Math.floor(Math.random() * 100)
        },
        sleep: {
          total_minutes: 420 + Math.floor(Math.random() * 120),
          deep_sleep_minutes: 90 + Math.floor(Math.random() * 60),
          rem_sleep_minutes: 80 + Math.floor(Math.random() * 40),
          light_sleep_minutes: 200 + Math.floor(Math.random() * 60),
          awake_minutes: 20 + Math.floor(Math.random() * 40),
          sleep_efficiency: 75 + Math.floor(Math.random() * 20),
          bedtime: "22:30",
          wake_time: "07:00",
          sleep_score: 70 + Math.floor(Math.random() * 25)
        },
        activity: {
          steps: 5000 + Math.floor(Math.random() * 8000),
          distance_km: 3 + Math.random() * 7,
          calories_burned: 1800 + Math.floor(Math.random() * 800),
          active_minutes: 30 + Math.floor(Math.random() * 90),
          sedentary_minutes: 600 + Math.floor(Math.random() * 300),
          floors_climbed: Math.floor(Math.random() * 15)
        },
        body_metrics: {
          skin_temperature: 36.2 + Math.random() * 1.5,
          body_temperature: 36.5 + Math.random() * 0.8,
          temperature_variation: Math.random() * 0.5,
          stress_level: Math.floor(Math.random() * 100),
          energy_level: Math.floor(Math.random() * 100)
        },
        created_at: new Date().toISOString()
      });
    }

    localStorage.setItem(`wearable_data_${userId}`, JSON.stringify(mockData));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-playfair font-bold gentle-text">
            {step === 'brand' ? 'Выберите устройство' :
             step === 'details' ? 'Детали устройства' :
             step === 'permissions' ? 'Разрешения' : 'Подключение...'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl interactive-hover"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          
          {step === 'brand' && (
            <div className="space-y-4">
              <p className="soft-text mb-6">
                Выберите ваше носимое устройство для подключения к платформе Eva
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedDevices.map(device => (
                  <button
                    key={device.brand}
                    onClick={() => {
                      setSelectedBrand(device.brand);
                      setDeviceName(device.name);
                      setSelectedDataTypes(device.dataTypes);
                      if (device.brand !== 'other') {
                        setStep('permissions');
                      } else {
                        setStep('details');
                      }
                    }}
                    className="text-left p-4 border-2 border-bloom-caramel/20 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors interactive-hover"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{device.icon}</span>
                      <div>
                        <div className="font-semibold gentle-text">{device.name}</div>
                        {device.popularity && (
                          <div className="text-xs text-primary font-medium">
                            {device.popularity}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm soft-text">{device.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Название устройства
                </label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="Например: Мои Apple Watch"
                  className="w-full p-3 border border-bloom-caramel/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Модель устройства
                </label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="Например: Series 8, Mi Band 7"
                  className="w-full p-3 border border-bloom-caramel/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium gentle-text mb-2">
                  Какие данные отслеживает ваше устройство?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'heart_rate', label: 'Пульс', icon: '❤️' },
                    { id: 'sleep', label: 'Сон', icon: '😴' },
                    { id: 'steps', label: 'Шаги', icon: '👣' },
                    { id: 'temperature', label: 'Температура', icon: '🌡️' },
                    { id: 'stress', label: 'Стресс', icon: '😰' },
                    { id: 'calories', label: 'Калории', icon: '🔥' }
                  ].map(dataType => (
                    <label 
                      key={dataType.id}
                      className="flex items-center p-3 border border-bloom-caramel/20 rounded-lg cursor-pointer hover:bg-bloom-vanilla interactive-hover"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDataTypes.includes(dataType.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDataTypes([...selectedDataTypes, dataType.id]);
                          } else {
                            setSelectedDataTypes(selectedDataTypes.filter(t => t !== dataType.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <span className="mr-2">{dataType.icon}</span>
                      <span className="text-sm">{dataType.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('brand')}
                  className="flex-1 bg-bloom-vanilla text-gentle py-3 px-4 rounded-lg hover:bg-bloom-warm-cream transition-colors interactive-hover"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setStep('permissions')}
                  disabled={selectedDataTypes.length === 0}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 interactive-hover"
                >
                  Далее →
                </button>
              </div>
            </div>
          )}

          {step === 'permissions' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🔒</span>
                  <div>
                    <h3 className="font-semibold text-blue-800">Разрешения на доступ к данным</h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Eva запросит доступ к следующим данным с вашего устройства
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {selectedDataTypes.map(dataType => (
                  <div key={dataType} className="flex items-center justify-between p-3 bg-bloom-vanilla rounded-lg">
                    <div className="flex items-center">
                      <span className="mr-3">{getDataTypeIcon(dataType)}</span>
                      <div>
                        <div className="font-medium gentle-text">{getDataTypeLabel(dataType)}</div>
                        <div className="text-sm soft-text">
                          {getDataTypeDescription(dataType)}
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600">✓</div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-lg mr-2">🛡️</span>
                  <div className="text-sm text-green-800">
                    <strong>Ваша конфиденциальность защищена:</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Данные шифруются перед отправкой</li>
                      <li>Используются только для анализа симптомов менопаузы</li>
                      <li>Никогда не передаются третьим лицам</li>
                      <li>Вы можете отключить доступ в любой момент</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(selectedBrand === 'other' ? 'details' : 'brand')}
                  className="flex-1 bg-bloom-vanilla text-gentle py-3 px-4 rounded-lg hover:bg-bloom-warm-cream transition-colors interactive-hover"
                >
                  ← Назад
                </button>
                <button
                  onClick={connectDevice}
                  className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors interactive-hover"
                >
                  🔗 Подключить устройство
                </button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="text-center py-8">
              <div className="animate-spin text-6xl mb-4">⌚</div>
              <h3 className="text-xl font-semibold gentle-text mb-2">
                Подключаем ваше устройство...
              </h3>
              <p className="soft-text mb-6">
                Это может занять несколько секунд
              </p>
              <div className="bg-bloom-vanilla rounded-full h-2 max-w-xs mx-auto">
                <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '70%'}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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

const getDataTypeDescription = (type: string) => {
  switch (type) {
    case 'heart_rate': return 'Пульс в покое и вариабельность ритма';
    case 'sleep': return 'Фазы сна, продолжительность, качество';
    case 'steps': return 'Ежедневная активность и калории';
    case 'temperature': return 'Температура тела и кожи';
    case 'stress': return 'Уровень стресса на основе ВСР';
    case 'calories': return 'Сожженные калории и метаболизм';
    default: return 'Дополнительные метрики здоровья';
  }
};