
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

interface QuickAction {
  id: string;
  text: string;
  prompt: string;
  icon: string;
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'ИИ-помощник' }
  ];

  // Быстрые действия на основе данных пользователя
  const quickActions: QuickAction[] = [
    {
      id: 'symptoms_today',
      text: 'Симптомы сегодня',
      prompt: 'Расскажи о моих симптомах за сегодня и дай рекомендации',
      icon: '📊'
    },
    {
      id: 'sleep_advice',
      text: 'Улучшить сон',
      prompt: 'Как улучшить качество сна во время менопаузы?',
      icon: '😴'
    },
    {
      id: 'hot_flashes',
      text: 'Справиться с приливами',
      prompt: 'Как справиться с приливами? Дай практические советы',
      icon: '🔥'
    },
    {
      id: 'mood_support',
      text: 'Поддержка настроения',
      prompt: 'Чувствую упадок настроения, что можно сделать?',
      icon: '💝'
    },
    {
      id: 'nutrition',
      text: 'Питание при менопаузе',
      prompt: 'Какое питание поможет при менопаузе?',
      icon: '🥗'
    },
    {
      id: 'exercise',
      text: 'Физическая активность',
      prompt: 'Какие упражнения подходят во время менопаузы?',
      icon: '🏃‍♀️'
    }
  ];

  useEffect(() => {
    loadChatHistory();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && !isInitialized) {
      initializeChat();
    }
  }, [messages, isInitialized]);

  const loadChatHistory = () => {
    const saved = localStorage.getItem(`ai_chat_${user?.id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
    setIsInitialized(true);
  };

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    localStorage.setItem(`ai_chat_${user?.id}`, JSON.stringify(newMessages));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Привет, ${user?.firstName}! 👋 Я Eva AI - ваш персональный помощник по вопросам менопаузы и женского здоровья.\n\nЯ знаю о ваших симптомах и готова помочь с советами, поддержкой и ответами на любые вопросы. Чем могу быть полезна?`,
      timestamp: new Date().toISOString()
    };

    setMessages([welcomeMessage]);
    saveChatHistory([welcomeMessage]);
  };

  const getUserContext = () => {
    // Получаем данные онбординга
    const onboardingData = (user as any)?.onboardingData || {};
    
    // Получаем последние записи симптомов
    const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
    const recentEntries = symptomEntries.slice(0, 7); // Последние 7 дней

    return {
      age: onboardingData.basicInfo?.age,
      hasStoppedPeriods: onboardingData.basicInfo?.hasStoppedPeriods,
      currentSymptoms: onboardingData.symptoms || {},
      goals: onboardingData.goals || [],
      recentSymptoms: recentEntries
    };
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const context = getUserContext();
    
    // Имитация API вызова с учетом контекста пользователя
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = '';

        // Простая логика ответов на основе ключевых слов и контекста
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
          response = `Привет! Рада вас видеть снова. Как дела? Если хотите, могу проанализировать ваши недавние симптомы или ответить на любые вопросы о менопаузе.`;
        }
        else if (lowerMessage.includes('симптом') && lowerMessage.includes('сегодня')) {
          const today = new Date().toISOString().split('T')[0];
          const todayEntry = context.recentSymptoms.find((entry: any) => entry.date === today);
          
          if (todayEntry) {
            response = `Я вижу, что сегодня вы отметили:\n\n`;
            if (todayEntry.hotFlashes?.count > 0) {
              response += `🔥 Приливы: ${todayEntry.hotFlashes.count} раз\n`;
            }
            if (todayEntry.nightSweats?.occurred) {
              response += `💦 Ночная потливость\n`;
            }
            if (todayEntry.sleep?.quality <= 2) {
              response += `😴 Проблемы со сном\n`;
            }
            if (todayEntry.mood?.overall <= 2) {
              response += `😔 Сниженное настроение\n`;
            }
            response += `\nРекомендую сегодня:\n- Больше отдыхать\n- Пить достаточно воды\n- Избегать триггеров приливов\n- Практиковать дыхательные упражнения`;
          } else {
            response = `Я не вижу записей о симптомах за сегодня. Рекомендую заполнить трекер симптомов, чтобы я могла дать более персонализированные советы. Как вы себя чувствуете?`;
          }
        }
        else if (lowerMessage.includes('прилив')) {
          response = `Приливы - один из самых частых симптомов менопаузы. Вот что поможет:\n\n🌡️ **Немедленная помощь:**\n- Глубокое медленное дыхание\n- Прохладное питье\n- Легкая одежда слоями\n- Вентилятор или прохладное место\n\n🍃 **Профилактика:**\n- Избегайте триггеров (острое, алкоголь, стресс)\n- Регулярные упражнения\n- Здоровый сон\n- Техники релаксации\n\nЕсли приливы сильно беспокоят, обязательно обсудите с врачом возможности лечения.`;
        }
        else if (lowerMessage.includes('сон') || lowerMessage.includes('спать')) {
          response = `Проблемы со сном во время менопаузы очень распространены. Попробуйте:\n\n🌙 **Гигиена сна:**\n- Ложитесь и вставайте в одно время\n- Прохладная спальня (16-19°C)\n- Темные шторы или маска для сна\n- Убрать гаджеты за час до сна\n\n🧘‍♀️ **Расслабление:**\n- Медитация перед сном\n- Теплая ванна с лавандой\n- Чтение книги\n- Дыхательные упражнения\n\n☕ **Избегать:**\n- Кофеин после 14:00\n- Большие порции еды на ночь\n- Алкоголь\n- Интенсивные тренировки вечером`;
        }
        else if (lowerMessage.includes('настроение') || lowerMessage.includes('депресс') || lowerMessage.includes('тревог')) {
          response = `Изменения настроения во время менопаузы - это нормально и вы не одиноки 💜\n\n🤗 **Что поможет:**\n- Регулярная физическая активность\n- Общение с близкими людьми\n- Хобби и творчество\n- Достаточный сон\n- Здоровое питание\n\n🆘 **Когда обратиться к врачу:**\n- Депрессия длится более 2 недель\n- Мысли о самоповреждении\n- Невозможность выполнять обычные дела\n- Панические атаки\n\nПомните: просить помощи - это признак силы, а не слабости.`;
        }
        else if (lowerMessage.includes('питание') || lowerMessage.includes('диета') || lowerMessage.includes('еда')) {
          response = `Правильное питание может значительно облегчить симптомы менопаузы:\n\n🥗 **Включить в рацион:**\n- Фитоэстрогены (соя, семена льна)\n- Кальций и витамин D (молочные продукты, зелень)\n- Омега-3 (рыба, орехи, авокадо)\n- Цельные зерна и клетчатка\n- Антиоксиданты (ягоды, овощи)\n\n❌ **Ограничить:**\n- Рафинированный сахар\n- Обработанные продукты\n- Избыток кофеина\n- Острую и жирную пищу\n- Алкоголь\n\n💡 **Совет:** Ведите пищевой дневник, чтобы выявить триггеры симптомов.`;
        }
        else if (lowerMessage.includes('упражнения') || lowerMessage.includes('спорт') || lowerMessage.includes('тренировк')) {
          response = `Физическая активность - ваш лучший друг во время менопаузы! 💪\n\n🏃‍♀️ **Рекомендуемые виды:**\n- Кардио 150 мин/неделю (ходьба, плавание)\n- Силовые тренировки 2-3 раза/неделю\n- Йога или пилатес для гибкости\n- Танцы для настроения\n\n✅ **Польза:**\n- Укрепление костей\n- Улучшение сна\n- Стабилизация настроения\n- Контроль веса\n- Снижение приливов\n\n⚠️ **Важно:** Начинайте постепенно, консультируйтесь с врачом при хронических заболеваниях.`;
        }
        else if (lowerMessage.includes('врач') || lowerMessage.includes('доктор')) {
          response = `Когда стоит обратиться к врачу:\n\n🚨 **Обязательно:**\n- Кровотечения после года без месячных\n- Очень болезненные симптомы\n- Депрессия или тревога\n- Проблемы с памятью\n- Боли в груди или костях\n\n👩‍⚕️ **Подготовка к визиту:**\n- Записывайте симптомы в дневнике\n- Список принимаемых препаратов\n- Семейный анамнез\n- Вопросы о ЗГТ и альтернативах\n\nНе стесняйтесь обсуждать любые вопросы - врач поможет найти лучший план лечения.`;
        }
        else if (lowerMessage.includes('вес') || lowerMessage.includes('похуд')) {
          response = `Изменения веса во время менопаузы - частая проблема. Как справиться:\n\n⚖️ **Причины набора веса:**\n- Снижение эстрогена\n- Замедление метаболизма\n- Потеря мышечной массы\n- Изменения в распределении жира\n\n🎯 **Стратегии:**\n- Силовые тренировки для мышц\n- Белок в каждом приеме пищи\n- Контроль порций\n- Достаточный сон\n- Управление стрессом\n\n🚫 **Избегать:**\n- Жестких диет\n- Пропуска приемов пищи\n- Экстремальных ограничений\n\nТерпение и постепенность - ключ к успеху!`;
        }
        else {
          response = `Спасибо за ваш вопрос! Я специализируюсь на вопросах менопаузы и женского здоровья.\n\nМогу помочь с:\n🔥 Приливами и ночной потливостью\n😴 Проблемами сна\n😊 Настроением и эмоциями\n🥗 Питанием и весом\n🏃‍♀️ Физической активностью\n💊 Информацией о лечении\n\nВыберите интересующую тему или задайте конкретный вопрос!`;
        }

        resolve(response);
      }, 1000 + Math.random() * 2000); // 1-3 секунды задержки
    });
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    // Добавляем индикатор печати
    const typingMessage: ChatMessage = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date().toISOString(),
      isTyping: true
    };

    setMessages([...updatedMessages, typingMessage]);

    try {
      const aiResponse = await generateAIResponse(message);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (error) {
      console.error('Ошибка ИИ:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Извините, произошла ошибка. Попробуйте еще раз через несколько секунд.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`ai_chat_${user?.id}`);
    initializeChat();
  };

  return (
    <PatientLayout title="bloom - ИИ-помощник" breadcrumbs={breadcrumbs}>
      <div className="h-[calc(100vh-200px)] bloom-card flex flex-col">
        {/* Заголовок */}
        <div className="flex-shrink-0 p-6 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-playfair font-bold text-foreground flex items-center">
                🤖 Eva AI
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  онлайн
                </span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Персональный помощник по вопросам менопаузы
              </p>
            </div>
            
            <button
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Очистить чат
            </button>
          </div>
        </div>

        {/* Быстрые действия */}
        {messages.length <= 1 && (
          <div className="flex-shrink-0 p-4 border-b border-border bg-muted/30">
            <p className="text-sm text-muted-foreground mb-3">Быстрые вопросы:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleSendMessage(action.prompt)}
                  className="flex items-center bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {message.isTyping ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">Eva печатает...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                  
                  <div
                    className={cn(
                      "text-xs mt-1",
                      message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Поле ввода */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите ваш вопрос о менопаузе..."
              disabled={isLoading}
              className="flex-1 p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 bg-background"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className={cn(
                "px-6 py-3 rounded-lg font-medium transition-colors",
                isLoading || !inputMessage.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isLoading ? '...' : 'Отправить'}
            </button>
          </div>
          
          <div className="mt-2">
            <p className="text-xs text-muted-foreground text-center">
              Eva AI может допускать ошибки. Важные медицинские вопросы обсуждайте с врачом.
            </p>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AIChat;
