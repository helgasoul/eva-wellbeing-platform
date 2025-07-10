interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    weather_code: number;
    uv_index: number;
  };
  hourly: {
    temperature_2m: number[];
    humidity: number[];
    pressure_msl: number[];
    wind_speed_10m: number[];
    weather_code: number[];
    uv_index: number[];
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    pressure_msl: number[];
    humidity: number[];
    wind_speed_10m_max: number[];
    weather_code: number[];
    uv_index_max: number[];
  };
}

interface AirQualityData {
  current: {
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    aerosol_optical_depth: number;
    dust: number;
    uv_index: number;
  };
}

interface EnvironmentalFactors {
  weather: WeatherData;
  airQuality: AirQualityData;
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  timestamp: string;
}

export class EnvironmentalService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly airQualityUrl = 'https://air-quality-api.open-meteo.com/v1';
  
  async getCurrentEnvironmentalData(lat: number, lon: number, city: string): Promise<EnvironmentalFactors> {
    try {
      const [weather, airQuality] = await Promise.all([
        this.getWeatherData(lat, lon),
        this.getAirQuality(lat, lon)
      ]);

      return {
        weather,
        airQuality,
        location: { latitude: lat, longitude: lon, city },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Ошибка получения экологических данных:', error);
      throw new Error('Не удалось получить данные о погоде');
    }
  }

  async getWeatherForecast(lat: number, lon: number, days: number = 7): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'surface_pressure',
        'wind_speed_10m',
        'weather_code',
        'uv_index'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'surface_pressure',
        'wind_speed_10m',
        'weather_code',
        'uv_index'
      ].join(','),
      daily: [
        'temperature_2m_max',
        'temperature_2m_min',
        'wind_speed_10m_max',
        'weather_code',
        'uv_index_max'
      ].join(','),
      forecast_days: days.toString(),
      timezone: 'auto'
    });

    const response = await fetch(`${this.baseUrl}/forecast?${params}`);
    if (!response.ok) {
      throw new Error(`Ошибка API погоды: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      current: {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        pressure: data.current.surface_pressure,
        wind_speed: data.current.wind_speed_10m,
        weather_code: data.current.weather_code,
        uv_index: data.current.uv_index || 0
      },
      hourly: {
        temperature_2m: data.hourly.temperature_2m.slice(0, 24),
        humidity: data.hourly.relative_humidity_2m.slice(0, 24),
        pressure_msl: data.hourly.surface_pressure.slice(0, 24),
        wind_speed_10m: data.hourly.wind_speed_10m.slice(0, 24),
        weather_code: data.hourly.weather_code.slice(0, 24),
        uv_index: data.hourly.uv_index?.slice(0, 24) || new Array(24).fill(0)
      },
      daily: {
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
        pressure_msl: [data.current.surface_pressure], // fallback to current pressure
        humidity: [data.current.relative_humidity_2m], // fallback to current humidity
        wind_speed_10m_max: data.daily.wind_speed_10m_max,
        weather_code: data.daily.weather_code,
        uv_index_max: data.daily.uv_index_max
      }
    };
  }

  private async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    return this.getWeatherForecast(lat, lon, 1);
  }

  async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'aerosol_optical_depth',
        'dust',
        'uv_index'
      ].join(','),
      timezone: 'auto'
    });

    const response = await fetch(`${this.airQualityUrl}/air-quality?${params}`);
    if (!response.ok) {
      throw new Error(`Ошибка API качества воздуха: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      current: {
        pm10: data.current.pm10 || 0,
        pm2_5: data.current.pm2_5 || 0,
        carbon_monoxide: data.current.carbon_monoxide || 0,
        nitrogen_dioxide: data.current.nitrogen_dioxide || 0,
        sulphur_dioxide: data.current.sulphur_dioxide || 0,
        ozone: data.current.ozone || 0,
        aerosol_optical_depth: data.current.aerosol_optical_depth || 0,
        dust: data.current.dust || 0,
        uv_index: data.current.uv_index || 0
      }
    };
  }

  async getCityCoordinates(cityName: string): Promise<{ lat: number; lon: number }> {
    // Используем Nominatim API для геокодирования
    const params = new URLSearchParams({
      q: cityName,
      format: 'json',
      limit: '1'
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
    if (!response.ok) {
      throw new Error('Не удалось найти город');
    }

    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Город не найден');
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  }

  async getCityName(lat: number, lon: number): Promise<string> {
    // Обратное геокодирование для получения названия города
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json'
    });

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
      if (!response.ok) {
        return 'Неизвестное местоположение';
      }

      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || 'Неизвестное местоположение';
    } catch (error) {
      console.error('Ошибка обратного геокодирования:', error);
      return 'Неизвестное местоположение';
    }
  }
}

export const environmentalService = new EnvironmentalService();
export type { WeatherData, AirQualityData, EnvironmentalFactors };