import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';

export default function AdminReports() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📊 Отчеты</h1>
            <p className="text-muted-foreground">Системные отчеты и аналитика</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Экспорт отчетов
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Системные отчеты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Отчеты системы</h3>
              <p className="text-muted-foreground mb-6">
                Здесь будут доступны различные отчеты о работе системы
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  🔄 Система отчетности находится в разработке.
                  Скоро здесь появятся финансовые отчеты, отчеты по пользователям и аналитика производительности.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}