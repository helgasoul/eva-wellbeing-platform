import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  CloudRain, 
  Wind, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Info,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { weatherService, WeatherData } from '@/services/weatherService';

interface ClimateWidgetProps {
  className?: string;
}

interface DailyWeatherRecord {
  date: string;
  location_data: any;
  weather_data: WeatherData;
}

const ClimateWidget: React.FC<ClimateWidgetProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [weeklyData, setWeeklyData] = useState<DailyWeatherRecord[]>([]);
  const [climateInsights, setClimateInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'current' | 'trends' | 'insights'>('current');

  useEffect(() => {
    if (user?.id) {
      loadWeatherData();
    }
  }, [user?.id]);

  const loadWeatherData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем данные за последнюю неделю
      const weeklyWeatherData = await weatherService.getUserWeatherData(user!.id, 7);
      
      if (weeklyWeatherData.length > 0) {
        // Преобразуем данные в нужный формат
        const formattedData: DailyWeatherRecord[] = weeklyWeatherData.map(record => ({
          date: record.date,
          location_data: record.location_data,
          weather_data: record.weather_data as WeatherData
        }));
        
        setWeeklyData(formattedData);
        
        // Используем самые свежие данные как текущие
        setCurrentWeather(formattedData[0]?.weather_data || null);
        
        // Генерируем инсайты
        const insights = generateClimateInsights(formattedData);
        setClimateInsights(insights);
      }

    } catch (error) {
      console.error('Ошибка загрузки климатических данных:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateClimateInsights = (data: DailyWeatherRecord[]) => {
    if (data.length === 0) return null;

    const avgTemp = data.reduce((sum, d) => sum + d.weather_data.current.temperature, 0) / data.length;
    const avgHumidity = data.reduce((sum, d) => sum + d.weather_data.current.humidity, 0) / data.length;
    const avgPressure = data.reduce((sum, d) => sum + d.weather_data.current.pressure, 0) / data.length;
    const avgImpactScore = data.reduce((sum, d) => sum + d.weather_data.biometric_factors.menopause_impact_score, 0) / data.length;

    const highImpactDays = data.filter(d => d.weather_data.biometric_factors.menopause_impact_score > 70).length;
    const temperatureVariation = Math.max(...data.map(d => d.weather_data.current.temperature)) - 
                                Math.min(...data.map(d => d.weather_data.current.temperature));

    return {
      avgTemp: Math.round(avgTemp),
      avgHumidity: Math.round(avgHumidity),
      avgPressure: Math.round(avgPressure),
      avgImpactScore: Math.round(avgImpactScore),
      highImpactDays,
      temperatureVariation: Math.round(temperatureVariation),
      trends: {
        temperature: data.length > 1 ? (data[0].weather_data.current.temperature > data[data.length - 1].weather_data.current.temperature ? 'up' : 'down') : 'stable',
        pressure: data.length > 1 ? (data[0].weather_data.current.pressure > data[data.length - 1].weather_data.current.pressure ? 'up' : 'down') : 'stable'
      }
    };
  };

  const getAirQualityLevel = (pm25: number) => {
    if (pm25 <= 12) return { level: 'Хорошее', color: 'text-green-600 bg-green-100' };
    if (pm25 <= 35) return { level: 'Умеренное', color: 'text-yellow-600 bg-yellow-100' };
    if (pm25 <= 55) return { level: 'Плохое', color: 'text-orange-600 bg-orange-100' };
    return { level: 'Очень плохое', color: 'text-red-600 bg-red-100' };
  };

  const getImpactLevel = (score: number) => {
    if (score <= 30) return { level: 'Низкое', color: 'text-green-600 bg-green-100', icon: '😊' };
    if (score <= 60) return { level: 'Умеренное', color: 'text-yellow-600 bg-yellow-100', icon: '😐' };
    if (score <= 80) return { level: 'Высокое', color: 'text-orange-600 bg-orange-100', icon: '😟' };
    return { level: 'Очень высокое', color: 'text-red-600 bg-red-100', icon: '😰' };
  };

  const getUserLocationDisplay = () => {
    if (weeklyData.length > 0 && weeklyData[0].location_data) {
      const loc = weeklyData[0].location_data;
      return `${loc.city}, ${loc.country}`;
    }
    return 'Местоположение не указано';
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-2xl shadow-elegant p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-5 bg-muted rounded w-16"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className={`bg-card rounded-2xl shadow-elegant p-6 ${className}`}>
        <div className="text-center">
          <CloudRain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Нет данных о погоде</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Климатические данные будут обновляться автоматически
          </p>
        </div>
      </div>
    );
  }

  const renderCurrentWeather = () => (
    <div className="space-y-6">
      {/* Основные показатели */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <Thermometer className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            {currentWeather.current.temperature}°C
          </div>
          <div className="text-sm text-muted-foreground">Температура</div>
        </div>

        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <CloudRain className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            {currentWeather.current.humidity}%
          </div>
          <div className="text-sm text-muted-foreground">Влажность</div>
        </div>

        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <Wind className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            {currentWeather.current.pressure}
          </div>
          <div className="text-sm text-muted-foreground">Давление</div>
        </div>

        <div className="text-center p-4 bg-primary/10 rounded-2xl">
          <Eye className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">
            {currentWeather.current.uv_index}
          </div>
          <div className="text-sm text-muted-foreground">УФ-индекс</div>
        </div>
      </div>

      {/* Качество воздуха */}
      <div className="bg-muted/50 rounded-2xl p-4">
        <h4 className="font-medium text-foreground mb-3 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Качество воздуха
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-semibold text-foreground">
              PM2.5: {Math.round(currentWeather.air_quality.pm2_5)} μg/m³
            </div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAirQualityLevel(currentWeather.air_quality.pm2_5).color}`}>
              {getAirQualityLevel(currentWeather.air_quality.pm2_5).level}
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              PM10: {Math.round(currentWeather.air_quality.pm10)} μg/m³
            </div>
            <div className="text-sm text-muted-foreground">Крупные частицы</div>
          </div>
        </div>
      </div>

      {/* Влияние на симптомы */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4">
        <h4 className="font-medium text-foreground mb-3 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Влияние на симптомы менопаузы
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {currentWeather.biometric_factors.menopause_impact_score}/100
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getImpactLevel(currentWeather.biometric_factors.menopause_impact_score).color}`}>
              <span className="mr-2">{getImpactLevel(currentWeather.biometric_factors.menopause_impact_score).icon}</span>
              {getImpactLevel(currentWeather.biometric_factors.menopause_impact_score).level} влияние
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Уровень комфорта: <span className="font-medium">{currentWeather.biometric_factors.comfort_level}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {climateInsights && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-2xl">
              <div className="flex items-center justify-center mb-2">
                <Thermometer className="w-6 h-6 text-primary mr-2" />
                {climateInsights.trends.temperature === 'up' ? 
                  <TrendingUp className="w-5 h-5 text-green-600" /> : 
                  <TrendingDown className="w-5 h-5 text-red-600" />
                }
              </div>
              <div className="text-lg font-bold text-foreground">
                {climateInsights.avgTemp}°C
              </div>
              <div className="text-sm text-muted-foreground">Средняя за неделю</div>
            </div>

            <div className="text-center p-4 bg-primary/10 rounded-2xl">
              <CloudRain className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold text-foreground">
                {climateInsights.avgHumidity}%
              </div>
              <div className="text-sm text-muted-foreground">Средняя влажность</div>
            </div>

            <div className="text-center p-4 bg-primary/10 rounded-2xl">
              <Wind className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold text-foreground">
                {climateInsights.avgPressure}
              </div>
              <div className="text-sm text-muted-foreground">Среднее давление</div>
            </div>
          </div>

          <div className="bg-accent/20 rounded-2xl p-4">
            <h4 className="font-medium text-foreground mb-3">Недельная статистика</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Дни с высоким влиянием:</span>
                <span className="ml-2 font-semibold text-orange-600">
                  {climateInsights.highImpactDays} из {weeklyData.length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Колебания температуры:</span>
                <span className="ml-2 font-semibold text-primary">
                  {climateInsights.temperatureVariation}°C
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      <div className="bg-primary/10 rounded-2xl p-4">
        <h4 className="font-medium text-foreground mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Климатические рекомендации
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          {currentWeather.biometric_factors.menopause_impact_score > 60 && (
            <li>• Сегодня неблагоприятные условия - будьте внимательны к симптомам</li>
          )}
          {currentWeather.current.temperature > 25 && (
            <li>• Избегайте длительного пребывания на жаре</li>
          )}
          {currentWeather.current.humidity > 70 && (
            <li>• Высокая влажность - используйте кондиционер</li>
          )}
          {currentWeather.air_quality.pm2_5 > 25 && (
            <li>• Плохое качество воздуха - ограничьте прогулки</li>
          )}
          <li>• Пейте больше воды и носите легкую одежду</li>
        </ul>
      </div>

      {climateInsights && (
        <div className="bg-accent/20 rounded-2xl p-4">
          <h4 className="font-medium text-foreground mb-2">Анализ за неделю</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Средний уровень влияния на симптомы: {climateInsights.avgImpactScore}/100</p>
            {climateInsights.highImpactDays > 3 && (
              <p>• Много дней с высоким влиянием - рассмотрите адаптацию режима</p>
            )}
            {climateInsights.temperatureVariation > 10 && (
              <p>• Большие колебания температуры могут усиливать симптомы</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-card rounded-2xl shadow-elegant ${className}`}>
      {/* Заголовок с местоположением */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <CloudRain className="w-6 h-6 mr-2 text-primary" />
              Климатические факторы
            </h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {getUserLocationDisplay()}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentWeather.current.weather_condition}
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="px-6 pt-4">
        <div className="flex space-x-4 border-b border-border">
          {[
            { key: 'current', label: 'Сейчас' },
            { key: 'trends', label: 'Тренды' },
            { key: 'insights', label: 'Инсайты' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="p-6">
        {selectedTab === 'current' && renderCurrentWeather()}
        {selectedTab === 'trends' && renderTrends()}
        {selectedTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
};

export default ClimateWidget;