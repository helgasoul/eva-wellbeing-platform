import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getPartnerClinics } from '@/services/doctorRecommendationService';
import { Doctor, Clinic } from '@/pages/patient/DoctorBooking';

interface DoctorSelectionStepProps {
  doctors: Doctor[];
  selectedSymptoms: string[];
  onDoctorSelect: (doctor: Doctor, clinic: Clinic) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export const DoctorSelectionStep: React.FC<DoctorSelectionStepProps> = ({
  doctors,
  selectedSymptoms,
  onDoctorSelect,
  onBack,
  isLoading = false
}) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filters, setFilters] = useState({
    specialization: 'all',
    consultationType: 'all',
    priceRange: 'all',
    rating: 0,
    availability: 'all'
  });

  useEffect(() => {
    loadClinicsData();
  }, []);

  const loadClinicsData = async () => {
    try {
      const clinicsData = await getPartnerClinics();
      setClinics(clinicsData);
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    if (filters.specialization !== 'all' && doctor.specialization !== filters.specialization) {
      return false;
    }
    if (filters.consultationType !== 'all' && !doctor.consultation_types.includes(filters.consultationType as any)) {
      return false;
    }
    if (filters.rating > 0 && doctor.rating < filters.rating) {
      return false;
    }
    if (filters.priceRange !== 'all') {
      const price = doctor.price_range.min;
      if (filters.priceRange === 'budget' && price > 3000) return false;
      if (filters.priceRange === 'medium' && (price < 3000 || price > 5000)) return false;
      if (filters.priceRange === 'premium' && price < 5000) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
        <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
        <h3 className="text-xl font-semibold gentle-text mb-2">
          Подбираем врачей
        </h3>
        <p className="soft-text">
          ИИ анализирует ваши симптомы и ищет подходящих специалистов...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Фильтры */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <h2 className="text-xl font-semibold gentle-text mb-4">🔍 Фильтры поиска</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Специализация</label>
            <Select value={filters.specialization} onValueChange={(value) => setFilters({...filters, specialization: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите специализацию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="gynecologist">Гинеколог</SelectItem>
                <SelectItem value="endocrinologist">Эндокринолог</SelectItem>
                <SelectItem value="psychologist">Психолог</SelectItem>
                <SelectItem value="cardiologist">Кардиолог</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Тип консультации</label>
            <Select value={filters.consultationType} onValueChange={(value) => setFilters({...filters, consultationType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Тип консультации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой</SelectItem>
                <SelectItem value="in_person">Очно</SelectItem>
                <SelectItem value="online">Онлайн</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Рейтинг от</label>
            <Select value={filters.rating.toString()} onValueChange={(value) => setFilters({...filters, rating: Number(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Рейтинг" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Любой</SelectItem>
                <SelectItem value="4">4.0+</SelectItem>
                <SelectItem value="4.5">4.5+</SelectItem>
                <SelectItem value="4.8">4.8+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Ценовой диапазон</label>
            <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Цена" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой</SelectItem>
                <SelectItem value="budget">До 3000 ₽</SelectItem>
                <SelectItem value="medium">3000-5000 ₽</SelectItem>
                <SelectItem value="premium">5000+ ₽</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium gentle-text mb-1">Доступность</label>
            <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Доступность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="week">На этой неделе</SelectItem>
                <SelectItem value="month">В этом месяце</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Список врачей */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold gentle-text">
            👩‍⚕️ Рекомендуемые специалисты ({filteredDoctors.length})
          </h2>
          <Button
            onClick={onBack}
            variant="outline"
          >
            ← Изменить симптомы
          </Button>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold gentle-text mb-2">
              Не найдено врачей по заданным критериям
            </h3>
            <p className="soft-text">
              Попробуйте изменить фильтры поиска или выбрать другие симптомы
            </p>
          </div>
        ) : (
          filteredDoctors.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              clinic={clinics.find(c => c.id === doctor.clinic_id)}
              selectedSymptoms={selectedSymptoms}
              onSelect={() => onDoctorSelect(doctor, clinics.find(c => c.id === doctor.clinic_id)!)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Карточка врача
const DoctorCard = ({ 
  doctor, 
  clinic, 
  selectedSymptoms, 
  onSelect 
}: { 
  doctor: Doctor; 
  clinic?: Clinic; 
  selectedSymptoms: string[];
  onSelect: () => void;
}) => {
  const getSpecializationLabel = (spec: string) => {
    const labels = {
      gynecologist: 'Гинеколог',
      endocrinologist: 'Эндокринолог',
      psychologist: 'Психолог',
      cardiologist: 'Кардиолог',
      therapist: 'Терапевт',
      nutritionist: 'Диетолог'
    };
    return labels[spec as keyof typeof labels] || spec;
  };

  const getMatchPercentage = () => {
    const menopauseSymptoms = ['hot_flashes', 'night_sweats', 'irregular_periods'];
    const psychSymptoms = ['anxiety', 'depression', 'mood_changes'];
    const cardioSymptoms = ['heart_palpitations'];

    let matches = 0;
    const totalSymptoms = selectedSymptoms.length;

    if (doctor.specialization === 'gynecologist' || doctor.specialization === 'endocrinologist') {
      matches = selectedSymptoms.filter(s => menopauseSymptoms.includes(s)).length;
    } else if (doctor.specialization === 'psychologist') {
      matches = selectedSymptoms.filter(s => psychSymptoms.includes(s)).length;
    } else if (doctor.specialization === 'cardiologist') {
      matches = selectedSymptoms.filter(s => cardioSymptoms.includes(s)).length;
    }

    return Math.round((matches / totalSymptoms) * 100);
  };

  const matchPercentage = getMatchPercentage();

  return (
    <div className="bloom-card bg-white/90 backdrop-blur-sm p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
        
        {/* Фото врача */}
        <div className="flex-shrink-0 mb-4 lg:mb-0">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {doctor.photo_url ? (
              <img src={doctor.photo_url} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              doctor.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
        </div>

        {/* Основная информация */}
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold gentle-text mb-1">{doctor.name}</h3>
              <p className="text-primary font-medium mb-2">
                {getSpecializationLabel(doctor.specialization)}
              </p>
              
              {/* Соответствие симптомам */}
              <div className="flex items-center space-x-3 mb-2">
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  matchPercentage >= 70 ? 'bg-green-100 text-green-700' :
                  matchPercentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                )}>
                  {matchPercentage}% соответствие
                </div>
                
                {/* Рейтинг */}
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">⭐</span>
                  <span className="text-sm font-medium">{doctor.rating}</span>
                  <span className="text-sm soft-text ml-1">({doctor.review_count})</span>
                </div>
              </div>

              {/* Опыт и образование */}
              <div className="text-sm soft-text mb-3">
                <p><strong>Опыт:</strong> {doctor.experience_years} лет</p>
                <p><strong>Образование:</strong> {doctor.education[0]}</p>
                {doctor.sub_specializations.length > 0 && (
                  <p><strong>Специализация:</strong> {doctor.sub_specializations.join(', ')}</p>
                )}
              </div>
            </div>

            {/* Цена и доступность */}
            <div className="text-right">
              <div className="text-lg font-semibold gentle-text mb-1">
                от {doctor.price_range.min.toLocaleString()} ₽
              </div>
              <div className="text-sm soft-text mb-2">
                {doctor.consultation_types.includes('online') && '💻 Онлайн'}
                {doctor.consultation_types.includes('in_person') && ' 🏥 Очно'}
              </div>
              {doctor.next_available_slot && (
                <div className="text-sm text-green-600 font-medium">
                  ⏰ Свободно: {new Date(doctor.next_available_slot).toLocaleDateString('ru-RU')}
                </div>
              )}
            </div>
          </div>

          {/* Подход к лечению */}
          <div className="bg-bloom-vanilla rounded-lg p-3 mb-4">
            <p className="text-sm soft-text">{doctor.approach}</p>
          </div>

          {/* Клиника */}
          {clinic && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-lg mr-2">🏥</span>
                <div>
                  <div className="font-medium gentle-text">{clinic.name}</div>
                  <div className="text-sm soft-text">
                    {clinic.address.district}, {clinic.address.metro_stations[0] && `м. ${clinic.address.metro_stations[0]}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">⭐</span>
                <span className="text-sm">{clinic.rating}</span>
              </div>
            </div>
          )}

          {/* Кнопка записи */}
          <Button
            onClick={onSelect}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Записаться на прием
          </Button>
        </div>
      </div>
    </div>
  );
};