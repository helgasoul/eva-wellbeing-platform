import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComprehensiveRecommendation } from '@/types/comprehensiveRecommendations';
import { 
  Stethoscope, 
  FlaskConical, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
  Star,
  MapPin,
  Phone
} from 'lucide-react';
import { ProviderBookingModal } from './ProviderBookingModal';

interface ComprehensiveRecommendationsProps {
  recommendations: ComprehensiveRecommendation[];
  onActionClick: (recommendationId: string, actionType: string, provider?: any) => void;
}

export const ComprehensiveRecommendations: React.FC<ComprehensiveRecommendationsProps> = ({
  recommendations,
  onActionClick
}) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<ComprehensiveRecommendation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lab_tests':
        return <FlaskConical className="h-5 w-5" />;
      case 'instrumental_studies':
        return <Stethoscope className="h-5 w-5" />;
      case 'specialist_consultation':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'lab_tests':
        return 'Лабораторная диагностика';
      case 'instrumental_studies':
        return 'Инструментальные исследования';
      case 'specialist_consultation':
        return 'Консультации специалистов';
      case 'lifestyle':
        return 'Изменения образа жизни';
      case 'screening':
        return 'Скрининговые исследования';
      default:
        return 'Рекомендации';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'recommended':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'optional':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'Срочно';
      case 'recommended':
        return 'Рекомендуется';
      case 'optional':
        return 'По желанию';
      default:
        return urgency;
    }
  };

  const getEvidenceLevel = (level: string) => {
    switch (level) {
      case 'A':
        return { label: 'Высокий уровень доказательности', color: 'text-success' };
      case 'B':
        return { label: 'Средний уровень доказательности', color: 'text-warning' };
      case 'C':
        return { label: 'Низкий уровень доказательности', color: 'text-muted-foreground' };
      default:
        return { label: 'Уровень доказательности не указан', color: 'text-muted-foreground' };
    }
  };

  const handleActionClick = (recommendation: ComprehensiveRecommendation, actionType: string) => {
    if (actionType === 'lab_booking' || actionType === 'study_booking') {
      setSelectedRecommendation(recommendation);
      setIsModalOpen(true);
    } else {
      onActionClick(recommendation.id, actionType);
    }
  };

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, ComprehensiveRecommendation[]>);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-playfair font-bold text-foreground mb-4">
          Персонализированные рекомендации
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          На основе анализа ваших данных и рекомендаций ВОЗ мы подготовили индивидуальный план 
          обследований и консультаций для поддержания здоровья в период менопаузы
        </p>
      </div>

      {Object.entries(groupedRecommendations).map(([category, categoryRecommendations]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              {getCategoryIcon(category)}
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {getCategoryTitle(category)}
            </h3>
            <Badge variant="secondary" className="text-sm">
              {categoryRecommendations.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryRecommendations.map((recommendation) => {
              const evidenceLevel = getEvidenceLevel(recommendation.who_recommendations.evidence_level);
              
              return (
                <Card key={recommendation.id} className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">
                          {recommendation.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getUrgencyColor(recommendation.urgency)}>
                            {recommendation.urgency === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {recommendation.urgency === 'recommended' && <Clock className="h-3 w-3 mr-1" />}
                            {getUrgencyLabel(recommendation.urgency)}
                          </Badge>
                          {recommendation.age_specific && (
                            <Badge variant="outline" className="text-xs">
                              {recommendation.who_recommendations.age_group} лет
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                      {recommendation.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* WHO Guidelines Info */}
                    <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">Рекомендации ВОЗ:</span>
                        <span className={`text-xs ${evidenceLevel.color}`}>
                          Уровень {recommendation.who_recommendations.evidence_level}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Частота: {recommendation.who_recommendations.frequency}
                      </p>
                    </div>

                    {/* Cost */}
                    {recommendation.estimated_cost && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ориентировочная стоимость:</span>
                        <span className="font-medium text-foreground">{recommendation.estimated_cost}</span>
                      </div>
                    )}

                    {/* Preparation */}
                    {recommendation.preparation_required && recommendation.preparation_required.length > 0 && (
                      <div>
                        <details className="group">
                          <summary className="flex items-center justify-between text-sm font-medium text-foreground cursor-pointer list-none">
                            <span>Подготовка к процедуре</span>
                            <Info className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="mt-2 space-y-1">
                            {recommendation.preparation_required.map((item, index) => (
                              <div key={index} className="flex items-start text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0 text-success" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {recommendation.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant={action.type === 'lab_booking' || action.type === 'study_booking' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleActionClick(recommendation, action.type)}
                          className={
                            action.type === 'lab_booking' || action.type === 'study_booking'
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              : ''
                          }
                        >
                          {action.type === 'schedule' && <Calendar className="h-4 w-4 mr-1" />}
                          {action.type === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Provider Booking Modal */}
      {selectedRecommendation && (
        <ProviderBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recommendation={selectedRecommendation}
          onProviderSelect={(provider) => {
            onActionClick(selectedRecommendation.id, 'provider_selected', provider);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};