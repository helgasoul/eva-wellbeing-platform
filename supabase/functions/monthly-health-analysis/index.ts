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

interface MonthlyHealthData {
  userId: string;
  month: string;
  year: number;
  symptoms: any[];
  nutrition: any[];
  deviceData: any[];
  externalHealthData: any[];
  documents: any[];
  dailySummaries: any[];
  weather: any[];
  medicalEvents: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, analysisMonth, analysisYear } = await req.json();
    const targetDate = analysisMonth || new Date().getMonth() + 1;
    const targetYear = analysisYear || new Date().getFullYear();
    
    console.log(`Starting monthly analysis for user ${userId} for ${targetDate}/${targetYear}`);

    // Создаем сессию анализа
    const { data: session, error: sessionError } = await supabase
      .from('ai_analysis_sessions')
      .insert({
        user_id: userId,
        session_type: 'monthly_health_analysis',
        analysis_date: `${targetYear}-${String(targetDate).padStart(2, '0')}-01`,
        ai_model_version: 'claude-3-5-sonnet-20241022',
        processing_status: 'running',
        analysis_scope: { type: 'monthly', month: targetDate, year: targetYear },
        data_timeframe: { 
          start: `${targetYear}-${String(targetDate).padStart(2, '0')}-01`, 
          end: `${targetYear}-${String(targetDate).padStart(2, '0')}-${new Date(targetYear, targetDate, 0).getDate()}`
        },
        input_data_sources: ['symptoms', 'nutrition', 'device_data', 'documents', 'medical_events', 'weather']
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Failed to create analysis session: ${sessionError.message}`);
    }

    // Собираем данные за месяц
    const healthData = await collectMonthlyHealthData(userId, targetDate, targetYear);
    
    // Выполняем анализ с Claude
    const analysisResult = await performClaudeMonthlyAnalysis(healthData);
    
    // Сохраняем результаты
    await saveMonthlyAnalysisResults(session.id, userId, analysisResult, healthData);
    
    // Генерируем персонализированный план питания для Plus/Optimum пользователей
    await generateNutritionPlanIfEligible(userId, session.id, analysisResult, healthData);
    
    // Обновляем статус сессии
    await supabase
      .from('ai_analysis_sessions')
      .update({
        processing_status: 'completed',
        key_findings: analysisResult.keyFindings,
        patterns_detected: analysisResult.patterns,
        correlations_found: analysisResult.correlations,
        trends_identified: analysisResult.trends,
        confidence_score: analysisResult.confidence,
        processing_duration_ms: Date.now() - new Date(session.created_at).getTime()
      })
      .eq('id', session.id);

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      summary: analysisResult.summary,
      trends: analysisResult.trends
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in monthly health analysis:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectMonthlyHealthData(userId: string, month: number, year: number): Promise<MonthlyHealthData> {
  console.log(`Collecting monthly health data for user ${userId} for ${month}/${year}`);

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

  // Собираем симптомы за месяц
  const { data: symptoms } = await supabase
    .from('symptom_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date');

  // Собираем данные питания за месяц
  const { data: nutrition } = await supabase
    .from('nutrition_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', startDate)
    .lte('entry_date', endDate)
    .order('entry_date');

  // Собираем данные с устройств за месяц
  const { data: deviceData } = await supabase
    .from('health_device_data')
    .select(`
      *,
      user_devices (device_name, device_type)
    `)
    .eq('user_id', userId)
    .gte('recorded_at', `${startDate}T00:00:00Z`)
    .lt('recorded_at', `${endDate}T23:59:59Z`)
    .order('recorded_at');

  // Собираем внешние данные здоровья за месяц
  const { data: externalHealthData } = await supabase
    .from('external_health_data')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_date', startDate)
    .lte('recorded_date', endDate)
    .order('recorded_date');

  // НОВОЕ: Собираем документы за месяц
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  // Собираем медицинские события за месяц
  const { data: medicalEvents } = await supabase
    .from('medical_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date');

  // Собираем ежедневные сводки за месяц
  const { data: dailySummaries } = await supabase
    .from('daily_health_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('summary_date', startDate)
    .lte('summary_date', endDate)
    .order('summary_date');

  // Собираем данные о погоде за месяц
  const { data: weather } = await supabase
    .from('daily_weather_records')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');

  return {
    userId,
    month: `${month}/${year}`,
    year,
    symptoms: symptoms || [],
    nutrition: nutrition || [],
    deviceData: deviceData || [],
    externalHealthData: externalHealthData || [],
    documents: documents || [],
    medicalEvents: medicalEvents || [],
    dailySummaries: dailySummaries || [],
    weather: weather || []
  };
}

async function performClaudeMonthlyAnalysis(healthData: MonthlyHealthData): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY не настроен');
  }

  const analysisPrompt = `
Проанализируй данные о здоровье пользователя за месяц ${healthData.month}:

СИМПТОМЫ (${healthData.symptoms.length} записей):
${JSON.stringify(healthData.symptoms.slice(0, 10), null, 2)}

ПИТАНИЕ (${healthData.nutrition.length} записей):
${JSON.stringify(healthData.nutrition.slice(0, 10), null, 2)}

ДАННЫЕ С УСТРОЙСТВ (${healthData.deviceData.length} записей):
${JSON.stringify(healthData.deviceData.slice(0, 10), null, 2)}

ВНЕШНИЕ ДАННЫЕ ЗДОРОВЬЯ (${healthData.externalHealthData.length} записей):
${JSON.stringify(healthData.externalHealthData.slice(0, 5), null, 2)}

МЕДИЦИНСКИЕ ДОКУМЕНТЫ (${healthData.documents.length} документов):
${JSON.stringify(healthData.documents, null, 2)}

МЕДИЦИНСКИЕ СОБЫТИЯ (${healthData.medicalEvents.length} событий):
${JSON.stringify(healthData.medicalEvents, null, 2)}

ЕЖЕДНЕВНЫЕ СВОДКИ (${healthData.dailySummaries.length} дней):
${JSON.stringify(healthData.dailySummaries.slice(0, 5), null, 2)}

ПОГОДНЫЕ ДАННЫЕ (${healthData.weather.length} дней):
${JSON.stringify(healthData.weather.slice(0, 5), null, 2)}

Проведи комплексный месячный анализ и предоставь:
1. Ключевые тренды и изменения за месяц
2. Паттерны в симптомах и их связь с другими факторами
3. Влияние питания на самочувствие
4. Анализ данных с устройств и активности
5. Медицинские выводы на основе документов и событий
6. Корреляции между погодой и симптомами
7. Прогресс и рекомендации на следующий месяц
8. Области, требующие особого внимания
9. Оценку качества и полноты данных
10. Детальный анализ питания с выявлением дефицитов нутриентов
11. Персонализированные рекомендации по питанию

Ответ представь в JSON формате с полями:
- summary (краткое резюме месяца)
- keyFindings (ключевые находки)
- trends (тренды по категориям: symptoms, nutrition, activity, medical)
- patterns (обнаруженные паттерны)
- correlations (корреляции между показателями)
- documentInsights (выводы из медицинских документов)
- medicalRecommendations (медицинские рекомендации)
- lifestyleRecommendations (рекомендации по образу жизни)
- concerns (области внимания)
- progress (оценка прогресса)
- nextMonthGoals (цели на следующий месяц)
- nutritionAnalysis (детальный анализ питания с дефицитами)
- personalizedNutritionPlan (персонализированный план питания)
- confidence (уверенность в анализе 0-1)
- dataQuality (качество данных 0-1)
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
      max_tokens: 8000,
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
    // Если не удалось парсить JSON, возвращаем структурированный ответ
    return {
      summary: responseText.substring(0, 300),
      keyFindings: [responseText.substring(0, 500)],
      trends: { symptoms: [], nutrition: [], activity: [], medical: [] },
      patterns: [],
      correlations: [],
      documentInsights: [],
      medicalRecommendations: [],
      lifestyleRecommendations: [],
      concerns: [],
      progress: 'Недостаточно данных для оценки',
      nextMonthGoals: [],
      nutritionAnalysis: { deficiencies: [], recommendations: [] },
      personalizedNutritionPlan: null,
      confidence: 0.5,
      dataQuality: 0.7
    };
  }
}

async function saveMonthlyAnalysisResults(sessionId: string, userId: string, analysis: any, healthData: MonthlyHealthData) {
  // Сохраняем общие месячные инсайты
  if (analysis.keyFindings && analysis.keyFindings.length > 0) {
    await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'monthly_analysis',
        confidence_score: analysis.confidence || 0.8,
        insight_data: {
          title: `Месячный анализ за ${healthData.month}`,
          description: analysis.summary,
          key_findings: analysis.keyFindings,
          data_sources: ['symptoms', 'nutrition', 'device_data', 'documents', 'medical_events', 'weather'],
          trends: analysis.trends,
          document_insights: analysis.documentInsights || [],
          progress_assessment: analysis.progress
        },
        actionable_recommendations: {
          immediate_actions: analysis.lifestyleRecommendations?.slice(0, 3) || [],
          long_term_strategies: analysis.medicalRecommendations || [],
          monitoring_suggestions: analysis.concerns || [],
          next_month_goals: analysis.nextMonthGoals || []
        }
      });
  }

  // Сохраняем корреляции за месяц
  if (analysis.correlations && analysis.correlations.length > 0) {
    for (const correlation of analysis.correlations) {
      await supabase
        .from('correlation_analysis')
        .insert({
          user_id: userId,
          analysis_type: 'monthly_comprehensive',
          correlation_strength: correlation.strength || 0.6,
          insights: {
            pattern_description: correlation.description,
            strength_interpretation: correlation.interpretation || 'Monthly correlation pattern',
            statistical_significance: correlation.significance || 0.05,
            sample_size: healthData.symptoms.length + healthData.nutrition.length + healthData.documents.length,
            time_period: {
              start: `${healthData.year}-${String(new Date(healthData.month).getMonth() + 1).padStart(2, '0')}-01`,
              end: `${healthData.year}-${String(new Date(healthData.month).getMonth() + 1).padStart(2, '0')}-${new Date(healthData.year, new Date(healthData.month).getMonth() + 1, 0).getDate()}`
            }
          },
          recommendations: {
            actions: correlation.recommendations || [],
            priority: correlation.priority || 'medium',
            expected_impact: correlation.impact || 'Positive monthly trend improvement'
          }
        });
    }
  }

  // Сохраняем специальные инсайты из документов
  if (analysis.documentInsights && analysis.documentInsights.length > 0) {
    await supabase
      .from('ai_insights')
      .insert({
        user_id: userId,
        insight_type: 'document_analysis',
        confidence_score: analysis.confidence || 0.9,
        insight_data: {
          title: `Анализ медицинских документов за ${healthData.month}`,
          description: 'Выводы на основе загруженных медицинских документов',
          key_findings: analysis.documentInsights,
          data_sources: ['documents'],
          document_count: healthData.documents.length
        },
        actionable_recommendations: {
          immediate_actions: analysis.medicalRecommendations?.slice(0, 2) || [],
          long_term_strategies: analysis.medicalRecommendations?.slice(2) || [],
          monitoring_suggestions: ['Регулярный мониторинг показателей из документов']
        }
      });
  }
}

async function generateNutritionPlanIfEligible(
  userId: string, 
  sessionId: string, 
  analysisResult: any, 
  healthData: MonthlyHealthData
) {
  try {
    // Проверяем подписку пользователя
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('Could not fetch user profile for nutrition plan generation');
      return;
    }

    const subscriptionTier = profile.subscription_tier || 'essential';
    
    // Генерируем план только для Plus и Optimum пользователей
    if (!['plus', 'optimum'].includes(subscriptionTier)) {
      console.log(`User ${userId} has ${subscriptionTier} subscription - skipping nutrition plan generation`);
      return;
    }

    console.log(`Generating nutrition plan for ${subscriptionTier} user ${userId}`);

    // Анализируем дефициты питания
    const nutritionAnalysis = await analyzeNutritionDeficiencies(
      healthData,
      analysisResult,
      subscriptionTier as 'plus' | 'optimum'
    );

    // Генерируем персонализированный план питания
    const nutritionPlan = await generatePersonalizedNutritionPlan(
      userId,
      sessionId,
      nutritionAnalysis,
      subscriptionTier as 'plus' | 'optimum',
      healthData
    );

    // Сохраняем план в базе данных
    if (nutritionPlan) {
      const { error: insertError } = await supabase
        .from('daily_nutrition_plans')
        .insert({
          user_id: userId,
          analysis_session_id: sessionId,
          plan_date: new Date().toISOString().split('T')[0],
          subscription_tier: subscriptionTier,
          meal_plan: nutritionPlan.meals,
          nutritional_goals: nutritionPlan.goals,
          dietary_restrictions: nutritionPlan.restrictions,
          calorie_target: nutritionPlan.calorieTarget,
          macro_targets: nutritionPlan.macroTargets,
          personalization_factors: nutritionPlan.personalizationFactors,
          is_generated: true,
          generated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving nutrition plan:', insertError);
      } else {
        console.log(`Successfully generated and saved nutrition plan for user ${userId}`);
      }
    }

  } catch (error) {
    console.error('Error in generateNutritionPlanIfEligible:', error);
  }
}

async function analyzeNutritionDeficiencies(
  healthData: MonthlyHealthData,
  analysisResult: any,
  subscriptionTier: 'plus' | 'optimum'
) {
  // Анализируем данные питания за месяц
  const nutritionEntries = healthData.nutrition || [];
  const symptoms = healthData.symptoms || [];
  
  // Подсчитываем потребление основных нутриентов
  const nutrientIntake = {
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitaminD: 0,
    vitaminB12: 0,
    folate: 0,
    magnesium: 0,
    omega3: 0,
    vitaminC: 0
  };

  // Простая эвристическая оценка дефицитов на основе симптомов и питания
  const deficiencies = [];
  
  // Проверяем на дефицит железа
  const fatigueSymptoms = symptoms.filter(s => 
    s.physical_symptoms?.includes('усталость') || 
    s.energy_level < 3
  );
  
  if (fatigueSymptoms.length > healthData.symptoms.length * 0.3) {
    deficiencies.push({
      nutrient: 'Железо',
      severity: 'moderate',
      confidence: 0.6,
      recommendations: ['Включить красное мясо, печень, шпинат в рацион'],
      foodSources: ['Говядина', 'Печень', 'Шпинат', 'Чечевица']
    });
  }

  // Проверяем на дефицит витамина D (особенно зимой)
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 10 || currentMonth <= 2) { // Зимние месяцы
    deficiencies.push({
      nutrient: 'Витамин D',
      severity: 'mild',
      confidence: 0.7,
      recommendations: ['Увеличить потребление жирной рыбы', 'Рассмотреть прием добавок'],
      foodSources: ['Лосось', 'Тунец', 'Яичные желтки', 'Обогащенное молоко']
    });
  }

  return {
    deficiencies,
    overallNutritionScore: Math.max(60, 100 - deficiencies.length * 10),
    recommendations: {
      immediate: deficiencies.map(d => d.recommendations[0]),
      longTerm: ['Регулярный контроль уровня витаминов', 'Сбалансированное питание'],
      supplements: subscriptionTier === 'optimum' ? 
        deficiencies.map(d => `${d.nutrient} добавки`) : []
    }
  };
}

async function generatePersonalizedNutritionPlan(
  userId: string,
  sessionId: string,
  nutritionAnalysis: any,
  subscriptionTier: 'plus' | 'optimum',
  healthData: MonthlyHealthData
) {
  // Базовые параметры плана
  const baseCalories = 1800; // Можно сделать более точный расчет
  const macroTargets = {
    protein: Math.round(baseCalories * 0.25 / 4), // 25% от калорий
    carbs: Math.round(baseCalories * 0.45 / 4),   // 45% от калорий
    fat: Math.round(baseCalories * 0.30 / 9)      // 30% от калорий
  };

  // Генерируем примерные блюда с учетом дефицитов
  const meals = [
    {
      type: 'breakfast',
      name: 'Омлет со шпинатом и авокадо',
      description: 'Богат железом, фолатом и полезными жирами',
      calories: 350,
      macros: { protein: 20, carbs: 10, fat: 25 },
      ingredients: [
        { name: 'Яйца', amount: '2', unit: 'шт', calories_per_serving: 140 },
        { name: 'Шпинат', amount: '50', unit: 'г', calories_per_serving: 12 },
        { name: 'Авокадо', amount: '0.5', unit: 'шт', calories_per_serving: 120 }
      ],
      preparation_time: 15,
      difficulty: 'easy',
      cooking_tips: ['Готовить на медленном огне', 'Добавлять шпинат в конце']
    },
    {
      type: 'lunch',
      name: 'Лосось с киноа и брокколи',
      description: 'Источник омега-3, белка и витаминов',
      calories: 500,
      macros: { protein: 35, carbs: 45, fat: 18 },
      ingredients: [
        { name: 'Лосось', amount: '120', unit: 'г', calories_per_serving: 250 },
        { name: 'Киноа', amount: '80', unit: 'г', calories_per_serving: 150 },
        { name: 'Брокколи', amount: '150', unit: 'г', calories_per_serving: 50 }
      ],
      preparation_time: 25,
      difficulty: 'medium',
      cooking_tips: ['Запекать лосось при 180°C', 'Варить киноа 15 минут']
    },
    {
      type: 'dinner',
      name: 'Куриная грудка с овощами',
      description: 'Легкий ужин с высоким содержанием белка',
      calories: 400,
      macros: { protein: 40, carbs: 20, fat: 12 },
      ingredients: [
        { name: 'Куриная грудка', amount: '150', unit: 'г', calories_per_serving: 250 },
        { name: 'Цуккини', amount: '100', unit: 'г', calories_per_serving: 20 },
        { name: 'Болгарский перец', amount: '100', unit: 'г', calories_per_serving: 30 }
      ],
      preparation_time: 20,
      difficulty: 'easy',
      cooking_tips: ['Мариновать курицу заранее', 'Готовить на гриле или в духовке']
    }
  ];

  // Перекусы
  const snacks = [
    {
      name: 'Горсть миндаля',
      description: 'Источник магния и полезных жиров',
      calories: 160,
      preparation_time: 0,
      ingredients: ['Миндаль сырой 30г']
    },
    {
      name: 'Греческий йогурт с ягодами',
      description: 'Пробиотики и антиоксиданты',
      calories: 120,
      preparation_time: 2,
      ingredients: ['Греческий йогурт 150г', 'Ягоды замороженные 50г']
    }
  ];

  return {
    meals,
    goals: {
      dailyCalories: baseCalories,
      macroTargets,
      hydrationGoal: 2000 // мл воды
    },
    restrictions: [], // Можно добавить анализ ограничений из данных пользователя
    calorieTarget: baseCalories,
    macroTargets,
    personalizationFactors: {
      specialConsiderations: nutritionAnalysis.deficiencies.map((d: any) => 
        `Дефицит ${d.nutrient}: ${d.recommendations[0]}`
      ),
      shoppingList: meals.flatMap(meal => 
        meal.ingredients.map(ing => `${ing.name} - ${ing.amount} ${ing.unit}`)
      ),
      preparationTips: [
        'Готовьте порции заранее для экономии времени',
        'Используйте свежие сезонные продукты',
        'Пейте воду за 30 минут до еды'
      ],
      snacks
    }
  };
}