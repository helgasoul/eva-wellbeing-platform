import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, Shield, Heart, Users } from 'lucide-react';

const termsContent = {
  title: "Условия использования Eva Platform",
  lastUpdated: "15 июля 2025",
  sections: [
    {
      title: "1. Общие положения",
      content: `
        Добро пожаловать на Eva Platform! Используя нашу платформу, вы соглашаетесь с настоящими 
        условиями использования. Пожалуйста, внимательно ознакомьтесь с ними.
        
        Eva Platform предоставляет цифровые инструменты поддержки женщин в период менопаузы, 
        включая трекинг симптомов, персонализированные рекомендации и доступ к медицинской информации.
      `
    },
    {
      title: "2. Медицинская ответственность",
      content: `
        ВАЖНО: Eva Platform НЕ заменяет профессиональную медицинскую помощь.
        
        • Наши рекомендации носят информационный характер
        • Всегда консультируйтесь с врачом перед принятием медицинских решений
        • При острых симптомах немедленно обращайтесь к медицинским специалистам
        • Мы не несем ответственности за последствия самолечения
        
        Платформа дополняет, но не заменяет традиционную медицинскую помощь.
      `
    },
    {
      title: "3. Пользовательский аккаунт",
      content: `
        Для использования платформы необходимо создать аккаунт:
        
        • Вы несете ответственность за безопасность своего аккаунта
        • Предоставляемая информация должна быть точной и актуальной
        • Запрещается создание множественных аккаунтов
        • Мы оставляем право заблокировать аккаунт при нарушении условий
        
        Один аккаунт предназначен для использования одним человеком.
      `
    },
    {
      title: "4. Допустимое использование",
      content: `
        При использовании платформы вы обязуетесь:
        
        ✓ Предоставлять точную медицинскую информацию
        ✓ Использовать сервис только в законных целях
        ✓ Уважать права других пользователей
        ✓ Соблюдать конфиденциальность
        
        ✗ Загружать вредоносный контент
        ✗ Нарушать работу системы
        ✗ Распространять недостоверную медицинскую информацию
        ✗ Использовать платформу в коммерческих целях без разрешения
      `
    },
    {
      title: "5. Интеллектуальная собственность",
      content: `
        Все материалы платформы защищены авторским правом:
        
        • Контент, алгоритмы и дизайн принадлежат Eva Platform
        • Вы получаете ограниченную лицензию на использование для личных целей
        • Запрещается копирование, воспроизведение или распространение материалов
        • Пользовательские данные остаются вашей собственностью
      `
    },
    {
      title: "6. Ограничение ответственности",
      content: `
        Eva Platform предоставляется "как есть":
        
        • Мы не гарантируем бесперебойную работу сервиса
        • Не несем ответственности за технические сбои
        • Не гарантируем точность всех медицинских рекомендаций
        • Максимальная ответственность ограничена стоимостью подписки
        
        Использование платформы происходит на ваш собственный риск.
      `
    },
    {
      title: "7. Подписка и платежи",
      content: `
        Условия подписки:
        
        • Оплата производится авансом за выбранный период
        • Автоматическое продление можно отключить в настройках
        • Возврат средств возможен в течение 14 дней после покупки
        • При нарушении условий подписка может быть аннулирована
        
        Базовая функциональность остается бесплатной.
      `
    },
    {
      title: "8. Конфиденциальность данных",
      content: `
        Обработка персональных данных регулируется нашей Политикой конфиденциальности:
        
        • Медицинские данные обрабатываются с особой осторожностью
        • Данные не передаются третьим лицам без согласия
        • Вы можете запросить удаление данных в любое время
        • Применяются современные методы шифрования и защиты
      `
    },
    {
      title: "9. Изменения в условиях",
      content: `
        Мы оставляем право изменять настоящие условия:
        
        • О существенных изменениях уведомляем за 30 дней
        • Продолжение использования означает согласие с изменениями
        • Критические изменения требуют отдельного согласия
        • Предыдущие версии доступны по запросу
      `
    },
    {
      title: "10. Контакты и поддержка",
      content: `
        Для связи с нами используйте:
        
        Email: support@eva-platform.ru
        Телефон: +7 (495) 123-45-67
        Адрес: 115191, г. Москва, ул. Большая Тульская, д. 10, стр. 1
        
        Время работы поддержки: 
        Пн-Пт: 9:00-18:00 (МСК)
        Сб-Вс: 10:00-16:00 (МСК)
      `
    }
  ]
};

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bloom-gradient">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-foreground">
              {termsContent.title}
            </h1>
          </div>
          <Badge variant="secondary" className="mb-4">
            Последнее обновление: {termsContent.lastUpdated}
          </Badge>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Эти условия регулируют использование Eva Platform. Пожалуйста, внимательно 
            ознакомьтесь с ними для безопасного и эффективного использования нашего сервиса.
          </p>
        </div>

        {/* Key Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Медицинская ответственность</h3>
              <p className="text-sm text-muted-foreground">
                Не заменяет профессиональную медицинскую помощь
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Ваши права</h3>
              <p className="text-sm text-muted-foreground">
                Контроль над данными и возможность отказа
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <Heart className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Поддержка</h3>
              <p className="text-sm text-muted-foreground">
                Всегда готовы помочь и ответить на вопросы
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Условия использования
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {termsContent.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {section.content}
                </div>
                {index < termsContent.sections.length - 1 && (
                  <hr className="border-muted" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="bg-red-50 border-red-200 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Важное медицинское предупреждение
                </h3>
                <p className="text-red-800 text-sm">
                  Eva Platform предоставляет информационную поддержку и не заменяет 
                  профессиональную медицинскую консультацию, диагностику или лечение. 
                  Всегда консультируйтесь с квалифицированным врачом по вопросам вашего здоровья.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-3">Нужна помощь?</h3>
              <p className="text-muted-foreground mb-4">
                Наша команда поддержки готова помочь вам с любыми вопросами.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> support@eva-platform.ru</p>
                <p><strong>Телефон:</strong> +7 (495) 123-45-67</p>
                <p><strong>Время работы:</strong> Пн-Пт: 9:00-18:00, Сб-Вс: 10:00-16:00 (МСК)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};