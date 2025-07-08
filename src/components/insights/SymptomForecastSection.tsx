import React, { useState } from 'react';
import { PredictionResult, WeatherAlert } from '../../utils/environmentalAnalyzer';
import { WeatherData } from '../../services/environmentalService';
import { cn } from '../../lib/utils';

interface SymptomForecastSectionProps {
  forecast: PredictionResult | null;
  weatherForecast: WeatherData | null;
  alerts: WeatherAlert[];
  onLocationUpdate?: (location: { lat: number; lon: number }) => void;
  isLoading?: boolean;
}

export const SymptomForecastSection: React.FC<SymptomForecastSectionProps> = ({
  forecast,
  weatherForecast,
  alerts,
  onLocationUpdate,
  isLoading = false
}) => {
  if (isLoading) {
    return <LoadingForecast />;
  }

  if (!forecast) {
    return <NoForecastData />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        🔮 Прогноз симптомов
        <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
          На основе погоды
        </span>
      </h2>

      {/* Погодные алерты */}
      <WeatherAlertsComponent alerts={alerts} />
      
      {/* Прогноз на завтра */}
      <TomorrowForecast forecast={forecast} />
      
      {/* Рекомендации по подготовке */}
      <PreparationRecommendations forecast={forecast} />
      
      {/* Еженедельный тренд */}
      {weatherForecast && <WeeklyTrend forecast={forecast} weatherForecast={weatherForecast} />}
    </div>
  );
};

// Компонент погодных алертов
const WeatherAlertsComponent = ({ alerts }: { alerts: WeatherAlert[] }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'danger': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const visibleAlerts = alerts.filter(alert => 
    !dismissedAlerts.includes(`${alert.type}-${alert.showUntil}`) &&
    new Date(alert.showUntil) > new Date()
  );

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <h3 className="font-semibold text-gray-800 flex items-center">
        <span className="mr-2">🌪️</span>
        Погодные предупреждения
      </h3>
      {visibleAlerts.map((alert, index) => (
        <div
          key={`${alert.type}-${index}`}
          className={`border rounded-lg p-4 ${getSeverityStyles(alert.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <span className="text-lg mr-3">{getSeverityIcon(alert.severity)}</span>
              <div>
                <h4 className="font-semibold mb-1">{alert.title}</h4>
                <p className="text-sm mb-2">{alert.message}</p>
                <p className="text-xs font-medium">{alert.action}</p>
              </div>
            </div>
            <button
              onClick={() => setDismissedAlerts(prev => [...prev, `${alert.type}-${alert.showUntil}`])}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Прогноз на завтра
const TomorrowForecast = ({ forecast }: { forecast: PredictionResult }) => {
  const getSymptomPredictionIcon = (likelihood: number) => {
    if (likelihood > 70) return '🔴';
    if (likelihood > 40) return '🟡';
    return '🟢';
  };

  const getSymptomPredictionText = (likelihood: number) => {
    if (likelihood > 70) return 'Высокая вероятность';
    if (likelihood > 40) return 'Умеренная вероятность';
    return 'Низкая вероятность';
  };

  const getSymptomName = (symptom: string) => {
    const names: { [key: string]: string } = {
      hot_flashes: 'Приливы',
      sleep_quality: 'Проблемы со сном',
      mood: 'Плохое настроение',
      headaches: 'Головные боли'
    };
    return names[symptom] || symptom;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">📅</span>
        Прогноз на завтра
        <span className="ml-2 text-sm bg-white text-gray-600 px-2 py-1 rounded-full">
          Точность: {forecast.confidence}%
        </span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {Object.entries(forecast.tomorrow_predictions).map(([symptom, data]) => (
          <div key={symptom} className="text-center bg-white rounded-lg p-3">
            <div className="text-2xl mb-2">
              {getSymptomPredictionIcon(data.likelihood)}
            </div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {getSymptomName(symptom)}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {getSymptomPredictionText(data.likelihood)}
            </div>
            <div className="text-lg font-bold text-gray-800">
              {data.likelihood}%
            </div>
            {data.predicted_value && (
              <div className="text-xs text-gray-500 mt-1">
                ~{data.predicted_value} {symptom === 'hot_flashes' ? 'раз' : '/5'}
              </div>
            )}
          </div>
        ))}
      </div>

      {forecast.tomorrow_reason && (
        <div className="bg-white rounded-lg p-3">
          <div className="text-sm text-gray-700">
            <strong>Основание прогноза:</strong> {forecast.tomorrow_reason}
          </div>
        </div>
      )}
    </div>
  );
};

// Рекомендации по подготовке
const PreparationRecommendations = ({ forecast }: { forecast: PredictionResult }) => {
  if (!forecast.preparation_tips || forecast.preparation_tips.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-green-800 mb-3 flex items-center">
        <span className="mr-2">💡</span>
        Рекомендации для подготовки
      </h3>
      <div className="space-y-2">
        {forecast.preparation_tips.map((tip, index) => (
          <div key={index} className="flex items-start text-sm text-green-700">
            <span className="text-green-500 mr-2 mt-0.5">✓</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Еженедельный тренд
const WeeklyTrend = ({ 
  forecast, 
  weatherForecast 
}: { 
  forecast: PredictionResult; 
  weatherForecast: WeatherData;
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving': return 'Улучшение';
      case 'declining': return 'Ухудшение';
      default: return 'Стабильно';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50';
      case 'declining': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <span className="mr-2">📊</span>
        Недельный тренд
      </h3>
      
      <div className="flex items-center justify-between">
        <div className={cn(
          "flex items-center px-3 py-2 rounded-lg",
          getTrendColor(forecast.weekly_trend)
        )}>
          <span className="mr-2">{getTrendIcon(forecast.weekly_trend)}</span>
          <span className="font-medium">{getTrendText(forecast.weekly_trend)}</span>
        </div>
        
        <div className="text-sm text-gray-600">
          На основе прогноза погоды на неделю
        </div>
      </div>
      
      {/* Мини-график погоды на неделю */}
      <div className="mt-4 grid grid-cols-7 gap-1">
        {weatherForecast.daily.temperature_2m_max.slice(0, 7).map((temp, index) => {
          const day = new Date();
          day.setDate(day.getDate() + index);
          const dayName = day.toLocaleDateString('ru', { weekday: 'short' });
          
          return (
            <div key={index} className="text-center bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-600 mb-1">{dayName}</div>
              <div className="text-sm font-medium">{Math.round(temp)}°</div>
              <div className="text-xs text-gray-500">
                {Math.round(weatherForecast.daily.pressure_msl[index])}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Состояние загрузки
const LoadingForecast = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-20 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Отсутствие данных
const NoForecastData = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
      🔮 Прогноз симптомов
    </h2>
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <div className="text-4xl mb-3">📊</div>
      <h3 className="font-semibold text-gray-800 mb-2">Недостаточно данных для прогноза</h3>
      <p className="text-gray-600 text-sm">
        Продолжайте добавлять записи симптомов и укажите ваше местоположение. 
        Через несколько дней мы сможем создать персональный прогноз.
      </p>
    </div>
  </div>
);

export default SymptomForecastSection;