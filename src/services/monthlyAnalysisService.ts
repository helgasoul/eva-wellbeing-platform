import { supabase } from '@/integrations/supabase/client';

export interface MonthlyAnalysisRequest {
  userId: string;
  analysisMonth?: number;
  analysisYear?: number;
}

export interface MonthlyAnalysisResult {
  success: boolean;
  sessionId?: string;
  summary?: string;
  trends?: any;
  error?: string;
}

export class MonthlyAnalysisService {
  static async triggerMonthlyAnalysis(userId: string, month?: number, year?: number): Promise<MonthlyAnalysisResult> {
    try {
      console.log('Triggering monthly health analysis for user:', userId);
      
      const currentDate = new Date();
      const targetMonth = month || currentDate.getMonth() + 1;
      const targetYear = year || currentDate.getFullYear();
      
      const { data, error } = await supabase.functions.invoke('monthly-health-analysis', {
        body: {
          userId,
          analysisMonth: targetMonth,
          analysisYear: targetYear
        }
      });

      if (error) {
        console.error('Error invoking monthly analysis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to trigger monthly analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getLatestMonthlyAnalysis(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ai_analysis_sessions')
        .select(`
          id,
          analysis_date,
          processing_status,
          key_findings,
          patterns_detected,
          correlations_found,
          trends_identified,
          confidence_score,
          created_at
        `)
        .eq('user_id', userId)
        .eq('session_type', 'monthly_health_analysis')
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get latest monthly analysis:', error);
      return null;
    }
  }

  static async getMonthlyInsights(userId: string, limit: number = 3): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'monthly_analysis')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get monthly insights:', error);
      return [];
    }
  }

  static async getDocumentInsights(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'document_analysis')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get document insights:', error);
      return [];
    }
  }

  static async scheduleMonthlyAnalysis(userId: string, enabled: boolean, dayOfMonth: number = 1): Promise<boolean> {
    try {
      // Проверяем существующий workflow
      const { data: existingWorkflow } = await supabase
        .from('automation_workflows')
        .select('id')
        .eq('user_id', userId)
        .eq('workflow_type', 'monthly_analysis')
        .single();

      if (existingWorkflow) {
        // Обновляем существующий
        const { error } = await supabase
          .from('automation_workflows')
          .update({
            workflow_status: enabled ? 'active' : 'paused',
            trigger_conditions: {
              schedule: 'monthly',
              day_of_month: dayOfMonth,
              time: '09:00',
              timezone: 'Europe/Moscow'
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', existingWorkflow.id);

        if (error) throw error;
      } else if (enabled) {
        // Создаем новый workflow
        const { error } = await supabase
          .from('automation_workflows')
          .insert({
            user_id: userId,
            workflow_name: 'Ежемесячный анализ здоровья',
            workflow_type: 'monthly_analysis',
            workflow_description: 'Автоматический комплексный анализ данных здоровья каждый месяц',
            trigger_type: 'schedule',
            trigger_conditions: {
              schedule: 'monthly',
              day_of_month: dayOfMonth,
              time: '09:00',
              timezone: 'Europe/Moscow'
            },
            actions: {
              analysis_type: 'comprehensive_monthly',
              include_documents: true,
              include_trends: true,
              include_recommendations: true,
              send_notifications: true
            },
            workflow_status: 'active'
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule monthly analysis:', error);
      return false;
    }
  }

  static async getMonthlyTrends(userId: string, months: number = 6): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('ai_analysis_sessions')
        .select(`
          analysis_date,
          trends_identified,
          confidence_score,
          key_findings
        `)
        .eq('user_id', userId)
        .eq('session_type', 'monthly_health_analysis')
        .order('analysis_date', { ascending: false })
        .limit(months);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get monthly trends:', error);
      return [];
    }
  }
}