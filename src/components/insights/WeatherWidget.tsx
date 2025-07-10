import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  AlertTriangle,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { climateDataService } from '../../services/climateDataService';
import { environmentalService } from '../../services/environmentalService';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface WeatherWidgetProps {
  userId: string;
  location?: { lat: number; lon: number; city: string } | null;
  className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  userId,
  location,
  className = ''
}) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Загрузка последних погодных данных
  const loadLatestWeatherData = async () => {
    try {
      const climateHistory = await climateDataService.getClimateData(userId, 1);
      if (climateHistory.length > 0) {
        const latest = climateHistory[0];
        setWeatherData(latest.weather_data);
        setLastUpdate(new Date(latest.recorded_at).toLocaleString());
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки погодных данных:', error);
    }
  };

  // Обновление погодных данных
  const updateWeatherData = async () => {
    if (!location) {
      setError('Местоположение не определено');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      logger.debug('Updating weather data...');
      
      // Получить экологические данные
      const environmentalData = await environmentalService.getCurrentEnvironmentalData(
        location.lat,
        location.lon,
        location.city
      );

      // Преобразовать в формат для климатического сервиса
      const locationData = {
        city: location.city,
        country: 'Россия', // fallback
        latitude: location.lat,
        longitude: location.lon,
        timezone: 'auto'
      };

      const weatherData = {
        current: {
          temperature: environmentalData.weather.current.temperature,
          humidity: environmentalData.weather.current.humidity,
          pressure: environmentalData.weather.current.pressure,
          uv_index: environmentalData.weather.current.uv_index,
          wind_speed: environmentalData.weather.current.wind_speed,
          weather_condition: getWeatherDescription(environmentalData.weather.current.weather_code)
        },
        today: {
          temperature_max: environmentalData.weather.daily.temperature_2m_max[0],
          temperature_min: environmentalData.weather.daily.temperature_2m_min[0],
          precipitation: 0 // fallback
        },
        air_quality: {
          pm2_5: environmentalData.airQuality.current.pm2_5,
          pm10: environmentalData.airQuality.current.pm10,
          o3: environmentalData.airQuality.current.ozone,
          no2: environmentalData.airQuality.current.nitrogen_dioxide
        }
      };

      // Сохранить данные
      await climateDataService.saveClimateData(userId, locationData, weatherData);
      
      // Обновить отображение
      setWeatherData(weatherData);
      setLastUpdate(new Date().toLocaleString());
      
      toast({
        title: "Погодные данные обновлены",
        description: `Данные для ${location.city} успешно получены`,
      });

      logger.success('Weather data updated successfully');
      
    } catch (error) {
      console.error('❌ Ошибка обновления погодных данных:', error);
      setError('Не удалось обновить погодные данные');
      
      toast({
        title: "Ошибка обновления",
        description: "Не удалось получить актуальные погодные данные",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Описание погодных условий
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Ясно',
      1: 'Преимущественно ясно',
      2: 'Переменная облачность',
      3: 'Облачно',
      45: 'Туман',
      48: 'Изморозь',
      51: 'Слабая морось',
      53: 'Умеренная морось',
      55: 'Сильная морось',
      61: 'Слабый дождь',
      63: 'Умеренный дождь',
      65: 'Сильный дождь',
      71: 'Слабый снег',
      73: 'Умеренный снег',
      75: 'Сильный снег',
      95: 'Гроза'
    };
    return weatherCodes[code] || 'Неизвестные условия';
  };

  // Оценка качества воздуха
  const getAirQualityRating = (pm25: number, pm10: number) => {
    if (pm25 <= 12 && pm10 <= 20) return { rating: 'Хорошее', color: 'text-green-600' };
    if (pm25 <= 35 && pm10 <= 50) return { rating: 'Умеренное', color: 'text-yellow-600' };
    if (pm25 <= 55 && pm10 <= 90) return { rating: 'Вредно для чувствительных', color: 'text-orange-600' };
    if (pm25 <= 150 && pm10 <= 180) return { rating: 'Вредно', color: 'text-red-600' };
    return { rating: 'Опасно', color: 'text-purple-600' };
  };

  // Загрузка данных при инициализации
  useEffect(() => {
    loadLatestWeatherData();
  }, [userId]);

  // Автоматическое обновление при изменении местоположения
  useEffect(() => {
    if (location && !weatherData) {
      updateWeatherData();
    }
  }, [location]);

  if (!location) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <Cloud className="w-4 h-4 mr-2" />
            Погода
          </h3>
        </div>
        <div className="text-center py-4">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Местоположение не определено
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Укажите местоположение для получения погодных данных
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Заголовок с кнопкой обновления */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center">
          <Cloud className="w-4 h-4 mr-2" />
          Погода
        </h3>
        <button
          onClick={updateWeatherData}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          title="Обновить данные"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Содержимое */}
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Обновление данных...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={updateWeatherData}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Попробовать еще раз
          </button>
        </div>
      ) : weatherData ? (
        <div className="space-y-3">
          {/* Основная температура и условия */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">
                {weatherData.current.temperature}°C
              </div>
              <div className="text-sm text-gray-600">
                {weatherData.current.weather_condition}
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <div>{location.city}</div>
              {lastUpdate && (
                <div className="text-xs text-gray-500">
                  {lastUpdate}
                </div>
              )}
            </div>
          </div>

          {/* Детальные параметры */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium">{weatherData.current.humidity}%</div>
                <div className="text-xs text-gray-500">Влажность</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-gray-500" />
              <div>
                <div className="font-medium">{weatherData.current.wind_speed} км/ч</div>
                <div className="text-xs text-gray-500">Ветер</div>
              </div>
            </div>
          </div>

          {/* Качество воздуха */}
          {weatherData.air_quality && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Воздух</span>
                </div>
                <span className={`text-xs font-medium ${getAirQualityRating(weatherData.air_quality.pm2_5, weatherData.air_quality.pm10).color}`}>
                  {getAirQualityRating(weatherData.air_quality.pm2_5, weatherData.air_quality.pm10).rating}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                <div>PM2.5: {weatherData.air_quality.pm2_5.toFixed(1)}</div>
                <div>PM10: {weatherData.air_quality.pm10.toFixed(1)}</div>
              </div>
            </div>
          )}

          {/* Предупреждения */}
          {(weatherData.current.uv_index > 7 || weatherData.air_quality?.pm2_5 > 35) && (
            <div className="border-t pt-3">
              <div className="flex items-start space-x-2 bg-yellow-50 p-2 rounded">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  {weatherData.current.uv_index > 7 && (
                    <p className="mb-1">Высокий УФ-индекс</p>
                  )}
                  {weatherData.air_quality?.pm2_5 > 35 && (
                    <p>Загрязненный воздух</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-2">
            Нет данных о погоде
          </p>
          <button
            onClick={updateWeatherData}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Получить данные
          </button>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;