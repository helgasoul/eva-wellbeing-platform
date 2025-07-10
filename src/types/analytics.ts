export interface AnalyticsEvent {
  type: string;
  data?: Record<string, any>;
  sessionId?: string;
  pageUrl?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  ttfb: number;
}

export interface UserAction {
  action: string;
  target?: string;
  value?: any;
  metadata?: Record<string, any>;
}

export interface UserAnalyticsReport {
  userId: string;
  totalEvents: number;
  lastActivity: string;
  topEvents: Array<{
    eventType: string;
    count: number;
  }>;
  sessionStats: {
    totalSessions: number;
    averageSessionLength: number;
    averageEventsPerSession: number;
  };
  retentionMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
}

export interface SystemReport {
  systemHealth: {
    overallScore: number;
    database: {
      connectionCount: number;
      averageQueryTime: number;
      slowQueryCount: number;
    };
    performance: {
      averageResponseTime: number;
      errorRate: number;
      uptime: number;
    };
  };
  alerts: {
    total: number;
    resolved: number;
    pending: number;
    critical: number;
  };
  usage: {
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    topFeatures: Array<{
      feature: string;
      usage: number;
    }>;
  };
}

export interface SystemAlert {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  alertData: Record<string, any>;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBPerformanceLog {
  id: string;
  queryType: string;
  tableName?: string;
  executionTimeMs: number;
  rowsAffected?: number;
  queryHash?: string;
  errorMessage?: string;
  userId?: string;
  createdAt: string;
}

export interface SystemMetric {
  id: string;
  metricName: string;
  metricValue: number;
  metricData: Record<string, any>;
  metricCategory: string;
  recordedAt: string;
}

// Event types для аналитики
export const ANALYTICS_EVENTS = {
  // Пользовательские действия
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  FEATURE_USE: 'feature_use',
  
  // Бизнес события
  SYMPTOM_ENTRY: 'symptom_entry',
  NUTRITION_LOG: 'nutrition_log',
  CYCLE_TRACK: 'cycle_track',
  APPOINTMENT_BOOK: 'appointment_book',
  DOCUMENT_UPLOAD: 'document_upload',
  
  // Системные события
  ERROR_OCCURRED: 'error_occurred',
  PERFORMANCE_ISSUE: 'performance_issue',
  API_CALL: 'api_call',
  SYNC_COMPLETED: 'sync_completed',
  OFFLINE_MODE: 'offline_mode',
  
  // Engagement события
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  USER_ENGAGEMENT: 'user_engagement',
  FEATURE_DISCOVERY: 'feature_discovery',
} as const;

export type AnalyticsEventType = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];