import React from 'react';
import { Link } from 'react-router-dom';

interface LabRecommendationWidgetProps {
  symptoms: any[];
  lastLabDate?: string;
}

export const LabRecommendationWidget: React.FC<LabRecommendationWidgetProps> = ({
  symptoms,
  lastLabDate
}) => {
  const isLabTestNeeded = () => {
    if (!lastLabDate) return true;
    const lastDate = new Date(lastLabDate);
    const monthsAgo = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo > 6; // Рекомендуем анализы каждые 6 месяцев
  };

  const getRecommendedTests = () => {
    const tests = [];
    
    // Базовые анализы всегда нужны
    tests.push('Гормональная панель менопауза');
    tests.push('Витамин D + Кальций');
    
    // На основе симптомов
    const hasHotFlashes = symptoms.some(s => s.hotFlashes?.count > 0);
    const hasMoodIssues = symptoms.some(s => s.mood?.anxiety > 3 || s.mood?.overall < 3);
    
    if (hasHotFlashes) {
      tests.push('Функция щитовидной железы');
    }
    
    if (hasMoodIssues) {
      tests.push('Нейротрансмиттеры и стресс');
    }
    
    return tests;
  };

  if (!isLabTestNeeded()) {
    return null;
  }

  const recommendedTests = getRecommendedTests();

  return (
    <div className="bloom-card bg-gradient-to-br from-green-50 to-blue-50 p-6 border-2 border-green-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🧪</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Рекомендуем сдать анализы
            </h3>
            <p className="text-sm text-gray-600">
              {lastLabDate 
                ? `Последние анализы были ${new Date(lastLabDate).toLocaleDateString('ru-RU')}`
                : 'Анализы помогут точнее подобрать терапию'
              }
            </p>
          </div>
        </div>
        <Link
          to="/patient/lab-tests"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          Выбрать анализы
        </Link>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-2">
          На основе ваших симптомов рекомендуем:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {recommendedTests.map((test, index) => (
            <div key={index} className="flex items-center text-sm text-gray-600">
              <span className="text-green-500 mr-2">✓</span>
              {test}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/80 rounded-lg">
        <div className="flex items-center text-sm text-blue-700">
          <span className="mr-2">💡</span>
          <span>
            ИИ-анализ поможет интерпретировать результаты и даст персональные рекомендации
          </span>
        </div>
      </div>
    </div>
  );
};