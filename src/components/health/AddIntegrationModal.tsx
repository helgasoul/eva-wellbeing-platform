import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  description: string;
  icon: string;
  dataTypes: string[];
}

interface AddIntegrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providers: Provider[];
  onSuccess: () => void;
}

export function AddIntegrationModal({ open, onOpenChange, providers, onSuccess }: AddIntegrationModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedProvider) {
      toast({
        title: "Error",
        description: "Please select a provider",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('health_app_integrations')
        .insert({
          user_id: user.id,
          app_name: selectedProvider,
          provider_name: selectedProvider,
          integration_status: 'pending',
          sync_frequency: syncFrequency,
          scopes_granted: selectedDataTypes,
          sync_settings: {
            auto_sync: true,
            data_types: selectedDataTypes
          }
        });

      if (error) throw error;

      toast({
        title: "Integration Added",
        description: "Health app integration has been configured. You can now sync data.",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error adding integration:', error);
      toast({
        title: "Error",
        description: "Failed to add health app integration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProvider('');
    setSelectedDataTypes([]);
    setSyncFrequency('daily');
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, dataType]);
    } else {
      setSelectedDataTypes(prev => prev.filter(dt => dt !== dataType));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Health Integration</DialogTitle>
          <DialogDescription>
            Connect a health app or device to automatically sync your health data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Choose Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a health app or device" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex items-center gap-2">
                      <span>{provider.icon}</span>
                      {provider.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Types Selection */}
          {selectedProviderData && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Types to Sync</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedProviderData.dataTypes.map((dataType) => (
                  <div key={dataType} className="flex items-center space-x-2">
                    <Checkbox
                      id={dataType}
                      checked={selectedDataTypes.includes(dataType)}
                      onCheckedChange={(checked) => 
                        handleDataTypeChange(dataType, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={dataType}
                      className="text-sm capitalize cursor-pointer"
                    >
                      {dataType.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !selectedProvider}
              className="flex-1"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Integration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}