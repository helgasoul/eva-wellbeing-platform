import React, { useState } from 'react';
import { EnvironmentalFactors } from '../../services/environmentalService';
import { EnvironmentalInsight } from '../../utils/environmentalAnalyzer';
import { cn } from '../../lib/utils';

interface EnvironmentalInsightsSectionProps {
  environmentalData: EnvironmentalFactors | null;
  insights: EnvironmentalInsight[];
  location: { lat: number; lon: number; city: string };
  isLoading?: boolean;
}

export const EnvironmentalInsightsSection: React.FC<EnvironmentalInsightsSectionProps> = ({
  environmentalData,
  insights,
  location,
  isLoading = false
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  if (isLoading) {
    return <LoadingEnvironmentalData />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        🌤️ Экологические факторы
        <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Уникальная функция
        </span>
      </h2>

      {/* Текущие условия */}
      <CurrentEnvironmentalConditions data={environmentalData} location={location} />
      
      {/* Корреляции с симптомами */}
      <EnvironmentalCorrelations insights={insights} />
    </div>
  );
};

// Компонент текущих условий
const CurrentEnvironmentalConditions = ({ 
  data, 
  location 
}: { 
  data: EnvironmentalFactors | null;
  location: { lat: number; lon: number; city: string };
}) => {
  if (!data) return <NoEnvironmentalData />;

  const getPressureStatus = (pressure: number) => {
    if (pressure < 1000) return { status: 'Низкое', color: 'text-red-600', risk: 'Возможны приливы' };
    if (pressure > 1020) return { status: 'Высокое', color: 'text-orange-600', risk: 'Возможны головные боли' };
    return { status: 'Нормальное', color: 'text-green-600', risk: 'Благоприятно' };
  };

  const getHumidityStatus = (humidity: number) => {
    if (humidity > 70) return { status: 'Высокая', color: 'text-red-600', risk: 'Может ухудшить сон' };
    if (humidity < 30) return { status: 'Низкая', color: 'text-orange-600', risk: 'Возможна ночная потливость' };
    return { status: 'Комфортная', color: 'text-green-600', risk: 'Оптимально' };
  };

  const getAirQualityStatus = (pm25: number) => {
    if (pm25 > 35) return { status: 'Плохое', color: 'text-red-600', risk: 'Может снизить настроение' };
    if (pm25 > 15) return { status: 'Умеренное', color: 'text-yellow-600', risk: 'Ограничьте активность на улице' };
    return { status: 'Хорошее', color: 'text-green-600', risk: 'Благоприятно для прогулок' };
  };

  const getUVStatus = (uvIndex: number) => {
    if (uvIndex > 6) return { status: 'Высокий', color: 'text-red-600', risk: 'Используйте солнцезащиту' };
    if (uvIndex > 3) return { status: 'Умеренный', color: 'text-orange-600', risk: 'Рекомендуется защита' };
    return { status: 'Низкий', color: 'text-green-600', risk: 'Безопасно' };
  };

  const pressureStatus = getPressureStatus(data.weather.current.pressure);
  const humidityStatus = getHumidityStatus(data.weather.current.humidity);
  const airQualityStatus = getAirQualityStatus(data.airQuality.current.pm2_5);
  const uvStatus = getUVStatus(data.weather.current.uv_index);

  return (
    <div className="mb-6">
      {/* Заголовок с местоположением */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-700">📍 {location.city}</span>
          <span className="ml-2 text-sm text-gray-500">
            {Math.round(data.weather.current.temperature)}°C
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Обновлено: {new Date(data.timestamp).toLocaleTimeString('ru')}
        </div>
      </div>

      {/* Сетка показателей */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Атмосферное давление */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className={`text-sm font-medium ${pressureStatus.color}`}>
              {pressureStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {Math.round(data.weather.current.pressure)} hPa
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Атмосферное давление
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {pressureStatus.risk}
          </div>
        </div>

        {/* Влажность */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💧</span>
            <span className={`text-sm font-medium ${humidityStatus.color}`}>
              {humidityStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {Math.round(data.weather.current.humidity)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Влажность воздуха
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {humidityStatus.risk}
          </div>
        </div>

        {/* Качество воздуха */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🌬️</span>
            <span className={`text-sm font-medium ${airQualityStatus.color}`}>
              {airQualityStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {Math.round(data.airQuality.current.pm2_5)} μg/m³
          </div>
          <div className="text-xs text-gray-600 mt-1">
            PM2.5
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {airQualityStatus.risk}
          </div>
        </div>

        {/* УФ-индекс */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">☀️</span>
            <span className={`text-sm font-medium ${uvStatus.color}`}>
              {uvStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {Math.round(data.weather.current.uv_index)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            УФ-индекс
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {uvStatus.risk}
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент корреляций
const EnvironmentalCorrelations = ({ insights }: { insights: EnvironmentalInsight[] }) => {
  if (insights.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="font-semibold text-gray-800 mb-2">Анализируем влияние погоды</h3>
        <p className="text-gray-600 text-sm">
          Продолжайте добавлять записи симптомов. Через несколько дней мы сможем 
          выявить связи между погодными условиями и вашим самочувствием.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-4">🔍 Обнаруженные корреляции</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <EnvironmentalInsightCard key={index} insight={insight} />
        ))}
      </div>
    </div>
  );
};

// Карточка инсайта
const EnvironmentalInsightCard = ({ insight }: { insight: EnvironmentalInsight }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pressure_correlation': return '📊';
      case 'humidity_impact': return '💧';
      case 'air_quality_alert': return '🌬️';
      case 'weather_prediction': return '🔮';
      default: return '📈';
    }
  };

  const getCorrelationText = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'Сильная связь';
    if (abs > 0.4) return 'Умеренная связь';
    if (abs > 0.2) return 'Слабая связь';
    return 'Незначительная связь';
  };

  return (
    <div className={cn(
      "border-2 rounded-xl p-4 transition-all",
      getSeverityColor(insight.severity)
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="text-2xl mr-3">{getTypeIcon(insight.type)}</div>
          <div>
            <h4 className="font-semibold text-gray-800">{insight.title}</h4>
            <div className="flex items-center mt-1">
              <span className="text-xs text-gray-600 mr-2">
                {getCorrelationText(insight.correlation)}
              </span>
              <div className="flex items-center bg-white rounded-full px-2 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">{insight.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">
        {insight.description}
      </p>
      
      {/* Прогноз на завтра */}
      <div className="bg-white rounded-lg p-3 mb-3">
        <div className="flex items-center mb-2">
          <span className="text-lg mr-2">
            {insight.forecast.tomorrow === 'better' ? '📈' : 
             insight.forecast.tomorrow === 'worse' ? '📉' : '➡️'}
          </span>
          <span className="text-sm font-medium text-gray-800">
            Прогноз на завтра: {
              insight.forecast.tomorrow === 'better' ? 'Улучшение' :
              insight.forecast.tomorrow === 'worse' ? 'Ухудшение' : 'Без изменений'
            }
          </span>
        </div>
        <p className="text-xs text-gray-600">{insight.forecast.reason}</p>
      </div>
      
      {/* Рекомендации */}
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium mb-2"
        >
          {expanded ? 'Скрыть' : 'Показать'} рекомендации
        </button>
        
        {expanded && (
          <div className="space-y-1">
            {insight.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start text-xs text-gray-700">
                <span className="text-purple-500 mr-2">•</span>
                {rec}
              </div>
            ))}
            
            {insight.forecast.suggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs font-medium text-gray-700 mb-1">На завтра:</div>
                {insight.forecast.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start text-xs text-gray-600">
                    <span className="text-blue-500 mr-2">→</span>
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Состояние загрузки
const LoadingEnvironmentalData = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Отсутствие данных
const NoEnvironmentalData = () => (
  <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
    <div className="text-4xl mb-3">🌍</div>
    <h3 className="font-semibold text-gray-800 mb-2">Данные о погоде недоступны</h3>
    <p className="text-gray-600 text-sm">
      Разрешите доступ к геолокации или укажите город вручную для получения экологических данных.
    </p>
  </div>
);

export default EnvironmentalInsightsSection;