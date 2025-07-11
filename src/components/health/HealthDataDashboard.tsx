import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Heart, Moon, Footprints, Thermometer, Target, Dumbbell, Utensils, Zap, Scale, Users, Droplets } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthDataSummary {
  data_type: string;
  latest_value: any;
  recorded_date: string;
  data_source: string;
  count: number;
}

// Supported health data types configuration
const DATA_TYPE_CONFIG = {
  // Activity & Movement
  steps: { icon: Footprints, label: 'Steps', unit: 'steps', color: 'bg-blue-500' },
  workouts: { icon: Dumbbell, label: 'Workouts', unit: 'sessions', color: 'bg-indigo-500' },
  calories: { icon: Zap, label: 'Calories', unit: 'kcal', color: 'bg-yellow-500' },
  
  // Cardiovascular
  heart_rate: { icon: Heart, label: 'Heart Rate', unit: 'bpm', color: 'bg-red-500' },
  
  // Sleep & Recovery
  sleep: { icon: Moon, label: 'Sleep', unit: 'hours', color: 'bg-purple-500' },
  recovery: { icon: Activity, label: 'Recovery', unit: '%', color: 'bg-green-500' },
  readiness: { icon: Target, label: 'Readiness', unit: 'score', color: 'bg-emerald-500' },
  
  // Stress & Performance
  strain: { icon: Activity, label: 'Strain', unit: 'score', color: 'bg-orange-500' },
  
  // Body Metrics
  temperature: { icon: Thermometer, label: 'Temperature', unit: '°C', color: 'bg-cyan-500' },
  
  // Body Composition (Smart Scale Metrics)
  weight: { icon: Scale, label: 'Weight', unit: 'kg', color: 'bg-slate-600' },
  bmi: { icon: Users, label: 'BMI', unit: '', color: 'bg-violet-500' },
  body_fat: { icon: Users, label: 'Body Fat', unit: '%', color: 'bg-rose-500' },
  muscle_mass: { icon: Dumbbell, label: 'Muscle Mass', unit: 'kg', color: 'bg-lime-600' },
  bone_mass: { icon: Users, label: 'Bone Mass', unit: 'kg', color: 'bg-stone-500' },
  visceral_fat: { icon: Activity, label: 'Visceral Fat', unit: '', color: 'bg-red-600' },
  body_water: { icon: Droplets, label: 'Body Water', unit: '%', color: 'bg-sky-500' },
  bmr: { icon: Zap, label: 'BMR', unit: 'kcal', color: 'bg-orange-600' },
  protein: { icon: Utensils, label: 'Protein', unit: '%', color: 'bg-green-600' },
  
  // Nutrition
  nutrition: { icon: Utensils, label: 'Nutrition', unit: 'entries', color: 'bg-amber-500' },
};

// Validation for supported data types
export const SUPPORTED_DATA_TYPES = Object.keys(DATA_TYPE_CONFIG);

// Validation function for data types
export const validateDataType = (dataType: string): boolean => {
  return SUPPORTED_DATA_TYPES.includes(dataType);
};

// Provider-specific data type mappings
export const PROVIDER_DATA_TYPES = {
  apple_health: ['steps', 'heart_rate', 'workouts', 'sleep', 'nutrition'],
  whoop: ['strain', 'recovery', 'sleep', 'heart_rate'],
  oura: ['sleep', 'readiness', 'temperature', 'heart_rate'],
  fitbit: ['steps', 'workouts', 'sleep', 'heart_rate', 'calories'],
  garmin: ['workouts', 'heart_rate', 'calories', 'sleep'],
  xiaomi_scale: ['weight', 'bmi', 'body_fat', 'muscle_mass', 'bone_mass', 'visceral_fat', 'body_water', 'bmr', 'protein'],
} as const;

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

      // Filter and validate data types, then group by data type and get latest value for each
      const grouped = (data || [])
        .filter(item => {
          // Validate data type is supported
          if (!validateDataType(item.data_type)) {
            console.warn(`Unsupported data type: ${item.data_type}`);
            return false;
          }
          return true;
        })
        .reduce((acc: Record<string, any>, item) => {
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
      // Handle complex objects
      switch (dataType) {
        case 'sleep':
          if (value.total) {
            return `${Math.round(value.total / 60)}h ${value.total % 60}m`;
          }
          if (value.duration) {
            return `${Math.round(value.duration / 3600)}h ${Math.round((value.duration % 3600) / 60)}m`;
          }
          break;
        case 'workouts':
          if (value.duration) {
            return `${Math.round(value.duration / 60)}min`;
          }
          if (value.count) {
            return `${value.count} sessions`;
          }
          break;
        case 'nutrition':
          if (value.entries) {
            return `${value.entries} logged`;
          }
          break;
        case 'temperature':
          if (value.body_temperature) {
            return `${value.body_temperature.toFixed(1)}°C`;
          }
          break;
      }
      return JSON.stringify(value);
    }
    
    const config = DATA_TYPE_CONFIG[dataType as keyof typeof DATA_TYPE_CONFIG];
    if (!config) return value;
    
    // Format specific data types
    switch (dataType) {
      case 'steps':
        return value.toLocaleString();
      case 'calories':
      case 'bmr':
        return Math.round(value).toLocaleString();
      case 'temperature':
        return `${typeof value === 'number' ? value.toFixed(1) : value}°C`;
      case 'weight':
      case 'muscle_mass':
      case 'bone_mass':
        return `${typeof value === 'number' ? value.toFixed(1) : value} kg`;
      case 'bmi':
        return `${typeof value === 'number' ? value.toFixed(1) : value}`;
      case 'body_fat':
      case 'body_water':
      case 'protein':
        return `${Math.round(value)}%`;
      case 'visceral_fat':
        return `${Math.round(value)}`;
      case 'readiness':
      case 'recovery':
      case 'strain':
        return `${Math.round(value)}`;
      case 'heart_rate':
        return Math.round(value);
      default:
        return `${value} ${config.unit}`;
    }
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