import { useState, useEffect, useCallback } from 'react';
import { aboutPlatformApi } from '@/services/aboutPlatformApi';

export interface AboutPlatformData {
  mission: {
    title: string;
    description: string;
    heroImage?: string;
  };
  founder: {
    name: string;
    story: string;
    experience: string;
    vision: string;
    photo?: string;
    bio: string;
  };
  principles: {
    scientific: {
      title: string;
      description: string;
      icon?: string;
    };
    personalization: {
      title: string;
      description: string;
      icon?: string;
    };
    empathy: {
      title: string;
      description: string;
      icon?: string;
    };
    security: {
      title: string;
      description: string;
      icon?: string;
    };
  };
  experts: Array<{
    id: string;
    name: string;
    specialization: string;
    achievements: string;
    interests: string;
    role: string;
    photo?: string;
  }>;
  technologies: {
    title: string;
    description: string;
    features: string[];
  };
  achievements: {
    stats: Array<{
      number: string;
      description: string;
    }>;
    partnerships: string[];
    awards: string[];
  };
  contacts: {
    general: string;
    partnerships: string;
    press: string;
  };
}

const defaultData: AboutPlatformData = {
  mission: {
    title: "Персональный помощник для женского здоровья",
    description: "bloom объединяет передовые технологии и медицинскую экспертизу, чтобы обеспечить каждой женщине персонализированный подход к здоровью и благополучию на всех этапах жизни."
  },
  founder: {
    name: "Основатель bloom",
    bio: "Эксперт в области цифрового здравоохранения",
    story: "История создания платформы началась с понимания того, что женщины заслуживают более качественного и персонализированного подхода к своему здоровью.",
    experience: "Многолетний опыт в области медицинских технологий и женского здоровья.",
    vision: "Мы видим будущее, где каждая женщина имеет доступ к персонализированной медицинской поддержке."
  },
  principles: {
    scientific: {
      title: "Основано на современной науке для вашего спокойствия",
      description: "Мы используем только проверенные научные знания, чтобы поддержать вас с уверенностью."
    },
    personalization: {
      title: "Рекомендации для вашей уникальной истории",
      description: "Все советы и планы — только для вас, с учетом вашей истории и потребностей."
    },
    empathy: {
      title: "Забота и внимание к каждому вашему этапу",
      description: "Мы здесь, чтобы слушать, понимать и быть рядом с вами в любой момент."
    },
    security: {
      title: "Ваши данные — только для вас, под надёжной защитой",
      description: "Все ваши данные под нашим заботливым присмотром — только для вас и вашего врача."
    }
  },
  experts: [
    {
      id: "1",
      name: "Др. Анна Смирнова",
      specialization: "Гинекология-эндокринология",
      achievements: "Кандидат медицинских наук, автор 50+ научных работ",
      interests: "Гормональные нарушения, менопауза",
      role: "Главный медицинский консультант",
      photo: "/api/placeholder/150/150"
    },
    {
      id: "2",
      name: "Др. Елена Волкова",
      specialization: "Репродуктивная медицина",
      achievements: "Доктор медицинских наук, международный эксперт",
      interests: "Планирование беременности, ЭКО",
      role: "Консультант по репродукции",
      photo: "/api/placeholder/150/150"
    }
  ],
  technologies: {
    title: "Передовые технологии для вашего здоровья",
    description: "Мы используем современные технологии для создания персонализированного опыта",
    features: [
      "Искусственный интеллект для анализа данных",
      "Генетическое тестирование",
      "Безопасное хранение данных",
      "Лабораторные анализы",
      "Интеграция с носимыми устройствами",
      "Телемедицина"
    ]
  },
  achievements: {
    stats: [
      { number: "10,000+", description: "Довольных пользователей" },
      { number: "50+", description: "Врачей-экспертов" },
      { number: "95%", description: "Положительных отзывов" },
      { number: "24/7", description: "Поддержка пользователей" }
    ],
    partnerships: [
      "Ведущие медицинские центры",
      "Научные институты",
      "Технологические партнеры"
    ],
    awards: [
      "Лучшее приложение года в категории 'Здоровье'",
      "Награда за инновации в медицине",
      "Сертификат качества ISO 27001"
    ]
  },
  contacts: {
    general: "info@bloom-health.com",
    partnerships: "partners@bloom-health.com",
    press: "press@bloom-health.com"
  }
};

export const useAboutPlatformData = () => {
  const [aboutData, setAboutData] = useState<AboutPlatformData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Загрузка данных при инициализации
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await aboutPlatformApi.getData();
        if (data) {
          setAboutData(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateData = useCallback(async (path: string, value: any) => {
    // Обновление локального состояния
    setAboutData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      // Автосохранение с задержкой
      setTimeout(() => {
        aboutPlatformApi.saveData(newData);
      }, 1000);
      
      return newData;
    });
  }, []);

  return {
    aboutData,
    updateData,
    isLoading
  };
};