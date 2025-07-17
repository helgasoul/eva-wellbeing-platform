import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Filter } from 'lucide-react';

export default function AdminUsers() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">👥 Управление пользователями</h1>
            <p className="text-muted-foreground">Система управления пользователями платформы Bloom</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить пользователя
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Всего пользователей</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">2,847</p>
              <p className="text-sm text-muted-foreground">+12% за месяц</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Пациентки</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">2,543</p>
              <p className="text-sm text-muted-foreground">89% от общего числа</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Врачи</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">247</p>
              <p className="text-sm text-muted-foreground">8.7% от общего числа</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Эксперты</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">57</p>
              <p className="text-sm text-muted-foreground">2% от общего числа</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Управление пользователями</h3>
              <p className="text-muted-foreground mb-6">
                Здесь будет таблица со всеми пользователями системы
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">
                  🔄 Функционал управления пользователями находится в разработке.
                  Скоро здесь появится возможность просмотра, редактирования,
                  блокировки пользователей и управления их ролями.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}