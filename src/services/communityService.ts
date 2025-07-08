interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_age_group: '35-40' | '40-45' | '45-50' | '50-55' | '55-60' | '60+';
  author_menopause_phase: 'premenopause' | 'perimenopause' | 'menopause' | 'postmenopause';
  title: string;
  content: string;
  category: 'general' | 'symptoms' | 'treatment' | 'lifestyle' | 'success_stories' | 'questions' | 'support';
  tags: string[];
  is_anonymous: boolean;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_verified: boolean;
  sensitivity_level: 'public' | 'sensitive' | 'private';
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: 'phase' | 'age' | 'symptoms' | 'treatment' | 'location' | 'interests';
  member_count: number;
  post_count: number;
  is_private: boolean;
  moderators: string[];
  tags: string[];
  icon: string;
  cover_image?: string;
  created_at: string;
}

interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  likes_count: number;
  is_anonymous: boolean;
  is_verified: boolean;
}

export const getCommunityContent = async (
  tab: string,
  category: string
): Promise<{ posts: CommunityPost[]; groups: CommunityGroup[] }> => {
  // Инициализируем демо-данные, если их нет
  const existingPosts = JSON.parse(localStorage.getItem('community_posts') || '[]');
  if (existingPosts.length === 0) {
    const demoPosts = getDefaultPosts();
    localStorage.setItem('community_posts', JSON.stringify(demoPosts));
  }

  // Загрузка из localStorage (позже заменить на API)
  const posts = JSON.parse(localStorage.getItem('community_posts') || '[]');
  const groups = getDefaultGroups();

  return { posts, groups };
};

export const getPostComments = async (postId: string): Promise<CommunityComment[]> => {
  // Возвращаем демо-комментарии
  return [
    {
      id: '1',
      post_id: postId,
      author_id: 'user1',
      author_name: 'Мария',
      content: 'Спасибо за такой честный пост! У меня похожий опыт.',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes_count: 5,
      is_anonymous: false,
      is_verified: false
    },
    {
      id: '2',
      post_id: postId,
      author_id: 'user2',
      author_name: 'Анонимно',
      content: 'Очень поддерживающее сообщество, чувствую себя понятой.',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes_count: 3,
      is_anonymous: true,
      is_verified: false
    }
  ];
};

export const getDefaultGroups = (): CommunityGroup[] => [
  {
    id: 'perimenopause_support',
    name: 'Поддержка в перименопаузе',
    description: 'Группа для женщин, которые только начинают путь менопаузы. Делимся опытом первых симптомов и способов адаптации.',
    category: 'phase',
    member_count: 1247,
    post_count: 89,
    is_private: false,
    moderators: ['mod1', 'mod2'],
    tags: ['перименопауза', 'поддержка', 'симптомы'],
    icon: '🌸',
    created_at: new Date().toISOString()
  },
  {
    id: 'natural_menopause',
    name: 'Естественная менопауза',
    description: 'Обсуждаем натуральные способы борьбы с симптомами: травы, питание, образ жизни без гормональной терапии.',
    category: 'treatment',
    member_count: 892,
    post_count: 156,
    is_private: false,
    moderators: ['mod3'],
    tags: ['натуральные методы', 'травы', 'питание'],
    icon: '🌿',
    created_at: new Date().toISOString()
  },
  {
    id: 'moscow_women',
    name: 'Женщины Москвы 45+',
    description: 'Встречи и поддержка для женщин в Москве. Организуем офлайн-встречи, прогулки, совместные активности.',
    category: 'location',
    member_count: 324,
    post_count: 67,
    is_private: false,
    moderators: ['mod4'],
    tags: ['москва', 'встречи', 'поддержка'],
    icon: '🏙️',
    created_at: new Date().toISOString()
  },
  {
    id: 'hrt_experience',
    name: 'Опыт ЗГТ',
    description: 'Закрытая группа для обмена опытом приема заместительной гормональной терапии. Только честные отзывы от реальных женщин.',
    category: 'treatment',
    member_count: 567,
    post_count: 234,
    is_private: true,
    moderators: ['doc1', 'mod5'],
    tags: ['ЗГТ', 'гормоны', 'опыт'],
    icon: '💊',
    created_at: new Date().toISOString()
  },
  {
    id: 'fitness_45plus',
    name: 'Фитнес после 45',
    description: 'Спорт и физическая активность в период менопаузы. Делимся тренировками, которые подходят нашему возрасту.',
    category: 'interests',
    member_count: 445,
    post_count: 123,
    is_private: false,
    moderators: ['trainer1'],
    tags: ['фитнес', 'спорт', 'здоровье'],
    icon: '💪',
    created_at: new Date().toISOString()
  },
  {
    id: 'sleep_support',
    name: 'Борьба с бессонницей',
    description: 'Группа поддержки для тех, кто страдает от нарушений сна в период менопаузы. Делимся способами улучшения сна.',
    category: 'symptoms',
    member_count: 678,
    post_count: 89,
    is_private: false,
    moderators: ['sleep_expert'],
    tags: ['сон', 'бессонница', 'отдых'],
    icon: '😴',
    created_at: new Date().toISOString()
  }
];

export const getDefaultPosts = (): CommunityPost[] => [
  {
    id: '1',
    author_id: 'user1',
    author_name: 'Елена',
    author_age_group: '45-50',
    author_menopause_phase: 'perimenopause',
    title: 'Мой первый год перименопаузы - что я узнала',
    content: 'Привет, девочки! Хочу поделиться своим опытом первого года перименопаузы. Начну с того, что первые симптомы я заметила около года назад - стали нерегулярными месячные, появились приливы по ночам и резкие перепады настроения. Сначала я списывала все на стресс на работе, но когда симптомы усилились, поняла, что это начало нового этапа. Самое главное, что я поняла - не нужно молчать и терпеть. Обращение к гинекологу-эндокринологу помогло мне разобраться в происходящем и подобрать подходящую поддержку. Сейчас принимаю растительные препараты, скорректировала питание и начала заниматься йогой. Состояние значительно улучшилось!',
    category: 'success_stories',
    tags: ['перименопауза', 'первый опыт', 'симптомы'],
    is_anonymous: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 24,
    comments_count: 8,
    is_pinned: true,
    is_verified: true,
    sensitivity_level: 'public'
  },
  {
    id: '2',
    author_id: 'user2',
    author_name: 'Анонимно',
    author_age_group: '50-55',
    author_menopause_phase: 'menopause',
    title: 'Как справиться с приливами на работе?',
    content: 'Девочки, подскажите, как вы справляетесь с приливами на работе? У меня они стали очень частыми и интенсивными. Работаю в офисе, и это очень неловко, когда вдруг краснею и потею. Пока спасаюсь веером и холодной водой, но хотелось бы узнать, есть ли более эффективные способы. Может, кто-то принимает что-то специальное? Врач предлагает ЗГТ, но я пока сомневаюсь.',
    category: 'symptoms',
    tags: ['приливы', 'работа', 'советы'],
    is_anonymous: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes_count: 15,
    comments_count: 12,
    is_pinned: false,
    is_verified: false,
    sensitivity_level: 'public'
  },
  {
    id: '3',
    author_id: 'user3',
    author_name: 'Ирина',
    author_age_group: '40-45',
    author_menopause_phase: 'perimenopause',
    title: 'Натуральные способы борьбы с перепадами настроения',
    content: 'Хочу поделиться тем, что мне помогло справиться с эмоциональными качелями в начале перименопаузы. Раньше я была очень спокойным человеком, а тут стала плакать от любой мелочи и срываться на близких. Что помогло: 1) Магний перед сном - значительно улучшил качество сна и снизил тревожность. 2) Медитация 10 минут утром - использую приложение Headspace. 3) Регулярные прогулки на свежем воздухе, особенно в лесу. 4) Травяной чай с мятой и мелиссой вечером. 5) Ведение дневника эмоций - помогает отслеживать триггеры. Результат заметила уже через месяц!',
    category: 'lifestyle',
    tags: ['настроение', 'натуральные методы', 'стресс'],
    is_anonymous: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes_count: 31,
    comments_count: 6,
    is_pinned: false,
    is_verified: true,
    sensitivity_level: 'public'
  },
  {
    id: '4',
    author_id: 'user4',
    author_name: 'Анонимно',
    author_age_group: '45-50',
    author_menopause_phase: 'perimenopause',
    title: 'Очень нужна поддержка - чувствую себя сломленной',
    content: 'Девочки, очень нужна ваша поддержка. Последние месяцы чувствую себя ужасно. Постоянная усталость, депрессивные мысли, кажется, что жизнь проходит мимо. Муж не понимает, что со мной происходит, дети выросли и живут своей жизнью. Ощущение, что я никому не нужна и ничего хорошего впереди не ждет. Знаю, что это гормоны, но от этого не легче. Как вы находите в себе силы продолжать? Что помогает вам в такие моменты?',
    category: 'support',
    tags: ['депрессия', 'поддержка', 'одиночество'],
    is_anonymous: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    likes_count: 8,
    comments_count: 23,
    is_pinned: false,
    is_verified: false,
    sensitivity_level: 'sensitive'
  },
  {
    id: '5',
    author_id: 'user5',
    author_name: 'Доктор Светлана',
    author_age_group: '50-55',
    author_menopause_phase: 'postmenopause',
    title: 'Мифы о ЗГТ, которые пора развеять',
    content: 'Как врач-гинеколог, хочу развеять несколько распространенных мифов о заместительной гормональной терапии. Миф 1: ЗГТ всегда приводит к раку. Реальность: современные исследования показывают, что правильно подобранная ЗГТ в оптимальном временном окне (первые 10 лет менопаузы) имеет минимальные риски. Миф 2: ЗГТ подходит всем. Реальность: есть противопоказания, поэтому нужна индивидуальная оценка. Миф 3: Натуральные средства всегда безопаснее. Реальность: некоторые травы могут взаимодействовать с лекарствами. Главное - найти квалифицированного специалиста и принимать решение на основе фактов, а не страхов.',
    category: 'treatment',
    tags: ['ЗГТ', 'мифы', 'врач'],
    is_anonymous: false,
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    likes_count: 45,
    comments_count: 15,
    is_pinned: true,
    is_verified: true,
    sensitivity_level: 'public'
  }
];

export const getRecommendedGroups = (allGroups: CommunityGroup[]): CommunityGroup[] => {
  // Простая логика рекомендаций на основе профиля пользователя
  return allGroups.filter(group => 
    group.category === 'phase' || group.category === 'treatment' || group.category === 'symptoms'
  ).slice(0, 4);
};