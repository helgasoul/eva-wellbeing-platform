
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Heart, Zap, Moon, Activity } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Загрузка истории чата
  useEffect(() => {
    const savedMessages = localStorage.getItem(`ai_chat_${user?.id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Ошибка загрузки истории чата:', error);
      }
    } else {
      // Приветственное сообщение
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: 'Привет! Я Eva, ваш персональный ИИ-помощник по женскому здоровью. Я здесь, чтобы поддержать вас в период менопаузы. Расскажите, что вас беспокоит?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user?.id]);

  // Сохранение истории чата
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      localStorage.setItem(`ai_chat_${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user?.id]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content?: string) => {
    const messageText = content || inputMessage.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Симуляция ответа ИИ
    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Загрузка данных пользователя для персонализации
    const onboardingData = localStorage.getItem(`bloom-onboarding-data`);
    const symptomsData = localStorage.getItem(`symptom_entries_${user?.id}`);
    
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

Если приливы сильно влияют на качество жизни, рекомендую обратиться к гинекологу-эндокринологу для обсуждения гормональной терапии.`;
    }

    if (lowerMessage.includes('сон') || lowerMessage.includes('бессонница')) {
      return `Проблемы со сном в период менопаузы очень распространены. Давайте поработаем над улучшением качества сна:

🌙 **Гигиена сна:**
• Ложитесь и вставайте в одно время каждый день
• Комната должна быть прохладной (18-20°C)
• Отключите экраны за час до сна

🍃 **Естественные помощники:**
• Ромашковый чай перед сном
• Техники прогрессивной мышечной релаксации
• Ароматерапия с лавандой

🏃‍♀️ **Физическая активность:**
• Регулярные упражнения, но не позднее чем за 4 часа до сна
• Йога или стретчинг вечером

Если проблемы со сном продолжаются более 2 недель, обратитесь к врачу.`;
    }

    if (lowerMessage.includes('настроение') || lowerMessage.includes('депрессия') || lowerMessage.includes('тревога')) {
      return `Изменения настроения в период менопаузы - это нормальная реакция на гормональные изменения. Вы не одиноки в этом:

💙 **Эмоциональная поддержка:**
• Общайтесь с близкими о своих переживаниях
• Присоединяйтесь к группам поддержки женщин
• Ведите дневник эмоций

🧘‍♀️ **Практики для стабилизации:**
• Медитация осознанности 10-15 минут в день
• Регулярная физическая активность
• Достаточный сон (7-9 часов)

🌱 **Профессиональная помощь:**
• Психотерапия (КПТ особенно эффективна)
• При необходимости - консультация с психиатром
• Рассмотрите гормональную терапию с врачом

Помните: обращение за помощью - это признак силы, а не слабости.`;
    }

    // Общий ответ
    return `Спасибо за ваш вопрос! Я понимаю, что период менопаузы может быть непростым. 

Каждая женщина проходит через это по-своему, и ваш опыт уникален. Я здесь, чтобы поддержать вас персонализированными рекомендациями.

Можете рассказать подробнее о том, что именно вас беспокоит? Это поможет мне дать более точные советы, учитывая ваши индивидуальные потребности.

💝 Помните: вы делаете важный шаг, заботясь о своем здоровье!`;
  };

  const handleQuickAction = (action: any) => {
    handleSendMessage(action.text);
  };

  const clearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-new',
      type: 'ai',
      content: 'Привет! Я Eva, ваш персональный ИИ-помощник. Чем могу помочь?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <PatientLayout title="bloom - ИИ-консультант Eva" breadcrumbs={breadcrumbs}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Заголовок */}
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

        {/* Чат */}
        <Card className="bloom-card h-96">
          <CardHeader className="border-b border-primary/20">
            <div className="flex justify-between items-center">
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>Чат с Eva</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearChat}>
                Очистить чат
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-64 overflow-y-auto">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'ai' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-muted text-foreground">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          
          <div className="border-t border-primary/20 p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Напишите ваш вопрос..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default AIChat;
