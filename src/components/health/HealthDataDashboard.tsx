import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Heart, Moon, Footprints } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthDataSummary {
  data_type: string;
  latest_value: any;
  recorded_date: string;
  data_source: string;
  count: number;
}

const DATA_TYPE_CONFIG = {
  steps: { icon: Footprints, label: 'Steps', unit: 'steps', color: 'bg-blue-500' },
  heart_rate: { icon: Heart, label: 'Heart Rate', unit: 'bpm', color: 'bg-red-500' },
  sleep: { icon: Moon, label: 'Sleep', unit: 'hours', color: 'bg-purple-500' },
  strain: { icon: Activity, label: 'Strain', unit: 'score', color: 'bg-orange-500' },
  recovery: { icon: Activity, label: 'Recovery', unit: '%', color: 'bg-green-500' },
  calories: { icon: Activity, label: 'Calories', unit: 'kcal', color: 'bg-yellow-500' },
};

export function HealthDataDashboard() {
  const [healthData, setHealthData] = useState<HealthDataSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadHealthDataSummary();
  }, []);

  const loadHealthDataSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('external_health_data')
        .select(`
          data_type,
          data_payload,
          recorded_date,
          data_source,
          created_at
        `)
        .order('recorded_date', { ascending: false });

      if (error) throw error;

      // Group by data type and get latest value for each
      const grouped = (data || []).reduce((acc: Record<string, any>, item) => {
        const type = item.data_type;
        if (!acc[type] || new Date(item.recorded_date) > new Date(acc[type].recorded_date)) {
          acc[type] = {
            data_type: type,
            latest_value: typeof item.data_payload === 'object' && item.data_payload && 'value' in item.data_payload ? item.data_payload.value : item.data_payload,
            recorded_date: item.recorded_date,
            data_source: item.data_source || 'Unknown',
            count: 1
          };
        } else {
          acc[type].count++;
        }
        return acc;
      }, {});

      setHealthData(Object.values(grouped));
    } catch (error) {
      console.error('Error loading health data:', error);
      toast({
        title: "Error",
        description: "Failed to load health data summary",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (dataType: string, value: any) => {
    if (typeof value === 'object') {
      // Handle complex objects like sleep data
      if (dataType === 'sleep' && value.total) {
        return `${Math.round(value.total / 60)}h ${value.total % 60}m`;
      }
      return JSON.stringify(value);
    }
    
    const config = DATA_TYPE_CONFIG[dataType as keyof typeof DATA_TYPE_CONFIG];
    if (!config) return value;
    
    if (dataType === 'steps') {
      return value.toLocaleString();
    }
    
    return `${value} ${config.unit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (healthData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          No health data available yet. Connect your apps to start seeing your data here.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {healthData.map((item) => {
        const config = DATA_TYPE_CONFIG[item.data_type as keyof typeof DATA_TYPE_CONFIG];
        const Icon = config?.icon || Activity;
        
        return (
          <Card key={item.data_type} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${config?.color || 'bg-gray-500'}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium capitalize">
                  {config?.label || item.data_type.replace('_', ' ')}
                </span>
              </div>
              <Badge variant="outline">{item.count}</Badge>
            </div>
            
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatValue(item.data_type, item.latest_value)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(item.recorded_date).toLocaleDateString()}
              </div>
              {item.data_source && (
                <div className="text-xs text-muted-foreground">
                  from {item.data_source}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}