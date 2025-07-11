import { supabase } from "@/integrations/supabase/client";

export interface DateRange {
  start: string;
  end: string;
}

class MedicalDigitalTwinService {
  // Glucose Metrics Methods
  async saveGlucoseMetric(
    userId: string, 
    metric: {
      measurement_value: number;
      measurement_unit?: string;
      measurement_type: string;
      measurement_time?: string;
      meal_context?: string;
      symptoms_noted?: string[];
      medication_taken?: boolean;
      device_source?: string;
      recorded_at?: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('glucose_metrics')
        .insert({
          user_id: userId,
          ...metric
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving glucose metric:', error);
      return null;
    }
  }

  async getGlucoseMetrics(userId: string, dateRange?: DateRange) {
    try {
      let query = supabase
        .from('glucose_metrics')
        .select('*')
        .eq('user_id', userId);

      if (dateRange) {
        query = query
          .gte('recorded_at', dateRange.start)
          .lte('recorded_at', dateRange.end);
      }

      const { data, error } = await query
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching glucose metrics:', error);
      return [];
    }
  }

  // Body Composition Methods
  async saveBodyCompositionMetric(
    userId: string, 
    metric: {
      weight_kg?: number;
      body_fat_percentage?: number;
      muscle_mass_kg?: number;
      bone_density?: number;
      water_percentage?: number;
      visceral_fat_level?: number;
      metabolic_age?: number;
      bmi?: number;
      measurement_method?: string;
      device_source?: string;
      measurement_date: string;
      recorded_at?: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('body_composition_metrics')
        .insert({
          user_id: userId,
          ...metric
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving body composition metric:', error);
      return null;
    }
  }

  async getBodyCompositionMetrics(userId: string, dateRange?: DateRange) {
    try {
      let query = supabase
        .from('body_composition_metrics')
        .select('*')
        .eq('user_id', userId);

      if (dateRange) {
        query = query
          .gte('measurement_date', dateRange.start)
          .lte('measurement_date', dateRange.end);
      }

      const { data, error } = await query
        .order('measurement_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching body composition metrics:', error);
      return [];
    }
  }

  // Physical Activity Methods
  async savePhysicalActivity(
    userId: string, 
    activity: {
      activity_type: string;
      activity_subtype?: string;
      duration_minutes: number;
      intensity_level?: string;
      calories_burned?: number;
      heart_rate_avg?: number;
      heart_rate_max?: number;
      distance_km?: number;
      steps_count?: number;
      elevation_gain?: number;
      workout_notes?: string;
      device_source?: string;
      activity_date: string;
      start_time?: string;
      end_time?: string;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('physical_activity_detailed')
        .insert({
          user_id: userId,
          ...activity
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving physical activity:', error);
      return null;
    }
  }

  async getPhysicalActivities(userId: string, dateRange?: DateRange) {
    try {
      let query = supabase
        .from('physical_activity_detailed')
        .select('*')
        .eq('user_id', userId);

      if (dateRange) {
        query = query
          .gte('activity_date', dateRange.start)
          .lte('activity_date', dateRange.end);
      }

      const { data, error } = await query
        .order('activity_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching physical activities:', error);
      return [];
    }
  }

  // Medical Device Methods
  async registerMedicalDevice(
    userId: string, 
    device: {
      device_name: string;
      device_type: string;
      manufacturer?: string;
      model_number?: string;
      serial_number?: string;
      device_identifier?: string;
      connection_status?: string;
      sync_frequency?: string;
      data_types?: string[];
      device_settings?: Record<string, any>;
      is_active?: boolean;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from('medical_devices')
        .insert({
          user_id: userId,
          ...device
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registering medical device:', error);
      return null;
    }
  }

  async getMedicalDevices(userId: string) {
    try {
      const { data, error } = await supabase
        .from('medical_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching medical devices:', error);
      return [];
    }
  }

  async updateDeviceConnectionStatus(
    deviceId: string, 
    status: string,
    lastSyncAt?: string
  ): Promise<boolean> {
    try {
      const updateData: any = { connection_status: status };
      if (lastSyncAt) {
        updateData.last_sync_at = lastSyncAt;
      }

      const { error } = await supabase
        .from('medical_devices')
        .update(updateData)
        .eq('id', deviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating device connection status:', error);
      return false;
    }
  }

  // Health Patterns Methods
  async getHealthPatterns(userId: string) {
    try {
      const { data, error } = await supabase
        .from('health_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching health patterns:', error);
      return [];
    }
  }

  // Comprehensive Health Dashboard Data
  async getComprehensiveHealthData(userId: string, dateRange?: DateRange) {
    try {
      const results = await Promise.allSettled([
        this.getGlucoseMetrics(userId, dateRange),
        this.getBodyCompositionMetrics(userId, dateRange),
        this.getPhysicalActivities(userId, dateRange),
        this.getMedicalDevices(userId),
        this.getHealthPatterns(userId)
      ]);

      const glucoseMetrics = results[0].status === 'fulfilled' ? results[0].value : [];
      const bodyComposition = results[1].status === 'fulfilled' ? results[1].value : [];
      const physicalActivities = results[2].status === 'fulfilled' ? results[2].value : [];
      const medicalDevices = results[3].status === 'fulfilled' ? results[3].value : [];
      const healthPatterns = results[4].status === 'fulfilled' ? results[4].value : [];

      return {
        glucoseMetrics,
        bodyComposition,
        physicalActivities,
        medicalDevices,
        healthPatterns,
        summary: {
          totalDataPoints: glucoseMetrics.length + bodyComposition.length + physicalActivities.length,
          connectedDevices: medicalDevices.filter(d => d.connection_status === 'connected').length,
          activePatterns: healthPatterns.length
        }
      };
    } catch (error) {
      console.error('Error fetching comprehensive health data:', error);
      throw error;
    }
  }

  // Data Sync Status
  async checkSyncStatus(userId: string) {
    try {
      // Check if we can reach the database
      const { data, error } = await supabase
        .from('medical_devices')
        .select('last_sync_at')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      const lastSync = data?.[0]?.last_sync_at;
      
      return {
        isOnline: true,
        lastSync: lastSync || undefined
      };
    } catch (error) {
      console.error('Error checking sync status:', error);
      return { isOnline: false };
    }
  }
}

export const medicalDigitalTwinService = new MedicalDigitalTwinService();