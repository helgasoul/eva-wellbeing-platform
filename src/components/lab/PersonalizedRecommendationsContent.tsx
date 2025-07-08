import React from 'react';
import { LabTestCard } from './LabTestCard';
import type { LabTest } from '@/services/labRecommendationService';

interface PersonalizedRecommendationsContentProps {
  tests: LabTest[];
  cart: LabTest[];
  onAddToCart: (test: LabTest) => void;
}

export const PersonalizedRecommendationsContent: React.FC<PersonalizedRecommendationsContentProps> = ({
  tests,
  cart,
  onAddToCart
}) => {
  const essentialTests = tests.filter(t => t.menopause_relevance === 'essential');
  const recommendedTests = tests.filter(t => t.menopause_relevance === 'recommended');
  const optionalTests = tests.filter(t => t.menopause_relevance === 'optional');

  if (tests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Анализируем ваш профиль...
        </h3>
        <p className="text-gray-600">
          Заполните трекер симптомов для получения персональных рекомендаций
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* ИИ-сводка */}
      <AIRecommendationSummary />

      {/* Обязательные анализы */}
      {essentialTests.length > 0 && (
        <TestCategory
          title="🔴 Обязательные анализы"
          subtitle="Рекомендуются всем женщинам в вашей фазе менопаузы"
          tests={essentialTests}
          cart={cart}
          onAddToCart={onAddToCart}
          priority="high"
        />
      )}

      {/* Рекомендуемые анализы */}
      {recommendedTests.length > 0 && (
        <TestCategory
          title="🟡 Рекомендуемые анализы"
          subtitle="На основе ваших симптомов и факторов риска"
          tests={recommendedTests}
          cart={cart}
          onAddToCart={onAddToCart}
          priority="medium"
        />
      )}

      {/* Дополнительные анализы */}
      {optionalTests.length > 0 && (
        <TestCategory
          title="🟢 Дополнительные анализы"
          subtitle="Для расширенной диагностики и профилактики"
          tests={optionalTests}
          cart={cart}
          onAddToCart={onAddToCart}
          priority="low"
        />
      )}

      {/* Готовые пакеты */}
      <LabPackages cart={cart} onAddToCart={onAddToCart} />
    </div>
  );
};

// Компонент ИИ-сводки
const AIRecommendationSummary = () => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
    <div className="flex items-start">
      <span className="text-3xl mr-4">🤖</span>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          ИИ-анализ ваших потребностей
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>✅ <strong>Фаза менопаузы:</strong> Перименопауза</p>
          <p>✅ <strong>Основные симптомы:</strong> Приливы, нарушения сна, перепады настроения</p>
          <p>✅ <strong>Факторы риска:</strong> Семейная история остеопороза</p>
          <p>✅ <strong>Последние анализы:</strong> 8 месяцев назад</p>
        </div>
        <div className="mt-4 p-3 bg-white rounded-lg">
          <p className="text-sm text-gray-800">
            <strong>Рекомендация:</strong> Приоритет - гормональная панель для оценки 
            эстрогенов и ФСГ. Дополнительно рекомендуем витамин D и кальций для 
            профилактики остеопороза.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Компонент категории анализов
const TestCategory = ({
  title,
  subtitle,
  tests,
  cart,
  onAddToCart,
  priority
}: {
  title: string;
  subtitle: string;
  tests: LabTest[];
  cart: LabTest[];
  onAddToCart: (test: LabTest) => void;
  priority: 'high' | 'medium' | 'low';
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className={`rounded-2xl p-6 border-2 ${getPriorityColor()}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600">{subtitle}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map(test => (
          <LabTestCard
            key={test.id}
            test={test}
            isInCart={cart.some(c => c.id === test.id)}
            onAddToCart={() => onAddToCart(test)}
          />
        ))}
      </div>
    </div>
  );
};

// Компонент готовых пакетов
const LabPackages = ({ cart, onAddToCart }: {
  cart: LabTest[];
  onAddToCart: (test: LabTest) => void;
}) => {
  const packages = [
    {
      id: 'menopause_basic',
      name: '🎯 Базовый пакет "Менопауза"',
      description: 'Основные анализы для мониторинга гормонального статуса',
      tests: ['hormone_panel_menopause', 'vitamin_d_calcium'],
      originalPrice: 3600,
      packagePrice: 3200,
      savings: 400
    },
    {
      id: 'menopause_extended',
      name: '🔬 Расширенный пакет "Менопауза+"',
      description: 'Полная диагностика включая щитовидную железу и онкомаркеры',
      tests: ['hormone_panel_menopause', 'vitamin_d_calcium', 'thyroid_panel', 'cancer_markers_women'],
      originalPrice: 7800,
      packagePrice: 6900,
      savings: 900
    }
  ];

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">📦 Готовые пакеты со скидкой</h2>
        <p className="text-gray-600">Оптимальные наборы анализов с экономией до 15%</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
            <h3 className="font-bold text-gray-800 mb-2">{pkg.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-purple-600">{pkg.packagePrice.toLocaleString()} ₽</span>
                <span className="text-sm text-gray-500 line-through ml-2">{pkg.originalPrice.toLocaleString()} ₽</span>
              </div>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                -{pkg.savings} ₽
              </span>
            </div>
            
            <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium">
              🛒 Добавить пакет
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};