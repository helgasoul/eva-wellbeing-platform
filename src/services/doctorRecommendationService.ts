import { Doctor, Clinic } from '@/pages/patient/DoctorBooking';

export const getAIRecommendedDoctors = async (
  symptoms: string[],
  patientProfile: any
): Promise<Doctor[]> => {
  // Имитация ИИ-анализа для подбора врачей
  return new Promise(resolve => {
    setTimeout(() => {
      const mockDoctors = generateMockDoctors(symptoms);
      resolve(mockDoctors);
    }, 1500);
  });
};

const generateMockDoctors = (symptoms: string[]): Doctor[] => {
  const hasHormonalSymptoms = symptoms.some(s => 
    ['hot_flashes', 'night_sweats', 'irregular_periods'].includes(s)
  );
  const hasPsychSymptoms = symptoms.some(s => 
    ['anxiety', 'depression', 'mood_changes'].includes(s)
  );
  const hasCardioSymptoms = symptoms.some(s => 
    ['heart_palpitations'].includes(s)
  );

  const doctors: Doctor[] = [];

  // Всегда включаем гинеколога-эндокринолога
  doctors.push({
    id: 'doc_1',
    name: 'Елена Владимировна Смирнова',
    specialization: 'endocrinologist',
    sub_specializations: ['menopause', 'hormone_therapy', 'reproductive_health'],
    clinic_id: 'clinic_1',
    experience_years: 15,
    rating: 4.9,
    review_count: 127,
    education: ['РНИМУ им. Н.И. Пирогова', 'Ординатура по эндокринологии'],
    certificates: ['Сертификат специалиста по эндокринологии', 'Курсы по менопаузе'],
    languages: ['Русский', 'Английский'],
    consultation_types: ['in_person', 'online'],
    price_range: { min: 4500, max: 6000, currency: 'RUB' },
    availability: {
      days: ['monday', 'tuesday', 'wednesday', 'friday'],
      time_slots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
      timezone: 'Europe/Moscow'
    },
    bio: 'Специалист по женской эндокринологии с 15-летним опытом. Автор 30+ научных работ по менопаузе.',
    approach: 'Индивидуальный подход к каждой пациентке. Сочетание гормональной терапии с немедикаментозными методами.',
    patient_focus: ['menopause', 'perimenopause', 'postmenopause'],
    next_available_slot: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  });

  if (hasHormonalSymptoms) {
    doctors.push({
      id: 'doc_2',
      name: 'Анна Сергеевна Волкова',
      specialization: 'gynecologist',
      sub_specializations: ['menopause', 'hormone_therapy'],
      clinic_id: 'clinic_2',
      experience_years: 12,
      rating: 4.8,
      review_count: 89,
      education: ['МГМУ им. И.М. Сеченова'],
      certificates: ['Гинекология', 'Менопауза и ЗГТ'],
      languages: ['Русский'],
      consultation_types: ['in_person', 'online'],
      price_range: { min: 3500, max: 5000, currency: 'RUB' },
      availability: {
        days: ['monday', 'wednesday', 'thursday', 'saturday'],
        time_slots: ['10:00', '11:00', '15:00', '16:00'],
        timezone: 'Europe/Moscow'
      },
      bio: 'Гинеколог с опытом ведения пациенток в период менопаузы.',
      approach: 'Комплексный подход к лечению симптомов менопаузы. Предпочтение безопасным методам терапии.',
      patient_focus: ['perimenopause', 'menopause'],
      next_available_slot: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (hasPsychSymptoms) {
    doctors.push({
      id: 'doc_3',
      name: 'Мария Александровна Петрова',
      specialization: 'psychologist',
      sub_specializations: ['menopause_psychology', 'cognitive_therapy'],
      clinic_id: 'clinic_1',
      experience_years: 8,
      rating: 4.7,
      review_count: 64,
      education: ['МГУ им. М.В. Ломоносова, факультет психологии'],
      certificates: ['Клиническая психология', 'КПТ'],
      languages: ['Русский', 'Английский'],
      consultation_types: ['in_person', 'online'],
      price_range: { min: 3000, max: 4500, currency: 'RUB' },
      availability: {
        days: ['tuesday', 'thursday', 'friday', 'saturday'],
        time_slots: ['11:00', '14:00', '15:00', '17:00', '18:00'],
        timezone: 'Europe/Moscow'
      },
      bio: 'Психолог, специализирующийся на работе с женщинами в период гормональных изменений.',
      approach: 'Когнитивно-поведенческая терапия, работа с тревогой и депрессией в период менопаузы.',
      patient_focus: ['menopause', 'perimenopause'],
      next_available_slot: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (hasCardioSymptoms) {
    doctors.push({
      id: 'doc_4',
      name: 'Владимир Николаевич Кузнецов',
      specialization: 'cardiologist',
      sub_specializations: ['menopause_cardiology', 'preventive_cardiology'],
      clinic_id: 'clinic_3',
      experience_years: 20,
      rating: 4.6,
      review_count: 156,
      education: ['МГМУ им. И.М. Сеченова', 'Аспирантура по кардиологии'],
      certificates: ['Кардиология', 'Функциональная диагностика'],
      languages: ['Русский'],
      consultation_types: ['in_person'],
      price_range: { min: 4000, max: 5500, currency: 'RUB' },
      availability: {
        days: ['monday', 'tuesday', 'thursday', 'friday'],
        time_slots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        timezone: 'Europe/Moscow'
      },
      bio: 'Кардиолог с опытом ведения женщин в период менопаузы. Специализируется на кардиоваскулярных рисках.',
      approach: 'Профилактический подход к сердечно-сосудистым заболеваниям у женщин в менопаузе.',
      patient_focus: ['postmenopause', 'cardiovascular_health'],
      next_available_slot: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  // Добавляем еще врачей для разнообразия
  doctors.push({
    id: 'doc_5',
    name: 'Ольга Михайловна Зайцева',
    specialization: 'therapist',
    sub_specializations: ['women_health', 'preventive_medicine'],
    clinic_id: 'clinic_2',
    experience_years: 18,
    rating: 4.5,
    review_count: 98,
    education: ['РГМУ им. Н.И. Пирогова'],
    certificates: ['Терапия', 'Профилактическая медицина'],
    languages: ['Русский', 'Немецкий'],
    consultation_types: ['in_person', 'online'],
    price_range: { min: 2800, max: 4000, currency: 'RUB' },
    availability: {
      days: ['monday', 'wednesday', 'friday', 'saturday'],
      time_slots: ['08:00', '09:00', '16:00', '17:00', '18:00'],
      timezone: 'Europe/Moscow'
    },
    bio: 'Терапевт с большим опытом ведения женщин всех возрастов.',
    approach: 'Комплексный подход к здоровью женщины. Акцент на профилактику и здоровый образ жизни.',
    patient_focus: ['menopause', 'general_health'],
    next_available_slot: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
  });

  return doctors;
};

export const getPartnerClinics = async (): Promise<Clinic[]> => {
  return [
    {
      id: 'clinic_1',
      name: 'Клиника "Чайка"',
      network: 'Чайка',
      type: 'private',
      address: {
        city: 'Москва',
        district: 'ЦАО',
        street: 'ул. Новый Арбат, 36/9',
        metro_stations: ['Смоленская', 'Арбатская']
      },
      contact: {
        phone: '+7 (495) 432-18-16',
        email: 'info@chaika.com',
        website: 'https://chaika.com'
      },
      amenities: ['parking', 'pharmacy', 'lab', 'wifi', 'cafe'],
      rating: 4.8,
      review_count: 342,
      insurance_accepted: ['ДМС', 'Росгосстрах', 'СОГАЗ'],
      specializations: ['gynecology', 'endocrinology', 'cardiology', 'psychology']
    },
    {
      id: 'clinic_2',
      name: 'Медицинский центр "Атлас"',
      type: 'private',
      address: {
        city: 'Москва',
        district: 'СВАО',
        street: 'Каширское шоссе, 56',
        metro_stations: ['Каширская']
      },
      contact: {
        phone: '+7 (495) 988-71-88',
        email: 'info@atlas-clinic.ru'
      },
      amenities: ['parking', 'lab', 'wifi'],
      rating: 4.6,
      review_count: 128,
      insurance_accepted: ['ДМС'],
      specializations: ['gynecology', 'endocrinology', 'therapy']
    },
    {
      id: 'clinic_3',
      name: 'Центр кардиологии "Сердце"',
      type: 'private',
      address: {
        city: 'Москва',
        district: 'САО',
        street: 'ул. Тверская, 15',
        metro_stations: ['Тверская', 'Пушкинская']
      },
      contact: {
        phone: '+7 (495) 123-45-67',
        email: 'info@heart-center.ru'
      },
      amenities: ['parking', 'pharmacy', 'lab', 'wifi', 'rehabilitation'],
      rating: 4.7,
      review_count: 203,
      insurance_accepted: ['ДМС', 'Росгосстрах'],
      specializations: ['cardiology', 'therapy', 'diagnostics']
    }
  ];
};