
import React from 'react';
import { Users, BarChart3, Settings, Shield, Database, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Управление пользователями',
      description: 'Пациентки, врачи и администраторы',
      status: 'В разработке',
      count: '1,247'
    },
    {
      icon: BarChart3,
      title: 'Аналитика платформы',
      description: 'Статистика использования и метрики',
      status: 'В разработке',
      count: '12'
    },
    {
      icon: Settings,
      title: 'Настройки системы',
      description: 'Конфигурация платформы и параметры',
      status: 'В разработке',
      count: '8'
    },
    {
      icon: Shield,
      title: 'Безопасность',
      description: 'Права доступа и аудит системы',
      status: 'В разработке',
      count: '3'
    },
    {
      icon: Database,
      title: 'Управление данными',
      description: 'Резервное копирование и миграции',
      status: 'В разработке',
      count: '15'
    },
    {
      icon: AlertTriangle,
      title: 'Мониторинг системы',
      description: 'Отслеживание ошибок и производительности',
      status: 'В разработке',
      count: '2'
    }
  ];

  const systemStats = [
    { label: 'Всего пользователей', value: '1,247', trend: '+12%', color: 'text-primary' },
    { label: 'Активных врачей', value: '89', trend: '+5%', color: 'text-eva-dusty-rose' },
    { label: 'Консультаций сегодня', value: '156', trend: '+8%', color: 'text-eva-mauve' },
    { label: 'Системная нагрузка', value: '23%', trend: '-2%', color: 'text-eva-taupe' }
  ];

  const recentActivity = [
    { action: 'Новый врач зарегистрирован', user: 'Dr. Петрова А.', time: '10 мин назад' },
    { action: 'Пациентка записалась на консультацию', user: 'Анна И.', time: '25 мин назад' },
    { action: 'Обновлены настройки безопасности', user: 'Admin', time: '1 час назад' },
    { action: 'Завершено резервное копирование', user: 'System', time: '2 часа назад' }
  ];

  return (
    <div className="min-h-screen eva-gradient py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex p-6 bg-gradient-to-br from-eva-taupe to-eva-mauve rounded-full mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-playfair font-bold text-foreground mb-4">
            Панель администратора
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Добро пожаловать, {user?.firstName}! Управляйте платформой Eva, 
            контролируйте пользователей и обеспечивайте безопасность системы.
          </p>
        </div>

        {/* Системная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="eva-card p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-eva-dusty-rose">
                {stat.trend}
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
                  <div className="inline-flex p-3 bg-gradient-to-br from-eva-taupe to-eva-mauve rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-eva-taupe/20 text-eva-taupe text-xs px-2 py-1 rounded-full">
                    {feature.count}
                  </span>
                </div>
                <h3 className="text-lg font-playfair font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {feature.description}
                </p>
                <span className="inline-block px-3 py-1 bg-eva-pearl text-eva-taupe text-xs rounded-full">
                  {feature.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="eva-card p-6">
            <h3 className="text-xl font-playfair font-semibold text-foreground mb-4">
              Последняя активность
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-eva-pearl rounded-lg">
                  <div>
                    <div className="font-medium text-foreground text-sm">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.user}</div>
                  </div>
                  <div className="text-xs text-eva-taupe">{activity.time}</div>
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
                <span>Управление пользователями</span>
              </button>
              <button className="w-full eva-button bg-eva-taupe hover:bg-eva-mauve text-white text-left flex items-center space-x-3">
                <Settings className="h-5 w-5" />
                <span>Настройки системы</span>
              </button>
              <button className="w-full eva-button bg-eva-warm-beige hover:bg-eva-pearl text-eva-taupe text-left flex items-center space-x-3">
                <BarChart3 className="h-5 w-5" />
                <span>Просмотреть аналитику</span>
              </button>
              <button className="w-full eva-button bg-destructive/10 hover:bg-destructive/20 text-destructive text-left flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5" />
                <span>Проверить системные ошибки</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
