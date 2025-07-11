import { supabase } from "@/integrations/supabase/client";

export interface MealAnalysisResult {
  success: boolean;
  analysis?: {
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      keyMicronutrients: string[];
    };
    menopauseBenefits: string[];
    concerns: string[];
    improvements: string[];
    portionAssessment: string;
    timingRecommendations: string;
    rawAnalysis?: string;
  };
  error?: string;
}

export interface DocumentAnalysisResult {
  success: boolean;
  analysis?: {
    keyFindings: string[];
    abnormalValues: Array<{
      metric: string;
      value: string;
      normalRange: string;
      significance: string;
    }>;
    menopauseRelevance: string[];
    riskAssessment: {
      level: "low" | "medium" | "high" | "unknown";
      factors: string[];
    };
    recommendedActions: string[];
    patientSummary: string;
    rawAnalysis?: string;
  };
  error?: string;
}

export interface HealthInsightsResult {
  success: boolean;
  analysis?: {
    insights: Array<{
      id: string;
      type: string;
      priority: "low" | "medium" | "high";
      title: string;
      description: string;
      confidence: number;
      actionable: boolean;
      recommendations: string[];
    }>;
    patterns: Array<{
      pattern: string;
      frequency: string;
      impact: string;
      triggers: string[];
    }>;
    correlations: Array<{
      factor1: string;
      factor2: string;
      strength: number;
      description: string;
    }>;
    summary: string;
    rawAnalysis?: string;
  };
  error?: string;
}

export class GeminiService {
  static async analyzeMeal(
    mealData: any,
    userProfile: any
  ): Promise<MealAnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-meal-analysis', {
        body: {
          mealData,
          userProfile
        }
      });

      if (error) {
        console.error('Error calling gemini-meal-analysis:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in GeminiService.analyzeMeal:', error);
      return { success: false, error: 'Failed to analyze meal' };
    }
  }

  static async analyzeDocument(
    documentContent: string,
    documentType: string,
    userContext?: any
  ): Promise<DocumentAnalysisResult> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-document-analysis', {
        body: {
          documentContent,
          documentType,
          userContext
        }
      });

      if (error) {
        console.error('Error calling gemini-document-analysis:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in GeminiService.analyzeDocument:', error);
      return { success: false, error: 'Failed to analyze document' };
    }
  }

  static async generateHealthInsights(
    healthData: any,
    symptomData: any,
    userProfile: any,
    analysisType: 'symptom_pattern' | 'health_correlation' | 'personalized_recommendations' | 'comprehensive' = 'comprehensive'
  ): Promise<HealthInsightsResult> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-health-insights', {
        body: {
          healthData,
          symptomData,
          userProfile,
          analysisType
        }
      });

      if (error) {
        console.error('Error calling gemini-health-insights:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error in GeminiService.generateHealthInsights:', error);
      return { success: false, error: 'Failed to generate health insights' };
    }
  }
}