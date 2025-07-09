import React, { useState } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LabRecommendationWidget } from '@/components/lab/LabRecommendationWidget';
import { LabTestCard } from '@/components/lab/LabTestCard';
import { CartSummary } from '@/components/lab/CartSummary';
import { PersonalizedRecommendationsContent } from '@/components/lab/PersonalizedRecommendationsContent';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, FileText, ShoppingCart, Stethoscope } from 'lucide-react';

interface LabTest {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  preparationTime: string;
  resultTime: string;
  fasting: boolean;
  urgent: boolean;
}

interface LabProvider {
  id: string;
  name: string;
  rating: number;
  address: string;
  distance: string;
  priceRange: string;
  workingHours: string;
  services: string[];
}

const mockLabTests: LabTest[] = [
  {
    id: '1',
    name: 'Общий анализ крови',
    price: 450,
    description: 'Базовый анализ крови для оценки общего состояния здоровья',
    category: 'Общие',
    preparationTime: 'Не требуется',
    resultTime: '1 день',
    fasting: false,
    urgent: false
  },
  {
    id: '2',
    name: 'Биохимический анализ крови',
    price: 850,
    description: 'Расширенный анализ для оценки функций органов',
    category: 'Биохимия',
    preparationTime: 'Натощак 8-12 часов',
    resultTime: '1-2 дня',
    fasting: true,
    urgent: false
  },
  {
    id: '3',
    name: 'Гормональный профиль',
    price: 1200,
    description: 'Анализ основных гормонов для женского здоровья',
    category: 'Гормоны',
    preparationTime: 'Утром натощак',
    resultTime: '2-3 дня',
    fasting: true,
    urgent: true
  }
];

const mockLabProviders: LabProvider[] = [
  {
    id: '1',
    name: 'Медицинский центр "Здоровье"',
    rating: 4.8,
    address: 'ул. Ленина, 123',
    distance: '1.2 км',
    priceRange: '400-2000₽',
    workingHours: '8:00-20:00',
    services: ['Анализы крови', 'УЗИ', 'ЭКГ']
  },
  {
    id: '2',
    name: 'Лаборатория "Диагност"',
    rating: 4.6,
    address: 'пр. Мира, 45',
    distance: '2.1 км',
    priceRange: '350-1800₽',
    workingHours: '7:30-19:00',
    services: ['Лабораторные анализы', 'Биохимия', 'Гормоны']
  }
];

export default function LabTests() {
  const { toast } = useToast();
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');

  const handleTestToggle = (testId: string) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleBooking = () => {
    if (selectedTests.length === 0) {
      toast({
        title: "Выберите анализы",
        description: "Добавьте хотя бы один анализ в корзину",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProvider) {
      toast({
        title: "Выберите лабораторию",
        description: "Выберите медицинский центр для сдачи анализов",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Запись успешно создана!",
      description: "Вы будете перенаправлены на страницу оплаты",
    });
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Лабораторные анализы', href: '/patient/lab-tests' }
  ];

  const totalPrice = selectedTests.reduce((sum, testId) => {
    const test = mockLabTests.find(t => t.id === testId);
    return sum + (test?.price || 0);
  }, 0);

  return (
    <PatientLayout title="Лабораторные анализы | Eva" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            <FileText className="mr-3 text-eva-dusty-rose" size={32} />
            Лабораторные анализы
          </h1>
          <p className="soft-text">
            Заказывайте анализы онлайн с доставкой результатов в личный кабинет
          </p>
        </div>

        {/* Recommendations Widget */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h2 className="text-xl font-semibold gentle-text mb-4">Рекомендованные анализы</h2>
          <p className="soft-text">На основе ваших данных мы рекомендуем следующие анализы</p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tests">Анализы</TabsTrigger>
            <TabsTrigger value="providers">Лаборатории</TabsTrigger>
            <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          </TabsList>

          <TabsContent value="tests" className="space-y-4">
            <div className="grid gap-4">
              {mockLabTests.map((test) => (
                <Card key={test.id} className="bloom-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg gentle-text">{test.name}</CardTitle>
                        <CardDescription>{test.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold gentle-text">{test.price}₽</div>
                        <Button 
                          size="sm" 
                          variant={selectedTests.includes(test.id) ? "default" : "outline"}
                          onClick={() => handleTestToggle(test.id)}
                        >
                          {selectedTests.includes(test.id) ? "Убрать" : "Добавить"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-4">
            <div className="grid gap-4">
              {mockLabProviders.map((provider) => (
                <Card 
                  key={provider.id}
                  className={`bloom-card cursor-pointer transition-all ${
                    selectedProvider === provider.id ? 'ring-2 ring-eva-dusty-rose' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg gentle-text">
                          {provider.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm soft-text ml-1">{provider.rating}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {provider.distance}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold gentle-text">
                          {provider.priceRange}
                        </div>
                        <div className="text-sm soft-text">
                          {provider.workingHours}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} className="text-eva-dusty-rose" />
                      <span className="text-sm soft-text">{provider.address}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {provider.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="bloom-card">
              <CardHeader>
                <CardTitle className="text-lg gentle-text">Персональные рекомендации</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="soft-text">На основе ваших данных о здоровье мы рекомендуем регулярно проверять следующие показатели.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cart Summary */}
        {selectedTests.length > 0 && (
          <Card className="bloom-card">
            <CardHeader>
              <CardTitle className="text-lg gentle-text">Корзина анализов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedTests.map(testId => {
                  const test = mockLabTests.find(t => t.id === testId);
                  return test ? (
                    <div key={testId} className="flex justify-between items-center">
                      <span>{test.name}</span>
                      <span className="font-semibold">{test.price}₽</span>
                    </div>
                  ) : null;
                })}
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>Итого:</span>
                  <span>{totalPrice}₽</span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleBooking}>
                Оформить заказ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  );
}