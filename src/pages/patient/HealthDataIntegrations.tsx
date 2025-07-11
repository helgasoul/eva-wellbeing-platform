import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Settings, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { HealthProviderCard } from "@/components/health/HealthProviderCard";
import { HealthDataDashboard } from "@/components/health/HealthDataDashboard";
import { AddIntegrationModal } from "@/components/health/AddIntegrationModal";
import { IntegrationSettings } from "@/components/health/IntegrationSettings";

interface HealthIntegration {
  id: string;
  app_name: string;
  provider_name?: string;
  integration_status: string;
  last_sync_at: string | null;
  sync_frequency?: string;
  scopes_granted?: string[] | null;
  error_details?: any;
  created_at: string;
}

const SUPPORTED_PROVIDERS = [
  {
    id: 'apple_health',
    name: 'Apple Health',
    description: 'Sync data from Apple Health app including steps, heart rate, and workouts',
    icon: '🍎',
    dataTypes: ['steps', 'heart_rate', 'workouts', 'sleep', 'nutrition']
  },
  {
    id: 'whoop',
    name: 'Whoop',
    description: 'Connect your Whoop device for strain, recovery, and sleep data',
    icon: '💪',
    dataTypes: ['strain', 'recovery', 'sleep', 'heart_rate']
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    description: 'Import sleep, readiness, and activity data from your Oura Ring',
    icon: '💍',
    dataTypes: ['sleep', 'readiness', 'temperature', 'heart_rate']
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Sync steps, exercise, sleep, and health metrics from Fitbit',
    icon: '⌚',
    dataTypes: ['steps', 'exercise', 'sleep', 'heart_rate', 'calories']
  },
  {
    id: 'garmin',
    name: 'Garmin',
    description: 'Connect Garmin devices for workout and health tracking data',
    icon: '🏃',
    dataTypes: ['workouts', 'heart_rate', 'stress', 'body_battery']
  }
];

export default function HealthDataIntegrations() {
  const [integrations, setIntegrations] = useState<HealthIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('health_app_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load health app integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncIntegration = async (integration: HealthIntegration) => {
    setSyncing(integration.id);
    try {
      const { data, error } = await supabase.functions.invoke('health-data-sync', {
        body: {
          integration_id: integration.id,
          provider: integration.provider_name || integration.app_name,
          data_types: integration.scopes_granted || []
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Started",
        description: `Health data sync initiated for ${integration.provider_name || integration.app_name}`,
      });

      // Reload integrations to get updated sync status
      setTimeout(() => {
        loadIntegrations();
      }, 2000);

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync health data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'error': return 'destructive';
      case 'revoked': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Data Integrations</h1>
          <p className="text-muted-foreground">
            Connect your health apps and devices to sync data automatically
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Active Integrations */}
      {integrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connected Apps</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => {
              const provider = SUPPORTED_PROVIDERS.find(p => p.id === (integration.provider_name || integration.app_name));
              return (
                <Card key={integration.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{provider?.icon}</span>
                      <div>
                        <h3 className="font-semibold">{provider?.name}</h3>
                        <Badge variant={getStatusColor(integration.integration_status)}>
                          {getStatusIcon(integration.integration_status)}
                          <span className="ml-1 capitalize">{integration.integration_status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncIntegration(integration)}
                        disabled={syncing === integration.id}
                      >
                        {syncing === integration.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSettings(integration.id)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Last sync: {integration.last_sync_at 
                        ? new Date(integration.last_sync_at).toLocaleDateString() 
                        : 'Never'}
                    </div>
                    <div>Frequency: {integration.sync_frequency || 'daily'}</div>
                    {integration.scopes_granted && (
                      <div>
                        Data types: {integration.scopes_granted.join(', ')}
                      </div>
                    )}
                  </div>

                  {integration.error_details && (
                    <div className="mt-3 p-2 bg-destructive/10 rounded text-sm text-destructive">
                      Error: {integration.error_details.error}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Integrations</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SUPPORTED_PROVIDERS
            .filter(provider => !integrations.some(i => (i.provider_name || i.app_name) === provider.id))
            .map((provider) => (
              <HealthProviderCard
                key={provider.id}
                provider={provider}
                onConnect={() => setShowAddModal(true)}
              />
            ))}
        </div>
      </div>

      {/* Health Data Dashboard */}
      {integrations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Health Data Overview</h2>
          <HealthDataDashboard />
        </div>
      )}

      {/* Modals */}
      <AddIntegrationModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        providers={SUPPORTED_PROVIDERS}
        onSuccess={loadIntegrations}
      />

      {showSettings && (
        <IntegrationSettings
          integrationId={showSettings}
          onClose={() => setShowSettings(null)}
          onUpdate={loadIntegrations}
        />
      )}
    </div>
  );
}