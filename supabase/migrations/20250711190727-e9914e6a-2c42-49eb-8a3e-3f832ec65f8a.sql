-- Create table to track user interest in upcoming subscription plans
CREATE TABLE public.subscription_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan_id TEXT NOT NULL,
  email TEXT,
  interested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_interest ENABLE ROW LEVEL SECURITY;

-- Create policy for users to insert their own interest
CREATE POLICY "Users can express interest in plans" ON public.subscription_interest
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND email IS NOT NULL)
);

-- Create policy for users to view their own interest records
CREATE POLICY "Users can view their own interest" ON public.subscription_interest
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND email = auth.email())
);

-- Create policy for admins to view all interest records
CREATE POLICY "Admins can view all interest records" ON public.subscription_interest
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better performance
CREATE INDEX idx_subscription_interest_plan_id ON public.subscription_interest(subscription_plan_id);
CREATE INDEX idx_subscription_interest_user_id ON public.subscription_interest(user_id);
CREATE INDEX idx_subscription_interest_created_at ON public.subscription_interest(created_at);