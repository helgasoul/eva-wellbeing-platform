import { supabase } from '@/integrations/supabase/client';

interface CorrelationAnalysis {
  temperature_correlation: number;
  humidity_correlation: number;
  pressure_correlation: number;
  air_quality_correlation: number;
  insights: string[];
  recommendations: string[];
  confidence_score: number;
}

interface WeatherInsight {
  factor: string;
  impact_level: 'low' | 'moderate' | 'high';
  description: string;
  recommendation: string;
}

export class WeatherCorrelationService {
  
  /**
   * Анализирует корреляции между погодными условиями и симптомами
   */
  async analyzeWeatherSymptomCorrelations(userId: string, days: number = 30): Promise<CorrelationAnalysis> {
    try {
      // Получаем погодные данные за указанный период
      const weatherData = await this.getWeatherData(userId, days);
      
      // Получаем данные о симптомах за тот же период (заглушка)
      // В реальной версии здесь будет запрос к таблице с симптомами
      const symptomData = await this.getSymptomData(userId, days);

      if (weatherData.length < 7) {
        return {
          temperature_correlation: 0,
          humidity_correlation: 0,
          pressure_correlation: 0,
          air_quality_correlation: 0,
          insights: ['Недостаточно данных для анализа. Нужно минимум 7 дней записей.'],
          recommendations: ['Продолжайте вести дневник симптомов для получения точного анализа'],
          confidence_score: 0
        };
      }

      // Анализируем корреляции
      const correlations = this.calculateCorrelations(weatherData, symptomData);
      
      // Генерируем инсайты
      const insights = this.generateInsights(weatherData, correlations);
      
      // Генерируем рекомендации
      const recommendations = this.generateRecommendations(correlations, weatherData);

      // Рассчитываем уровень доверия к анализу
      const confidence_score = this.calculateConfidenceScore(weatherData.length, correlations);

      return {
        ...correlations,
        insights,
        recommendations,
        confidence_score
      };

    } catch (error) {
      console.error('Error analyzing weather-symptom correlations:', error);
      return {
        temperature_correlation: 0,
        humidity_correlation: 0,
        pressure_correlation: 0,
        air_quality_correlation: 0,
        insights: ['Ошибка при анализе данных'],
        recommendations: ['Попробуйте повторить анализ позже'],
        confidence_score: 0
      };
    }
  }

  /**
   * Получает погодные данные пользователя
   */
  private async getWeatherData(userId: string, days: number): Promise<any[]> {
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

  /**
   * Получает данные о симптомах (заглушка)
   */
  private async getSymptomData(userId: string, days: number): Promise<any[]> {
    // Заглушка - в реальной версии здесь будет запрос к таблице симптомов
    return [];
  }

  /**
   * Рассчитывает корреляции между погодой и симптомами
   */
  private calculateCorrelations(weatherData: any[], symptomData: any[]): {
    temperature_correlation: number;
    humidity_correlation: number;
    pressure_correlation: number;
    air_quality_correlation: number;
  } {
    // Упрощенный расчет корреляций для демонстрации
    // В реальной версии здесь должен быть статистический анализ
    
    const avgTemp = weatherData.reduce((sum, entry) => 
      sum + entry.weather_data.current.temperature, 0) / weatherData.length;
    
    const avgHumidity = weatherData.reduce((sum, entry) => 
      sum + entry.weather_data.current.humidity, 0) / weatherData.length;
    
    const avgPressure = weatherData.reduce((sum, entry) => 
      sum + entry.weather_data.current.pressure, 0) / weatherData.length;
    
    const avgAirQuality = weatherData.reduce((sum, entry) => 
      sum + entry.weather_data.air_quality.pm2_5, 0) / weatherData.length;

    return {
      temperature_correlation: this.calculateSimpleCorrelation(avgTemp, 25),
      humidity_correlation: this.calculateSimpleCorrelation(avgHumidity, 60),
      pressure_correlation: this.calculateSimpleCorrelation(avgPressure, 1013),
      air_quality_correlation: this.calculateSimpleCorrelation(avgAirQuality, 15)
    };
  }

  /**
   * Упрощенный расчет корреляции
   */
  private calculateSimpleCorrelation(value: number, threshold: number): number {
    const deviation = Math.abs(value - threshold) / threshold;
    return Math.min(deviation * 0.5, 0.8) * (Math.random() > 0.5 ? 1 : -1);
  }

  /**
   * Генерирует инсайты на основе погодных данных
   */
  private generateInsights(weatherData: any[], correlations: any): string[] {
    const insights: string[] = [];

    // Анализ температурных паттернов
    const highTempDays = weatherData.filter(d => 
      d.weather_data.current.temperature > 25).length;
    
    if (highTempDays > weatherData.length * 0.3) {
      insights.push('В периоды высокой температуры (>25°C) симптомы могут усиливаться');
    }

    // Анализ влажности
    const highHumidityDays = weatherData.filter(d => 
      d.weather_data.current.humidity > 70).length;
    
    if (highHumidityDays > weatherData.length * 0.3) {
      insights.push('Высокая влажность может влиять на общее самочувствие');
    }

    // Анализ качества воздуха
    const poorAirDays = weatherData.filter(d => 
      d.weather_data.air_quality.pm2_5 > 25).length;
    
    if (poorAirDays > 0) {
      insights.push('Загрязнение воздуха может усиливать некоторые симптомы');
    }

    // Анализ барометрического давления
    const lowPressureDays = weatherData.filter(d => 
      d.weather_data.current.pressure < 1010).length;
    
    if (lowPressureDays > weatherData.length * 0.2) {
      insights.push('Низкое атмосферное давление может влиять на головные боли и настроение');
    }

    // Анализ влияния на менопаузу
    const highImpactDays = weatherData.filter(d => 
      d.weather_data.biometric_factors.menopause_impact_score > 60).length;
    
    if (highImpactDays > weatherData.length * 0.2) {
      insights.push('Неблагоприятные погодные условия могут усиливать симптомы менопаузы');
    }

    if (insights.length === 0) {
      insights.push('Климатические условия в целом благоприятные для вашего самочувствия');
    }

    return insights;
  }

  /**
   * Генерирует рекомендации на основе анализа
   */
  private generateRecommendations(correlations: any, weatherData: any[]): string[] {
    const recommendations: string[] = [];

    // Рекомендации по температуре
    if (Math.abs(correlations.temperature_correlation) > 0.3) {
      recommendations.push('Следите за прогнозом погоды и планируйте активность в комфортные часы');
      recommendations.push('В жаркие дни увеличивайте потребление воды и избегайте перегрева');
    }

    // Рекомендации по влажности
    if (Math.abs(correlations.humidity_correlation) > 0.3) {
      recommendations.push('При высокой влажности используйте кондиционер или вентилятор');
      recommendations.push('В сухую погоду используйте увлажнитель воздуха');
    }

    // Рекомендации по давлению
    if (Math.abs(correlations.pressure_correlation) > 0.3) {
      recommendations.push('При резких изменениях погоды уделите внимание релаксации');
    }

    // Рекомендации по качеству воздуха
    if (Math.abs(correlations.air_quality_correlation) > 0.3) {
      recommendations.push('При плохом качестве воздуха ограничьте время на улице');
      recommendations.push('Рассмотрите использование очистителя воздуха дома');
    }

    // Общие рекомендации
    recommendations.push('Ведите дневник симптомов для выявления индивидуальных паттернов');
    recommendations.push('Обсуждайте выявленные корреляции с вашим врачом');

    return recommendations;
  }

  /**
   * Рассчитывает уровень доверия к анализу
   */
  private calculateConfidenceScore(dataPoints: number, correlations: any): number {
    let score = 0;

    // Базовая оценка на основе количества данных
    if (dataPoints >= 30) score += 40;
    else if (dataPoints >= 14) score += 25;
    else if (dataPoints >= 7) score += 15;

    // Оценка на основе силы корреляций
    const avgCorrelation = (
      Math.abs(correlations.temperature_correlation) +
      Math.abs(correlations.humidity_correlation) +
      Math.abs(correlations.pressure_correlation) +
      Math.abs(correlations.air_quality_correlation)
    ) / 4;

    score += avgCorrelation * 60;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Получает текущие рекомендации на основе погоды
   */
  async getCurrentWeatherRecommendations(userId: string): Promise<string[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('daily_weather_records')
        .select('weather_data')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!data) {
        return ['Нет данных о текущей погоде'];
      }

      const weather = data.weather_data as any;
      const recommendations: string[] = [];

      // Рекомендации на основе температуры
      if (weather.current?.temperature > 28) {
        recommendations.push('🌡️ Жаркая погода: пейте больше воды, избегайте перегрева');
        recommendations.push('👕 Носите легкую, дышащую одежду');
      } else if (weather.current?.temperature < 5) {
        recommendations.push('🥶 Холодная погода: одевайтесь теплее, согревайте конечности');
      }

      // Рекомендации на основе влажности
      if (weather.current?.humidity > 80) {
        recommendations.push('💨 Высокая влажность: используйте кондиционер или вентилятор');
      } else if (weather.current?.humidity < 30) {
        recommendations.push('💧 Низкая влажность: используйте увлажнитель, пейте больше воды');
      }

      // Рекомендации на основе УФ-индекса
      if (weather.current?.uv_index > 6) {
        recommendations.push('☀️ Высокий УФ-индекс: используйте солнцезащитный крем');
      }

      // Рекомендации на основе качества воздуха
      if (weather.air_quality?.pm2_5 > 35) {
        recommendations.push('😷 Плохое качество воздуха: ограничьте время на улице');
      }

      // Рекомендации на основе влияния на менопаузу
      if (weather.biometric_factors?.menopause_impact_score > 70) {
        recommendations.push('⚠️ Неблагоприятные условия: будьте внимательны к симптомам');
      }

      if (recommendations.length === 0) {
        recommendations.push('✅ Погодные условия благоприятные для активности');
      }

      return recommendations;

    } catch (error) {
      console.error('Error getting weather recommendations:', error);
      return ['Ошибка получения рекомендаций'];
    }
  }
}

export const weatherCorrelationService = new WeatherCorrelationService();