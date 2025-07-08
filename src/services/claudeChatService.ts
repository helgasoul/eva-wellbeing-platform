import { supabase } from '@/integrations/supabase/client';

interface ClaudeConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

interface RateLimit {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxTokensPerRequest: number;
  maxTokensPerDay: number;
}

interface UserLimits {
  userId: string;
  requestsToday: number;
  tokensUsedToday: number;
  lastRequestTime: string;
  requestsThisHour: number;
  hourlyResetTime: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  metadata?: {
    tokensUsed: number;
    responseTime: string;
    confidence: number;
    medicalDisclaimer: boolean;
  };
  remainingRequests?: number;
}

interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingRequests?: number;
  resetTime?: string;
}

interface UserContext {
  age?: number;
  menopausePhase?: string;
  mainSymptoms?: string[];
  goals?: string[];
}

interface ParsedResponse {
  content: string;
  confidence: number;
  includeDisclaimer: boolean;
}

export interface UserLimitStatus {
  requestsToday: number;
  maxRequestsPerDay: number;
  remainingRequests: number;
  tokensUsedToday: number;
  maxTokensPerDay: number;
  requestsThisHour: number;
  maxRequestsPerHour: number;
  nextHourlyReset: string;
  nextDailyReset: string;
}

export class ClaudeChatService {
  private config: ClaudeConfig;
  private rateLimits: RateLimit;
  private userLimits: Map<string, UserLimits> = new Map();

  constructor() {
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4000,
      temperature: 0.7,
      systemPrompt: this.getMenopauseSpecializedPrompt()
    };

    this.rateLimits = {
      maxRequestsPerHour: 10,     // 10 запросов в час для MVP
      maxRequestsPerDay: 50,      // 50 запросов в день
      maxTokensPerRequest: 4000,  // Макс токенов на запрос
      maxTokensPerDay: 100000     // Макс токенов в день
    };

    // Загружаем лимиты из localStorage при инициализации
    this.loadUserLimitsFromStorage();
  }

  async sendMessage(
    userId: string, 
    message: string, 
    conversationHistory: ChatMessage[]
  ): Promise<ChatResponse> {
    try {
      // Проверяем лимиты
      const limitCheck = this.checkRateLimits(userId, message);
      if (!limitCheck.allowed) {
        return {
          success: false,
          error: limitCheck.reason,
          remainingRequests: limitCheck.remainingRequests,
        };
      }

      // Подготавливаем контекст для Claude
      const contextualPrompt = this.buildContextualPrompt(
        message, 
        conversationHistory,
        userId
      );

      // Временная заглушка для тестирования (пока не работает edge function)
      console.log('Отправляем запрос к Claude с промптом:', contextualPrompt);
      
      // Имитируем задержку API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Генерируем ответ на основе содержания сообщения
      const response = this.generateTestResponse(message);
      
      console.log('Получили ответ от Claude:', response);

      // TODO: Заменить на реальный вызов edge function когда будет исправлен
      /*
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: contextualPrompt,
          model: this.config.model,
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data || !data.response) {
        console.error('Invalid response from Claude function:', data);
        throw new Error('Некорректный ответ от ИИ-сервиса');
      }

      const response = data.response;
      */

      // Обновляем лимиты пользователя
      this.updateUserLimits(userId, message, response);

      // Парсим и валидируем ответ
      const parsedResponse = this.parseClaudeResponse(response);

      return {
        success: true,
        message: parsedResponse.content,
        metadata: {
          tokensUsed: this.estimateTokens(message + response),
          responseTime: new Date().toISOString(),
          confidence: parsedResponse.confidence,
          medicalDisclaimer: parsedResponse.includeDisclaimer
        },
        remainingRequests: this.getRemainingRequests(userId)
      };

    } catch (error) {
      console.error('Claude API Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userId: userId
      });
      
      return {
        success: false,
        error: 'Временная ошибка ИИ-ассистента. Попробуйте позже.',
        remainingRequests: this.getRemainingRequests(userId)
      };
    }
  }

  private getMenopauseSpecializedPrompt(): string {
    return `
Ты - специализированный ИИ-ассистент платформы Eva для поддержки женщин в период менопаузы.

ТВОЯ РОЛЬ:
- Эмпатичный консультант по вопросам менопаузы
- Источник научно обоснованной информации
- Поддержка эмоционального благополучия

ОБЯЗАТЕЛЬНЫЕ ПРИНЦИПЫ:
1. МЕДИЦИНСКАЯ БЕЗОПАСНОСТЬ:
   - НЕ ставь диагнозы
   - НЕ назначай лечение
   - ВСЕГДА рекомендуй консультацию врача при серьезных симптомах
   - Используй формулировки: "рекомендуется обсудить с врачом"

2. ЭМПАТИЯ И ПОДДЕРЖКА:
   - Признавай чувства и переживания
   - Используй понимающий, заботливый тон
   - Избегай медицинского жаргона
   - Давай практические советы по самопомощи

3. НАУЧНАЯ ОБОСНОВАННОСТЬ:
   - Опирайся на доказательную медицину
   - Различай мифы и факты о менопаузе
   - Предоставляй актуальную информацию

4. СПЕЦИАЛИЗАЦИЯ НА МЕНОПАУЗЕ:
   - Приливы, ночная потливость, нарушения сна
   - Изменения настроения, тревожность
   - Здоровье костей, сердечно-сосудистая система
   - Сексуальное здоровье, сухость
   - ЗГТ и альтернативные методы
   - Питание, физическая активность, образ жизни

ОБЯЗАТЕЛЬНЫЕ ДИСКЛЕЙМЕРЫ:
- "Эта информация носит образовательный характер и не заменяет медицинскую консультацию"
- "При серьезных симптомах обратитесь к врачу"
- "Любые изменения в лечении обсуждайте со специалистом"

ФОРМАТ ОТВЕТОВ:
- Краткие, понятные абзацы
- Практические советы в пунктах
- Эмоциональная поддержка
- Медицинский дисклеймер в конце (если применимо)

Отвечай на русском языке, используй теплый, поддерживающий тон.
    `.trim();
  }

  private buildContextualPrompt(
    message: string, 
    history: ChatMessage[], 
    userId: string
  ): string {
    // Получаем контекст пользователя из платформы Eva
    const userContext = this.getUserContext(userId);
    
    // Строим полный промпт с контекстом
    let prompt = this.config.systemPrompt + '\n\n';
    
    // Добавляем персональный контекст
    if (userContext) {
      prompt += `КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:\n`;
      prompt += `- Возраст: ${userContext.age || 'не указан'}\n`;
      prompt += `- Фаза менопаузы: ${userContext.menopausePhase || 'не определена'}\n`;
      prompt += `- Основные симптомы: ${userContext.mainSymptoms?.join(', ') || 'не указаны'}\n`;
      prompt += `- Цели: ${userContext.goals?.join(', ') || 'не указаны'}\n\n`;
    }

    // Добавляем историю разговора
    if (history.length > 0) {
      prompt += `ИСТОРИЯ РАЗГОВОРА:\n`;
      history.slice(-5).forEach(msg => {
        prompt += `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    // Добавляем текущий вопрос
    prompt += `ТЕКУЩИЙ ВОПРОС: ${message}\n\n`;
    prompt += `Ответь на вопрос, учитывая контекст пользователя и историю разговора. 
Будь эмпатичной, давай практические советы, но помни о медицинской безопасности.`;

    return prompt;
  }

  private checkRateLimits(userId: string, message: string): LimitCheckResult {
    const userLimits = this.getUserLimits(userId);
    const now = new Date();
    const messageTokens = this.estimateTokens(message);

    // Проверяем часовой лимит
    if (userLimits.requestsThisHour >= this.rateLimits.maxRequestsPerHour) {
      const hourlyReset = new Date(userLimits.hourlyResetTime);
      if (now < hourlyReset) {
        return {
          allowed: false,
          reason: `Превышен лимит запросов в час (${this.rateLimits.maxRequestsPerHour}). Попробуйте через ${Math.ceil((hourlyReset.getTime() - now.getTime()) / 60000)} минут.`,
          remainingRequests: 0,
          resetTime: hourlyReset.toISOString()
        };
      }
    }

    // Проверяем дневной лимит запросов
    if (userLimits.requestsToday >= this.rateLimits.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: `Превышен дневной лимит запросов (${this.rateLimits.maxRequestsPerDay}). Попробуйте завтра.`,
        remainingRequests: 0,
        resetTime: this.getTomorrowResetTime().toISOString()
      };
    }

    // Проверяем лимит токенов на запрос
    if (messageTokens > this.rateLimits.maxTokensPerRequest) {
      return {
        allowed: false,
        reason: `Сообщение слишком длинное. Максимум ${this.rateLimits.maxTokensPerRequest} символов.`,
        remainingRequests: this.rateLimits.maxRequestsPerDay - userLimits.requestsToday
      };
    }

    // Проверяем дневной лимит токенов
    if (userLimits.tokensUsedToday + messageTokens > this.rateLimits.maxTokensPerDay) {
      return {
        allowed: false,
        reason: `Превышен дневной лимит использования ИИ. Попробуйте завтра.`,
        remainingRequests: 0,
        resetTime: this.getTomorrowResetTime().toISOString()
      };
    }

    return {
      allowed: true,
      remainingRequests: this.rateLimits.maxRequestsPerDay - userLimits.requestsToday - 1
    };
  }

  private getUserLimits(userId: string): UserLimits {
    const existing = this.userLimits.get(userId);
    const now = new Date();
    const today = now.toDateString();

    if (!existing || existing.lastRequestTime.split('T')[0] !== today) {
      // Новый день - сбрасываем лимиты
      const newLimits: UserLimits = {
        userId,
        requestsToday: 0,
        tokensUsedToday: 0,
        lastRequestTime: now.toISOString(),
        requestsThisHour: 0,
        hourlyResetTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString()
      };
      this.userLimits.set(userId, newLimits);
      return newLimits;
    }

    // Проверяем часовой сброс
    const hourlyReset = new Date(existing.hourlyResetTime);
    if (now >= hourlyReset) {
      existing.requestsThisHour = 0;
      existing.hourlyResetTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    }

    return existing;
  }

  private updateUserLimits(userId: string, message: string, response: string): void {
    const userLimits = this.getUserLimits(userId);
    const tokensUsed = this.estimateTokens(message + response);

    userLimits.requestsToday += 1;
    userLimits.requestsThisHour += 1;
    userLimits.tokensUsedToday += tokensUsed;
    userLimits.lastRequestTime = new Date().toISOString();

    this.userLimits.set(userId, userLimits);

    // Сохраняем в localStorage для персистентности
    localStorage.setItem(`claude_limits_${userId}`, JSON.stringify(userLimits));
  }

  private loadUserLimitsFromStorage(): void {
    // Загружаем лимиты всех пользователей из localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('claude_limits_')) {
        try {
          const userId = key.replace('claude_limits_', '');
          const limitsData = localStorage.getItem(key);
          if (limitsData) {
            const limits = JSON.parse(limitsData);
            this.userLimits.set(userId, limits);
          }
        } catch (error) {
          console.warn('Failed to load user limits from storage:', error);
        }
      }
    }
  }

  private getUserContext(userId: string): UserContext | null {
    try {
      // Получаем данные пользователя из onboarding
      const onboardingData = localStorage.getItem('bloom-onboarding-data');
      if (!onboardingData) return null;

      const data = JSON.parse(onboardingData);
      return {
        age: data.age,
        menopausePhase: data.menopausePhase,
        mainSymptoms: data.symptoms,
        goals: data.goals
      };
    } catch {
      return null;
    }
  }

  private parseClaudeResponse(response: string): ParsedResponse {
    // Определяем, содержит ли ответ медицинскую информацию
    const medicalKeywords = [
      'симптом', 'лечение', 'препарат', 'диагноз', 'врач', 
      'здоровье', 'болезнь', 'терапия', 'медицин'
    ];
    
    const includeDisclaimer = medicalKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );

    // Оцениваем уверенность ответа
    const uncertaintyPhrases = [
      'возможно', 'может быть', 'вероятно', 'иногда', 
      'в некоторых случаях', 'не всегда'
    ];
    
    const uncertaintyCount = uncertaintyPhrases.reduce((count, phrase) => 
      count + (response.toLowerCase().split(phrase).length - 1), 0
    );
    
    const confidence = Math.max(0.3, 1 - (uncertaintyCount * 0.1));

    return {
      content: response,
      confidence,
      includeDisclaimer
    };
  }

  private estimateTokens(text: string): number {
    // Приблизительная оценка: 1 токен ≈ 4 символа для русского текста
    return Math.ceil(text.length / 4);
  }

  private getRemainingRequests(userId: string): number {
    const userLimits = this.getUserLimits(userId);
    return Math.max(0, this.rateLimits.maxRequestsPerDay - userLimits.requestsToday);
  }

  private getTomorrowResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // Публичный метод для получения статистики лимитов
  getUserLimitStatus(userId: string): UserLimitStatus {
    const userLimits = this.getUserLimits(userId);
    const remaining = this.getRemainingRequests(userId);
    
    return {
      requestsToday: userLimits.requestsToday,
      maxRequestsPerDay: this.rateLimits.maxRequestsPerDay,
      remainingRequests: remaining,
      tokensUsedToday: userLimits.tokensUsedToday,
      maxTokensPerDay: this.rateLimits.maxTokensPerDay,
      requestsThisHour: userLimits.requestsThisHour,
      maxRequestsPerHour: this.rateLimits.maxRequestsPerHour,
      nextHourlyReset: userLimits.hourlyResetTime,
      nextDailyReset: this.getTomorrowResetTime().toISOString()
    };
  }

  // Временный метод для тестирования (пока не работает edge function)
  private generateTestResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('эстрабалом') || lowerMessage.includes('estrobolom')) {
      return `Спасибо за ваш вопрос об Эстроболоме! 

Эстроболом - это комплекс для поддержки женского здоровья в период менопаузы, который содержит:

🌿 **Активные компоненты:**
• Экстракт красного клевера - богат изофлавонами
• Экстракт соевых бобов - источник фитоэстрогенов  
• Витамин Е - антиоксидант
• Фолиевая кислота - поддерживает общее самочувствие

💡 **Может помочь при:**
• Приливах и ночной потливости
• Перепадах настроения
• Нарушениях сна
• Снижении энергии

⚠️ **Важно помнить:**
• Это биологически активная добавка, не лекарство
• Рекомендуется обсудить с врачом перед применением
• Эффект может проявиться через 4-6 недель регулярного приема

Хотели бы узнать что-то конкретное об этом препарате?

*Эта информация носит образовательный характер и не заменяет медицинскую консультацию. При серьезных симптомах обратитесь к врачу.*`;
    }

    if (lowerMessage.includes('прилив') || lowerMessage.includes('жар')) {
      return `Приливы - это один из самых распространенных симптомов менопаузы. Вот несколько рекомендаций:

🌡️ **Немедленные способы:**
• Глубокое дыхание: вдох на 4 счета, задержка на 4, выдох на 8
• Прохладный компресс на шею и запястья
• Легкая одежда из натуральных тканей

🥗 **Долгосрочные стратегии:**
• Избегайте триггеров: острая пища, кофеин, алкоголь
• Регулярные физические упражнения
• Техники релаксации и медитация

*Эта информация носит образовательный характер и не заменяет медицинскую консультацию.*`;
    }

    // Общий ответ
    return `Привет! Я Eva, ваш персональный ИИ-помощник по женскому здоровью. 

Я понимаю, что период менопаузы может быть непростым, и каждая женщина проходит через это по-своему. Ваш опыт уникален, и я здесь, чтобы поддержать вас.

Можете рассказать подробнее о том, что именно вас беспокоит? Это поможет мне дать более точные и персонализированные рекомендации.

💝 Помните: забота о своем здоровье - это проявление силы!

*Я предоставляю информацию образовательного характера, которая не заменяет консультацию врача.*`;
  }
}

export const MVP_LIMITS = {
  FREE_TIER: {
    maxRequestsPerHour: 5,
    maxRequestsPerDay: 20,
    maxTokensPerRequest: 2000,
    maxTokensPerDay: 50000
  },
  PREMIUM_TIER: {
    maxRequestsPerHour: 15,
    maxRequestsPerDay: 100,
    maxTokensPerRequest: 4000,
    maxTokensPerDay: 200000
  },
  DOCTOR_TIER: {
    maxRequestsPerHour: 30,
    maxRequestsPerDay: 200,
    maxTokensPerRequest: 6000,
    maxTokensPerDay: 500000
  }
};