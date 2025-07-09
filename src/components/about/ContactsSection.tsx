import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Mail, Heart, Newspaper, Clock, User } from 'lucide-react';

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
      email: 'info@bloom-health.com',
      microcopy: 'Ответим в течение 1 рабочего дня',
      gradient: 'from-pink-400/80 to-rose-500/80'
    },
    {
      key: 'partnerships',
      title: 'Партнёрство',
      icon: User,
      description: 'Открыты к совместным проектам ради женского здоровья',
      email: 'partners@bloom-health.com',
      microcopy: 'Вместе делаем женское здоровье доступнее',
      gradient: 'from-purple-400/80 to-indigo-500/80'
    },
    {
      key: 'press',
      title: 'Пресса',
      icon: Newspaper,
      description: 'Готовы рассказать и поделиться историей Bloom',
      email: 'press@bloom-health.com',
      microcopy: 'Готовы делиться историей и вдохновлять',
      gradient: 'from-blue-400/80 to-cyan-500/80'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50/40 via-pink-50/30 to-rose-50/20 rounded-3xl relative overflow-hidden">
      {/* Мягкие декоративные элементы */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 right-20 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary mr-3 animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold text-[#53415B] leading-tight animate-fade-in">
              Свяжитесь с нами — мы рядом
            </h2>
            <Heart className="w-8 h-8 text-primary ml-3 animate-pulse" />
          </div>
          <p className="text-xl md:text-2xl text-[#A97FB2] max-w-4xl mx-auto leading-relaxed animate-fade-in mb-6" style={{ animationDelay: '0.2s' }}>
            Наша команда поддержки всегда с вами — пишите, звоните или просто делитесь идеями, мы ответим с заботой!
          </p>
          <p className="text-lg text-[#A97FB2] italic animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Все обращения читают реальные люди, которые вас поддерживают
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <div 
                key={contact.key} 
                className="group bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Иконка с анимацией */}
                <div className={`w-20 h-20 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                  <Icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                  {/* Микро-анимация при hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 -top-2 -right-2">
                    <Heart className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-[#53415B] mb-4">{contact.title}</h3>
                
                {/* Эмпатичное описание */}
                <p className="text-[#A97FB2] mb-6 leading-relaxed">{contact.description}</p>

                {/* Email */}
                <div className="bg-white/70 rounded-2xl p-4 mb-4 border border-purple-200/30">
                  <div className="flex items-center justify-center mb-2">
                    <Mail className="w-5 h-5 text-primary mr-2" />
                    <span className="font-semibold text-[#53415B]">{contact.email}</span>
                  </div>
                </div>

                {/* Microcopy */}
                <div className="flex items-center justify-center text-sm text-[#A97FB2] italic">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{contact.microcopy}</span>
                </div>

                {/* Скрытое поле для редактирования (если нужно) */}
                {isEditing && (
                  <div className="mt-4">
                    <AdminEditableSection
                      title={`Контакт: ${contact.title}`}
                      content={data[contact.key as keyof typeof data]}
                      isEditing={isEditing}
                      onUpdate={(value) => onUpdate(contact.key, value)}
                      placeholder={`Контактная информация для ${contact.title.toLowerCase()}`}
                      className="text-[#53415B] text-sm"
                    />
                  </div>
                )}

                {/* Tooltip при hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-4">
                  <div className="bg-gradient-to-r from-primary/15 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                    Мы здесь для вас! 💜
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Поддерживающее сообщение */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/50 shadow-lg animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-primary mr-3 animate-pulse" />
            <h3 className="text-2xl font-bold text-[#53415B]">Не нашли ответа?</h3>
          </div>
          <p className="text-lg text-[#A97FB2] mb-6 leading-relaxed max-w-2xl mx-auto">
            Если вы не нашли ответа — просто напишите, мы всегда рады быть рядом. 
            Ваша история — важна для нас. Bloom — это не только сервис, это сообщество поддержки.
          </p>
          
          {/* Декоративные элементы */}
          <div className="flex items-center justify-center space-x-4 text-[#A97FB2]">
            <Heart className="w-5 h-5 animate-pulse" />
            <span className="text-sm italic">Bloom — пространство заботы для каждой женщины</span>
            <Heart className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};