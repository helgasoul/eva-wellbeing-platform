import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PushNotificationService } from '@/services/pushNotificationService';
import { Bell, BellOff, TestTube, Settings } from 'lucide-react';

interface NotificationPreferences {
  daily_insights_enabled: boolean;
  push_notifications_enabled: boolean;
  email_notifications_enabled: boolean;
  notification_time: string;
  timezone: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  weekend_notifications: boolean;
}

export const PushNotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    daily_insights_enabled: true,
    push_notifications_enabled: true,
    email_notifications_enabled: false,
    notification_time: '09:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    weekend_notifications: true,
  });
  
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const pushService = PushNotificationService.getInstance();

  useEffect(() => {
    initializeNotifications();
    loadPreferences();
  }, []);

  const initializeNotifications = async () => {
    try {
      await pushService.initialize();
      const permission = await pushService.getPermissionStatus();
      setPermissionStatus(permission);
      
      const subscription = await pushService.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          daily_insights_enabled: data.daily_insights_enabled,
          push_notifications_enabled: data.push_notifications_enabled,
          email_notifications_enabled: data.email_notifications_enabled,
          notification_time: data.notification_time,
          timezone: data.timezone,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          weekend_notifications: data.weekend_notifications,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Ошибка",
          description: "Необходимо авторизоваться",
          variant: "destructive"
        });
        return;
      }

      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
      
      toast({
        title: "Сохранено",
        description: "Настройки уведомлений обновлены"
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      await pushService.subscribe();
      setIsSubscribed(true);
      setPermissionStatus('granted');
      
      // Also enable push notifications in preferences
      await savePreferences({ push_notifications_enabled: true });
      
      toast({
        title: "Подписка оформлена",
        description: "Push-уведомления включены"
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast({
        title: "Ошибка подписки",
        description: error instanceof Error ? error.message : "Не удалось подписаться на уведомления",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      await pushService.unsubscribe();
      setIsSubscribed(false);
      
      // Also disable push notifications in preferences
      await savePreferences({ push_notifications_enabled: false });
      
      toast({
        title: "Подписка отменена",
        description: "Push-уведомления отключены"
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отписаться от уведомлений",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await pushService.testNotification();
      toast({
        title: "Тест отправлен",
        description: "Проверьте тестовое уведомление"
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({
        title: "Ошибка теста",
        description: error instanceof Error ? error.message : "Не удалось отправить тестовое уведомление",
        variant: "destructive"
      });
    }
  };

  const timezones = [
    'UTC',
    'Europe/Moscow',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push-уведомления
          </CardTitle>
          <CardDescription>
            Получайте мгновенные уведомления о новых инсайтах и рекомендациях
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Статус подписки</Label>
              <div className="text-sm text-muted-foreground">
                {isSubscribed ? 'Подписка активна' : 'Не подписан'}
              </div>
            </div>
            <div className="flex gap-2">
              {isSubscribed ? (
                <Button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Отписаться
                </Button>
              ) : (
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading || permissionStatus === 'denied'}
                  size="sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Подписаться
                </Button>
              )}
              {isSubscribed && (
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  size="sm"
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  Тест
                </Button>
              )}
            </div>
          </div>

          {permissionStatus === 'denied' && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              Уведомления заблокированы в браузере. Разрешите уведомления в настройках браузера.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки уведомлений
          </CardTitle>
          <CardDescription>
            Настройте, когда и какие уведомления получать
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ежедневные инсайты</Label>
                <div className="text-sm text-muted-foreground">
                  Получать уведомления о новых анализах здоровья
                </div>
              </div>
              <Switch
                checked={preferences.daily_insights_enabled}
                onCheckedChange={(checked) =>
                  savePreferences({ daily_insights_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push-уведомления</Label>
                <div className="text-sm text-muted-foreground">
                  Мгновенные уведомления в браузере
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications_enabled}
                onCheckedChange={(checked) =>
                  savePreferences({ push_notifications_enabled: checked })
                }
                disabled={!isSubscribed}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email-уведомления</Label>
                <div className="text-sm text-muted-foreground">
                  Дублировать уведомления на email
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications_enabled}
                onCheckedChange={(checked) =>
                  savePreferences({ email_notifications_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Уведомления в выходные</Label>
                <div className="text-sm text-muted-foreground">
                  Получать уведомления в субботу и воскресенье
                </div>
              </div>
              <Switch
                checked={preferences.weekend_notifications}
                onCheckedChange={(checked) =>
                  savePreferences({ weekend_notifications: checked })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Время уведомлений</Label>
              <Input
                type="time"
                value={preferences.notification_time}
                onChange={(e) =>
                  savePreferences({ notification_time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Часовой пояс</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) =>
                  savePreferences({ timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Тихие часы (начало)</Label>
              <Input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) =>
                  savePreferences({ quiet_hours_start: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Тихие часы (конец)</Label>
              <Input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) =>
                  savePreferences({ quiet_hours_end: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};