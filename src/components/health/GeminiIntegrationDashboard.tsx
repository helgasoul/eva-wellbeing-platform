import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  RotateCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';
import { GeminiDataCollector, createGeminiIntegration, type SyncResult } from '@/services/geminiDataCollector';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  provider_name: string;
  integration_status: string;
  last_sync_at: string | null;
  sync_frequency: string;
}

interface QualityMetrics {
  totalRecords: number;
  averageQuality: number;
  errorRate: number;
  lastSyncAt: string | null;
}

export const GeminiIntegrationDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [collectors, setCollectors] = useState<Map<string, GeminiDataCollector>>(new Map());
  const [syncStatuses, setSyncStatuses] = useState<Map<string, 'idle' | 'syncing' | 'completed' | 'error'>>(new Map());
  const [qualityMetrics, setQualityMetrics] = useState<Map<string, QualityMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('health_app_integrations')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIntegrations(data || []);

      // Initialize collectors for each integration
      const newCollectors = new Map();
      const newSyncStatuses = new Map();
      const newQualityMetrics = new Map();

      for (const integration of data || []) {
        const collector = new GeminiDataCollector({
          integrationId: integration.id,
          provider: integration.provider_name,
          dataTypes: ['steps', 'heart_rate', 'sleep', 'calories'],
          syncFrequency: integration.sync_frequency as 'real-time' | 'hourly' | 'daily' | 'weekly',
          autoRetry: true,
          maxRetries: 3
        });

        newCollectors.set(integration.id, collector);
        newSyncStatuses.set(integration.id, 'idle');

        // Load quality metrics
        try {
          const metrics = await collector.getDataQualityMetrics();
          newQualityMetrics.set(integration.id, metrics);
        } catch (error) {
          console.error(`Failed to load metrics for ${integration.id}:`, error);
        }
      }

      setCollectors(newCollectors);
      setSyncStatuses(newSyncStatuses);
      setQualityMetrics(newQualityMetrics);
    } catch (error) {
      console.error('Failed to load integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load health data integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (integrationId: string, fullSync = false) => {
    const collector = collectors.get(integrationId);
    if (!collector) return;

    setSyncStatuses(prev => new Map(prev.set(integrationId, 'syncing')));

    try {
      const result: SyncResult = await collector.startSync(fullSync);
      
      setSyncStatuses(prev => new Map(prev.set(integrationId, 
        result.success ? 'completed' : 'error'
      )));

      // Refresh metrics
      const metrics = await collector.getDataQualityMetrics();
      setQualityMetrics(prev => new Map(prev.set(integrationId, metrics)));

      toast({
        title: result.success ? "Sync Completed" : "Sync Failed",
        description: `${result.recordsSynced} records synced, ${result.recordsFailed} failed`,
        variant: result.success ? "default" : "destructive"
      });

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatuses(prev => new Map(prev.set(integrationId, 'idle')));
      }, 3000);

    } catch (error) {
      setSyncStatuses(prev => new Map(prev.set(integrationId, 'error')));
      toast({
        title: "Sync Error",
        description: "Failed to sync health data",
        variant: "destructive"
      });

      setTimeout(() => {
        setSyncStatuses(prev => new Map(prev.set(integrationId, 'idle')));
      }, 3000);
    }
  };

  const handleAddIntegration = async (provider: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { integrationId, collector } = await createGeminiIntegration(
        user.user.id,
        provider,
        {
          dataTypes: ['steps', 'heart_rate', 'sleep', 'calories'],
          syncFrequency: 'daily'
        }
      );

      toast({
        title: "Integration Added",
        description: `${provider} integration created successfully`,
      });

      await loadIntegrations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add integration",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RotateCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RotateCw className="h-6 w-6 animate-spin mr-2" />
              Loading integrations...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gemini Health Data Integrations</h2>
          <p className="text-muted-foreground">
            Manage your health data connections and sync status
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleAddIntegration('apple_health')}
            size="sm"
          >
            <Zap className="h-4 w-4 mr-2" />
            Add Apple Health
          </Button>
          <Button 
            onClick={() => handleAddIntegration('whoop')}
            variant="outline"
            size="sm"
          >
            Add Whoop
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const syncStatus = syncStatuses.get(integration.id) || 'idle';
          const metrics = qualityMetrics.get(integration.id);

          return (
            <Card key={integration.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">
                    {integration.provider_name.replace('_', ' ')}
                  </CardTitle>
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(integration.integration_status)}
                  >
                    {integration.integration_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Records</p>
                    <p className="font-semibold flex items-center">
                      <Database className="h-4 w-4 mr-1" />
                      {metrics?.totalRecords || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data Quality</p>
                    <p className="font-semibold flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {metrics?.averageQuality ? `${(metrics.averageQuality * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {metrics?.errorRate !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span>{(metrics.errorRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(1 - metrics.errorRate) * 100} 
                      className="h-2"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {getStatusIcon(syncStatus)}
                    <span className="ml-2">
                      {syncStatus === 'syncing' ? 'Syncing...' : 
                       integration.last_sync_at 
                         ? `Last: ${new Date(integration.last_sync_at).toLocaleDateString()}`
                         : 'Never synced'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id, false)}
                      disabled={syncStatus === 'syncing'}
                    >
                      <Activity className="h-4 w-4 mr-1" />
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSync(integration.id, true)}
                      disabled={syncStatus === 'syncing'}
                    >
                      Full Sync
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {integrations.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your health devices to start collecting data
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => handleAddIntegration('apple_health')}>
                  Add Apple Health
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleAddIntegration('whoop')}
                >
                  Add Whoop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};