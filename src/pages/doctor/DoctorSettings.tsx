import React from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Bell, Lock, Save } from 'lucide-react';

export default function DoctorSettings() {
  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">⚙️ Настройки</h1>
            <p className="text-muted-foreground">Настройки профиля и системы</p>
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
                <User className="w-5 h-5 mr-2" />
                Профиль врача
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Полное имя</Label>
                  <Input id="fullName" placeholder="Введите ваше полное имя" />
                </div>
                <div>
                  <Label htmlFor="specialization">Специализация</Label>
                  <Input id="specialization" placeholder="Гинеколог-эндокринолог" />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="experience">Опыт работы (лет)</Label>
                  <Input id="experience" type="number" placeholder="10" />
                </div>
                <div>
                  <Label htmlFor="consultationFee">Стоимость консультации (₽)</Label>
                  <Input id="consultationFee" type="number" placeholder="5000" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Новые записи на прием</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомления о новых записях</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Сообщения от пациенток</Label>
                  <p className="text-sm text-muted-foreground">Уведомления о новых сообщениях</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Текущий пароль</Label>
                <Input id="currentPassword" type="password" placeholder="Введите текущий пароль" />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input id="newPassword" type="password" placeholder="Введите новый пароль" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input id="confirmPassword" type="password" placeholder="Подтвердите новый пароль" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              🔄 Расширенные настройки профиля находятся в разработке.
              Скоро здесь появятся дополнительные опции персонализации,
              интеграции с внешними системами и расширенные настройки безопасности.
            </p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}