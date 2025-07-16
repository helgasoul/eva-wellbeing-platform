import React, { useState, useMemo } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DeficiencyCard } from '@/components/nutrition/DeficiencyCard';
import { SupplementRecommendations } from '@/components/nutrition/SupplementRecommendations';
import { PremiumTeaser } from '@/components/nutrition/PremiumTeaser';
import { useSubscription } from '@/context/SubscriptionContext';
import { 
  NutritionAnalyzer, 
  type LabResults, 
  type NutrientDeficiency, 
  type SupplementRecommendation,
  type UserProfile 
} from '@/services/nutritionAnalyzer';
import { 
  FlaskConical, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  FileText,
  Brain,
  Heart,
  Shield,
  Crown,
  Zap
} from 'lucide-react';

const NutritionAnalysis: React.FC = () => {
  const { currentPlan } = useSubscription();
  const [labResults, setLabResults] = useState<LabResults | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<SupplementRecommendation[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock user profile - в реальном приложении это будет из контекста
  const userProfile: UserProfile = {
    id: '1',
    name: 'Анна',
    age: 48,
    weight: 65,
    height: 165,
    menopausePhase: 'perimenopause',
    activityLevel: 'moderate',
    subscriptionTier: (currentPlan?.id as 'essential' | 'plus' | 'optimum') || 'essential',
    symptoms: ['приливы', 'нарушение сна', 'перепады настроения'],
    allergies: [],
    dietaryRestrictions: []
  };

  const breadcrumbs = [
    { label: 'Главная', href: '/patient/dashboard' },
    { label: 'Анализ питания' }
  ];

  // Анализ дефицитов
  const deficiencies = useMemo(() => {
    if (!labResults) return [];
    return NutritionAnalyzer.analyzeDeficiencies(labResults);
  }, [labResults]);

  // Рекомендации БАД
  const supplementRecommendations = useMemo(() => {
    return deficiencies
      .filter(d => d.supplementRecommendation)
      .map(d => d.supplementRecommendation!)
      .filter(Boolean);
  }, [deficiencies]);

  const handleLoadMockData = () => {
    const mockResults = NutritionAnalyzer.getMockLabResults();
    setLabResults(mockResults);
  };

  const handleAddSupplement = (supplement: SupplementRecommendation) => {
    setSelectedSupplements(prev => {
      const exists = prev.some(s => s.name === supplement.name);
      if (exists) return prev;
      return [...prev, supplement];
    });
  };

  const handleUpgrade = () => {
    console.log('Upgrading subscription');
  };

  const getOverallScore = () => {
    if (!deficiencies.length) return 100;
    
    const severeCount = deficiencies.filter(d => d.severity === 'severe').length;
    const moderateCount = deficiencies.filter(d => d.severity === 'moderate').length;
    const mildCount = deficiencies.filter(d => d.severity === 'mild').length;
    
    const totalImpact = severeCount * 30 + moderateCount * 15 + mildCount * 5;
    return Math.max(0, 100 - totalImpact);
  };

  const canViewFullAnalysis = currentPlan?.id === 'plus' || currentPlan?.id === 'optimum';
  const canViewAdvancedFeatures = currentPlan?.id === 'optimum';

  return (
    <PatientLayout title="без | паузы - Анализ питания" breadcrumbs={breadcrumbs}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Заголовок */}
        <div className="bg-gradient-to-br from-background via-primary/5 to-accent/10 p-8 rounded-3xl shadow-elegant border border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-full flex items-center justify-center animate-gentle-float">
                <FlaskConical className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-playfair font-bold text-foreground mb-2">
                  Анализ питания 🧬
                </h1>
                <p className="text-muted-foreground text-lg">
                  Персональные рекомендации на основе ваших анализов
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {userProfile.menopausePhase === 'premenopause' && '🌱 Пременопауза'}
                    {userProfile.menopausePhase === 'perimenopause' && '🌿 Перименопауза'}
                    {userProfile.menopausePhase === 'menopause' && '🌺 Менопауза'}
                    {userProfile.menopausePhase === 'postmenopause' && '🌷 Постменопауза'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userProfile.subscriptionTier === 'essential' && '✨ Essential'}
                    {userProfile.subscriptionTier === 'plus' && '👑 Plus'}
                    {userProfile.subscriptionTier === 'optimum' && '⭐ Optimum'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {userProfile.subscriptionTier === 'essential' && (
              <Button
                onClick={handleUpgrade}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Crown className="h-4 w-4 mr-2" />
                Улучшить план
              </Button>
            )}
          </div>
        </div>

        {/* Контент в зависимости от подписки */}
        {!canViewFullAnalysis ? (
          <PremiumTeaser 
            onUpgrade={handleUpgrade}
          />
        ) : (
          <>
            {/* Загрузка анализов */}
            {!labResults ? (
              <Card className="bg-gradient-to-br from-card/90 to-accent/5 backdrop-blur-sm border-primary/10 shadow-elegant rounded-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-playfair text-foreground flex items-center justify-center gap-2">
                    <Upload className="h-6 w-6 text-primary" />
                    Загрузите результаты анализов
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Поддерживаем форматы: PDF, JPG, PNG. Анализируем 40+ показателей.
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Базовые анализы (Plus):</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>• Витамины (D, B12, B9)</div>
                        <div>• Минералы (железо, магний)</div>
                        <div>• Омега-3 индекс</div>
                        <div>• Гормоны (эстрадиол, ФСГ, ЛГ)</div>
                        <div>• Щитовидная железа</div>
                      </div>
                    </div>
                    
                    {canViewAdvancedFeatures && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Расширенные (Optimum):</h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div>• Цинк, селен, CoQ10</div>
                          <div>• Витамины E, K, C</div>
                          <div>• Фолаты</div>
                          <div>• Гомоцистеин</div>
                          <div>• СРБ (воспаление)</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить анализы
                    </Button>
                    
                    <Button
                      onClick={handleLoadMockData}
                      variant="outline"
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Демо-данные
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Общая оценка */}
                <Card className="bg-gradient-to-br from-background via-primary/5 to-accent/10 border-primary/10 shadow-elegant rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Общая оценка вашего питания
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Общий балл</span>
                          <span className="text-2xl font-bold text-foreground">{getOverallScore()}/100</span>
                        </div>
                        <Progress value={getOverallScore()} className="h-3 mb-4" />
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getOverallScore() >= 80 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {getOverallScore() >= 80 
                                ? 'Отличное состояние питания' 
                                : 'Есть области для улучшения'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">{deficiencies.length}</div>
                        <div className="text-sm text-muted-foreground">Дефицитов</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">{supplementRecommendations.length}</div>
                        <div className="text-sm text-muted-foreground">Рекомендаций БАД</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Дефициты */}
                {deficiencies.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-playfair font-semibold text-foreground">
                        Обнаруженные дефициты
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        {deficiencies.length} найдено
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {deficiencies.map((deficiency, index) => (
                        <DeficiencyCard
                          key={index}
                          deficiency={deficiency}
                          onAddSupplement={handleAddSupplement}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Рекомендации БАД */}
                {supplementRecommendations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-playfair font-semibold text-foreground">
                        Рекомендации БАД
                      </h2>
                      <Badge variant="outline" className="text-xs">
                        {supplementRecommendations.length} рекомендаций
                      </Badge>
                    </div>
                    
                    <SupplementRecommendations
                      supplements={supplementRecommendations}
                      userProfile={userProfile}
                    />
                  </div>
                )}

                {/* Следующие шаги */}
                <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20 shadow-elegant rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-playfair text-foreground flex items-center gap-2">
                      <Zap className="h-5 w-5 text-secondary" />
                      Рекомендуемые действия
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                        <Brain className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Консультация врача</div>
                          <div className="text-xs text-muted-foreground">
                            Обсудите результаты с специалистом
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                        <Heart className="h-8 w-8 text-secondary" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Начать прием БАД</div>
                          <div className="text-xs text-muted-foreground">
                            Следуйте персональному плану
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-background/50 rounded-xl">
                        <Shield className="h-8 w-8 text-accent" />
                        <div>
                          <div className="font-medium text-foreground text-sm">Контрольные анализы</div>
                          <div className="text-xs text-muted-foreground">
                            Через 3 месяца
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default NutritionAnalysis;