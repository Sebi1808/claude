// ============================================
// SUPABASE DATABASE TYPES
// Auto-generated with: supabase gen types typescript --local
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          subscription_tier: string
          subscription_status: string
          subscription_ends_at: string | null
          stripe_customer_id: string | null
          default_llm_provider: string | null
          default_llm_model: string | null
          notification_settings: Json | null
          organization_id: string | null
          role: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string
          subscription_status?: string
          subscription_ends_at?: string | null
          stripe_customer_id?: string | null
          default_llm_provider?: string | null
          default_llm_model?: string | null
          notification_settings?: Json | null
          organization_id?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier?: string
          subscription_status?: string
          subscription_ends_at?: string | null
          stripe_customer_id?: string | null
          default_llm_provider?: string | null
          default_llm_model?: string | null
          notification_settings?: Json | null
          organization_id?: string | null
          role?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
          values: string[]
          communication_style: string | null
          target_audiences: string[]
          guidelines_summary: string | null
          brand_voice: Json | null
          subscription_tier: string
          subscription_status: string
          seat_count: number
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
          values?: string[]
          communication_style?: string | null
          target_audiences?: string[]
          guidelines_summary?: string | null
          brand_voice?: Json | null
          subscription_tier?: string
          subscription_status?: string
          seat_count?: number
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
          values?: string[]
          communication_style?: string | null
          target_audiences?: string[]
          guidelines_summary?: string | null
          brand_voice?: Json | null
          subscription_tier?: string
          subscription_status?: string
          seat_count?: number
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          provider: string
          encrypted_key: string
          key_last_four: string | null
          is_active: boolean
          created_at: string
          last_used_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          provider: string
          encrypted_key: string
          key_last_four?: string | null
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          provider?: string
          encrypted_key?: string
          key_last_four?: string | null
          is_active?: boolean
          created_at?: string
          last_used_at?: string | null
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          input_text: string
          input_image_url: string | null
          target_audience: string | null
          llm_provider: string
          llm_model: string
          overall_score: number | null
          checks_results: Json
          duration_seconds: number | null
          tokens_used: number | null
          cost_usd: number | null
          created_at: string
          user_notes: string | null
          is_favorite: boolean
          tags: string[]
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          input_text: string
          input_image_url?: string | null
          target_audience?: string | null
          llm_provider: string
          llm_model: string
          overall_score?: number | null
          checks_results?: Json
          duration_seconds?: number | null
          tokens_used?: number | null
          cost_usd?: number | null
          created_at?: string
          user_notes?: string | null
          is_favorite?: boolean
          tags?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          input_text?: string
          input_image_url?: string | null
          target_audience?: string | null
          llm_provider?: string
          llm_model?: string
          overall_score?: number | null
          checks_results?: Json
          duration_seconds?: number | null
          tokens_used?: number | null
          cost_usd?: number | null
          created_at?: string
          user_notes?: string | null
          is_favorite?: boolean
          tags?: string[]
        }
      }
      organization_documents: {
        Row: {
          id: string
          organization_id: string
          uploaded_by: string | null
          file_name: string
          file_type: string
          file_size_bytes: number
          storage_url: string
          processing_status: string
          extracted_text: string | null
          analysis_results: Json | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          uploaded_by?: string | null
          file_name: string
          file_type: string
          file_size_bytes: number
          storage_url: string
          processing_status?: string
          extracted_text?: string | null
          analysis_results?: Json | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          uploaded_by?: string | null
          file_name?: string
          file_type?: string
          file_size_bytes?: number
          storage_url?: string
          processing_status?: string
          extracted_text?: string | null
          analysis_results?: Json | null
          created_at?: string
          processed_at?: string | null
        }
      }
      usage_stats: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          period: string
          analyses_count: number
          tokens_used: number
          cost_total: number
          by_provider: Json | null
          by_model: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          period: string
          analyses_count?: number
          tokens_used?: number
          cost_total?: number
          by_provider?: Json | null
          by_model?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          period?: string
          analyses_count?: number
          tokens_used?: number
          cost_total?: number
          by_provider?: Json | null
          by_model?: Json | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_usage_stats: {
        Args: {
          p_user_id: string
          p_organization_id: string | null
          p_analyses_count: number
          p_tokens_used: number
          p_cost: number
          p_provider: string | null
          p_model: string | null
        }
        Returns: void
      }
      can_perform_action: {
        Args: {
          p_action: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
