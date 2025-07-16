-- Insert sample instructors
INSERT INTO public.instructors (id, name, title, bio, photo_url, credentials, specialization) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Sarah Johnson', 'Menopause Specialist', 'Dr. Johnson is a leading expert in women''s health with over 15 years of experience in menopause management.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop', ARRAY['MD', 'Board Certified Gynecologist'], ARRAY['menopause', 'hormones', 'nutrition']),
  ('22222222-2222-2222-2222-222222222222', 'Dr. Michael Chen', 'Nutritionist', 'Dr. Chen specializes in nutrition during menopause and has helped thousands of women optimize their diet.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop', ARRAY['PhD in Nutrition', 'Registered Dietitian'], ARRAY['nutrition', 'lifestyle', 'wellness']),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Emily Rodriguez', 'Mental Health Specialist', 'Dr. Rodriguez focuses on mental health and emotional well-being during menopause transition.', 'https://images.unsplash.com/photo-1594824475863-15ffd3c96fb4?w=300&h=300&fit=crop', ARRAY['PhD in Psychology', 'Licensed Clinical Psychologist'], ARRAY['mental_health', 'wellness', 'lifestyle']);

-- Insert sample courses
INSERT INTO public.courses (id, title, description, instructor_id, category, difficulty, duration_minutes, total_lessons, thumbnail_url, is_featured, is_new, average_rating, total_reviews, completion_rate) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Понимание менопаузы: Основы', 'Полное руководство по пониманию менопаузы, ее симптомов и изменений в организме.', '11111111-1111-1111-1111-111111111111', 'menopause_basics', 'beginner', 180, 6, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop', true, false, 4.8, 245, 89),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Гормональная терапия и альтернативы', 'Изучите варианты гормональной терапии и натуральные альтернативы для управления симптомами.', '11111111-1111-1111-1111-111111111111', 'hormones', 'intermediate', 240, 8, 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop', true, false, 4.7, 189, 78),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Питание в период менопаузы', 'Оптимизируйте свое питание для поддержания здоровья и энергии во время менопаузы.', '22222222-2222-2222-2222-222222222222', 'nutrition', 'beginner', 150, 5, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', false, true, 4.9, 156, 92),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Эмоциональное здоровье и менопауза', 'Управление настроением, тревожностью и депрессией во время менопаузы.', '33333333-3333-3333-3333-333333333333', 'mental_health', 'intermediate', 200, 7, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop', false, true, 4.6, 98, 85);

-- Insert sample lessons
INSERT INTO public.lessons (id, course_id, title, description, video_url, duration_seconds, order_index, is_preview, key_takeaways) VALUES
  ('lesson1-1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Что такое менопауза?', 'Введение в менопаузу и ее различные стадии', 'https://example.com/video1', 1800, 1, true, ARRAY['Определение менопаузы', 'Стадии менопаузы', 'Средний возраст наступления']),
  ('lesson1-2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Физиологические изменения', 'Понимание того, как меняется ваше тело', 'https://example.com/video2', 2100, 2, false, ARRAY['Гормональные изменения', 'Физические симптомы', 'Долгосрочные эффекты']),
  ('lesson1-3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Общие симптомы', 'Распознавание и понимание симптомов менопаузы', 'https://example.com/video3', 1950, 3, false, ARRAY['Приливы', 'Нарушения сна', 'Изменения настроения']),

  ('lesson2-1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Введение в гормональную терапию', 'Основы заместительной гормональной терапии', 'https://example.com/video4', 2200, 1, true, ARRAY['Что такое ГЗТ', 'Виды гормонов', 'Способы применения']),
  ('lesson2-2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Натуральные альтернативы', 'Природные методы облегчения симптомов', 'https://example.com/video5', 2400, 2, false, ARRAY['Фитоэстрогены', 'Травяные добавки', 'Изменения образа жизни']),

  ('lesson3-1', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Основы правильного питания', 'Принципы здорового питания в менопаузе', 'https://example.com/video6', 1800, 1, true, ARRAY['Макронутриенты', 'Витамины и минералы', 'Гидратация']),
  ('lesson3-2', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Продукты для поддержки гормонов', 'Питание для гормонального баланса', 'https://example.com/video7', 2100, 2, false, ARRAY['Фитоэстрогены в еде', 'Омега-3 жирные кислоты', 'Антиоксиданты']),

  ('lesson4-1', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Эмоциональные изменения', 'Понимание эмоциональных аспектов менопаузы', 'https://example.com/video8', 1950, 1, true, ARRAY['Гормоны и настроение', 'Типичные эмоциональные изменения', 'Когда обращаться за помощью']),
  ('lesson4-2', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Техники управления стрессом', 'Практические методы снижения стресса', 'https://example.com/video9', 2250, 2, false, ARRAY['Дыхательные упражнения', 'Медитация', 'Физическая активность']);

-- Insert sample lesson resources
INSERT INTO public.lesson_resources (lesson_id, type, title, url, description) VALUES
  ('lesson1-1', 'pdf', 'Руководство по менопаузе', 'https://example.com/guide1.pdf', 'Полное руководство по пониманию менопаузы'),
  ('lesson1-1', 'checklist', 'Чек-лист симптомов', 'https://example.com/checklist1.pdf', 'Список для отслеживания симптомов'),
  ('lesson2-1', 'pdf', 'Справочник по ГЗТ', 'https://example.com/hrt-guide.pdf', 'Подробная информация о гормональной терапии'),
  ('lesson3-1', 'recipe', 'Рецепты для менопаузы', 'https://example.com/recipes.pdf', 'Полезные рецепты для поддержки здоровья'),
  ('lesson4-1', 'worksheet', 'Дневник настроения', 'https://example.com/mood-diary.pdf', 'Рабочий лист для отслеживания эмоций');