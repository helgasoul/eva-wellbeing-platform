import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthDataPoint {
  type: string;
  value: number | string | object;
  timestamp: string;
  source?: string;
  unit?: string;
  metadata?: Record<string, any>;
}

interface SyncRequest {
  integration_id: string;
  provider: string;
  data_types?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { integration_id, provider, data_types, date_range }: SyncRequest = await req.json();

    console.log('🔄 Starting health data sync', { integration_id, provider, data_types });

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('health_app_integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (integrationError || !integration) {
      throw new Error(`Integration not found: ${integrationError?.message}`);
    }

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('health_data_sync_logs')
      .insert({
        integration_id,
        sync_status: 'running',
        data_types_synced: data_types || []
      })
      .select()
      .single();

    if (syncLogError) {
      throw new Error(`Failed to create sync log: ${syncLogError.message}`);
    }

    const startTime = Date.now();
    let syncedRecords = 0;
    let failedRecords = 0;
    const errors: any[] = [];

    try {
      // Sync data based on provider
      const healthData = await syncProviderData(provider, integration, data_types, date_range);
      
      // Process and store the data
      for (const dataPoint of healthData) {
        try {
          await storeHealthData(supabase, integration.user_id, integration_id, dataPoint);
          syncedRecords++;
        } catch (error) {
          console.error('Failed to store health data point:', error);
          failedRecords++;
          errors.push({
            dataPoint: dataPoint.type,
            error: error.message,
            timestamp: dataPoint.timestamp
          });
        }
      }

      // Update integration last sync time
      await supabase
        .from('health_app_integrations')
        .update({ 
          last_sync_at: new Date().toISOString(),
          integration_status: 'active'
        })
        .eq('id', integration_id);

    } catch (syncError) {
      console.error('Sync error:', syncError);
      errors.push({ error: syncError.message });
      
      // Update integration status to error
      await supabase
        .from('health_app_integrations')
        .update({ 
          integration_status: 'error',
          error_details: { error: syncError.message, timestamp: new Date().toISOString() }
        })
        .eq('id', integration_id);
    }

    // Update sync log
    const syncDuration = Date.now() - startTime;
    const syncStatus = errors.length === 0 ? 'completed' : (syncedRecords > 0 ? 'partial' : 'failed');

    await supabase
      .from('health_data_sync_logs')
      .update({
        sync_completed_at: new Date().toISOString(),
        sync_status: syncStatus,
        records_synced: syncedRecords,
        records_failed: failedRecords,
        sync_duration_ms: syncDuration,
        error_details: errors.length > 0 ? errors : null
      })
      .eq('id', syncLog.id);

    console.log('✅ Sync completed', { 
      syncedRecords, 
      failedRecords, 
      syncStatus, 
      duration: `${syncDuration}ms` 
    });

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncLog.id,
        synced_records: syncedRecords,
        failed_records: failedRecords,
        sync_status: syncStatus,
        duration_ms: syncDuration,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Health data sync failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function syncProviderData(
  provider: string, 
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  
  const defaultDateRange = dateRange || {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
    end: new Date().toISOString()
  };

  switch (provider.toLowerCase()) {
    case 'apple_health':
      return await syncAppleHealthData(integration, dataTypes, defaultDateRange);
    case 'whoop':
      return await syncWhoopData(integration, dataTypes, defaultDateRange);
    case 'oura':
      return await syncOuraData(integration, dataTypes, defaultDateRange);
    case 'fitbit':
      return await syncFitbitData(integration, dataTypes, defaultDateRange);
    case 'garmin':
      return await syncGarminData(integration, dataTypes, defaultDateRange);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function syncAppleHealthData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  // Apple Health Kit integration would go here
  // For now, return mock data
  console.log('🍎 Syncing Apple Health data');
  
  return [
    {
      type: 'steps',
      value: 8524,
      timestamp: new Date().toISOString(),
      source: 'iPhone',
      unit: 'count',
      metadata: { confidence: 'high' }
    },
    {
      type: 'heart_rate',
      value: 72,
      timestamp: new Date().toISOString(),
      source: 'Apple Watch',
      unit: 'bpm',
      metadata: { context: 'resting' }
    }
  ];
}

async function syncWhoopData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  console.log('💪 Syncing Whoop data');
  
  // Mock Whoop API call
  return [
    {
      type: 'strain',
      value: 14.2,
      timestamp: new Date().toISOString(),
      source: 'Whoop 4.0',
      metadata: { day_strain: 14.2, max_hr: 165 }
    },
    {
      type: 'recovery',
      value: 68,
      timestamp: new Date().toISOString(),
      source: 'Whoop 4.0',
      unit: 'percentage',
      metadata: { hrv: 42, rhr: 48 }
    }
  ];
}

async function syncOuraData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  console.log('💍 Syncing Oura data');
  
  return [
    {
      type: 'sleep',
      value: {
        total: 445,
        deep: 87,
        rem: 92,
        light: 266,
        efficiency: 89
      },
      timestamp: new Date().toISOString(),
      source: 'Oura Ring',
      unit: 'minutes',
      metadata: { sleep_score: 82 }
    },
    {
      type: 'readiness',
      value: 85,
      timestamp: new Date().toISOString(),
      source: 'Oura Ring',
      unit: 'score'
    }
  ];
}

async function syncFitbitData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  console.log('⌚ Syncing Fitbit data');
  
  return [
    {
      type: 'steps',
      value: 9847,
      timestamp: new Date().toISOString(),
      source: 'Fitbit Charge 5'
    },
    {
      type: 'calories',
      value: 2156,
      timestamp: new Date().toISOString(),
      source: 'Fitbit Charge 5',
      unit: 'kcal'
    }
  ];
}

async function syncGarminData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  console.log('🏃 Syncing Garmin data');
  
  return [
    {
      type: 'workout',
      value: {
        type: 'running',
        duration: 2100,
        distance: 5.2,
        calories: 312
      },
      timestamp: new Date().toISOString(),
      source: 'Garmin Forerunner',
      metadata: { avg_pace: '6:45', avg_hr: 152 }
    }
  ];
}

async function storeHealthData(
  supabase: any, 
  userId: string, 
  integrationId: string, 
  dataPoint: HealthDataPoint
) {
  const recordedDate = new Date(dataPoint.timestamp).toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('external_health_data')
    .upsert({
      user_id: userId,
      integration_id: integrationId,
      data_type: dataPoint.type,
      data_payload: {
        value: dataPoint.value,
        unit: dataPoint.unit,
        source: dataPoint.source,
        metadata: dataPoint.metadata
      },
      external_id: `${dataPoint.type}_${dataPoint.timestamp}`,
      recorded_date: recordedDate,
      recorded_timestamp: dataPoint.timestamp,
      data_source: dataPoint.source,
      data_quality_score: 1.0,
      is_processed: false
    }, {
      onConflict: 'integration_id,external_id,data_type'
    });

  if (error) {
    throw new Error(`Failed to store health data: ${error.message}`);
  }
}