import React, { useState } from 'react';
import { WearableData, WearableDevice } from '@/pages/patient/WearableDevices';

interface WearableDataContentProps {
  data: WearableData[];
  devices: WearableDevice[];
}

export const WearableDataContent: React.FC<WearableDataContentProps> = ({
  data,
  devices
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'sleep' | 'heart_rate' | 'activity' | 'temperature'>('sleep');

  if (devices.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-gentle-float">📊</div>
          <h3 className="text-xl font-playfair font-semibold gentle-text mb-2">
            Нет данных для отображения
          </h3>
          <p className="soft-text">
            Подключите устройство на вкладке "Устройства" для просмотра данных
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Фильтры */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Период:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
              className="border border-bloom-caramel/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="week">Неделя</option>
              <option value="month">Месяц</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Метрика:</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="border border-bloom-caramel/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="sleep">😴 Сон</option>
              <option value="heart_rate">❤️ Пульс</option>
              <option value="activity">👣 Активность</option>
              <option value="temperature">🌡️ Температура</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ключевые метрики */}
      <WearableMetricsOverview data={data} period={selectedPeriod} />

      {/* График выбранной метрики */}
      <WearableMetricChart 
        data={data} 
        metric={selectedMetric} 
        period={selectedPeriod} 
      />

      {/* Детальная таблица */}
      <WearableDataTable data={data} period={selectedPeriod} />
    </div>
  );
};

// Компонент обзора метрик
const WearableMetricsOverview = ({ 
  data, 
  period 
}: { 
  data: WearableData[]; 
  period: 'week' | 'month';
}) => {
  const daysToAnalyze = period === 'week' ? 7 : 30;
  const recentData = data.slice(-daysToAnalyze);

  if (recentData.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="soft-text">Нет данных за выбранный период</p>
        </div>
      </div>
    );
  }

  const avgSleep = recentData.reduce((sum, d) => sum + (d.sleep?.total_minutes || 0), 0) / recentData.length / 60;
  const avgSteps = recentData.reduce((sum, d) => sum + (d.activity?.steps || 0), 0) / recentData.length;
  const avgHeartRate = recentData.reduce((sum, d) => sum + (d.heart_rate?.resting || 0), 0) / recentData.length;
  const avgSleepEfficiency = recentData.reduce((sum, d) => sum + (d.sleep?.sleep_efficiency || 0), 0) / recentData.length;

  const metrics = [
    {
      title: 'Среднее время сна',
      value: `${avgSleep.toFixed(1)} ч`,
      icon: '😴',
      status: avgSleep >= 7 ? 'good' : avgSleep >= 6 ? 'warning' : 'poor',
      target: '7-9 часов'
    },
    {
      title: 'Средние шаги',
      value: Math.round(avgSteps).toLocaleString(),
      icon: '👣',
      status: avgSteps >= 8000 ? 'good' : avgSteps >= 5000 ? 'warning' : 'poor',
      target: '8000+ шагов'
    },
    {
      title: 'Пульс в покое',
      value: `${Math.round(avgHeartRate)} уд/мин`,
      icon: '❤️',
      status: avgHeartRate <= 70 ? 'good' : avgHeartRate <= 80 ? 'warning' : 'poor',
      target: '60-70 уд/мин'
    },
    {
      title: 'Эффективность сна',
      value: `${Math.round(avgSleepEfficiency)}%`,
      icon: '🎯',
      status: avgSleepEfficiency >= 85 ? 'good' : avgSleepEfficiency >= 75 ? 'warning' : 'poor',
      target: '85%+'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h2 className="text-xl font-playfair font-bold gentle-text mb-6">
        📊 Обзор за {period === 'week' ? 'неделю' : 'месяц'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className={`border-2 rounded-xl p-4 ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <div className={`w-3 h-3 rounded-full ${
                metric.status === 'good' ? 'bg-green-500' :
                metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            
            <div className="text-2xl font-bold mb-1">{metric.value}</div>
            <div className="text-sm font-medium mb-1">{metric.title}</div>
            <div className="text-xs opacity-75">Цель: {metric.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Простой график метрик
const WearableMetricChart = ({ 
  data, 
  metric, 
  period 
}: { 
  data: WearableData[]; 
  metric: string;
  period: 'week' | 'month';
}) => {
  const daysToShow = period === 'week' ? 7 : 30;
  const chartData = data.slice(-daysToShow);

  const getMetricValue = (item: WearableData) => {
    switch (metric) {
      case 'sleep':
        return item.sleep?.total_minutes / 60 || 0;
      case 'heart_rate':
        return item.heart_rate?.resting || 0;
      case 'activity':
        return item.activity?.steps || 0;
      case 'temperature':
        return item.body_metrics?.body_temperature || 0;
      default:
        return 0;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'sleep': return 'Время сна (часы)';
      case 'heart_rate': return 'Пульс в покое (уд/мин)';
      case 'activity': return 'Количество шагов';
      case 'temperature': return 'Температура тела (°C)';
      default: return '';
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📈</div>
          <p className="soft-text">Нет данных для построения графика</p>
        </div>
      </div>
    );
  }

  const values = chartData.map(getMetricValue);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h3 className="text-lg font-playfair font-semibold gentle-text mb-4">
        {getMetricLabel()}
      </h3>
      
      <div className="h-48 flex items-end justify-between space-x-1">
        {chartData.map((item, index) => {
          const value = getMetricValue(item);
          const height = maxValue > minValue ? ((value - minValue) / (maxValue - minValue)) * 100 : 50;
          const date = new Date(item.date);
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="bg-primary rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-primary/80"
                style={{ height: `${Math.max(height, 8)}%` }}
                title={`${date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}: ${value.toFixed(1)}`}
              />
              <div className="text-xs soft-text mt-2 transform rotate-45 origin-bottom-left">
                {date.getDate()}/{date.getMonth() + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Таблица с данными
const WearableDataTable = ({ 
  data, 
  period 
}: { 
  data: WearableData[]; 
  period: 'week' | 'month';
}) => {
  const daysToShow = period === 'week' ? 7 : 30;
  const tableData = data.slice(-daysToShow).reverse();

  if (tableData.length === 0) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="soft-text">Нет данных для отображения в таблице</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
      <h3 className="text-lg font-playfair font-semibold gentle-text mb-4">
        Детальные данные
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bloom-caramel/20">
              <th className="text-left py-2 font-medium gentle-text">Дата</th>
              <th className="text-left py-2 font-medium gentle-text">😴 Сон</th>
              <th className="text-left py-2 font-medium gentle-text">❤️ Пульс</th>
              <th className="text-left py-2 font-medium gentle-text">👣 Шаги</th>
              <th className="text-left py-2 font-medium gentle-text">🌡️ Температура</th>
              <th className="text-left py-2 font-medium gentle-text">💪 Активность</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index} className="border-b border-bloom-caramel/10 hover:bg-bloom-vanilla">
                <td className="py-3 gentle-text">
                  {new Date(item.date).toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </td>
                <td className="py-3 soft-text">
                  {item.sleep ? `${Math.round(item.sleep.total_minutes / 60)}ч ${item.sleep.total_minutes % 60}м` : '-'}
                </td>
                <td className="py-3 soft-text">
                  {item.heart_rate ? `${item.heart_rate.resting} уд/мин` : '-'}
                </td>
                <td className="py-3 soft-text">
                  {item.activity ? item.activity.steps.toLocaleString() : '-'}
                </td>
                <td className="py-3 soft-text">
                  {item.body_metrics?.body_temperature ? `${item.body_metrics.body_temperature.toFixed(1)}°C` : '-'}
                </td>
                <td className="py-3 soft-text">
                  {item.activity ? `${item.activity.active_minutes} мин` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};