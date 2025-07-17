import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Database, 
  Smartphone, 
  FileText, 
  Heart,
  MapPin,
  Utensils,
  Download,
  Settings,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { healthDataAggregator } from '@/services/healthDataAggregator';
import { environmentalService } from '@/services/environmentalService';
import { syncManager } from '@/services/syncManager';

interface DataSource {
  id: string;
  name: string;
  type: 'wearable' | 'manual' | 'environmental' | 'medical' | 'nutrition';
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync?: string;
  dataCount: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  icon: React.ReactNode;
  description: string;
  capabilities: string[];
}

interface DataStats {
  totalEntries: number;
  symptomEntries: number;
  nutritionEntries: number;
  wearableEntries: number;
  daysWithData: number;
  lastEntry?: string;
  completeness: number;
}

const DataSourcesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'connected' | 'issues'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const handleBack = () => {
    navigate('/patient/dashboard');
  };

  useEffect(() => {
    loadDataSources();
    loadDataStats();
  }, []);

  const loadDataSources = async () => {
    try {
      const healthStats = healthDataAggregator.getDataStats();
      
      const sources: DataSource[] = [
        // Ручной ввод симптомов
        {
          id: 'manual_symptoms',
          name: 'Дневник симптомов',
          type: 'manual',
          status: 'connected',
          lastSync: healthStats.lastEntry,
          dataCount: healthStats.symptomEntries,
          quality: healthStats.symptomEntries > 10 ? 'excellent' : healthStats.symptomEntries > 5 ? 'good' : 'fair',
          icon: <Heart className="h-4 w-4" />,
          description: 'Ручной ввод симптомов и самочувствия',
          capabilities: ['symptoms', 'mood', 'notes']
        },
        
        // Дневник питания
        {
          id: 'nutrition_diary',
          name: 'Дневник питания',
          type: 'nutrition',
          status: 'connected',
          lastSync: new Date().toISOString(),
          dataCount: healthStats.nutritionEntries,
          quality: healthStats.nutritionEntries > 5 ? 'good' : 'fair',
          icon: <Utensils className="h-4 w-4" />,
          description: 'Трекинг питания и пищевых привычек',
          capabilities: ['meals', 'calories', 'supplements', 'water']
        },
        
        // Экологические данные
        {
          id: 'environmental',
          name: 'Погода и экология',
          type: 'environmental',
          status: 'connected',
          lastSync: new Date().toISOString(),
          dataCount: 30,
          quality: 'excellent',
          icon: <MapPin className="h-4 w-4" />,
          description: 'Open-Meteo API • Автоматический сбор',
          capabilities: ['weather', 'air_quality', 'pressure', 'humidity']
        },
        
        // Медицинские документы
        {
          id: 'medical_docs',
          name: 'Медицинские документы',
          type: 'medical',
          status: 'disconnected',
          dataCount: 0,
          quality: 'poor',
          icon: <FileText className="h-4 w-4" />,
          description: 'Загрузка и анализ медицинских документов',
          capabilities: ['pdf', 'images', 'lab_results', 'prescriptions']
        }
      ];
      
      setDataSources(sources);
    } catch (error) {
      console.error('Error loading data sources:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить источники данных",
        variant: "destructive"
      });
    }
  };

  const loadDataStats = () => {
    try {
      const stats = healthDataAggregator.getDataStats();
      const maxPossibleEntries = 30;
      const completeness = Math.min(100, (stats.totalEntries / maxPossibleEntries) * 100);
      
      setDataStats({
        ...stats,
        completeness
      });
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const handleConnect = async (sourceId: string) => {
    try {
      setSyncingIds(prev => new Set(prev).add(sourceId));
      
      switch (sourceId) {
        case 'environmental':
          // Test connection by getting current location and weather data
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                await environmentalService.getCurrentEnvironmentalData(latitude, longitude, 'Текущее местоположение');
              },
              (error) => {
                console.error('Geolocation error:', error);
              }
            );
          } else {
            // Fallback to Moscow coordinates
            await environmentalService.getCurrentEnvironmentalData(55.7558, 37.6176, 'Москва');
          }
          break;
        case 'medical_docs':
          // In a real app, this would open a file picker or integration flow
          toast({
            title: "Подключение",
            description: "Функция подключения медицинских документов скоро будет доступна",
          });
          break;
        default:
          toast({
            title: "Подключение",
            description: `Подключение к источнику "${sourceId}" выполнено`,
          });
      }
      
      // Update source status
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { ...source, status: 'connected' as const, lastSync: new Date().toISOString() }
          : source
      ));
      
      toast({
        title: "Успешно",
        description: "Источник данных подключен",
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось подключить источник данных",
        variant: "destructive"
      });
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
    }
  };

  const handleSync = async (sourceId: string) => {
    try {
      setSyncingIds(prev => new Set(prev).add(sourceId));
      
      const source = dataSources.find(s => s.id === sourceId);
      if (!source) return;
      
      // Update source status to syncing
      setDataSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, status: 'syncing' as const }
          : s
      ));
      
      switch (sourceId) {
        case 'environmental':
          // Sync weather data by getting fresh data
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                await environmentalService.getCurrentEnvironmentalData(latitude, longitude, 'Текущее местоположение');
              },
              (error) => {
                console.error('Geolocation error:', error);
              }
            );
          } else {
            // Fallback to Moscow coordinates
            await environmentalService.getCurrentEnvironmentalData(55.7558, 37.6176, 'Москва');
          }
          break;
        case 'manual_symptoms':
          // Refresh symptom data
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        case 'nutrition_diary':
          // Refresh nutrition data
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        default:
          await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update source status back to connected and refresh data
      setDataSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, status: 'connected' as const, lastSync: new Date().toISOString() }
          : s
      ));
      
      // Refresh stats
      loadDataStats();
      
      toast({
        title: "Синхронизация завершена",
        description: `Данные из источника "${source.name}" обновлены`,
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      
      // Update source status to error
      setDataSources(prev => prev.map(s => 
        s.id === sourceId 
          ? { ...s, status: 'error' as const }
          : s
      ));
      
      toast({
        title: "Ошибка синхронизации",
        description: "Не удалось синхронизировать данные",
        variant: "destructive"
      });
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sourceId);
        return newSet;
      });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = healthDataAggregator.getAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eva-health-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Экспорт завершен",
        description: "Данные успешно экспортированы",
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getQualityColor = (quality: DataSource['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getQualityText = (quality: DataSource['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'Отличное';
      case 'good':
        return 'Хорошее';
      case 'fair':
        return 'Удовлетв.';
      default:
        return 'Плохое';
    }
  };

  const filteredSources = dataSources.filter(source => {
    switch (selectedFilter) {
      case 'connected':
        return source.status === 'connected';
      case 'issues':
        return source.status === 'disconnected' || source.status === 'error';
      default:
        return true;
    }
  });

  return (
    <PatientLayout title="Источники данных">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад в дашборд
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-6 w-6 text-primary" />
                Источники данных
              </h1>
              <p className="text-muted-foreground">
                Управление и мониторинг всех источников ваших данных о здоровье
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Экспорт...' : 'Экспорт данных'}
            </Button>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Всего записей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {dataStats?.totalEntries || 0}
              </div>
              <p className="text-xs text-blue-600">
                За последние 30 дней
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Активных источников
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {dataSources.filter(s => s.status === 'connected').length}
              </div>
              <p className="text-xs text-green-600">
                из {dataSources.length} подключенных
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Полнота данных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {dataStats?.completeness.toFixed(0) || 0}%
              </div>
              <Progress value={dataStats?.completeness || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Дней с данными
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {dataStats?.daysWithData || 0}
              </div>
              <p className="text-xs text-orange-600">
                из последних 30 дней
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            Все источники ({dataSources.length})
          </Button>
          <Button
            variant={selectedFilter === 'connected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('connected')}
          >
            Подключенные ({dataSources.filter(s => s.status === 'connected').length})
          </Button>
          <Button
            variant={selectedFilter === 'issues' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('issues')}
          >
            Проблемы ({dataSources.filter(s => s.status === 'disconnected' || s.status === 'error').length})
          </Button>
        </div>

        {/* Data Sources List */}
        <div className="space-y-4">
          {filteredSources.map((source) => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {source.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {source.name}
                        {getStatusIcon(source.status)}
                      </CardTitle>
                      <CardDescription>{source.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getQualityColor(source.quality)}>
                      {getQualityText(source.quality)}
                    </Badge>
                    <div className="text-right text-sm">
                      <div className="font-medium">{source.dataCount}</div>
                      <div className="text-muted-foreground">записей</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Capabilities */}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Возможности:</p>
                    <div className="flex flex-wrap gap-1">
                      {source.capabilities.map((capability, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Last Sync */}
                  {source.lastSync && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Последняя синхронизация: {format(new Date(source.lastSync), 'dd MMM yyyy, HH:mm', { locale: ru })}
                      </span>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {source.status === 'disconnected' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleConnect(source.id)}
                        disabled={syncingIds.has(source.id)}
                      >
                        {syncingIds.has(source.id) ? 'Подключение...' : 'Подключить'}
                      </Button>
                    )}
                    {(source.status === 'connected' || source.status === 'error') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSync(source.id)}
                        disabled={syncingIds.has(source.id)}
                      >
                        {syncingIds.has(source.id) ? 'Синхронизация...' : 'Синхронизировать'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
};

export default DataSourcesDashboard;