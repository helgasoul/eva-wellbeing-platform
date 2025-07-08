import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { PersonalizedRecommendationsContent } from '@/components/lab/PersonalizedRecommendationsContent';
import { LabTestCard } from '@/components/lab/LabTestCard';
import { CartSummary } from '@/components/lab/CartSummary';
import { getPersonalizedLabRecommendations, getAllLabTests, type LabTest } from '@/services/labRecommendationService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LabOrder {
  id: string;
  patient_id: string;
  tests: LabTest[];
  total_price: number;
  lab_provider: string;
  order_date: string;
  preferred_collection_date?: string;
  collection_method: 'home_visit' | 'lab_visit' | 'pickup_point';
  collection_address?: string;
  status: 'pending' | 'confirmed' | 'collected' | 'processing' | 'ready' | 'delivered';
  tracking_number?: string;
  results?: LabResult[];
  ai_interpretation?: string;
  doctor_recommendations?: string[];
  created_at: string;
}

interface LabResult {
  test_id: string;
  biomarker: string;
  value: number;
  unit: string;
  reference_range: { min: number; max: number };
  status: 'normal' | 'below_normal' | 'above_normal' | 'critical';
  interpretation: string;
  trend?: 'improving' | 'stable' | 'worsening';
  previous_values?: { date: string; value: number }[];
}

export default function LabTests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'recommendations' | 'catalog' | 'orders' | 'results'>('recommendations');
  const [recommendedTests, setRecommendedTests] = useState<LabTest[]>([]);
  const [allTests, setAllTests] = useState<LabTest[]>([]);
  const [myOrders, setMyOrders] = useState<LabOrder[]>([]);
  const [cart, setCart] = useState<LabTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedRecommendations();
    loadLabCatalog();
    loadMyOrders();
  }, []);

  const loadPersonalizedRecommendations = async () => {
    try {
      setIsLoading(true);
      // ИИ-анализ для персональных рекомендаций
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
      const recommendations = await getPersonalizedLabRecommendations(
        user?.onboardingData,
        symptomEntries
      );
      setRecommendedTests(recommendations);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить персональные рекомендации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLabCatalog = async () => {
    try {
      const tests = await getAllLabTests();
      setAllTests(tests);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить каталог анализов",
        variant: "destructive",
      });
    }
  };

  const loadMyOrders = async () => {
    // Загрузка заказов пользователя из localStorage (имитация)
    const orders = JSON.parse(localStorage.getItem(`lab_orders_${user?.id}`) || '[]');
    setMyOrders(orders);
  };

  const addToCart = (test: LabTest) => {
    if (!cart.some(item => item.id === test.id)) {
      setCart([...cart, test]);
      toast({
        title: "Добавлено в корзину",
        description: `${test.name} добавлен в корзину`,
      });
    }
  };

  const removeFromCart = (testId: string) => {
    setCart(cart.filter(item => item.id !== testId));
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Корзина очищена",
      description: "Все анализы удалены из корзины",
    });
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Лабораторные анализы', href: '/patient/lab-tests' }
  ];

  return (
    <PatientLayout title="Лабораторные анализы | Eva" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        
        {/* Заголовок */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h1 className="text-3xl font-playfair font-bold gentle-text flex items-center mb-2">
            🧪 Лабораторные исследования
          </h1>
          <p className="soft-text">
            Персональные рекомендации анализов для мониторинга здоровья в менопаузе
          </p>
        </div>

        {/* Корзина (если есть товары) */}
        <CartSummary 
          cart={cart}
          onRemoveFromCart={removeFromCart}
          onClearCart={clearCart}
        />

        {/* Табы */}
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-1">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                🎯 Рекомендации
              </TabsTrigger>
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                📋 Каталог
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                📦 Заказы
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                📊 Результаты
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="mt-6">
              {isLoading ? (
                <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="soft-text">Анализируем ваш профиль...</p>
                </div>
              ) : (
                <PersonalizedRecommendationsContent 
                  tests={recommendedTests}
                  cart={cart}
                  onAddToCart={addToCart}
                />
              )}
            </TabsContent>

            <TabsContent value="catalog" className="mt-6">
              <LabCatalogContent 
                tests={allTests}
                cart={cart}
                onAddToCart={addToCart}
              />
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <MyOrdersContent orders={myOrders} />
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              <MyResultsContent orders={myOrders.filter(o => o.results)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PatientLayout>
  );
}

// Компонент каталога анализов
const LabCatalogContent = ({ tests, cart, onAddToCart }: {
  tests: LabTest[];
  cart: LabTest[];
  onAddToCart: (test: LabTest) => void;
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'Все анализы', icon: '🧪' },
    { id: 'hormones', name: 'Гормоны', icon: '🧬' },
    { id: 'vitamins', name: 'Витамины', icon: '💊' },
    { id: 'genetics', name: 'Генетика', icon: '🧬' },
    { id: 'microbiome', name: 'Микробиом', icon: '🦠' },
    { id: 'cancer_markers', name: 'Онкомаркеры', icon: '🎗️' },
    { id: 'metabolic', name: 'Метаболизм', icon: '⚡' }
  ];

  const filteredTests = tests.filter(test => {
    const matchesFilter = filter === 'all' || test.category === filter;
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.biomarkers.some(marker => marker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Поиск анализов или биомаркеров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1",
                  filter === category.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Результаты */}
      <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {filter === 'all' ? 'Все анализы' : categories.find(c => c.id === filter)?.name} 
            <span className="text-gray-500 ml-2">({filteredTests.length})</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map(test => (
            <LabTestCard
              key={test.id}
              test={test}
              isInCart={cart.some(c => c.id === test.id)}
              onAddToCart={() => onAddToCart(test)}
            />
          ))}
        </div>
        
        {filteredTests.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600">Анализы не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Компонент заказов
const MyOrdersContent = ({ orders }: { orders: LabOrder[] }) => {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">У вас пока нет заказов</h3>
          <p className="text-gray-600">Выберите нужные анализы в разделе рекомендаций или каталога</p>
        </div>
      ) : (
        orders.map(order => (
          <div key={order.id} className="bloom-card bg-white/90 backdrop-blur-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">Заказ #{order.id.slice(-6)}</h3>
                <p className="text-sm text-gray-600">{new Date(order.order_date).toLocaleDateString('ru-RU')}</p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                order.status === 'ready' ? "bg-green-100 text-green-700" :
                "bg-blue-100 text-blue-700"
              )}>
                {getOrderStatusLabel(order.status)}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              {order.tests.map(test => (
                <div key={test.id} className="flex justify-between text-sm">
                  <span>{test.name}</span>
                  <span className="font-medium">{test.price.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Итого:</span>
              <span>{order.total_price.toLocaleString()} ₽</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Компонент результатов
const MyResultsContent = ({ orders }: { orders: LabOrder[] }) => {
  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-8 text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Результатов пока нет</h3>
          <p className="text-gray-600">Результаты анализов появятся здесь после их готовности</p>
        </div>
      ) : (
        <div className="bloom-card bg-white/90 backdrop-blur-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Результаты анализов</h2>
          <p className="text-gray-600">Результаты анализов с ИИ-интерпретацией появятся здесь</p>
        </div>
      )}
    </div>
  );
};

// Вспомогательная функция для статусов заказов
const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'confirmed': return 'Подтвержден';
    case 'collected': return 'Собран';
    case 'processing': return 'Обработка';
    case 'ready': return 'Готов';
    case 'delivered': return 'Доставлен';
    default: return status;
  }
};