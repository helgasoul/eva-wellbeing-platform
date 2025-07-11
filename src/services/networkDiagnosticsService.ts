import { supabase } from '@/integrations/supabase/client';

export interface NetworkDiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
  details?: any;
  timestamp: string;
}

export interface DiagnosticReport {
  timestamp: string;
  environment: {
    userAgent: string;
    hostname: string;
    online: boolean;
    connectionType?: string;
    effectiveType?: string;
  };
  results: NetworkDiagnosticResult[];
  summary: {
    totalTests: number;
    passed: number;
    warnings: number;
    failed: number;
    overallStatus: 'healthy' | 'degraded' | 'critical';
  };
}

class NetworkDiagnosticsService {
  private diagnosticHistory: DiagnosticReport[] = [];
  private maxHistorySize = 10;

  async runComprehensiveDiagnostics(): Promise<DiagnosticReport> {
    console.log('🔬 Starting comprehensive network diagnostics...');
    
    const startTime = Date.now();
    const results: NetworkDiagnosticResult[] = [];
    
    // Environment detection
    const environment = this.detectEnvironment();
    
    // Run all diagnostic tests
    const diagnosticTests = [
      () => this.testBasicConnectivity(),
      () => this.testSupabaseAvailability(),
      () => this.testAuthEndpoint(),
      () => this.testDNSResolution(),
      () => this.testCORSPolicies(),
      () => this.testSSLCertificate(),
      () => this.testBrowserCapabilities(),
      () => this.testLocalStorage(),
      () => this.testNetworkSpeed(),
      () => this.testFirewallRestrictions()
    ];

    for (const test of diagnosticTests) {
      try {
        const result = await test();
        results.push(result);
      } catch (error) {
        results.push({
          test: 'Unknown Test',
          status: 'error',
          message: `Test failed: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Generate summary
    const summary = this.generateSummary(results);
    
    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      environment,
      results,
      summary
    };

    // Store in history
    this.addToHistory(report);
    
    const totalTime = Date.now() - startTime;
    console.log(`🔬 Diagnostics completed in ${totalTime}ms:`, summary);
    
    return report;
  }

  private detectEnvironment() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      userAgent: navigator.userAgent,
      hostname: window.location.hostname,
      online: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown'
    };
  }

  private async testBasicConnectivity(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();
    
    try {
      // Test basic internet connectivity
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return {
          test: 'Basic Connectivity',
          status: 'success',
          message: 'Internet connection is working',
          duration,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          test: 'Basic Connectivity',
          status: 'warning',
          message: `HTTP status ${response.status}`,
          duration,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        test: 'Basic Connectivity',
        status: 'error',
        message: `Connection failed: ${error.message}`,
        duration,
        details: { error: error.name },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testSupabaseAvailability(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();
    const supabaseUrl = 'https://wbydubxjcdhoinhrozwx.supabase.co';
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndieWR1YnhqY2Rob2luaHJvend4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjI2MjgsImV4cCI6MjA2NTYzODYyOH0.A_n3yGRvALma5H9LTY6Cl1DLwgLg-xgwIP2slREkgy4'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        return {
          test: 'Supabase Availability',
          status: 'success',
          message: 'Supabase API is accessible',
          duration,
          details: { status: response.status },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          test: 'Supabase Availability',
          status: 'error',
          message: `Supabase API returned ${response.status}`,
          duration,
          details: { status: response.status, statusText: response.statusText },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        test: 'Supabase Availability',
        status: 'error',
        message: `Supabase connection failed: ${error.message}`,
        duration,
        details: { error: error.name },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testAuthEndpoint(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 15000)
        )
      ]) as any;
      
      const duration = Date.now() - startTime;
      
      if (error) {
        return {
          test: 'Auth Endpoint',
          status: 'error',
          message: `Auth error: ${error.message}`,
          duration,
          details: { error: error.name, code: error.code },
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        test: 'Auth Endpoint',
        status: 'success',
        message: 'Auth endpoint is responsive',
        duration,
        details: { hasSession: !!data.session },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        test: 'Auth Endpoint',
        status: 'error',
        message: `Auth endpoint failed: ${error.message}`,
        duration,
        details: { error: error.name },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testDNSResolution(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();
    
    try {
      // Test DNS resolution by checking if we can resolve the Supabase domain
      const response = await fetch('https://wbydubxjcdhoinhrozwx.supabase.co', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      const duration = Date.now() - startTime;
      
      return {
        test: 'DNS Resolution',
        status: 'success',
        message: 'DNS resolution working correctly',
        duration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.name === 'AbortError') {
        return {
          test: 'DNS Resolution',
          status: 'warning',
          message: 'DNS resolution slow (timeout)',
          duration,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        test: 'DNS Resolution',
        status: 'error',
        message: `DNS resolution failed: ${error.message}`,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testCORSPolicies(): Promise<NetworkDiagnosticResult> {
    try {
      // Test CORS by making a preflight request
      const response = await fetch('https://wbydubxjcdhoinhrozwx.supabase.co/rest/v1/', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      const corsHeaders = {
        allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
        allowMethods: response.headers.get('Access-Control-Allow-Methods'),
        allowHeaders: response.headers.get('Access-Control-Allow-Headers')
      };
      
      if (response.ok) {
        return {
          test: 'CORS Policies',
          status: 'success',
          message: 'CORS policies are correctly configured',
          details: corsHeaders,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          test: 'CORS Policies',
          status: 'warning',
          message: 'CORS preflight request failed',
          details: { status: response.status, headers: corsHeaders },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        test: 'CORS Policies',
        status: 'error',
        message: `CORS test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testSSLCertificate(): Promise<NetworkDiagnosticResult> {
    try {
      const response = await fetch('https://wbydubxjcdhoinhrozwx.supabase.co', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      // If we get here, SSL is working
      return {
        test: 'SSL Certificate',
        status: 'success',
        message: 'SSL certificate is valid',
        details: { 
          protocol: window.location.protocol,
          secureContext: window.isSecureContext 
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.message.includes('certificate') || error.message.includes('SSL')) {
        return {
          test: 'SSL Certificate',
          status: 'error',
          message: `SSL certificate issue: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        test: 'SSL Certificate',
        status: 'warning',
        message: 'Could not verify SSL certificate',
        details: { error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testBrowserCapabilities(): Promise<NetworkDiagnosticResult> {
    const capabilities = {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      webWorkers: !!window.Worker,
      fetch: !!window.fetch,
      promises: !!window.Promise,
      crypto: !!window.crypto
    };
    
    const missingCapabilities = Object.entries(capabilities)
      .filter(([_, supported]) => !supported)
      .map(([capability]) => capability);
    
    if (missingCapabilities.length === 0) {
      return {
        test: 'Browser Capabilities',
        status: 'success',
        message: 'All required browser features are supported',
        details: capabilities,
        timestamp: new Date().toISOString()
      };
    } else {
      return {
        test: 'Browser Capabilities',
        status: 'warning',
        message: `Missing capabilities: ${missingCapabilities.join(', ')}`,
        details: capabilities,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testLocalStorage(): Promise<NetworkDiagnosticResult> {
    try {
      const testKey = 'network_diagnostic_test';
      const testValue = Date.now().toString();
      
      // Test write
      localStorage.setItem(testKey, testValue);
      
      // Test read
      const retrievedValue = localStorage.getItem(testKey);
      
      // Cleanup
      localStorage.removeItem(testKey);
      
      if (retrievedValue === testValue) {
        return {
          test: 'Local Storage',
          status: 'success',
          message: 'Local storage is working correctly',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          test: 'Local Storage',
          status: 'error',
          message: 'Local storage read/write mismatch',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        test: 'Local Storage',
        status: 'error',
        message: `Local storage error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testNetworkSpeed(): Promise<NetworkDiagnosticResult> {
    const startTime = Date.now();
    
    try {
      // Test with a small image to estimate speed
      const response = await fetch('https://wbydubxjcdhoinhrozwx.supabase.co/rest/v1/', {
        signal: AbortSignal.timeout(10000)
      });
      
      const duration = Date.now() - startTime;
      
      let speedAssessment = 'unknown';
      if (duration < 500) speedAssessment = 'fast';
      else if (duration < 2000) speedAssessment = 'normal';
      else if (duration < 5000) speedAssessment = 'slow';
      else speedAssessment = 'very slow';
      
      return {
        test: 'Network Speed',
        status: duration < 3000 ? 'success' : 'warning',
        message: `Network speed: ${speedAssessment} (${duration}ms)`,
        duration,
        details: { speedAssessment },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        test: 'Network Speed',
        status: 'error',
        message: `Speed test failed: ${error.message}`,
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async testFirewallRestrictions(): Promise<NetworkDiagnosticResult> {
    try {
      // Test multiple ports/protocols that might be blocked
      const tests = [
        { name: 'HTTPS (443)', url: 'https://wbydubxjcdhoinhrozwx.supabase.co' },
        { name: 'WebSocket', url: 'wss://wbydubxjcdhoinhrozwx.supabase.co/realtime/v1/websocket' }
      ];
      
      const results = await Promise.allSettled(
        tests.map(async ({ name, url }) => {
          const response = await fetch(url.replace('wss://', 'https://'), {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          return { name, success: response.ok };
        })
      );
      
      const blockedPorts = results
        .map((result, index) => ({ ...tests[index], result }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ name }) => name);
      
      if (blockedPorts.length === 0) {
        return {
          test: 'Firewall Restrictions',
          status: 'success',
          message: 'No firewall restrictions detected',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          test: 'Firewall Restrictions',
          status: 'warning',
          message: `Possible restrictions on: ${blockedPorts.join(', ')}`,
          details: { blockedPorts },
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        test: 'Firewall Restrictions',
        status: 'error',
        message: `Firewall test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  private generateSummary(results: NetworkDiagnosticResult[]) {
    const totalTests = results.length;
    const passed = results.filter(r => r.status === 'success').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'error').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'critical';
    
    if (failed === 0 && warnings <= 1) {
      overallStatus = 'healthy';
    } else if (failed <= 2 || warnings >= 2) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'critical';
    }
    
    return {
      totalTests,
      passed,
      warnings,
      failed,
      overallStatus
    };
  }

  private addToHistory(report: DiagnosticReport) {
    this.diagnosticHistory.unshift(report);
    if (this.diagnosticHistory.length > this.maxHistorySize) {
      this.diagnosticHistory = this.diagnosticHistory.slice(0, this.maxHistorySize);
    }
  }

  getHistory(): DiagnosticReport[] {
    return [...this.diagnosticHistory];
  }

  getLatestReport(): DiagnosticReport | null {
    return this.diagnosticHistory[0] || null;
  }

  // Quick diagnostic for specific auth failures
  async diagnoseAuthFailure(error: Error): Promise<NetworkDiagnosticResult[]> {
    console.log('🩺 Diagnosing auth failure:', error.message);
    
    const quickTests = [
      () => this.testSupabaseAvailability(),
      () => this.testAuthEndpoint(),
      () => this.testLocalStorage()
    ];
    
    const results = [];
    for (const test of quickTests) {
      try {
        results.push(await test());
      } catch (testError) {
        results.push({
          test: 'Quick Diagnostic',
          status: 'error' as const,
          message: `Test failed: ${testError.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }
}

export const networkDiagnosticsService = new NetworkDiagnosticsService();