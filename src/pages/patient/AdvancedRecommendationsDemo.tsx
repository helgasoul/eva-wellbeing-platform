import React from 'react';
import { Bell, Zap, Target, Clock, Settings, Filter } from 'lucide-react';
import { NotificationSystem } from '../../components/notifications/NotificationSystem';

export const AdvancedRecommendationsDemo: React.FC = () => {
  const demoStats = {
    totalNotifications: 12,
    highPriorityCount: 3,
    completionRate: 85,
    averageEffectiveness: 88
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Система уведомлений */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationSystem />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Расширенная система рекомендаций Eva
        </h1>
        <p className="text-gray-600 mb-4">
          Центр уведомлений с фильтрацией, показатели эффективности и персонализированные рекомендации
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Новые возможности</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Центр уведомлений с фильтрацией</li>
              <li>• Показатели эффективности рекомендаций</li>
              <li>• Персонализация по фазе менопаузы</li>
              <li>• Интеграция с погодными данными</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Улучшения</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Умная логика условий</li>
              <li>• Временные ограничения</li>
              <li>• Система приоритетов</li>
              <li>• Категоризация по типам</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Расширенная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Bell className="text-blue-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Уведомления</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {demoStats.totalNotifications}
          </div>
          <p className="text-sm text-gray-600">Всего сегодня</p>
          <div className="mt-2 text-xs text-blue-600">
            {demoStats.highPriorityCount} важных
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Target className="text-green-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Эффективность</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {demoStats.averageEffectiveness}%
          </div>
          <p className="text-sm text-gray-600">Средняя по рекомендациям</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${demoStats.averageEffectiveness}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Clock className="text-purple-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Выполнение</h3>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {demoStats.completionRate}%
          </div>
          <p className="text-sm text-gray-600">Процент выполнения</p>
          <div className="mt-2 text-xs text-purple-600">
            +12% за неделю
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Settings className="text-orange-500 mr-3" size={24} />
            <h3 className="font-semibold text-lg">Персонализация</h3>
          </div>
          <div className="text-lg font-bold text-gray-800">
            Перименопауза
          </div>
          <p className="text-sm text-gray-600">Текущая фаза</p>
          <div className="mt-2 text-xs text-orange-600">
            Plus подписка
          </div>
        </div>
      </div>

      {/* Категории рекомендаций */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <Filter className="mr-2" size={20} />
            Категории рекомендаций
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">🍽️</span>
                <span className="font-medium">Питание</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">4 рекомендации</div>
                <div className="text-xs text-gray-500">92% эффективность</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">💧</span>
                <span className="font-medium">Гидратация</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">2 рекомендации</div>
                <div className="text-xs text-gray-500">85% эффективность</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">🌿</span>
                <span className="font-medium">Симптомы</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">3 рекомендации</div>
                <div className="text-xs text-gray-500">78% эффективность</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-3">🧪</span>
                <span className="font-medium">Дефициты</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">2 рекомендации</div>
                <div className="text-xs text-gray-500">94% эффективность</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-lg mb-4">Активные условия</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Временные ограничения</div>
              <div className="text-sm text-blue-600">7:00-22:00 активное время</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="font-medium text-green-800">Профиль пользователя</div>
              <div className="text-sm text-green-600">Перименопауза, 52 года</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="font-medium text-purple-800">Подписка</div>
              <div className="text-sm text-purple-600">Plus - расширенные рекомендации</div>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="font-medium text-orange-800">Погодные условия</div>
              <div className="text-sm text-orange-600">Высокая влажность 70%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Инструкции по использованию */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-lg mb-4">Как использовать расширенную систему</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Центр уведомлений</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Нажмите на иконку 🔔 в правом верхнем углу</li>
              <li>• Используйте фильтры: Все, Важные, Сегодня, Категории</li>
              <li>• Просматривайте показатели эффективности</li>
              <li>• Кликайте на уведомления для действий</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Персонализация</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Рекомендации адаптируются к вашей фазе менопаузы</li>
              <li>• Учитываются погодные условия</li>
              <li>• Временные ограничения предотвращают spam</li>
              <li>• Система обучается на ваших предпочтениях</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};