
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  Upload,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useDataBridge } from '@/services/DataBridgeService';
import type { DataHealthReport, DataBridgeMetrics, DataAuditEntry } from '@/types/dataBridgeService';

export const DataBridgeMonitor: React.FC = () => {
  const dataBridge = useDataBridge();
  const [healthReport, setHealthReport] = useState<DataHealthReport | null>(null);
  const [metrics, setMetrics] = useState<DataBridgeMetrics | null>(null);
  const [auditTrail, setAuditTrail] = useState<DataAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditFilters, setAuditFilters] = useState({
    userId: '',
    action: '',
    dataType: '',
    limit: 50
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Effect to reload audit trail when filters change
  useEffect(() => {
    if (auditFilters.userId || auditFilters.action || auditFilters.dataType) {
      loadAuditTrail();
    }
  }, [auditFilters]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [health, metricsData, audit] = await Promise.all([
        dataBridge.performHealthCheck(),
        dataBridge.getMetrics(),
        dataBridge.getAuditTrail({ startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() })
      ]);
      
      setHealthReport(health);
      setMetrics(metricsData);
      setAuditTrail(audit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const filters: any = {};
      if (auditFilters.userId) filters.userId = auditFilters.userId;
      if (auditFilters.action) filters.action = auditFilters.action;
      if (auditFilters.dataType) filters.dataType = auditFilters.dataType;
      
      const audit = await dataBridge.getAuditTrail(filters);
      setAuditTrail(audit.slice(0, auditFilters.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit trail');
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await dataBridge.exportData({
        format: 'json',
        includeMetadata: true,
        compressionEnabled: true
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Bridge Monitor</h1>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Health Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {healthReport && getHealthIcon(healthReport.overall)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthReport ? getHealthColor(healthReport.overall) : 'text-gray-400'}`}>
              {healthReport?.overall || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthReport?.issues.length || 0} issues detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Integrity</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.dataIntegrityScore?.toFixed(1) || 0}%
            </div>
            <Progress value={metrics?.dataIntegrityScore || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Success</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? ((metrics.successfulTransfers / Math.max(metrics.totalTransfers, 1)) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.successfulTransfers || 0} of {metrics?.totalTransfers || 0} transfers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.storageUtilization?.toFixed(1) || 0}%
            </div>
            <Progress value={metrics?.storageUtilization || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health Report</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {healthReport?.issues.length ? (
                <div className="space-y-4">
                  {healthReport.issues.map((issue, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className={`p-1 rounded-full ${
                        issue.severity === 'high' ? 'bg-red-100' :
                        issue.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {issue.severity === 'high' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : issue.severity === 'medium' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                            {issue.severity}
                          </Badge>
                          <span className="font-medium">{issue.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>Action:</strong> {issue.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium">All systems healthy</p>
                  <p className="text-sm text-muted-foreground">No issues detected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {healthReport?.recommendations.length && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {healthReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Transfer Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Transfers:</span>
                  <span className="font-bold">{metrics?.totalTransfers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful:</span>
                  <span className="font-bold text-green-600">{metrics?.successfulTransfers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Failed:</span>
                  <span className="font-bold text-red-600">{metrics?.failedTransfers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Time:</span>
                  <span className="font-bold">{metrics?.averageTransferTime?.toFixed(2) || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className="font-bold">{((metrics?.errorRate || 0) * 100).toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Data Integrity:</span>
                  <span className="font-bold">{metrics?.dataIntegrityScore?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Usage:</span>
                  <span className="font-bold">{metrics?.storageUtilization?.toFixed(1) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span className="font-bold text-xs">
                    {metrics?.lastBackupTime !== 'never' 
                      ? new Date(metrics?.lastBackupTime || '').toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User ID</label>
                  <input
                    type="text"
                    value={auditFilters.userId}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="All users"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select 
                    value={auditFilters.action}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, action: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All actions</option>
                    <option value="create">Create</option>
                    <option value="read">Read</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="transfer">Transfer</option>
                    <option value="backup">Backup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data Type</label>
                  <input
                    type="text"
                    value={auditFilters.dataType}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, dataType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="All types"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Limit</label>
                  <select 
                    value={auditFilters.limit}
                    onChange={(e) => setAuditFilters(prev => ({ ...prev, limit: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {auditTrail.length ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditTrail.map((entry, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-1 rounded-full bg-blue-100">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{entry.action}</Badge>
                              <span className="font-medium">{entry.dataType}</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              User: {entry.userId} • Keys: {entry.affectedKeys.join(', ')}
                            </div>
                            {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                              <div className="text-xs text-gray-500 mt-2 bg-gray-100 p-2 rounded">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(entry.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Bridge Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Validation Enabled</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Backup Enabled</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Audit Logging</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Encryption</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
