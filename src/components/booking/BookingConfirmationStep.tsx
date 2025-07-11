import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doctor, Clinic } from '@/pages/patient/DoctorBooking';

interface BookingConfirmationStepProps {
  doctor: Doctor | null;
  clinic: Clinic | null;
  slot: string;
  type: 'in_person' | 'online';
  symptoms: string[];
  reason: string;
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingConfirmationStep: React.FC<BookingConfirmationStepProps> = ({
  doctor,
  clinic,
  slot,
  type,
  symptoms,
  reason,
  onConfirm,
  onBack
}) => {
  if (!doctor) return null;

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getSymptomLabels = (symptomIds: string[]) => {
    const symptomMap: Record<string, string> = {
      hot_flashes: 'Приливы',
      night_sweats: 'Ночная потливость',
      irregular_periods: 'Нерегулярные месячные',
      mood_changes: 'Перепады настроения',
      sleep_problems: 'Проблемы со сном',
      anxiety: 'Тревожность',
      depression: 'Депрессия',
      fatigue: 'Усталость',
      joint_pain: 'Боли в суставах',
      headaches: 'Головные боли',
      weight_gain: 'Увеличение веса',
      memory_issues: 'Проблемы с памятью',
      concentration: 'Сложности с концентрацией',
      irritability: 'Раздражительность',
      vaginal_dryness: 'Сухость влагалища',
      urinary_issues: 'Проблемы с мочеиспусканием',
      heart_palpitations: 'Сердцебиение',
      dry_skin: 'Сухость кожи',
      hair_loss: 'Выпадение волос',
      low_libido: 'Снижение либидо',
      brain_fog: 'Туман в голове',
      bone_health: 'Беспокойство о костях',
      digestive_issues: 'Проблемы с пищеварением'
    };
    
    return symptomIds.map(id => symptomMap[id] || id);
  };

  const { date, time } = formatDateTime(slot);
  const price = type === 'online' ? Math.round(doctor.price_range.min * 0.8) : doctor.price_range.min;

  return (
    <div className="space-y-6">
      
      {/* Заголовок */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-2xl font-semibold gentle-text mb-2">
          ✅ Подтверждение записи
        </h2>
        <p className="soft-text">
          Проверьте детали записи перед подтверждением
        </p>
      </div>

      {/* Детали записи */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Информация о враче */}
        <Card className="bloom-card bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">👩‍⚕️</span>
              Врач
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold gentle-text">{doctor.name}</h3>
                <p className="text-primary">{doctor.specialization}</p>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="text-sm">{doctor.rating} ({doctor.review_count} отзывов)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><strong>Опыт:</strong> {doctor.experience_years} лет</p>
              <p><strong>Специализация:</strong> {doctor.sub_specializations.join(', ')}</p>
              <p><strong>Образование:</strong> {doctor.education[0]}</p>
            </div>
          </CardContent>
        </Card>

        {/* Детали записи */}
        <Card className="bloom-card bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📅</span>
              Детали записи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="soft-text">Дата:</span>
                <span className="font-medium gentle-text">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="soft-text">Время:</span>
                <span className="font-medium gentle-text">{time}</span>
              </div>
              <div className="flex justify-between">
                <span className="soft-text">Тип:</span>
                <span className="font-medium gentle-text">
                  {type === 'online' ? '💻 Онлайн' : '🏥 Очно'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="soft-text">Длительность:</span>
                <span className="font-medium gentle-text">45 минут</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="soft-text">Стоимость:</span>
                <span className="text-lg font-semibold text-primary">{price.toLocaleString()} ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Клиника (если очная консультация) */}
      {type === 'in_person' && clinic && (
        <Card className="bloom-card bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🏥</span>
              Клиника
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold gentle-text mb-2">{clinic.name}</h3>
                <div className="space-y-1 text-sm soft-text">
                  <p>📍 {clinic.address.street}</p>
                  <p>🚇 м. {clinic.address.metro_stations.join(', м. ')}</p>
                  <p>📞 {clinic.contact.phone}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="text-sm">{clinic.rating} ({clinic.review_count} отзывов)</span>
                </div>
                <div className="text-sm soft-text">
                  <p><strong>Удобства:</strong></p>
                  <p>{clinic.amenities.join(', ')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Симптомы и причина обращения */}
      <Card className="bloom-card bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🩺</span>
            Ваши симптомы и жалобы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {symptoms.length > 0 && (
            <div>
              <h4 className="font-medium gentle-text mb-2">Выбранные симптомы:</h4>
              <div className="flex flex-wrap gap-2">
                {getSymptomLabels(symptoms).map((symptom, index) => (
                  <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {reason && (
            <div>
              <h4 className="font-medium gentle-text mb-2">Дополнительная информация:</h4>
              <div className="bg-bloom-vanilla p-3 rounded-lg">
                <p className="text-sm soft-text">{reason}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ИИ-подготовка отчета */}
      <div className="bloom-card bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6">
        <div className="flex items-start">
          <span className="text-purple-500 text-2xl mr-3">🤖</span>
          <div>
            <h3 className="font-semibold text-purple-800 mb-2">ИИ подготовит отчет для врача</h3>
            <p className="text-sm text-purple-600 mb-3">
              На основе ваших симптомов и истории здоровья мы автоматически подготовим 
              персональный отчет, который поможет врачу лучше понять ваше состояние и 
              провести более эффективную консультацию.
            </p>
            <div className="text-xs text-purple-500">
              ✓ Анализ симптомов ✓ История здоровья ✓ Рекомендации по обследованию
            </div>
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          ← Изменить время
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          Подтвердить запись
        </Button>
      </div>
    </div>
  );
};