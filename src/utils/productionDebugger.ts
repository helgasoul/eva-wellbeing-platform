/**
 * Production Debugging Utility for без | паузы App
 * Helps monitor and debug issues in production environment
 */

interface DebugInfo {
  timestamp: string;
  environment: string;
  url: string;
  userAgent: string;
  authState: any;
  supabaseConfig: any;
  errors: any[];
}

class ProductionDebugger {
  private errors: any[] = [];
  private maxErrors = 50;

  constructor() {
    // Capture global errors
    window.addEventListener('error', (event) => {
      this.logError('Global Error', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
    });
  }

  logError(type: string, error: any) {
    const errorInfo = {
      type,
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    this.errors.push(errorInfo);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (window.location.hostname === 'localhost') {
      console.error(`[${type}]`, error);
    }
  }

  getDebugInfo(): DebugInfo {
    return {
      timestamp: new Date().toISOString(),
      environment: window.location.hostname === 'localhost' ? 'development' : 'production',
      url: window.location.href,
      userAgent: navigator.userAgent,
      authState: this.getAuthState(),
      supabaseConfig: this.getSupabaseConfig(),
      errors: this.errors.slice(-10) // Last 10 errors
    };
  }

  private getAuthState() {
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      return {
        hasToken: !!authData,
        tokenKeys: authData ? Object.keys(JSON.parse(authData)) : [],
        localStorage: {
          hasSupabaseAuth: !!localStorage.getItem('supabase.auth.token'),
          hasUserLocation: !!localStorage.getItem('eva-user-location'),
          keys: Object.keys(localStorage)
        }
      };
    } catch (error) {
      return { error: 'Failed to get auth state' };
    }
  }

  private getSupabaseConfig() {
    return {
      url: 'https://wbydubxjcdhoinhrozwx.supabase.co',
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port
    };
  }

  exportDebugReport(): string {
    const debugInfo = this.getDebugInfo();
    return JSON.stringify(debugInfo, null, 2);
  }

  // Console commands for debugging
  setupConsoleCommands() {
    if (typeof window !== 'undefined') {
      (window as any).appDebug = {
        getInfo: () => this.getDebugInfo(),
        getErrors: () => this.errors,
        clearErrors: () => { this.errors = []; },
        export: () => this.exportDebugReport(),
        testAuth: () => this.testAuthConnection(),
        testSupabase: () => this.testSupabaseConnection()
      };
    }
  }

  private async testAuthConnection() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.auth.getSession();
      
      console.log('🔐 Auth Test Result:', {
        hasSession: !!data.session,
        hasUser: !!data.session?.user,
        error: error?.message,
        timestamp: new Date().toISOString()
      });
      
      return { success: !error, data, error };
    } catch (error) {
      console.error('❌ Auth test failed:', error);
      return { success: false, error };
    }
  }

  async testSupabaseConnection() {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const startTime = Date.now();
      
      // Test a simple query
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      console.log('🌐 Supabase Test Result:', {
        success: !error,
        duration: `${duration}ms`,
        error: error?.message,
        hasData: !!data,
        timestamp: new Date().toISOString()
      });
      
      return { success: !error, duration, data, error };
    } catch (error) {
      console.error('❌ Supabase test failed:', error);
      return { success: false, error };
    }
  }
}

export const productionDebugger = new ProductionDebugger();

// Setup console commands in development and production
if (typeof window !== 'undefined') {
  productionDebugger.setupConsoleCommands();
}

// Periodic health check in production
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  setInterval(() => {
    productionDebugger.testSupabaseConnection();
  }, 5 * 60 * 1000); // Every 5 minutes
}
