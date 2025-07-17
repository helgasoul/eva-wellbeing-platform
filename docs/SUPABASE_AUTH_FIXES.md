# Supabase Auth Fixes

This document contains fixes and improvements for Supabase authentication implementation.

## Supabase Client Configuration Fix

### Problem
The Supabase client configuration in `src/config/supabase.ts` incorrectly includes the unsupported property `additionalRedirectUrls` inside the auth options, which can cause authentication failures.

### Incorrect Configuration (DO NOT USE)
```typescript
// src/config/supabase.ts - INCORRECT
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This property is NOT supported and will cause issues
    additionalRedirectUrls: [
      'http://localhost:3000',
      'https://your-app.com',
      'https://your-staging.com'
    ]
  }
});
```

### Correct Configuration
```typescript
// src/config/supabase.ts - CORRECT
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Remove additionalRedirectUrls entirely
    // Only include officially supported auth options
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### Dashboard Configuration Required
Instead of using `additionalRedirectUrls` in the client configuration, you must configure redirect URLs in the Supabase Dashboard:

1. Go to your Supabase project Dashboard
2. Navigate to **Authentication → URL Configuration**
3. Add all necessary redirect URLs to the **Redirect URLs** field:
   - `http://localhost:3000` (for development)
   - `https://your-app.com` (for production)
   - `https://your-staging.com` (for staging)
   - Any other domains your app uses

### Important Notes
- The `additionalRedirectUrls` property is not part of the official Supabase client API
- Redirect URLs must be configured server-side through the Dashboard for security
- Client-side redirect URL configuration is not supported and will be ignored
- Always test authentication flows after updating redirect URLs in the Dashboard

## Authentication Error Logging

### Problem
The `logAuthError` function was using `supabase`, `getClientIP`, and `getUserAgent` without proper imports or definitions, causing compilation errors.

### Solution
Below is the corrected implementation with proper imports and helper functions:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Helper function to get client IP address
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return null;
  }
}

// Helper function to get user agent
function getUserAgent(): string {
  return navigator.userAgent;
}

// Main function to log authentication errors
async function logAuthError(
  userId: string | null,
  errorType: string,
  errorMessage: string,
  errorDetails?: Record<string, any>
): Promise<void> {
  try {
    const clientIP = await getClientIP();
    const userAgent = getUserAgent();
    
    const { error } = await supabase
      .from('auth_error_logs')
      .insert({
        user_id: userId,
        error_type: errorType,
        error_message: errorMessage,
        error_details: errorDetails || {},
        ip_address: clientIP,
        user_agent: userAgent,
        url: window.location.href,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log auth error:', error);
    }
  } catch (error) {
    console.error('Error logging auth error:', error);
  }
}

// Usage example
export async function handleAuthError(
  userId: string | null,
  error: Error,
  context: string
) {
  await logAuthError(
    userId,
    'authentication_failure',
    error.message,
    {
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }
  );
}
```

### User Profile Creation with Race Condition Fix

The `createUserProfile` function should use upsert operations to prevent race conditions:

```typescript
// Fixed version - uses upsert to prevent race conditions
async function createUserProfile(
  userId: string,
  profileData: {
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }
): Promise<void> {
  try {
    // Use upsert operation to handle concurrent requests safely
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: profileData.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role || 'patient',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Failed to create/update user profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Usage in auth signup handler
export async function handleUserSignup(user: any) {
  await createUserProfile(user.id, {
    email: user.email,
    first_name: user.user_metadata?.first_name,
    last_name: user.user_metadata?.last_name,
    role: user.user_metadata?.role
  });
}
```

### Key Changes Made

1. **Added Supabase import**: `import { supabase } from '@/integrations/supabase/client';`

2. **Defined `getClientIP` function**: Async function that fetches the client's IP address using the ipify API with proper error handling.

3. **Defined `getUserAgent` function**: Simple function that returns the browser's user agent string.

4. **Improved error handling**: Added try-catch blocks to prevent the logging function from breaking the main application flow.

5. **Added proper typing**: Function parameters now have proper TypeScript types.

6. **Enhanced functionality**: Added URL tracking and proper timestamp handling.

### Integration Notes

- The `auth_error_logs` table should exist in your Supabase database
- The IP detection service (ipify) is free but consider rate limiting for production
- All error logging is non-blocking to prevent auth failures from causing app crashes
- User agent and IP data help with security monitoring and debugging

### Alternative Implementation

If you prefer to use the existing `authAuditService`, you can replace the direct Supabase calls with:

```typescript
import { authAuditService } from '@/services/authAuditService';

async function logAuthError(
  userId: string | null,
  errorType: string,
  errorMessage: string,
  errorDetails?: Record<string, any>
): Promise<void> {
  await authAuditService.logAuthEvent({
    action: errorType,
    userId: userId || undefined,
    success: false,
    errorMessage,
    metadata: errorDetails
  });
}
```

This approach leverages the existing audit service which already includes IP detection and user agent collection.