import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from './analyticsService';

export interface SecurityAuditLog {
  id: string;
  auditType: string;
  tableName?: string;
  policyName?: string;
  userId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

export interface DataRetentionPolicy {
  id: string;
  tableName: string;
  retentionPeriodDays: number;
  deletionStrategy: 'soft_delete' | 'hard_delete' | 'archive';
  lastCleanupAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckResult {
  checkType: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTimeMs?: number;
  errorMessage?: string;
  details: Record<string, any>;
  checkedAt: string;
}

export interface ComplianceRecord {
  id: string;
  complianceType: 'gdpr' | 'medical_data' | 'user_consent';
  userId?: string;
  action: string;
  dataTypes: string[];
  processingBasis?: string;
  retentionPeriodDays?: number;
  automated: boolean;
  details: Record<string, any>;
  createdAt: string;
}

class ProductionMonitoringService {
  // Security Audit Methods
  async logSecurityEvent(
    auditType: string,
    action: string,
    details: Record<string, any>,
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical' = 'info',
    tableName?: string,
    policyName?: string
  ): Promise<void> {
    try {
      await supabase
        .from('security_audit_log')
        .insert({
          audit_type: auditType,
          table_name: tableName,
          policy_name: policyName,
          action,
          details,
          severity,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async getSecurityAuditLog(
    limit: number = 100,
    severity?: string,
    auditType?: string
  ): Promise<SecurityAuditLog[]> {
    try {
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (severity) {
        query = query.eq('severity', severity);
      }

      if (auditType) {
        query = query.eq('audit_type', auditType);
      }

      const { data } = await query;
      return (data || []).map(this.mapSecurityAuditLog);
    } catch (error) {
      console.error('Failed to get security audit log:', error);
      return [];
    }
  }

  private mapSecurityAuditLog(item: any): SecurityAuditLog {
    return {
      id: item.id,
      auditType: item.audit_type,
      tableName: item.table_name,
      policyName: item.policy_name,
      userId: item.user_id,
      action: item.action,
      details: item.details,
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      severity: item.severity,
      createdAt: item.created_at
    };
  }

  // Data Retention Methods
  async getDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    try {
      const { data } = await supabase
        .from('data_retention_policies')
        .select('*')
        .order('table_name');

      return (data || []).map(item => ({
        id: item.id,
        tableName: item.table_name,
        retentionPeriodDays: item.retention_period_days,
        deletionStrategy: item.deletion_strategy as 'soft_delete' | 'hard_delete' | 'archive',
        lastCleanupAt: item.last_cleanup_at,
        isActive: item.is_active,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error('Failed to get data retention policies:', error);
      return [];
    }
  }

  async updateDataRetentionPolicy(
    id: string,
    updates: Partial<DataRetentionPolicy>
  ): Promise<void> {
    try {
      await supabase
        .from('data_retention_policies')
        .update({
          retention_period_days: updates.retentionPeriodDays,
          deletion_strategy: updates.deletionStrategy,
          is_active: updates.isActive
        })
        .eq('id', id);

      await this.logSecurityEvent(
        'data_retention',
        'policy_updated',
        { policyId: id, updates }
      );
    } catch (error) {
      console.error('Failed to update data retention policy:', error);
      throw error;
    }
  }

  async triggerDataCleanup(): Promise<void> {
    try {
      await supabase.rpc('cleanup_old_data');
      
      await this.logSecurityEvent(
        'data_cleanup',
        'manual_trigger',
        { triggeredBy: 'admin', timestamp: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Failed to trigger data cleanup:', error);
      throw error;
    }
  }

  // Health Check Methods
  async performHealthCheck(): Promise<HealthCheckResult> {
    try {
      const { data } = await supabase.rpc('perform_health_check');
      const result = data as any;
      
      return {
        checkType: 'database',
        status: result.database?.status || 'unhealthy',
        responseTimeMs: result.database?.response_time_ms,
        details: result || {},
        checkedAt: result.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to perform health check:', error);
      return {
        checkType: 'database',
        status: 'unhealthy',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        details: {},
        checkedAt: new Date().toISOString()
      };
    }
  }

  async getHealthCheckHistory(limit: number = 50): Promise<HealthCheckResult[]> {
    try {
      const { data } = await supabase
        .from('system_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(limit);

      return (data || []).map(item => ({
        checkType: item.check_type,
        status: item.status as 'healthy' | 'degraded' | 'unhealthy',
        responseTimeMs: item.response_time_ms,
        errorMessage: item.error_message,
        details: item.details as Record<string, any>,
        checkedAt: item.checked_at
      }));
    } catch (error) {
      console.error('Failed to get health check history:', error);
      return [];
    }
  }

  // Compliance Methods
  async logComplianceEvent(
    complianceType: 'gdpr' | 'medical_data' | 'user_consent',
    action: string,
    userId?: string,
    dataTypes: string[] = [],
    processingBasis?: string,
    retentionPeriodDays?: number,
    automated: boolean = false,
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      await supabase
        .from('compliance_log')
        .insert({
          compliance_type: complianceType,
          user_id: userId,
          action,
          data_types: dataTypes,
          processing_basis: processingBasis,
          retention_period_days: retentionPeriodDays,
          automated,
          details
        });
    } catch (error) {
      console.error('Failed to log compliance event:', error);
    }
  }

  async getComplianceLog(
    userId?: string,
    complianceType?: string,
    limit: number = 100
  ): Promise<ComplianceRecord[]> {
    try {
      let query = supabase
        .from('compliance_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (complianceType) {
        query = query.eq('compliance_type', complianceType);
      }

      const { data } = await query;
      return (data || []).map(item => ({
        id: item.id,
        complianceType: item.compliance_type as 'gdpr' | 'medical_data' | 'user_consent',
        userId: item.user_id,
        action: item.action,
        dataTypes: item.data_types || [],
        processingBasis: item.processing_basis,
        retentionPeriodDays: item.retention_period_days,
        automated: item.automated,
        details: item.details as Record<string, any>,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Failed to get compliance log:', error);
      return [];
    }
  }

  // GDPR Compliance Methods
  async requestDataExport(userId: string): Promise<void> {
    try {
      // Log the request
      await this.logComplianceEvent(
        'gdpr',
        'data_export_requested',
        userId,
        ['all'],
        'consent',
        undefined,
        false,
        { requestedAt: new Date().toISOString() }
      );

      // In production, this would trigger a background job to generate the export
      await analyticsService.trackEvent('feature_use', {
        feature: 'gdpr_data_export',
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to request data export:', error);
      throw error;
    }
  }

  async requestDataDeletion(userId: string, dataTypes: string[] = ['all']): Promise<void> {
    try {
      await this.logComplianceEvent(
        'gdpr',
        'data_deletion_requested',
        userId,
        dataTypes,
        'user_request',
        undefined,
        false,
        { 
          requestedAt: new Date().toISOString(),
          dataTypes,
          status: 'pending'
        }
      );

      await analyticsService.trackEvent('feature_use', {
        feature: 'gdpr_data_deletion',
        userId,
        dataTypes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      throw error;
    }
  }

  // RLS Policy Audit
  async auditRLSPolicies(): Promise<any[]> {
    try {
      const { data } = await supabase.rpc('audit_rls_policies');
      
      await this.logSecurityEvent(
        'rls_audit',
        'policies_audited',
        { totalPolicies: data?.length || 0 }
      );

      return data || [];
    } catch (error) {
      console.error('Failed to audit RLS policies:', error);
      return [];
    }
  }

  // Performance Monitoring
  async getSlowQueries(limit: number = 20): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('db_performance_logs')
        .select('*')
        .gte('execution_time_ms', 1000)
        .order('execution_time_ms', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Failed to get slow queries:', error);
      return [];
    }
  }

  async getSystemMetricsSummary(hours: number = 24): Promise<any> {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      
      const { data } = await supabase
        .from('system_metrics')
        .select('metric_name, metric_value, recorded_at')
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: false });

      // Group by metric name and calculate averages
      const metrics = (data || []).reduce((acc, item) => {
        if (!acc[item.metric_name]) {
          acc[item.metric_name] = [];
        }
        acc[item.metric_name].push(item.metric_value);
        return acc;
      }, {} as Record<string, number[]>);

      return Object.entries(metrics).map(([name, values]) => ({
        metricName: name,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: values.length
      }));
    } catch (error) {
      console.error('Failed to get system metrics summary:', error);
      return [];
    }
  }

  // Utility Methods
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Backup Verification
  async logBackupVerification(
    backupDate: string,
    backupType: 'daily' | 'weekly' | 'monthly',
    status: 'success' | 'failed' | 'partial',
    backupSizeBytes?: number,
    details: Record<string, any> = {},
    recoveryTestPassed: boolean = false
  ): Promise<void> {
    try {
      await supabase
        .from('backup_verification_log')
        .insert({
          backup_date: backupDate,
          backup_type: backupType,
          verification_status: status,
          backup_size_bytes: backupSizeBytes,
          verification_details: details,
          recovery_test_passed: recoveryTestPassed
        });
    } catch (error) {
      console.error('Failed to log backup verification:', error);
    }
  }

  async getBackupVerificationLog(limit: number = 30): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('backup_verification_log')
        .select('*')
        .order('backup_date', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Failed to get backup verification log:', error);
      return [];
    }
  }
}

export const productionMonitoringService = new ProductionMonitoringService();
export default productionMonitoringService;