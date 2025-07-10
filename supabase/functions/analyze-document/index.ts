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
    const { documentContent, documentType = 'unknown' } = await req.json();

    if (!documentContent) {
      throw new Error('Document content is required');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = createAnalysisPrompt(documentContent, documentType);

    console.log('Sending request to Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received response from Claude API');

    const analysis = parseAnalysisResponse(data.content[0].text);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    
    // Return fallback analysis
    const fallbackAnalysis = {
      summary: 'Документ содержит медицинскую информацию, которая требует профессиональной интерпретации.',
      insights: [
        'Обнаружена медицинская информация',
        'Требуется консультация специалиста',
        'Рекомендуется сохранить документ для визита к врачу'
      ],
      recommendations: [
        'Обратитесь к лечащему врачу для интерпретации',
        'Возьмите документ на прием к специалисту',
        'Задайте врачу вопросы о непонятных терминах'
      ],
      riskLevel: 'medium',
      medicalTerms: [],
      urgencyMarkers: [],
      disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.',
      error: error.message
    };

    return new Response(JSON.stringify({ analysis: fallbackAnalysis }), {
      status: 200, // Return 200 with fallback data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createAnalysisPrompt(content: string, type: string): string {
  return `
Ты - ИИ помощник Eva, специализирующийся на анализе медицинских документов. 
Проанализируй следующий документ и предоставь структурированный анализ.

Тип документа: ${type}
Содержимое документа:
${content}

Предоставь анализ в следующем JSON формате:
{
  "summary": "Краткое резюме содержания документа (1-2 предложения)",
  "insights": [
    "Ключевой момент 1",
    "Ключевой момент 2",
    "Ключевой момент 3"
  ],
  "recommendations": [
    "Рекомендация 1",
    "Рекомендация 2", 
    "Рекомендация 3"
  ],
  "riskLevel": "low|medium|high",
  "medicalTerms": [
    "Список медицинских терминов, которые требуют разъяснения"
  ],
  "urgencyMarkers": [
    "Фразы или симптомы, указывающие на необходимость срочного обращения к врачу"
  ]
}

ВАЖНО: 
1. Будь осторожен с медицинскими интерпретациями
2. Не ставь диагнозы
3. Всегда рекомендуй обращение к врачу
4. Используй понятный язык для пациентов
5. Отвечай только в формате JSON без дополнительного текста
`;
}

function parseAnalysisResponse(responseText: string): any {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Не найден JSON в ответе');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Добавляем обязательное предупреждение
    analysis.disclaimer = 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.';
    
    return analysis;
  } catch (error) {
    console.error('Ошибка парсинга ответа:', error);
    
    // Возвращаем базовый анализ в случае ошибки
    return {
      summary: 'Документ содержит медицинскую информацию, которая требует профессиональной интерпретации.',
      insights: [
        'Обнаружена медицинская информация',
        'Требуется консультация специалиста',
        'Рекомендуется сохранить документ для визита к врачу'
      ],
      recommendations: [
        'Обратитесь к лечащему врачу для интерпретации',
        'Возьмите документ на прием к специалисту',
        'Задайте врачу вопросы о непонятных терминах'
      ],
      riskLevel: 'medium',
      medicalTerms: [],
      urgencyMarkers: [],
      disclaimer: 'Данный анализ предоставлен ИИ помощником Eva и не заменяет профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для получения персонализированных рекомендаций.'
    };
  }
}