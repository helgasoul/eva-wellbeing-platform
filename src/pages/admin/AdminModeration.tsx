import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, Filter } from 'lucide-react';

export default function AdminModeration() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🛡️ Модерация контента</h1>
            <p className="text-muted-foreground">Управление и модерация пользовательского контента</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
            <Button>
              <Shield className="w-4 h-4 mr-2" />
              Настройки модерации
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">На модерации</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">23</p>
              <p className="text-sm text-muted-foreground">требуют проверки</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Одобрено сегодня</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">47</p>
              <p className="text-sm text-muted-foreground">публикаций</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Заблокировано</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">8</p>
              <p className="text-sm text-muted-foreground">нарушений</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Очередь модерации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Модерация контента</h3>
              <p className="text-muted-foreground mb-6">
                Здесь будет очередь контента, требующего модерации
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800">
                  🔄 Система модерации находится в разработке.
                  Скоро здесь появится автоматическая и ручная модерация
                  публикаций, комментариев и профилей пользователей.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}