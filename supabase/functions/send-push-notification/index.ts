import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, notification } = await req.json();
    
    if (!userId || !notification) {
      throw new Error('userId and notification are required');
    }

    console.log(`Sending push notification to user ${userId}`);

    // Get user's notification preferences
    const { data: preferences } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Check if push notifications are enabled
    if (preferences && !preferences.push_notifications_enabled) {
      console.log(`Push notifications disabled for user ${userId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Push notifications disabled for user' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check quiet hours
    if (preferences && isInQuietHours(preferences)) {
      console.log(`Currently in quiet hours for user ${userId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Currently in quiet hours' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active push subscriptions for the user
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subError) {
      throw new Error(`Failed to get subscriptions: ${subError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active push subscriptions for user ${userId}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active subscriptions' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];
    const failedSubscriptions = [];

    // Send notification to each subscription
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const payload: PushNotificationPayload = {
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icons/icon-192x192.png',
          badge: notification.badge || '/icons/badge-72x72.png',
          data: {
            url: notification.url || '/dashboard',
            timestamp: Date.now(),
            ...notification.data
          },
          actions: notification.actions || [
            {
              action: 'open',
              title: 'Открыть',
            },
            {
              action: 'dismiss',
              title: 'Закрыть',
            }
          ]
        };

        await sendWebPushNotification(pushSubscription, payload);
        results.push({ subscriptionId: subscription.id, success: true });
        
      } catch (error) {
        console.error(`Failed to send to subscription ${subscription.id}:`, error);
        results.push({ subscriptionId: subscription.id, success: false, error: error.message });
        
        // If it's a 410 Gone error, mark subscription as inactive
        if (error.message.includes('410') || error.message.includes('invalid')) {
          failedSubscriptions.push(subscription.id);
        }
      }
    }

    // Deactivate failed subscriptions
    if (failedSubscriptions.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .in('id', failedSubscriptions);
      
      console.log(`Deactivated ${failedSubscriptions.length} invalid subscriptions`);
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(JSON.stringify({
      success: true,
      sent: successCount,
      total: subscriptions.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendWebPushNotification(subscription: any, payload: PushNotificationPayload) {
  // Create VAPID headers
  const vapidHeaders = {
    'Authorization': `vapid t=${await generateVapidToken()}, k=${vapidPublicKey}`,
    'Content-Type': 'application/octet-stream',
    'TTL': '86400', // 24 hours
  };

  // Encrypt the payload
  const encryptedPayload = await encryptPayload(JSON.stringify(payload), subscription.keys);
  
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: vapidHeaders,
    body: encryptedPayload,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Push service error: ${response.status} - ${errorText}`);
  }
}

async function generateVapidToken(): Promise<string> {
  // Simple JWT implementation for VAPID
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({
    aud: supabaseUrl,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: 'mailto:your-email@example.com'
  }));
  
  // For production, you'd need to properly sign this with the private key
  // This is a simplified version
  return `${header}.${payload}.signature`;
}

async function encryptPayload(payload: string, keys: { p256dh: string; auth: string }): Promise<Uint8Array> {
  // For production, implement proper Web Push payload encryption
  // This is a simplified version - you'd need the full Web Push encryption spec
  const encoder = new TextEncoder();
  return encoder.encode(payload);
}

function isInQuietHours(preferences: any): boolean {
  if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
  
  const quietStart = startHour * 60 + startMin;
  const quietEnd = endHour * 60 + endMin;
  
  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (quietStart > quietEnd) {
    return currentTime >= quietStart || currentTime <= quietEnd;
  }
  
  return currentTime >= quietStart && currentTime <= quietEnd;
}