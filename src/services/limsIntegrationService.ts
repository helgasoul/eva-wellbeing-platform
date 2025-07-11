import { supabase } from '@/integrations/supabase/client';

export interface LabOrder {
  id?: string;
  user_id: string;
  partner_id: string;
  order_number: string;
  external_order_id?: string | null;
  ordering_provider_name?: string | null;
  ordering_provider_npi?: string | null;
  patient_demographics: any;
  ordered_tests: any[];
  clinical_notes?: string | null;
  diagnosis_codes?: string[];
  specimen_collection_date?: string | null;
  specimen_collection_site?: string | null;
  priority_level?: string;
  order_status?: string;
  hl7_message?: string | null;
  integration_metadata?: any;
}

export interface MedicalPartner {
  id: string;
  name: string;
  partner_type: string;
  integration_capabilities: any;
  data_standards_supported: string[];
  hl7_endpoint?: string | null;
  fhir_endpoint?: string | null;
  certification_details: any;
  compliance_standards: string[];
  last_sync_at?: string | null;
  sync_frequency: string;
  status: string;
}

export class LIMSIntegrationService {
  
  async getMedicalPartners(): Promise<any[]> {
    try {
      const response = await (supabase as any)
        .from('medical_partners')
        .select('id, name, partner_type, status')
        .eq('partner_type', 'lims')
        .eq('status', 'active');

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching medical partners:', error);
      return [];
    }
  }

  async createLabOrder(order: Omit<LabOrder, 'id'>): Promise<any> {
    try {
      const response = await (supabase as any)
        .from('lab_orders')
        .insert(order)
        .select()
        .single();

      if (response.error) throw response.error;
      
      // Log the integration activity
      await this.logIntegrationActivity({
        partner_id: order.partner_id,
        user_id: order.user_id,
        operation_type: 'lab_order_created',
        endpoint_called: 'create_lab_order',
        records_processed: 1,
        compliance_check_passed: true
      });

      return response.data;
    } catch (error) {
      console.error('Error creating lab order:', error);
      throw error;
    }
  }

  async getLabOrders(userId: string, filters?: {
    partner_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any[]> {
    try {
      let query = (supabase as any)
        .from('lab_orders')
        .select('*')
        .eq('user_id', userId);

      if (filters?.partner_id) {
        query = query.eq('partner_id', filters.partner_id);
      }
      if (filters?.status) {
        query = query.eq('order_status', filters.status);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const response = await query.order('created_at', { ascending: false });
      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      return [];
    }
  }

  async syncWithPartner(partnerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await supabase.functions.invoke('lims-sync', {
        body: { partner_id: partnerId }
      });

      if (response.error) throw response.error;
      return response.data || { success: true, message: 'Sync completed' };
    } catch (error) {
      console.error('LIMS sync error:', error);
      return { success: false, message: 'Sync failed: ' + (error as Error).message };
    }
  }

  async processHL7Message(partnerId: string, hl7Message: string, userId: string): Promise<any> {
    try {
      const response = await supabase.functions.invoke('process-hl7', {
        body: { 
          partner_id: partnerId, 
          hl7_message: hl7Message,
          user_id: userId
        }
      });

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('HL7 processing error:', error);
      throw error;
    }
  }

  async validateFHIRData(fhirResource: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const response = await supabase.functions.invoke('validate-fhir', {
        body: { fhir_resource: fhirResource }
      });

      if (response.error) throw response.error;
      return response.data || { valid: false, errors: ['Validation failed'] };
    } catch (error) {
      console.error('FHIR validation error:', error);
      return { valid: false, errors: [(error as Error).message] };
    }
  }

  async getLabTestsCatalog(partnerId?: string): Promise<any[]> {
    try {
      let query = (supabase as any)
        .from('lab_tests_catalog')
        .select('*')
        .eq('is_active', true);

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const response = await query.order('test_category', { ascending: true });
      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching lab tests catalog:', error);
      return [];
    }
  }

  async getIntegrationAuditLogs(partnerId?: string, limit = 100): Promise<any[]> {
    try {
      let query = (supabase as any)
        .from('integration_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const response = await query;
      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  private async logIntegrationActivity(activity: {
    partner_id: string;
    user_id?: string;
    operation_type: string;
    endpoint_called?: string;
    request_payload?: any;
    response_payload?: any;
    status_code?: number;
    processing_time_ms?: number;
    error_message?: string;
    records_processed?: number;
    data_quality_score?: number;
    compliance_check_passed?: boolean;
  }): Promise<void> {
    try {
      await (supabase as any)
        .from('integration_audit_logs')
        .insert({
          ...activity,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log integration activity:', error);
    }
  }

  async testPartnerConnection(partnerId: string): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const response = await supabase.functions.invoke('test-partner-connection', {
        body: { partner_id: partnerId }
      });

      if (response.error) throw response.error;
      return response.data || { success: true, message: 'Connection test completed' };
    } catch (error) {
      console.error('Partner connection test error:', error);
      return { success: false, message: 'Connection test failed: ' + (error as Error).message };
    }
  }

  async getDataMappings(partnerId: string): Promise<any[]> {
    try {
      const response = await (supabase as any)
        .from('medical_data_mappings')
        .select('*')
        .eq('partner_id', partnerId)
        .eq('is_active', true);

      if (response.error) throw response.error;
      return response.data || [];
    } catch (error) {
      console.error('Error fetching data mappings:', error);
      return [];
    }
  }

  async updateDataMapping(mappingId: string, updates: any): Promise<any> {
    try {
      const response = await (supabase as any)
        .from('medical_data_mappings')
        .update(updates)
        .eq('id', mappingId)
        .select()
        .single();

      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error('Error updating data mapping:', error);
      throw error;
    }
  }
}

export const limsIntegrationService = new LIMSIntegrationService();