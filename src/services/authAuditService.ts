import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { productionMonitoringService } from './productionMonitoringService';

export interface AuthAuditEvent {
  action: string;
  userId?: string;
  email?: string;
  userAgent?: string;
  ipAddress?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class AuthAuditService {
  private async getClientInfo() {
    return {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: await this.getSessionId()
    };
  }

  private async getSessionId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token?.slice(-8) || null;
    } catch {
      return null;
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  async logAuthEvent(event: AuthAuditEvent): Promise<void> {
    try {
      const clientInfo = await this.getClientInfo();
      const ipAddress = await this.getClientIP();

      const auditData = {
        action: event.action,
        userId: event.userId,
        email: event.email,
        success: event.success,
        errorMessage: event.errorMessage,
        userAgent: clientInfo.userAgent,
        ipAddress: ipAddress,
        sessionId: clientInfo.sessionId,
        timestamp: clientInfo.timestamp,
        ...event.metadata
      };

      // Используем существующий сервис для логирования
      await productionMonitoringService.logSecurityEvent(
        'authentication',
        event.action,
        auditData,
        event.success ? 'info' : 'medium'
      );

      // Дополнительное консольное логирование для разработки
      console.log(`[AUTH AUDIT] ${event.action}:`, {
        success: event.success,
        email: event.email,
        userId: event.userId,
        error: event.errorMessage
      });

    } catch (error) {
      console.error('Failed to log auth event:', error);
      // Не должно прерывать основной поток аутентификации
    }
  }

  // Специализированные методы для различных auth событий
  async logLoginAttempt(email: string, success: boolean, errorMessage?: string, userId?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'login_attempt',
      email,
      userId,
      success,
      errorMessage,
      metadata: {
        loginMethod: 'email_password'
      }
    });
  }

  async logRegistrationAttempt(email: string, success: boolean, errorMessage?: string, userId?: string, role?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'registration_attempt',
      email,
      userId,
      success,
      errorMessage,
      metadata: {
        role,
        registrationMethod: 'email_password'
      }
    });
  }

  async logLogout(userId: string, email?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'logout',
      userId,
      email,
      success: true
    });
  }

  async logPasswordReset(email: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'password_reset_request',
      email,
      success,
      errorMessage
    });
  }

  async logPasswordUpdate(userId: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'password_update',
      userId,
      success,
      errorMessage
    });
  }

  async logProfileUpdate(userId: string, changes: string[], success: boolean, errorMessage?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'profile_update',
      userId,
      success,
      errorMessage,
      metadata: {
        changedFields: changes
      }
    });
  }

  async logSuspiciousActivity(userId: string, activity: string, details: Record<string, any>): Promise<void> {
    await this.logAuthEvent({
      action: 'suspicious_activity',
      userId,
      success: false,
      metadata: {
        activityType: activity,
        ...details
      }
    });

    // Логируем как критическое событие
    await productionMonitoringService.logSecurityEvent(
      'security_threat',
      'suspicious_auth_activity',
      {
        userId,
        activityType: activity,
        ...details
      },
      'high'
    );
  }

  async logSessionValidation(userId: string, valid: boolean, reason?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'session_validation',
      userId,
      success: valid,
      errorMessage: reason,
      metadata: {
        validationReason: reason
      }
    });
  }

  async logPasswordPolicyEvent(action: string, success: boolean, details: Record<string, any>, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    await this.logAuthEvent({
      action: `password_policy_${action}`,
      success,
      metadata: details
    });

    // Логируем как событие безопасности
    await productionMonitoringService.logSecurityEvent(
      'password_policy',
      action,
      details,
      severity
    );
  }
}

export const authAuditService = new AuthAuditService();