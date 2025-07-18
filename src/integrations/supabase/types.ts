export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      ai_insights: {
        Row: {
          actionable_recommendations: Json | null
          confidence_score: number | null
          created_at: string | null
          id: string
          insight_data: Json
          insight_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actionable_recommendations?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_data: Json
          insight_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actionable_recommendations?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          insight_data?: Json
          insight_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_error_logs: {
        Row: {
          created_at: string | null
          error_details: Json | null
          error_message: string
          error_type: string
          id: string
          ip_address: string | null
          recovery_attempted: boolean | null
          recovery_successful: boolean | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_details?: Json | null
          error_message: string
          error_type: string
          id?: string
          ip_address?: string | null
          recovery_attempted?: boolean | null
          recovery_successful?: boolean | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_details?: Json | null
          error_message?: string
          error_type?: string
          id?: string
          ip_address?: string | null
          recovery_attempted?: boolean | null
          recovery_successful?: boolean | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      backup_verification_log: {
        Row: {
          backup_date: string
          backup_size_bytes: number | null
          backup_type: string
          created_at: string | null
          id: string
          recovery_test_passed: boolean | null
          verification_details: Json | null
          verification_status: string
        }
        Insert: {
          backup_date: string
          backup_size_bytes?: number | null
          backup_type: string
          created_at?: string | null
          id?: string
          recovery_test_passed?: boolean | null
          verification_details?: Json | null
          verification_status: string
        }
        Update: {
          backup_date?: string
          backup_size_bytes?: number | null
          backup_type?: string
          created_at?: string | null
          id?: string
          recovery_test_passed?: boolean | null
          verification_details?: Json | null
          verification_status?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          author_role: string | null
          content: string
          created_at: string | null
          id: string
          is_expert_reply: boolean | null
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          author_role?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_expert_reply?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_expert_reply?: boolean | null
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "expert_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "expert_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      body_composition_metrics: {
        Row: {
          bmi: number | null
          body_fat_percentage: number | null
          bone_density: number | null
          created_at: string
          device_source: string | null
          id: string
          measurement_date: string
          measurement_method: string | null
          metabolic_age: number | null
          muscle_mass_kg: number | null
          recorded_at: string
          updated_at: string
          user_id: string
          visceral_fat_level: number | null
          water_percentage: number | null
          weight_kg: number | null
        }
        Insert: {
          bmi?: number | null
          body_fat_percentage?: number | null
          bone_density?: number | null
          created_at?: string
          device_source?: string | null
          id?: string
          measurement_date: string
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          recorded_at?: string
          updated_at?: string
          user_id: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
          weight_kg?: number | null
        }
        Update: {
          bmi?: number | null
          body_fat_percentage?: number | null
          bone_density?: number | null
          created_at?: string
          device_source?: string | null
          id?: string
          measurement_date?: string
          measurement_method?: string | null
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          recorded_at?: string
          updated_at?: string
          user_id?: string
          visceral_fat_level?: number | null
          water_percentage?: number | null
          weight_kg?: number | null
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
      chat_messages: {
        Row: {
          created_at: string
          id: number
          role: string
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          role: string
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          role?: string
          text?: string
          user_id?: string | null
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
      compliance_log: {
        Row: {
          action: string
          automated: boolean | null
          compliance_type: string
          created_at: string | null
          data_types: string[] | null
          details: Json | null
          id: string
          processing_basis: string | null
          retention_period_days: number | null
          user_id: string | null
        }
        Insert: {
          action: string
          automated?: boolean | null
          compliance_type: string
          created_at?: string | null
          data_types?: string[] | null
          details?: Json | null
          id?: string
          processing_basis?: string | null
          retention_period_days?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string
          automated?: boolean | null
          compliance_type?: string
          created_at?: string | null
          data_types?: string[] | null
          details?: Json | null
          id?: string
          processing_basis?: string | null
          retention_period_days?: number | null
          user_id?: string | null
        }
        Relationships: []
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
      correlation_analysis: {
        Row: {
          analysis_type: string
          correlation_strength: number | null
          created_at: string | null
          id: string
          insights: Json
          recommendations: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          correlation_strength?: number | null
          created_at?: string | null
          id?: string
          insights: Json
          recommendations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          correlation_strength?: number | null
          created_at?: string | null
          id?: string
          insights?: Json
          recommendations?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          average_rating: number | null
          category: Database["public"]["Enums"]["course_category"]
          completion_rate: number | null
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["course_difficulty"]
          duration_minutes: number | null
          id: string
          instructor_id: string | null
          is_featured: boolean | null
          is_new: boolean | null
          preview_video_url: string | null
          required_subscription: Database["public"]["Enums"]["subscription_tier"]
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          category: Database["public"]["Enums"]["course_category"]
          completion_rate?: number | null
          created_at?: string | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["course_difficulty"]
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          preview_video_url?: string | null
          required_subscription?: Database["public"]["Enums"]["subscription_tier"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          category?: Database["public"]["Enums"]["course_category"]
          completion_rate?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["course_difficulty"]
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          preview_video_url?: string | null
          required_subscription?: Database["public"]["Enums"]["subscription_tier"]
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
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
      daily_nutrition_plans: {
        Row: {
          analysis_session_id: string | null
          calorie_target: number | null
          created_at: string
          dietary_restrictions: Json | null
          generated_at: string | null
          id: string
          is_generated: boolean | null
          macro_targets: Json | null
          meal_plan: Json
          nutritional_goals: Json | null
          personalization_factors: Json | null
          plan_date: string
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_session_id?: string | null
          calorie_target?: number | null
          created_at?: string
          dietary_restrictions?: Json | null
          generated_at?: string | null
          id?: string
          is_generated?: boolean | null
          macro_targets?: Json | null
          meal_plan?: Json
          nutritional_goals?: Json | null
          personalization_factors?: Json | null
          plan_date: string
          subscription_tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_session_id?: string | null
          calorie_target?: number | null
          created_at?: string
          dietary_restrictions?: Json | null
          generated_at?: string | null
          id?: string
          is_generated?: boolean | null
          macro_targets?: Json | null
          meal_plan?: Json
          nutritional_goals?: Json | null
          personalization_factors?: Json | null
          plan_date?: string
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_weather_records: {
        Row: {
          created_at: string
          date: string
          id: string
          location_data: Json
          updated_at: string
          user_id: string
          weather_data: Json
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          location_data: Json
          updated_at?: string
          user_id: string
          weather_data: Json
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          location_data?: Json
          updated_at?: string
          user_id?: string
          weather_data?: Json
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
      data_retention_policies: {
        Row: {
          created_at: string | null
          deletion_strategy: string | null
          id: string
          is_active: boolean | null
          last_cleanup_at: string | null
          retention_period_days: number
          table_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deletion_strategy?: string | null
          id?: string
          is_active?: boolean | null
          last_cleanup_at?: string | null
          retention_period_days: number
          table_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deletion_strategy?: string | null
          id?: string
          is_active?: boolean | null
          last_cleanup_at?: string | null
          retention_period_days?: number
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      db_performance_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          execution_time_ms: number
          id: string
          query_hash: string | null
          query_type: string
          rows_affected: number | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms: number
          id?: string
          query_hash?: string | null
          query_type: string
          rows_affected?: number | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number
          id?: string
          query_hash?: string | null
          query_type?: string
          rows_affected?: number | null
          table_name?: string | null
          user_id?: string | null
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
      documents: {
        Row: {
          created_at: string
          date: string
          documentType: string
          id: number
          keyMetrics: Json | null
          summary: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          documentType: string
          id?: never
          keyMetrics?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          documentType?: string
          id?: never
          keyMetrics?: Json | null
          summary?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      encrypted_medical_data: {
        Row: {
          access_level: string
          created_at: string | null
          data_hash: string
          data_type: string
          encrypted_content: string
          encryption_metadata: Json
          expires_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_level?: string
          created_at?: string | null
          data_hash: string
          data_type: string
          encrypted_content: string
          encryption_metadata: Json
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_level?: string
          created_at?: string | null
          data_hash?: string
          data_type?: string
          encrypted_content?: string
          encryption_metadata?: Json
          expires_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_materials: {
        Row: {
          available_after: boolean | null
          available_before: boolean | null
          created_at: string | null
          event_id: string | null
          id: string
          title: string
          type: string
          url: string
        }
        Insert: {
          available_after?: boolean | null
          available_before?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          title: string
          type: string
          url: string
        }
        Update: {
          available_after?: boolean | null
          available_before?: boolean | null
          created_at?: string | null
          event_id?: string | null
          id?: string
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_materials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "live_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string | null
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "live_events"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_blog_posts: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string
          author_title: string | null
          category: string
          comments_count: number | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          likes_count: number | null
          meta_description: string | null
          meta_keywords: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          published_at: string | null
          reading_time: number | null
          shares_count: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_id?: string | null
          author_name: string
          author_title?: string | null
          category: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          published_at?: string | null
          reading_time?: number | null
          shares_count?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_id?: string | null
          author_name?: string
          author_title?: string | null
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          published_at?: string | null
          reading_time?: number | null
          shares_count?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
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
          data_quality_score: number | null
          data_source: string | null
          data_type: string
          external_id: string | null
          id: string
          integration_id: string
          is_processed: boolean | null
          processing_errors: Json | null
          recorded_date: string
          recorded_timestamp: string | null
          synced_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_payload: Json
          data_quality_score?: number | null
          data_source?: string | null
          data_type: string
          external_id?: string | null
          id?: string
          integration_id: string
          is_processed?: boolean | null
          processing_errors?: Json | null
          recorded_date: string
          recorded_timestamp?: string | null
          synced_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_payload?: Json
          data_quality_score?: number | null
          data_source?: string | null
          data_type?: string
          external_id?: string | null
          id?: string
          integration_id?: string
          is_processed?: boolean | null
          processing_errors?: Json | null
          recorded_date?: string
          recorded_timestamp?: string | null
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
      glucose_metrics: {
        Row: {
          created_at: string
          device_source: string | null
          id: string
          meal_context: string | null
          measurement_time: string | null
          measurement_type: string
          measurement_unit: string
          measurement_value: number
          medication_taken: boolean | null
          recorded_at: string
          symptoms_noted: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_source?: string | null
          id?: string
          meal_context?: string | null
          measurement_time?: string | null
          measurement_type: string
          measurement_unit?: string
          measurement_value: number
          medication_taken?: boolean | null
          recorded_at?: string
          symptoms_noted?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_source?: string | null
          id?: string
          meal_context?: string | null
          measurement_time?: string | null
          measurement_type?: string
          measurement_unit?: string
          measurement_value?: number
          medication_taken?: boolean | null
          recorded_at?: string
          symptoms_noted?: string[] | null
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
          error_details: Json | null
          id: string
          integration_status: string
          integration_type: string | null
          last_sync_at: string | null
          provider_name: string | null
          provider_user_id: string | null
          refresh_token: string | null
          scopes_granted: string[] | null
          sync_frequency: string | null
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          app_name: string
          app_user_id?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          integration_status?: string
          integration_type?: string | null
          last_sync_at?: string | null
          provider_name?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes_granted?: string[] | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          app_name?: string
          app_user_id?: string | null
          created_at?: string
          error_details?: Json | null
          id?: string
          integration_status?: string
          integration_type?: string | null
          last_sync_at?: string | null
          provider_name?: string | null
          provider_user_id?: string | null
          refresh_token?: string | null
          scopes_granted?: string[] | null
          sync_frequency?: string | null
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
          webhook_url?: string | null
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
      health_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          accessed_user_data: string
          id: string
          ip_address: unknown | null
          record_count: number | null
          table_accessed: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          accessed_user_data: string
          id?: string
          ip_address?: unknown | null
          record_count?: number | null
          table_accessed: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          accessed_user_data?: string
          id?: string
          ip_address?: unknown | null
          record_count?: number | null
          table_accessed?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_data_sync_logs: {
        Row: {
          created_at: string | null
          data_types_synced: string[] | null
          error_details: Json | null
          id: string
          integration_id: string
          records_failed: number | null
          records_synced: number | null
          sync_completed_at: string | null
          sync_duration_ms: number | null
          sync_started_at: string | null
          sync_status: string | null
        }
        Insert: {
          created_at?: string | null
          data_types_synced?: string[] | null
          error_details?: Json | null
          id?: string
          integration_id: string
          records_failed?: number | null
          records_synced?: number | null
          sync_completed_at?: string | null
          sync_duration_ms?: number | null
          sync_started_at?: string | null
          sync_status?: string | null
        }
        Update: {
          created_at?: string | null
          data_types_synced?: string[] | null
          error_details?: Json | null
          id?: string
          integration_id?: string
          records_failed?: number | null
          records_synced?: number | null
          sync_completed_at?: string | null
          sync_duration_ms?: number | null
          sync_started_at?: string | null
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_data_sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "health_app_integrations"
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
      instructors: {
        Row: {
          bio: string | null
          created_at: string | null
          credentials: string[] | null
          id: string
          name: string
          photo_url: string | null
          specialization: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          credentials?: string[] | null
          id?: string
          name: string
          photo_url?: string | null
          specialization?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          credentials?: string[] | null
          id?: string
          name?: string
          photo_url?: string | null
          specialization?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_audit_logs: {
        Row: {
          compliance_check_passed: boolean | null
          created_at: string | null
          data_quality_score: number | null
          endpoint_called: string | null
          error_message: string | null
          id: string
          operation_type: string
          partner_id: string
          processing_time_ms: number | null
          records_processed: number | null
          request_payload: Json | null
          response_payload: Json | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          compliance_check_passed?: boolean | null
          created_at?: string | null
          data_quality_score?: number | null
          endpoint_called?: string | null
          error_message?: string | null
          id?: string
          operation_type: string
          partner_id: string
          processing_time_ms?: number | null
          records_processed?: number | null
          request_payload?: Json | null
          response_payload?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          compliance_check_passed?: boolean | null
          created_at?: string | null
          data_quality_score?: number | null
          endpoint_called?: string | null
          error_message?: string | null
          id?: string
          operation_type?: string
          partner_id?: string
          processing_time_ms?: number | null
          records_processed?: number | null
          request_payload?: Json | null
          response_payload?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_audit_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          clinical_notes: string | null
          created_at: string | null
          diagnosis_codes: string[] | null
          external_order_id: string | null
          hl7_message: string | null
          id: string
          integration_metadata: Json | null
          order_number: string
          order_status: string | null
          ordered_tests: Json
          ordering_provider_name: string | null
          ordering_provider_npi: string | null
          partner_id: string
          patient_demographics: Json
          priority_level: string | null
          specimen_collection_date: string | null
          specimen_collection_site: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clinical_notes?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          external_order_id?: string | null
          hl7_message?: string | null
          id?: string
          integration_metadata?: Json | null
          order_number: string
          order_status?: string | null
          ordered_tests?: Json
          ordering_provider_name?: string | null
          ordering_provider_npi?: string | null
          partner_id: string
          patient_demographics: Json
          priority_level?: string | null
          specimen_collection_date?: string | null
          specimen_collection_site?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clinical_notes?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          external_order_id?: string | null
          hl7_message?: string | null
          id?: string
          integration_metadata?: Json | null
          order_number?: string
          order_status?: string | null
          ordered_tests?: Json
          ordering_provider_name?: string | null
          ordering_provider_npi?: string | null
          partner_id?: string
          patient_demographics?: Json
          priority_level?: string | null
          specimen_collection_date?: string | null
          specimen_collection_site?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
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
      lab_tests_catalog: {
        Row: {
          cost: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          loinc_code: string | null
          methodology: string | null
          normal_ranges: Json | null
          partner_id: string | null
          snomed_code: string | null
          specimen_type: string
          test_category: string
          test_code: string
          test_name: string
          turnaround_time_hours: number | null
          units: string | null
          updated_at: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          loinc_code?: string | null
          methodology?: string | null
          normal_ranges?: Json | null
          partner_id?: string | null
          snomed_code?: string | null
          specimen_type: string
          test_category: string
          test_code: string
          test_name: string
          turnaround_time_hours?: number | null
          units?: string | null
          updated_at?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          loinc_code?: string | null
          methodology?: string | null
          normal_ranges?: Json | null
          partner_id?: string | null
          snomed_code?: string | null
          specimen_type?: string
          test_category?: string
          test_code?: string
          test_name?: string
          turnaround_time_hours?: number | null
          units?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_tests_catalog_partner_id_fkey"
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
      learning_goals: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          progress_percentage: number | null
          related_courses: string[] | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_percentage?: number | null
          related_courses?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          progress_percentage?: number | null
          related_courses?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_stats: {
        Row: {
          certificates_earned: number | null
          created_at: string
          current_streak_days: number | null
          favorite_topics: string[] | null
          id: string
          total_courses_completed: number | null
          total_courses_enrolled: number | null
          total_hours_watched: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificates_earned?: number | null
          created_at?: string
          current_streak_days?: number | null
          favorite_topics?: string[] | null
          id?: string
          total_courses_completed?: number | null
          total_courses_enrolled?: number | null
          total_hours_watched?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificates_earned?: number | null
          created_at?: string
          current_streak_days?: number | null
          favorite_topics?: string[] | null
          id?: string
          total_courses_completed?: number | null
          total_courses_enrolled?: number | null
          total_hours_watched?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_resources: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          lesson_id: string | null
          title: string
          type: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          title: string
          type: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          lesson_id?: string | null
          title?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_preview: boolean | null
          key_takeaways: string[] | null
          order_index: number | null
          title: string
          transcript: string | null
          video_url: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          key_takeaways?: string[] | null
          order_index?: number | null
          title: string
          transcript?: string | null
          video_url: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_preview?: boolean | null
          key_takeaways?: string[] | null
          order_index?: number | null
          title?: string
          transcript?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      live_events: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          duration_minutes: number
          host_id: string | null
          id: string
          is_recorded: boolean | null
          max_participants: number | null
          recording_url: string | null
          registration_required: boolean | null
          required_subscription: Database["public"]["Enums"]["subscription_tier"]
          scheduled_start: string
          status: Database["public"]["Enums"]["event_status"] | null
          tags: string[] | null
          target_audience: string[] | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at: string | null
          zoom_link: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes: number
          host_id?: string | null
          id?: string
          is_recorded?: boolean | null
          max_participants?: number | null
          recording_url?: string | null
          registration_required?: boolean | null
          required_subscription?: Database["public"]["Enums"]["subscription_tier"]
          scheduled_start: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          target_audience?: string[] | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          zoom_link?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number
          host_id?: string | null
          id?: string
          is_recorded?: boolean | null
          max_participants?: number | null
          recording_url?: string | null
          registration_required?: boolean | null
          required_subscription?: Database["public"]["Enums"]["subscription_tier"]
          scheduled_start?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          tags?: string[] | null
          target_audience?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
          updated_at?: string | null
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_events_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          calories: number
          created_at: string
          id: number
          ingredients: string[] | null
          macros: Json | null
          menopauseInsights: string | null
          recipeName: string
          user_id: string | null
        }
        Insert: {
          calories: number
          created_at?: string
          id?: never
          ingredients?: string[] | null
          macros?: Json | null
          menopauseInsights?: string | null
          recipeName: string
          user_id?: string | null
        }
        Update: {
          calories?: number
          created_at?: string
          id?: never
          ingredients?: string[] | null
          macros?: Json | null
          menopauseInsights?: string | null
          recipeName?: string
          user_id?: string | null
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
      medical_data_access_log: {
        Row: {
          access_result: string
          access_type: string
          accessed_at: string | null
          data_type: string
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_result: string
          access_type: string
          accessed_at?: string | null
          data_type: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_result?: string
          access_type?: string
          accessed_at?: string | null
          data_type?: string
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_data_mappings: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_type: string
          id: string
          is_active: boolean | null
          mapping_rules: Json | null
          partner_id: string
          source_field: string
          source_system: string
          target_field: string
          transformation_logic: string | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_type: string
          id?: string
          is_active?: boolean | null
          mapping_rules?: Json | null
          partner_id: string
          source_field: string
          source_system: string
          target_field: string
          transformation_logic?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_type?: string
          id?: string
          is_active?: boolean | null
          mapping_rules?: Json | null
          partner_id?: string
          source_field?: string
          source_system?: string
          target_field?: string
          transformation_logic?: string | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_data_mappings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_devices: {
        Row: {
          connection_status: string | null
          created_at: string
          data_types: string[] | null
          device_identifier: string | null
          device_name: string
          device_settings: Json | null
          device_type: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          manufacturer: string | null
          model_number: string | null
          registered_at: string
          serial_number: string | null
          sync_frequency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_status?: string | null
          created_at?: string
          data_types?: string[] | null
          device_identifier?: string | null
          device_name: string
          device_settings?: Json | null
          device_type: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          manufacturer?: string | null
          model_number?: string | null
          registered_at?: string
          serial_number?: string | null
          sync_frequency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_status?: string | null
          created_at?: string
          data_types?: string[] | null
          device_identifier?: string | null
          device_name?: string
          device_settings?: Json | null
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          manufacturer?: string | null
          model_number?: string | null
          registered_at?: string
          serial_number?: string | null
          sync_frequency?: string | null
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
          certification_details: Json | null
          compliance_standards: string[] | null
          coordinates: unknown | null
          created_at: string
          data_retention_days: number | null
          data_standards_supported: string[] | null
          email: string | null
          fhir_endpoint: string | null
          hl7_endpoint: string | null
          id: string
          integration_capabilities: Json | null
          integration_status: string | null
          last_sync: string | null
          last_sync_at: string | null
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
          sync_frequency: string | null
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
          certification_details?: Json | null
          compliance_standards?: string[] | null
          coordinates?: unknown | null
          created_at?: string
          data_retention_days?: number | null
          data_standards_supported?: string[] | null
          email?: string | null
          fhir_endpoint?: string | null
          hl7_endpoint?: string | null
          id?: string
          integration_capabilities?: Json | null
          integration_status?: string | null
          last_sync?: string | null
          last_sync_at?: string | null
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
          sync_frequency?: string | null
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
          certification_details?: Json | null
          compliance_standards?: string[] | null
          coordinates?: unknown | null
          created_at?: string
          data_retention_days?: number | null
          data_standards_supported?: string[] | null
          email?: string | null
          fhir_endpoint?: string | null
          hl7_endpoint?: string | null
          id?: string
          integration_capabilities?: Json | null
          integration_status?: string | null
          last_sync?: string | null
          last_sync_at?: string | null
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
          sync_frequency?: string | null
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
      menopause_analysis: {
        Row: {
          created_at: string | null
          id: string
          menopause_phase: string
          phase_confidence: number | null
          recommendations: Json | null
          risk_factors: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menopause_phase: string
          phase_confidence?: number | null
          recommendations?: Json | null
          risk_factors?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menopause_phase?: string
          phase_confidence?: number | null
          recommendations?: Json | null
          risk_factors?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      menstrual_entries: {
        Row: {
          created_at: string | null
          cycle_day: number | null
          entry_date: string
          flow_level: number | null
          id: string
          is_period_start: boolean | null
          notes: string | null
          symptoms: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cycle_day?: number | null
          entry_date: string
          flow_level?: number | null
          id?: string
          is_period_start?: boolean | null
          notes?: string | null
          symptoms?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cycle_day?: number | null
          entry_date?: string
          flow_level?: number | null
          id?: string
          is_period_start?: boolean | null
          notes?: string | null
          symptoms?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      migration_audit_log: {
        Row: {
          created_at: string
          email: string
          error_details: string | null
          id: string
          ip_address: string | null
          legacy_user_id: string | null
          metadata: Json | null
          migration_status: string
          migration_timestamp: string
          migration_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          error_details?: string | null
          id?: string
          ip_address?: string | null
          legacy_user_id?: string | null
          metadata?: Json | null
          migration_status: string
          migration_timestamp?: string
          migration_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          error_details?: string | null
          id?: string
          ip_address?: string | null
          legacy_user_id?: string | null
          metadata?: Json | null
          migration_status?: string
          migration_timestamp?: string
          migration_type?: string
          user_agent?: string | null
          user_id?: string | null
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
      nutrition_entries: {
        Row: {
          calories: number | null
          created_at: string | null
          entry_date: string
          food_items: Json
          id: string
          macros: Json | null
          meal_type: string
          symptoms_after: Json | null
          user_id: string | null
        }
        Insert: {
          calories?: number | null
          created_at?: string | null
          entry_date: string
          food_items: Json
          id?: string
          macros?: Json | null
          meal_type: string
          symptoms_after?: Json | null
          user_id?: string | null
        }
        Update: {
          calories?: number | null
          created_at?: string | null
          entry_date?: string
          food_items?: Json
          id?: string
          macros?: Json | null
          meal_type?: string
          symptoms_after?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_data: {
        Row: {
          basic_info: Json | null
          completed_steps: string[] | null
          completion_percentage: number | null
          created_at: string
          goals: Json | null
          id: string
          lifestyle: Json | null
          medical_history: Json | null
          menstrual_history: Json | null
          phase_result: Json | null
          recommendations: Json | null
          symptoms: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          basic_info?: Json | null
          completed_steps?: string[] | null
          completion_percentage?: number | null
          created_at?: string
          goals?: Json | null
          id?: string
          lifestyle?: Json | null
          medical_history?: Json | null
          menstrual_history?: Json | null
          phase_result?: Json | null
          recommendations?: Json | null
          symptoms?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          basic_info?: Json | null
          completed_steps?: string[] | null
          completion_percentage?: number | null
          created_at?: string
          goals?: Json | null
          id?: string
          lifestyle?: Json | null
          medical_history?: Json | null
          menstrual_history?: Json | null
          phase_result?: Json | null
          recommendations?: Json | null
          symptoms?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      partner_api_configurations: {
        Row: {
          api_key_encrypted: string | null
          api_type: string
          authentication_method: string
          base_url: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_tested_at: string | null
          oauth_config: Json | null
          partner_id: string
          rate_limits: Json | null
          retry_config: Json | null
          supported_formats: string[] | null
          test_results: Json | null
          timeout_seconds: number | null
          updated_at: string | null
          webhook_endpoints: Json | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_type: string
          authentication_method: string
          base_url: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          oauth_config?: Json | null
          partner_id: string
          rate_limits?: Json | null
          retry_config?: Json | null
          supported_formats?: string[] | null
          test_results?: Json | null
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_endpoints?: Json | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_type?: string
          authentication_method?: string
          base_url?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_tested_at?: string | null
          oauth_config?: Json | null
          partner_id?: string
          rate_limits?: Json | null
          retry_config?: Json | null
          supported_formats?: string[] | null
          test_results?: Json | null
          timeout_seconds?: number | null
          updated_at?: string | null
          webhook_endpoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_api_configurations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "medical_partners"
            referencedColumns: ["id"]
          },
        ]
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
      physical_activity_detailed: {
        Row: {
          activity_date: string
          activity_subtype: string | null
          activity_type: string
          calories_burned: number | null
          created_at: string
          device_source: string | null
          distance_km: number | null
          duration_minutes: number
          elevation_gain: number | null
          end_time: string | null
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          intensity_level: string | null
          start_time: string | null
          steps_count: number | null
          updated_at: string
          user_id: string
          workout_notes: string | null
        }
        Insert: {
          activity_date: string
          activity_subtype?: string | null
          activity_type: string
          calories_burned?: number | null
          created_at?: string
          device_source?: string | null
          distance_km?: number | null
          duration_minutes: number
          elevation_gain?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          intensity_level?: string | null
          start_time?: string | null
          steps_count?: number | null
          updated_at?: string
          user_id: string
          workout_notes?: string | null
        }
        Update: {
          activity_date?: string
          activity_subtype?: string | null
          activity_type?: string
          calories_burned?: number | null
          created_at?: string
          device_source?: string | null
          distance_km?: number | null
          duration_minutes?: number
          elevation_gain?: number | null
          end_time?: string | null
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          intensity_level?: string | null
          start_time?: string | null
          steps_count?: number | null
          updated_at?: string
          user_id?: string
          workout_notes?: string | null
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
      program_participants: {
        Row: {
          assignments_completed: number | null
          assignments_total: number | null
          coach_sessions: number | null
          completion_percentage: number | null
          current_phase: number | null
          current_week: number | null
          enrolled_at: string | null
          group_calls_attended: number | null
          id: string
          peer_interactions: number | null
          program_id: string | null
          status: Database["public"]["Enums"]["participation_status"] | null
          user_id: string
        }
        Insert: {
          assignments_completed?: number | null
          assignments_total?: number | null
          coach_sessions?: number | null
          completion_percentage?: number | null
          current_phase?: number | null
          current_week?: number | null
          enrolled_at?: string | null
          group_calls_attended?: number | null
          id?: string
          peer_interactions?: number | null
          program_id?: string | null
          status?: Database["public"]["Enums"]["participation_status"] | null
          user_id: string
        }
        Update: {
          assignments_completed?: number | null
          assignments_total?: number | null
          coach_sessions?: number | null
          completion_percentage?: number | null
          current_phase?: number | null
          current_week?: number | null
          enrolled_at?: string | null
          group_calls_attended?: number | null
          id?: string
          peer_interactions?: number | null
          program_id?: string | null
          status?: Database["public"]["Enums"]["participation_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_participants_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "reset_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_phases: {
        Row: {
          created_at: string | null
          description: string | null
          duration_weeks: number
          goals: string[] | null
          id: string
          phase_number: number
          program_id: string | null
          success_criteria: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_weeks: number
          goals?: string[] | null
          id?: string
          phase_number: number
          program_id?: string | null
          success_criteria?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_weeks?: number
          goals?: string[] | null
          id?: string
          phase_number?: number
          program_id?: string | null
          success_criteria?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_phases_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "reset_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          id: number
          subscription: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          subscription: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          subscription?: Json
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: string[] | null
          question: string
          quiz_id: string
          type: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: string[] | null
          question: string
          quiz_id: string
          type: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: string[] | null
          question?: string
          quiz_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          max_attempts: number | null
          passing_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          max_attempts?: number | null
          passing_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          max_attempts?: number | null
          passing_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
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
      reset_programs: {
        Row: {
          created_at: string | null
          current_participants: number | null
          description: string | null
          duration_weeks: number
          enrollment_end: string | null
          enrollment_start: string | null
          id: string
          includes: string[] | null
          max_participants: number | null
          price: number | null
          program_start: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_weeks: number
          enrollment_end?: string | null
          enrollment_start?: string | null
          id?: string
          includes?: string[] | null
          max_participants?: number | null
          price?: number | null
          program_start?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          duration_weeks?: number
          enrollment_end?: string | null
          enrollment_start?: string | null
          id?: string
          includes?: string[] | null
          max_participants?: number | null
          price?: number | null
          program_start?: string | null
          title?: string
          updated_at?: string | null
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
      security_audit_log: {
        Row: {
          action: string
          audit_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          policy_name: string | null
          severity: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          audit_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          policy_name?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          audit_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          policy_name?: string | null
          severity?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      subscription_interest: {
        Row: {
          created_at: string
          email: string | null
          id: string
          interested_at: string
          ip_address: unknown | null
          referrer: string | null
          subscription_plan_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          interested_at?: string
          ip_address?: unknown | null
          referrer?: string | null
          subscription_plan_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          interested_at?: string
          ip_address?: unknown | null
          referrer?: string | null
          subscription_plan_id?: string
          user_agent?: string | null
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
      symptom_entries: {
        Row: {
          created_at: string | null
          energy_level: number | null
          entry_date: string
          entry_time: string | null
          hot_flashes: Json | null
          id: string
          mood_data: Json | null
          night_sweats: Json | null
          notes: string | null
          physical_symptoms: string[] | null
          sleep_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          entry_date: string
          entry_time?: string | null
          hot_flashes?: Json | null
          id?: string
          mood_data?: Json | null
          night_sweats?: Json | null
          notes?: string | null
          physical_symptoms?: string[] | null
          sleep_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          entry_date?: string
          entry_time?: string | null
          hot_flashes?: Json | null
          id?: string
          mood_data?: Json | null
          night_sweats?: Json | null
          notes?: string | null
          physical_symptoms?: string[] | null
          sleep_data?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          created_at: string
          energyLevel: number
          hotFlashes: number
          id: number
          mood: number
          sleepQuality: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          energyLevel: number
          hotFlashes: number
          id?: never
          mood: number
          sleepQuality: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          energyLevel?: number
          hotFlashes?: number
          id?: never
          mood?: number
          sleepQuality?: number
          user_id?: string | null
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
      symptom_predictions: {
        Row: {
          actual_symptoms: Json | null
          based_on_factors: Json | null
          confidence_level: number | null
          created_at: string | null
          id: string
          predicted_symptoms: Json
          prediction_accuracy: number | null
          prediction_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_symptoms?: Json | null
          based_on_factors?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          predicted_symptoms: Json
          prediction_accuracy?: number | null
          prediction_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_symptoms?: Json | null
          based_on_factors?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          predicted_symptoms?: Json
          prediction_accuracy?: number | null
          prediction_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_data: Json | null
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          title: string
          updated_at: string | null
        }
        Insert: {
          alert_data?: Json | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          alert_data?: Json | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_health_checks: {
        Row: {
          check_type: string
          checked_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_type: string
          checked_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_type?: string
          checked_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          id: string
          metric_category: string | null
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_category?: string | null
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_category?: string | null
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string | null
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
      user_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_course_progress: {
        Row: {
          certificates_earned: string[] | null
          completed_at: string | null
          completion_percentage: number | null
          course_id: string | null
          current_lesson: number | null
          id: string
          last_accessed: string | null
          quiz_scores: Json | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          certificates_earned?: string[] | null
          completed_at?: string | null
          completion_percentage?: number | null
          course_id?: string | null
          current_lesson?: number | null
          id?: string
          last_accessed?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          certificates_earned?: string[] | null
          completed_at?: string | null
          completion_percentage?: number | null
          course_id?: string | null
          current_lesson?: number | null
          id?: string
          last_accessed?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
      user_health_preferences: {
        Row: {
          created_at: string | null
          data_retention_days: number | null
          data_sharing_settings: Json | null
          id: string
          notification_settings: Json | null
          preferred_units: Json | null
          sync_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_retention_days?: number | null
          data_sharing_settings?: Json | null
          id?: string
          notification_settings?: Json | null
          preferred_units?: Json | null
          sync_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_retention_days?: number | null
          data_sharing_settings?: Json | null
          id?: string
          notification_settings?: Json | null
          preferred_units?: Json | null
          sync_preferences?: Json | null
          updated_at?: string | null
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
      user_locations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          created_at: string | null
          daily_insights_enabled: boolean | null
          email_notifications_enabled: boolean | null
          id: string
          notification_time: string | null
          push_notifications_enabled: boolean | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          weekend_notifications: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_insights_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          id?: string
          notification_time?: string | null
          push_notifications_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          weekend_notifications?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_insights_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          id?: string
          notification_time?: string | null
          push_notifications_enabled?: boolean | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          weekend_notifications?: boolean | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_name: string | null
          last_onboarding_step: string | null
          menopause_phase: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_completion_percentage: number | null
          onboarding_phase_result: Json | null
          phone: string | null
          phone_verified: boolean | null
          registration_completed: boolean | null
          role: string | null
          updated_at: string | null
          user_role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          id: string
          last_name?: string | null
          last_onboarding_step?: string | null
          menopause_phase?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_completion_percentage?: number | null
          onboarding_phase_result?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          registration_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          last_onboarding_step?: string | null
          menopause_phase?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_completion_percentage?: number | null
          onboarding_phase_result?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          registration_completed?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          certificates_earned: string[] | null
          completed_at: string | null
          completion_percentage: number | null
          course_id: string
          created_at: string
          current_lesson: number | null
          id: string
          last_accessed: string | null
          quiz_scores: Json | null
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          certificates_earned?: string[] | null
          completed_at?: string | null
          completion_percentage?: number | null
          course_id: string
          created_at?: string
          current_lesson?: number | null
          id?: string
          last_accessed?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          certificates_earned?: string[] | null
          completed_at?: string | null
          completion_percentage?: number | null
          course_id?: string
          created_at?: string
          current_lesson?: number | null
          id?: string
          last_accessed?: string | null
          quiz_scores?: Json | null
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
      wearable_data: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          device_type: string
          heart_rate_data: Json | null
          id: string
          recorded_date: string
          sleep_data: Json | null
          steps: number | null
          stress_level: number | null
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          device_type: string
          heart_rate_data?: Json | null
          id?: string
          recorded_date: string
          sleep_data?: Json | null
          steps?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          device_type?: string
          heart_rate_data?: Json | null
          id?: string
          recorded_date?: string
          sleep_data?: Json | null
          steps?: number | null
          stress_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          air_quality: Json | null
          created_at: string | null
          id: string
          location_data: Json
          menopause_impact_score: number | null
          recorded_date: string
          user_id: string | null
          weather_metrics: Json
        }
        Insert: {
          air_quality?: Json | null
          created_at?: string | null
          id?: string
          location_data: Json
          menopause_impact_score?: number | null
          recorded_date: string
          user_id?: string | null
          weather_metrics: Json
        }
        Update: {
          air_quality?: Json | null
          created_at?: string | null
          id?: string
          location_data?: Json
          menopause_impact_score?: number | null
          recorded_date?: string
          user_id?: string | null
          weather_metrics?: Json
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
      audit_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          policy_name: string
          policy_command: string
          policy_permissive: string
          policy_using: string
          policy_check: string
        }[]
      }
      check_user_exists: {
        Args: { user_email: string }
        Returns: {
          user_exists: boolean
          user_id: string
          email_confirmed: boolean
          last_sign_in: string
        }[]
      }
      cleanup_expired_medical_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_health_sync_log_secure: {
        Args: { p_integration_id: string; p_data_types_synced?: string[] }
        Returns: string
      }
      create_system_alert: {
        Args: {
          p_alert_type: string
          p_severity: string
          p_title: string
          p_description?: string
          p_alert_data?: Json
        }
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_users_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          created_at: string
          email_confirmed_at: string
          last_sign_in_at: string
        }[]
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
      increment_post_views: {
        Args: { post_id: string }
        Returns: undefined
      }
      insert_external_health_data_secure: {
        Args: {
          p_user_id: string
          p_integration_id: string
          p_data_type: string
          p_data_payload: Json
          p_external_id?: string
          p_recorded_date?: string
          p_recorded_timestamp?: string
          p_data_source?: string
          p_data_quality_score?: number
        }
        Returns: string
      }
      log_auth_error: {
        Args: {
          p_user_id: string
          p_error_type: string
          p_error_message: string
          p_error_details?: Json
          p_user_agent?: string
          p_ip_address?: string
          p_url?: string
        }
        Returns: string
      }
      log_health_data_access: {
        Args: {
          p_accessed_user_data: string
          p_access_type: string
          p_table_accessed: string
          p_record_count?: number
        }
        Returns: undefined
      }
      log_medical_data_access: {
        Args: {
          p_user_id: string
          p_access_type: string
          p_data_type: string
          p_access_result?: string
          p_failure_reason?: string
          p_metadata?: Json
        }
        Returns: string
      }
      perform_health_check: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      save_encrypted_medical_data: {
        Args: {
          p_user_id: string
          p_data_type: string
          p_encrypted_content: string
          p_encryption_metadata: Json
          p_data_hash: string
          p_expires_at?: string
          p_access_level?: string
        }
        Returns: string
      }
      sync_onboarding_completion_status: {
        Args: {
          p_user_id: string
          p_completion_percentage: number
          p_phase_result?: Json
          p_completed_steps?: string[]
        }
        Returns: undefined
      }
      update_health_sync_log_secure: {
        Args: {
          p_log_id: string
          p_sync_status: string
          p_records_synced?: number
          p_records_failed?: number
          p_sync_duration_ms?: number
          p_error_details?: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "clinic" | "laboratory" | "admin"
      course_category:
        | "menopause_basics"
        | "hormones"
        | "nutrition"
        | "mental_health"
        | "sexuality"
        | "lifestyle"
      course_difficulty: "beginner" | "intermediate" | "advanced"
      event_status: "upcoming" | "live" | "completed" | "cancelled"
      event_type:
        | "webinar"
        | "workshop"
        | "ama"
        | "support_group"
        | "masterclass"
      participation_status: "active" | "paused" | "completed" | "dropped"
      subscription_tier: "essential" | "plus" | "optimum"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["patient", "doctor", "clinic", "laboratory", "admin"],
      course_category: [
        "menopause_basics",
        "hormones",
        "nutrition",
        "mental_health",
        "sexuality",
        "lifestyle",
      ],
      course_difficulty: ["beginner", "intermediate", "advanced"],
      event_status: ["upcoming", "live", "completed", "cancelled"],
      event_type: [
        "webinar",
        "workshop",
        "ama",
        "support_group",
        "masterclass",
      ],
      participation_status: ["active", "paused", "completed", "dropped"],
      subscription_tier: ["essential", "plus", "optimum"],
    },
  },
} as const
