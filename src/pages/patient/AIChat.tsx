import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, Zap, Moon, Activity } from 'lucide-react';
import { ClaudeChatService, UserLimitStatus } from '@/services/claudeChatService';
import { LimitStatusBar } from '@/components/ai-chat/LimitStatusBar';
import { ChatInterface } from '@/components/ai-chat/ChatInterface';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
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
    { icon: Heart, text: 'Как справиться с приливами?', category: 'symptoms' },
    { icon: Moon, text: 'Проблемы со сном', category: 'sleep' },
    { icon: Activity, text: 'Рекомендации по физической активности', category: 'exercise' },
    { icon: Zap, text: 'Упадок сил и энергии', category: 'energy' }
  ];

  // Загрузка истории чата и обновление лимитов
  useEffect(() => {
    loadChatHistory();
    updateLimitStatus();
  }, []);

  const loadChatHistory = () => {
    const saved = localStorage.getItem(`ai_chat_${user?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (error) {
        console.error('Ошибка загрузки истории чата:', error);
        // Добавляем приветственное сообщение при ошибке
        addWelcomeMessage();
      }
    } else {
      addWelcomeMessage();
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: 'Привет! Я Eva, ваш персональный ИИ-помощник по женскому здоровью. Я здесь, чтобы поддержать вас в период менопаузы. Расскажите, что вас беспокоит?',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  const updateLimitStatus = () => {
    if (user?.id) {
      const status = chatService.getUserLimitStatus(user.id);
      setLimitStatus(status);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user?.id || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    console.log('Отправляем сообщение:', inputMessage);
    console.log('User ID:', user.id);

    try {
      const response = await chatService.sendMessage(
        user.id, 
        inputMessage, 
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
        
        // Сохраняем историю
        localStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(finalMessages));
        
        // Добавляем дисклеймер если нужно
        if (response.metadata?.medicalDisclaimer) {
          setTimeout(() => {
            const disclaimerMessage: ChatMessage = {
              role: 'assistant',
              content: '⚠️ Эта информация носит образовательный характер и не заменяет консультацию врача.',
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, disclaimerMessage]);
          }, 1000);
        }
      } else {
        // Показываем ошибку
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: response.error || 'Произошла ошибка. Попробуйте позже.',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Произошла ошибка соединения. Пожалуйста, попробуйте позже.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      updateLimitStatus();
    }
  };

  const handleQuickAction = (action: any) => {
    setInputMessage(action.text);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`ai_chat_${user?.id}`);
    addWelcomeMessage();
  };

  return (
    <PatientLayout title="bloom - ИИ-консультант Eva" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок с информацией о лимитах */}
        <div className="bloom-card p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-bloom-golden to-bloom-caramel rounded-full animate-gentle-float">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-foreground">
                ИИ-консультант Eva 🤖
              </h1>
              <p className="text-muted-foreground">
                Персональный помощник для поддержки в период менопаузы
              </p>
            </div>
          </div>
          
          {/* Статус лимитов */}
          {limitStatus && (
            <LimitStatusBar limitStatus={limitStatus} />
          )}
        </div>

        {/* Быстрые действия */}
        <Card className="bloom-card">
          <CardHeader>
            <CardTitle className="text-foreground">Частые вопросы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleQuickAction(action)}
                  className="h-auto p-4 text-left justify-start gentle-border interactive-hover bg-gradient-to-r from-white to-bloom-vanilla"
                >
                  <action.icon className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-foreground">{action.text}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

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
        <Card className="bloom-card">
          <CardContent className="p-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">
                💡 <strong>Совет:</strong> Задавайте конкретные вопросы о симптомах для получения более точных рекомендаций
              </p>
              <p>
                🔒 Ваши данные защищены и используются только для улучшения консультаций
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default AIChat;