import { supabase } from '@/integrations/supabase/client';

export interface DailyAnalysisRequest {
  userId: string;
  analysisDate?: string;
}

export interface DailyAnalysisResult {
  success: boolean;
  sessionId?: string;
  summary?: string;
  error?: string;
}

export class DailyAnalysisService {
  static async triggerDailyAnalysis(userId: string, date?: string): Promise<DailyAnalysisResult> {
    try {
      console.log('Triggering daily health analysis for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('daily-health-analysis', {
        body: {
          userId,
          analysisDate: date || new Date().toISOString().split('T')[0]
        }
      });

      if (error) {
        console.error('Error invoking daily analysis:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to trigger daily analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getLatestAnalysis(userId: string): Promise<any> {
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
          confidence_score,
          created_at
        `)
        .eq('user_id', userId)
        .eq('session_type', 'daily_health_analysis')
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get latest analysis:', error);
      return null;
    }
  }

  static async getDailyInsights(userId: string, limit: number = 7): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'daily_analysis')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get daily insights:', error);
      return [];
    }
  }

  static async scheduleAutomaticAnalysis(userId: string, enabled: boolean): Promise<boolean> {
    try {
      // Проверяем существующий workflow
      const { data: existingWorkflow } = await supabase
        .from('automation_workflows')
        .select('id')
        .eq('user_id', userId)
        .eq('workflow_type', 'daily_analysis')
        .single();

      if (existingWorkflow) {
        // Обновляем существующий
        const { error } = await supabase
          .from('automation_workflows')
          .update({
            workflow_status: enabled ? 'active' : 'paused',
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
            workflow_name: 'Ежедневный анализ здоровья',
            workflow_type: 'daily_analysis',
            workflow_description: 'Автоматический анализ данных здоровья каждый день',
            trigger_type: 'schedule',
            trigger_conditions: {
              schedule: 'daily',
              time: '22:00',
              timezone: 'Europe/Moscow'
            },
            actions: {
              analysis_type: 'comprehensive',
              include_recommendations: true,
              send_notifications: true
            },
            workflow_status: 'active'
          });

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to schedule automatic analysis:', error);
      return false;
    }
  }
}