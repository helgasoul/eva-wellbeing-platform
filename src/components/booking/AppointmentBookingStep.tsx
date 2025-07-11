import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doctor, Clinic } from '@/pages/patient/DoctorBooking';

interface AppointmentBookingStepProps {
  doctor: Doctor;
  clinic?: Clinic;
  consultationType: 'in_person' | 'online';
  onConsultationTypeChange: (type: 'in_person' | 'online') => void;
  selectedSlot: string;
  onSlotSelect: (slot: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AppointmentBookingStep: React.FC<AppointmentBookingStepProps> = ({
  doctor,
  clinic,
  consultationType,
  onConsultationTypeChange,
  selectedSlot,
  onSlotSelect,
  onNext,
  onBack
}) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    generateAvailableSlots();
  }, [doctor, selectedDate]);

  const generateAvailableSlots = () => {
    // Генерация доступных слотов на ближайшие 7 дней
    const slots: string[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Проверяем, есть ли этот день в доступности врача
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (doctor.availability.days.includes(dayName)) {
        doctor.availability.time_slots.forEach(time => {
          const slotDateTime = new Date(date);
          const [hours, minutes] = time.split(':');
          slotDateTime.setHours(parseInt(hours), parseInt(minutes));
          slots.push(slotDateTime.toISOString());
        });
      }
    }
    
    setAvailableSlots(slots);
    if (!selectedDate) {
      setSelectedDate(slots[0]?.split('T')[0] || '');
    }
  };

  const getAvailableDates = () => {
    const dates = new Set(availableSlots.map(slot => slot.split('T')[0]));
    return Array.from(dates).sort();
  };

  const getSlotsForDate = (date: string) => {
    return availableSlots.filter(slot => slot.startsWith(date));
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Информация о враче и клинике */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold">
            {doctor.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-semibold gentle-text">{doctor.name}</h2>
            <p className="text-primary font-medium">{doctor.specialization}</p>
            {clinic && (
              <p className="text-sm soft-text">🏥 {clinic.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Выбор типа консультации */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold gentle-text mb-4">Тип консультации</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctor.consultation_types.includes('in_person') && (
            <button
              onClick={() => onConsultationTypeChange('in_person')}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all duration-200",
                consultationType === 'in_person'
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">🏥</span>
                <span className="font-medium gentle-text">Очная консультация</span>
              </div>
              <p className="text-sm soft-text">
                Личный прием в клинике. Полный осмотр и диагностика.
              </p>
              <p className="text-sm font-medium text-primary mt-2">
                от {doctor.price_range.min.toLocaleString()} ₽
              </p>
            </button>
          )}

          {doctor.consultation_types.includes('online') && (
            <button
              onClick={() => onConsultationTypeChange('online')}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all duration-200",
                consultationType === 'online'
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">💻</span>
                <span className="font-medium gentle-text">Онлайн консультация</span>
              </div>
              <p className="text-sm soft-text">
                Видеосвязь из дома. Консультация и рекомендации.
              </p>
              <p className="text-sm font-medium text-primary mt-2">
                от {Math.round(doctor.price_range.min * 0.8).toLocaleString()} ₽
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Выбор даты и времени */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold gentle-text mb-4">Дата и время</h3>
        
        {/* Выбор даты */}
        <div className="mb-6">
          <h4 className="font-medium gentle-text mb-3">Выберите дату:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {getAvailableDates().map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "p-3 border-2 rounded-lg text-center transition-all duration-200",
                  selectedDate === date
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="text-sm font-medium gentle-text">
                  {formatDate(date)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Выбор времени */}
        {selectedDate && (
          <div>
            <h4 className="font-medium gentle-text mb-3">Выберите время:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getSlotsForDate(selectedDate).map(slot => (
                <button
                  key={slot}
                  onClick={() => onSlotSelect(slot)}
                  className={cn(
                    "p-3 border-2 rounded-lg text-center transition-all duration-200",
                    selectedSlot === slot
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="text-sm font-medium gentle-text">
                    {formatTime(slot)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Дополнительная информация */}
      {consultationType === 'online' && (
        <div className="bloom-card bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start">
            <span className="text-blue-500 text-xl mr-3">💻</span>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Онлайн консультация</h4>
              <p className="text-sm text-blue-600">
                Ссылка на видеозвонок будет отправлена на вашу почту за 15 минут до начала консультации.
                Убедитесь, что у вас есть стабильное интернет-соединение и работающая камера.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          ← Выбрать другого врача
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedSlot}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Подтвердить запись →
        </Button>
      </div>
    </div>
  );
};