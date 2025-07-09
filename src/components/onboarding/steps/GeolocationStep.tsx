import React, { useState, useEffect } from 'react';
import { MapPin, Search, Clock, Thermometer, CloudRain, Eye } from 'lucide-react';

interface LocationData {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  region?: string;
}

interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    uv_index: number;
    wind_speed: number;
    weather_condition: string;
  };
  today: {
    temperature_max: number;
    temperature_min: number;
    precipitation: number;
    sunrise: string;
    sunset: string;
  };
  air_quality: {
    pm2_5: number;
    pm10: number;
    o3: number;
    no2: number;
  };
}

interface GeolocationStepProps {
  data?: {
    location?: LocationData;
    weather?: WeatherData;
  };
  onChange: (data: { location: LocationData; weather: WeatherData }) => void;
}

const GeolocationStep: React.FC<GeolocationStepProps> = ({ 
  data,
  onChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(data?.location || null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(data?.weather || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  // Популярные города для быстрого выбора
  const popularCities: LocationData[] = [
    { country: 'Россия', city: 'Москва', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow' },
    { country: 'Россия', city: 'Санкт-Петербург', latitude: 59.9311, longitude: 30.3609, timezone: 'Europe/Moscow' },
    { country: 'Россия', city: 'Новосибирск', latitude: 55.0084, longitude: 82.9357, timezone: 'Asia/Novosibirsk' },
    { country: 'Россия', city: 'Екатеринбург', latitude: 56.8431, longitude: 60.6454, timezone: 'Asia/Yekaterinburg' },
    { country: 'Россия', city: 'Казань', latitude: 55.8304, longitude: 49.0661, timezone: 'Europe/Moscow' },
    { country: 'Россия', city: 'Нижний Новгород', latitude: 56.2965, longitude: 43.9361, timezone: 'Europe/Moscow' },
    { country: 'Россия', city: 'Самара', latitude: 53.2001, longitude: 50.15, timezone: 'Europe/Samara' },
    { country: 'Россия', city: 'Омск', latitude: 54.9884, longitude: 73.3242, timezone: 'Asia/Omsk' },
    { country: 'Россия', city: 'Ростов-на-Дону', latitude: 47.2357, longitude: 39.7015, timezone: 'Europe/Moscow' },
    { country: 'Россия', city: 'Уфа', latitude: 54.7388, longitude: 55.9721, timezone: 'Asia/Yekaterinburg' },
    { country: 'Беларусь', city: 'Минск', latitude: 53.9045, longitude: 27.5615, timezone: 'Europe/Minsk' },
    { country: 'Казахстан', city: 'Алматы', latitude: 43.2220, longitude: 76.8512, timezone: 'Asia/Almaty' },
    { country: 'Украина', city: 'Киев', latitude: 50.4501, longitude: 30.5234, timezone: 'Europe/Kiev' },
  ];

  // Поиск городов через OpenStreetMap Nominatim API
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Фильтруем популярные города по запросу
      const filteredPopular = popularCities.filter(city => 
        city.city.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
      );

      // Если есть точные совпадения в популярных городах, используем их
      if (filteredPopular.length > 0) {
        setSuggestions(filteredPopular.slice(0, 10));
        setIsLoading(false);
        return;
      }

      // Иначе ищем через Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ru,by,kz,ua&limit=10&featuretype=city`
      );
      
      if (!response.ok) throw new Error('Ошибка поиска');
      
      const results = await response.json();
      
      const locations: LocationData[] = results.map((result: any) => ({
        country: result.display_name.split(',').pop()?.trim() || 'Россия',
        city: result.name || result.display_name.split(',')[0],
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        timezone: getTimezoneFromCoords(parseFloat(result.lat), parseFloat(result.lon)),
        region: result.display_name.split(',')[1]?.trim()
      }));
      
      setSuggestions(locations);
    } catch (error) {
      console.error('Ошибка поиска городов:', error);
      // Показываем популярные города как fallback
      setSuggestions(popularCities.slice(0, 10));
    } finally {
      setIsLoading(false);
    }
  };

  // Определение часового пояса по координатам
  const getTimezoneFromCoords = (lat: number, lon: number): string => {
    // Упрощенная логика для основных часовых поясов России и СНГ
    if (lon < 30) return 'Europe/Moscow';
    if (lon < 45) return 'Europe/Moscow';
    if (lon < 60) return 'Asia/Yekaterinburg';
    if (lon < 75) return 'Asia/Omsk';
    if (lon < 90) return 'Asia/Krasnoyarsk';
    if (lon < 105) return 'Asia/Irkutsk';
    if (lon < 120) return 'Asia/Yakutsk';
    if (lon < 135) return 'Asia/Vladivostok';
    return 'Asia/Magadan';
  };

  // Получение текущего местоположения пользователя
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Получаем название города по координатам
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          
          if (!response.ok) throw new Error('Ошибка получения адреса');
          
          const result = await response.json();
          
          const location: LocationData = {
            country: result.address?.country || 'Россия',
            city: result.address?.city || result.address?.town || result.address?.village || 'Неизвестный город',
            latitude,
            longitude,
            timezone: getTimezoneFromCoords(latitude, longitude),
            region: result.address?.state || result.address?.region
          };
          
          setSelectedLocation(location);
          setUseCurrentLocation(true);
          await fetchWeatherData(location);
        } catch (error) {
          console.error('Ошибка определения местоположения:', error);
          alert('Не удалось определить ваше местоположение');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Ошибка геолокации:', error);
        alert('Не удалось получить доступ к вашему местоположению');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Получение погодных данных из Open-Meteo API
  const fetchWeatherData = async (location: LocationData) => {
    setIsWeatherLoading(true);
    try {
      // Текущая погода и прогноз
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,pressure_msl,uv_index,wind_speed_10m,weather_code&` +
        `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&` +
        `timezone=${location.timezone}&forecast_days=1`
      );
      
      if (!weatherResponse.ok) throw new Error('Ошибка получения погоды');
      
      const weatherApiData = await weatherResponse.json();
      
      // Качество воздуха
      const airQualityResponse = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=pm2_5,pm10,ozone,nitrogen_dioxide&timezone=${location.timezone}`
      );
      
      let airQualityData = null;
      if (airQualityResponse.ok) {
        airQualityData = await airQualityResponse.json();
      }

      const weather: WeatherData = {
        current: {
          temperature: Math.round(weatherApiData.current.temperature_2m),
          humidity: weatherApiData.current.relative_humidity_2m,
          pressure: Math.round(weatherApiData.current.pressure_msl),
          uv_index: weatherApiData.current.uv_index || 0,
          wind_speed: Math.round(weatherApiData.current.wind_speed_10m),
          weather_condition: getWeatherDescription(weatherApiData.current.weather_code)
        },
        today: {
          temperature_max: Math.round(weatherApiData.daily.temperature_2m_max[0]),
          temperature_min: Math.round(weatherApiData.daily.temperature_2m_min[0]),
          precipitation: weatherApiData.daily.precipitation_sum[0],
          sunrise: weatherApiData.daily.sunrise[0],
          sunset: weatherApiData.daily.sunset[0]
        },
        air_quality: {
          pm2_5: airQualityData?.current?.pm2_5 || 0,
          pm10: airQualityData?.current?.pm10 || 0,
          o3: airQualityData?.current?.ozone || 0,
          no2: airQualityData?.current?.nitrogen_dioxide || 0
        }
      };
      
      setWeatherData(weather);
      
      // Вызываем onChange с обновленными данными
      if (selectedLocation) {
        onChange({ location, weather });
      }
    } catch (error) {
      console.error('Ошибка получения погодных данных:', error);
    } finally {
      setIsWeatherLoading(false);
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
    return weatherCodes[code] || 'Неизвестно';
  };

  // Обработка выбора города
  const handleLocationSelect = async (location: LocationData) => {
    setSelectedLocation(location);
    setSuggestions([]);
    setSearchQuery(location.city);
    await fetchWeatherData(location);
  };

  // Эффект для поиска при изменении запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchCities(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Укажите ваше местоположение
        </h2>
        <p className="text-muted-foreground">
          Это поможет нам учитывать климатические факторы при анализе ваших симптомов 
          и предоставлять персонализированные рекомендации
        </p>
      </div>

      {/* Поиск местоположения */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Введите название города..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Кнопка определения текущего местоположения */}
        <button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <MapPin className="w-5 h-5" />
          <span>Определить текущее местоположение</span>
        </button>

        {/* Список предложений */}
        {suggestions.length > 0 && (
          <div className="border border-border rounded-lg max-h-60 overflow-y-auto bg-background">
            {suggestions.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 transition-colors"
              >
                <div className="font-medium text-foreground">{location.city}</div>
                <div className="text-sm text-muted-foreground">
                  {location.region && `${location.region}, `}{location.country}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Популярные города */}
      {!searchQuery && suggestions.length === 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-3">Популярные города</h3>
          <div className="grid grid-cols-2 gap-2">
            {popularCities.slice(0, 10).map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location)}
                className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors text-left"
              >
                {location.city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Выбранное местоположение и погода */}
      {selectedLocation && (
        <div className="bg-muted/50 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {selectedLocation.city}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedLocation.region && `${selectedLocation.region}, `}
                {selectedLocation.country}
              </p>
              {useCurrentLocation && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Текущее местоположение
                </span>
              )}
            </div>
          </div>

          {/* Погодные данные */}
          {isWeatherLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Загрузка погодных данных...</span>
            </div>
          ) : weatherData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                <div className="text-2xl font-bold text-foreground">
                  {weatherData.current.temperature}°C
                </div>
                <div className="text-xs text-muted-foreground">Температура</div>
              </div>
              
              <div className="text-center">
                <CloudRain className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-semibold text-foreground">
                  {weatherData.current.humidity}%
                </div>
                <div className="text-xs text-muted-foreground">Влажность</div>
              </div>
              
              <div className="text-center">
                <Eye className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                <div className="text-lg font-semibold text-foreground">
                  {weatherData.current.uv_index}
                </div>
                <div className="text-xs text-muted-foreground">УФ-индекс</div>
              </div>
              
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-muted-foreground rounded-full flex items-center justify-center">
                  <span className="text-xs text-background font-bold">PM</span>
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {Math.round(weatherData.air_quality.pm2_5)}
                </div>
                <div className="text-xs text-muted-foreground">PM2.5</div>
              </div>
            </div>
          ) : null}
          
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Почему это важно:</strong> Климатические факторы (температура, влажность, 
              атмосферное давление, качество воздуха) могут влиять на интенсивность симптомов 
              менопаузы. Мы будем учитывать эти данные при анализе ваших записей.
            </p>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground text-center mt-4">
        Данные о погоде будут обновляться ежедневно для анализа корреляций с вашими симптомами
      </p>
    </div>
  );
};

export default GeolocationStep;