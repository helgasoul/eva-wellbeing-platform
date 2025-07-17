import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Star, Download, ExternalLink } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  rating: number;
  downloadCount: number;
  type: 'article' | 'guideline' | 'research' | 'protocol';
  tags: string[];
}

const mockKnowledge: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Клинические рекомендации по лечению СПКЯ',
    category: 'Гинекология',
    description: 'Современные подходы к диагностике и лечению синдрома поликистозных яичников',
    rating: 4.8,
    downloadCount: 1250,
    type: 'guideline',
    tags: ['СПКЯ', 'Гормоны', 'Диагностика']
  },
  {
    id: '2',
    title: 'Менопауза: обновленные протоколы 2024',
    category: 'Эндокринология',
    description: 'Новые международные рекомендации по ведению женщин в период менопаузы',
    rating: 4.9,
    downloadCount: 890,
    type: 'protocol',
    tags: ['Менопауза', 'ГЗТ', 'Профилактика']
  },
  {
    id: '3',
    title: 'Исследование: питание и женское здоровье',
    category: 'Нутрициология',
    description: 'Влияние различных типов питания на репродуктивное здоровье женщин',
    rating: 4.6,
    downloadCount: 567,
    type: 'research',
    tags: ['Питание', 'Исследование', 'Репродукция']
  }
];

export default function DoctorKnowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredKnowledge = mockKnowledge.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guideline':
        return '📋';
      case 'protocol':
        return '📝';
      case 'research':
        return '🔬';
      case 'article':
        return '📄';
      default:
        return '📖';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'guideline':
        return <Badge variant="default">Руководство</Badge>;
      case 'protocol':
        return <Badge variant="secondary">Протокол</Badge>;
      case 'research':
        return <Badge variant="outline">Исследование</Badge>;
      case 'article':
        return <Badge variant="destructive">Статья</Badge>;
      default:
        return <Badge>Материал</Badge>;
    }
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">База знаний</h1>
            <p className="text-muted-foreground">Клинические рекомендации и исследования</p>
          </div>
          <Button>
            <ExternalLink className="w-4 h-4 mr-2" />
            Внешние ресурсы
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск в базе знаний..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredKnowledge.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                      {getTypeBadge(item.type)}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 text-muted-foreground mr-1" />
                        <span className="text-sm text-muted-foreground">{item.downloadCount}</span>
                      </div>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button size="sm">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Открыть
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Скачать
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKnowledge.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Материалы не найдены</h3>
              <p className="text-muted-foreground">
                Попробуйте изменить поисковый запрос
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
}