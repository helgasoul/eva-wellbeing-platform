import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
}

// Rate limiting configuration
const RATE_LIMITS = {
  requestsPerMinute: 60,
  dailyQuota: 10000,
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

    // Create sync log entry using secure function
    const { data: syncLogResult, error: syncLogError } = await supabase
      .rpc('create_health_sync_log_secure', {
        p_integration_id: integration_id,
        p_data_types_synced: data_types || []
      });

    if (syncLogError) {
      throw new Error(`Failed to create sync log: ${syncLogError.message}`);
    }

    const syncLogId = syncLogResult;

    const startTime = Date.now();
    let syncedRecords = 0;
    let failedRecords = 0;
    const errors: any[] = [];

    try {
      // Sync data based on provider
      const healthData = await syncProviderData(provider, integration, data_types, date_range);
      
      // Process and store the data with validation
      for (const dataPoint of healthData) {
        try {
          // Validate data point before storing
          if (!validateDataPoint(dataPoint)) {
            failedRecords++;
            errors.push({
              dataPoint: dataPoint.type,
              error: 'Invalid data point format',
              timestamp: dataPoint.timestamp
            });
            continue;
          }
          
          await retryWithExponentialBackoff(
            () => storeHealthData(supabase, integration.user_id, integration_id, dataPoint),
            `Store ${dataPoint.type} data`,
            2 // Lower retry count for storage operations
          );
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

    // Calculate sync results
    const syncDuration = Date.now() - startTime;
    const syncStatus = errors.length === 0 ? 'completed' : (syncedRecords > 0 ? 'partial' : 'failed');

    // Update sync log using secure function
    await supabase.rpc('update_health_sync_log_secure', {
      p_log_id: syncLogId,
      p_sync_status: syncStatus,
      p_records_synced: syncedRecords,
      p_records_failed: failedRecords,
      p_sync_duration_ms: syncDuration,
      p_error_details: errors.length > 0 ? errors : null
    });

    console.log('✅ Sync completed', { 
      syncedRecords, 
      failedRecords, 
      syncStatus, 
      duration: `${syncDuration}ms` 
    });

    return new Response(
      JSON.stringify({
        success: true,
        sync_id: syncLogId,
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

// Utility functions for retry logic and enhanced error handling
async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`❌ ${context} failed after ${maxRetries + 1} attempts:`, lastError.message);
        throw lastError;
      }
      
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelay
      );
      
      console.warn(`⚠️ ${context} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

function validateDataPoint(dataPoint: HealthDataPoint): boolean {
  if (!dataPoint.type || !dataPoint.timestamp) {
    return false;
  }
  
  if (dataPoint.value === null || dataPoint.value === undefined) {
    return false;
  }
  
  // Validate timestamp format
  const timestamp = new Date(dataPoint.timestamp);
  if (isNaN(timestamp.getTime())) {
    return false;
  }
  
  return true;
}

function generateRealisticMockData(provider: string, dataTypes?: string[]): HealthDataPoint[] {
  const now = new Date();
  const mockData: HealthDataPoint[] = [];
  
  // Generate data for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    switch (provider.toLowerCase()) {
      case 'apple_health':
        mockData.push(
          {
            type: 'steps',
            value: Math.floor(Math.random() * 5000) + 6000, // 6000-11000 steps
            timestamp: date.toISOString(),
            source: 'iPhone',
            unit: 'count',
            metadata: { confidence: Math.random() > 0.3 ? 'high' : 'medium' }
          },
          {
            type: 'heart_rate',
            value: Math.floor(Math.random() * 30) + 60, // 60-90 bpm
            timestamp: date.toISOString(),
            source: 'Apple Watch',
            unit: 'bpm',
            metadata: { context: 'active' }
          }
        );
        break;
      
      case 'whoop':
        mockData.push(
          {
            type: 'strain',
            value: Math.round((Math.random() * 10 + 8) * 10) / 10, // 8.0-18.0
            timestamp: date.toISOString(),
            source: 'Whoop 4.0',
            metadata: { 
              day_strain: Math.round((Math.random() * 10 + 8) * 10) / 10,
              max_hr: Math.floor(Math.random() * 40) + 150
            }
          },
          {
            type: 'recovery',
            value: Math.floor(Math.random() * 60) + 30, // 30-90%
            timestamp: date.toISOString(),
            source: 'Whoop 4.0',
            unit: 'percentage',
            metadata: { 
              hrv: Math.floor(Math.random() * 40) + 20,
              rhr: Math.floor(Math.random() * 20) + 45
            }
          }
        );
        break;
      
      case 'oura':
        mockData.push(
          {
            type: 'sleep',
            value: {
              total: Math.floor(Math.random() * 120) + 360, // 6-8 hours
              deep: Math.floor(Math.random() * 60) + 60,
              rem: Math.floor(Math.random() * 60) + 70,
              light: Math.floor(Math.random() * 100) + 200,
              efficiency: Math.floor(Math.random() * 20) + 75
            },
            timestamp: date.toISOString(),
            source: 'Oura Ring',
            unit: 'minutes',
            metadata: { sleep_score: Math.floor(Math.random() * 30) + 70 }
          }
        );
        break;
      
      case 'fitbit':
        mockData.push(
          {
            type: 'steps',
            value: Math.floor(Math.random() * 6000) + 5000, // 5000-11000 steps
            timestamp: date.toISOString(),
            source: 'Fitbit Charge 5',
            unit: 'count'
          },
          {
            type: 'calories',
            value: Math.floor(Math.random() * 800) + 1800, // 1800-2600 kcal
            timestamp: date.toISOString(),
            source: 'Fitbit Charge 5',
            unit: 'kcal'
          }
        );
        break;
      
      case 'garmin':
        if (Math.random() > 0.4) { // Not every day has a workout
          mockData.push({
            type: 'workout',
            value: {
              type: ['running', 'cycling', 'swimming'][Math.floor(Math.random() * 3)],
              duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 minutes
              distance: Math.round((Math.random() * 10 + 2) * 100) / 100, // 2-12 km
              calories: Math.floor(Math.random() * 400) + 200
            },
            timestamp: date.toISOString(),
            source: 'Garmin Forerunner',
            metadata: { 
              avg_pace: `${Math.floor(Math.random() * 3) + 4}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
              avg_hr: Math.floor(Math.random() * 50) + 130
            }
          });
        }
        break;
    }
  }
  
  return mockData.filter(item => !dataTypes || dataTypes.includes(item.type));
}

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
  return await retryWithExponentialBackoff(async () => {
    console.log('🍎 Syncing Apple Health data', { dataTypes, dateRange });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Occasionally simulate API errors for testing retry logic
    if (Math.random() < 0.1) {
      throw new Error('Apple Health API rate limit exceeded');
    }
    
    // Generate realistic mock data
    const mockData = generateRealisticMockData('apple_health', dataTypes);
    
    console.log(`✅ Successfully synced ${mockData.length} Apple Health data points`);
    return mockData;
  }, 'Apple Health data sync');
}

async function syncWhoopData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  return await retryWithExponentialBackoff(async () => {
    console.log('💪 Syncing Whoop data', { dataTypes, dateRange });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));
    
    // Occasionally simulate API errors
    if (Math.random() < 0.08) {
      throw new Error('Whoop API temporary unavailable');
    }
    
    const mockData = generateRealisticMockData('whoop', dataTypes);
    console.log(`✅ Successfully synced ${mockData.length} Whoop data points`);
    return mockData;
  }, 'Whoop data sync');
}

async function syncOuraData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  return await retryWithExponentialBackoff(async () => {
    console.log('💍 Syncing Oura data', { dataTypes, dateRange });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 400));
    
    // Occasionally simulate API errors
    if (Math.random() < 0.05) {
      throw new Error('Oura API authentication failed');
    }
    
    const mockData = generateRealisticMockData('oura', dataTypes);
    console.log(`✅ Successfully synced ${mockData.length} Oura data points`);
    return mockData;
  }, 'Oura data sync');
}

async function syncFitbitData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  return await retryWithExponentialBackoff(async () => {
    console.log('⌚ Syncing Fitbit data', { dataTypes, dateRange });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));
    
    // Occasionally simulate API errors
    if (Math.random() < 0.06) {
      throw new Error('Fitbit API quota exceeded');
    }
    
    const mockData = generateRealisticMockData('fitbit', dataTypes);
    console.log(`✅ Successfully synced ${mockData.length} Fitbit data points`);
    return mockData;
  }, 'Fitbit data sync');
}

async function syncGarminData(
  integration: any, 
  dataTypes?: string[], 
  dateRange?: { start: string; end: string }
): Promise<HealthDataPoint[]> {
  return await retryWithExponentialBackoff(async () => {
    console.log('🏃 Syncing Garmin data', { dataTypes, dateRange });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 900 + 400));
    
    // Occasionally simulate API errors
    if (Math.random() < 0.07) {
      throw new Error('Garmin Connect service unavailable');
    }
    
    const mockData = generateRealisticMockData('garmin', dataTypes);
    console.log(`✅ Successfully synced ${mockData.length} Garmin data points`);
    return mockData;
  }, 'Garmin data sync');
}

async function storeHealthData(
  supabase: any, 
  userId: string, 
  integrationId: string, 
  dataPoint: HealthDataPoint
) {
  const recordedDate = new Date(dataPoint.timestamp).toISOString().split('T')[0];
  
  const { data, error } = await supabase.rpc('insert_external_health_data_secure', {
    p_user_id: userId,
    p_integration_id: integrationId,
    p_data_type: dataPoint.type,
    p_data_payload: {
      value: dataPoint.value,
      unit: dataPoint.unit,
      source: dataPoint.source,
      metadata: dataPoint.metadata
    },
    p_external_id: `${dataPoint.type}_${dataPoint.timestamp}`,
    p_recorded_date: recordedDate,
    p_recorded_timestamp: dataPoint.timestamp,
    p_data_source: dataPoint.source,
    p_data_quality_score: 1.0
  });

  if (error) {
    throw new Error(`Failed to store health data: ${error.message}`);
  }

  return data;
}