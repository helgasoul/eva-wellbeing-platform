import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Database, Mail, Shield, Save } from 'lucide-react';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">⚙️ Настройки системы</h1>
            <p className="text-muted-foreground">Глобальные настройки платформы Bloom</p>
          </div>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Сохранить изменения
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Общие настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="siteName">Название сайта</Label>
                  <Input id="siteName" defaultValue="Bloom - Женское здоровье" />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Email поддержки</Label>
                  <Input id="supportEmail" defaultValue="support@bloom.ru" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Режим обслуживания</Label>
                  <p className="text-sm text-muted-foreground">Временно отключить доступ к сайту</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email настройки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smtpHost">SMTP хост</Label>
                  <Input id="smtpHost" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP порт</Label>
                  <Input id="smtpPort" placeholder="587" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Отправка уведомлений</Label>
                  <p className="text-sm text-muted-foreground">Разрешить отправку email уведомлений</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Обязательная 2FA для админов</Label>
                  <p className="text-sm text-muted-foreground">Требовать двухфакторную аутентификацию</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Логирование действий</Label>
                  <p className="text-sm text-muted-foreground">Записывать все административные действия</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="sessionTimeout">Таймаут сессии (минуты)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                База данных
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Автоматическое резервное копирование</Label>
                  <p className="text-sm text-muted-foreground">Ежедневное создание резервных копий</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div>
                <Label htmlFor="backupRetention">Хранить резервные копии (дней)</Label>
                <Input id="backupRetention" type="number" defaultValue="30" />
              </div>
              
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Создать резервную копию
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-800">
              🔄 Расширенные системные настройки находятся в разработке.
              Скоро здесь появятся дополнительные опции конфигурации,
              интеграции с внешними сервисами и расширенные настройки безопасности.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}