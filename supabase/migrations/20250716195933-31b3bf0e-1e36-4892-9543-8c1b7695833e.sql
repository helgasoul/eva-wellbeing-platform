-- Fix RLS policy for security_audit_log table to allow unauthenticated logging
-- This is necessary for logging authentication attempts before user is authenticated

-- First, check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    audit_type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'medium',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Allow authentication logging" ON public.security_audit_log;

-- Create new policies that allow unauthenticated logging for auth events
CREATE POLICY "Allow authentication logging" ON public.security_audit_log
    FOR INSERT 
    WITH CHECK (
        audit_type = 'authentication' OR 
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Users can view their own audit logs" ON public.security_audit_log
    FOR SELECT 
    USING (
        auth.uid() = user_id OR
        has_role(auth.uid(), 'admin'::app_role)
    );

CREATE POLICY "Admins can manage all audit logs" ON public.security_audit_log
    FOR ALL 
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));