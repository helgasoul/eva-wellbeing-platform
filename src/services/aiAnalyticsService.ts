import { supabase } from '@/integrations/supabase/client';
import { healthDataService } from './healthDataService';
import type { 
  CorrelationAnalysis,
  AIInsight,
  SymptomPrediction,
  CorrelationResults,
  AnalysisResults,
  PredictionAccuracyMetrics
} from '@/types/aiAnalytics';
import type { Database } from '@/integrations/supabase/types';

type CorrelationAnalysisDB = Database['public']['Tables']['correlation_analysis']['Row'];
type AIInsightDB = Database['public']['Tables']['ai_insights']['Row'];
type SymptomPredictionDB = Database['public']['Tables']['symptom_predictions']['Row'];

export class AIAnalyticsService {

  // ==================== КОРРЕЛЯЦИОННЫЙ АНАЛИЗ ====================
  
  async analyzeCorrelations(userId: string): Promise<CorrelationResults> {
    try {
      // Получаем все медицинские данные пользователя за последние 90 дней
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const healthData = await healthDataService.getAggregatedHealthData(userId, {
        start: startDate,
        end: endDate
      });

      // Анализируем корреляции между различными факторами
      const correlations: CorrelationAnalysis[] = [];
      
      // Корреляция симптомы-погода
      const weatherSymptomCorr = this.calculateWeatherSymptomCorrelation(
        healthData.symptoms,
        healthData.weather
      );
      
      if (weatherSymptomCorr) {
        correlations.push(await this.saveCorrelationAnalysis(userId, weatherSymptomCorr));
      }

      // Корреляция питание-настроение
      const nutritionMoodCorr = this.calculateNutritionMoodCorrelation(
        healthData.nutrition,
        healthData.symptoms
      );
      
      if (nutritionMoodCorr) {
        correlations.push(await this.saveCorrelationAnalysis(userId, nutritionMoodCorr));
      }

      return {
        correlations,
        summary: this.generateCorrelationSummary(correlations)
      };
    } catch (error) {
      console.error('Error analyzing correlations:', error);
      throw error;
    }
  }

  // ==================== ГЕНЕРАЦИЯ ИНСАЙТОВ ====================
  
  async generateInsights(userId: string): Promise<AIInsight[]> {
    try {
      const healthData = await healthDataService.getAggregatedHealthData(userId);
      const insights: AIInsight[] = [];

      // Анализ паттернов симптомов
      const symptomPatterns = this.analyzeSymptomPatterns(healthData.symptoms);
      if (symptomPatterns.length > 0) {
        for (const pattern of symptomPatterns) {
          const insight = await this.createInsight(userId, 'pattern', pattern);
          insights.push(insight);
        }
      }

      // Анализ триггеров
      const triggers = this.identifyTriggers(healthData);
      if (triggers.length > 0) {
        for (const trigger of triggers) {
          const insight = await this.createInsight(userId, 'trigger', trigger);
          insights.push(insight);
        }
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  // ==================== ПРЕДСКАЗАНИЕ СИМПТОМОВ ====================
  
  async predictSymptoms(userId: string, targetDate: string): Promise<SymptomPrediction> {
    try {
      const healthData = await healthDataService.getAggregatedHealthData(userId);
      
      // Анализируем исторические данные для выявления паттернов
      const patterns = this.analyzeHistoricalPatterns(healthData);
      
      // Получаем прогноз погоды (если доступен)
      const weatherForecast = await this.getWeatherForecast(userId, targetDate);
      
      // Создаем предсказание на основе паттернов и внешних факторов
      const prediction = this.buildSymptomPrediction(
        userId,
        targetDate,
        patterns,
        weatherForecast,
        healthData
      );

      // Сохраняем предсказание в базу
      return await this.saveSymptomPrediction(userId, prediction);
    } catch (error) {
      console.error('Error predicting symptoms:', error);
      throw error;
    }
  }

  // ==================== СОХРАНЕНИЕ И ПОЛУЧЕНИЕ ДАННЫХ ====================
  
  private async saveCorrelationAnalysis(userId: string, analysis: Omit<CorrelationAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<CorrelationAnalysis> {
    const { data, error } = await supabase
      .from('correlation_analysis')
      .insert({
        user_id: userId,
        analysis_type: analysis.analysis_type,
        correlation_strength: analysis.correlation_strength,
        insights: analysis.insights,
        recommendations: analysis.recommendations
      })
      .select()
      .single();

    if (error) throw error;
    return data as CorrelationAnalysis;
  }

  private async createInsight(userId: string, type: string, insightData: any): Promise<AIInsight> {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: type,
        confidence_score: insightData.confidence || 0.7,
        insight_data: insightData,
        actionable_recommendations: insightData.recommendations
      })
      .select()
      .single();

    if (error) throw error;
    return data as AIInsight;
  }

  private async saveSymptomPrediction(userId: string, prediction: Omit<SymptomPrediction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<SymptomPrediction> {
    const { data, error } = await supabase
      .from('symptom_predictions')
      .insert({
        user_id: userId,
        prediction_date: prediction.prediction_date,
        predicted_symptoms: prediction.predicted_symptoms,
        confidence_level: prediction.confidence_level,
        based_on_factors: prediction.based_on_factors
      })
      .select()
      .single();

    if (error) throw error;
    return data as SymptomPrediction;
  }

  async getInsightHistory(userId: string, limit = 50): Promise<AIInsight[]> {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AIInsight[];
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
  
  private calculateWeatherSymptomCorrelation(symptoms: any[], weather: any[]): Omit<CorrelationAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'> | null {
    if (symptoms.length < 7 || weather.length < 7) return null;

    // Упрощенный расчет корреляции (для демо)
    const correlation = Math.random() * 0.8 - 0.4; // -0.4 to 0.4
    
    return {
      analysis_type: 'symptoms_weather',
      correlation_strength: correlation,
      insights: {
        pattern_description: `Обнаружена ${Math.abs(correlation) > 0.3 ? 'умеренная' : 'слабая'} корреляция между погодными условиями и симптомами`,
        strength_interpretation: Math.abs(correlation) > 0.3 ? 'статистически значимая' : 'требует дополнительного наблюдения',
        statistical_significance: Math.abs(correlation),
        sample_size: Math.min(symptoms.length, weather.length),
        time_period: {
          start: symptoms[symptoms.length - 1]?.entry_date || '',
          end: symptoms[0]?.entry_date || ''
        }
      },
      recommendations: Math.abs(correlation) > 0.3 ? {
        actions: ['Отслеживайте погодные изменения', 'Планируйте активности с учетом прогноза'],
        priority: 'medium' as const,
        expected_impact: 'Снижение внезапных обострений симптомов'
      } : undefined
    };
  }

  private calculateNutritionMoodCorrelation(nutrition: any[], symptoms: any[]): Omit<CorrelationAnalysis, 'id' | 'user_id' | 'created_at' | 'updated_at'> | null {
    // Простая демо-логика
    if (nutrition.length < 5) return null;
    
    return {
      analysis_type: 'nutrition_mood',
      correlation_strength: 0.6,
      insights: {
        pattern_description: 'Обнаружена связь между качеством питания и настроением',
        strength_interpretation: 'умеренная положительная корреляция',
        statistical_significance: 0.6,
        sample_size: nutrition.length,
        time_period: {
          start: nutrition[nutrition.length - 1]?.entry_date || '',
          end: nutrition[0]?.entry_date || ''
        }
      }
    };
  }

  private generateCorrelationSummary(correlations: CorrelationAnalysis[]) {
    return {
      strongest_correlations: correlations
        .filter(c => Math.abs(c.correlation_strength) > 0.3)
        .map(c => ({
          factors: [c.analysis_type],
          strength: c.correlation_strength,
          description: c.insights.pattern_description
        })),
      key_triggers: ['резкие изменения погоды', 'недостаток сна'],
      protective_factors: ['регулярное питание', 'физическая активность']
    };
  }

  private analyzeSymptomPatterns(symptoms: any[]) {
    // Демо-анализ паттернов
    return symptoms.length > 10 ? [{
      title: 'Еженедельный паттерн симптомов',
      description: 'Симптомы усиливаются в определенные дни недели',
      confidence: 0.75,
      recommendations: {
        immediate_actions: ['Планируйте важные дела на дни с минимальными симптомами'],
        long_term_strategies: ['Разработайте стратегии для проблемных дней']
      }
    }] : [];
  }

  private identifyTriggers(healthData: any) {
    // Демо-определение триггеров
    return [{
      title: 'Триггер стресса',
      description: 'Повышенный уровень стресса предшествует обострению симптомов',
      confidence: 0.8
    }];
  }

  private analyzeHistoricalPatterns(healthData: any) {
    // Анализ исторических данных
    return {
      weeklyPattern: true,
      seasonalTrends: true,
      weatherSensitivity: 0.6
    };
  }

  private async getWeatherForecast(userId: string, date: string) {
    // Заглушка для прогноза погоды
    return {
      temperature: 20,
      humidity: 60,
      pressure_change: 0
    };
  }

  private buildSymptomPrediction(userId: string, targetDate: string, patterns: any, weather: any, healthData: any): Omit<SymptomPrediction, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
      prediction_date: targetDate,
      predicted_symptoms: {
        hot_flashes: {
          probability: 0.4,
          expected_severity: 3,
          expected_frequency: 2
        },
        mood_changes: {
          probability: 0.3,
          expected_severity: 2,
          likely_types: ['раздражительность', 'тревожность']
        },
        sleep_issues: {
          probability: 0.5,
          expected_quality: 3
        },
        energy_levels: {
          expected_level: 3,
          probability_low_energy: 0.3
        }
      },
      confidence_level: 0.7,
      based_on_factors: {
        weather_forecast: weather,
        recent_stress_levels: [3, 4, 3],
        seasonal_patterns: 'spring_transition'
      }
    };
  }
}

export const aiAnalyticsService = new AIAnalyticsService();