import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled daily notifications check');

    // Get current time in different timezones
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    console.log(`Current time: ${currentHour}:${currentMinute}, Day: ${currentDay}`);

    // Get users who should receive notifications at this time
    const { data: usersToNotify, error: usersError } = await supabase
      .from('user_notification_preferences')
      .select(`
        user_id,
        notification_time,
        timezone,
        quiet_hours_start,
        quiet_hours_end,
        weekend_notifications,
        daily_insights_enabled,
        push_notifications_enabled
      `)
      .eq('daily_insights_enabled', true)
      .eq('push_notifications_enabled', true);

    if (usersError) {
      throw new Error(`Failed to get users: ${usersError.message}`);
    }

    if (!usersToNotify || usersToNotify.length === 0) {
      console.log('No users found with notifications enabled');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No users to notify' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];
    let processedCount = 0;

    for (const user of usersToNotify) {
      try {
        // Check if it's weekend and user has weekend notifications disabled
        if ((currentDay === 0 || currentDay === 6) && !user.weekend_notifications) {
          console.log(`Skipping user ${user.user_id} - weekend notifications disabled`);
          continue;
        }

        // Check if current time matches user's notification time (with timezone consideration)
        const userTime = convertToUserTime(now, user.timezone);
        const userHour = userTime.getHours();
        const userMinute = userTime.getMinutes();
        
        const [notificationHour, notificationMinute] = user.notification_time.split(':').map(Number);
        
        // Allow 5-minute window for notification time
        if (Math.abs(userHour - notificationHour) > 0 || Math.abs(userMinute - notificationMinute) > 2) {
          continue;
        }

        // Check if we're in quiet hours
        if (isInQuietHours(userTime, user.quiet_hours_start, user.quiet_hours_end)) {
          console.log(`Skipping user ${user.user_id} - in quiet hours`);
          continue;
        }

        // Check if user already has recent analysis today
        const today = userTime.toISOString().split('T')[0];
        const { data: recentAnalysis } = await supabase
          .from('ai_analysis_sessions')
          .select('id, created_at')
          .eq('user_id', user.user_id)
          .eq('session_type', 'daily_health_analysis')
          .gte('analysis_date', today)
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentAnalysis && recentAnalysis.length > 0) {
          // Check if analysis was created recently (within last 2 hours)
          const analysisTime = new Date(recentAnalysis[0].created_at);
          const timeDiff = userTime.getTime() - analysisTime.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          if (hoursDiff < 2) {
            console.log(`Skipping user ${user.user_id} - recent analysis exists`);
            continue;
          }
        }

        // Trigger daily health analysis for this user
        console.log(`Triggering daily analysis for user ${user.user_id}`);
        
        const { error: analysisError } = await supabase.functions.invoke('daily-health-analysis', {
          body: {
            userId: user.user_id,
            analysisDate: today
          }
        });

        if (analysisError) {
          console.error(`Failed to trigger analysis for user ${user.user_id}:`, analysisError);
          results.push({
            userId: user.user_id,
            success: false,
            error: analysisError.message
          });
        } else {
          console.log(`Successfully triggered analysis for user ${user.user_id}`);
          results.push({
            userId: user.user_id,
            success: true
          });
          processedCount++;
        }

      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error);
        results.push({
          userId: user.user_id,
          success: false,
          error: error.message
        });
      }
    }

    console.log(`Processed ${processedCount} users out of ${usersToNotify.length} candidates`);

    return new Response(JSON.stringify({
      success: true,
      processed: processedCount,
      total: usersToNotify.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in schedule-daily-notifications:', error);
    
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function convertToUserTime(utcTime: Date, timezone: string): Date {
  try {
    // Create a new date in the user's timezone
    const userTime = new Date(utcTime.toLocaleString("en-US", { timeZone: timezone }));
    return userTime;
  } catch (error) {
    console.warn(`Invalid timezone ${timezone}, using UTC`);
    return utcTime;
  }
}

function isInQuietHours(currentTime: Date, quietStart: string, quietEnd: string): boolean {
  if (!quietStart || !quietEnd) {
    return false;
  }

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const [startHour, startMin] = quietStart.split(':').map(Number);
  const [endHour, endMin] = quietEnd.split(':').map(Number);
  
  const quietStartMinutes = startHour * 60 + startMin;
  const quietEndMinutes = endHour * 60 + endMin;
  
  // Handle overnight quiet hours (e.g., 22:00 to 07:00)
  if (quietStartMinutes > quietEndMinutes) {
    return currentMinutes >= quietStartMinutes || currentMinutes <= quietEndMinutes;
  }
  
  return currentMinutes >= quietStartMinutes && currentMinutes <= quietEndMinutes;
}