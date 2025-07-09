import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Clock, 
  AlertTriangle, 
  ShoppingCart,
  Heart,
  Brain,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import type { SupplementRecommendation, UserProfile } from '@/services/nutritionAnalyzer';

interface SupplementRecommendationsProps {
  supplements: SupplementRecommendation[];
  userProfile: UserProfile;
  className?: string;
}

interface SupplementSchedule {
  supplement: SupplementRecommendation;
  timeSlots: string[];
  reminderTime: string;
  isActive: boolean;
}

export const SupplementRecommendations: React.FC<SupplementRecommendationsProps> = ({
  supplements,
  userProfile,
  className = ""
}) => {
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementSchedule[]>([]);
  const [showInteractionWarning, setShowInteractionWarning] = useState(false);

  const getFormIcon = (form: string) => {
    switch (form) {
      case 'tablet': return '💊';
      case 'capsule': return '🔘';
      case 'liquid': return '🧪';
      case 'powder': return '🥄';
      default: return '💊';
    }
  };

  const getTimingIcon = (timing: string) => {
    if (timing.includes('утром') || timing.includes('Утром')) return '🌅';
    if (timing.includes('вечером') || timing.includes('Вечером')) return '🌙';
    if (timing.includes('днем') || timing.includes('обед')) return '☀️';
    return '🕐';
  };

  const addToSchedule = (supplement: SupplementRecommendation) => {
    const timeSlots = generateTimeSlots(supplement.timing);
    const newSchedule: SupplementSchedule = {
      supplement,
      timeSlots,
      reminderTime: timeSlots[0] || '09:00',
      isActive: true
    };

    setSelectedSupplements(prev => [...prev, newSchedule]);
    checkInteractions([...selectedSupplements, newSchedule]);
  };

  const removeFromSchedule = (supplementName: string) => {
    setSelectedSupplements(prev => 
      prev.filter(schedule => schedule.supplement.name !== supplementName)
    );
  };

  const generateTimeSlots = (timing: string): string[] => {
    if (timing.includes('утром') || timing.includes('Утром')) return ['08:00'];
    if (timing.includes('вечером') || timing.includes('Вечером')) return ['20:00'];
    if (timing.includes('с едой')) return ['08:00', '13:00', '19:00'];
    if (timing.includes('натощак')) return ['07:00'];
    return ['09:00'];
  };

  const checkInteractions = (schedules: SupplementSchedule[]) => {
    const hasInteractions = schedules.some(schedule => 
      schedule.supplement.interactions.length > 0
    );
    setShowInteractionWarning(hasInteractions);
  };

  const getDailyTotal = () => {
    return selectedSupplements.length;
  };

  const getMonthlyEstimate = () => {
    // Примерная стоимость в рублях
    const baseCost = selectedSupplements.length * 800; // средняя стоимость БАД в месяц
    return baseCost;
  };

  const isSupplementSelected = (supplementName: string) => {
    return selectedSupplements.some(schedule => 
      schedule.supplement.name === supplementName
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Заголовок и общая статистика */}
      <Card className="bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/10 shadow-elegant rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-playfair text-foreground flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            Персональные рекомендации БАД
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Индивидуальный план добавок для {userProfile.name} ({userProfile.menopausePhase})
          </p>
        </CardHeader>
        
        {selectedSupplements.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-background/80 to-accent/5 p-3 rounded-xl border border-primary/10">
                <div className="text-lg font-bold text-foreground">{getDailyTotal()}</div>
                <div className="text-xs text-muted-foreground">БАД в день</div>
              </div>
              <div className="bg-gradient-to-br from-background/80 to-accent/5 p-3 rounded-xl border border-primary/10">
                <div className="text-lg font-bold text-foreground">{getMonthlyEstimate()}₽</div>
                <div className="text-xs text-muted-foreground">В месяц</div>
              </div>
              <div className="bg-gradient-to-br from-background/80 to-accent/5 p-3 rounded-xl border border-primary/10">
                <div className="text-lg font-bold text-foreground">
                  {selectedSupplements.filter(s => s.supplement.monitoringNeeded).length}
                </div>
                <div className="text-xs text-muted-foreground">Требует контроля</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Список рекомендаций */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supplements.map((supplement, index) => (
          <Card 
            key={index}
            className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-soft rounded-2xl hover:shadow-floating transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-playfair text-foreground flex items-center gap-2">
                    <span className="text-lg">{getFormIcon(supplement.form)}</span>
                    {supplement.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {supplement.dosage}
                  </p>
                </div>
                {supplement.monitoringNeeded && (
                  <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-800">
                    <Calendar className="h-3 w-3 mr-1" />
                    Контроль
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Время приема */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-lg">{getTimingIcon(supplement.timing)}</span>
                <div>
                  <span className="font-medium text-foreground">Время приема:</span>
                  <br />
                  <span className="text-muted-foreground">{supplement.timing}</span>
                </div>
              </div>

              {/* Длительность */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                  <span className="font-medium text-foreground">Длительность:</span>
                  <span className="text-muted-foreground ml-1">{supplement.duration}</span>
                </div>
              </div>

              {/* С едой или без */}
              <div className="flex items-center gap-2 text-sm">
                {supplement.withFood ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Принимать с едой</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-muted-foreground">Принимать натощак</span>
                  </>
                )}
              </div>

              {/* Противопоказания */}
              {supplement.contraindications.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Противопоказания</span>
                  </div>
                  <p className="text-xs text-red-700">
                    {supplement.contraindications.join(', ')}
                  </p>
                </div>
              )}

              {/* Взаимодействия */}
              {supplement.interactions.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Взаимодействия</span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    {supplement.interactions.join(', ')}
                  </p>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="flex gap-2">
                {!isSupplementSelected(supplement.name) ? (
                  <Button
                    onClick={() => addToSchedule(supplement)}
                    className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    size="sm"
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Добавить в план
                  </Button>
                ) : (
                  <Button
                    onClick={() => removeFromSchedule(supplement.name)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    В плане
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Расписание приема (если есть выбранные БАД) */}
      {selectedSupplements.length > 0 && (
        <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20 shadow-elegant rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary" />
              Ваш план приема БАД
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {selectedSupplements.map((schedule, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFormIcon(schedule.supplement.form)}</span>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {schedule.supplement.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.supplement.dosage} • {schedule.timeSlots.join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => removeFromSchedule(schedule.supplement.name)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {showInteractionWarning && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    Внимание к взаимодействиям
                  </span>
                </div>
                <p className="text-xs text-orange-700">
                  Некоторые БАД в вашем плане имеют потенциальные взаимодействия. 
                  Обязательно проконсультируйтесь с врачом перед началом приема.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Информация о партнерских ссылках */}
      <Card className="bg-gradient-to-r from-background/50 to-accent/5 border-border/50 shadow-soft rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Где купить качественные БАД
              </h4>
              <p className="text-xs text-muted-foreground">
                Мы рекомендуем проверенных поставщиков с сертифицированными продуктами. 
                При покупке по нашим ссылкам вы поддерживаете развитие платформы.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};