interface BasicMealPlan {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  menopausePhase: string;
  benefits: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  cookTime: number;
}

export const baseMealPlans = {
  premenopause: [
    {
      id: 'pre_breakfast_1',
      name: 'Овсянка с ягодами и орехами',
      description: 'Поддержка энергии и регулярности циклов',
  mealType: 'breakfast' as const,
      time: '08:00',
      ingredients: ['овсяные хлопья 60г', 'черника 100г', 'грецкие орехи 30г', 'семена льна 10г'],
      calories: 380,
      protein: 12,
      carbs: 45,
      fat: 18,
      menopausePhase: 'premenopause',
      benefits: ['Поддержка энергии', 'Регулярность циклов', 'Антиоксиданты'],
      difficulty: 'easy' as const,
      prepTime: 10,
      cookTime: 5
    },
    {
      id: 'pre_breakfast_2',
      name: 'Смузи с зеленью и фруктами',
      description: 'Витаминный заряд для активного дня',
      mealType: 'breakfast' as const,
      time: '08:30',
      ingredients: ['банан 1шт', 'шпинат 50г', 'киви 1шт', 'йогурт 150г', 'мед 1ч.л.'],
      calories: 310,
      protein: 15,
      carbs: 52,
      fat: 6,
      menopausePhase: 'premenopause',
      benefits: ['Детокс', 'Витамины', 'Энергия'],
      difficulty: 'easy' as const,
      prepTime: 5,
      cookTime: 0
    },
    {
      id: 'pre_lunch_1',
      name: 'Салат с курицей и авокадо',
      description: 'Сбалансированный белок для поддержки гормонов',
      mealType: 'lunch' as const,
      time: '13:00',
      ingredients: ['куриная грудка 120г', 'авокадо 1/2', 'листовая зелень 100г', 'помидоры черри 100г'],
      calories: 420,
      protein: 35,
      carbs: 18,
      fat: 22,
      menopausePhase: 'premenopause',
      benefits: ['Стабилизация гормонов', 'Белок', 'Полезные жиры'],
      difficulty: 'easy' as const,
      prepTime: 15,
      cookTime: 10
    },
    {
      id: 'pre_dinner_1',
      name: 'Запеченная рыба с овощами',
      description: 'Омега-3 для здоровья и красоты',
      mealType: 'dinner' as const,
      time: '19:00',
      ingredients: ['треска 150г', 'брокколи 150г', 'морковь 100г', 'оливковое масло 10мл'],
      calories: 350,
      protein: 32,
      carbs: 25,
      fat: 12,
      menopausePhase: 'premenopause',
      benefits: ['Омега-3', 'Легкое пищеварение', 'Качественный белок'],
      difficulty: 'medium' as const,
      prepTime: 10,
      cookTime: 25
    }
  ],
  perimenopause: [
    {
      id: 'peri_breakfast_1',
      name: 'Омлет с авокадо и шпинатом',
      description: 'Смягчение переходных симптомов',
      mealType: 'breakfast' as const,
      time: '08:00',
      ingredients: ['яйца 2шт', 'авокадо 1/2', 'шпинат 50г', 'семена льна 10г'],
      calories: 320,
      protein: 18,
      carbs: 12,
      fat: 24,
      menopausePhase: 'perimenopause',
      benefits: ['Снижение приливов', 'Гормональный баланс', 'Здоровые жиры'],
      difficulty: 'easy' as const,
      prepTime: 5,
      cookTime: 10
    },
    {
      id: 'peri_breakfast_2',
      name: 'Каша из киноа с орехами',
      description: 'Стабилизация настроения и энергии',
      mealType: 'breakfast' as const,
      time: '08:30',
      ingredients: ['киноа 50г', 'миндаль 30г', 'курага 30г', 'корица 1ч.л.'],
      calories: 365,
      protein: 14,
      carbs: 48,
      fat: 16,
      menopausePhase: 'perimenopause',
      benefits: ['Стабилизация сахара', 'Магний', 'Антиоксиданты'],
      difficulty: 'easy' as const,
      prepTime: 5,
      cookTime: 15
    },
    {
      id: 'peri_lunch_1',
      name: 'Теплый салат с нутом',
      description: 'Фитоэстрогены для гормонального баланса',
      mealType: 'lunch' as const,
      time: '13:00',
      ingredients: ['нут 100г', 'тыква 150г', 'руккола 50г', 'семена подсолнечника 20г'],
      calories: 480,
      protein: 20,
      carbs: 58,
      fat: 18,
      menopausePhase: 'perimenopause',
      benefits: ['Фитоэстрогены', 'Клетчатка', 'Стабилизация гормонов'],
      difficulty: 'medium' as const,
      prepTime: 15,
      cookTime: 20
    },
    {
      id: 'peri_dinner_1',
      name: 'Тушеные овощи с тофу',
      description: 'Мягкая поддержка в переходный период',
      mealType: 'dinner' as const,
      time: '19:00',
      ingredients: ['тофу 120г', 'цуккини 100г', 'болгарский перец 100г', 'кунжут 15г'],
      calories: 290,
      protein: 18,
      carbs: 20,
      fat: 16,
      menopausePhase: 'perimenopause',
      benefits: ['Легкое пищеварение', 'Изофлавоны', 'Кальций'],
      difficulty: 'medium' as const,
      prepTime: 10,
      cookTime: 15
    }
  ],
  menopause: [
    {
      id: 'meno_breakfast_1',
      name: 'Чиа-пудинг с ягодами',
      description: 'Интенсивная поддержка при активных симптомах',
      mealType: 'breakfast' as const,
      time: '08:00',
      ingredients: ['семена чиа 30г', 'кокосовое молоко 200мл', 'малина 100г', 'мед 1ч.л.'],
      calories: 340,
      protein: 12,
      carbs: 35,
      fat: 20,
      menopausePhase: 'menopause',
      benefits: ['Омега-3', 'Антиоксиданты', 'Долгое насыщение'],
      difficulty: 'easy' as const,
      prepTime: 10,
      cookTime: 0
    },
    {
      id: 'meno_lunch_1',
      name: 'Салат с лососем и киноа',
      description: 'Управление интенсивными симптомами',
      mealType: 'lunch' as const,
      time: '13:00',
      ingredients: ['лосось 120г', 'киноа 80г', 'листовая зелень 100г', 'кунжут 15г'],
      calories: 520,
      protein: 35,
      carbs: 45,
      fat: 22,
      menopausePhase: 'menopause',
      benefits: ['Сильные фитоэстрогены', 'Омега-3', 'Противовоспалительное'],
      difficulty: 'medium' as const,
      prepTime: 15,
      cookTime: 20
    },
    {
      id: 'meno_lunch_2',
      name: 'Суп из чечевицы с куркумой',
      description: 'Противовоспалительная терапия',
      mealType: 'lunch' as const,
      time: '13:30',
      ingredients: ['красная чечевица 80г', 'куркума 1ч.л.', 'морковь 100г', 'имбирь 10г'],
      calories: 380,
      protein: 24,
      carbs: 52,
      fat: 8,
      menopausePhase: 'menopause',
      benefits: ['Противовоспалительное', 'Куркумин', 'Белок'],
      difficulty: 'medium' as const,
      prepTime: 10,
      cookTime: 25
    },
    {
      id: 'meno_dinner_1',
      name: 'Запеченная скумбрия с овощами',
      description: 'Вечернее восстановление и поддержка',
      mealType: 'dinner' as const,
      time: '19:00',
      ingredients: ['скумбрия 140г', 'сладкий картофель 150г', 'спаржа 100г', 'лимон 1/2'],
      calories: 460,
      protein: 28,
      carbs: 35,
      fat: 24,
      menopausePhase: 'menopause',
      benefits: ['Омега-3', 'Витамин D', 'Качественный белок'],
      difficulty: 'medium' as const,
      prepTime: 10,
      cookTime: 30
    }
  ],
  postmenopause: [
    {
      id: 'post_breakfast_1',
      name: 'Творог с семенами и орехами',
      description: 'Поддержка здоровья костей',
      mealType: 'breakfast' as const,
      time: '08:00',
      ingredients: ['творог 150г', 'семена кунжута 20г', 'грецкие орехи 30г', 'изюм 20г'],
      calories: 420,
      protein: 28,
      carbs: 25,
      fat: 22,
      menopausePhase: 'postmenopause',
      benefits: ['Кальций', 'Белок', 'Здоровье костей'],
      difficulty: 'easy' as const,
      prepTime: 5,
      cookTime: 0
    },
    {
      id: 'post_lunch_1',
      name: 'Салат с сардинами и зеленью',
      description: 'Профилактика остеопороза',
      mealType: 'lunch' as const,
      time: '13:00',
      ingredients: ['сардины 120г', 'листовая зелень 150г', 'брокколи 100г', 'кунжут 15г'],
      calories: 380,
      protein: 32,
      carbs: 15,
      fat: 22,
      menopausePhase: 'postmenopause',
      benefits: ['Кальций', 'Витамин D', 'Омега-3'],
      difficulty: 'easy' as const,
      prepTime: 10,
      cookTime: 0
    },
    {
      id: 'post_dinner_1',
      name: 'Творожная запеканка с кальцием',
      description: 'Долгосрочная профилактика остеопороза',
      mealType: 'dinner' as const,
      time: '19:00',
      ingredients: ['творог 150г', 'кунжут 20г', 'брокколи 100г', 'миндаль 30г'],
      calories: 400,
      protein: 30,
      carbs: 25,
      fat: 20,
      menopausePhase: 'postmenopause',
      benefits: ['Здоровье костей', 'Кальций', 'Профилактика остеопороза'],
      difficulty: 'medium' as const,
      prepTime: 10,
      cookTime: 30
    },
    {
      id: 'post_snack_1',
      name: 'Смузи с кальцием и магнием',
      description: 'Поддержка минерального баланса',
      mealType: 'snack' as const,
      time: '16:00',
      ingredients: ['кефир 200мл', 'миндаль 30г', 'банан 1шт', 'семена кунжута 10г'],
      calories: 320,
      protein: 18,
      carbs: 32,
      fat: 14,
      menopausePhase: 'postmenopause',
      benefits: ['Кальций', 'Магний', 'Пробиотики'],
      difficulty: 'easy' as const,
      prepTime: 5,
      cookTime: 0
    }
  ]
};

export type { BasicMealPlan };