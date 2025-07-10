import React, { useState } from 'react';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Globe,
  Moon,
  Sun
} from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    symptoms: true,
    cycle: true,
    appointments: true,
    community: false
  });

  const handleSave = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши изменения успешно применены.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Экспорт данных",
      description: "Ваши данные будут отправлены на email в течение 24 часов.",
    });
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Настройки</h1>
          <p className="text-muted-foreground">
            Управляйте своим профилем и предпочтениями
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Профиль
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input id="name" placeholder="Ваше имя" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" placeholder="+7 (999) 123-45-67" />
              </div>
              <Button onClick={handleSave}>Сохранить изменения</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Напоминания о симптомах</Label>
                  <p className="text-sm text-muted-foreground">
                    Получать напоминания о записи симптомов
                  </p>
                </div>
                <Switch 
                  checked={notifications.symptoms}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, symptoms: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Уведомления о цикле</Label>
                  <p className="text-sm text-muted-foreground">
                    Прогнозы и важные даты цикла
                  </p>
                </div>
                <Switch 
                  checked={notifications.cycle}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, cycle: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Напоминания о встречах</Label>
                  <p className="text-sm text-muted-foreground">
                    Уведомления о консультациях и анализах
                  </p>
                </div>
                <Switch 
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, appointments: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Активность сообщества</Label>
                  <p className="text-sm text-muted-foreground">
                    Новые сообщения и ответы в группах
                  </p>
                </div>
                <Switch 
                  checked={notifications.community}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, community: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Внешний вид
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Темная тема</Label>
                  <p className="text-sm text-muted-foreground">
                    Использовать темное оформление интерфейса
                  </p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Приватность и безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={handleExportData} className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Экспортировать мои данные
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Изменить пароль
              </Button>
              
              <Separator />
              
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить аккаунт
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  );
};

export default Settings;