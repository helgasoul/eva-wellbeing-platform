import { supabase } from '@/integrations/supabase/client';
import type { 
  AnalyticsEvent, 
  PerformanceMetrics, 
  UserAction, 
  UserAnalyticsReport, 
  SystemReport,
  SystemAlert,
  DBPerformanceLog,
  SystemMetric,
  AnalyticsEventType
} from '@/types/analytics';
import { ANALYTICS_EVENTS } from '@/types/analytics';
import { aiAnalyticsService } from './aiAnalyticsService';
import { logger } from '@/utils/logger';

class AnalyticsService {
  public sessionId: string;
  private userId: string | null = null;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeEventListeners();
    this.trackPageViews();
    this.trackPerformanceMetrics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeEventListeners(): void {
    // Track online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackEvent(ANALYTICS_EVENTS.SESSION_START, {
        connectionStatus: 'online',
        reconnected: true
      });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackEvent(ANALYTICS_EVENTS.OFFLINE_MODE, {
        connectionStatus: 'offline'
      });
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent(ANALYTICS_EVENTS.SESSION_END, {
          sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1])
        });
      } else {
        this.trackEvent(ANALYTICS_EVENTS.SESSION_START, {
          resumed: true
        });
      }
    });

    // Track unhandled errors
    window.addEventListener('error', (event) => {
      this.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error: event.error?.message || 'Unknown error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error: event.reason?.message || 'Unhandled promise rejection',
        type: 'promise_rejection'
      });
    });
  }

  private trackPageViews(): void {
    // Track initial page view
    this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });

    // Track navigation changes (for SPAs)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        analyticsService.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
          url: window.location.href,
          title: document.title,
          navigation: 'pushState'
        });
      }, 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        analyticsService.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
          url: window.location.href,
          title: document.title,
          navigation: 'replaceState'
        });
      }, 0);
    };

    window.addEventListener('popstate', () => {
      this.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
        url: window.location.href,
        title: document.title,
        navigation: 'popstate'
      });
    });
  }

  private trackPerformanceMetrics(): void {
    // Track Web Vitals
    try {
      import('web-vitals').then((webVitals) => {
        if (webVitals.onCLS) webVitals.onCLS((metric) => this.recordSystemMetric('cls', metric.value, metric));
        if (webVitals.onINP) webVitals.onINP((metric) => this.recordSystemMetric('inp', metric.value, metric));
        if (webVitals.onFCP) webVitals.onFCP((metric) => this.recordSystemMetric('fcp', metric.value, metric));
        if (webVitals.onLCP) webVitals.onLCP((metric) => this.recordSystemMetric('lcp', metric.value, metric));
        if (webVitals.onTTFB) webVitals.onTTFB((metric) => this.recordSystemMetric('ttfb', metric.value, metric));
      }).catch(() => {
        // Fallback to basic performance metrics
        this.trackBasicPerformanceMetrics();
      });
    } catch {
      this.trackBasicPerformanceMetrics();
    }
  }

  private trackBasicPerformanceMetrics(): void {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        ttfb: perfData.responseStart - perfData.fetchStart
      };

      this.trackPerformance(metrics);
    });
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public async trackEvent(eventType: AnalyticsEventType, data?: Record<string, any>): Promise<void> {
    const event: AnalyticsEvent = {
      type: eventType,
      data: {
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        isOnline: this.isOnline
      },
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      if (this.userId) {
        await supabase
          .from('user_analytics')
          .insert({
            user_id: this.userId,
            event_type: event.type,
            event_data: event.data,
            session_id: event.sessionId,
            page_url: event.pageUrl,
            user_agent: event.userAgent
          });
      }

      // Store in localStorage for offline support
      this.storeEventOffline(event);
      
      logger.debug('Analytics event tracked', { event });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      this.storeEventOffline(event);
    }
  }

  private storeEventOffline(event: AnalyticsEvent): void {
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      offlineEvents.push({
        ...event,
        userId: this.userId,
        timestamp: Date.now()
      });
      
      // Keep only last 100 events in localStorage
      if (offlineEvents.length > 100) {
        offlineEvents.splice(0, offlineEvents.length - 100);
      }
      
      localStorage.setItem('offline_analytics', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('Failed to store offline analytics:', error);
    }
  }

  public async syncOfflineEvents(): Promise<void> {
    if (!this.isOnline || !this.userId) return;

    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_analytics') || '[]');
      
      if (offlineEvents.length === 0) return;

      const events = offlineEvents.map((event: any) => ({
        user_id: event.userId || this.userId,
        event_type: event.type,
        event_data: event.data,
        session_id: event.sessionId,
        page_url: event.pageUrl,
        user_agent: event.userAgent
      }));

      await supabase
        .from('user_analytics')
        .insert(events);

      localStorage.removeItem('offline_analytics');
      logger.info('Offline analytics events synced', { count: events.length });
    } catch (error) {
      console.error('Failed to sync offline analytics events:', error);
    }
  }

  public async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    await this.trackEvent(ANALYTICS_EVENTS.PERFORMANCE_ISSUE, {
      metrics,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection?.effectiveType
    });

    // Also record as system metrics
    Object.entries(metrics).forEach(([key, value]) => {
      this.recordSystemMetric(`performance_${key}`, value, {
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });
  }

  public async trackUserBehavior(action: UserAction): Promise<void> {
    await this.trackEvent(ANALYTICS_EVENTS.USER_ENGAGEMENT, {
      action: action.action,
      target: action.target,
      value: action.value,
      metadata: action.metadata
    });
  }

  public async recordSystemMetric(name: string, value: number, data?: any): Promise<void> {
    try {
      await supabase
        .from('system_metrics')
        .insert({
          metric_name: name,
          metric_value: value,
          metric_data: data || {},
          metric_category: this.getMetricCategory(name)
        });
    } catch (error) {
      console.error('Failed to record system metric:', error);
    }
  }

  private getMetricCategory(metricName: string): string {
    if (metricName.includes('performance')) return 'performance';
    if (metricName.includes('database') || metricName.includes('db')) return 'database';
    if (metricName.includes('user')) return 'user_behavior';
    if (metricName.includes('error')) return 'errors';
    return 'general';
  }

  public async logDatabasePerformance(
    queryType: string,
    executionTime: number,
    tableName?: string,
    rowsAffected?: number,
    queryHash?: string,
    error?: string
  ): Promise<void> {
    try {
      await supabase
        .from('db_performance_logs')
        .insert({
          query_type: queryType,
          table_name: tableName,
          execution_time_ms: executionTime,
          rows_affected: rowsAffected,
          query_hash: queryHash,
          error_message: error,
          user_id: this.userId
        });
    } catch (err) {
      console.error('Failed to log database performance:', err);
    }
  }

  public async generateUserReport(userId: string): Promise<UserAnalyticsReport> {
    try {
      const { data: events } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!events) {
        throw new Error('No analytics data found');
      }

      const totalEvents = events.length;
      const lastActivity = events[0]?.created_at || '';

      // Calculate top events
      const eventCounts: Record<string, number> = {};
      events.forEach(event => {
        eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
      });
      
      const topEvents = Object.entries(eventCounts)
        .map(([eventType, count]) => ({ eventType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate session stats
      const sessions = new Set(events.map(e => e.session_id)).size;
      const sessionEvents = events.reduce((acc, event) => {
        if (!acc[event.session_id]) acc[event.session_id] = [];
        acc[event.session_id].push(event);
        return acc;
      }, {} as Record<string, any[]>);

      const averageEventsPerSession = totalEvents / sessions;

      return {
        userId,
        totalEvents,
        lastActivity,
        topEvents,
        sessionStats: {
          totalSessions: sessions,
          averageSessionLength: 0, // Would need session start/end events to calculate
          averageEventsPerSession
        },
        retentionMetrics: {
          dailyActiveUsers: 0, // Would need to calculate from all users
          weeklyActiveUsers: 0,
          monthlyActiveUsers: 0
        }
      };
    } catch (error) {
      console.error('Failed to generate user report:', error);
      throw error;
    }
  }

  public async generateSystemReport(): Promise<SystemReport> {
    try {
      const [
        { data: alerts },
        { data: metrics },
        { data: performanceLogs },
        { data: userAnalytics }
      ] = await Promise.all([
        supabase.from('system_alerts').select('*'),
        supabase.from('system_metrics').select('*').order('recorded_at', { ascending: false }).limit(1000),
        supabase.from('db_performance_logs').select('*').order('created_at', { ascending: false }).limit(1000),
        supabase.from('user_analytics').select('event_type, user_id, created_at').order('created_at', { ascending: false }).limit(10000)
      ]);

      const totalAlerts = alerts?.length || 0;
      const resolvedAlerts = alerts?.filter(a => a.is_resolved).length || 0;
      const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;

      const averageQueryTime = performanceLogs?.reduce((sum, log) => sum + log.execution_time_ms, 0) / (performanceLogs?.length || 1);
      const slowQueryCount = performanceLogs?.filter(log => log.execution_time_ms > 1000).length || 0;

      const uniqueUsers = new Set(userAnalytics?.map(e => e.user_id)).size;
      const activeUsers = new Set(
        userAnalytics?.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).map(e => e.user_id)
      ).size;

      const featureUsage: Record<string, number> = {};
      userAnalytics?.forEach(event => {
        featureUsage[event.event_type] = (featureUsage[event.event_type] || 0) + 1;
      });

      const topFeatures = Object.entries(featureUsage)
        .map(([feature, usage]) => ({ feature, usage }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10);

      return {
        systemHealth: {
          overallScore: this.calculateHealthScore(averageQueryTime, slowQueryCount, criticalAlerts),
          database: {
            connectionCount: 0, // Would need to implement connection monitoring
            averageQueryTime,
            slowQueryCount
          },
          performance: {
            averageResponseTime: averageQueryTime,
            errorRate: 0, // Would need to calculate from error logs
            uptime: 99.9 // Would need to implement uptime monitoring
          }
        },
        alerts: {
          total: totalAlerts,
          resolved: resolvedAlerts,
          pending: totalAlerts - resolvedAlerts,
          critical: criticalAlerts
        },
        usage: {
          totalUsers: uniqueUsers,
          activeUsers,
          totalEvents: userAnalytics?.length || 0,
          topFeatures
        }
      };
    } catch (error) {
      console.error('Failed to generate system report:', error);
      throw error;
    }
  }

  private calculateHealthScore(avgQueryTime: number, slowQueries: number, criticalAlerts: number): number {
    let score = 100;
    
    // Deduct points for slow queries
    if (avgQueryTime > 1000) score -= 20;
    else if (avgQueryTime > 500) score -= 10;
    
    // Deduct points for slow query count
    score -= Math.min(slowQueries * 2, 30);
    
    // Deduct points for critical alerts
    score -= Math.min(criticalAlerts * 15, 50);
    
    return Math.max(score, 0);
  }

  public async getSystemAlerts(resolved?: boolean): Promise<SystemAlert[]> {
    try {
      let query = supabase.from('system_alerts').select('*').order('created_at', { ascending: false });
      
      if (resolved !== undefined) {
        query = query.eq('is_resolved', resolved);
      }

      const { data } = await query;
      return (data || []).map(alert => ({
        id: alert.id,
        alertType: alert.alert_type,
        severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
        title: alert.title,
        description: alert.description,
        alertData: alert.alert_data as Record<string, any>,
        isResolved: alert.is_resolved,
        resolvedAt: alert.resolved_at,
        resolvedBy: alert.resolved_by,
        createdAt: alert.created_at,
        updatedAt: alert.updated_at
      }));
    } catch (error) {
      console.error('Failed to get system alerts:', error);
      return [];
    }
  }

  public async resolveAlert(alertId: string, resolvedBy: string): Promise<void> {
    try {
      await supabase
        .from('system_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy
        })
        .eq('id', alertId);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  }

  public async createAlert(
    alertType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    title: string,
    description?: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase
        .from('system_alerts')
        .insert({
          alert_type: alertType,
          severity,
          title,
          description,
          alert_data: data || {}
        });
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  }

  // Методы для отслеживания конкретных действий пользователя
  public trackLogin(method: string): void {
    this.trackEvent(ANALYTICS_EVENTS.USER_LOGIN, { method });
  }

  public trackLogout(): void {
    this.trackEvent(ANALYTICS_EVENTS.USER_LOGOUT, {
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1])
    });
  }

  public trackFeatureUse(feature: string, metadata?: Record<string, any>): void {
    this.trackEvent(ANALYTICS_EVENTS.FEATURE_USE, { feature, ...metadata });
  }

  public trackFormSubmit(formName: string, success: boolean, errors?: string[]): void {
    this.trackEvent(ANALYTICS_EVENTS.FORM_SUBMIT, { formName, success, errors });
  }

  public trackSearch(query: string, results: number): void {
    this.trackEvent(ANALYTICS_EVENTS.SEARCH, { query, results });
  }

  public trackApiCall(endpoint: string, method: string, duration: number, success: boolean): void {
    this.trackEvent(ANALYTICS_EVENTS.API_CALL, { endpoint, method, duration, success });
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;
