import { z } from 'zod';

/**
 * ✅ ВАЛИДАЦИЯ ВХОДНЫХ ДАННЫХ ДЛЯ МЕДИЦИНСКОГО ПРИЛОЖЕНИЯ
 * Соответствует стандартам HL7 FHIR и медицинской документации
 */

// Базовые валидаторы для медицинских данных
export const MedicalValidators = {
  // Валидация возраста (0-150 лет)
  age: z.number()
    .int('Возраст должен быть целым числом')
    .min(0, 'Возраст не может быть отрицательным')
    .max(150, 'Возраст не может превышать 150 лет'),

  // Валидация веса (1-1000 кг)
  weight: z.number()
    .positive('Вес должен быть положительным числом')
    .min(1, 'Минимальный вес: 1 кг')
    .max(1000, 'Максимальный вес: 1000 кг'),

  // Валидация роста (30-300 см)
  height: z.number()
    .positive('Рост должен быть положительным числом')
    .min(30, 'Минимальный рост: 30 см')
    .max(300, 'Максимальный рост: 300 см'),

  // Валидация артериального давления
  bloodPressure: z.object({
    systolic: z.number()
      .int('Систолическое давление должно быть целым числом')
      .min(50, 'Минимальное систолическое давление: 50 мм рт.ст.')
      .max(300, 'Максимальное систолическое давление: 300 мм рт.ст.'),
    diastolic: z.number()
      .int('Диастолическое давление должно быть целым числом')
      .min(30, 'Минимальное диастолическое давление: 30 мм рт.ст.')
      .max(200, 'Максимальное диастолическое давление: 200 мм рт.ст.')
  }).refine(
    (data) => data.systolic > data.diastolic,
    'Систолическое давление должно быть выше диастолического'
  ),

  // Валидация температуры тела (30-50°C)
  bodyTemperature: z.number()
    .min(30, 'Минимальная температура: 30°C')
    .max(50, 'Максимальная температура: 50°C'),

  // Валидация частоты пульса (20-300 уд/мин)
  heartRate: z.number()
    .int('Частота пульса должна быть целым числом')
    .min(20, 'Минимальная частота пульса: 20 уд/мин')
    .max(300, 'Максимальная частота пульса: 300 уд/мин'),

  // Валидация уровня боли (0-10)
  painLevel: z.number()
    .int('Уровень боли должен быть целым числом')
    .min(0, 'Минимальный уровень боли: 0')
    .max(10, 'Максимальный уровень боли: 10'),

  // Валидация медицинских заметок
  medicalNotes: z.string()
    .max(10000, 'Медицинские заметки не могут превышать 10,000 символов')
    .refine(
      (text) => !/[<>]/g.test(text),
      'Медицинские заметки не могут содержать HTML теги'
    ),

  // Валидация названий лекарств
  medicationName: z.string()
    .min(1, 'Название лекарства обязательно')
    .max(200, 'Название лекарства не может превышать 200 символов')
    .refine(
      (name) => /^[a-zA-Zа-яА-Я0-9\s\-\.]+$/.test(name),
      'Название лекарства может содержать только буквы, цифры, пробелы, дефисы и точки'
    ),

  // Валидация дозировки
  dosage: z.string()
    .min(1, 'Дозировка обязательна')
    .max(100, 'Дозировка не может превышать 100 символов')
    .refine(
      (dosage) => /^[\d\s\.,мгmlIUЕД\/]+$/.test(dosage),
      'Некорректный формат дозировки'
    )
};

// Схемы валидации для различных типов медицинских данных
export const MedicalSchemas = {
  // Основная информация о пациенте
  patientProfile: z.object({
    firstName: z.string()
      .min(1, 'Имя обязательно')
      .max(50, 'Имя не может превышать 50 символов')
      .refine(
        (name) => /^[a-zA-Zа-яА-Я\s\-]+$/.test(name),
        'Имя может содержать только буквы, пробелы и дефисы'
      ),
    lastName: z.string()
      .min(1, 'Фамилия обязательна')
      .max(50, 'Фамилия не может превышать 50 символов'),
    dateOfBirth: z.string()
      .refine(
        (date) => {
          const birthDate = new Date(date);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          return age >= 0 && age <= 150;
        },
        'Некорректная дата рождения'
      ),
    gender: z.enum(['female', 'male', 'other'], {
      errorMap: () => ({ message: 'Пол должен быть указан' })
    }),
    phone: z.string()
      .optional()
      .refine(
        (phone) => !phone || /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(phone),
        'Некорректный формат телефона'
      ),
    email: z.string()
      .email('Некорректный email адрес')
      .max(100, 'Email не может превышать 100 символов')
  }),

  // Запись симптомов
  symptomEntry: z.object({
    date: z.string()
      .refine(
        (date) => new Date(date) <= new Date(),
        'Дата не может быть в будущем'
      ),
    symptoms: z.array(z.string().min(1, 'Симптом не может быть пустым')),
    severity: MedicalValidators.painLevel,
    duration: z.string()
      .min(1, 'Продолжительность обязательна')
      .max(100, 'Описание продолжительности слишком длинное'),
    notes: MedicalValidators.medicalNotes.optional(),
    mood: z.number()
      .int('Настроение должно быть целым числом')
      .min(1, 'Минимальная оценка настроения: 1')
      .max(10, 'Максимальная оценка настроения: 10')
      .optional(),
    sleepQuality: z.number()
      .int('Качество сна должно быть целым числом')
      .min(1, 'Минимальная оценка сна: 1')
      .max(10, 'Максимальная оценка сна: 10')
      .optional()
  }),

  // Лекарственные препараты
  medication: z.object({
    name: MedicalValidators.medicationName,
    dosage: MedicalValidators.dosage,
    frequency: z.string()
      .min(1, 'Частота приема обязательна')
      .max(100, 'Описание частоты слишком длинное'),
    startDate: z.string(),
    endDate: z.string().optional(),
    notes: MedicalValidators.medicalNotes.optional(),
    prescribedBy: z.string()
      .max(100, 'Имя врача не может превышать 100 символов')
      .optional()
  }).refine(
    (data) => {
      if (data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    'Дата окончания должна быть после даты начала'
  ),

  // Витальные показатели
  vitalSigns: z.object({
    recordedAt: z.string(),
    bloodPressure: MedicalValidators.bloodPressure.optional(),
    heartRate: MedicalValidators.heartRate.optional(),
    bodyTemperature: MedicalValidators.bodyTemperature.optional(),
    weight: MedicalValidators.weight.optional(),
    height: MedicalValidators.height.optional(),
    notes: MedicalValidators.medicalNotes.optional()
  }),

  // Персонализированные данные менопаузы
  menopauseData: z.object({
    phase: z.enum(['premenopause', 'perimenopause', 'menopause', 'postmenopause'], {
      errorMap: () => ({ message: 'Некорректная фаза менопаузы' })
    }),
    lastMenstrualPeriod: z.string().optional(),
    hotFlashes: z.object({
      frequency: z.number().min(0).max(50),
      severity: MedicalValidators.painLevel,
      triggers: z.array(z.string()).optional()
    }).optional(),
    moodChanges: z.object({
      irritability: MedicalValidators.painLevel.optional(),
      anxiety: MedicalValidators.painLevel.optional(),
      depression: MedicalValidators.painLevel.optional()
    }).optional(),
    sleepDisturbances: z.object({
      difficultyFalling: z.boolean().optional(),
      nightWaking: z.boolean().optional(),
      nightSweats: z.boolean().optional(),
      averageHours: z.number().min(0).max(24).optional()
    }).optional()
  })
};

/**
 * ✅ ФУНКЦИЯ БЕЗОПАСНОЙ ВАЛИДАЦИИ
 */
export class SecureValidator {
  /**
   * Валидация данных с детальным логированием ошибок
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        return { success: true, data: result.data };
      }
      
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      
      // Логируем ошибки валидации (без чувствительных данных)
      console.warn('❌ Ошибка валидации медицинских данных:', {
        errorCount: errors.length,
        errorTypes: result.error.errors.map(e => e.code)
      });
      
      return { success: false, errors };
    } catch (error) {
      console.error('❌ Критическая ошибка валидации:', error);
      return { 
        success: false, 
        errors: ['Критическая ошибка валидации данных'] 
      };
    }
  }

  /**
   * Санитизация текстовых данных
   */
  static sanitizeText(text: string): string {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/[<>]/g, '') // Удаляем HTML теги
      .replace(/javascript:/gi, '') // Удаляем JavaScript
      .replace(/on\w+\s*=/gi, '') // Удаляем события
      .trim()
      .slice(0, 10000); // Ограничиваем длину
  }

  /**
   * Валидация и санитизация медицинских заметок
   */
  static sanitizeMedicalNotes(notes: string): string {
    const sanitized = this.sanitizeText(notes);
    
    // Дополнительная очистка для медицинских заметок
    return sanitized
      .replace(/\b(password|пароль)\b/gi, '[УДАЛЕНО]') // Удаляем пароли
      .replace(/\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, '[НОМЕР КАРТЫ]') // Маскируем номера карт
      .replace(/\b\d{3}[\s\-]?\d{2}[\s\-]?\d{4}\b/g, '[SSN]'); // Маскируем SSN
  }
}