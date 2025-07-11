-- Добавляем поле времени в таблицу symptom_entries
ALTER TABLE public.symptom_entries 
ADD COLUMN entry_time TIME DEFAULT '12:00:00';

-- Добавляем индекс для эффективного поиска по дате и времени
CREATE INDEX idx_symptom_entries_date_time ON public.symptom_entries(user_id, entry_date, entry_time);

-- Удаляем старый уникальный индекс по дате, так как теперь может быть несколько записей в день
DROP INDEX IF EXISTS unique_symptom_entry_per_day;

-- Создаем новый уникальный индекс по дате и времени
CREATE UNIQUE INDEX unique_symptom_entry_per_datetime 
ON public.symptom_entries(user_id, entry_date, entry_time);