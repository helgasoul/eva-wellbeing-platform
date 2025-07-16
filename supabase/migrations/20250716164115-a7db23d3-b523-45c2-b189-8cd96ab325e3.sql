-- Insert sample lessons
INSERT INTO public.lessons (id, course_id, title, description, video_url, duration_seconds, order_index, is_preview, key_takeaways) VALUES
  ('lesson1-aaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Что такое менопауза?', 'Основные понятия и определения менопаузы, перименопаузы и постменопаузы.', 'https://example.com/video1.mp4', 1800, 1, true, ARRAY['Понимание основных терминов', 'Стадии менопаузы', 'Нормальные возрастные изменения']),
  ('lesson2-aaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Гормональные изменения', 'Как меняются уровни эстрогена и прогестерона во время менопаузы.', 'https://example.com/video2.mp4', 2100, 2, false, ARRAY['Роль эстрогена', 'Влияние на организм', 'Временные рамки изменений']),
  ('lesson3-aaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Физические симптомы', 'Распознавание и понимание физических проявлений менопаузы.', 'https://example.com/video3.mp4', 1950, 3, false, ARRAY['Приливы жара', 'Нарушения сна', 'Изменения кожи']),
  ('lesson1-bbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Основы ЗГТ', 'Введение в заместительную гормональную терапию.', 'https://example.com/video4.mp4', 2400, 1, true, ARRAY['Принципы ЗГТ', 'Показания к применению', 'Противопоказания']),
  ('lesson1-ccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Питание в менопаузе', 'Основные принципы здорового питания в период менопаузы.', 'https://example.com/video5.mp4', 1500, 1, true, ARRAY['Важные нутриенты', 'Продукты для поддержания здоровья', 'Что избегать']),
  ('lesson1-ddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Эмоциональные изменения', 'Понимание психологических аспектов менопаузы.', 'https://example.com/video6.mp4', 2000, 1, true, ARRAY['Влияние на настроение', 'Стратегии адаптации', 'Когда обращаться за помощью']);

-- Insert sample lesson resources
INSERT INTO public.lesson_resources (lesson_id, type, title, url, description) VALUES
  ('lesson1-aaa', 'pdf', 'Руководство по менопаузе', 'https://example.com/menopause-guide.pdf', 'Подробное руководство с основными понятиями'),
  ('lesson2-aaa', 'checklist', 'Чек-лист симптомов', 'https://example.com/symptoms-checklist.pdf', 'Список для отслеживания симптомов'),
  ('lesson3-aaa', 'worksheet', 'Дневник симптомов', 'https://example.com/symptom-diary.pdf', 'Рабочий лист для ведения дневника'),
  ('lesson1-bbb', 'pdf', 'Информация о ЗГТ', 'https://example.com/hrt-info.pdf', 'Детальная информация о гормональной терапии'),
  ('lesson1-ccc', 'recipe', 'Рецепты для здоровья', 'https://example.com/healthy-recipes.pdf', 'Полезные рецепты для менопаузы'),
  ('lesson1-ddd', 'exercise_plan', 'Упражнения для настроения', 'https://example.com/mood-exercises.pdf', 'Практические упражнения для улучшения настроения');