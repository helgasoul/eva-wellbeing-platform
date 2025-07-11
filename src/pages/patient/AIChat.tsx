import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateId, showNotification } from '@/utils/dataUtils';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, Zap, Moon, Activity } from 'lucide-react';
import { ClaudeChatService, UserLimitStatus } from '@/services/claudeChatService';
import { LimitStatusBar } from '@/components/ai-chat/LimitStatusBar';
import { ChatInterface } from '@/components/ai-chat/ChatInterface';
import { DailyAnalysisPanel } from '@/components/ai-chat/DailyAnalysisPanel';
import { MonthlyAnalysisPanel } from '@/components/ai-chat/MonthlyAnalysisPanel';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChat: React.FC = () => {
  const { user, saveUserData, loadUserData, getUserDataSummary } = useAuth();
  const [chatService] = useState(() => new ClaudeChatService());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitStatus, setLimitStatus] = useState<UserLimitStatus | null>(null);

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'ИИ-консультант Eva' }
  ];

  // Быстрые действия для пациенток
  const quickActions = [
    { icon: Heart, text: 'Как мягко справляться с приливами?', category: 'symptoms' },
    { icon: Moon, text: 'Как улучшить сон и высыпаться?', category: 'sleep' },
    { icon: Activity, text: 'Как выбрать свою физическую активность?', category: 'exercise' },
    { icon: Zap, text: 'Как поддерживать энергию каждый день?', category: 'energy' }
  ];

  // Загрузка истории чата и обновление лимитов
  useEffect(() => {
    loadChatHistory();
    updateLimitStatus();
  }, [user?.id]);

  const loadChatHistory = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔄 AIChat: Загрузка истории чата...');
      
      const chatHistory = await loadUserData('ai_chat_history');
      if (chatHistory && Array.isArray(chatHistory)) {
        setMessages(chatHistory);
        console.log(`✅ AIChat: Загружено ${chatHistory.length} сообщений`);
      } else {
        console.log('📥 AIChat: История чата не найдена, создание приветственного сообщения');
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('❌ AIChat: Ошибка загрузки истории чата:', error);
      // Fallback к старому localStorage
      const saved = localStorage.getItem(`ai_chat_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (parseError) {
          console.error('Ошибка парсинга истории чата:', parseError);
          addWelcomeMessage();
        }
      } else {
        addWelcomeMessage();
      }
    }
  };

  const addWelcomeMessage = async () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: 'Здравствуйте! Я всегда рядом, чтобы поддержать вас на пути к гармонии в период менопаузы. Вы не одни — давайте разберемся вместе. 🌸\n\nЗдесь вы можете спокойно поговорить о любом вопросе, который вас волнует.',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
    
    // Сохраняем приветственное сообщение
    if (user?.id) {
      try {
        await saveUserData('ai_chat_history', [welcomeMessage]);
      } catch (error) {
        console.error('Error saving welcome message:', error);
      }
    }
  };

  const updateLimitStatus = () => {
    if (user?.id) {
      const status = chatService.getUserLimitStatus(user.id);
      setLimitStatus(status);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isLoading) return;

    try {
      setIsLoading(true);
      console.log('🔄 AIChat: Отправка сообщения...');

      // Добавить сообщение пользователя
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage('');

      // Получить полный контекст пользователя для персонализации
      const userDataSummary = await getUserDataSummary();
      
      // Создать персонализированный промпт
      const contextPrompt = createPersonalizedPrompt(userMessage.content, userDataSummary);
      
      // Отправить запрос к ИИ сервису
      const response = await chatService.sendMessage(
        user.id, 
        contextPrompt, 
        messages
      );

      if (response.success && response.message) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: response.metadata?.responseTime || new Date().toISOString()
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Сохранить обновленную историю через DataBridge
        await saveUserData('ai_chat_history', finalMessages);

        console.log('✅ AIChat: Сообщение отправлено и сохранено');
        
        // Добавляем дисклеймер если нужно
        if (response.metadata?.medicalDisclaimer) {
          setTimeout(async () => {
            const disclaimerMessage: ChatMessage = {
              role: 'assistant',
              content: '⚠️ Эта информация носит образовательный характер и не заменяет консультацию врача.',
              timestamp: new Date().toISOString()
            };
            const messagesWithDisclaimer = [...finalMessages, disclaimerMessage];
            setMessages(messagesWithDisclaimer);
            await saveUserData('ai_chat_history', messagesWithDisclaimer);
          }, 1000);
        }
      } else {
        // Показываем ошибку
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: response.error || 'Произошла ошибка. Попробуйте позже.',
          timestamp: new Date().toISOString()
        };
        const messagesWithError = [...updatedMessages, errorMessage];
        setMessages(messagesWithError);
        await saveUserData('ai_chat_history', messagesWithError);
      }
    } catch (error) {
      console.error('❌ AIChat: Ошибка отправки сообщения:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Произошла ошибка соединения. Пожалуйста, попробуйте позже.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      showNotification('Ошибка отправки сообщения', 'error');
    } finally {
      setIsLoading(false);
      updateLimitStatus();
    }
  };

  // Создание персонализированного промпта
  const createPersonalizedPrompt = (message: string, userSummary: any): string => {
    let context = `Контекст пользователя:\n`;
    
    if (userSummary?.userData) {
      context += `- Имя: ${userSummary.userData.firstName}\n`;
      context += `- Фаза менопаузы: ${userSummary.userData.menopausePhase || 'не определена'}\n`;
    }
    
    if (userSummary?.onboardingData) {
      context += `- Онбординг завершен: да\n`;
      context += `- Основные симптомы: ${JSON.stringify(userSummary.onboardingData.symptoms || {})}\n`;
    }
    
    if (userSummary?.symptomEntries) {
      context += `- Записей симптомов: ${userSummary.symptomEntries.length}\n`;
    }
    
    context += `\nВопрос пользователя: ${message}\n`;
    context += `\nОтветь персонализированно и поддерживающе, учитывая весь контекст.`;
    
    return context;
  };

  const handleQuickAction = (action: any) => {
    setInputMessage(action.text);
  };

  const clearChat = async () => {
    if (!confirm('Вы уверены, что хотите очистить всю историю чата?')) {
      return;
    }

    try {
      setMessages([]);
      await saveUserData('ai_chat_history', []);
      // Очищаем также старый localStorage
      localStorage.removeItem(`ai_chat_${user?.id}`);
      await addWelcomeMessage();
      console.log('✅ AIChat: История чата очищена');
      showNotification('История чата очищена', 'success');
    } catch (error) {
      console.error('❌ AIChat: Ошибка очистки чата:', error);
      showNotification('Ошибка очистки чата', 'error');
    }
  };

  return (
    <PatientLayout title="bloom - Eva, ваш цифровой помощник" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок с информацией о лимитах */}
        <div className="bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8 rounded-3xl shadow-elegant border border-primary/10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-full flex items-center justify-center animate-gentle-float backdrop-blur-sm">
                <span className="text-3xl">🌸</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-xs text-white">✨</span>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                Eva, ваш цифровой помощник 🌸
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Рада помочь вам сегодня! Я всегда рядом, чтобы поддержать вас на пути к гармонии.
              </p>
              <p className="text-primary/80 text-sm mt-2 italic">
                Здесь вы можете спокойно поговорить о любом вопросе, который вас волнует.
              </p>
            </div>
          </div>
          
          {/* Статус лимитов */}
          {limitStatus && (
            <LimitStatusBar limitStatus={limitStatus} />
          )}
        </div>

        {/* Быстрые действия */}
        <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-2">
              <span className="text-2xl">💝</span>
              <span className="font-playfair">Мои быстрые советы</span>
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Выберите то, что откликается вашему сердцу прямо сейчас
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickAction(action)}
                  className="h-auto p-6 text-left justify-start border-primary/20 bg-gradient-to-br from-background/80 to-primary/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-soft rounded-2xl group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-foreground font-medium leading-relaxed">{action.text}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Панель ежедневного анализа */}
        <DailyAnalysisPanel />

        {/* Панель ежемесячного анализа */}
        <MonthlyAnalysisPanel />

        {/* Чат интерфейс */}
        <ChatInterface
          messages={messages}
          inputMessage={inputMessage}
          isLoading={isLoading}
          onInputChange={setInputMessage}
          onSendMessage={sendMessage}
          canSend={limitStatus ? limitStatus.remainingRequests > 0 : true}
        />

        {/* Дополнительная информация */}
        <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🌷</span>
                <p className="text-foreground font-medium">
                  Не нашли свой вопрос? Просто начните чат — я поддержу вас.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
                  <p className="flex items-start gap-2">
                    <span className="text-primary">💝</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Говорите открыто:</strong> Задавайте любые вопросы о симптомах — я отвечу деликатно и с пониманием
                    </span>
                  </p>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-2xl border border-secondary/10">
                  <p className="flex items-start gap-2">
                    <span className="text-secondary">🔐</span>
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Ваша приватность:</strong> Все наши беседы конфиденциальны и защищены
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default AIChat;