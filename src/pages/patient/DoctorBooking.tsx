import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { SymptomsSelectionStep } from '@/components/booking/SymptomsSelectionStep';
import { DoctorSelectionStep } from '@/components/booking/DoctorSelectionStep';
import { AppointmentBookingStep } from '@/components/booking/AppointmentBookingStep';
import { BookingConfirmationStep } from '@/components/booking/BookingConfirmationStep';
import { BookingProgressBar } from '@/components/booking/BookingProgressBar';
import { getAIRecommendedDoctors } from '@/services/doctorRecommendationService';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: 'gynecologist' | 'endocrinologist' | 'cardiologist' | 'therapist' | 'psychologist' | 'nutritionist';
  sub_specializations: string[];
  clinic_id: string;
  experience_years: number;
  rating: number;
  review_count: number;
  education: string[];
  certificates: string[];
  languages: string[];
  consultation_types: ('in_person' | 'online' | 'hybrid')[];
  price_range: {
    min: number;
    max: number;
    currency: 'RUB';
  };
  availability: {
    days: string[];
    time_slots: string[];
    timezone: string;
  };
  bio: string;
  approach: string;
  patient_focus: string[];
  photo_url?: string;
  next_available_slot?: string;
}

interface Clinic {
  id: string;
  name: string;
  network?: string;
  type: 'private' | 'public' | 'network';
  address: {
    city: string;
    district: string;
    street: string;
    metro_stations: string[];
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  amenities: string[];
  rating: number;
  review_count: number;
  insurance_accepted: string[];
  specializations: string[];
  photo_url?: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  datetime: string;
  duration_minutes: number;
  type: 'in_person' | 'online';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason: string;
  symptoms_reported: string[];
  ai_summary?: string;
  price: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  notes?: string;
  created_at: string;
}

export type { Doctor, Clinic, Appointment };

export default function DoctorBooking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'symptoms' | 'doctors' | 'appointment' | 'confirmation'>('symptoms');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [consultationReason, setConsultationReason] = useState('');
  const [recommendedDoctors, setRecommendedDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'in_person' | 'online'>('in_person');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedSymptoms.length > 0) {
      findRecommendedDoctors();
    }
  }, [selectedSymptoms]);

  const findRecommendedDoctors = async () => {
    setIsLoading(true);
    try {
      const recommendations = await getAIRecommendedDoctors(selectedSymptoms, user?.onboardingData);
      setRecommendedDoctors(recommendations);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить рекомендации врачей",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingConfirmation = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    try {
      // Здесь будет логика подтверждения записи
      toast({
        title: "Запись подтверждена!",
        description: `Вы записаны к ${selectedDoctor.name} на ${new Date(selectedSlot).toLocaleString('ru-RU')}`,
      });
      
      // Перенаправление на страницу записей
      setTimeout(() => {
        window.location.href = '/patient/appointments';
      }, 2000);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось подтвердить запись",
        variant: "destructive",
      });
    }
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Запись к врачу', href: '/patient/doctors' }
  ];

  return (
    <PatientLayout title="Запись к врачу | Eva" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Заголовок */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            👩‍⚕️ Запись к врачу
          </h1>
          <p className="soft-text">
            Найдем подходящего специалиста на основе ваших симптомов и подготовим персональный отчет
          </p>
        </div>

        {/* Прогресс */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
          <BookingProgressBar currentStep={step} />
        </div>

        {/* Контент по шагам */}
        {step === 'symptoms' && (
          <SymptomsSelectionStep
            selectedSymptoms={selectedSymptoms}
            onSymptomsChange={setSelectedSymptoms}
            consultationReason={consultationReason}
            onReasonChange={setConsultationReason}
            onNext={() => setStep('doctors')}
            isLoading={isLoading}
          />
        )}

        {step === 'doctors' && (
          <DoctorSelectionStep
            doctors={recommendedDoctors}
            selectedSymptoms={selectedSymptoms}
            onDoctorSelect={(doctor, clinic) => {
              setSelectedDoctor(doctor);
              setSelectedClinic(clinic);
              setStep('appointment');
            }}
            onBack={() => setStep('symptoms')}
            isLoading={isLoading}
          />
        )}

        {step === 'appointment' && selectedDoctor && (
          <AppointmentBookingStep
            doctor={selectedDoctor}
            clinic={selectedClinic}
            consultationType={consultationType}
            onConsultationTypeChange={setConsultationType}
            selectedSlot={selectedSlot}
            onSlotSelect={setSelectedSlot}
            onNext={() => setStep('confirmation')}
            onBack={() => setStep('doctors')}
          />
        )}

        {step === 'confirmation' && (
          <BookingConfirmationStep
            doctor={selectedDoctor}
            clinic={selectedClinic}
            slot={selectedSlot}
            type={consultationType}
            symptoms={selectedSymptoms}
            reason={consultationReason}
            onConfirm={handleBookingConfirmation}
            onBack={() => setStep('appointment')}
          />
        )}
      </div>
    </PatientLayout>
  );
}