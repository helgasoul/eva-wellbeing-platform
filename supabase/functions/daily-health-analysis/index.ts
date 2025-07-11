import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface DailyHealthData {
  userId: string;
  date: string;
  symptoms: any[];
  nutrition: any[];
  deviceData: any[];
  externalHealthData: any[];
  dailySummary: any;
  weather: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, analysisDate } = await req.json();
    const targetDate = analysisDate || new Date().toISOString().split('T')[0];
    
    console.log(`Starting daily analysis for user ${userId} on ${targetDate}`);

    // Проверяем подписку пользователя
    const userSubscription = await getUserSubscription(userId);
    const hasNutritionPlanAccess = userSubscription && ['plus', 'optimum'].includes(userSubscription.plan_id);

    // Создаем сессию анализа
    const { data: session, error: sessionError } = await supabase
      .from('ai_analysis_sessions')
      .insert({
        user_id: userId,
        session_type: 'daily_health_analysis',
        analysis_date: targetDate,
        ai_model_version: 'claude-3-5-sonnet-20241022',
        processing_status: 'running',
        analysis_scope: { type: 'daily', date: targetDate },
        data_timeframe: { start: targetDate, end: targetDate },
        input_data_sources: ['symptoms', 'nutrition', 'device_data', 'weather']
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Failed to create analysis session: ${sessionError.message}`);
    }

    // Собираем данные за день
    const healthData = await collectDailyHealthData(userId, targetDate);
    
    // Получаем профиль пользователя для персонализации
    const userProfile = await getUserProfile(userId);
    
    // Выполняем анализ с Claude
    const analysisResult = await performClaudeAnalysis(healthData, userProfile, userSubscription);
    
    // Сохраняем результаты
    await saveAnalysisResults(session.id, userId, analysisResult, healthData);
    
    // Генерируем и сохраняем план питания для Plus/Optimum подписчиков
    let nutritionPlanId = null;
    if (hasNutritionPlanAccess && analysisResult.nutritionPlan) {
      nutritionPlanId = await saveNutritionPlan(userId, session.id, targetDate, analysisResult.nutritionPlan, userSubscription.plan_id);
    }
    
    // Обновляем статус сессии
    await supabase
      .from('ai_analysis_sessions')
      .update({
        processing_status: 'completed',
        key_findings: analysisResult.keyFindings,
        patterns_detected: analysisResult.patterns,
        correlations_found: analysisResult.correlations,
        confidence_score: analysisResult.confidence,
        processing_duration_ms: Date.now() - new Date(session.created_at).getTime()
      })
      .eq('id', session.id);

    // Send push notification about new insights
    await sendDailyInsightNotification(userId, analysisResult, hasNutritionPlanAccess);

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      summary: analysisResult.summary,
      hasNutritionPlan: !!nutritionPlanId,
      nutritionPlanId: nutritionPlanId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily health analysis:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectDailyHealthData(userId: string, date: string): Promise<DailyHealthData> {
  console.log(`Collecting health data for user ${userId} on ${date}`);

  // Собираем симптомы
  const { data: symptoms } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date);

  // Собираем данные питания
  const { data: nutrition } = await supabase
    .from('nutrition_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('entry_date', date);

  // Собираем данные с устройств
  const { data: deviceData } = await supabase
    .from('health_device_data')
    .select(`
      *,
      user_devices (device_name, device_type)
    `)
    .eq('user_id', userId)
    .gte('recorded_at', `${date}T00:00:00Z`)
    .lt('recorded_at', `${date}T23:59:59Z`);

  // Собираем внешние данные здоровья
  const { data: externalHealthData } = await supabase
    .from('external_health_data')
    .select('*')
    .eq('user_id', userId)
    .eq('recorded_date', date);

  // Собираем суммарные данные за день
  const { data: dailySummary } = await supabase
    .from('daily_health_summary')
    .select('*')
    .eq('user_id', userId)
    .eq('summary_date', date)
    .single();

  // Собираем данные о погоде
  const { data: weather } = await supabase
    .from('daily_weather_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  return {
    userId,
    date,
    symptoms: symptoms || [],
    nutrition: nutrition || [],
    deviceData: deviceData || [],
    externalHealthData: externalHealthData || [],
    dailySummary: dailySummary || null,
    weather: weather || null
  };
}

async function performClaudeAnalysis(healthData: DailyHealthData, userProfile: any, userSubscription: any): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY не настроен');
  }

  const hasNutritionPlanAccess = userSubscription && ['plus', 'optimum'].includes(userSubscription.plan_id);
  
  const analysisPrompt = `
Проанализируй данные о здоровье пользователя за ${healthData.date}:

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile, null, 2)}

ПОДПИСКА: ${userSubscription?.plan_id || 'essential'}

СИМПТОМЫ:
${JSON.stringify(healthData.symptoms, null, 2)}

ПИТАНИЕ:
${JSON.stringify(healthData.nutrition, null, 2)}

ДАННЫЕ С УСТРОЙСТВ:
${JSON.stringify(healthData.deviceData, null, 2)}

ВНЕШНИЕ ДАННЫЕ ЗДОРОВЬЯ:
${JSON.stringify(healthData.externalHealthData, null, 2)}

СУММАРНЫЕ ДАННЫЕ:
${JSON.stringify(healthData.dailySummary, null, 2)}

ПОГОДА:
${JSON.stringify(healthData.weather, null, 2)}

Проведи комплексный анализ и предоставь:
1. Ключевые находки и паттерны
2. Корреляции между различными показателями
3. Рекомендации для улучшения самочувствия
4. Области, требующие внимания
5. Оценку качества данных (0-1)
6. Краткое резюме дня
${hasNutritionPlanAccess ? `
7. ПЕРСОНАЛИЗИРОВАННЫЙ ПЛАН ПИТАНИЯ на завтра (только для подписок Plus/Optimum):
   - Завтрак, обед, ужин и 2 перекуса
   - Учти симптомы, циклические изменения, погоду
   - Включи калории, макронутриенты для каждого приема пищи
   - Добавь советы по приготовлению и заменам
   - Учти диетические ограничения из профиля
   - Сфокусируйся на улучшении выявленных симптомов
` : ''}

Ответ представь в JSON формате с полями:
- keyFindings (массив ключевых находок)
- patterns (обнаруженные паттерны)
- correlations (корреляции между показателями)
- recommendations (рекомендации)
- concerns (области внимания)
- confidence (уверенность в анализе 0-1)
- dataQuality (качество данных 0-1)
- summary (краткое резюме)
${hasNutritionPlanAccess ? `
- nutritionPlan (объект с полями):
  - dailyCalories (общая калорийность)
  - macroTargets (белки, жиры, углеводы в граммах)
  - meals (массив с завтраком, обедом, ужином)
  - snacks (массив из 2 перекусов)
  - hydrationGoal (цель по воде в мл)
  - specialConsiderations (особые рекомендации)
  - shoppingList (список покупок)
  - preparationTips (советы по приготовлению)
` : ''}
`;

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
      max_tokens: hasNutritionPlanAccess ? 6000 : 4000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.content[0].text;
  
  try {
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse Claude response:', parseError);
    // Если не удалось парсить JSON, возвращаем структурированный ответ
    return {
      keyFindings: [responseText.substring(0, 500)],
      patterns: [],
      correlations: [],
      recommendations: [],
      concerns: [],
      confidence: 0.5,
      dataQuality: 0.7,
      summary: responseText.substring(0, 200)
    };
  }
}

async function saveAnalysisResults(sessionId: string, userId: string, analysis: any, healthData: DailyHealthData) {
  // Сохраняем общие инсайты
  if (analysis.keyFindings && analysis.keyFindings.length > 0) {
    await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'daily_analysis',
        confidence_score: analysis.confidence || 0.7,
        insight_data: {
          title: `Ежедневный анализ за ${healthData.date}`,
          description: analysis.summary,
          key_findings: analysis.keyFindings,
          data_sources: ['symptoms', 'nutrition', 'device_data', 'weather'],
          trends: analysis.patterns || []
        },
        actionable_recommendations: {
          immediate_actions: analysis.recommendations?.slice(0, 3) || [],
          long_term_strategies: analysis.recommendations?.slice(3, 6) || [],
          monitoring_suggestions: analysis.concerns || []
        }
      });
  }

  // Сохраняем корреляции
  if (analysis.correlations && analysis.correlations.length > 0) {
    for (const correlation of analysis.correlations) {
      await supabase
        .from('correlation_analysis')
        .insert({
          user_id: userId,
          analysis_type: 'daily_multimodal',
          correlation_strength: correlation.strength || 0.5,
          insights: {
            pattern_description: correlation.description,
            strength_interpretation: correlation.interpretation || 'Moderate correlation',
            statistical_significance: correlation.significance || 0.05,
            sample_size: 1,
            time_period: {
              start: healthData.date,
              end: healthData.date
            }
          },
          recommendations: {
            actions: correlation.recommendations || [],
            priority: correlation.priority || 'medium',
            expected_impact: correlation.impact || 'Moderate positive effect'
          }
        });
    }
  }
}

async function sendDailyInsightNotification(userId: string, analysisResult: any, hasNutritionPlan: boolean = false) {
  try {
    // Check if user has notification preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('daily_insights_enabled, push_notifications_enabled')
      .eq('user_id', userId)
      .single();

    if (!preferences?.daily_insights_enabled || !preferences?.push_notifications_enabled) {
      console.log(`Daily insight notifications disabled for user ${userId}`);
      return;
    }

    // Create notification payload
    const notification = {
      title: hasNutritionPlan ? '🍽️ Ваш персональный план питания готов!' : '🌟 Новые инсайты о вашем здоровье',
      body: hasNutritionPlan 
        ? 'Новый план питания составлен с учетом ваших данных за сегодня' 
        : analysisResult.summary?.substring(0, 100) + '...' || 'Проанализированы ваши данные за сегодня',
      icon: hasNutritionPlan ? '/icons/nutrition-icon.png' : '/icons/insight-icon.png',
      badge: '/icons/badge-72x72.png',
      url: hasNutritionPlan ? '/patient/nutrition' : '/patient/ai-chat',
      data: {
        type: hasNutritionPlan ? 'nutrition_plan' : 'daily_insight',
        analysisDate: new Date().toISOString().split('T')[0],
        hasRecommendations: analysisResult.recommendations?.length > 0 || false,
        keyFindingsCount: analysisResult.keyFindings?.length || 0,
        hasNutritionPlan: hasNutritionPlan
      },
      actions: [
        {
          action: 'view',
          title: hasNutritionPlan ? 'Посмотреть план' : 'Посмотреть анализ'
        },
        {
          action: 'dismiss',
          title: 'Позже'
        }
      ]
    };

    // Call send-push-notification function
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: userId,
        notification: notification
      }
    });

    if (error) {
      console.error('Failed to send push notification:', error);
    } else {
      console.log(`Push notification sent successfully to user ${userId}`);
    }

  } catch (error) {
    console.error('Error in sendDailyInsightNotification:', error);
  }
}

async function getUserSubscription(userId: string) {
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    return subscription;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

async function getUserProfile(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        onboarding_data,
        dietary_restrictions,
        health_goals,
        lifestyle_data
      `)
      .eq('id', userId)
      .single();
    
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

async function saveNutritionPlan(userId: string, sessionId: string, planDate: string, nutritionPlan: any, subscriptionTier: string): Promise<string | null> {
  try {
    // Рассчитываем дату на завтра для плана
    const tomorrow = new Date(planDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_nutrition_plans')
      .insert({
        user_id: userId,
        analysis_session_id: sessionId,
        plan_date: tomorrowStr,
        subscription_tier: subscriptionTier,
        meal_plan: nutritionPlan.meals || [],
        nutritional_goals: {
          dailyCalories: nutritionPlan.dailyCalories,
          macroTargets: nutritionPlan.macroTargets,
          hydrationGoal: nutritionPlan.hydrationGoal
        },
        dietary_restrictions: [],
        calorie_target: nutritionPlan.dailyCalories,
        macro_targets: nutritionPlan.macroTargets,
        personalization_factors: {
          specialConsiderations: nutritionPlan.specialConsiderations,
          shoppingList: nutritionPlan.shoppingList,
          preparationTips: nutritionPlan.preparationTips,
          snacks: nutritionPlan.snacks
        }
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving nutrition plan:', error);
      return null;
    }

    console.log(`Nutrition plan saved for user ${userId} with ID: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error('Error in saveNutritionPlan:', error);
    return null;
  }
}