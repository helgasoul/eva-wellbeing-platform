import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Smartphone, 
  Cloud, 
  FileText, 
  Activity,
  Heart,
  MapPin,
  Utensils,
  Calendar,
  Shield,
  Download,
  Settings,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { healthDataAggregator } from '@/services/healthDataAggregator';
import { wearableIntegration } from '@/services/wearableIntegration';
import { environmentalService } from '@/services/environmentalService';

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

export const DataSourcesDashboard: React.FC = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [dataStats, setDataStats] = useState<DataStats | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'connected' | 'issues'>('all');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadDataSources();
    loadDataStats();
  }, []);

  const loadDataSources = async () => {
    try {
      // Получаем данные устройств
      const devices = wearableIntegration.getConnectedDevices();
      const deviceStats = wearableIntegration.getDeviceStats();
      
      // Получаем статистику данных
      const healthStats = healthDataAggregator.getDataStats();
      
      const sources: DataSource[] = [
        // Носимые устройства
        ...devices.map(device => ({
          id: device.id,
          name: device.name,
          type: 'wearable' as const,
          status: device.isConnected ? 'connected' as const : 'disconnected' as const,
          lastSync: device.lastSync,
          dataCount: Math.floor(Math.random() * 100) + 50,
          quality: device.isConnected ? 'good' as const : 'poor' as const,
          icon: <Smartphone className="h-4 w-4" />,
          description: `${device.type} • ${device.brand}`,
          capabilities: device.capabilities
        })),
        
        // Ручной ввод симптомов
        {
          id: 'manual_symptoms',
          name: 'Дневник симптомов',
          type: 'manual',
          status: 'connected',
          lastSync: healthStats.lastEntry,
          dataCount: healthStats.symptomEntries,
          quality: healthStats.symptomEntries > 10 ? 'excellent' : 'good',
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
    }
  };

  const loadDataStats = () => {
    try {
      const stats = healthDataAggregator.getDataStats();
      
      // Рассчитываем полноту данных
      const maxPossibleEntries = 30; // За последние 30 дней
      const completeness = Math.min(100, (stats.totalEntries / maxPossibleEntries) * 100);
      
      setDataStats({
        ...stats,
        completeness
      });
    } catch (error) {
      console.error('Error loading data stats:', error);
    }
  };

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getQualityColor = (quality: DataSource['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'fair':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-red-600 bg-red-100';
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

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Имитация экспорта данных
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // В реальном приложении здесь был бы экспорт в JSON/CSV
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
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Источники данных
          </h2>
          <p className="text-muted-foreground mt-1">
            Управление и мониторинг всех источников ваших данных о здоровье
          </p>
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
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
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
                    <Button size="sm" variant="outline">
                      Подключить
                    </Button>
                  )}
                  {source.status === 'connected' && (
                    <Button size="sm" variant="outline">
                      Синхронизировать
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Качество данных по категориям
          </CardTitle>
          <CardDescription>
            Анализ полноты и качества данных по различным типам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Симптомы и самочувствие</span>
                <span className="text-sm text-muted-foreground">
                  {dataStats?.symptomEntries || 0} записей
                </span>
              </div>
              <Progress value={Math.min(100, ((dataStats?.symptomEntries || 0) / 30) * 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Питание и добавки</span>
                <span className="text-sm text-muted-foreground">
                  {dataStats?.nutritionEntries || 0} записей
                </span>
              </div>
              <Progress value={Math.min(100, ((dataStats?.nutritionEntries || 0) / 90) * 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Данные носимых устройств</span>
                <span className="text-sm text-muted-foreground">
                  {dataStats?.wearableEntries || 0} записей
                </span>
              </div>
              <Progress value={Math.min(100, ((dataStats?.wearableEntries || 0) / 30) * 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataSourcesDashboard;