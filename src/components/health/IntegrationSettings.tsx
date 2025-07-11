import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2 } from "lucide-react";

interface IntegrationSettingsProps {
  integrationId: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface Integration {
  id: string;
  app_name: string;
  integration_status: string;
  sync_settings: any;
}

export function IntegrationSettings({ integrationId, onClose, onUpdate }: IntegrationSettingsProps) {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [autoSync, setAutoSync] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegration();
  }, [integrationId]);

  const loadIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('health_app_integrations')
        .select('*')
        .eq('id', integrationId)
        .single();

      if (error) throw error;
      
      setIntegration(data);
      setSyncFrequency('daily');
      setAutoSync(true);
    } catch (error) {
      console.error('Error loading integration:', error);
      toast({
        title: "Error",
        description: "Failed to load integration settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('health_app_integrations')
        .update({
          sync_settings: {
            auto_sync: autoSync
          }
        })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Integration settings have been saved successfully.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save integration settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteIntegration = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('health_app_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Integration Removed",
        description: "Health app integration has been removed successfully.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({
        title: "Error",
        description: "Failed to remove integration",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!integration) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {integration.app_name.charAt(0).toUpperCase() + integration.app_name.slice(1)} Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Automatic Sync</label>
              <p className="text-xs text-muted-foreground">
                Enable automatic data synchronization
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>

          {/* Sync Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sync Frequency</label>
            <Select value={syncFrequency} onValueChange={setSyncFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="real_time">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="text-sm capitalize bg-muted p-2 rounded">
              {integration.integration_status}
            </div>
          </div>


          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={deleteIntegration}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Remove
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={saveSettings} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}