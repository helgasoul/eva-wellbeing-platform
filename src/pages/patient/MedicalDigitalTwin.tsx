import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { medicalDigitalTwinService } from "@/services/medicalDigitalTwinService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Heart, Weight, Smartphone, TrendingUp, Database } from "lucide-react";
import { toast } from "sonner";

export default function MedicalDigitalTwin() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ isOnline: boolean; lastSync?: string }>({ isOnline: false });

  useEffect(() => {
    if (user?.id) {
      loadHealthData();
      checkSyncStatus();
    }
  }, [user?.id]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const data = await medicalDigitalTwinService.getComprehensiveHealthData(user!.id);
      setHealthData(data);
    } catch (error) {
      console.error('Error loading health data:', error);
      toast.error('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const checkSyncStatus = async () => {
    try {
      const status = await medicalDigitalTwinService.checkSyncStatus(user!.id);
      setSyncStatus(status);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  };

  const addSampleData = async () => {
    try {
      // Add sample glucose metric
      await medicalDigitalTwinService.saveGlucoseMetric(user!.id, {
        measurement_value: 95.5,
        measurement_type: 'fasting',
        measurement_time: '08:00',
        device_source: 'FreeStyle Libre',
        recorded_at: new Date().toISOString()
      });

      // Add sample body composition
      await medicalDigitalTwinService.saveBodyCompositionMetric(user!.id, {
        weight_kg: 65.5,
        body_fat_percentage: 22.5,
        muscle_mass_kg: 45.2,
        bmi: 22.8,
        measurement_date: new Date().toISOString().split('T')[0],
        measurement_method: 'Bioelectrical Impedance',
        device_source: 'InBody Scale'
      });

      // Add sample physical activity
      await medicalDigitalTwinService.savePhysicalActivity(user!.id, {
        activity_type: 'Running',
        duration_minutes: 30,
        intensity_level: 'moderate',
        calories_burned: 300,
        heart_rate_avg: 145,
        distance_km: 4.5,
        steps_count: 5200,
        activity_date: new Date().toISOString().split('T')[0],
        device_source: 'Apple Watch'
      });

      toast.success('Sample data added successfully!');
      loadHealthData();
    } catch (error) {
      console.error('Error adding sample data:', error);
      toast.error('Failed to add sample data');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading medical digital twin data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical Digital Twin</h1>
          <p className="text-muted-foreground">
            Comprehensive health monitoring and analytics powered by AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
            {syncStatus.isOnline ? "Online" : "Offline"}
          </Badge>
          <Button onClick={addSampleData} variant="outline" size="sm">
            Add Sample Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Points</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData?.summary?.totalDataPoints || 0}</div>
            <p className="text-xs text-muted-foreground">Across all metrics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData?.summary?.connectedDevices || 0}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patterns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData?.summary?.activePatterns || 0}</div>
            <p className="text-xs text-muted-foreground">Health insights detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleDateString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">Data synchronization</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Glucose Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Glucose Metrics
            </CardTitle>
            <CardDescription>Recent blood glucose measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {healthData?.glucoseMetrics?.length > 0 ? (
              <div className="space-y-2">
                {healthData.glucoseMetrics.slice(0, 3).map((metric: any) => (
                  <div key={metric.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{metric.measurement_value} {metric.measurement_unit}</span>
                      <span className="text-sm text-muted-foreground ml-2">({metric.measurement_type})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(metric.recorded_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No glucose metrics available</p>
            )}
          </CardContent>
        </Card>

        {/* Body Composition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Weight className="h-5 w-5" />
              Body Composition
            </CardTitle>
            <CardDescription>Weight and body composition tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {healthData?.bodyComposition?.length > 0 ? (
              <div className="space-y-2">
                {healthData.bodyComposition.slice(0, 3).map((metric: any) => (
                  <div key={metric.id} className="p-2 bg-muted rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">Weight: {metric.weight_kg} kg</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(metric.measurement_date).toLocaleDateString()}
                      </span>
                    </div>
                    {metric.body_fat_percentage && (
                      <div className="text-sm text-muted-foreground">
                        Body Fat: {metric.body_fat_percentage}% | BMI: {metric.bmi}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No body composition data available</p>
            )}
          </CardContent>
        </Card>

        {/* Physical Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Physical Activity
            </CardTitle>
            <CardDescription>Exercise and activity tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {healthData?.physicalActivities?.length > 0 ? (
              <div className="space-y-2">
                {healthData.physicalActivities.slice(0, 3).map((activity: any) => (
                  <div key={activity.id} className="p-2 bg-muted rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{activity.activity_type}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.duration_minutes} min | {activity.calories_burned} cal
                      {activity.distance_km && ` | ${activity.distance_km} km`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No physical activity data available</p>
            )}
          </CardContent>
        </Card>

        {/* Medical Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Connected Devices
            </CardTitle>
            <CardDescription>Registered medical devices</CardDescription>
          </CardHeader>
          <CardContent>
            {healthData?.medicalDevices?.length > 0 ? (
              <div className="space-y-2">
                {healthData.medicalDevices.map((device: any) => (
                  <div key={device.id} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{device.device_name}</span>
                      <div className="text-sm text-muted-foreground">{device.device_type}</div>
                    </div>
                    <Badge variant={device.connection_status === 'connected' ? 'default' : 'secondary'}>
                      {device.connection_status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No devices registered</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Patterns */}
      {healthData?.healthPatterns?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Health Patterns & Insights
            </CardTitle>
            <CardDescription>AI-detected patterns in your health data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthData.healthPatterns.map((pattern: any) => (
                <div key={pattern.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium">{pattern.pattern_name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{pattern.description}</p>
                  {pattern.confidence_score && (
                    <div className="mt-2">
                      <Badge variant="outline">
                        Confidence: {Math.round(pattern.confidence_score * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}