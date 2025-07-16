import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Database, 
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseErrorHandler } from '@/hooks/useSupabaseErrorHandler';

interface SystemAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  resolved?: boolean;
  created_at: string | null;
}

interface HealthCheck {
  id: string;
  check_type: string;
  status: string;
  response_time_ms: number | null;
  created_at: string;
}

interface AuthError {
  id: string;
  error_type: string;
  error_message: string;
  user_id: string | null;
  created_at: string | null;
  recovery_attempted: boolean | null;
}

export const SystemMonitor: React.FC = () => {
  const { executeWithErrorHandling } = useSupabaseErrorHandler();
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [authErrors, setAuthErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    setIsLoading(true);
    
    // Load system alerts
    const alerts = await executeWithErrorHandling(
      async () => {
        const { data } = await supabase
          .from('system_alerts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        return data?.map(alert => ({
          id: alert.id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          resolved: (alert as any).resolved || false,
          created_at: alert.created_at
        })) || [];
      },
      [],
      { skipErrorToast: true }
    );
    
    if (alerts) setSystemAlerts(alerts);

    // Load health checks
    const health = await executeWithErrorHandling(
      async () => {
        const { data } = await supabase
          .from('system_health_checks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        return data?.map(check => ({
          id: check.id,
          check_type: check.check_type,
          status: check.status,
          response_time_ms: check.response_time_ms,
          created_at: (check as any).created_at || new Date().toISOString()
        })) || [];
      },
      [],
      { skipErrorToast: true }
    );
    
    if (health) setHealthChecks(health);

    // Load auth errors
    const errors = await executeWithErrorHandling(
      async () => {
        const { data } = await supabase
          .from('auth_error_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        return data || [];
      },
      [],
      { skipErrorToast: true }
    );
    
    if (errors) setAuthErrors(errors);

    setIsLoading(false);
  };

  const runHealthCheck = async () => {
    await executeWithErrorHandling(
      async () => {
        const { data } = await supabase.rpc('perform_health_check');
        await loadMonitoringData();
        return data;
      },
      null,
      { 
        successMessage: 'Health check completed',
        skipErrorToast: false
      }
    );
  };

  const resolveAlert = async (alertId: string) => {
    await executeWithErrorHandling(
      async () => {
        const { data } = await supabase
          .from('system_alerts')
          .update({ resolved: true, resolved_at: new Date().toISOString() })
          .eq('id', alertId);
        await loadMonitoringData();
        return data;
      },
      null,
      { 
        successMessage: 'Alert resolved',
        skipErrorToast: false
      }
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const currentSystemStatus = healthChecks.length > 0 ? healthChecks[0].status : 'unknown';
  const unresolvedAlerts = systemAlerts.filter(alert => !alert.resolved);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">System Monitor</h1>
        </div>
        <Button onClick={runHealthCheck} className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Run Health Check
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(currentSystemStatus)}
              <span className="text-2xl font-bold capitalize">{currentSystemStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unresolved Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unresolvedAlerts.length}</div>
            <div className="flex gap-1 mt-2">
              {unresolvedAlerts.slice(0, 3).map(alert => (
                <Badge 
                  key={alert.id} 
                  variant="secondary" 
                  className={getSeverityColor(alert.severity)}
                >
                  {alert.severity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authErrors.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="errors">Auth Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-4">
            {systemAlerts.map(alert => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <div>
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {!alert.resolved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                 <CardContent>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Clock className="w-4 h-4" />
                     {formatRelativeTime(alert.created_at || new Date().toISOString())}
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <div className="space-y-4">
            {healthChecks.map(check => (
              <Card key={check.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-base capitalize">{check.check_type}</CardTitle>
                         <CardDescription>
                           Response time: {check.response_time_ms || 0}ms
                         </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <span className="font-medium capitalize">{check.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatRelativeTime(check.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="mt-6">
          <div className="space-y-4">
            {authErrors.map(error => (
              <Card key={error.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <div>
                        <CardTitle className="text-base">{error.error_type}</CardTitle>
                        <CardDescription>{error.error_message}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={error.recovery_attempted ? "default" : "secondary"}>
                      {error.recovery_attempted ? "Recovery attempted" : "Unhandled"}
                    </Badge>
                  </div>
                </CardHeader>
                 <CardContent>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Clock className="w-4 h-4" />
                     {formatRelativeTime(error.created_at || new Date().toISOString())}
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};