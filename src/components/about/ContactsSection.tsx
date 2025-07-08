import React from 'react';
import { AdminEditableSection } from './AdminEditableSection';
import { Mail, Phone, MapPin } from 'lucide-react';

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
      icon: Mail,
      description: 'Для общих вопросов и поддержки'
    },
    {
      key: 'partnerships',
      title: 'Партнерство',
      icon: Phone,
      description: 'Вопросы сотрудничества'
    },
    {
      key: 'press',
      title: 'Пресса',
      icon: MapPin,
      description: 'Для СМИ и журналистов'
    }
  ];

  return (
    <section className="py-16 bg-white/10 backdrop-blur-sm rounded-2xl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Контакты</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div key={contact.key} className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/30 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">{contact.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{contact.description}</p>

                <AdminEditableSection
                  title={`Контакт: ${contact.title}`}
                  content={data[contact.key as keyof typeof data]}
                  isEditing={isEditing}
                  onUpdate={(value) => onUpdate(contact.key, value)}
                  placeholder={`Контактная информация для ${contact.title.toLowerCase()}`}
                  className="text-foreground font-medium"
                />
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            bloom — персональный помощник для женского здоровья и благополучия
          </p>
        </div>
      </div>
    </section>
  );
};