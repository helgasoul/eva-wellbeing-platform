import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  canSend: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputMessage,
  isLoading,
  canSend,
  onInputChange,
  onSendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm shadow-warm rounded-2xl overflow-hidden">
      {/* Заголовок чата */}
      <div className="border-b border-primary/20 p-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/20 rounded-full">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-playfair font-bold text-lg gentle-text">Чат с Eva</h2>
            <p className="text-sm soft-text">Ваш персональный ИИ-консультант</p>
          </div>
        </div>
      </div>

      {/* Область сообщений */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium gentle-text mb-2">Добро пожаловать!</h3>
            <p className="text-sm soft-text max-w-md mx-auto">
              Я Eva, ваш персональный ИИ-помощник по вопросам менопаузы. 
              Задайте мне любой вопрос о симптомах, здоровье или самочувствии.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-foreground border'
              )}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <Bot className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                )}
                {message.role === 'user' && (
                  <User className="h-4 w-4 mt-1 flex-shrink-0 text-primary-foreground" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={cn(
                    "text-xs mt-2 opacity-70",
                    message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {new Date(message.timestamp).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-muted/50 border">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4 text-primary" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm soft-text">Eva думает...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="border-t border-primary/20 p-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex space-x-3">
          <Input
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={
              canSend ? "Напишите ваш вопрос..." : "Лимит запросов исчерпан"
            }
            onKeyPress={handleKeyPress}
            className="flex-1 bg-white/80 border-primary/20 focus:border-primary"
            disabled={isLoading || !canSend}
          />
          <Button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isLoading || !canSend}
            className="px-6 bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {!canSend && (
          <p className="text-xs text-red-600 mt-2">
            Дневной лимит запросов исчерпан. Попробуйте завтра.
          </p>
        )}
      </div>
    </div>
  );
};