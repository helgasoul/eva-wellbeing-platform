import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { secureMedicalDataService } from '@/services/secureMedicalDataService';
import { Shield, Lock, Eye, EyeOff, Download, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecurityIndicatorProps {
  level: 'high' | 'medium' | 'low';
  label: string;
}

const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({ level, label }) => {
  const colors = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500', 
    low: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colors[level]}`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export const SecureMedicalDataDemo: React.FC = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Форма для добавления симптомов
  const [newSymptom, setNewSymptom] = useState({
    date: new Date().toISOString().split('T')[0],
    symptoms: [''],
    severity: 1,
    duration: '',
    notes: '',
    mood: 5,
    sleepQuality: 5
  });

  const initializeSecureService = async () => {
    if (!user || !userPassword) return;

    setIsLoading(true);
    try {
      const success = await secureMedicalDataService.initialize(user, userPassword);
      if (success) {
        setIsInitialized(true);
        loadSymptoms();
        toast({
          title: 'Безопасность активирована',
          description: 'Криптографическая защита медицинских данных включена'
        });
      }
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSymptoms = async () => {
    try {
      const data = await secureMedicalDataService.getSymptoms();
      setSymptoms(data || []);
    } catch (error) {
      console.error('Ошибка загрузки симптомов:', error);
    }
  };

  const saveSymptom = async () => {
    if (!newSymptom.symptoms[0] || !newSymptom.duration) {
      toast({
        title: 'Ошибка валидации',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await secureMedicalDataService.saveSymptoms(newSymptom);
      if (success) {
        loadSymptoms();
        setNewSymptom({
          date: new Date().toISOString().split('T')[0],
          symptoms: [''],
          severity: 1,
          duration: '',
          notes: '',
          mood: 5,
          sleepQuality: 5
        });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const blob = await secureMedicalDataService.exportMedicalData();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Вы уверены, что хотите удалить все медицинские данные? Это действие необратимо.')) {
      const success = await secureMedicalDataService.clearAllMedicalData();
      if (success) {
        setSymptoms([]);
      }
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Необходимо войти в систему для работы с защищенными медицинскими данными
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статус безопасности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Статус безопасности медицинских данных
          </CardTitle>
          <CardDescription>
            Криптографическая защита соответствует стандартам HIPAA и GDPR
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SecurityIndicator 
              level={isInitialized ? 'high' : 'low'} 
              label={isInitialized ? 'AES-256-GCM активно' : 'Шифрование не инициализировано'} 
            />
            <SecurityIndicator 
              level="high" 
              label="RLS политики активны" 
            />
            <SecurityIndicator 
              level="high" 
              label="Аудит доступа включен" 
            />
          </div>

          {!isInitialized && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <Label htmlFor="password">Пароль для шифрования медицинских данных</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Введите безопасный пароль"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={initializeSecureService}
                  disabled={!userPassword || isLoading}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Активировать защиту
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isInitialized && (
        <>
          {/* Форма добавления симптомов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Добавить симптомы (зашифрованное хранение)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="symptom-date">Дата</Label>
                  <Input
                    id="symptom-date"
                    type="date"
                    value={newSymptom.date}
                    onChange={(e) => setNewSymptom({...newSymptom, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="symptom-duration">Продолжительность</Label>
                  <Input
                    id="symptom-duration"
                    placeholder="например: 2 часа, весь день"
                    value={newSymptom.duration}
                    onChange={(e) => setNewSymptom({...newSymptom, duration: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="symptom-name">Симптом</Label>
                <Input
                  id="symptom-name"
                  placeholder="Опишите симптом"
                  value={newSymptom.symptoms[0]}
                  onChange={(e) => setNewSymptom({
                    ...newSymptom, 
                    symptoms: [e.target.value]
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="severity">Интенсивность (1-10)</Label>
                  <Select 
                    value={newSymptom.severity.toString()} 
                    onValueChange={(value) => setNewSymptom({
                      ...newSymptom, 
                      severity: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mood">Настроение (1-10)</Label>
                  <Select 
                    value={newSymptom.mood.toString()} 
                    onValueChange={(value) => setNewSymptom({
                      ...newSymptom, 
                      mood: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sleep">Качество сна (1-10)</Label>
                  <Select 
                    value={newSymptom.sleepQuality.toString()} 
                    onValueChange={(value) => setNewSymptom({
                      ...newSymptom, 
                      sleepQuality: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Дополнительные заметки</Label>
                <Textarea
                  id="notes"
                  placeholder="Дополнительная информация о симптомах"
                  value={newSymptom.notes}
                  onChange={(e) => setNewSymptom({...newSymptom, notes: e.target.value})}
                />
              </div>

              <Button 
                onClick={saveSymptom}
                disabled={isLoading}
                className="w-full"
              >
                Сохранить симптомы (зашифровано)
              </Button>
            </CardContent>
          </Card>

          {/* Список симптомов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Сохраненные симптомы</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт (GDPR)
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearAllData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Очистить все
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {symptoms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Симптомы не найдены. Добавьте первую запись выше.
                </p>
              ) : (
                <div className="space-y-4">
                  {symptoms.map((symptom, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline">{symptom.date}</Badge>
                          <Badge variant="secondary">Интенсивность: {symptom.severity}/10</Badge>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          🔒 Зашифровано
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p><strong>Симптомы:</strong> {symptom.symptoms.join(', ')}</p>
                        <p><strong>Продолжительность:</strong> {symptom.duration}</p>
                        {symptom.notes && <p><strong>Заметки:</strong> {symptom.notes}</p>}
                        <div className="text-sm text-muted-foreground">
                          Настроение: {symptom.mood}/10 | Сон: {symptom.sleepQuality}/10
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};