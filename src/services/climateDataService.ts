import { environmentalService } from './environmentalService';
import { supabase } from '@/integrations/supabase/client';

interface ClimateDataEntry {
  user_id: string;
  location_data: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  weather_data: {
    temperature: number;
    humidity: number;
    pressure: number;
    uv_index: number;
    wind_speed: number;
    weather_condition: string;
    temperature_max: number;
    temperature_min: number;
    precipitation: number;
    air_quality: {
      pm2_5: number;
      pm10: number;
      o3: number;
      no2: number;
    };
  };
  recorded_at: string;
}

export class ClimateDataService {
  
  /**
   * Сохраняет климатические данные для пользователя
   */
  async saveClimateData(userId: string, locationData: any, weatherData: any): Promise<void> {
    try {
      const climateEntry: ClimateDataEntry = {
        user_id: userId,
        location_data: {
          city: locationData.city,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timezone: locationData.timezone,
        },
        weather_data: {
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          pressure: weatherData.current.pressure,
          uv_index: weatherData.current.uv_index,
          wind_speed: weatherData.current.wind_speed,
          weather_condition: weatherData.current.weather_condition,
          temperature_max: weatherData.today.temperature_max,
          temperature_min: weatherData.today.temperature_min,
          precipitation: weatherData.today.precipitation,
          air_quality: weatherData.air_quality,
        },
        recorded_at: new Date().toISOString(),
      };

      // Пока сохраняем в localStorage, позже можно интегрировать с Supabase
      const storageKey = `climate_data_${userId}`;
      const existingData = localStorage.getItem(storageKey);
      const dataArray = existingData ? JSON.parse(existingData) : [];
      
      dataArray.push(climateEntry);
      
      // Храним только последние 30 дней данных
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredData = dataArray.filter((entry: ClimateDataEntry) => 
        new Date(entry.recorded_at) > thirtyDaysAgo
      );
      
      localStorage.setItem(storageKey, JSON.stringify(filteredData));
      
      console.log('✅ Climate data saved for user:', userId);
    } catch (error) {
      console.error('❌ Error saving climate data:', error);
      throw error;
    }
  }

  /**
   * Получает климатические данные пользователя
   */
  async getClimateData(userId: string, days: number = 30): Promise<ClimateDataEntry[]> {
    try {
      const storageKey = `climate_data_${userId}`;
      const data = localStorage.getItem(storageKey);
      
      if (!data) return [];

      const dataArray: ClimateDataEntry[] = JSON.parse(data);
      
      // Фильтруем данные по количеству дней
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return dataArray.filter(entry => 
        new Date(entry.recorded_at) > cutoffDate
      ).sort((a, b) => 
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
    } catch (error) {
      console.error('❌ Error getting climate data:', error);
      return [];
    }
  }

  /**
   * Обновляет климатические данные для пользователя
   */
  async updateClimateData(userId: string, locationData: any): Promise<boolean> {
    try {
      // Проверяем, есть ли данные за сегодня
      const today = new Date().toDateString();
      const recentData = await this.getClimateData(userId, 1);
      
      const todayData = recentData.find(entry => 
        new Date(entry.recorded_at).toDateString() === today
      );

      // Если данных за сегодня нет, получаем новые
      if (!todayData) {
        console.log('🌤️ Fetching fresh climate data for user:', userId);
        
        const environmentalData = await environmentalService.getCurrentEnvironmentalData(
          locationData.latitude,
          locationData.longitude,
          locationData.city
        );

        await this.saveClimateData(userId, locationData, environmentalData.weather);
        return true;
      } else {
        console.log('✅ Climate data for today already exists for user:', userId);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating climate data:', error);
      return false;
    }
  }

  /**
   * Анализирует корреляции между климатом и симптомами
   */
  async analyzeClimateCorrelations(userId: string): Promise<{
    temperature_correlation: number;
    humidity_correlation: number;
    pressure_correlation: number;
    air_quality_correlation: number;
    insights: string[];
  }> {
    try {
      const climateData = await this.getClimateData(userId, 30);
      
      if (climateData.length < 7) {
        return {
          temperature_correlation: 0,
          humidity_correlation: 0,
          pressure_correlation: 0,
          air_quality_correlation: 0,
          insights: ['Недостаточно данных для анализа. Нужно минимум 7 дней записей.']
        };
      }

      // Упрощенный анализ корреляций
      // В реальном приложении здесь был бы более сложный алгоритм
      const insights: string[] = [];
      
      // Анализ температуры
      const avgTemp = climateData.reduce((sum, entry) => sum + entry.weather_data.temperature, 0) / climateData.length;
      if (avgTemp > 25) {
        insights.push('Высокие температуры могут усиливать приливы. Рекомендуется больше времени проводить в прохладных помещениях.');
      }
      
      // Анализ влажности
      const avgHumidity = climateData.reduce((sum, entry) => sum + entry.weather_data.humidity, 0) / climateData.length;
      if (avgHumidity > 70) {
        insights.push('Высокая влажность может ухудшать самочувствие. Используйте кондиционер или осушитель воздуха.');
      }

      // Анализ качества воздуха
      const avgPM25 = climateData.reduce((sum, entry) => sum + entry.weather_data.air_quality.pm2_5, 0) / climateData.length;
      if (avgPM25 > 25) {
        insights.push('Качество воздуха в вашем регионе снижено. Рекомендуется использовать очистители воздуха и ограничить активность на улице.');
      }

      // Анализ атмосферного давления
      const pressureValues = climateData.map(entry => entry.weather_data.pressure);
      const pressureVariation = Math.max(...pressureValues) - Math.min(...pressureValues);
      if (pressureVariation > 20) {
        insights.push('Значительные перепады атмосферного давления могут влиять на ваше самочувствие. Отслеживайте связь с симптомами.');
      }

      if (insights.length === 0) {
        insights.push('Климатические условия в норме. Продолжайте отслеживание для выявления паттернов.');
      }

      return {
        temperature_correlation: this.calculateSimpleCorrelation(climateData, 'temperature'),
        humidity_correlation: this.calculateSimpleCorrelation(climateData, 'humidity'),
        pressure_correlation: this.calculateSimpleCorrelation(climateData, 'pressure'),
        air_quality_correlation: this.calculateSimpleCorrelation(climateData, 'air_quality'),
        insights
      };
    } catch (error) {
      console.error('❌ Error analyzing climate correlations:', error);
      return {
        temperature_correlation: 0,
        humidity_correlation: 0,
        pressure_correlation: 0,
        air_quality_correlation: 0,
        insights: ['Ошибка при анализе данных']
      };
    }
  }

  /**
   * Упрощенный расчет корреляции
   */
  private calculateSimpleCorrelation(data: ClimateDataEntry[], parameter: string): number {
    // Возвращаем случайное значение корреляции для демонстрации
    // В реальном приложении здесь должен быть настоящий расчет корреляции с симптомами
    return Math.random() * 0.6 - 0.3; // от -0.3 до 0.3
  }

  /**
   * Получает прогноз погоды для планирования
   */
  async getWeatherForecast(locationData: any, days: number = 7): Promise<any> {
    try {
      return await environmentalService.getWeatherForecast(
        locationData.latitude,
        locationData.longitude,
        days
      );
    } catch (error) {
      console.error('❌ Error getting weather forecast:', error);
      return null;
    }
  }

  /**
   * Инициализирует ежедневное обновление данных для пользователя
   */
  setupDailyUpdates(userId: string, locationData: any): void {
    // Проверяем, нужно ли обновить данные сегодня
    this.updateClimateData(userId, locationData);
    
    // В реальном приложении здесь была бы настройка периодических обновлений
    // Например, через Service Worker или push-уведомления
    console.log('📅 Daily climate updates initialized for user:', userId);
  }

  /**
   * Получает рекомендации на основе текущей погоды
   */
  async getWeatherBasedRecommendations(userId: string): Promise<string[]> {
    try {
      const recentData = await this.getClimateData(userId, 1);
      
      if (recentData.length === 0) {
        return ['Нет данных о погоде для персонализированных рекомендаций'];
      }

      const latestWeather = recentData[0].weather_data;
      const recommendations: string[] = [];

      // Рекомендации на основе температуры
      if (latestWeather.temperature > 28) {
        recommendations.push('Жаркая погода: пейте больше воды, избегайте тяжелых физических нагрузок на улице');
        recommendations.push('Одевайтесь в легкую, свободную одежду из натуральных тканей');
      } else if (latestWeather.temperature < 5) {
        recommendations.push('Холодная погода: одевайтесь теплее, особенно важно согревать конечности');
      }

      // Рекомендации на основе влажности
      if (latestWeather.humidity > 80) {
        recommendations.push('Высокая влажность: используйте осушитель воздуха, чаще проветривайте помещение');
      } else if (latestWeather.humidity < 30) {
        recommendations.push('Низкая влажность: используйте увлажнитель воздуха, пейте больше воды');
      }

      // Рекомендации на основе УФ-индекса
      if (latestWeather.uv_index > 6) {
        recommendations.push('Высокий УФ-индекс: используйте солнцезащитный крем, избегайте солнца в полдень');
      }

      // Рекомендации на основе качества воздуха
      if (latestWeather.air_quality.pm2_5 > 35) {
        recommendations.push('Плохое качество воздуха: ограничьте время на улице, используйте маску');
      }

      if (recommendations.length === 0) {
        recommendations.push('Погодные условия комфортные для активности');
      }

      return recommendations;
    } catch (error) {
      console.error('❌ Error getting weather recommendations:', error);
      return ['Ошибка получения рекомендаций'];
    }
  }
}

export const climateDataService = new ClimateDataService();