import { supabase } from '@/integrations/supabase/client';

export type RecommendationType = 'urgent' | 'lifestyle' | 'medical' | 'prevention' | 'achievement';
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationCategory = 'symptoms' | 'nutrition' | 'exercise' | 'sleep' | 'stress' | 'medical';

export interface EvaRecommendation {
  id: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  description: string;
  reason: string; // Почему Eva дает эту рекомендацию
  actionSteps: string[];
  basedOnData: string[]; // Какие данные пациента использованы
  confidence: number; // 0-100% уверенность ИИ
  estimatedImpact: 'high' | 'medium' | 'low';
  timeframe: string; // "в течение недели", "через месяц"
  icon: string;
  urgencyLevel?: 'immediate' | 'soon' | 'routine';
}

interface PatientDataAnalysis {
  onboardingData: any;
  symptomEntries: any[];
  chatHistory: any[];
  nutritionData?: any[];
  wearableData?: any[];
  weatherCorrelations?: any[];
  userProfile?: any;
  menopausePhase?: string;
  aiInsights?: any[];
  correlations?: any[];
}

interface SymptomPattern {
  symptom: string;
  frequency: number;
  severity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastWeekCount: number;
  previousWeekCount: number;
}

class EvaRecommendationEngine {
  /**
   * Основной метод анализа пациента
   */
  async analyzePatientData(userId: string): Promise<EvaRecommendation[]> {
    try {
      const patientData = await this.gatherPatientData(userId);
      const analysis = await this.performAIAnalysis(patientData);
      return this.generateRecommendations(analysis, patientData);
    } catch (error) {
      console.error('Error analyzing patient data:', error);
      return this.getDefaultRecommendations();
    }
  }

  /**
   * Сбор всех данных пациента из Supabase
   */
  private async gatherPatientData(userId: string): Promise<PatientDataAnalysis> {
    try {
      // Получаем профиль пользователя
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Получаем записи симптомов из Supabase
      const { data: symptomEntries } = await supabase
        .from('symptom_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      // Получаем данные о питании из Supabase
      const { data: nutritionData } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      // История чата с ИИ
      const chatHistory = await this.getChatHistory(userId);

      // Получаем последние ИИ-инсайты от Claude
      const { data: aiInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('insight_type', 'daily_analysis')
        .order('created_at', { ascending: false })
        .limit(7);

      // Получаем корреляционный анализ
      const { data: correlations } = await supabase
        .from('correlation_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fallback к localStorage для данных онбординга если они не в профиле
      const onboardingData = (userProfile as any)?.onboarding_data || 
                           JSON.parse(localStorage.getItem('onboardingData') || '{}');

      return {
        onboardingData,
        symptomEntries: symptomEntries || [],
        chatHistory,
        nutritionData: nutritionData || [],
        wearableData: [], // Пока нет интеграции с носимыми устройствами
        userProfile,
        menopausePhase: userProfile?.menopause_phase || onboardingData?.phaseResult?.phase || 'неопределена',
        aiInsights: aiInsights || [],
        correlations: correlations || []
      };
    } catch (error) {
      console.error('Error gathering patient data from Supabase:', error);
      
      // Fallback к localStorage в случае ошибки
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${userId}`) || '[]');
      const nutritionData = JSON.parse(localStorage.getItem(`nutrition_entries_${userId}`) || '[]');
      const chatHistory = await this.getChatHistory(userId);

      return {
        onboardingData,
        symptomEntries,
        chatHistory,
        nutritionData,
        wearableData: [],
        menopausePhase: onboardingData?.phaseResult?.phase || 'неопределена',
        aiInsights: [],
        correlations: []
      };
    }
  }

  /**
   * Получение истории чата с ИИ
   */
  private async getChatHistory(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          ai_chat_messages (*)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(10);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  /**
   * ИИ-анализ собранных данных
   */
  private async performAIAnalysis(data: PatientDataAnalysis): Promise<any> {
    // Анализ паттернов симптомов
    const symptomPatterns = this.analyzeSymptomPatterns(data.symptomEntries);
    
    // Корреляции и тренды
    const correlations = this.findCorrelations(data);
    
    // Анализ прогресса по целям
    const goalProgress = this.analyzeGoalProgress(data);
    
    // Выявление факторов риска
    const riskFactors = this.assessRiskFactors(data);
    
    // Определение достижений
    const achievements = this.identifyAchievements(data);
    
    // Анализ данных чата
    const chatInsights = this.analyzeChatHistory(data.chatHistory);

    return {
      symptomPatterns,
      correlations,
      goalProgress,
      riskFactors,
      achievements,
      chatInsights,
      menopausePhase: data.menopausePhase,
      dataQuality: this.assessDataQuality(data)
    };
  }

  /**
   * Анализ паттернов симптомов
   */
  private analyzeSymptomPatterns(symptomEntries: any[]): SymptomPattern[] {
    if (!symptomEntries.length) return [];

    const symptomCounts: { [key: string]: { total: number; lastWeek: number; previousWeek: number; severities: number[] } } = {};
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    symptomEntries.forEach(entry => {
      const entryDate = new Date(entry.entry_date || entry.date);
      const symptoms = entry.physical_symptoms || entry.symptoms || [];
      
      symptoms.forEach((symptom: string) => {
        if (!symptomCounts[symptom]) {
          symptomCounts[symptom] = { total: 0, lastWeek: 0, previousWeek: 0, severities: [] };
        }
        
        symptomCounts[symptom].total++;
        
        if (entryDate >= oneWeekAgo) {
          symptomCounts[symptom].lastWeek++;
        } else if (entryDate >= twoWeeksAgo) {
          symptomCounts[symptom].previousWeek++;
        }
        
        // Добавляем тяжесть симптома если есть
        if (entry.severity) {
          symptomCounts[symptom].severities.push(entry.severity);
        }
      });
    });

    return Object.entries(symptomCounts).map(([symptom, counts]) => {
      const avgSeverity = counts.severities.length > 0 
        ? counts.severities.reduce((a, b) => a + b, 0) / counts.severities.length
        : 3; // средняя тяжесть по умолчанию

      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (counts.lastWeek > counts.previousWeek * 1.2) trend = 'increasing';
      else if (counts.lastWeek < counts.previousWeek * 0.8) trend = 'decreasing';

      return {
        symptom,
        frequency: counts.total,
        severity: avgSeverity,
        trend,
        lastWeekCount: counts.lastWeek,
        previousWeekCount: counts.previousWeek
      };
    }).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Поиск корреляций в данных
   */
  private findCorrelations(data: PatientDataAnalysis): any {
    return {
      weatherImpact: Math.random() * 0.3 + 0.3, // Мок-данные для демо
      sleepCorrelation: Math.random() * 0.4 + 0.4,
      nutritionImpact: Math.random() * 0.5 + 0.3,
      stressCorrelation: Math.random() * 0.6 + 0.2
    };
  }

  /**
   * Анализ прогресса по целям
   */
  private analyzeGoalProgress(data: PatientDataAnalysis): any {
    const goals = data.onboardingData?.goals?.goals || [];
    return {
      completedGoals: goals.filter((g: any) => g.achieved).length,
      totalGoals: goals.length,
      progressRate: goals.length ? (goals.filter((g: any) => g.achieved).length / goals.length) * 100 : 0
    };
  }

  /**
   * Оценка факторов риска
   */
  private assessRiskFactors(data: PatientDataAnalysis): string[] {
    const risks: string[] = [];
    
    // Анализ частоты симптомов
    const symptomPatterns = this.analyzeSymptomPatterns(data.symptomEntries);
    const severeSymptoms = symptomPatterns.filter(s => s.severity >= 4 && s.frequency >= 5);
    
    if (severeSymptoms.length > 0) {
      risks.push('Частые тяжелые симптомы');
    }
    
    if (data.symptomEntries.length === 0) {
      risks.push('Недостаток данных для анализа');
    }

    return risks;
  }

  /**
   * Определение достижений
   */
  private identifyAchievements(data: PatientDataAnalysis): string[] {
    const achievements: string[] = [];
    
    if (data.symptomEntries.length >= 7) {
      achievements.push('Регулярное отслеживание симптомов');
    }
    
    if (data.nutritionData && data.nutritionData.length >= 5) {
      achievements.push('Ведение дневника питания');
    }
    
    if (data.chatHistory.length >= 3) {
      achievements.push('Активное взаимодействие с ИИ-помощником');
    }

    return achievements;
  }

  /**
   * Анализ истории чата
   */
  private analyzeChatHistory(chatHistory: any[]): any {
    return {
      totalSessions: chatHistory.length,
      recentConcerns: [], // Можно добавить анализ частых тем
      engagementLevel: chatHistory.length > 3 ? 'high' : chatHistory.length > 1 ? 'medium' : 'low'
    };
  }

  /**
   * Оценка качества данных
   */
  private assessDataQuality(data: PatientDataAnalysis): any {
    const hasOnboarding = Object.keys(data.onboardingData).length > 0;
    const hasSymptoms = data.symptomEntries.length > 0;
    const hasChat = data.chatHistory.length > 0;
    
    const score = (hasOnboarding ? 30 : 0) + 
                  (hasSymptoms ? 40 : 0) + 
                  (hasChat ? 20 : 0) + 
                  (data.nutritionData?.length ? 10 : 0);

    return {
      score,
      hasOnboarding,
      hasSymptoms,
      hasChat,
      isGoodQuality: score >= 50
    };
  }

  /**
   * Генерация рекомендаций на основе анализа
   */
  private generateRecommendations(analysis: any, patientData: PatientDataAnalysis): EvaRecommendation[] {
    const recommendations: EvaRecommendation[] = [];
    
    // ✅ НОВОЕ: Генерируем рекомендации на основе ИИ-инсайтов от Claude
    recommendations.push(...this.generateClaudeBasedRecommendations(patientData));
    
    // Срочные рекомендации
    recommendations.push(...this.generateUrgentRecommendations(analysis, patientData));
    
    // Рекомендации по образу жизни
    recommendations.push(...this.generateLifestyleRecommendations(analysis, patientData));
    
    // Медицинские рекомендации
    recommendations.push(...this.generateMedicalRecommendations(analysis, patientData));
    
    // Профилактические рекомендации
    recommendations.push(...this.generatePreventionRecommendations(analysis, patientData));
    
    // Поощрения за достижения
    recommendations.push(...this.generateAchievementRecommendations(analysis, patientData));

    // Сортировка по приоритету и ограничение количества
    return recommendations
      .sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority))
      .slice(0, 6);
  }

  /**
   * ✅ НОВОЕ: Генерация рекомендаций на основе ИИ-инсайтов от Claude
   */
  private generateClaudeBasedRecommendations(data: PatientDataAnalysis): EvaRecommendation[] {
    const claudeRecommendations: EvaRecommendation[] = [];
    
    if (!data.aiInsights || data.aiInsights.length === 0) {
      return claudeRecommendations;
    }

    // Берем последние 3 анализа от Claude
    const recentInsights = data.aiInsights.slice(0, 3);
    
    recentInsights.forEach((insight, index) => {
      const insightData = insight.insight_data || {};
      const recommendations = insight.actionable_recommendations || {};
      
      // Создаем рекомендации на основе ключевых находок Claude
      if (insightData.key_findings && insightData.key_findings.length > 0) {
        const mainFinding = insightData.key_findings[0];
        
        claudeRecommendations.push({
          id: `claude-insight-${insight.id}-${index}`,
          type: 'medical',
          priority: insight.confidence_score > 0.8 ? 'high' : 'medium',
          category: this.determineRecommendationCategory(mainFinding),
          title: `Инсайт от Claude: ${insightData.title || 'Персональный анализ'}`,
          description: mainFinding.length > 150 ? mainFinding.substring(0, 150) + '...' : mainFinding,
          reason: `Claude проанализировал ваши данные за ${insightData.description ? 'последний период' : 'сегодня'} и выявил важные паттерны`,
          actionSteps: recommendations.immediate_actions?.slice(0, 3) || [
            'Обратите внимание на выявленные паттерны',
            'Продолжайте отслеживание данных',
            'При необходимости обратитесь к врачу'
          ],
          basedOnData: insightData.data_sources || ['AI Analysis', 'Health Data'],
          confidence: Math.round((insight.confidence_score || 0.7) * 100),
          estimatedImpact: recommendations.immediate_actions?.length > 2 ? 'high' : 'medium',
          timeframe: 'следуйте рекомендациям',
          icon: 'brain',
          urgencyLevel: insight.confidence_score > 0.8 ? 'soon' : 'routine'
        });
      }

      // Добавляем рекомендации по корреляциям от Claude
      if (data.correlations && data.correlations.length > 0) {
        const correlation = data.correlations[0]; // Берем самую свежую корреляцию
        const correlationInsights = correlation.insights || {};
        const correlationRecs = correlation.recommendations || {};
        
        if (correlationInsights.pattern_description) {
          claudeRecommendations.push({
            id: `claude-correlation-${correlation.id}`,
            type: 'lifestyle',
            priority: correlation.correlation_strength > 0.7 ? 'high' : 'medium',
            category: 'symptoms',
            title: 'Обнаружена важная связь между симптомами',
            description: correlationInsights.pattern_description.length > 150 
              ? correlationInsights.pattern_description.substring(0, 150) + '...'
              : correlationInsights.pattern_description,
            reason: `Claude выявил связь силой ${Math.round((correlation.correlation_strength || 0.5) * 100)}% между различными факторами`,
            actionSteps: correlationRecs.actions?.slice(0, 3) || [
              'Обратите внимание на выявленную связь',
              'Отслеживайте связанные факторы',
              'Используйте эту информацию для управления симптомами'
            ],
            basedOnData: ['Correlation Analysis', 'AI Pattern Recognition'],
            confidence: Math.round((correlation.correlation_strength || 0.5) * 100),
            estimatedImpact: correlationRecs.expected_impact === 'High' ? 'high' : 'medium',
            timeframe: 'применяйте постоянно',
            icon: 'trending-up'
          });
        }
      }
    });

    return claudeRecommendations.slice(0, 3); // Ограничиваем количество рекомендаций от Claude
  }

  /**
   * Определение категории рекомендации на основе текста
   */
  private determineRecommendationCategory(text: string): RecommendationCategory {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('питание') || lowerText.includes('еда') || lowerText.includes('диета')) {
      return 'nutrition';
    }
    if (lowerText.includes('сон') || lowerText.includes('отдых')) {
      return 'sleep';
    }
    if (lowerText.includes('упражнения') || lowerText.includes('физическ') || lowerText.includes('активность')) {
      return 'exercise';
    }
    if (lowerText.includes('стресс') || lowerText.includes('расслабление') || lowerText.includes('медитация')) {
      return 'stress';
    }
    if (lowerText.includes('врач') || lowerText.includes('лечение') || lowerText.includes('медицин')) {
      return 'medical';
    }
    
    return 'symptoms'; // По умолчанию
  }

  /**
   * Генерация срочных рекомендаций
   */
  private generateUrgentRecommendations(analysis: any, data: PatientDataAnalysis): EvaRecommendation[] {
    const urgent: EvaRecommendation[] = [];
    
    // Проверка резкого ухудшения симптомов
    const worseTrends = analysis.symptomPatterns.filter((p: SymptomPattern) => 
      p.trend === 'increasing' && p.lastWeekCount > p.previousWeekCount * 1.5
    );
    
    if (worseTrends.length > 0) {
      urgent.push({
        id: 'urgent-symptoms-1',
        type: 'urgent',
        priority: 'high',
        category: 'symptoms',
        title: 'Заметно участились симптомы',
        description: `Симптом "${worseTrends[0].symptom}" участился на ${Math.round(((worseTrends[0].lastWeekCount - worseTrends[0].previousWeekCount) / worseTrends[0].previousWeekCount) * 100)}% за последнюю неделю`,
        reason: 'Резкое ухудшение симптомов может указывать на необходимость медицинской консультации',
        actionSteps: [
          'Обратитесь к гинекологу в течение 1-2 недель',
          'Ведите подробный дневник симптомов',
          'Избегайте известных триггеров'
        ],
        basedOnData: ['Записи симптомов за 14 дней', 'Анализ трендов'],
        confidence: 85,
        estimatedImpact: 'high',
        timeframe: 'в течение недели',
        icon: 'alert-circle',
        urgencyLevel: 'soon'
      });
    }

    return urgent;
  }

  /**
   * Генерация рекомендаций по образу жизни
   */
  private generateLifestyleRecommendations(analysis: any, data: PatientDataAnalysis): EvaRecommendation[] {
    const lifestyle: EvaRecommendation[] = [];
    
    // Рекомендация по питанию
    if (!data.nutritionData || data.nutritionData.length < 3) {
      lifestyle.push({
        id: 'lifestyle-nutrition-1',
        type: 'lifestyle',
        priority: 'medium',
        category: 'nutrition',
        title: 'Начните вести дневник питания',
        description: 'Питание значительно влияет на симптомы менопаузы. Отслеживание поможет выявить триггеры.',
        reason: 'Недостаточно данных о питании для персонализированного анализа',
        actionSteps: [
          'Записывайте все приемы пищи в течение недели',
          'Отмечайте, как чувствуете себя после еды',
          'Обращайте внимание на продукты-триггеры'
        ],
        basedOnData: ['Отсутствие записей о питании', 'Фаза менопаузы'],
        confidence: 75,
        estimatedImpact: 'medium',
        timeframe: 'начать сегодня',
        icon: 'utensils'
      });
    }

    // Рекомендация по физической активности
    if (data.menopausePhase && data.menopausePhase !== 'неопределена') {
      lifestyle.push({
        id: 'lifestyle-exercise-1',
        type: 'lifestyle',
        priority: 'medium',
        category: 'exercise',
        title: 'Регулярные физические упражнения',
        description: `Для ${data.menopausePhase} особенно важны силовые тренировки и кардио для поддержания здоровья костей.`,
        reason: 'Физическая активность снижает симптомы менопаузы и укрепляет кости',
        actionSteps: [
          'Занимайтесь 150 минут в неделю умеренной активностью',
          'Включите силовые тренировки 2 раза в неделю',
          'Добавьте йогу или стретчинг для гибкости'
        ],
        basedOnData: ['Фаза менопаузы', 'Общие рекомендации'],
        confidence: 80,
        estimatedImpact: 'high',
        timeframe: 'начать постепенно',
        icon: 'activity'
      });
    }

    return lifestyle;
  }

  /**
   * Генерация медицинских рекомендаций
   */
  private generateMedicalRecommendations(analysis: any, data: PatientDataAnalysis): EvaRecommendation[] {
    const medical: EvaRecommendation[] = [];
    
    // Рекомендация профилактического осмотра
    if (data.menopausePhase && data.symptomEntries.length > 5) {
      medical.push({
        id: 'medical-checkup-1',
        type: 'medical',
        priority: 'medium',
        category: 'medical',
        title: 'Плановая консультация гинеколога',
        description: 'На основе ваших симптомов рекомендуется обсудить с врачом возможности управления менопаузой.',
        reason: 'Регулярные консультации помогают оптимизировать лечение симптомов',
        actionSteps: [
          'Запишитесь на прием к гинекологу',
          'Подготовьте список ваших симптомов',
          'Обсудите варианты гормональной терапии при необходимости'
        ],
        basedOnData: ['Симптомы менопаузы', 'Фаза менопаузы'],
        confidence: 70,
        estimatedImpact: 'high',
        timeframe: 'в течение месяца',
        icon: 'stethoscope'
      });
    }

    return medical;
  }

  /**
   * Генерация профилактических рекомендаций
   */
  private generatePreventionRecommendations(analysis: any, data: PatientDataAnalysis): EvaRecommendation[] {
    const prevention: EvaRecommendation[] = [];
    
    prevention.push({
      id: 'prevention-supplements-1',
      type: 'prevention',
      priority: 'low',
      category: 'nutrition',
      title: 'Рассмотрите прием витамина D и кальция',
      description: 'Для поддержания здоровья костей в период менопаузы важны кальций и витамин D.',
      reason: 'Снижение эстрогена увеличивает риск остеопороза',
      actionSteps: [
        'Обсудите с врачом необходимость добавок',
        'Сдайте анализ на витамин D',
        'Включите в рацион богатые кальцием продукты'
      ],
      basedOnData: ['Фаза менопаузы', 'Профилактические рекомендации'],
      confidence: 65,
      estimatedImpact: 'medium',
      timeframe: 'долгосрочно',
      icon: 'shield'
    });

    return prevention;
  }

  /**
   * Генерация рекомендаций-поощрений
   */
  private generateAchievementRecommendations(analysis: any, data: PatientDataAnalysis): EvaRecommendation[] {
    const achievements: EvaRecommendation[] = [];
    
    if (analysis.achievements.length > 0) {
      achievements.push({
        id: 'achievement-tracking-1',
        type: 'achievement',
        priority: 'low',
        category: 'symptoms',
        title: 'Отличная работа по отслеживанию!',
        description: `Вы делаете великолепно! ${analysis.achievements.join(', ')}. Продолжайте в том же духе!`,
        reason: 'Регулярное отслеживание — ключ к пониманию вашего здоровья',
        actionSteps: [
          'Продолжайте ведение записей',
          'Обратите внимание на новые паттерны',
          'Поделитесь успехами с врачом'
        ],
        basedOnData: ['Регулярность записей', 'Активность пользователя'],
        confidence: 95,
        estimatedImpact: 'medium',
        timeframe: 'продолжайте',
        icon: 'award'
      });
    }

    return achievements;
  }

  /**
   * Получение веса приоритета для сортировки
   */
  private getPriorityWeight(priority: RecommendationPriority): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  /**
   * Базовые рекомендации для пользователей с недостаточным количеством данных
   */
  private getDefaultRecommendations(): EvaRecommendation[] {
    return [
      {
        id: 'default-tracking',
        type: 'lifestyle',
        priority: 'medium',
        category: 'symptoms',
        title: 'Начните отслеживать симптомы',
        description: 'Регулярные записи помогут Eva понять ваши индивидуальные паттерны и дать точные рекомендации.',
        reason: 'Недостаточно данных для персонализированного анализа',
        actionSteps: [
          'Добавляйте записи в трекер симптомов ежедневно',
          'Отмечайте интенсивность симптомов',
          'Записывайте факторы, которые влияют на самочувствие'
        ],
        basedOnData: ['Общие рекомендации'],
        confidence: 60,
        estimatedImpact: 'high',
        timeframe: 'начать сегодня',
        icon: 'clipboard'
      },
      {
        id: 'default-chat',
        type: 'lifestyle',
        priority: 'low',
        category: 'symptoms',
        title: 'Поговорите с Eva о ваших целях',
        description: 'ИИ-помощник поможет лучше понять ваши потребности и даст персональные советы.',
        reason: 'Интерактивное общение улучшает качество рекомендаций',
        actionSteps: [
          'Опишите Eva ваши основные беспокойства',
          'Расскажите о ваших целях в области здоровья',
          'Задавайте вопросы о симптомах'
        ],
        basedOnData: ['Интерактивное обучение'],
        confidence: 70,
        estimatedImpact: 'medium',
        timeframe: 'когда удобно',
        icon: 'message-square'
      }
    ];
  }
}

// Экспорт класса и синглтона
export { EvaRecommendationEngine };
export const evaRecommendationEngine = new EvaRecommendationEngine();