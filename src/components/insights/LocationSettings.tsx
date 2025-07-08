import React, { useState } from 'react';
import { environmentalService } from '../../services/environmentalService';

interface LocationSettingsProps {
  currentLocation: { lat: number; lon: number; city: string } | null;
  onLocationUpdate: (location: { lat: number; lon: number; city: string }) => void;
  onError?: (error: string) => void;
}

export const LocationSettings: React.FC<LocationSettingsProps> = ({
  currentLocation,
  onLocationUpdate,
  onError
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const detectCurrentLocation = async () => {
    setIsDetecting(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Геолокация не поддерживается вашим браузером');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 минут
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Получаем название города через reverse geocoding
      const city = await environmentalService.getCityName(latitude, longitude);
      
      onLocationUpdate({ lat: latitude, lon: longitude, city });
    } catch (error: any) {
      console.error('Ошибка определения местоположения:', error);
      let errorMessage = 'Не удалось определить местоположение';
      
      if (error.code === 1) {
        errorMessage = 'Доступ к геолокации заблокирован. Разрешите доступ в настройках браузера.';
      } else if (error.code === 2) {
        errorMessage = 'Местоположение недоступно. Проверьте соединение с интернетом.';
      } else if (error.code === 3) {
        errorMessage = 'Превышено время ожидания. Попробуйте еще раз.';
      }
      
      onError?.(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const searchCityAndUpdate = async () => {
    if (!manualCity.trim()) return;
    
    setIsSearching(true);
    try {
      const coordinates = await environmentalService.getCityCoordinates(manualCity.trim());
      onLocationUpdate({ 
        lat: coordinates.lat, 
        lon: coordinates.lon, 
        city: manualCity.trim() 
      });
      setManualCity('');
    } catch (error) {
      console.error('Ошибка поиска города:', error);
      onError?.('Город не найден. Проверьте правильность написания.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      searchCityAndUpdate();
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
        📍 Настройки местоположения
      </h4>
      
      {/* Текущее местоположение */}
      {currentLocation && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800">
                Текущий город: {currentLocation.city}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lon.toFixed(4)}
              </div>
            </div>
            <div className="text-green-500 text-lg">✓</div>
          </div>
        </div>
      )}

      {/* Автоматическое определение */}
      <div className="space-y-3">
        <button
          onClick={detectCurrentLocation}
          disabled={isDetecting}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isDetecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Определяем местоположение...
            </>
          ) : (
            <>
              🎯 Определить автоматически
            </>
          )}
        </button>

        {/* Разделитель */}
        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <div className="px-3 text-sm text-gray-500">или</div>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Ручной ввод города */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Введите название города
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder="Например: Москва, Санкт-Петербург"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
            <button
              onClick={searchCityAndUpdate}
              disabled={isSearching || !manualCity.trim()}
              className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                '🔍'
              )}
            </button>
          </div>
        </div>

        {/* Популярные города */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Популярные города:</div>
          <div className="flex flex-wrap gap-2">
            {['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань'].map((city) => (
              <button
                key={city}
                onClick={() => setManualCity(city)}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Информация о приватности */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="text-blue-500 mr-2">🔒</div>
            <div className="text-xs text-blue-700">
              <div className="font-medium mb-1">Приватность данных</div>
              <div>
                Мы используем ваше местоположение только для получения данных о погоде и качестве воздуха. 
                Точные координаты не сохраняются и не передаются третьим лицам.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSettings;