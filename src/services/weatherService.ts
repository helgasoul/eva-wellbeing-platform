import { supabase } from '@/integrations/supabase/client';

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
  daily: {
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
    aqi: number;
  };
  biometric_factors: {
    barometric_trend: 'rising' | 'falling' | 'stable';
    heat_index: number;
    comfort_level: 'low' | 'moderate' | 'high' | 'extreme';
    menopause_impact_score: number;
  };
}

class WeatherService {
  private static instance: WeatherService;
  private baseUrl = 'https://api.open-meteo.com/v1';
  private airQualityUrl = 'https://air-quality-api.open-meteo.com/v1';

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getCurrentWeather(location: LocationData): Promise<WeatherData> {
    try {
      const weatherResponse = await fetch(
        `${this.baseUrl}/forecast?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=temperature_2m,relative_humidity_2m,pressure_msl,uv_index,wind_speed_10m,weather_code&` +
        `daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&` +
        `timezone=${location.timezone}&forecast_days=1`
      );

      if (!weatherResponse.ok) {
        throw new Error(`Weather API error: ${weatherResponse.status}`);
      }

      const weatherData = await weatherResponse.json();

      const airQualityResponse = await fetch(
        `${this.airQualityUrl}/air-quality?` +
        `latitude=${location.latitude}&longitude=${location.longitude}&` +
        `current=pm2_5,pm10,ozone,nitrogen_dioxide,european_aqi&` +
        `timezone=${location.timezone}`
      );

      let airQualityData = null;
      if (airQualityResponse.ok) {
        airQualityData = await airQualityResponse.json();
      }

      return this.processWeatherData(weatherData, airQualityData);
    } catch (error) {
      console.error('Ошибка получения погодных данных:', error);
      throw new Error('Не удалось получить погодные данные');
    }
  }

  async saveWeatherData(userId: string, location: LocationData, weather: WeatherData): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_weather_records')
      .upsert({
        user_id: userId,
        date: today,
        location_data: location as any,
        weather_data: weather as any
      } as any);

    if (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }
  }

  async getUserWeatherData(userId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('daily_weather_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching weather data:', error);
      return [];
    }

    return data || [];
  }

  private processWeatherData(weatherData: any, airQualityData: any): WeatherData {
    const current = weatherData.current;
    const daily = weatherData.daily;
    
    const temperature = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const pressure = current.pressure_msl;

    let barometricTrend: 'rising' | 'falling' | 'stable' = 'stable';
    if (pressure > 1020) barometricTrend = 'rising';
    else if (pressure < 1010) barometricTrend = 'falling';

    const heatIndex = this.calculateHeatIndex(temperature, humidity);
    const comfortLevel = this.calculateComfortLevel(temperature, humidity, current.wind_speed_10m);
    const menopauseImpactScore = this.calculateMenopauseImpact({
      temperature,
      humidity,
      pressure,
      uvIndex: current.uv_index,
      airQuality: airQualityData?.current?.pm2_5 || 0,
      barometricTrend
    });

    return {
      current: {
        temperature: Math.round(temperature),
        humidity: humidity,
        pressure: Math.round(pressure),
        uv_index: current.uv_index || 0,
        wind_speed: Math.round(current.wind_speed_10m || 0),
        weather_condition: this.getWeatherDescription(current.weather_code)
      },
      daily: {
        temperature_max: Math.round(daily.temperature_2m_max[0]),
        temperature_min: Math.round(daily.temperature_2m_min[0]),
        precipitation: daily.precipitation_sum[0] || 0,
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0]
      },
      air_quality: {
        pm2_5: airQualityData?.current?.pm2_5 || 0,
        pm10: airQualityData?.current?.pm10 || 0,
        o3: airQualityData?.current?.ozone || 0,
        no2: airQualityData?.current?.nitrogen_dioxide || 0,
        aqi: airQualityData?.current?.european_aqi || 0
      },
      biometric_factors: {
        barometric_trend: barometricTrend,
        heat_index: heatIndex,
        comfort_level: comfortLevel,
        menopause_impact_score: menopauseImpactScore
      }
    };
  }

  private calculateHeatIndex(temperature: number, humidity: number): number {
    if (temperature < 27) return temperature;
    
    const T = temperature;
    const RH = humidity;
    
    const HI = -8.78469475556 + 
               1.61139411 * T +
               2.33854883889 * RH +
               -0.14611605 * T * RH +
               -0.012308094 * T * T +
               -0.0164248277778 * RH * RH +
               0.002211732 * T * T * RH +
               0.00072546 * T * RH * RH +
               -0.000003582 * T * T * RH * RH;
    
    return Math.round(Math.max(HI, T));
  }

  private calculateComfortLevel(
    temperature: number, 
    humidity: number, 
    windSpeed: number
  ): 'low' | 'moderate' | 'high' | 'extreme' {
    const heatIndex = this.calculateHeatIndex(temperature, humidity);
    
    if (heatIndex >= 40 || temperature <= 0) return 'extreme';
    if (heatIndex >= 32 || temperature <= 5) return 'high';
    if (heatIndex >= 27 || temperature <= 10) return 'moderate';
    return 'low';
  }

  private calculateMenopauseImpact(factors: {
    temperature: number;
    humidity: number;
    pressure: number;
    uvIndex: number;
    airQuality: number;
    barometricTrend: string;
  }): number {
    let score = 0;

    if (factors.temperature > 25) score += (factors.temperature - 25) * 2;
    if (factors.temperature > 30) score += 20;
    if (factors.humidity > 60) score += (factors.humidity - 60) / 2;
    if (factors.barometricTrend === 'falling') score += 15;
    if (factors.barometricTrend === 'rising') score += 5;
    if (factors.pressure < 1010) score += 10;
    if (factors.uvIndex > 6) score += factors.uvIndex;
    if (factors.airQuality > 25) score += 10;
    if (factors.airQuality > 50) score += 20;

    return Math.min(Math.round(score), 100);
  }

  private getWeatherDescription(code: number): string {
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
  }
}

export const weatherService = WeatherService.getInstance();
export type { LocationData, WeatherData };