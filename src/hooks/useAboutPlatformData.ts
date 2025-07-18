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
    quote?: string;
    approach?: string;
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
    title: "Ваш заботливый помощник в мире женского здоровья",
    description: "Всё, чтобы каждая женщина чувствовала себя услышанной и поддержанной: мы объединяем лучшие медицинские знания и технологии с настоящим человеческим участием."
  },
  founder: {
    name: "Ольга Пучкова",
    bio: "Основательница без | паузы",
    story: "Я создала без | паузы, потому что сама столкнулась с тем, как мало внимания уделяется женским потребностям и эмоциям в медицине. Я верю, что каждая женщина заслуживает не только заботы, но и понимания на каждом этапе жизни.",
    experience: "10+ лет в женском digital health, мама двоих детей",
    vision: "Мечтаю о мире, где каждая женщина чувствует себя услышанной и поддержанной в любой момент жизни",
    photo: "/lovable-uploads/73c908e4-72cf-4211-a489-8da3f189af53.png"
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
      name: "Др. Натия Шамугия",
      specialization: "Гинеколог-репродуктолог",
      achievements: "Эксперт в области репродуктивной медицины с международным признанием. Кандидат медицинских наук, специалист по лечению бесплодия",
      interests: "Специализируется на вспомогательных репродуктивных технологиях, планировании беременности и женском здоровье",
      role: "Главный медицинский консультант",
      photo: "/lovable-uploads/26a5f658-c863-4909-bf20-7ef8d36c95a4.png",
      quote: "Каждая женщина имеет право на материнство и профессиональную поддержку на этом пути",
      approach: "Применяю комплексный подход к лечению, сочетая современные технологии с индивидуальной заботой о каждой пациентке"
    },
    {
      id: "2", 
      name: "Др. Елена Волкова",
      specialization: "Репродуктивная медицина",
      achievements: "Горжусь тем, что подарила радость материнства многим семьям. Доктор медицинских наук, международный эксперт",
      interests: "Особое внимание уделяю планированию беременности, ЭКО и репродуктивному здоровью",
      role: "Консультант по репродукции", 
      photo: "/api/placeholder/200/200",
      quote: "Моя миссия — делать женское здоровье проще и понятнее для каждой",
      approach: "Верю, что каждая женщина имеет право на материнство и поддержку на этом пути"
    }
  ],
  technologies: {
    title: "Современные технологии — только для вашего спокойствия",
    description: "Все решения — ради вашего удобства и уверенности. Мы используем самые передовые технологии, чтобы вы всегда чувствовали заботу на каждом этапе пути.",
    features: [
      "Умный анализ — только для вашего комфорта и точности",
      "Персонализированные рекомендации на основе ваших генетических данных", 
      "Ваши данные под надёжной защитой — только для вас",
      "Все анализы — быстро, удобно и в одном месте",
      "Связь с вашими устройствами для большего спокойствия",
      "Консультации с врачами — в любое удобное для вас время"
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
    general: "info@bez-pauzy.com",
    partnerships: "partners@bez-pauzy.com",
    press: "press@bez-pauzy.com"
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