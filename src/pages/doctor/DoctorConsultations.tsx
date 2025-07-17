import React from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, Plus, Filter } from 'lucide-react';

export default function DoctorConsultations() {
  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">💬 Консультации</h1>
            <p className="text-muted-foreground">Управление консультациями и приемами</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Новая консультация
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Сегодня</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">5</p>
              <p className="text-sm text-muted-foreground">консультаций</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">На неделе</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">23</p>
              <p className="text-sm text-muted-foreground">консультаций</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Онлайн</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">12</p>
              <p className="text-sm text-muted-foreground">из 23</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ближайшие консультации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Консультации</h3>
              <p className="text-muted-foreground mb-4">
                Здесь будет список ваших консультаций и записей на прием
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🔄 Система управления консультациями находится в разработке.
                  Скоро здесь появится возможность видеозвонков, записи на прием,
                  интеграция с календарем и автоматические напоминания.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
}