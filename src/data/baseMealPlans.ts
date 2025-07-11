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
  minAccessLevel: 'essential' | 'plus' | 'optimum';
  imageUrl?: string;
  instructions: string[];
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
      cookTime: 5,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Залейте овсяные хлопья кипятком и дайте настояться 5 минут',
        'Добавьте чернику и тщательно перемешайте',
        'Посыпьте грецкими орехами и семенами льна',
        'Подавайте теплым'
      ]
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
      cookTime: 0,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Очистите банан и киви, нарежьте крупными кусками',
        'Промойте шпинат',
        'Добавьте все ингредиенты в блендер',
        'Взбивайте 1-2 минуты до однородности',
        'Подавайте охлажденным'
      ]
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
      cookTime: 10,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Отварите куриную грудку в подсоленной воде 10 минут',
        'Нарежьте курицу кубиками',
        'Нарежьте авокадо дольками',
        'Разрежьте помидоры черри пополам',
        'Смешайте все ингредиенты с зеленью',
        'Заправьте оливковым маслом'
      ]
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
      cookTime: 25,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Разогрейте духовку до 180°C',
        'Нарежьте овощи крупными кусками',
        'Положите рыбу и овощи на противень',
        'Сбрызните оливковым маслом, посолите',
        'Запекайте 25 минут до готовности'
      ]
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
      cookTime: 10,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Взбейте яйца в миске',
        'Нарежьте авокадо дольками',
        'Разогрейте сковороду с маслом',
        'Вылейте яйца, добавьте шпинат',
        'Готовьте 3-4 минуты, добавьте авокадо',
        'Посыпьте семенами льна'
      ]
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
      cookTime: 15,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Промойте киноа в холодной воде',
        'Отварите киноа в подсоленной воде 15 минут',
        'Нарежьте курагу мелкими кусочками',
        'Измельчите миндаль',
        'Смешайте готовую киноа с орехами и курагой',
        'Добавьте корицу и перемешайте'
      ]
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
      cookTime: 20,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Нарежьте тыкву кубиками',
        'Запеките тыкву в духовке 180°C 20 минут',
        'Отварите нут до мягкости',
        'Промойте руколу',
        'Смешайте теплую тыкву с нутом',
        'Добавьте руколу и семена подсолнечника'
      ]
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
      cookTime: 15,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Нарежьте тофу кубиками',
        'Нарежьте овощи соломкой',
        'Разогрейте сковороду с маслом',
        'Обжарьте тофу до золотистого цвета',
        'Добавьте овощи и тушите 10 минут',
        'Посыпьте кунжутом перед подачей'
      ]
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
      cookTime: 0,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Смешайте семена чиа с кокосовым молоком',
        'Добавьте мед и тщательно перемешайте',
        'Оставьте в холодильнике на ночь',
        'Перед подачей добавьте малину',
        'Перемешайте и подавайте охлажденным'
      ]
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
      cookTime: 20,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Отварите киноа в подсоленной воде 15 минут',
        'Приготовьте лосось на гриле 6-8 минут',
        'Промойте и нарежьте зелень',
        'Смешайте киноа с зеленью',
        'Добавьте лосось кусочками',
        'Посыпьте кунжутом и заправьте маслом'
      ]
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
      cookTime: 25,
      minAccessLevel: 'optimum' as const,
      instructions: [
        'Нарежьте морковь кубиками',
        'Натрите имбирь на терке',
        'Обжарьте морковь с имбирем 5 минут',
        'Добавьте чечевицу и куркуму',
        'Залейте водой и варите 20 минут',
        'Взбейте блендером до однородности'
      ]
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
      cookTime: 30,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Разогрейте духовку до 200°C',
        'Нарежьте картофель дольками',
        'Подготовьте спаржу, удалив жесткие концы',
        'Выложите рыбу и овощи на противень',
        'Полейте лимонным соком',
        'Запекайте 25-30 минут'
      ]
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
      cookTime: 0,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Выложите творог в тарелку',
        'Измельчите грецкие орехи',
        'Посыпьте творог орехами и семенами кунжута',
        'Добавьте изюм',
        'Аккуратно перемешайте'
      ]
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
      cookTime: 0,
      minAccessLevel: 'plus' as const,
      instructions: [
        'Отварите брокколи на пару 5 минут',
        'Промойте и нарежьте зелень',
        'Разберите сардины на кусочки',
        'Смешайте все ингредиенты в салатнице',
        'Посыпьте кунжутом',
        'Заправьте лимонным соком'
      ]
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
      cookTime: 30,
      minAccessLevel: 'optimum' as const,
      instructions: [
        'Разогрейте духовку до 180°C',
        'Отварите брокколи и измельчите',
        'Смешайте творог с брокколи',
        'Измельчите миндаль',
        'Добавьте орехи и кунжут в смесь',
        'Выложите в форму и запекайте 30 минут'
      ]
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
      cookTime: 0,
      minAccessLevel: 'essential' as const,
      instructions: [
        'Очистите банан и нарежьте кусочками',
        'Добавьте все ингредиенты в блендер',
        'Взбивайте 1-2 минуты до однородности',
        'Процедите через сито при желании',
        'Подавайте охлажденным'
      ]
    }
  ]
};

export type { BasicMealPlan };