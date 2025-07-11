import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CycleAnalysisRequest {
  cycleEntries: any[];
  symptomEntries: any[];
  nutritionEntries: any[];
  activityEntries: any[];
  userProfile?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      cycleEntries, 
      symptomEntries, 
      nutritionEntries, 
      activityEntries, 
      userProfile 
    }: CycleAnalysisRequest = await req.json();

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY не настроен');
    }

    // Подготавливаем специализированный промпт для анализа корреляций цикла
    const prompt = `
Ты - специализированный ИИ-аналитик для анализа менструального цикла и корреляций в контексте менопаузы.

ЗАДАЧА: Проанализируй данные и найди значимые корреляции между циклом, симптомами, питанием и активностью.

ДАННЫЕ ДЛЯ АНАЛИЗА:

1. ДАННЫЕ ЦИКЛА (${cycleEntries.length} записей):
${JSON.stringify(cycleEntries.slice(-10), null, 2)}

2. ДАННЫЕ СИМПТОМОВ (${symptomEntries.length} записей):
${JSON.stringify(symptomEntries.slice(-20), null, 2)}

3. ДАННЫЕ ПИТАНИЯ (${nutritionEntries.length} записей):
${JSON.stringify(nutritionEntries.slice(-15), null, 2)}

4. ДАННЫЕ АКТИВНОСТИ (${activityEntries.length} записей):
${JSON.stringify(activityEntries.slice(-15), null, 2)}

5. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile || {}, null, 2)}

ИНСТРУКЦИИ ДЛЯ АНАЛИЗА:

1. АНАЛИЗ ЦИКЛА:
   - Определи фазу менопаузы (пременопауза, ранняя/поздняя перименопауза, менопауза)
   - Вычисли регулярность и тренды цикла
   - Оцени качество данных и уверенность прогнозов

2. КОРРЕЛЯЦИИ ПИТАНИЯ:
   - Найди связи между микроэлементами и симптомами цикла
   - Определи оптимальные дозировки и время приема
   - Учти особенности перименопаузы

3. КОРРЕЛЯЦИИ АКТИВНОСТИ:
   - Проанализируй влияние разных типов активности на симптомы
   - Определи оптимальное время для тренировок в разные фазы цикла
   - Учти возрастные особенности

4. ИНТЕГРИРОВАННЫЕ ИНСАЙТЫ:
   - Найди сложные корреляции между всеми факторами
   - Предложи персонализированные рекомендации
   - Учти стадию менопаузы и индивидуальные особенности

ФОРМАТ ОТВЕТА (строго JSON):
{
  "cycle_analysis": {
    "current_cycle": {
      "start_date": "YYYY-MM-DD",
      "day_of_cycle": number,
      "estimated_length": number,
      "phase": "menstrual|follicular|ovulatory|luteal|irregular",
      "next_predicted_date": "YYYY-MM-DD",
      "confidence": number (0-100)
    },
    "cycle_history": {
      "average_length": number,
      "shortest_cycle": number,
      "longest_cycle": number,
      "irregularity_score": number (0-100),
      "trend": "stable|lengthening|shortening|irregular"
    },
    "perimenopause_indicators": {
      "missed_periods_count": number,
      "cycle_variability": number,
      "symptom_severity_trend": "increasing|stable|decreasing",
      "probable_stage": "premenopause|early_perimenopause|late_perimenopause|menopause"
    }
  },
  "nutrition_correlations": [
    {
      "nutrient": string,
      "cycle_impact": "positive|negative|neutral",
      "correlation_strength": number (0-1),
      "recommendations": [string],
      "optimal_range": string,
      "current_intake": number,
      "claude_insight": string
    }
  ],
  "activity_correlations": [
    {
      "activity_type": "cardio|strength|yoga|walking|high_intensity",
      "symptom_impact": {
        "cramps": number (-1 to 1),
        "mood": number (-1 to 1),
        "energy": number (-1 to 1),
        "hot_flashes": number (-1 to 1)
      },
      "optimal_timing": [string],
      "recommendations": [string],
      "claude_insight": string
    }
  ],
  "integrated_insights": [
    {
      "insight_type": "pattern|correlation|prediction|recommendation",
      "title": string,
      "description": string,
      "confidence": number (0-100),
      "actionable_steps": [string],
      "data_sources": [string]
    }
  ],
  "personalized_recommendations": {
    "immediate_actions": [string],
    "weekly_goals": [string],
    "monthly_tracking": [string],
    "lifestyle_adjustments": [string]
  }
}

ВАЖНО:
- Основывайся только на предоставленных данных
- Указывай уровень уверенности для каждого вывода
- Давай конкретные, измеримые рекомендации
- Учитывай контекст менопаузы и возрастные изменения
- Если данных недостаточно, честно указывай это в анализе
`;

    console.log('Отправляем запрос к Claude для анализа корреляций цикла');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3, // Низкая температура для более точного анализа
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API Error:', response.status, errorText);
      throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Некорректный ответ от Claude API');
    }

    const responseText = data.content[0].text;
    console.log('Получили ответ от Claude:', responseText.substring(0, 200) + '...');

    // Парсим JSON ответ от Claude
    let analysisResult;
    try {
      // Извлекаем JSON из ответа (может быть обернут в markdown)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/\{[\s\S]*\}/);
      
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      analysisResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Ошибка парсинга JSON от Claude:', parseError);
      // Возвращаем fallback структуру
      analysisResult = {
        cycle_analysis: {
          current_cycle: {
            start_date: new Date().toISOString().split('T')[0],
            day_of_cycle: 1,
            estimated_length: 28,
            phase: 'irregular',
            confidence: 50
          },
          cycle_history: {
            average_length: 28,
            shortest_cycle: 25,
            longest_cycle: 32,
            irregularity_score: 20,
            trend: 'stable'
          },
          perimenopause_indicators: {
            missed_periods_count: 0,
            cycle_variability: 3,
            symptom_severity_trend: 'stable',
            probable_stage: 'premenopause'
          }
        },
        nutrition_correlations: [],
        activity_correlations: [],
        integrated_insights: [{
          insight_type: 'recommendation',
          title: 'Анализ в процессе',
          description: 'Claude анализирует ваши данные. Требуется больше информации для точных корреляций.',
          confidence: 50,
          actionable_steps: ['Продолжайте вести дневник симптомов'],
          data_sources: ['Пользовательские записи']
        }],
        personalized_recommendations: {
          immediate_actions: ['Ведите подробный дневник симптомов'],
          weekly_goals: ['Отслеживайте питание и активность'],
          monthly_tracking: ['Анализируйте тренды'],
          lifestyle_adjustments: ['Регулярный сон и снижение стресса']
        },
        raw_claude_response: responseText
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysisResult,
      usage: data.usage,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in claude-cycle-analysis function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Внутренняя ошибка сервера',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});