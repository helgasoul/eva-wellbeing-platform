import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { performAIAnalysis, performEnvironmentalAnalysis } from '../../utils/aiAnalyzer';
import { environmentalService, EnvironmentalFactors } from '../../services/environmentalService';
import { analyzeEnvironmentalCorrelations, predictSymptomsByWeather, generateWeatherAlerts, EnvironmentalInsight, PredictionResult, WeatherAlert } from '../../utils/environmentalAnalyzer';
import EnvironmentalInsightsSection from '../../components/insights/EnvironmentalInsightsSection';
import SymptomForecastSection from '../../components/insights/SymptomForecastSection';
import LocationSettings from '../../components/insights/LocationSettings';
import { LabRecommendationWidget } from '../../components/lab/LabRecommendationWidget';
import { useToast } from '../../hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface HealthInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'prediction' | 'recommendation' | 'achievement';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionable: boolean;
  actions?: string[];
  confidence: number; // 0-100%
  trend?: 'improving' | 'stable' | 'declining';
  icon: string;
}

interface HealthScore {
  overall: number; // 0-100
  categories: {
    symptoms: number;
    sleep: number;
    mood: number;
    energy: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  weeklyChange: number;
}

interface SymptomTrend {
  symptom: string;
  current_week: number;
  previous_week: number;
  trend: 'improving' | 'worsening' | 'stable';
  pattern: string;
  recommendations: string[];
}

export default function PatientInsights() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [symptomTrends, setSymptomTrends] = useState<SymptomTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  
  // Новые состояния для экологических данных
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalFactors | null>(null);
  const [environmentalInsights, setEnvironmentalInsights] = useState<EnvironmentalInsight[]>([]);
  const [symptomForecast, setSymptomForecast] = useState<PredictionResult | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; city: string } | null>(null);
  const [isLoadingEnvironmental, setIsLoadingEnvironmental] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [user, selectedPeriod]);

  useEffect(() => {
    // Загружаем сохраненное местоположение
    const savedLocation = localStorage.getItem(`user_location_${user?.id}`);
    if (savedLocation) {
      const location = JSON.parse(savedLocation);
      setUserLocation(location);
      loadEnvironmentalData(location.lat, location.lon, location.city);
    }
  }, [user]);

  useEffect(() => {
    if (userLocation) {
      loadEnvironmentalData(userLocation.lat, userLocation.lon, userLocation.city);
    }
  }, [userLocation, selectedPeriod]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    try {
      // Получаем данные пользователя
      const onboardingData = JSON.parse(localStorage.getItem(`onboarding_${user?.id}`) || '{}');
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
      const chatHistory = JSON.parse(localStorage.getItem(`ai_chat_${user?.id}`) || '[]');

      // Анализируем данные
      const analysisResults = await analyzeUserData(onboardingData, symptomEntries, chatHistory);
      
      setHealthScore(analysisResults.healthScore);
      setInsights(analysisResults.insights);
      setSymptomTrends(analysisResults.trends);

      // Если есть экологические данные и местоположение, анализируем их
      if (userLocation && environmentalData) {
        await analyzeEnvironmentalData(symptomEntries);
      }
    } catch (error) {
      console.error('Ошибка генерации инсайтов:', error);
      toast({
        title: "Ошибка анализа",
        description: "Не удалось проанализировать данные. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnvironmentalData = async (lat: number, lon: number, city: string) => {
    setIsLoadingEnvironmental(true);
    try {
      // Получаем текущие данные и прогноз
      const [currentData, forecast] = await Promise.all([
        environmentalService.getCurrentEnvironmentalData(lat, lon, city),
        environmentalService.getWeatherForecast(lat, lon, 7)
      ]);

      setEnvironmentalData(currentData);

      // Анализируем экологические корреляции
      const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
      await analyzeEnvironmentalData(symptomEntries, [currentData]);

      // Создаем прогноз симптомов на основе погоды
      if (symptomEntries.length > 0) {
        const prediction = predictSymptomsByWeather(
          symptomEntries,
          [], // personalTriggers - можно добавить позже
          forecast.daily
        );
        setSymptomForecast(prediction);

        // Генерируем предупреждения
        const alerts = generateWeatherAlerts(
          currentData.weather.current,
          forecast.daily,
          [] // personalSensitivity - можно добавить позже
        );
        setWeatherAlerts(alerts);
      }

    } catch (error) {
      console.error('Ошибка загрузки экологических данных:', error);
      toast({
        title: "Ошибка погодных данных",
        description: "Не удалось загрузить данные о погоде. Проверьте подключение к интернету.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEnvironmental(false);
    }
  };

  const analyzeEnvironmentalData = async (symptoms: any[], envHistory: EnvironmentalFactors[] = []) => {
    try {
      // Получаем сохраненную историю экологических данных
      const savedHistory = localStorage.getItem(`environmental_history_${user?.id}`);
      const environmentalHistory = savedHistory ? JSON.parse(savedHistory) : envHistory;

      if (environmentalHistory.length > 0 && symptoms.length > 0) {
        const envInsights = analyzeEnvironmentalCorrelations(symptoms, environmentalHistory);
        setEnvironmentalInsights(envInsights);
      }
    } catch (error) {
      console.error('Ошибка анализа экологических данных:', error);
    }
  };

  const handleLocationUpdate = (location: { lat: number; lon: number; city: string }) => {
    setUserLocation(location);
    // Сохраняем местоположение
    localStorage.setItem(`user_location_${user?.id}`, JSON.stringify(location));
    
    toast({
      title: "Местоположение обновлено",
      description: `Установлен город: ${location.city}`,
    });
  };

  const getLastLabDate = () => {
    const labResults = JSON.parse(localStorage.getItem(`lab_results_${user?.id}`) || '[]');
    return labResults.length > 0 ? labResults[0].date : undefined;
  };

  const handleLocationError = (error: string) => {
    toast({
      title: "Ошибка местоположения",
      description: error,
      variant: "destructive"
    });
  };

  const analyzeUserData = async (onboarding: any, symptoms: any[], chat: any[]): Promise<any> => {
    // Имитация ИИ-анализа с реальной логикой
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = performAIAnalysis(onboarding, symptoms, chat, selectedPeriod);
        resolve(analysis);
      }, 1500);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Заголовок */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Назад в дашборд
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                🧠 Мои инсайты
              </h1>
              <p className="text-gray-600 mt-2">
                ИИ-анализ вашего здоровья и персональные рекомендации
              </p>
            </div>
            
            {/* Период анализа */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm">
              {(['week', 'month', 'quarter'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    selectedPeriod === period
                      ? "bg-purple-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Квартал'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Быстрые действия */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/patient/symptoms')}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center"
            >
              📊 Добавить симптомы
            </button>
            <button
              onClick={() => navigate('/patient/ai-chat')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center"
            >
              💬 Обсудить с ИИ
            </button>
            <button
              onClick={generateInsights}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center"
            >
              🔄 Обновить анализ
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            {/* Настройки местоположения */}
            {!userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-blue-800 mb-4">🌍 Настройка экологического анализа</h2>
                <p className="text-blue-700 mb-4">
                  Укажите ваше местоположение для получения персональных инсайтов на основе погодных условий и качества воздуха.
                </p>
                <LocationSettings
                  currentLocation={userLocation}
                  onLocationUpdate={handleLocationUpdate}
                  onError={handleLocationError}
                />
              </div>
            )}

            {/* Health Score Dashboard */}
            <HealthScoreDashboard score={healthScore} />
            
            {/* Lab Recommendation Widget */}
            {(() => {
              const symptomEntries = JSON.parse(localStorage.getItem(`symptom_entries_${user?.id}`) || '[]');
              const recentSymptoms = symptomEntries.slice(-7); // Последние 7 записей
              return symptomEntries.length > 5 ? (
                <LabRecommendationWidget 
                  symptoms={recentSymptoms}
                  lastLabDate={getLastLabDate()}
                />
              ) : null;
            })()}
            
            {/* Экологические факторы */}
            {userLocation && (
              <EnvironmentalInsightsSection
                environmentalData={environmentalData}
                insights={environmentalInsights}
                location={userLocation}
                isLoading={isLoadingEnvironmental}
              />
            )}

            {/* Прогноз симптомов */}
            {userLocation && (
              <SymptomForecastSection
                forecast={symptomForecast}
                weatherForecast={null} // Можно добавить позже
                alerts={weatherAlerts}
                onLocationUpdate={handleLocationUpdate}
                isLoading={isLoadingEnvironmental}
              />
            )}
            
            {/* Ключевые инсайты */}
            <KeyInsightsSection insights={insights} />
            
            {/* Тренды симптомов */}
            <SymptomTrendsSection trends={symptomTrends} />
            
            {/* Персональные рекомендации */}
            <PersonalizedRecommendations insights={insights} />

            {/* Настройки местоположения для существующих пользователей */}
            {userLocation && (
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Настройки анализа</h3>
                <LocationSettings
                  currentLocation={userLocation}
                  onLocationUpdate={handleLocationUpdate}
                  onError={handleLocationError}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент Health Score
const HealthScoreDashboard = ({ score }: { score: HealthScore | null }) => {
  if (!score) return null;

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (value: number) => {
    if (value >= 80) return 'from-green-400 to-green-600';
    if (value >= 60) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        ⚡ Health Score
        <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          ИИ-анализ
        </span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Общий скор */}
        <div className="relative">
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${score.overall * 2.51} 251`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="stop-purple-400" />
                    <stop offset="100%" className="stop-pink-600" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={cn("text-3xl font-bold", getScoreColor(score.overall))}>
                    {score.overall}
                  </div>
                  <div className="text-sm text-gray-500">из 100</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-lg font-semibold text-gray-800">
              Общее состояние
            </div>
            <div className={cn(
              "text-sm flex items-center justify-center mt-1",
              score.trend === 'improving' ? 'text-green-600' : 
              score.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
            )}>
              {score.trend === 'improving' ? '📈' : score.trend === 'declining' ? '📉' : '➡️'}
              {score.trend === 'improving' ? 'Улучшается' : 
               score.trend === 'declining' ? 'Ухудшается' : 'Стабильно'}
              {score.weeklyChange !== 0 && (
                <span className="ml-1">
                  ({score.weeklyChange > 0 ? '+' : ''}{score.weeklyChange})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Категории */}
        <div className="space-y-4">
          {Object.entries(score.categories).map(([category, value]) => {
            const categoryNames = {
              symptoms: 'Симптомы',
              sleep: 'Сон',
              mood: 'Настроение',
              energy: 'Энергия'
            };
            
            const categoryIcons = {
              symptoms: '🔥',
              sleep: '😴',
              mood: '😊',
              energy: '⚡'
            };

            return (
              <div key={category} className="flex items-center">
                <div className="w-12 text-center">
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <div className="flex-1 mx-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </span>
                    <span className={cn("text-sm font-bold", getScoreColor(value))}>
                      {value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn("h-2 rounded-full bg-gradient-to-r", getScoreGradient(value))}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Компонент ключевых инсайтов
const KeyInsightsSection = ({ insights }: { insights: HealthInsight[] }) => {
  const priorityInsights = insights.filter(i => i.priority === 'high').slice(0, 3);
  
  if (priorityInsights.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎯 Ключевые инсайты</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">
            Добавьте больше записей симптомов для получения персональных инсайтов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">🎯 Ключевые инсайты</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {priorityInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
};

// Карточка инсайта
const InsightCard = ({ insight }: { insight: HealthInsight }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-green-200 bg-green-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern': return '📈';
      case 'correlation': return '🔗';
      case 'prediction': return '🔮';
      case 'recommendation': return '💡';
      case 'achievement': return '🏆';
      default: return '📊';
    }
  };

  return (
    <div className={cn(
      "border-2 rounded-xl p-4 transition-all cursor-pointer hover:shadow-md",
      getPriorityColor(insight.priority)
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{insight.icon || getTypeIcon(insight.type)}</div>
        <div className="flex items-center bg-white rounded-full px-2 py-1">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">{insight.confidence}%</span>
        </div>
      </div>
      
      <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
      
      <p className={cn(
        "text-sm text-gray-600 mb-3",
        !expanded && "line-clamp-2"
      )}>
        {insight.description}
      </p>
      
      {insight.actionable && insight.actions && (
        <div className="space-y-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            {expanded ? 'Скрыть' : 'Показать'} рекомендации
          </button>
          
          {expanded && (
            <div className="space-y-1">
              {insight.actions.map((action, index) => (
                <div key={index} className="flex items-start text-xs text-gray-700">
                  <span className="text-purple-500 mr-1">•</span>
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Компонент трендов симптомов
const SymptomTrendsSection = ({ trends }: { trends: SymptomTrend[] }) => {
  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Тренды симптомов</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">
            Нужно больше данных для анализа трендов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">📈 Тренды симптомов</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trends.map((trend, index) => (
          <TrendCard key={index} trend={trend} />
        ))}
      </div>
    </div>
  );
};

const TrendCard = ({ trend }: { trend: SymptomTrend }) => {
  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'improving': return 'text-green-600 bg-green-50 border-green-200';
      case 'worsening': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'improving': return '📈';
      case 'worsening': return '📉';
      default: return '➡️';
    }
  };

  const getTrendText = (trendType: string) => {
    switch (trendType) {
      case 'improving': return 'Улучшается';
      case 'worsening': return 'Ухудшается';
      default: return 'Стабильно';
    }
  };

  return (
    <div className={cn(
      "border-2 rounded-xl p-4",
      getTrendColor(trend.trend)
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{trend.symptom}</h3>
        <div className="flex items-center">
          <span className="mr-1">{getTrendIcon(trend.trend)}</span>
          <span className="text-sm font-medium">{getTrendText(trend.trend)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="text-center">
          <div className="text-sm text-gray-600">Прошлая неделя</div>
          <div className="text-lg font-bold">{trend.previous_week}</div>
        </div>
        <div className="text-2xl">→</div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Эта неделя</div>
          <div className="text-lg font-bold">{trend.current_week}</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 mb-2">
        <strong>Паттерн:</strong> {trend.pattern}
      </div>
      
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-700">Рекомендации:</div>
        {trend.recommendations.slice(0, 2).map((rec, index) => (
          <div key={index} className="flex items-start text-xs text-gray-600">
            <span className="text-purple-500 mr-1">•</span>
            {rec}
          </div>
        ))}
      </div>
    </div>
  );
};

// Персональные рекомендации
const PersonalizedRecommendations = ({ insights }: { insights: HealthInsight[] }) => {
  const recommendationInsights = insights.filter(i => i.type === 'recommendation');
  
  if (recommendationInsights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">💡 Персональные рекомендации</h2>
      
      <div className="space-y-4">
        {recommendationInsights.map((insight) => (
          <div key={insight.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-2xl mr-3">{insight.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                {insight.actions && (
                  <div className="space-y-1">
                    {insight.actions.map((action, index) => (
                      <div key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-purple-500 mr-2">•</span>
                        {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading состояние
const LoadingState = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);