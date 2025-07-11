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
    const { data, error } = await supabase
      .from('medical_partners')
      .select('id, name, partner_type, status, api_endpoint, api_version')
      .eq('partner_type', 'lims')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  async createLabOrder(order: Omit<LabOrder, 'id'>): Promise<any> {
    const { data, error } = await supabase
      .from('lab_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    
    // Log the integration activity
    await this.logIntegrationActivity({
      partner_id: order.partner_id,
      user_id: order.user_id,
      operation_type: 'lab_order_created',
      endpoint_called: 'create_lab_order',
      records_processed: 1,
      compliance_check_passed: true
    });

    return data;
  }

  async getLabOrders(userId: string, filters?: {
    partner_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<any[]> {
    let query = supabase
      .from('lab_orders')
      .select(`
        *,
        medical_partners (
          name,
          partner_type
        )
      `)
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

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async syncWithPartner(partnerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('lims-sync', {
        body: { partner_id: partnerId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('LIMS sync error:', error);
      return { success: false, message: 'Sync failed: ' + (error as Error).message };
    }
  }

  async processHL7Message(partnerId: string, hl7Message: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('process-hl7', {
        body: { 
          partner_id: partnerId, 
          hl7_message: hl7Message,
          user_id: userId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('HL7 processing error:', error);
      throw error;
    }
  }

  async validateFHIRData(fhirResource: any): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-fhir', {
        body: { fhir_resource: fhirResource }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('FHIR validation error:', error);
      return { valid: false, errors: [(error as Error).message] };
    }
  }

  async getLabTestsCatalog(partnerId?: string): Promise<any[]> {
    let query = supabase
      .from('lab_tests_catalog')
      .select('*')
      .eq('is_active', true);

    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    const { data, error } = await query.order('test_category', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async getIntegrationAuditLogs(partnerId?: string, limit = 100): Promise<any[]> {
    let query = supabase
      .from('integration_audit_logs')
      .select(`
        *,
        medical_partners (
          name,
          partner_type
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
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
      await supabase
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
      const { data, error } = await supabase.functions.invoke('test-partner-connection', {
        body: { partner_id: partnerId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Partner connection test error:', error);
      return { success: false, message: 'Connection test failed: ' + (error as Error).message };
    }
  }

  async getDataMappings(partnerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('medical_data_mappings')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  async updateDataMapping(mappingId: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('medical_data_mappings')
      .update(updates)
      .eq('id', mappingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const limsIntegrationService = new LIMSIntegrationService();