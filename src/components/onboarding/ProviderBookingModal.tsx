import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ComprehensiveRecommendation, Provider, Laboratory, DiagnosticCenter } from '@/types/comprehensiveRecommendations';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Home, 
  Zap,
  Filter,
  ExternalLink
} from 'lucide-react';

interface ProviderBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: ComprehensiveRecommendation;
  onProviderSelect: (provider: Provider) => void;
}

export const ProviderBookingModal: React.FC<ProviderBookingModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onProviderSelect
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [featureFilter, setFeatureFilter] = useState<string>('all');

  const providers = recommendation.actions
    .find(action => action.type === 'lab_booking' || action.type === 'study_booking')
    ?.available_providers || [];

  const filteredProviders = providers.filter(provider => {
    if (priceFilter !== 'all') {
      const maxPrice = provider.price_range?.max || 0;
      if (priceFilter === 'budget' && maxPrice > 10000) return false;
      if (priceFilter === 'premium' && maxPrice < 10000) return false;
    }
    
    if (locationFilter !== 'all' && provider.location !== locationFilter) {
      return false;
    }

    if (featureFilter !== 'all') {
      if (featureFilter === 'home_collection' && 
          !provider.features.some(f => f.toLowerCase().includes('дому'))) {
        return false;
      }
      if (featureFilter === 'rapid_results' && 
          !provider.features.some(f => f.toLowerCase().includes('быстр'))) {
        return false;
      }
      if (featureFilter === 'female_friendly' && 
          provider.type === 'diagnostic_center' &&
          !(provider as DiagnosticCenter).female_friendly) {
        return false;
      }
    }

    return true;
  });

  const modalConfig = recommendation.actions
    .find(action => action.type === 'lab_booking' || action.type === 'study_booking')
    ?.modal_config;

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleBooking = () => {
    if (selectedProvider) {
      onProviderSelect(selectedProvider);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getProviderTypeLabel = (type: string) => {
    switch (type) {
      case 'laboratory':
        return 'Лаборатория';
      case 'diagnostic_center':
        return 'Диагностический центр';
      case 'clinic':
        return 'Клиника';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {modalConfig?.title || `Выбор провайдера для: ${recommendation.title}`}
          </DialogTitle>
          <DialogDescription>
            Выберите подходящий медицинский центр для проведения процедуры
          </DialogDescription>
        </DialogHeader>

        {/* Preparation Info */}
        {modalConfig?.preparation_info && modalConfig.preparation_info.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Важная информация о подготовке
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {modalConfig.preparation_info.map((info, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                  {info}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Фильтры:</span>
          </div>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Цена" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любая цена</SelectItem>
              <SelectItem value="budget">До 10 000 ₽</SelectItem>
              <SelectItem value="premium">От 10 000 ₽</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Город" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Любой город</SelectItem>
              <SelectItem value="Москва">Москва</SelectItem>
              <SelectItem value="Санкт-Петербург">Санкт-Петербург</SelectItem>
            </SelectContent>
          </Select>

          <Select value={featureFilter} onValueChange={setFeatureFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Особенности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все услуги</SelectItem>
              <SelectItem value="home_collection">Забор на дому</SelectItem>
              <SelectItem value="rapid_results">Быстрые результаты</SelectItem>
              <SelectItem value="female_friendly">Женский персонал</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Providers List */}
        <div className="space-y-4 mb-6">
          {filteredProviders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Не найдено провайдеров с выбранными фильтрами</p>
            </div>
          ) : (
            filteredProviders.map((provider) => (
              <Card 
                key={provider.id} 
                className={`cursor-pointer transition-all ${
                  selectedProvider?.id === provider.id 
                    ? 'ring-2 ring-primary border-primary shadow-md' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{provider.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getProviderTypeLabel(provider.type)}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          {getRatingStars(provider.rating)}
                          <span className="text-sm text-muted-foreground ml-1">
                            {provider.rating}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {provider.location}
                        </div>
                        {provider.distance && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {provider.distance} км
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {provider.price_range && (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-foreground">
                          {provider.price_range.min.toLocaleString()} - {provider.price_range.max.toLocaleString()} ₽
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature.includes('дому') && <Home className="h-3 w-3 mr-1" />}
                        {feature.includes('быстр') && <Zap className="h-3 w-3 mr-1" />}
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  {provider.type === 'laboratory' && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Специализации: {(provider as Laboratory).specializations.join(', ')}
                    </div>
                  )}
                  
                  {provider.type === 'diagnostic_center' && (provider as DiagnosticCenter).female_friendly && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs border-pink-200 text-pink-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Женский персонал
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedProvider ? (
              `Выбран: ${selectedProvider.name}`
            ) : (
              'Выберите провайдера для продолжения'
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              onClick={handleBooking}
              disabled={!selectedProvider}
              className="bg-primary hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Записаться онлайн
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};