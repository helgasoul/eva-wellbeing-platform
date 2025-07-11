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
    const { healthData, symptomData, userProfile, analysisType } = await req.json();
    
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

    let prompt = '';
    
    switch (analysisType) {
      case 'symptom_pattern':
        prompt = `Analyze symptom patterns for menopause management:

Symptom Data: ${JSON.stringify(symptomData)}
User Profile: ${JSON.stringify(userProfile)}

Identify patterns, triggers, and provide insights for better symptom management.`;
        break;
        
      case 'health_correlation':
        prompt = `Analyze correlations between health metrics and symptoms:

Health Data: ${JSON.stringify(healthData)}
Symptom Data: ${JSON.stringify(symptomData)}
User Profile: ${JSON.stringify(userProfile)}

Find correlations and provide actionable insights.`;
        break;
        
      case 'personalized_recommendations':
        prompt = `Generate personalized health recommendations:

Health Data: ${JSON.stringify(healthData)}
Symptom Data: ${JSON.stringify(symptomData)}
User Profile: ${JSON.stringify(userProfile)}

Provide personalized recommendations for menopause management.`;
        break;
        
      default:
        prompt = `Analyze health data for comprehensive insights:

Health Data: ${JSON.stringify(healthData)}
Symptom Data: ${JSON.stringify(symptomData)}
User Profile: ${JSON.stringify(userProfile)}

Provide comprehensive health insights and recommendations.`;
    }

    prompt += `

Format response as JSON with these fields:
{
  "insights": [
    {
      "id": string,
      "type": string,
      "priority": "low" | "medium" | "high",
      "title": string,
      "description": string,
      "confidence": number,
      "actionable": boolean,
      "recommendations": string[]
    }
  ],
  "patterns": [
    {
      "pattern": string,
      "frequency": string,
      "impact": string,
      "triggers": string[]
    }
  ],
  "correlations": [
    {
      "factor1": string,
      "factor2": string,
      "strength": number,
      "description": string
    }
  ],
  "summary": string
}`;

    console.log('Sending request to Gemini API for health insights');
    
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
          temperature: 0.5,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1536,
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
      console.warn('Failed to parse Gemini response as JSON, using fallback structure');
      analysis = {
        insights: [{
          id: 'analysis_pending',
          type: 'general',
          priority: 'medium',
          title: 'Analysis Pending',
          description: 'Health analysis is being processed',
          confidence: 50,
          actionable: false,
          recommendations: []
        }],
        patterns: [],
        correlations: [],
        summary: 'Analysis requires manual review',
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
    console.error('Error in gemini-health-insights function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});