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

    const { partner_id, hl7_message, user_id } = await req.json()
    
    if (!partner_id || !hl7_message || !user_id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const startTime = Date.now()

    try {
      // Parse HL7 message
      const parsedData = parseHL7Message(hl7_message)
      
      if (parsedData.messageType === 'ORM') {
        // Order message - create lab order
        const labOrder = {
          user_id,
          partner_id,
          order_number: parsedData.orderNumber,
          external_order_id: parsedData.externalId,
          ordering_provider_name: parsedData.provider?.name,
          ordering_provider_npi: parsedData.provider?.npi,
          patient_demographics: parsedData.patient,
          ordered_tests: parsedData.tests,
          clinical_notes: parsedData.notes,
          priority_level: parsedData.priority || 'routine',
          order_status: 'pending',
          hl7_message: hl7_message,
          integration_metadata: {
            message_type: parsedData.messageType,
            processed_at: new Date().toISOString()
          }
        }

        const { data: order } = await supabase
          .from('lab_orders')
          .insert(labOrder)
          .select()
          .single()

        await logActivity(supabase, {
          partner_id,
          user_id,
          operation_type: 'hl7_order_processed',
          records_processed: 1,
          processing_time_ms: Date.now() - startTime
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'HL7 order message processed',
            order_id: order?.id
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      } else if (parsedData.messageType === 'ORU') {
        // Result message - create lab results
        const results = parsedData.results?.map((result: any) => ({
          user_id,
          partner_id,
          test_code: result.test_code,
          test_name: result.test_name,
          result_value: result.value,
          result_numeric: result.numeric_value,
          result_units: result.units,
          reference_range: result.reference_range,
          abnormal_flag: result.abnormal_flag,
          result_status: 'final',
          performed_date: result.performed_date,
          reported_date: new Date().toISOString(),
          loinc_code: result.loinc_code,
          hl7_segment: result.raw_segment
        })) || []

        if (results.length > 0) {
          await supabase
            .from('lab_results')
            .insert(results)
        }

        await logActivity(supabase, {
          partner_id,
          user_id,
          operation_type: 'hl7_results_processed',
          records_processed: results.length,
          processing_time_ms: Date.now() - startTime
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `HL7 results processed: ${results.length} results`
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ success: false, message: 'Unsupported HL7 message type' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (processingError) {
      console.error('HL7 processing error:', processingError)
      
      await logActivity(supabase, {
        partner_id,
        user_id,
        operation_type: 'hl7_processing_failed',
        error_message: (processingError as Error).message,
        processing_time_ms: Date.now() - startTime
      })

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'HL7 processing failed: ' + (processingError as Error).message
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

function parseHL7Message(hl7Message: string): any {
  // Basic HL7 parser - in production, use a proper HL7 parsing library
  const segments = hl7Message.split('\r').filter(s => s.length > 0)
  const result: any = { segments: [] }
  
  for (const segment of segments) {
    const fields = segment.split('|')
    const segmentType = fields[0]
    
    if (segmentType === 'MSH') {
      result.messageType = fields[8]?.split('^')[0]
    } else if (segmentType === 'PID') {
      result.patient = {
        id: fields[3],
        name: fields[5],
        birth_date: fields[7],
        gender: fields[8]
      }
    } else if (segmentType === 'ORC') {
      result.orderNumber = fields[2]
      result.externalId = fields[3]
    } else if (segmentType === 'OBR') {
      result.tests = result.tests || []
      result.tests.push({
        test_code: fields[4]?.split('^')[0],
        test_name: fields[4]?.split('^')[1]
      })
    } else if (segmentType === 'OBX') {
      result.results = result.results || []
      result.results.push({
        test_code: fields[3]?.split('^')[0],
        test_name: fields[3]?.split('^')[1],
        value: fields[5],
        units: fields[6],
        reference_range: fields[7],
        abnormal_flag: fields[8],
        raw_segment: segment
      })
    }
  }
  
  return result
}

async function logActivity(supabase: any, activity: any) {
  await supabase
    .from('integration_audit_logs')
    .insert({
      ...activity,
      compliance_check_passed: !activity.error_message,
      status_code: activity.error_message ? 500 : 200
    })
}