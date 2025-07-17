import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';

export interface AuthDiagnosticResult {
  timestamp: string;
  userId?: string;
  userEmail?: string;
  authSession: boolean;
  supabaseProfile: any;
  localStorageData: any;
  onboardingFlags: {
    profileFlag: boolean;
    serviceVerified: boolean;
  };
  networkDiagnostics: {
    canReachSupabase: boolean;
    lastRequestTime?: number;
    contentTypeSupported: boolean;
  };
  inconsistencies: string[];
  recommendations: string[];
}

export const diagnoseAuthState = async (): Promise<AuthDiagnosticResult> => {
  const timestamp = new Date().toISOString();
  const result: AuthDiagnosticResult = {
    timestamp,
    authSession: false,
    supabaseProfile: null,
    localStorageData: {},
    onboardingFlags: {
      profileFlag: false,
      serviceVerified: false
    },
    networkDiagnostics: {
      canReachSupabase: false,
      contentTypeSupported: false
    },
    inconsistencies: [],
    recommendations: []
  };

  try {
    // Check auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.error('Session retrieval error:', sessionError);
      result.inconsistencies.push(`Session error: ${sessionError.message}`);
    }

    if (session?.user) {
      result.authSession = true;
      result.userId = session.user.id;
      result.userEmail = session.user.email;
      logger.debug('Auth session found', { userId: session.user.id });
    }

    // Check Supabase profile
    if (result.userId) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', result.userId)
          .single();

        if (profileError) {
          logger.error('Profile query error:', profileError);
          result.inconsistencies.push(`Profile error: ${profileError.message}`);
        } else {
          result.supabaseProfile = profile;
          result.onboardingFlags.profileFlag = profile?.onboarding_completed || false;
        }
      } catch (error) {
        logger.error('Profile fetch failed:', error);
        result.inconsistencies.push(`Profile fetch failed: ${error}`);
      }
    }

    // Check localStorage
    try {
      result.localStorageData = {
        eva_user: localStorage.getItem('eva_user') ? 'exists' : 'missing',
        eva_auth_token: localStorage.getItem('eva_auth_token') ? 'exists' : 'missing',
        eva_auth_error: localStorage.getItem('eva_auth_error') ? 'exists' : 'missing',
        supabase_auth_token: localStorage.getItem('sb-wbydubxjcdhoinhrozwx-auth-token') ? 'exists' : 'missing'
      };
    } catch (error) {
      logger.error('localStorage check failed:', error);
      result.inconsistencies.push(`localStorage error: ${error}`);
    }

    // Network diagnostics
    try {
      const startTime = performance.now();
      const { error: testError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      const requestTime = performance.now() - startTime;
      result.networkDiagnostics.lastRequestTime = requestTime;
      result.networkDiagnostics.canReachSupabase = !testError;
      
      if (testError) {
        result.inconsistencies.push(`Network error: ${testError.message}`);
      }

      // Test Content-Type support
      try {
        const supabaseUrl = 'https://wbydubxjcdhoinhrozwx.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1YnhqY2Rob2luaHJvend4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjI2MjgsImV4cCI6MjA2NTYzODYyOH0.A_n3yGRvALma5H9LTY6Cl1DLwgLg-xgwIP2slREkgy4';
        
        const testResponse = await fetch(`${supabaseUrl}/rest/v1/user_profiles?select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        result.networkDiagnostics.contentTypeSupported = testResponse.ok;
        
        if (!testResponse.ok) {
          result.inconsistencies.push(`Content-Type error: ${testResponse.status} ${testResponse.statusText}`);
        }
      } catch (ctError) {
        result.inconsistencies.push(`Content-Type test failed: ${ctError}`);
      }

    } catch (error) {
      logger.error('Network diagnostics failed:', error);
      result.inconsistencies.push(`Network test failed: ${error}`);
    }

    // Analyze inconsistencies
    if (result.authSession && !result.supabaseProfile) {
      result.inconsistencies.push('User authenticated but no profile exists');
      result.recommendations.push('Create missing user profile');
    }

    if (result.authSession && result.supabaseProfile && !result.onboardingFlags.profileFlag) {
      result.inconsistencies.push('Profile exists but onboarding not marked complete');
      result.recommendations.push('Verify onboarding completion status');
    }

    if (!result.networkDiagnostics.contentTypeSupported) {
      result.recommendations.push('Fix Content-Type header handling');
    }

    if (result.networkDiagnostics.lastRequestTime && result.networkDiagnostics.lastRequestTime > 5000) {
      result.inconsistencies.push('Slow network response detected');
      result.recommendations.push('Check network connectivity');
    }

  } catch (error) {
    logger.error('Auth diagnostic failed:', error);
    result.inconsistencies.push(`Diagnostic error: ${error}`);
  }

  return result;
};

export const diagnoseStorage = () => {
  const report = {
    timestamp: new Date().toISOString(),
    localStorage: {} as any,
    sessionStorage: {} as any,
    cookies: {} as any,
    issues: [] as string[],
    recommendations: [] as string[]
  };

  // Check localStorage
  try {
    const keys = Object.keys(localStorage);
    report.localStorage = {
      available: true,
      keyCount: keys.length,
      authKeys: keys.filter(k => k.includes('auth') || k.includes('eva')),
      supabaseKeys: keys.filter(k => k.includes('supabase') || k.includes('sb-')),
      storageSize: new Blob(keys.map(k => localStorage[k] || '')).size
    };
  } catch (error) {
    report.localStorage = { available: false, error: String(error) };
    report.issues.push('localStorage not available');
  }

  // Check sessionStorage
  try {
    const keys = Object.keys(sessionStorage);
    report.sessionStorage = {
      available: true,
      keyCount: keys.length,
      authKeys: keys.filter(k => k.includes('auth') || k.includes('eva'))
    };
  } catch (error) {
    report.sessionStorage = { available: false, error: String(error) };
  }

  // Check cookies
  try {
    const cookies = document.cookie.split(';').map(c => c.trim().split('=')[0]);
    report.cookies = {
      available: true,
      count: cookies.length,
      authCookies: cookies.filter(c => c.includes('auth') || c.includes('eva'))
    };
  } catch (error) {
    report.cookies = { available: false, error: String(error) };
  }

  // Generate recommendations
  if (report.localStorage.storageSize > 5000000) { // 5MB
    report.issues.push('localStorage approaching size limit');
    report.recommendations.push('Clear old authentication data');
  }

  if (report.localStorage.keyCount > 50) {
    report.issues.push('Too many localStorage keys');
    report.recommendations.push('Clean up unused storage keys');
  }

  return report;
};

export const clearAuthStorage = () => {
  const keysToRemove = [
    'eva_user',
    'eva_auth_token',
    'eva_auth_error',
    'eva_onboarding_progress'
  ];

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to remove ${key}:`, error);
    }
  });

  // Clear Supabase auth storage
  try {
    const supabaseKeys = Object.keys(localStorage).filter(k => k.includes('sb-'));
    supabaseKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    logger.error('Failed to clear Supabase storage:', error);
  }
  
  logger.info('Auth storage cleared');
};