export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_reward: number | null
          requirement_data: Json | null
          requirement_type: string
          requirement_value: number
          updated_at: string
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number | null
          requirement_data?: Json | null
          requirement_type: string
          requirement_value: number
          updated_at?: string
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
          requirement_data?: Json | null
          requirement_type?: string
          requirement_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_analysis_sessions: {
        Row: {
          ai_model_version: string
          analysis_date: string | null
          analysis_scope: Json
          anomalies_detected: Json | null
          confidence_score: number | null
          correlations_found: Json | null
          created_at: string | null
          data_completeness: number | null
          data_timeframe: Json
          error_details: string | null
          id: string
          input_data_sources: Json
          key_findings: Json
          model_uncertainty: number | null
          patterns_detected: Json | null
          processing_duration_ms: number | null
          processing_status: string | null
          session_type: string
          trends_identified: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_model_version: string
          analysis_date?: string | null
          analysis_scope: Json
          anomalies_detected?: Json | null
          confidence_score?: number | null
          correlations_found?: Json | null
          created_at?: string | null
          data_completeness?: number | null
          data_timeframe: Json
          error_details?: string | null
          id?: string
          input_data_sources: Json
          key_findings: Json
          model_uncertainty?: number | null
          patterns_detected?: Json | null
          processing_duration_ms?: number | null
          processing_status?: string | null
          session_type: string
          trends_identified?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_model_version?: string
          analysis_date?: string | null
          analysis_scope?: Json
          anomalies_detected?: Json | null
          confidence_score?: number | null
          correlations_found?: Json | null
          created_at?: string | null
          data_completeness?: number | null
          data_timeframe?: Json
          error_details?: string | null
          id?: string
          input_data_sources?: Json
          key_findings?: Json
          model_uncertainty?: number | null
          patterns_detected?: Json | null
          processing_duration_ms?: number | null
          processing_status?: string | null
          session_type?: string
          trends_identified?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          id: string
          message_type: string
          metadata: Json | null
          model_version: string | null
          session_id: string
          timestamp: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          id?: string
          message_type: string
          metadata?: Json | null
          model_version?: string | null
          session_id: string
          timestamp?: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          model_version?: string | null
          session_id?: string
          timestamp?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_sessions: {
        Row: {
          context_data: Json | null
          id: string
          is_active: boolean | null
          last_activity_at: string
          session_name: string | null
          session_type: string | null
          started_at: string
          summary: string | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string
          session_name?: string | null
          session_type?: string | null
          started_at?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          id?: string
          is_active?: boolean | null
          last_activity_at?: string
          session_name?: string | null
          session_type?: string | null
          started_at?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automation_user_settings: {
        Row: {
          automation_enabled: boolean | null
          created_at: string
          cycle_length: number | null
          cycle_tracking_enabled: boolean | null
          dietary_restrictions: Json | null
          id: string
          notification_preferences: Json | null
          period_length: number | null
          preferred_workout_types: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          supplement_preferences: Json | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          automation_enabled?: boolean | null
          created_at?: string
          cycle_length?: number | null
          cycle_tracking_enabled?: boolean | null
          dietary_restrictions?: Json | null
          id?: string
          notification_preferences?: Json | null
          period_length?: number | null
          preferred_workout_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          supplement_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          automation_enabled?: boolean | null
          created_at?: string
          cycle_length?: number | null
          cycle_tracking_enabled?: boolean | null
          dietary_restrictions?: Json | null
          id?: string
          notification_preferences?: Json | null
          period_length?: number | null
          preferred_workout_types?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          supplement_preferences?: Json | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_workflows: {
        Row: {
          action_sequence: Json | null
          actions: Json
          age_related_customization: boolean | null
          average_execution_time: number | null
          created_at: string
          cycle_phase_awareness: boolean | null
          execution_count: number | null
          execution_window: Json | null
          hormonal_adaptation: boolean | null
          id: string
          last_error_message: string | null
          last_execution: string | null
          life_stage_adaptation: boolean | null
          max_executions_per_day: number | null
          next_scheduled_execution: string | null
          parallel_execution: boolean | null
          retry_policy: Json | null
          success_rate: number | null
          timeout_seconds: number | null
          total_errors: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at: string
          user_id: string
          workflow_description: string | null
          workflow_name: string
          workflow_status: string | null
          workflow_type: string
        }
        Insert: {
          action_sequence?: Json | null
          actions?: Json
          age_related_customization?: boolean | null
          average_execution_time?: number | null
          created_at?: string
          cycle_phase_awareness?: boolean | null
          execution_count?: number | null
          execution_window?: Json | null
          hormonal_adaptation?: boolean | null
          id?: string
          last_error_message?: string | null
          last_execution?: string | null
          life_stage_adaptation?: boolean | null
          max_executions_per_day?: number | null
          next_scheduled_execution?: string | null
          parallel_execution?: boolean | null
          retry_policy?: Json | null
          success_rate?: number | null
          timeout_seconds?: number | null
          total_errors?: number | null
          trigger_conditions?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
          workflow_description?: string | null
          workflow_name: string
          workflow_status?: string | null
          workflow_type: string
        }
        Update: {
          action_sequence?: Json | null
          actions?: Json
          age_related_customization?: boolean | null
          average_execution_time?: number | null
          created_at?: string
          cycle_phase_awareness?: boolean | null
          execution_count?: number | null
          execution_window?: Json | null
          hormonal_adaptation?: boolean | null
          id?: string
          last_error_message?: string | null
          last_execution?: string | null
          life_stage_adaptation?: boolean | null
          max_executions_per_day?: number | null
          next_scheduled_execution?: string | null
          parallel_execution?: boolean | null
          retry_policy?: Json | null
          success_rate?: number | null
          timeout_seconds?: number | null
          total_errors?: number | null
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
          workflow_description?: string | null
          workflow_name?: string
          workflow_status?: string | null
          workflow_type?: string
        }
        Relationships: []
      }
      calculator_results: {
        Row: {
          calculated_at: string
          calculated_by: string | null
          calculator_name: string
          calculator_type: string
          created_at: string
          id: string
          input_parameters: Json
          interpretation: string
          is_critical: boolean | null
          lab_result_id: string | null
          notes: string | null
          patient_id: string
          reference_range: string | null
          result_text: string | null
          result_value: number | null
          units: string | null
          updated_at: string
        }
        Insert: {
          calculated_at?: string
          calculated_by?: string | null
          calculator_name: string
          calculator_type: string
          created_at?: string
          id?: string
          input_parameters?: Json
          interpretation: string
          is_critical?: boolean | null
          lab_result_id?: string | null
          notes?: string | null
          patient_id: string
          reference_range?: string | null
          result_text?: string | null
          result_value?: number | null
          units?: string | null
          updated_at?: string
        }
        Update: {
          calculated_at?: string
          calculated_by?: string | null
          calculator_name?: string
          calculator_type?: string
          created_at?: string
          id?: string
          input_parameters?: Json
          interpretation?: string
          is_critical?: boolean | null
          lab_result_id?: string | null
          notes?: string | null
          patient_id?: string
          reference_range?: string | null
          result_text?: string | null
          result_value?: number | null
          units?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          calendar_id: string | null
          calendar_type: string
          created_at: string
          id: string
          integration_status: string | null
          refresh_token: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          calendar_id?: string | null
          calendar_type: string
          created_at?: string
          id?: string
          integration_status?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          calendar_id?: string | null
          calendar_type?: string
          created_at?: string
          id?: string
          integration_status?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clinic_profiles: {
        Row: {
          address: string | null
          api_access_enabled: boolean | null
          clinic_name: string
          clinic_type: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          phone: string | null
          services_offered: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          api_access_enabled?: boolean | null
          clinic_name: string
          clinic_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          services_offered?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          api_access_enabled?: boolean | null
          clinic_name?: string
          clinic_type?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          services_offered?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          anonymous_name: string
          author_id: string | null
          content: string
          created_at: string
          group_id: string
          id: string
          is_anonymous: boolean | null
          like_count: number | null
          post_type: string | null
          reply_count: number | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          anonymous_name: string
          author_id?: string | null
          content: string
          created_at?: string
          group_id: string
          id?: string
          is_anonymous?: boolean | null
          like_count?: number | null
          post_type?: string | null
          reply_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          anonymous_name?: string
          author_id?: string | null
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          is_anonymous?: boolean | null
          like_count?: number | null
          post_type?: string | null
          reply_count?: number | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_bookings: {
        Row: {
          booking_date: string
          booking_time: string
          consultation_type: string | null
          created_at: string
          doctor_id: string
          id: string
          meeting_link: string | null
          notes: string | null
          patient_id: string
          payment_amount: number | null
          payment_status: string | null
          reason: string | null
          schedule_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          consultation_type?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id: string
          payment_amount?: number | null
          payment_status?: string | null
          reason?: string | null
          schedule_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          consultation_type?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          meeting_link?: string | null
          notes?: string | null
          patient_id?: string
          payment_amount?: number | null
          payment_status?: string | null
          reason?: string | null
          schedule_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_bookings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "doctor_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      crc_pro_assessments: {
        Row: {
          age: number
          alcohol_consumption: string | null
          assessment_id: string | null
          calcium_supplements: boolean | null
          created_at: string
          diabetes_type2: boolean | null
          family_history_crc: boolean | null
          family_history_ibd: boolean | null
          family_history_polyps: boolean | null
          fiber_intake: string | null
          gender: string
          height_cm: number | null
          id: string
          last_colonoscopy_date: string | null
          multivitamin_use: boolean | null
          nsaid_use: boolean | null
          number_affected_relatives: number | null
          personal_history_ibd: boolean | null
          personal_history_polyps: boolean | null
          physical_activity: string | null
          previous_colonoscopy: boolean | null
          processed_meat_consumption: string | null
          red_meat_consumption: string | null
          smoking_status: string | null
          updated_at: string
          user_id: string
          vegetable_intake: string | null
          weight_kg: number | null
        }
        Insert: {
          age: number
          alcohol_consumption?: string | null
          assessment_id?: string | null
          calcium_supplements?: boolean | null
          created_at?: string
          diabetes_type2?: boolean | null
          family_history_crc?: boolean | null
          family_history_ibd?: boolean | null
          family_history_polyps?: boolean | null
          fiber_intake?: string | null
          gender: string
          height_cm?: number | null
          id?: string
          last_colonoscopy_date?: string | null
          multivitamin_use?: boolean | null
          nsaid_use?: boolean | null
          number_affected_relatives?: number | null
          personal_history_ibd?: boolean | null
          personal_history_polyps?: boolean | null
          physical_activity?: string | null
          previous_colonoscopy?: boolean | null
          processed_meat_consumption?: string | null
          red_meat_consumption?: string | null
          smoking_status?: string | null
          updated_at?: string
          user_id: string
          vegetable_intake?: string | null
          weight_kg?: number | null
        }
        Update: {
          age?: number
          alcohol_consumption?: string | null
          assessment_id?: string | null
          calcium_supplements?: boolean | null
          created_at?: string
          diabetes_type2?: boolean | null
          family_history_crc?: boolean | null
          family_history_ibd?: boolean | null
          family_history_polyps?: boolean | null
          fiber_intake?: string | null
          gender?: string
          height_cm?: number | null
          id?: string
          last_colonoscopy_date?: string | null
          multivitamin_use?: boolean | null
          nsaid_use?: boolean | null
          number_affected_relatives?: number | null
          personal_history_ibd?: boolean | null
          personal_history_polyps?: boolean | null
          physical_activity?: string | null
          previous_colonoscopy?: boolean | null
          processed_meat_consumption?: string | null
          red_meat_consumption?: string | null
          smoking_status?: string | null
          updated_at?: string
          user_id?: string
          vegetable_intake?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crc_pro_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_health_summary: {
        Row: {
          active_minutes: number | null
          additional_metrics: Json | null
          avg_heart_rate: number | null
          calories_burned: number | null
          created_at: string
          distance_km: number | null
          glucose_avg: number | null
          glucose_readings_count: number | null
          id: string
          max_heart_rate: number | null
          min_heart_rate: number | null
          sleep_hours: number | null
          sleep_quality: string | null
          summary_date: string
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          additional_metrics?: Json | null
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          glucose_avg?: number | null
          glucose_readings_count?: number | null
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          summary_date: string
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          additional_metrics?: Json | null
          avg_heart_rate?: number | null
          calories_burned?: number | null
          created_at?: string
          distance_km?: number | null
          glucose_avg?: number | null
          glucose_readings_count?: number | null
          id?: string
          max_heart_rate?: number | null
          min_heart_rate?: number | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          summary_date?: string
          total_steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          completed_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          download_expires_at: string | null
          export_format: string
          export_status: string | null
          export_type: string
          file_path: string | null
          file_size: number | null
          id: string
          metadata: Json | null
          requested_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          download_expires_at?: string | null
          export_format: string
          export_status?: string | null
          export_type: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          requested_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          download_expires_at?: string | null
          export_format?: string
          export_status?: string | null
          export_type?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          metadata?: Json | null
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_relationships: {
        Row: {
          auto_detected: boolean | null
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          primary_id: string
          primary_type: string
          relationship_strength: number | null
          relationship_type: string
          secondary_id: string
          secondary_type: string
          user_id: string
        }
        Insert: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          primary_id: string
          primary_type: string
          relationship_strength?: number | null
          relationship_type: string
          secondary_id: string
          secondary_type: string
          user_id: string
        }
        Update: {
          auto_detected?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          primary_id?: string
          primary_type?: string
          relationship_strength?: number | null
          relationship_type?: string
          secondary_id?: string
          secondary_type?: string
          user_id?: string
        }
        Relationships: []
      }
      diploma_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          uploaded_at: string
          verification_id: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          uploaded_at?: string
          verification_id: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          uploaded_at?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diploma_files_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "doctor_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_access_logs: {
        Row: {
          accessed_at: string
          accessed_data_type: string
          id: string
          ip_address: string | null
          token_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_data_type: string
          id?: string
          ip_address?: string | null
          token_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_data_type?: string
          id?: string
          ip_address?: string | null
          token_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_access_logs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "doctor_access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_access_tokens: {
        Row: {
          access_permissions: Json
          created_at: string
          doctor_email: string | null
          doctor_name: string | null
          expires_at: string
          id: string
          is_used: boolean
          token_code: string
          updated_at: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          access_permissions?: Json
          created_at?: string
          doctor_email?: string | null
          doctor_name?: string | null
          expires_at: string
          id?: string
          is_used?: boolean
          token_code: string
          updated_at?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          access_permissions?: Json
          created_at?: string
          doctor_email?: string | null
          doctor_name?: string | null
          expires_at?: string
          id?: string
          is_used?: boolean
          token_code?: string
          updated_at?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      doctor_notifications: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          is_critical: boolean | null
          is_read: boolean | null
          message: string
          notification_type: string
          patient_id: string
          read_at: string | null
          related_data: Json | null
          title: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          is_critical?: boolean | null
          is_read?: boolean | null
          message: string
          notification_type: string
          patient_id: string
          read_at?: string | null
          related_data?: Json | null
          title: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          is_critical?: boolean | null
          is_read?: boolean | null
          message?: string
          notification_type?: string
          patient_id?: string
          read_at?: string | null
          related_data?: Json | null
          title?: string
        }
        Relationships: []
      }
      doctor_patient_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          doctor_id: string
          id: string
          is_read: boolean | null
          message_text: string
          message_type: string | null
          patient_id: string
          read_at: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          doctor_id: string
          id?: string
          is_read?: boolean | null
          message_text: string
          message_type?: string | null
          patient_id: string
          read_at?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_read?: boolean | null
          message_text?: string
          message_type?: string | null
          patient_id?: string
          read_at?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          bio: string | null
          consultation_fee: number | null
          created_at: string
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean | null
          photo_url: string | null
          qualification: string | null
          specialization: string
          updated_at: string
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean | null
          photo_url?: string | null
          qualification?: string | null
          specialization: string
          updated_at?: string
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean | null
          photo_url?: string | null
          qualification?: string | null
          specialization?: string
          updated_at?: string
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      doctor_schedules: {
        Row: {
          consultation_type: string | null
          created_at: string
          date: string
          doctor_id: string
          end_time: string
          id: string
          is_available: boolean | null
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          consultation_type?: string | null
          created_at?: string
          date: string
          doctor_id: string
          end_time: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          consultation_type?: string | null
          created_at?: string
          date?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_verifications: {
        Row: {
          created_at: string
          diploma_file_name: string
          diploma_file_path: string
          file_size: number
          id: string
          notes: string | null
          rejection_reason: string | null
          updated_at: string
          upload_date: string
          user_id: string
          verification_date: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          diploma_file_name: string
          diploma_file_path: string
          file_size: number
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          updated_at?: string
          upload_date?: string
          user_id: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          diploma_file_name?: string
          diploma_file_path?: string
          file_size?: number
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          updated_at?: string
          upload_date?: string
          user_id?: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      experts: {
        Row: {
          avatar_url: string | null
          blog_posts_count: number | null
          certifications: string[] | null
          consultation_available: boolean | null
          consultation_price: number | null
          created_at: string
          description: string | null
          education: string[] | null
          experience: number
          id: string
          name: string
          rating: number | null
          specialization: string
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blog_posts_count?: number | null
          certifications?: string[] | null
          consultation_available?: boolean | null
          consultation_price?: number | null
          created_at?: string
          description?: string | null
          education?: string[] | null
          experience?: number
          id?: string
          name: string
          rating?: number | null
          specialization: string
          title: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blog_posts_count?: number | null
          certifications?: string[] | null
          consultation_available?: boolean | null
          consultation_price?: number | null
          created_at?: string
          description?: string | null
          education?: string[] | null
          experience?: number
          id?: string
          name?: string
          rating?: number | null
          specialization?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_api_integrations: {
        Row: {
          access_token_encrypted: string | null
          created_at: string
          id: string
          integration_status: string | null
          integration_type: string
          last_sync_at: string | null
          provider_name: string
          refresh_token_encrypted: string | null
          sync_frequency: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          integration_status?: string | null
          integration_type: string
          last_sync_at?: string | null
          provider_name: string
          refresh_token_encrypted?: string | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          created_at?: string
          id?: string
          integration_status?: string | null
          integration_type?: string
          last_sync_at?: string | null
          provider_name?: string
          refresh_token_encrypted?: string | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      external_health_data: {
        Row: {
          created_at: string
          data_payload: Json
          data_type: string
          external_id: string | null
          id: string
          integration_id: string
          recorded_date: string
          synced_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_payload: Json
          data_type: string
          external_id?: string | null
          id?: string
          integration_id: string
          recorded_date: string
          synced_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_payload?: Json
          data_type?: string
          external_id?: string | null
          id?: string
          integration_id?: string
          recorded_date?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_health_data_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "health_app_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access_logs: {
        Row: {
          accessed_at: string
          accessed_by: string
          accessed_data_type: string
          accessed_member_id: string | null
          family_group_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by: string
          accessed_data_type: string
          accessed_member_id?: string | null
          family_group_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string
          accessed_data_type?: string
          accessed_member_id?: string | null
          family_group_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_access_logs_accessed_member_id_fkey"
            columns: ["accessed_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_access_logs_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access_members: {
        Row: {
          access_level: string
          access_permissions: Json
          created_at: string
          family_group_id: string
          id: string
          invited_by: string
          is_active: boolean
          joined_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          access_permissions?: Json
          created_at?: string
          family_group_id: string
          id?: string
          invited_by: string
          is_active?: boolean
          joined_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          access_permissions?: Json
          created_at?: string
          family_group_id?: string
          id?: string
          invited_by?: string
          is_active?: boolean
          joined_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_access_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_access_tokens: {
        Row: {
          access_permissions: Json
          created_at: string
          created_by: string
          expires_at: string
          family_group_id: string
          id: string
          invitation_message: string | null
          invited_email: string
          invited_name: string | null
          is_used: boolean
          token_code: string
          updated_at: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          access_permissions?: Json
          created_at?: string
          created_by: string
          expires_at: string
          family_group_id: string
          id?: string
          invitation_message?: string | null
          invited_email: string
          invited_name?: string | null
          is_used?: boolean
          token_code: string
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          access_permissions?: Json
          created_at?: string
          created_by?: string
          expires_at?: string
          family_group_id?: string
          id?: string
          invitation_message?: string | null
          invited_email?: string
          invited_name?: string | null
          is_used?: boolean
          token_code?: string
          updated_at?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_access_tokens_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_data_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_by: string
          accessed_member_id: string | null
          data_type: string | null
          family_group_id: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_by: string
          accessed_member_id?: string | null
          data_type?: string | null
          family_group_id: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_by?: string
          accessed_member_id?: string | null
          data_type?: string | null
          family_group_id?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_data_access_logs_accessed_member_id_fkey"
            columns: ["accessed_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_data_access_logs_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_documents: {
        Row: {
          created_at: string
          description: string | null
          document_date: string | null
          document_type: string
          family_group_id: string
          family_member_id: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_shared: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_date?: string | null
          document_type: string
          family_group_id: string
          family_member_id?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_shared?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_date?: string | null
          document_type?: string
          family_group_id?: string
          family_member_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_shared?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_documents_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_documents_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          family_name: string
          id: string
          tree_name: string | null
          updated_at: string
          visibility_settings: Json | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          family_name: string
          id?: string
          tree_name?: string | null
          updated_at?: string
          visibility_settings?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          family_name?: string
          id?: string
          tree_name?: string | null
          updated_at?: string
          visibility_settings?: Json | null
        }
        Relationships: []
      }
      family_hereditary_risks: {
        Row: {
          affected_members: string[] | null
          age_of_onset_range: string | null
          calculated_at: string | null
          condition_name: string
          created_at: string
          created_by: string
          family_group_id: string
          id: string
          inheritance_pattern: string | null
          notes: string | null
          prevention_recommendations: Json | null
          risk_level: string | null
          screening_recommendations: Json | null
          updated_at: string
        }
        Insert: {
          affected_members?: string[] | null
          age_of_onset_range?: string | null
          calculated_at?: string | null
          condition_name: string
          created_at?: string
          created_by: string
          family_group_id: string
          id?: string
          inheritance_pattern?: string | null
          notes?: string | null
          prevention_recommendations?: Json | null
          risk_level?: string | null
          screening_recommendations?: Json | null
          updated_at?: string
        }
        Update: {
          affected_members?: string[] | null
          age_of_onset_range?: string | null
          calculated_at?: string | null
          condition_name?: string
          created_at?: string
          created_by?: string
          family_group_id?: string
          id?: string
          inheritance_pattern?: string | null
          notes?: string | null
          prevention_recommendations?: Json | null
          risk_level?: string | null
          screening_recommendations?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_hereditary_risks_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_medical_events: {
        Row: {
          age_at_event: number | null
          clinic_name: string | null
          created_at: string
          created_by: string
          description: string | null
          doctor_name: string | null
          event_date: string | null
          event_type: string
          family_member_id: string
          id: string
          notes: string | null
          outcome: string | null
          severity: string | null
          tags: string[] | null
          title: string
          treatment: string | null
          updated_at: string
          verified_by_doctor: boolean | null
        }
        Insert: {
          age_at_event?: number | null
          clinic_name?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          doctor_name?: string | null
          event_date?: string | null
          event_type: string
          family_member_id: string
          id?: string
          notes?: string | null
          outcome?: string | null
          severity?: string | null
          tags?: string[] | null
          title: string
          treatment?: string | null
          updated_at?: string
          verified_by_doctor?: boolean | null
        }
        Update: {
          age_at_event?: number | null
          clinic_name?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          doctor_name?: string | null
          event_date?: string | null
          event_type?: string
          family_member_id?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          severity?: string | null
          tags?: string[] | null
          title?: string
          treatment?: string | null
          updated_at?: string
          verified_by_doctor?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "family_medical_events_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_medical_history: {
        Row: {
          age_at_diagnosis: number | null
          condition_name: string
          condition_type: string
          created_at: string
          created_by: string
          diagnosis_date: string | null
          doctor_name: string | null
          family_member_id: string
          id: string
          notes: string | null
          outcome: string | null
          severity: string | null
          treatment: string | null
          updated_at: string
          verified_by_doctor: boolean | null
        }
        Insert: {
          age_at_diagnosis?: number | null
          condition_name: string
          condition_type: string
          created_at?: string
          created_by: string
          diagnosis_date?: string | null
          doctor_name?: string | null
          family_member_id: string
          id?: string
          notes?: string | null
          outcome?: string | null
          severity?: string | null
          treatment?: string | null
          updated_at?: string
          verified_by_doctor?: boolean | null
        }
        Update: {
          age_at_diagnosis?: number | null
          condition_name?: string
          condition_type?: string
          created_at?: string
          created_by?: string
          diagnosis_date?: string | null
          doctor_name?: string | null
          family_member_id?: string
          id?: string
          notes?: string | null
          outcome?: string | null
          severity?: string | null
          treatment?: string | null
          updated_at?: string
          verified_by_doctor?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "family_medical_history_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          family_member_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          title: string | null
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          family_member_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          title?: string | null
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          family_member_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          title?: string | null
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_member_documents_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_health_metrics: {
        Row: {
          created_at: string
          created_by: string
          family_member_id: string
          id: string
          is_within_normal_range: boolean | null
          measured_by: string | null
          measurement_date: string
          metric_type: string
          notes: string | null
          reference_range_max: number | null
          reference_range_min: number | null
          unit: string | null
          updated_at: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          family_member_id: string
          id?: string
          is_within_normal_range?: boolean | null
          measured_by?: string | null
          measurement_date: string
          metric_type: string
          notes?: string | null
          reference_range_max?: number | null
          reference_range_min?: number | null
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          family_member_id?: string
          id?: string
          is_within_normal_range?: boolean | null
          measured_by?: string | null
          measurement_date?: string
          metric_type?: string
          notes?: string | null
          reference_range_max?: number | null
          reference_range_min?: number | null
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_member_health_metrics_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_health_records: {
        Row: {
          attachments: Json | null
          clinic_name: string | null
          created_at: string
          created_by: string
          date_recorded: string | null
          description: string | null
          doctor_name: string | null
          family_member_id: string
          id: string
          notes: string | null
          record_type: string
          results: Json | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          created_by: string
          date_recorded?: string | null
          description?: string | null
          doctor_name?: string | null
          family_member_id: string
          id?: string
          notes?: string | null
          record_type: string
          results?: Json | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          created_by?: string
          date_recorded?: string | null
          description?: string | null
          doctor_name?: string | null
          family_member_id?: string
          id?: string
          notes?: string | null
          record_type?: string
          results?: Json | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_member_health_records_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          allergies: Json | null
          avatar_url: string | null
          birth_year: number | null
          blood_type: string | null
          chronic_conditions: Json | null
          consent_status: boolean | null
          created_at: string
          created_by: string
          date_of_birth: string | null
          education_level: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          family_group_id: string
          family_history_notes: string | null
          gender: string | null
          genetic_predispositions: Json | null
          height_cm: number | null
          id: string
          insurance_info: string | null
          is_alive: boolean | null
          last_medical_checkup: string | null
          lifestyle_factors: Json | null
          marital_status: string | null
          medical_notes: string | null
          medications: Json | null
          name: string
          notes: string | null
          occupation: string | null
          place_of_birth: string | null
          preferred_doctor: string | null
          relationship: string
          shared_data_types: string[] | null
          status: string | null
          updated_at: string
          user_id: string | null
          vaccinations: Json | null
          visibility_scope: string | null
          weight_kg: number | null
        }
        Insert: {
          allergies?: Json | null
          avatar_url?: string | null
          birth_year?: number | null
          blood_type?: string | null
          chronic_conditions?: Json | null
          consent_status?: boolean | null
          created_at?: string
          created_by: string
          date_of_birth?: string | null
          education_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_group_id: string
          family_history_notes?: string | null
          gender?: string | null
          genetic_predispositions?: Json | null
          height_cm?: number | null
          id?: string
          insurance_info?: string | null
          is_alive?: boolean | null
          last_medical_checkup?: string | null
          lifestyle_factors?: Json | null
          marital_status?: string | null
          medical_notes?: string | null
          medications?: Json | null
          name: string
          notes?: string | null
          occupation?: string | null
          place_of_birth?: string | null
          preferred_doctor?: string | null
          relationship: string
          shared_data_types?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vaccinations?: Json | null
          visibility_scope?: string | null
          weight_kg?: number | null
        }
        Update: {
          allergies?: Json | null
          avatar_url?: string | null
          birth_year?: number | null
          blood_type?: string | null
          chronic_conditions?: Json | null
          consent_status?: boolean | null
          created_at?: string
          created_by?: string
          date_of_birth?: string | null
          education_level?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_group_id?: string
          family_history_notes?: string | null
          gender?: string | null
          genetic_predispositions?: Json | null
          height_cm?: number | null
          id?: string
          insurance_info?: string | null
          is_alive?: boolean | null
          last_medical_checkup?: string | null
          lifestyle_factors?: Json | null
          marital_status?: string | null
          medical_notes?: string | null
          medications?: Json | null
          name?: string
          notes?: string | null
          occupation?: string | null
          place_of_birth?: string | null
          preferred_doctor?: string | null
          relationship?: string
          shared_data_types?: string[] | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          vaccinations?: Json | null
          visibility_scope?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_memories: {
        Row: {
          author_id: string
          content: string
          created_at: string
          family_member_id: string
          id: string
          is_medical_relevant: boolean | null
          memory_type: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          family_member_id: string
          id?: string
          is_medical_relevant?: boolean | null
          memory_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          family_member_id?: string
          id?: string
          is_medical_relevant?: boolean | null
          memory_type?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_memories_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_risk_analysis: {
        Row: {
          ai_recommendations: Json
          analysis_results: Json
          analyzed_by: string
          confidence_score: number | null
          created_at: string
          family_group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json
          analysis_results?: Json
          analyzed_by: string
          confidence_score?: number | null
          created_at?: string
          family_group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json
          analysis_results?: Json
          analyzed_by?: string
          confidence_score?: number | null
          created_at?: string
          family_group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_risk_analysis_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_shared_plans: {
        Row: {
          created_at: string
          description: string | null
          family_group_id: string
          id: string
          is_active: boolean | null
          linked_goals: Json | null
          owner_user_id: string
          plan_name: string
          related_family_member_ids: string[] | null
          shared_recommendations: Json | null
          target_conditions: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          family_group_id: string
          id?: string
          is_active?: boolean | null
          linked_goals?: Json | null
          owner_user_id: string
          plan_name: string
          related_family_member_ids?: string[] | null
          shared_recommendations?: Json | null
          target_conditions?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          family_group_id?: string
          id?: string
          is_active?: boolean | null
          linked_goals?: Json | null
          owner_user_id?: string
          plan_name?: string
          related_family_member_ids?: string[] | null
          shared_recommendations?: Json | null
          target_conditions?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_shared_plans_family_group_id_fkey"
            columns: ["family_group_id"]
            isOneToOne: false
            referencedRelation: "family_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      fertility_tracking: {
        Row: {
          basal_body_temperature: number | null
          cervical_firmness: string | null
          cervical_mucus_type: string | null
          cervical_opening: string | null
          cervical_position: string | null
          created_at: string
          exercise_intensity: string | null
          fertile_window_end: string | null
          fertile_window_start: string | null
          fertility_symptoms: string[] | null
          id: string
          intercourse_timing: boolean | null
          notes: string | null
          ovulation_test_result: string | null
          predicted_ovulation_date: string | null
          sleep_quality: number | null
          sperm_friendly_lubricant: boolean | null
          stress_level: number | null
          tracking_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          basal_body_temperature?: number | null
          cervical_firmness?: string | null
          cervical_mucus_type?: string | null
          cervical_opening?: string | null
          cervical_position?: string | null
          created_at?: string
          exercise_intensity?: string | null
          fertile_window_end?: string | null
          fertile_window_start?: string | null
          fertility_symptoms?: string[] | null
          id?: string
          intercourse_timing?: boolean | null
          notes?: string | null
          ovulation_test_result?: string | null
          predicted_ovulation_date?: string | null
          sleep_quality?: number | null
          sperm_friendly_lubricant?: boolean | null
          stress_level?: number | null
          tracking_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          basal_body_temperature?: number | null
          cervical_firmness?: string | null
          cervical_mucus_type?: string | null
          cervical_opening?: string | null
          cervical_position?: string | null
          created_at?: string
          exercise_intensity?: string | null
          fertile_window_end?: string | null
          fertile_window_start?: string | null
          fertility_symptoms?: string[] | null
          id?: string
          intercourse_timing?: boolean | null
          notes?: string | null
          ovulation_test_result?: string | null
          predicted_ovulation_date?: string | null
          sleep_quality?: number | null
          sperm_friendly_lubricant?: boolean | null
          stress_level?: number | null
          tracking_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_info: {
        Row: {
          achievements: string[] | null
          certificates: Json | null
          created_at: string
          description: string | null
          education: string[] | null
          id: string
          image_url: string | null
          name: string
          quote: string | null
          title: string
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          certificates?: Json | null
          created_at?: string
          description?: string | null
          education?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          quote?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          certificates?: Json | null
          created_at?: string
          description?: string | null
          education?: string[] | null
          id?: string
          image_url?: string | null
          name?: string
          quote?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      genetic_data: {
        Row: {
          created_at: string
          gene_variants: Json | null
          id: string
          lab_name: string | null
          results: Json | null
          test_date: string | null
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gene_variants?: Json | null
          id?: string
          lab_name?: string | null
          results?: Json | null
          test_date?: string | null
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gene_variants?: Json | null
          id?: string
          lab_name?: string | null
          results?: Json | null
          test_date?: string | null
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          anonymous_name: string
          group_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          anonymous_name: string
          group_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          anonymous_name?: string
          group_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      gynecology_appointments: {
        Row: {
          actual_cost: number | null
          appointment_date: string
          appointment_notes: string | null
          appointment_time: string
          appointment_type: string
          booking_confirmation: string | null
          booking_status: string | null
          created_at: string
          cycle_considerations: Json | null
          cycle_day: number | null
          cycle_phase: string | null
          doctor_id: string | null
          doctor_name: string | null
          doctor_specialization: string | null
          estimated_cost: number | null
          estimated_duration: number | null
          external_appointment_id: string | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          insurance_covered: boolean | null
          partner_id: string | null
          preparation_completed: boolean | null
          preparation_instructions: Json | null
          preparation_required: boolean | null
          results_available: boolean | null
          results_summary: Json | null
          service_code: string | null
          service_name: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_cost?: number | null
          appointment_date: string
          appointment_notes?: string | null
          appointment_time: string
          appointment_type: string
          booking_confirmation?: string | null
          booking_status?: string | null
          created_at?: string
          cycle_considerations?: Json | null
          cycle_day?: number | null
          cycle_phase?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          doctor_specialization?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          external_appointment_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_covered?: boolean | null
          partner_id?: string | null
          preparation_completed?: boolean | null
          preparation_instructions?: Json | null
          preparation_required?: boolean | null
          results_available?: boolean | null
          results_summary?: Json | null
          service_code?: string | null
          service_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_cost?: number | null
          appointment_date?: string
          appointment_notes?: string | null
          appointment_time?: string
          appointment_type?: string
          booking_confirmation?: string | null
          booking_status?: string | null
          created_at?: string
          cycle_considerations?: Json | null
          cycle_day?: number | null
          cycle_phase?: string | null
          doctor_id?: string | null
          doctor_name?: string | null
          doctor_specialization?: string | null
          estimated_cost?: number | null
          estimated_duration?: number | null
          external_appointment_id?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          insurance_covered?: boolean | null
          partner_id?: string | null
          preparation_completed?: boolean | null
          preparation_instructions?: Json | null
          preparation_required?: boolean | null
          results_available?: boolean | null
          results_summary?: Json | null
          service_code?: string | null
          service_name?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gynecology_appointments_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_completions: {
        Row: {
          completed_date: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          points_earned: number | null
          user_id: string
        }
        Insert: {
          completed_date: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          points_earned?: number | null
          user_id: string
        }
        Update: {
          completed_date?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "health_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      health_anomalies: {
        Row: {
          analysis_session_id: string | null
          anomaly_duration_days: number | null
          anomaly_score: number | null
          anomaly_type: string | null
          concurrent_events: Json | null
          confidence_level: number | null
          created_at: string | null
          detected_value: number | null
          detection_date: string
          expected_value: number | null
          external_factors: Json | null
          follow_up_required: boolean | null
          follow_up_timeline: string | null
          healthcare_provider_notified: boolean | null
          id: string
          metric_name: string
          metric_type: string
          potential_causes: Json | null
          recommended_action: string | null
          related_symptoms: Json | null
          resolution_status: string | null
          severity_level: string | null
          threshold_used: number | null
          time_since_last_normal: number | null
          updated_at: string | null
          urgency: string | null
          user_acknowledged: boolean | null
          user_action_taken: string | null
          user_id: string | null
        }
        Insert: {
          analysis_session_id?: string | null
          anomaly_duration_days?: number | null
          anomaly_score?: number | null
          anomaly_type?: string | null
          concurrent_events?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          detected_value?: number | null
          detection_date: string
          expected_value?: number | null
          external_factors?: Json | null
          follow_up_required?: boolean | null
          follow_up_timeline?: string | null
          healthcare_provider_notified?: boolean | null
          id?: string
          metric_name: string
          metric_type: string
          potential_causes?: Json | null
          recommended_action?: string | null
          related_symptoms?: Json | null
          resolution_status?: string | null
          severity_level?: string | null
          threshold_used?: number | null
          time_since_last_normal?: number | null
          updated_at?: string | null
          urgency?: string | null
          user_acknowledged?: boolean | null
          user_action_taken?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_session_id?: string | null
          anomaly_duration_days?: number | null
          anomaly_score?: number | null
          anomaly_type?: string | null
          concurrent_events?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          detected_value?: number | null
          detection_date?: string
          expected_value?: number | null
          external_factors?: Json | null
          follow_up_required?: boolean | null
          follow_up_timeline?: string | null
          healthcare_provider_notified?: boolean | null
          id?: string
          metric_name?: string
          metric_type?: string
          potential_causes?: Json | null
          recommended_action?: string | null
          related_symptoms?: Json | null
          resolution_status?: string | null
          severity_level?: string | null
          threshold_used?: number | null
          time_since_last_normal?: number | null
          updated_at?: string | null
          urgency?: string | null
          user_acknowledged?: boolean | null
          user_action_taken?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_anomalies_analysis_session_id_fkey"
            columns: ["analysis_session_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_app_integrations: {
        Row: {
          access_token: string | null
          app_name: string
          app_user_id: string | null
          created_at: string
          id: string
          integration_status: string
          last_sync_at: string | null
          refresh_token: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          app_name: string
          app_user_id?: string | null
          created_at?: string
          id?: string
          integration_status?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          app_name?: string
          app_user_id?: string | null
          created_at?: string
          id?: string
          integration_status?: string
          last_sync_at?: string | null
          refresh_token?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_correlations: {
        Row: {
          actionable_insights: string | null
          analysis_session_id: string | null
          causality_likelihood: string | null
          clinical_meaningfulness: string | null
          confounding_factors: Json | null
          contextual_notes: string | null
          correlation_coefficient: number
          correlation_period: string | null
          correlation_type: string | null
          created_at: string | null
          health_implications: string | null
          id: string
          metric_1_name: string
          metric_1_type: string
          metric_2_name: string
          metric_2_type: string
          moderating_variables: Json | null
          relationship_direction: string | null
          relationship_strength: string | null
          sample_size: number | null
          statistical_significance: number | null
          temporal_stability: string | null
          time_lag_days: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actionable_insights?: string | null
          analysis_session_id?: string | null
          causality_likelihood?: string | null
          clinical_meaningfulness?: string | null
          confounding_factors?: Json | null
          contextual_notes?: string | null
          correlation_coefficient: number
          correlation_period?: string | null
          correlation_type?: string | null
          created_at?: string | null
          health_implications?: string | null
          id?: string
          metric_1_name: string
          metric_1_type: string
          metric_2_name: string
          metric_2_type: string
          moderating_variables?: Json | null
          relationship_direction?: string | null
          relationship_strength?: string | null
          sample_size?: number | null
          statistical_significance?: number | null
          temporal_stability?: string | null
          time_lag_days?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actionable_insights?: string | null
          analysis_session_id?: string | null
          causality_likelihood?: string | null
          clinical_meaningfulness?: string | null
          confounding_factors?: Json | null
          contextual_notes?: string | null
          correlation_coefficient?: number
          correlation_period?: string | null
          correlation_type?: string | null
          created_at?: string | null
          health_implications?: string | null
          id?: string
          metric_1_name?: string
          metric_1_type?: string
          metric_2_name?: string
          metric_2_type?: string
          moderating_variables?: Json | null
          relationship_direction?: string | null
          relationship_strength?: string | null
          sample_size?: number | null
          statistical_significance?: number | null
          temporal_stability?: string | null
          time_lag_days?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_correlations_analysis_session_id_fkey"
            columns: ["analysis_session_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_device_data: {
        Row: {
          created_at: string
          data_details: Json | null
          data_type: string
          data_unit: string | null
          data_value: number | null
          device_id: string
          id: string
          recorded_at: string
          synced_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_details?: Json | null
          data_type: string
          data_unit?: string | null
          data_value?: number | null
          device_id: string
          id?: string
          recorded_at: string
          synced_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_details?: Json | null
          data_type?: string
          data_unit?: string | null
          data_value?: number | null
          device_id?: string
          id?: string
          recorded_at?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_device_data_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      health_habits: {
        Row: {
          best_streak: number | null
          created_at: string
          current_streak: number | null
          habit_name: string
          habit_type: string
          id: string
          is_active: boolean | null
          points_per_completion: number | null
          target_frequency: number
          total_completions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          created_at?: string
          current_streak?: number | null
          habit_name: string
          habit_type: string
          id?: string
          is_active?: boolean | null
          points_per_completion?: number | null
          target_frequency: number
          total_completions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number | null
          created_at?: string
          current_streak?: number | null
          habit_name?: string
          habit_type?: string
          id?: string
          is_active?: boolean | null
          points_per_completion?: number | null
          target_frequency?: number
          total_completions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_patterns: {
        Row: {
          actionability: string | null
          analysis_session_id: string | null
          clinical_relevance: string | null
          confidence_interval: Json | null
          created_at: string | null
          effect_size: number | null
          end_date: string | null
          frequency_description: string | null
          future_trend: string | null
          health_impact: string | null
          id: string
          pattern_category: string | null
          pattern_description: string
          pattern_name: string
          pattern_strength: number | null
          pattern_type: string
          predictive_value: number | null
          primary_metrics: Json
          secondary_metrics: Json | null
          start_date: string | null
          statistical_significance: number | null
          time_period: string | null
          trigger_factors: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actionability?: string | null
          analysis_session_id?: string | null
          clinical_relevance?: string | null
          confidence_interval?: Json | null
          created_at?: string | null
          effect_size?: number | null
          end_date?: string | null
          frequency_description?: string | null
          future_trend?: string | null
          health_impact?: string | null
          id?: string
          pattern_category?: string | null
          pattern_description: string
          pattern_name: string
          pattern_strength?: number | null
          pattern_type: string
          predictive_value?: number | null
          primary_metrics: Json
          secondary_metrics?: Json | null
          start_date?: string | null
          statistical_significance?: number | null
          time_period?: string | null
          trigger_factors?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actionability?: string | null
          analysis_session_id?: string | null
          clinical_relevance?: string | null
          confidence_interval?: Json | null
          created_at?: string | null
          effect_size?: number | null
          end_date?: string | null
          frequency_description?: string | null
          future_trend?: string | null
          health_impact?: string | null
          id?: string
          pattern_category?: string | null
          pattern_description?: string
          pattern_name?: string
          pattern_strength?: number | null
          pattern_type?: string
          predictive_value?: number | null
          primary_metrics?: Json
          secondary_metrics?: Json | null
          start_date?: string | null
          statistical_significance?: number | null
          time_period?: string | null
          trigger_factors?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_patterns_analysis_session_id_fkey"
            columns: ["analysis_session_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      health_recommendations: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string
          id: string
          priority: number
          risk_assessment_id: string | null
          title: string
        }
        Insert: {
          category: string
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          priority?: number
          risk_assessment_id?: string | null
          title: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          priority?: number
          risk_assessment_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_recommendations_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      health_service_integrations: {
        Row: {
          created_at: string
          id: string
          integration_status: string
          provider_name: string
          service_type: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_status?: string
          provider_name: string
          service_type: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_status?: string
          provider_name?: string
          service_type?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_service_orders: {
        Row: {
          created_at: string
          cycle_phase_at_order: string | null
          estimated_delivery: string | null
          id: string
          order_data: Json
          service_provider: string
          service_type: string
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_phase_at_order?: string | null
          estimated_delivery?: string | null
          id?: string
          order_data?: Json
          service_provider: string
          service_type: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_phase_at_order?: string | null
          estimated_delivery?: string | null
          id?: string
          order_data?: Json
          service_provider?: string
          service_type?: string
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hormonal_health_tracking: {
        Row: {
          created_at: string
          hormone_type: string
          id: string
          is_within_range: boolean | null
          lab_name: string | null
          level_unit: string | null
          level_value: number | null
          notes: string | null
          prescribed_by: string | null
          reference_range_max: number | null
          reference_range_min: number | null
          symptoms: string[] | null
          test_type: string | null
          tracking_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hormone_type: string
          id?: string
          is_within_range?: boolean | null
          lab_name?: string | null
          level_unit?: string | null
          level_value?: number | null
          notes?: string | null
          prescribed_by?: string | null
          reference_range_max?: number | null
          reference_range_min?: number | null
          symptoms?: string[] | null
          test_type?: string | null
          tracking_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hormone_type?: string
          id?: string
          is_within_range?: boolean | null
          lab_name?: string | null
          level_unit?: string | null
          level_value?: number | null
          notes?: string | null
          prescribed_by?: string | null
          reference_range_max?: number | null
          reference_range_min?: number | null
          symptoms?: string[] | null
          test_type?: string | null
          tracking_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lab_results: {
        Row: {
          created_at: string | null
          flag: string | null
          id: string
          interpretation: string | null
          lab_name: string | null
          medical_event_id: string | null
          methodology: string | null
          notes: string | null
          reference_range: string | null
          result_numeric: number | null
          result_value: string | null
          source_file_id: string | null
          status: string | null
          test_category: string | null
          test_code: string | null
          test_date: string
          test_name: string
          test_panel: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flag?: string | null
          id?: string
          interpretation?: string | null
          lab_name?: string | null
          medical_event_id?: string | null
          methodology?: string | null
          notes?: string | null
          reference_range?: string | null
          result_numeric?: number | null
          result_value?: string | null
          source_file_id?: string | null
          status?: string | null
          test_category?: string | null
          test_code?: string | null
          test_date: string
          test_name: string
          test_panel?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flag?: string | null
          id?: string
          interpretation?: string | null
          lab_name?: string | null
          medical_event_id?: string | null
          methodology?: string | null
          notes?: string | null
          reference_range?: string | null
          result_numeric?: number | null
          result_value?: string | null
          source_file_id?: string | null
          status?: string | null
          test_category?: string | null
          test_code?: string | null
          test_date?: string
          test_name?: string
          test_panel?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_medical_event_id_fkey"
            columns: ["medical_event_id"]
            isOneToOne: false
            referencedRelation: "medical_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_tests: {
        Row: {
          collection_date: string | null
          collection_time: string | null
          cost: number | null
          created_at: string
          id: string
          interpretation: string | null
          optimal_cycle_phase: string | null
          partner_id: string | null
          preparation_completed: boolean | null
          preparation_instructions: Json | null
          processing_duration: string | null
          reference_ranges: Json | null
          results: Json | null
          status: string | null
          test_category: string
          test_code: string
          test_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_date?: string | null
          collection_time?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          optimal_cycle_phase?: string | null
          partner_id?: string | null
          preparation_completed?: boolean | null
          preparation_instructions?: Json | null
          processing_duration?: string | null
          reference_ranges?: Json | null
          results?: Json | null
          status?: string | null
          test_category: string
          test_code: string
          test_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_date?: string | null
          collection_time?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          optimal_cycle_phase?: string | null
          partner_id?: string | null
          preparation_completed?: boolean | null
          preparation_instructions?: Json | null
          processing_duration?: string | null
          reference_ranges?: Json | null
          results?: Json | null
          status?: string | null
          test_category?: string
          test_code?: string
          test_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratory_profiles: {
        Row: {
          accreditation: string[] | null
          address: string | null
          api_access_enabled: boolean | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          laboratory_name: string
          license_number: string | null
          phone: string | null
          test_types_offered: string[] | null
          updated_at: string
          user_id: string
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          accreditation?: string[] | null
          address?: string | null
          api_access_enabled?: boolean | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          laboratory_name: string
          license_number?: string | null
          phone?: string | null
          test_types_offered?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          accreditation?: string[] | null
          address?: string | null
          api_access_enabled?: boolean | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          laboratory_name?: string
          license_number?: string | null
          phone?: string | null
          test_types_offered?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      medical_appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          cost: number | null
          created_at: string
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          payment_status: string | null
          provider_id: string
          reason: string | null
          reminder_sent: boolean | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type: string
          cost?: number | null
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          provider_id: string
          reason?: string | null
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string
          cost?: number | null
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          provider_id?: string
          reason?: string | null
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "partner_doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_appointments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "partner_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_calendar_events: {
        Row: {
          clinic_name: string | null
          created_at: string
          description: string | null
          doctor_name: string | null
          duration_minutes: number | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          is_completed: boolean | null
          location: string | null
          notes: string | null
          reminder_minutes: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          is_completed?: boolean | null
          location?: string | null
          notes?: string | null
          reminder_minutes?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_name?: string | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          duration_minutes?: number | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_completed?: boolean | null
          location?: string | null
          notes?: string | null
          reminder_minutes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_events: {
        Row: {
          attached_files: Json | null
          clinic_name: string | null
          created_at: string | null
          description: string | null
          diagnosis: string | null
          doctor_name: string | null
          doctor_specialty: string | null
          duration_minutes: number | null
          event_date: string
          event_subtype: string | null
          event_time: string | null
          event_type: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          icd_codes: Json | null
          id: string
          location: string | null
          medications: Json | null
          organ_system: string | null
          priority: string | null
          recommendations: string | null
          results: Json | null
          status: string | null
          symptoms: Json | null
          title: string
          treatment: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attached_files?: Json | null
          clinic_name?: string | null
          created_at?: string | null
          description?: string | null
          diagnosis?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          duration_minutes?: number | null
          event_date: string
          event_subtype?: string | null
          event_time?: string | null
          event_type: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          icd_codes?: Json | null
          id?: string
          location?: string | null
          medications?: Json | null
          organ_system?: string | null
          priority?: string | null
          recommendations?: string | null
          results?: Json | null
          status?: string | null
          symptoms?: Json | null
          title: string
          treatment?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attached_files?: Json | null
          clinic_name?: string | null
          created_at?: string | null
          description?: string | null
          diagnosis?: string | null
          doctor_name?: string | null
          doctor_specialty?: string | null
          duration_minutes?: number | null
          event_date?: string
          event_subtype?: string | null
          event_time?: string | null
          event_type?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          icd_codes?: Json | null
          id?: string
          location?: string | null
          medications?: Json | null
          organ_system?: string | null
          priority?: string | null
          recommendations?: string | null
          results?: Json | null
          status?: string | null
          symptoms?: Json | null
          title?: string
          treatment?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_files: {
        Row: {
          ai_analysis_completed: boolean | null
          clinic_name: string | null
          created_at: string | null
          custom_tags: Json | null
          description: string | null
          doctor_name: string | null
          document_type: string | null
          encryption_key_id: string | null
          examination_date: string | null
          file_hash: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          is_encrypted: boolean | null
          medical_category: string | null
          mime_type: string | null
          notes: string | null
          ocr_completed: boolean | null
          organ_system: string | null
          original_filename: string
          parent_file_id: string | null
          processing_status: string | null
          related_event_id: string | null
          storage_path: string
          tags: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_analysis_completed?: boolean | null
          clinic_name?: string | null
          created_at?: string | null
          custom_tags?: Json | null
          description?: string | null
          doctor_name?: string | null
          document_type?: string | null
          encryption_key_id?: string | null
          examination_date?: string | null
          file_hash?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          is_encrypted?: boolean | null
          medical_category?: string | null
          mime_type?: string | null
          notes?: string | null
          ocr_completed?: boolean | null
          organ_system?: string | null
          original_filename: string
          parent_file_id?: string | null
          processing_status?: string | null
          related_event_id?: string | null
          storage_path: string
          tags?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_analysis_completed?: boolean | null
          clinic_name?: string | null
          created_at?: string | null
          custom_tags?: Json | null
          description?: string | null
          doctor_name?: string | null
          document_type?: string | null
          encryption_key_id?: string | null
          examination_date?: string | null
          file_hash?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          is_encrypted?: boolean | null
          medical_category?: string | null
          mime_type?: string | null
          notes?: string | null
          ocr_completed?: boolean | null
          organ_system?: string | null
          original_filename?: string
          parent_file_id?: string | null
          processing_status?: string | null
          related_event_id?: string | null
          storage_path?: string
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_files_parent_file_id_fkey"
            columns: ["parent_file_id"]
            isOneToOne: false
            referencedRelation: "medical_files"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_partners: {
        Row: {
          address: Json
          age_groups_served: Json | null
          api_endpoint: string | null
          api_version: string | null
          appointment_booking_available: boolean | null
          available_services: Json
          coordinates: unknown | null
          created_at: string
          email: string | null
          id: string
          integration_status: string | null
          last_sync: string | null
          legal_entity: string | null
          license_number: string | null
          online_results_available: boolean | null
          partner_name: string
          partner_type: string
          patient_reviews_count: number | null
          phone: string | null
          quality_rating: number | null
          service_areas: Json | null
          specializations: Json
          telemedicine_available: boolean | null
          updated_at: string
          website: string | null
          women_health_expertise: number | null
          women_health_focus: boolean | null
        }
        Insert: {
          address?: Json
          age_groups_served?: Json | null
          api_endpoint?: string | null
          api_version?: string | null
          appointment_booking_available?: boolean | null
          available_services?: Json
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          id?: string
          integration_status?: string | null
          last_sync?: string | null
          legal_entity?: string | null
          license_number?: string | null
          online_results_available?: boolean | null
          partner_name: string
          partner_type: string
          patient_reviews_count?: number | null
          phone?: string | null
          quality_rating?: number | null
          service_areas?: Json | null
          specializations?: Json
          telemedicine_available?: boolean | null
          updated_at?: string
          website?: string | null
          women_health_expertise?: number | null
          women_health_focus?: boolean | null
        }
        Update: {
          address?: Json
          age_groups_served?: Json | null
          api_endpoint?: string | null
          api_version?: string | null
          appointment_booking_available?: boolean | null
          available_services?: Json
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          id?: string
          integration_status?: string | null
          last_sync?: string | null
          legal_entity?: string | null
          license_number?: string | null
          online_results_available?: boolean | null
          partner_name?: string
          partner_type?: string
          patient_reviews_count?: number | null
          phone?: string | null
          quality_rating?: number | null
          service_areas?: Json | null
          specializations?: Json
          telemedicine_available?: boolean | null
          updated_at?: string
          website?: string | null
          women_health_expertise?: number | null
          women_health_focus?: boolean | null
        }
        Relationships: []
      }
      medical_procedures: {
        Row: {
          clinic_name: string | null
          created_at: string
          doctor_name: string | null
          duration_minutes: number | null
          id: string
          is_recurring: boolean | null
          location: string | null
          notes: string | null
          preparation_instructions: string | null
          procedure_name: string
          procedure_type: string
          recurrence_pattern: Json | null
          reminder_sent: boolean | null
          scheduled_date: string
          scheduled_time: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          preparation_instructions?: string | null
          procedure_name: string
          procedure_type: string
          recurrence_pattern?: Json | null
          reminder_sent?: boolean | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_name?: string | null
          created_at?: string
          doctor_name?: string | null
          duration_minutes?: number | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          preparation_instructions?: string | null
          procedure_name?: string
          procedure_type?: string
          recurrence_pattern?: Json | null
          reminder_sent?: boolean | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          attachments: Json | null
          clinic_name: string | null
          created_at: string
          description: string | null
          doctor_name: string | null
          file_attachments: Json | null
          id: string
          is_active: boolean
          metadata: Json | null
          record_date: string
          record_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          file_attachments?: Json | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          record_date: string
          record_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          clinic_name?: string | null
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          file_attachments?: Json | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          record_date?: string
          record_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_reminders: {
        Row: {
          appointment_id: string | null
          available_actions: Json | null
          created_at: string
          id: string
          lab_test_id: string | null
          message: string
          read_at: string | null
          reminder_type: string
          sent_at: string | null
          status: string | null
          title: string
          trigger_date: string
          trigger_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          available_actions?: Json | null
          created_at?: string
          id?: string
          lab_test_id?: string | null
          message: string
          read_at?: string | null
          reminder_type: string
          sent_at?: string | null
          status?: string | null
          title: string
          trigger_date: string
          trigger_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          available_actions?: Json | null
          created_at?: string
          id?: string
          lab_test_id?: string | null
          message?: string
          read_at?: string | null
          reminder_type?: string
          sent_at?: string | null
          status?: string | null
          title?: string
          trigger_date?: string
          trigger_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "gynecology_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_reminders_lab_test_id_fkey"
            columns: ["lab_test_id"]
            isOneToOne: false
            referencedRelation: "lab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          notes: string | null
          side_effects_experienced: string | null
          taken_at: string
          user_id: string
          was_on_time: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          notes?: string | null
          side_effects_experienced?: string | null
          taken_at?: string
          user_id: string
          was_on_time?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          notes?: string | null
          side_effects_experienced?: string | null
          taken_at?: string
          user_id?: string
          was_on_time?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_reminders: {
        Row: {
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          last_taken_at: string | null
          medication_id: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          last_taken_at?: string | null
          medication_id: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          last_taken_at?: string | null
          medication_id?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_reminders_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          frequency: string
          id: string
          instructions: string | null
          is_active: boolean
          medication_name: string
          side_effects: string | null
          specific_times: string[] | null
          times_per_day: number
          treatment_plan_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage: string
          frequency: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          medication_name: string
          side_effects?: string | null
          specific_times?: string[] | null
          times_per_day?: number
          treatment_plan_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string
          frequency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          medication_name?: string
          side_effects?: string | null
          specific_times?: string[] | null
          times_per_day?: number
          treatment_plan_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_treatment_plan_id_fkey"
            columns: ["treatment_plan_id"]
            isOneToOne: false
            referencedRelation: "treatment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      menstrual_cycles: {
        Row: {
          basal_temperature: number | null
          bloating: boolean | null
          breast_tenderness: boolean | null
          cervical_mucus: string | null
          created_at: string
          cycle_end_date: string | null
          cycle_length: number | null
          cycle_start_date: string
          cycle_type: string | null
          flow_intensity: string | null
          id: string
          mood_rating: number | null
          notes: string | null
          ovulation_date: string | null
          ovulation_test_result: boolean | null
          pain_level: number | null
          period_length: number | null
          predicted_next_cycle: string | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          basal_temperature?: number | null
          bloating?: boolean | null
          breast_tenderness?: boolean | null
          cervical_mucus?: string | null
          created_at?: string
          cycle_end_date?: string | null
          cycle_length?: number | null
          cycle_start_date: string
          cycle_type?: string | null
          flow_intensity?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          ovulation_date?: string | null
          ovulation_test_result?: boolean | null
          pain_level?: number | null
          period_length?: number | null
          predicted_next_cycle?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          basal_temperature?: number | null
          bloating?: boolean | null
          breast_tenderness?: boolean | null
          cervical_mucus?: string | null
          created_at?: string
          cycle_end_date?: string | null
          cycle_length?: number | null
          cycle_start_date?: string
          cycle_type?: string | null
          flow_intensity?: string | null
          id?: string
          mood_rating?: number | null
          notes?: string | null
          ovulation_date?: string | null
          ovulation_test_result?: boolean | null
          pain_level?: number | null
          period_length?: number | null
          predicted_next_cycle?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_images: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      motivational_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string
          scheduled_for: string | null
          title: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type: string
          scheduled_for?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string
          scheduled_for?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          delivery_method: string
          delivery_status: string | null
          id: string
          message: string
          metadata: Json | null
          notification_type: string
          related_reminder_id: string | null
          sent_at: string
          title: string
          user_id: string
        }
        Insert: {
          delivery_method: string
          delivery_status?: string | null
          id?: string
          message: string
          metadata?: Json | null
          notification_type: string
          related_reminder_id?: string | null
          sent_at?: string
          title: string
          user_id: string
        }
        Update: {
          delivery_method?: string
          delivery_status?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          notification_type?: string
          related_reminder_id?: string | null
          sent_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_related_reminder_id_fkey"
            columns: ["related_reminder_id"]
            isOneToOne: false
            referencedRelation: "user_reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          order_type: string | null
          status: string | null
          stripe_session_id: string | null
          tier_name: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          order_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tier_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          order_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          tier_name?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      organization_verifications: {
        Row: {
          created_at: string
          documents_submitted: Json | null
          id: string
          notes: string | null
          organization_id: string
          organization_type: string
          rejection_reason: string | null
          updated_at: string
          verification_date: string | null
          verification_status: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          documents_submitted?: Json | null
          id?: string
          notes?: string | null
          organization_id: string
          organization_type: string
          rejection_reason?: string | null
          updated_at?: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          documents_submitted?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string
          organization_type?: string
          rejection_reason?: string | null
          updated_at?: string
          verification_date?: string | null
          verification_status?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      partner_doctors: {
        Row: {
          available_slots: Json | null
          bio: string | null
          consultation_fee: number | null
          created_at: string
          experience_years: number | null
          full_name: string
          id: string
          is_available: boolean
          photo_url: string | null
          provider_id: string
          qualification: string | null
          rating: number | null
          specialization: string
          updated_at: string
        }
        Insert: {
          available_slots?: Json | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_available?: boolean
          photo_url?: string | null
          provider_id: string
          qualification?: string | null
          rating?: number | null
          specialization: string
          updated_at?: string
        }
        Update: {
          available_slots?: Json | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_available?: boolean
          photo_url?: string | null
          provider_id?: string
          qualification?: string | null
          rating?: number | null
          specialization?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_doctors_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "partner_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_providers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          provider_type: string
          rating: number | null
          specializations: string[] | null
          updated_at: string
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          provider_type: string
          rating?: number | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          provider_type?: string
          rating?: number | null
          specializations?: string[] | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      patient_data_permissions: {
        Row: {
          created_at: string
          data_types: string[]
          expires_at: string | null
          granted_at: string
          granted_to_id: string
          granted_to_role: Database["public"]["Enums"]["app_role"]
          id: string
          is_active: boolean | null
          patient_id: string
          permission_type: string
          revoked_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_types: string[]
          expires_at?: string | null
          granted_at?: string
          granted_to_id: string
          granted_to_role: Database["public"]["Enums"]["app_role"]
          id?: string
          is_active?: boolean | null
          patient_id: string
          permission_type: string
          revoked_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_types?: string[]
          expires_at?: string | null
          granted_at?: string
          granted_to_id?: string
          granted_to_role?: Database["public"]["Enums"]["app_role"]
          id?: string
          is_active?: boolean | null
          patient_id?: string
          permission_type?: string
          revoked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pharmacy_partners: {
        Row: {
          address: string | null
          created_at: string
          delivery_available: boolean | null
          delivery_zones: string[] | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          rating: number | null
          updated_at: string
          website: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_zones?: string[] | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_zones?: string[] | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          rating?: number | null
          updated_at?: string
          website?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "post_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          anonymous_name: string
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_anonymous: boolean | null
          like_count: number | null
          post_id: string
          updated_at: string
        }
        Insert: {
          anonymous_name: string
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          like_count?: number | null
          post_id: string
          updated_at?: string
        }
        Update: {
          anonymous_name?: string
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          like_count?: number | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_planning: {
        Row: {
          created_at: string
          fertility_tracking: boolean | null
          folic_acid_intake: boolean | null
          id: string
          is_active: boolean | null
          lifestyle_changes: string[] | null
          medical_checkups: string[] | null
          notes: string | null
          ovulation_prediction: boolean | null
          partner_health_check: boolean | null
          planning_start_date: string
          prenatal_vitamins: boolean | null
          target_conception_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fertility_tracking?: boolean | null
          folic_acid_intake?: boolean | null
          id?: string
          is_active?: boolean | null
          lifestyle_changes?: string[] | null
          medical_checkups?: string[] | null
          notes?: string | null
          ovulation_prediction?: boolean | null
          partner_health_check?: boolean | null
          planning_start_date: string
          prenatal_vitamins?: boolean | null
          target_conception_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fertility_tracking?: boolean | null
          folic_acid_intake?: boolean | null
          id?: string
          is_active?: boolean | null
          lifestyle_changes?: string[] | null
          medical_checkups?: string[] | null
          notes?: string | null
          ovulation_prediction?: boolean | null
          partner_health_check?: boolean | null
          planning_start_date?: string
          prenatal_vitamins?: boolean | null
          target_conception_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      privacy_policy: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          updated_by: string | null
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          alcohol_consumption: string | null
          allergies: string | null
          chronic_conditions: string | null
          created_at: string
          current_health_issues: string | null
          current_medications: string | null
          date_of_birth: string | null
          dietary_restrictions: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          exercise_frequency: string | null
          family_history: string | null
          full_name: string | null
          gender: string | null
          health_goals: string | null
          height: number | null
          id: string
          insurance_info: string | null
          last_checkup_date: string | null
          lifestyle: string | null
          medical_history: string | null
          mental_health_history: string | null
          preferred_doctor: string | null
          previous_surgeries: string | null
          reproductive_health: string | null
          sleep_patterns: string | null
          smoking_status: string | null
          stress_levels: string | null
          updated_at: string
          vaccination_history: string | null
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_health_issues?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          exercise_frequency?: string | null
          family_history?: string | null
          full_name?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id: string
          insurance_info?: string | null
          last_checkup_date?: string | null
          lifestyle?: string | null
          medical_history?: string | null
          mental_health_history?: string | null
          preferred_doctor?: string | null
          previous_surgeries?: string | null
          reproductive_health?: string | null
          sleep_patterns?: string | null
          smoking_status?: string | null
          stress_levels?: string | null
          updated_at?: string
          vaccination_history?: string | null
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          created_at?: string
          current_health_issues?: string | null
          current_medications?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          exercise_frequency?: string | null
          family_history?: string | null
          full_name?: string | null
          gender?: string | null
          health_goals?: string | null
          height?: number | null
          id?: string
          insurance_info?: string | null
          last_checkup_date?: string | null
          lifestyle?: string | null
          medical_history?: string | null
          mental_health_history?: string | null
          preferred_doctor?: string | null
          previous_surgeries?: string | null
          reproductive_health?: string | null
          sleep_patterns?: string | null
          smoking_status?: string | null
          stress_levels?: string | null
          updated_at?: string
          vaccination_history?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      research_files: {
        Row: {
          created_at: string
          description: string | null
          doctor_name: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_shared: boolean
          lab_name: string | null
          research_date: string
          research_type: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_shared?: boolean
          lab_name?: string | null
          research_date: string
          research_type: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor_name?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_shared?: boolean
          lab_name?: string | null
          research_date?: string
          research_type?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_data: Json
          assessment_type: string
          created_at: string
          id: string
          recommendations: string[] | null
          results_data: Json
          risk_level: string
          risk_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data: Json
          assessment_type: string
          created_at?: string
          id?: string
          recommendations?: string[] | null
          results_data: Json
          risk_level: string
          risk_percentage: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json
          assessment_type?: string
          created_at?: string
          id?: string
          recommendations?: string[] | null
          results_data?: Json
          risk_level?: string
          risk_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      screening_plans: {
        Row: {
          age_considerations: Json | null
          completion_percentage: number | null
          completion_status: string | null
          created_at: string
          cycle_considerations: Json | null
          id: string
          next_appointment_date: string | null
          plan_name: string
          plan_type: string
          priority_level: string | null
          recommended_frequency: string | null
          recommended_services: Json
          risk_factors: Json | null
          total_estimated_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_considerations?: Json | null
          completion_percentage?: number | null
          completion_status?: string | null
          created_at?: string
          cycle_considerations?: Json | null
          id?: string
          next_appointment_date?: string | null
          plan_name: string
          plan_type: string
          priority_level?: string | null
          recommended_frequency?: string | null
          recommended_services?: Json
          risk_factors?: Json | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_considerations?: Json | null
          completion_percentage?: number | null
          completion_status?: string | null
          created_at?: string
          cycle_considerations?: Json | null
          id?: string
          next_appointment_date?: string | null
          plan_name?: string
          plan_type?: string
          priority_level?: string | null
          recommended_frequency?: string | null
          recommended_services?: Json
          risk_factors?: Json | null
          total_estimated_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_name: string
          setting_value: Json
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_name: string
          setting_value: Json
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_name?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_groups: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_anonymous: boolean | null
          member_count: number | null
          name: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          member_count?: number | null
          name: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_anonymous?: boolean | null
          member_count?: number | null
          name?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "support_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          attachments: Json | null
          category: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      symptom_mood_logs: {
        Row: {
          created_at: string
          energy_level: number | null
          id: string
          log_date: string
          mood_rating: number | null
          mood_tags: string[] | null
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          energy_level?: number | null
          id?: string
          log_date: string
          mood_rating?: number | null
          mood_tags?: string[] | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          energy_level?: number | null
          id?: string
          log_date?: string
          mood_rating?: number | null
          mood_tags?: string[] | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      telemedicine_sessions: {
        Row: {
          appointment_id: string
          calendar_event_id: string | null
          calendar_platform: string | null
          conference_platform: string | null
          created_at: string
          doctor_id: string
          duration_minutes: number | null
          ended_at: string | null
          follow_up_required: boolean | null
          id: string
          meeting_link: string | null
          payment_amount: number | null
          payment_status: string | null
          prescription_issued: boolean | null
          room_id: string | null
          session_notes: string | null
          session_recording_url: string | null
          session_status: string
          session_token: string | null
          started_at: string | null
          updated_at: string
          user_id: string
          video_conference_id: string | null
        }
        Insert: {
          appointment_id: string
          calendar_event_id?: string | null
          calendar_platform?: string | null
          conference_platform?: string | null
          created_at?: string
          doctor_id: string
          duration_minutes?: number | null
          ended_at?: string | null
          follow_up_required?: boolean | null
          id?: string
          meeting_link?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          prescription_issued?: boolean | null
          room_id?: string | null
          session_notes?: string | null
          session_recording_url?: string | null
          session_status?: string
          session_token?: string | null
          started_at?: string | null
          updated_at?: string
          user_id: string
          video_conference_id?: string | null
        }
        Update: {
          appointment_id?: string
          calendar_event_id?: string | null
          calendar_platform?: string | null
          conference_platform?: string | null
          created_at?: string
          doctor_id?: string
          duration_minutes?: number | null
          ended_at?: string | null
          follow_up_required?: boolean | null
          id?: string
          meeting_link?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          prescription_issued?: boolean | null
          room_id?: string | null
          session_notes?: string | null
          session_recording_url?: string | null
          session_status?: string
          session_token?: string | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
          video_conference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemedicine_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "medical_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemedicine_sessions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "partner_doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      treatment_plans: {
        Row: {
          consultation_id: string | null
          created_at: string
          doctor_name: string | null
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          plan_name: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_id?: string | null
          created_at?: string
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          plan_name: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_id?: string | null
          created_at?: string
          doctor_name?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          plan_name?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_devices: {
        Row: {
          access_token: string | null
          connection_status: string | null
          created_at: string
          data_types: Json | null
          device_name: string
          device_settings: Json | null
          device_type: string
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          last_sync_data: Json | null
          refresh_token: string | null
          sync_frequency_minutes: number | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connection_status?: string | null
          created_at?: string
          data_types?: Json | null
          device_name: string
          device_settings?: Json | null
          device_type: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          last_sync_data?: Json | null
          refresh_token?: string | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connection_status?: string | null
          created_at?: string
          data_types?: Json | null
          device_name?: string
          device_settings?: Json | null
          device_type?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          last_sync_data?: Json | null
          refresh_token?: string | null
          sync_frequency_minutes?: number | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number | null
          id: string
          points_to_next_level: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number | null
          id?: string
          points_to_next_level?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number | null
          id?: string
          points_to_next_level?: number | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reminders: {
        Row: {
          created_at: string
          description: string | null
          frequency: string
          frequency_data: Json | null
          id: string
          is_active: boolean | null
          next_reminder_at: string
          notification_methods: Json | null
          reminder_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          frequency: string
          frequency_data?: Json | null
          id?: string
          is_active?: boolean | null
          next_reminder_at: string
          notification_methods?: Json | null
          reminder_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          frequency?: string
          frequency_data?: Json | null
          id?: string
          is_active?: boolean | null
          next_reminder_at?: string
          notification_methods?: Json | null
          reminder_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_conference_integrations: {
        Row: {
          access_token: string | null
          created_at: string
          id: string
          integration_status: string | null
          platform_settings: Json | null
          platform_type: string
          platform_user_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          id?: string
          integration_status?: string | null
          platform_settings?: Json | null
          platform_type: string
          platform_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          id?: string
          integration_status?: string | null
          platform_settings?: Json | null
          platform_type?: string
          platform_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          action_results: Json | null
          completed_at: string | null
          created_at: string
          cycle_context: Json | null
          error_details: Json | null
          executed_actions: Json | null
          execution_duration_seconds: number | null
          execution_log: Json | null
          execution_status: string | null
          failed_actions: number | null
          id: string
          resource_usage: Json | null
          started_at: string | null
          successful_actions: number | null
          total_actions: number | null
          trigger_event: Json | null
          updated_at: string
          user_context: Json | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          action_results?: Json | null
          completed_at?: string | null
          created_at?: string
          cycle_context?: Json | null
          error_details?: Json | null
          executed_actions?: Json | null
          execution_duration_seconds?: number | null
          execution_log?: Json | null
          execution_status?: string | null
          failed_actions?: number | null
          id?: string
          resource_usage?: Json | null
          started_at?: string | null
          successful_actions?: number | null
          total_actions?: number | null
          trigger_event?: Json | null
          updated_at?: string
          user_context?: Json | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          action_results?: Json | null
          completed_at?: string | null
          created_at?: string
          cycle_context?: Json | null
          error_details?: Json | null
          executed_actions?: Json | null
          execution_duration_seconds?: number | null
          execution_log?: Json | null
          execution_status?: string | null
          failed_actions?: number | null
          id?: string
          resource_usage?: Json | null
          started_at?: string | null
          successful_actions?: number | null
          total_actions?: number | null
          trigger_event?: Json | null
          updated_at?: string
          user_context?: Json | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_patient_data_permission: {
        Args: {
          _patient_id: string
          _requester_id: string
          _permission_type: string
          _data_type: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "clinic" | "laboratory" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "doctor", "clinic", "laboratory", "admin"],
    },
  },
} as const
