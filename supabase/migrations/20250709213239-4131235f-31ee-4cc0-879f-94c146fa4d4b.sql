-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily weather updates at 6:00 AM UTC
SELECT cron.schedule(
  'daily-weather-update',
  '0 6 * * *', -- Every day at 6:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://wbydubjcdhhoinhrozwx.supabase.co/functions/v1/update-weather-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1YnhqY2Rob2luaHJvend4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjI2MjgsImV4cCI6MjA2NTYzODYyOH0.A_n3yGRvALma5H9LTY6Cl1DLwgLg-xgwIP2slREkgy4"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);