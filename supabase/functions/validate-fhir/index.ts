import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fhir_resource } = await req.json()
    
    // Basic FHIR validation - in production use proper FHIR validation library
    const validation = validateFHIRResource(fhir_resource)
    
    return new Response(
      JSON.stringify(validation),
      { 
        status: validation.valid ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ valid: false, errors: [(error as Error).message] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function validateFHIRResource(resource: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = []
  
  if (!resource.resourceType) {
    errors.push('Missing resourceType')
  }
  
  if (!resource.id) {
    errors.push('Missing resource id')
  }
  
  // Additional FHIR validation logic would go here
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  }
}