
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Activity, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings,
  Calculator,
  BarChart3,
  BookOpen,
  Stethoscope,
  Brain,
  GraduationCap,
  Moon,
  Database,
  TestTube,
  Clock,
  Target,
  Utensils,
  ChefHat,
  Search
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

const DemoSiteMap = () => {
  const patientFeatures = [
    { name: 'Главная панель', href: '/patient/dashboard', icon: Heart, description: 'Обзор состояния здоровья и активности' },
    { name: 'Трекер симптомов', href: '/patient/symptoms', icon: Activity, description: 'Отслеживание симптомов менопаузы' },
    { name: 'Дневник питания', href: '/patient/nutrition', icon: Utensils, description: 'Учет потребления пищи и калорий' },
    { name: 'ИИ-помощник', href: '/patient/ai-chat', icon: MessageSquare, description: 'Персональный чат-бот для здоровья' },
    { name: 'Академия без|паузы', href: '/patient/academy', icon: GraduationCap, description: 'Образовательные материалы' },
    { name: 'Анализ питания', href: '/patient/nutrition-analysis', icon: BarChart3, description: 'Подробная аналитика питания' },
    { name: 'Рецепты', href: '/patient/recipes', icon: ChefHat, description: 'Персонализированные рецепты' },
    { name: 'План питания', href: '/patient/nutrition-plan', icon: Target, description: 'Индивидуальный план питания' },
    { name: 'Трекер цикла', href: '/patient/cycle', icon: Calendar, description: 'Отслеживание менструального цикла' },
    { name: 'Запись к врачу', href: '/patient/doctor-booking', icon: Stethoscope, description: 'Поиск и запись к специалистам' },
    { name: 'Лабораторные тесты', href: '/patient/lab-tests', icon: TestTube, description: 'Результаты анализов' },
    { name: 'Инсайты', href: '/patient/insights', icon: Brain, description: 'Персонализированные рекомендации' },
    { name: 'Сообщество', href: '/patient/community', icon: Users, description: 'Общение с единомышленниками' },
    { name: 'Документы', href: '/patient/documents', icon: FileText, description: 'Медицинские документы' },
    { name: 'Сон', href: '/patient/sleep-dashboard', icon: Moon, description: 'Анализ качества сна' },
    { name: 'Интеграции', href: '/patient/health-data-integrations', icon: Database, description: 'Подключение фитнес-трекеров' },
    { name: 'Календарь', href: '/patient/calendar', icon: Clock, description: 'Планирование и напоминания' },
    { name: 'Настройки', href: '/patient/settings', icon: Settings, description: 'Персональные настройки' }
  ];

  const publicPages = [
    { name: 'О платформе', href: '/about', description: 'История и миссия без|паузы' },
    { name: 'Как мы помогаем', href: '/how-we-help', description: 'Наши подходы и методы' },
    { name: 'Связаться с нами', href: '/contact', description: 'Контактная информация' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Демо-версия платформы без|паузы
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Добро пожаловать в полнофункциональную демо-версию нашей платформы. 
            Исследуйте все возможности без регистрации и входа в систему.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            🎯 M4P Demo • Все функции доступны
          </Badge>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Быстрый доступ
              </CardTitle>
              <CardDescription>
                Начните знакомство с ключевых функций платформы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/patient/dashboard">
                  <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                    <Heart className="h-6 w-6" />
                    <span>Главная панель</span>
                  </Button>
                </Link>
                <Link to="/patient/symptoms">
                  <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    <span>Трекер симптомов</span>
                  </Button>
                </Link>
                <Link to="/patient/ai-chat">
                  <Button variant="outline" className="w-full h-auto p-4 flex-col gap-2">
                    <MessageSquare className="h-6 w-6" />
                    <span>ИИ-помощник</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-playfair font-semibold mb-6 text-center">
            Функции для пациентов
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} to={feature.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-muted hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{feature.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Public Pages */}
        <div className="mb-12">
          <h2 className="text-2xl font-playfair font-semibold mb-6 text-center">
            Информационные страницы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicPages.map((page) => (
              <Link key={page.href} to={page.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{page.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Demo Info */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">О демо-версии</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                • Все данные сохраняются локально в браузере
              </p>
              <p>
                • Тестовый пользователь: Анна Тестова (test@eva-platform.ru)
              </p>
              <p>
                • Полный доступ ко всем функциям без регистрации
              </p>
              <p>
                • Данные сбрасываются при очистке браузера
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoSiteMap;
