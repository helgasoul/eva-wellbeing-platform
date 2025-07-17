import React, { useState } from 'react';
import { DoctorLayout } from '@/components/layout/DoctorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Calendar, Shield, CreditCard, Settings } from 'lucide-react';

export default function DoctorSettings() {
  const [profile, setProfile] = useState({
    fullName: 'Доктор Иванова Анна Сергеевна',
    specialization: 'Гинеколог-эндокринолог',
    experience: '12',
    license: 'МЗ РФ №123456',
    phone: '+7 (999) 123-45-67',
    email: 'ivanova@example.com',
    bio: 'Специалист по женскому здоровью с 12-летним опытом работы.',
    consultationFee: '3000',
    isAvailable: true
  });

  const [notifications, setNotifications] = useState({
    newPatients: true,
    appointments: true,
    messages: true,
    reports: false
  });

  const [schedule, setSchedule] = useState({
    mondayStart: '09:00',
    mondayEnd: '18:00',
    tuesdayStart: '09:00',
    tuesdayEnd: '18:00',
    consultationDuration: '30'
  });

  const handleSave = () => {
    // Здесь будет логика сохранения
    console.log('Настройки сохранены');
  };

  return (
    <DoctorLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Настройки</h1>
          <p className="text-muted-foreground">Управление вашим профилем и предпочтениями</p>
        </div>

        <div className="space-y-6">
          {/* Профиль */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Профиль врача
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Полное имя</Label>
                  <Input
                    id="fullName"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Специализация</Label>
                  <Input
                    id="specialization"
                    value={profile.specialization}
                    onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Опыт работы (лет)</Label>
                  <Input
                    id="experience"
                    value={profile.experience}
                    onChange={(e) => setProfile({...profile, experience: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="license">Номер лицензии</Label>
                  <Input
                    id="license"
                    value={profile.license}
                    onChange={(e) => setProfile({...profile, license: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">О враче</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-4">
                <div>
                  <Label htmlFor="consultationFee">Стоимость консультации (₽)</Label>
                  <Input
                    id="consultationFee"
                    value={profile.consultationFee}
                    onChange={(e) => setProfile({...profile, consultationFee: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={profile.isAvailable}
                    onCheckedChange={(checked) => setProfile({...profile, isAvailable: checked})}
                  />
                  <Label htmlFor="isAvailable">Доступен для консультаций</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Уведомления */}
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
                  <Label>Новые пациенты</Label>
                  <p className="text-sm text-muted-foreground">Уведомления о новых заявках</p>
                </div>
                <Switch
                  checked={notifications.newPatients}
                  onCheckedChange={(checked) => setNotifications({...notifications, newPatients: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Записи на прием</Label>
                  <p className="text-sm text-muted-foreground">Напоминания о консультациях</p>
                </div>
                <Switch
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => setNotifications({...notifications, appointments: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Сообщения</Label>
                  <p className="text-sm text-muted-foreground">Новые сообщения от пациентов</p>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications({...notifications, messages: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Отчеты</Label>
                  <p className="text-sm text-muted-foreground">Еженедельные отчеты по практике</p>
                </div>
                <Switch
                  checked={notifications.reports}
                  onCheckedChange={(checked) => setNotifications({...notifications, reports: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Расписание */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Расписание работы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Понедельник (начало)</Label>
                  <Input
                    type="time"
                    value={schedule.mondayStart}
                    onChange={(e) => setSchedule({...schedule, mondayStart: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Понедельник (конец)</Label>
                  <Input
                    type="time"
                    value={schedule.mondayEnd}
                    onChange={(e) => setSchedule({...schedule, mondayEnd: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Длительность консультации (мин)</Label>
                  <Select value={schedule.consultationDuration} onValueChange={(value) => setSchedule({...schedule, consultationDuration: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 минут</SelectItem>
                      <SelectItem value="30">30 минут</SelectItem>
                      <SelectItem value="45">45 минут</SelectItem>
                      <SelectItem value="60">60 минут</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Settings className="w-4 h-4 mr-2" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}