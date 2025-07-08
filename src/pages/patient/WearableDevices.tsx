import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { WearableDevicesContent } from '@/components/wearables/WearableDevicesContent';
import { WearableDataContent } from '@/components/wearables/WearableDataContent';
import { WearableInsightsContent } from '@/components/wearables/WearableInsightsContent';
import { PatientLayout } from '@/components/layout/PatientLayout';

interface WearableDevice {
  id: string;
  name: string;
  type: 'fitness_tracker' | 'smartwatch' | 'health_monitor' | 'sleep_tracker';
  brand: 'fitbit' | 'apple' | 'garmin' | 'samsung' | 'xiaomi' | 'polar' | 'oura' | 'other';
  model: string;
  connected: boolean;
  last_sync: string | null;
  data_types: string[]; // ['heart_rate', 'sleep', 'steps', 'temperature']
  sync_frequency: 'realtime' | 'hourly' | 'daily';
  battery_level?: number;
}

export interface WearableData {
  device_id: string;
  date: string;
  heart_rate: {
    resting: number;
    average: number;
    max: number;
    variability: number; // HRV
    stress_score?: number;
  };
  sleep: {
    total_minutes: number;
    deep_sleep_minutes: number;
    rem_sleep_minutes: number;
    light_sleep_minutes: number;
    awake_minutes: number;
    sleep_efficiency: number; // %
    bedtime: string;
    wake_time: string;
    sleep_score?: number;
  };
  activity: {
    steps: number;
    distance_km: number;
    calories_burned: number;
    active_minutes: number;
    sedentary_minutes: number;
    floors_climbed?: number;
  };
  body_metrics: {
    skin_temperature?: number;
    body_temperature?: number;
    temperature_variation?: number;
    stress_level?: number;
    energy_level?: number;
  };
  menstrual_cycle?: {
    cycle_day?: number;
    phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
    predicted_period?: string;
  };
  created_at: string;
}

export type { WearableDevice };

export default function WearableDevices() {
  const { user } = useAuth();
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>([]);
  const [wearableData, setWearableData] = useState<WearableData[]>([]);
  const [activeTab, setActiveTab] = useState<'devices' | 'data' | 'insights'>('devices');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadConnectedDevices();
    loadWearableData();
  }, [user?.id]);

  const loadConnectedDevices = () => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`wearable_devices_${user.id}`);
    if (saved) {
      setConnectedDevices(JSON.parse(saved));
    }
  };

  const loadWearableData = () => {
    if (!user?.id) return;
    const saved = localStorage.getItem(`wearable_data_${user.id}`);
    if (saved) {
      setWearableData(JSON.parse(saved));
    }
  };

  const saveDevices = (devices: WearableDevice[]) => {
    if (!user?.id) return;
    setConnectedDevices(devices);
    localStorage.setItem(`wearable_devices_${user.id}`, JSON.stringify(devices));
  };

  return (
    <PatientLayout 
      title="Носимые устройства | Eva"
      breadcrumbs={[
        { label: 'Главная', href: '/patient/dashboard' },
        { label: 'Носимые устройства', href: '/patient/wearables' }
      ]}
    >
      <div className="space-y-6">
        
        {/* Заголовок */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            ⌚ Носимые устройства
          </h1>
          <p className="soft-text">
            Подключите носимые устройства для автоматического мониторинга здоровья
          </p>
        </div>

        {/* Табы */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-1">
          <div className="flex max-w-md">
            {(['devices', 'data', 'insights'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === tab
                    ? "bg-primary text-white shadow-md"
                    : "text-gentle hover:bg-bloom-vanilla"
                )}
              >
                {tab === 'devices' ? '📱 Устройства' : 
                 tab === 'data' ? '📊 Данные' : '🧠 Инсайты'}
              </button>
            ))}
          </div>
        </div>

        {/* Контент по табам */}
        {activeTab === 'devices' && (
          <WearableDevicesContent 
            devices={connectedDevices}
            onDevicesUpdate={saveDevices}
            isConnecting={isConnecting}
            onConnectingChange={setIsConnecting}
          />
        )}

        {activeTab === 'data' && (
          <WearableDataContent 
            data={wearableData}
            devices={connectedDevices}
          />
        )}

        {activeTab === 'insights' && (
          <WearableInsightsContent 
            data={wearableData}
            devices={connectedDevices}
          />
        )}
      </div>
    </PatientLayout>
  );
}