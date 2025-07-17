import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, UserPlus } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  email: string;
  age: number;
  riskFactors: string[];
  lastActive: string;
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    name: 'Анна Новикова',
    email: 'anna.novikova@example.com',
    age: 34,
    riskFactors: ['Семейная история', 'Гормональная терапия'],
    lastActive: '2024-01-15'
  },
  {
    id: '2',
    name: 'София Козлова',
    email: 'sofia.kozlova@example.com', 
    age: 29,
    riskFactors: ['Стресс', 'Нерегулярный цикл'],
    lastActive: '2024-01-14'
  }
];

export default function DoctorSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Симуляция поиска
    setTimeout(() => {
      setResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Поиск пациенток</h1>
          <p className="text-muted-foreground">Найдите новых пациенток для консультации</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Критерии поиска
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Поиск по имени или email</label>
                <Input
                  placeholder="Введите имя или email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Возрастная группа</label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите возраст" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 лет</SelectItem>
                    <SelectItem value="26-35">26-35 лет</SelectItem>
                    <SelectItem value="36-45">36-45 лет</SelectItem>
                    <SelectItem value="46-55">46-55 лет</SelectItem>
                    <SelectItem value="55+">55+ лет</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Уровень риска</label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите риск" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Низкий</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="high">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleSearch} disabled={isSearching} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? 'Поиск...' : 'Найти пациенток'}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Результаты поиска ({results.length})</h2>
            
            {results.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{result.name}</h3>
                      <p className="text-sm text-muted-foreground">{result.email}</p>
                      <p className="text-sm text-muted-foreground">Возраст: {result.age} лет</p>
                      <div className="flex flex-wrap gap-2">
                        {result.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="secondary">{factor}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Последняя активность: {new Date(result.lastActive).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        Просмотр профиля
                      </Button>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Пригласить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {results.length === 0 && !isSearching && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Начните поиск</h3>
              <p className="text-muted-foreground">
                Используйте фильтры выше для поиска пациенток
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
}