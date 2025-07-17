import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Users } from 'lucide-react';

export default function DoctorSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔍 Поиск пациенток</h1>
            <p className="text-muted-foreground">Расширенный поиск и фильтрация пациенток</p>
          </div>
          <Button>
            <Filter className="w-4 h-4 mr-2" />
            Настроить фильтры
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по имени, диагнозу, симптомам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Поиск пациенток</h3>
              <p className="text-muted-foreground mb-6">
                Используйте поиск выше для поиска пациенток по различным критериям
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🔄 Функционал расширенного поиска находится в разработке. 
                  Скоро здесь появится возможность поиска по симптомам, диагнозам, 
                  лабораторным показателям и многому другому.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}