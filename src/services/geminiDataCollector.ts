import { supabase } from "@/integrations/supabase/client";

export interface DataCollectorConfig {
  integrationId: string;
  provider: string;
  dataTypes: string[];
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  autoRetry: boolean;
  maxRetries: number;
}

export interface SyncResult {
  success: boolean;
  syncId: string;
  recordsSynced: number;
  recordsFailed: number;
  syncStatus: 'completed' | 'partial' | 'failed';
  durationMs: number;
  errors?: any[];
}

export class GeminiDataCollector {
  private config: DataCollectorConfig;

  constructor(config: DataCollectorConfig) {
    this.config = config;
  }

  async startSync(fullSync = false): Promise<SyncResult> {
    try {
      console.log(`Starting Gemini data sync for ${this.config.provider}`);

      const dateRange = fullSync ? this.getFullSyncDateRange() : this.getIncrementalDateRange();

      const { data, error } = await supabase.functions.invoke('health-data-sync', {
        body: {
          integration_id: this.config.integrationId,
          provider: this.config.provider,
          data_types: this.config.dataTypes,
          date_range: dateRange
        }
      });

      if (error) {
        throw new Error(`Sync function error: ${error.message}`);
      }

      return {
        success: data.success,
        syncId: data.sync_id,
        recordsSynced: data.synced_records,
        recordsFailed: data.failed_records,
        syncStatus: data.sync_status,
        durationMs: data.duration_ms,
        errors: data.errors
      };

    } catch (error) {
      console.error('Gemini data sync failed:', error);
      throw error;
    }
  }

  async scheduleSync(): Promise<void> {
    // In a real implementation, this would register a scheduled job
    // For now, we'll simulate scheduling by setting up a sync log
    
    const { error } = await supabase
      .from('health_data_sync_logs')
      .insert({
        integration_id: this.config.integrationId,
        sync_status: 'scheduled',
        data_types_synced: this.config.dataTypes
      });

    if (error) {
      throw new Error(`Failed to schedule sync: ${error.message}`);
    }

    console.log(`Scheduled ${this.config.syncFrequency} sync for ${this.config.provider}`);
  }

  async getSyncHistory(limit = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('health_data_sync_logs')
      .select('*')
      .eq('integration_id', this.config.integrationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get sync history: ${error.message}`);
    }

    return data || [];
  }

  async getDataQualityMetrics(): Promise<{
    totalRecords: number;
    averageQuality: number;
    errorRate: number;
    lastSyncAt: string | null;
  }> {
    const { data: healthData, error: healthError } = await supabase
      .from('external_health_data')
      .select('data_quality_score, created_at')
      .eq('integration_id', this.config.integrationId);

    if (healthError) {
      throw new Error(`Failed to get data quality metrics: ${healthError.message}`);
    }

    const { data: syncLogs, error: syncError } = await supabase
      .from('health_data_sync_logs')
      .select('records_synced, records_failed, sync_completed_at')
      .eq('integration_id', this.config.integrationId)
      .not('sync_completed_at', 'is', null)
      .order('sync_completed_at', { ascending: false })
      .limit(10);

    if (syncError) {
      throw new Error(`Failed to get sync metrics: ${syncError.message}`);
    }

    const totalRecords = healthData?.length || 0;
    const averageQuality = totalRecords > 0 
      ? healthData!.reduce((sum, record) => sum + (record.data_quality_score || 0), 0) / totalRecords
      : 0;

    const totalSynced = syncLogs?.reduce((sum, log) => sum + (log.records_synced || 0), 0) || 0;
    const totalFailed = syncLogs?.reduce((sum, log) => sum + (log.records_failed || 0), 0) || 0;
    const errorRate = totalSynced + totalFailed > 0 
      ? totalFailed / (totalSynced + totalFailed)
      : 0;

    const lastSyncAt = syncLogs?.[0]?.sync_completed_at || null;

    return {
      totalRecords,
      averageQuality,
      errorRate,
      lastSyncAt
    };
  }

  private getFullSyncDateRange(): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1); // Last year

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }

  private getIncrementalDateRange(): { start: string; end: string } {
    const end = new Date();
    const start = new Date();
    
    switch (this.config.syncFrequency) {
      case 'real-time':
      case 'hourly':
        start.setHours(start.getHours() - 1);
        break;
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    };
  }
}

export async function createGeminiIntegration(
  userId: string,
  provider: string,
  config: Partial<DataCollectorConfig>
): Promise<{ integrationId: string; collector: GeminiDataCollector }> {
  
  const { data: integration, error } = await supabase
    .from('health_app_integrations')
    .insert({
      user_id: userId,
      app_name: provider,
      provider_name: provider,
      integration_type: 'oauth',
      sync_frequency: config.syncFrequency || 'daily',
      integration_status: 'active'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create integration: ${error.message}`);
  }

  const collectorConfig: DataCollectorConfig = {
    integrationId: integration.id,
    provider,
    dataTypes: config.dataTypes || ['steps', 'heart_rate', 'sleep'],
    syncFrequency: config.syncFrequency || 'daily',
    autoRetry: config.autoRetry ?? true,
    maxRetries: config.maxRetries || 3
  };

  const collector = new GeminiDataCollector(collectorConfig);

  return {
    integrationId: integration.id,
    collector
  };
}