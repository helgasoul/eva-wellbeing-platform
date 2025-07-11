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
    const { mealData, userProfile } = await req.json();
    
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

    const prompt = `Analyze this meal data and provide nutritional insights for a menopausal woman:

Meal: ${JSON.stringify(mealData)}
User Profile: ${JSON.stringify(userProfile)}

Please provide:
1. Nutritional analysis (macros, key micronutrients)
2. Benefits for menopause symptoms
3. Any concerns or improvements
4. Portion size assessment
5. Timing recommendations

Format as JSON with these fields:
{
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "keyMicronutrients": string[]
  },
  "menopauseBenefits": string[],
  "concerns": string[],
  "improvements": string[],
  "portionAssessment": string,
  "timingRecommendations": string
}`;

    console.log('Sending request to Gemini API for meal analysis');
    
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
          temperature: 0.7,
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
    
    // Try to parse as JSON, fallback to structured text if it fails
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.warn('Failed to parse Gemini response as JSON, using structured text');
      analysis = {
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          keyMicronutrients: []
        },
        menopauseBenefits: [],
        concerns: [],
        improvements: [],
        portionAssessment: "Analysis unavailable",
        timingRecommendations: "Analysis unavailable",
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
    console.error('Error in gemini-meal-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});