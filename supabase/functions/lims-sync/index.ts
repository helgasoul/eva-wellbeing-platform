import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { partner_id } = await req.json()
    
    if (!partner_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Partner ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get partner configuration
    const { data: partner, error: partnerError } = await supabase
      .from('medical_partners')
      .select(`
        *,
        partner_api_configurations (*)
      `)
      .eq('id', partner_id)
      .single()

    if (partnerError || !partner) {
      return new Response(
        JSON.stringify({ success: false, message: 'Partner not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const startTime = Date.now()
    let recordsSynced = 0
    let errors: string[] = []

    try {
      // Get API configuration for LIMS
      const apiConfig = partner.partner_api_configurations?.find(
        (config: any) => config.api_type === 'lims'
      )

      if (!apiConfig) {
        throw new Error('LIMS API configuration not found for partner')
      }

      // Sync lab orders
      const ordersResponse = await syncLabOrders(apiConfig)
      recordsSynced += ordersResponse.count

      // Sync lab results  
      const resultsResponse = await syncLabResults(apiConfig)
      recordsSynced += resultsResponse.count

      // Log successful sync
      await supabase
        .from('integration_audit_logs')
        .insert({
          partner_id,
          operation_type: 'full_sync',
          endpoint_called: 'lims-sync',
          records_processed: recordsSynced,
          processing_time_ms: Date.now() - startTime,
          compliance_check_passed: true,
          status_code: 200
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully synced ${recordsSynced} records`,
          records_synced: recordsSynced
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (syncError) {
      console.error('Sync error:', syncError)
      
      // Log failed sync
      await supabase
        .from('integration_audit_logs')
        .insert({
          partner_id,
          operation_type: 'full_sync',
          endpoint_called: 'lims-sync',
          error_message: (syncError as Error).message,
          processing_time_ms: Date.now() - startTime,
          compliance_check_passed: false,
          status_code: 500
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Sync failed: ' + (syncError as Error).message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, message: (error as Error).message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncLabOrders(apiConfig: any): Promise<{ count: number }> {
  // Mock implementation - in real scenario, would call external LIMS API
  console.log('Syncing lab orders from:', apiConfig.base_url)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { count: 5 }
}

async function syncLabResults(apiConfig: any): Promise<{ count: number }> {
  // Mock implementation - in real scenario, would call external LIMS API
  console.log('Syncing lab results from:', apiConfig.base_url)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return { count: 12 }
}