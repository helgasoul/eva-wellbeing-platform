import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Mail, Phone, MapPin, Heart, Users } from 'lucide-react';

interface ContactsSectionProps {
  data: {
    general: string;
    partnerships: string;
    press: string;
  };
  isEditing: boolean;
  onUpdate: (field: string, value: string) => void;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  data,
  isEditing,
  onUpdate
}) => {
  const contacts = [
    {
      key: 'general',
      title: 'Общие вопросы',
      icon: Heart,
      description: 'Всегда готовы поддержать и ответить — напишите нам!',
      microcopy: 'Ответим в течение 1 рабочего дня',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      key: 'partnerships',
      title: 'Партнёрство',
      icon: Users,
      description: 'Открыты к совместным проектам ради женского здоровья',
      microcopy: 'Вместе делаем женское здоровье доступнее',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      key: 'press',
      title: 'Пресса',
      icon: MapPin,
      description: 'Готовы рассказать и поделиться историей без | паузы',
      microcopy: 'Готовы делиться историей и вдохновлять',
      gradient: 'from-blue-500 to-purple-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50/50 via-purple-50/30 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-100/10 via-transparent to-purple-100/10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="text-5xl mb-6">💜</div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Свяжитесь с нами — мы рядом
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Наша команда поддержки всегда с вами — пишите, звоните или просто делитесь идеями, мы ответим с заботой!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div key={contact.key} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center hover:bg-white/90 hover:shadow-elegant hover:scale-105 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-20 h-20 bg-gradient-to-br ${contact.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3">{contact.title}</h3>
                <p className="text-muted-foreground text-lg mb-4 leading-relaxed">{contact.description}</p>

                <div className="mb-4">
                  <AdminEditableSection
                    title={`Контакт: ${contact.title}`}
                    content={data[contact.key as keyof typeof data]}
                    isEditing={isEditing}
                    onUpdate={(value) => onUpdate(contact.key, value)}
                    placeholder={`Контактная информация для ${contact.title.toLowerCase()}`}
                    className="text-primary font-semibold text-lg break-all"
                  />
                </div>

                <div className="text-sm text-muted-foreground italic border-t border-pink-100 pt-4">
                  {contact.microcopy}
                </div>
              </div>
            );
          })}
        </div>

        {/* Support message */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/80 rounded-3xl p-8 border border-pink-100/50 max-w-4xl mx-auto">
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Если вы не нашли ответа — просто напишите, мы всегда рады быть рядом
            </p>
            <p className="text-muted-foreground">
              Все обращения читают реальные люди, которые вас поддерживают
            </p>
          </div>
        </div>

        <div className="text-center mt-12 pt-8 border-t border-pink-200/50">
          <p className="text-lg text-muted-foreground leading-relaxed">
            <span className="text-2xl mr-2">✨</span>
            Ваша история — важна для нас. без | паузы — это не только сервис, это сообщество поддержки.
          </p>
        </div>
      </div>
    </section>
  );
};