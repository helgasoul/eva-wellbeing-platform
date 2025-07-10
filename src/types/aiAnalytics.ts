export interface CorrelationAnalysis {
  id: string;
  user_id: string;
  analysis_type: string; // 'symptoms_weather', 'nutrition_mood', etc.
  correlation_strength: number; // -1 to 1
  insights: {
    pattern_description: string;
    strength_interpretation: string;
    statistical_significance: number;
    sample_size: number;
    time_period: {
      start: string;
      end: string;
    };
  };
  recommendations?: {
    actions: string[];
    priority: 'low' | 'medium' | 'high';
    expected_impact: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: string; // 'pattern', 'trigger', 'improvement', 'warning'
  confidence_score: number; // 0-1
  insight_data: {
    title: string;
    description: string;
    key_findings: string[];
    data_sources: string[];
    trends: Array<{
      metric: string;
      direction: 'improving' | 'worsening' | 'stable';
      change_percentage: number;
    }>;
  };
  actionable_recommendations?: {
    immediate_actions: string[];
    long_term_strategies: string[];
    monitoring_suggestions: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface SymptomPrediction {
  id: string;
  user_id: string;
  prediction_date: string; // YYYY-MM-DD
  predicted_symptoms: {
    hot_flashes: {
      probability: number; // 0-1
      expected_severity: number; // 1-5
      expected_frequency: number;
    };
    mood_changes: {
      probability: number;
      expected_severity: number;
      likely_types: string[];
    };
    sleep_issues: {
      probability: number;
      expected_quality: number; // 1-5
    };
    energy_levels: {
      expected_level: number; // 1-5
      probability_low_energy: number;
    };
  };
  confidence_level: number; // 0-1
  based_on_factors: {
    weather_forecast?: {
      temperature: number;
      humidity: number;
      pressure_change: number;
    };
    cycle_phase?: string;
    recent_nutrition_patterns?: string[];
    recent_stress_levels?: number[];
    seasonal_patterns?: string;
  };
  actual_symptoms?: any; // заполняется после даты
  prediction_accuracy?: number; // вычисляется постфактум
  created_at: string;
  updated_at: string;
}

export interface CorrelationResults {
  correlations: CorrelationAnalysis[];
  summary: {
    strongest_correlations: Array<{
      factors: string[];
      strength: number;
      description: string;
    }>;
    key_triggers: string[];
    protective_factors: string[];
  };
}

export interface AnalysisResults {
  correlations: CorrelationResults;
  insights: AIInsight[];
  predictions: SymptomPrediction[];
  generated_at: string;
}

export interface PredictionAccuracyMetrics {
  overall_accuracy: number;
  accuracy_by_symptom: Record<string, number>;
  improvement_suggestions: string[];
}