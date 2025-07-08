import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { LabTest } from '@/services/labRecommendationService';

interface LabTestCardProps {
  test: LabTest;
  isInCart: boolean;
  onAddToCart: () => void;
}

export const LabTestCard: React.FC<LabTestCardProps> = ({
  test,
  isInCart,
  onAddToCart
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hormones': return '🧬';
      case 'general': return '🩸';
      case 'genetics': return '🧬';
      case 'microbiome': return '🦠';
      case 'vitamins': return '💊';
      case 'metabolic': return '⚡';
      case 'cancer_markers': return '🎗️';
      default: return '🧪';
    }
  };

  const getLabProviderInfo = (provider: string) => {
    switch (provider) {
      case 'dnkom':
        return { name: 'ДНКОМ', color: 'bg-blue-100 text-blue-700', reliability: 'Высокая точность' };
      case 'genetico':
        return { name: 'Genetico', color: 'bg-purple-100 text-purple-700', reliability: 'Генетика' };
      case 'atlas':
        return { name: 'Atlas', color: 'bg-green-100 text-green-700', reliability: 'Микробиом' };
      case 'helix':
        return { name: 'Helix', color: 'bg-orange-100 text-orange-700', reliability: 'Комплексно' };
      default:
        return { name: provider, color: 'bg-gray-100 text-gray-700', reliability: '' };
    }
  };

  const labInfo = getLabProviderInfo(test.lab_provider);

  const getUrgencyIndicator = () => {
    if (test.menopause_relevance === 'essential') {
      return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">Важно</span>;
    }
    if (test.menopause_relevance === 'recommended') {
      return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">Рекомендуется</span>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      
      {/* Заголовок карточки */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getCategoryIcon(test.category)}</span>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                {test.name}
              </h3>
              <div className="flex items-center mt-1 space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${labInfo.color}`}>
                  {labInfo.name}
                </span>
                {getUrgencyIndicator()}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {test.description}
        </p>

        {/* Основные биомаркеры */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Биомаркеры:</div>
          <div className="flex flex-wrap gap-1">
            {test.biomarkers.slice(0, 3).map((biomarker, index) => (
              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                {biomarker}
              </span>
            ))}
            {test.biomarkers.length > 3 && (
              <span className="text-xs text-gray-500">
                +{test.biomarkers.length - 3} еще
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Детали анализа */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <span className="text-gray-500">Тип образца:</span>
            <div className="font-medium">{getSampleTypeLabel(test.sample_type)}</div>
          </div>
          <div>
            <span className="text-gray-500">Готовность:</span>
            <div className="font-medium">{test.duration_days} дн.</div>
          </div>
          <div>
            <span className="text-gray-500">Частота:</span>
            <div className="font-medium">{getFrequencyLabel(test.frequency_recommendation)}</div>
          </div>
          <div>
            <span className="text-gray-500">Цена:</span>
            <div className="font-bold text-green-600">{test.price.toLocaleString()} ₽</div>
          </div>
        </div>

        {/* Подготовка к анализу */}
        {test.preparation_requirements.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? 'Скрыть' : 'Показать'} подготовку
            </button>
            {showDetails && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <ul className="space-y-1">
                  {test.preparation_requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Кнопка добавления в корзину */}
        <button
          onClick={onAddToCart}
          disabled={isInCart}
          className={cn(
            "w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors",
            isInCart
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          )}
        >
          {isInCart ? '✓ В корзине' : '+ Добавить в корзину'}
        </button>
      </div>
    </div>
  );
};

// Вспомогательные функции
const getSampleTypeLabel = (type: string) => {
  switch (type) {
    case 'blood': return 'Кровь';
    case 'saliva': return 'Слюна';
    case 'urine': return 'Моча';
    case 'stool': return 'Кал';
    case 'buccal_swab': return 'Мазок';
    default: return type;
  }
};

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'once': return 'Однократно';
    case 'yearly': return 'Ежегодно';
    case 'every_6_months': return 'Раз в 6 мес.';
    case 'every_3_months': return 'Раз в 3 мес.';
    case 'monthly': return 'Ежемесячно';
    default: return frequency;
  }
};