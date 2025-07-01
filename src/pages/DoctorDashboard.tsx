
import React from 'react';
import { Users, Calendar, BarChart3, FileText, Stethoscope, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Мои пациентки',
      description: 'Управление списком пациенток',
      status: 'В разработке',
      count: '12'
    },
    {
      icon: Calendar,
      title: 'Расписание консультаций',
      description: 'Управление расписанием и записями',
      status: 'В разработке',
      count: '8'
    },
    {
      icon: BarChart3,
      title: 'Аналитика и отчеты',
      description: 'Статистика по пациенткам и лечению',
      status: 'В разработке',
      count: '5'
    },
    {
      icon: FileText,
      title: 'Медицинские записи',
      description: 'История болезни и документооборот',
      status: 'В разработке',
      count: '24'
    },
    {
      icon: Stethoscope,
      title: 'Инструменты диагностики',
      description: 'Калькуляторы и диагностические тесты',
      status: 'В разработке',
      count: '6'
    },
    {
      icon: Clock,
      title: 'Быстрая консультация',
      description: 'Экстренные консультации пациенток',
      status: 'В разработке',
      count: '2'
    }
  ];

  const todayStats = [
    { label: 'Консультаций сегодня', value: '6', color: 'text-eva-dusty-rose' },
    { label: 'Новых пациенток', value: '2', color: 'text-eva-mauve' },
    { label: 'Неотложных случаев', value: '1', color: 'text-destructive' },
    { label: 'Завершенных записей', value: '4', color: 'text-primary' }
  ];

  return (
    <div className="min-h-screen eva-gradient py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex p-6 bg-gradient-to-br from-eva-mauve to-eva-dusty-rose rounded-full mb-6">
            <Stethoscope className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Добро пожаловать, Dr. {user?.lastName}!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ваша профессиональная платформа для работы с пациентками в период менопаузы. 
            Управляйте консультациями, анализируйте данные и предоставляйте качественную медицинскую помощь.
          </p>
        </div>

        {/* Статистика дня */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {todayStats.map((stat, index) => (
            <div key={index} className="eva-card p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="eva-card p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex p-3 bg-gradient-to-br from-eva-mauve to-eva-dusty-rose rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                    {feature.count}
                  </span>
                </div>
                <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <span className="inline-block px-3 py-1 bg-eva-warm-beige text-eva-taupe text-xs rounded-full">
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="eva-card p-6">
            <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
              Ближайшие консультации
            </h3>
            <div className="space-y-3">
              {[
                { time: '14:00', patient: 'Анна И.', type: 'Первичная консультация' },
                { time: '15:30', patient: 'Елена С.', type: 'Контрольный осмотр' },
                { time: '16:00', patient: 'Мария П.', type: 'Результаты анализов' }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-eva-pearl rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">{appointment.patient}</div>
                    <div className="text-sm text-muted-foreground">{appointment.type}</div>
                  </div>
                  <div className="text-primary font-semibold">{appointment.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="eva-card p-6">
            <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
              Быстрые действия
            </h3>
            <div className="space-y-3">
              <button className="w-full eva-button text-left flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>Добавить новую пациентку</span>
              </button>
              <button className="w-full eva-button bg-eva-soft-pink hover:bg-eva-blush text-left flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <span>Создать запись на консультацию</span>
              </button>
              <button className="w-full eva-button bg-eva-warm-beige hover:bg-eva-pearl text-eva-taupe text-left flex items-center space-x-3">
                <FileText className="h-5 w-5" />
                <span>Создать медицинскую запись</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
