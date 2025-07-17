import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Filter, Download } from 'lucide-react';

export default function AdminLogs() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📋 Логи системы</h1>
            <p className="text-muted-foreground">Системные логи и журналы событий</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Экспорт логов
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Журнал событий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Системные логи</h3>
              <p className="text-muted-foreground mb-6">
                Здесь будет отображаться журнал всех системных событий
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800">
                  🔄 Система логирования находится в разработке.
                  Скоро здесь появится детальный журнал событий с возможностью поиска и фильтрации.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}