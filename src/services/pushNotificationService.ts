import { supabase } from '@/integrations/supabase/client';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey = 'wbydubxjcdhoinhrozwx'; // Will be replaced with actual VAPID key
  private supported = false;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.supported = this.checkSupport();
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private checkSupport(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  async initialize(): Promise<boolean> {
    if (!this.supported) {
      console.warn('Push notifications are not supported in this browser');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) {
      throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  async getPermissionStatus(): Promise<NotificationPermission> {
    if (!this.supported) {
      return 'denied';
    }
    return Notification.permission;
  }

  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Push notification permission denied');
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        return this.subscriptionToData(existingSubscription);
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      const subscriptionData = this.subscriptionToData(subscription);
      
      // Save subscription to database
      await this.saveSubscriptionToDatabase(subscriptionData);
      
      return subscriptionData;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        const success = await subscription.unsubscribe();
        if (success) {
          // Remove from database
          await this.removeSubscriptionFromDatabase(subscription.endpoint);
        }
        return success;
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      return subscription ? this.subscriptionToData(subscription) : null;
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  async testNotification(): Promise<void> {
    if (!this.supported) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Push notification permission not granted');
    }

    // Show a test notification
    new Notification('Eva Wellbeing Test', {
      body: 'Тестовое push-уведомление работает!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test-notification'
    });
  }

  private subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? this.arrayBufferToBase64(key) : '',
        auth: auth ? this.arrayBufferToBase64(auth) : ''
      }
    };
  }

  private async saveSubscriptionToDatabase(subscriptionData: PushSubscriptionData): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        subscription: subscriptionData as any
      });

    if (error) {
      console.error('Failed to save subscription to database:', error);
      throw error;
    }
  }

  private async removeSubscriptionFromDatabase(endpoint: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to remove subscription from database:', error);
    }
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipad/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet/.test(userAgent)) {
      return 'tablet';
    }
    return 'desktop';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  isSupported(): boolean {
    return this.supported;
  }
}