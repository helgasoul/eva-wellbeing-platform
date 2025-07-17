import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, AlertTriangle, Eye } from 'lucide-react';

export default function AdminSecurity() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🔒 Безопасность</h1>
            <p className="text-muted-foreground">Мониторинг безопасности и управление угрозами</p>
          </div>
          <Button>
            <Shield className="w-4 h-4 mr-2" />
            Настройки безопасности
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Статус системы</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">Защищена</p>
              <p className="text-sm text-muted-foreground">Все системы в норме</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Угрозы</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">3</p>
              <p className="text-sm text-muted-foreground">за последние 24 часа</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Заблокировано IP</h3>
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">47</p>
              <p className="text-sm text-muted-foreground">активных блокировок</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Мониторинг</h3>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">Активен</p>
              <p className="text-sm text-muted-foreground">24/7 наблюдение</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Последние угрозы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Брутфорс атака</p>
                    <p className="text-sm text-muted-foreground">IP: 192.168.1.1</p>
                  </div>
                  <span className="text-xs text-orange-600">2 часа назад</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Подозрительная активность</p>
                    <p className="text-sm text-muted-foreground">Множественные попытки входа</p>
                  </div>
                  <span className="text-xs text-orange-600">5 часов назад</span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SQL инъекция</p>
                    <p className="text-sm text-muted-foreground">Заблокировано автоматически</p>
                  </div>
                  <span className="text-xs text-red-600">8 часов назад</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Настройки безопасности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Настроить firewall
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Управление SSL сертификатами
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Настроить мониторинг
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Политики безопасности
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Системы безопасности</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                🔄 Расширенные системы безопасности находятся в разработке.
                Скоро здесь появится комплексный мониторинг угроз,
                автоматическое реагирование на инциденты и детальная аналитика безопасности.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}