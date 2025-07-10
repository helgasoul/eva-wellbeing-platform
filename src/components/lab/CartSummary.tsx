import React, { useState } from 'react';
import type { LabTest } from '@/services/labRecommendationService';
import { logger } from '@/utils/logger';

interface CartSummaryProps {
  cart: LabTest[];
  onRemoveFromCart: (testId: string) => void;
  onClearCart: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  onRemoveFromCart,
  onClearCart
}) => {
  const [showCheckout, setShowCheckout] = useState(false);

  const totalPrice = cart.reduce((sum, test) => sum + test.price, 0);
  const groupedByLab = cart.reduce((groups, test) => {
    const lab = test.lab_provider;
    if (!groups[lab]) groups[lab] = [];
    groups[lab].push(test);
    return groups;
  }, {} as Record<string, LabTest[]>);

  if (cart.length === 0) return null;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            🛒 Корзина ({cart.length} анализов)
          </h3>
          <button
            onClick={onClearCart}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Очистить корзину
          </button>
        </div>

        {/* Группировка по лабораториям */}
        <div className="space-y-4 mb-4">
          {Object.entries(groupedByLab).map(([lab, tests]) => (
            <div key={lab} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-800 mb-2 capitalize">
                🏥 {lab.toUpperCase()} ({tests.length} анализов)
              </div>
              <div className="space-y-2">
                {tests.map(test => (
                  <div key={test.id} className="flex items-center justify-between text-sm">
                    <span className="flex-1">{test.name}</span>
                    <span className="font-medium text-green-600 mr-3">
                      {test.price.toLocaleString()} ₽
                    </span>
                    <button
                      onClick={() => onRemoveFromCart(test.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Итого */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-800">Итого:</span>
            <span className="text-2xl font-bold text-green-600">
              {totalPrice.toLocaleString()} ₽
            </span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowCheckout(true)}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              📦 Оформить заказ
            </button>
            <button
              className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              💬 Консультация
            </button>
          </div>
        </div>

        {/* Быстрые факты */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="bg-blue-50 rounded-lg p-2">
            <div className="text-xs text-blue-600">Забор</div>
            <div className="text-sm font-medium">На дому</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <div className="text-xs text-green-600">Готовность</div>
            <div className="text-sm font-medium">1-21 день</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="text-xs text-purple-600">Интерпретация</div>
            <div className="text-sm font-medium">ИИ-анализ</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2">
            <div className="text-xs text-orange-600">Качество</div>
            <div className="text-sm font-medium">ISO 15189</div>
          </div>
        </div>
      </div>

      {/* Модальное окно оформления заказа */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          totalPrice={totalPrice}
          onClose={() => setShowCheckout(false)}
          onConfirm={(orderData) => {
            // Обработка заказа
            logger.info('Order placed', { orderId: orderData.id });
            setShowCheckout(false);
            onClearCart();
          }}
        />
      )}
    </>
  );
};

// Модальное окно оформления заказа
const CheckoutModal: React.FC<{
  cart: LabTest[];
  totalPrice: number;
  onClose: () => void;
  onConfirm: (orderData: any) => void;
}> = ({ cart, totalPrice, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Оформление заказа</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">Ваши анализы:</h3>
              <div className="space-y-2">
                {cart.map(test => (
                  <div key={test.id} className="flex justify-between text-sm">
                    <span>{test.name}</span>
                    <span className="font-medium">{test.price.toLocaleString()} ₽</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Итого:</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Способ забора материала
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Выезд медсестры на дом (+500 ₽)</option>
                  <option>Визит в лабораторию</option>
                  <option>Пункт приема в аптеке</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Предпочтительная дата
                </label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес (если выезд на дом)
                </label>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Укажите точный адрес для выезда медсестры"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => onConfirm({})}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Подтвердить заказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};