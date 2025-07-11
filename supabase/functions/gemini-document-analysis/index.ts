import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, documentType, userContext } = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const prompt = `Analyze this medical document for a menopausal woman and extract key insights:

Document Type: ${documentType}
Document Content: ${documentContent}
User Context: ${JSON.stringify(userContext)}

Please provide:
1. Key findings and abnormal values
2. Relevance to menopause symptoms
3. Risk assessment
4. Recommended actions
5. Summary for patient understanding

Format as JSON with these fields:
{
  "keyFindings": string[],
  "abnormalValues": [
    {
      "metric": string,
      "value": string,
      "normalRange": string,
      "significance": string
    }
  ],
  "menopauseRelevance": string[],
  "riskAssessment": {
    "level": "low" | "medium" | "high",
    "factors": string[]
  },
  "recommendedActions": string[],
  "patientSummary": string
}`;

    console.log('Sending request to Gemini API for document analysis');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Gemini API');
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const analysisText = data.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON, fallback to structured response if it fails
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON, using structured text');
      analysis = {
        keyFindings: [],
        abnormalValues: [],
        menopauseRelevance: [],
        riskAssessment: {
          level: "unknown",
          factors: []
        },
        recommendedActions: [],
        patientSummary: "Analysis pending manual review",
        rawAnalysis: analysisText
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-document-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});