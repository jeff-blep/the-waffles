export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blacklist: {
        Row: {
          blocked_user_id: string
          chef_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_user_id: string
          chef_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_user_id?: string
          chef_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blacklist_blocked_user_id_fkey"
            columns: ["blocked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blacklist_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          description: string
          evidence_urls: string[]
          host_decision: string | null
          host_id: string | null
          host_ruled_at: string | null
          id: string
          opened_at: string
          opened_by: string
          partial_refund_accepted: boolean | null
          partial_refund_amount: number | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string
          waffle_id: string
        }
        Insert: {
          description: string
          evidence_urls?: string[]
          host_decision?: string | null
          host_id?: string | null
          host_ruled_at?: string | null
          id?: string
          opened_at?: string
          opened_by: string
          partial_refund_accepted?: boolean | null
          partial_refund_amount?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          waffle_id: string
        }
        Update: {
          description?: string
          evidence_urls?: string[]
          host_decision?: string | null
          host_id?: string | null
          host_ruled_at?: string | null
          id?: string
          opened_at?: string
          opened_by?: string
          partial_refund_accepted?: boolean | null
          partial_refund_amount?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string
          waffle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      draws: {
        Row: {
          audit_log_url: string | null
          conducted_at: string
          draw_style: Database["public"]["Enums"]["draw_style"]
          draw_type: Database["public"]["Enums"]["draw_type"]
          id: string
          operator_id: string | null
          random_org_request_id: string | null
          random_org_response: Json | null
          random_org_signature: string | null
          stream_recorded_url: string | null
          stream_url: string | null
          waffle_id: string
          winner_id: string
          winning_seat_number: number
        }
        Insert: {
          audit_log_url?: string | null
          conducted_at?: string
          draw_style: Database["public"]["Enums"]["draw_style"]
          draw_type?: Database["public"]["Enums"]["draw_type"]
          id?: string
          operator_id?: string | null
          random_org_request_id?: string | null
          random_org_response?: Json | null
          random_org_signature?: string | null
          stream_recorded_url?: string | null
          stream_url?: string | null
          waffle_id: string
          winner_id: string
          winning_seat_number: number
        }
        Update: {
          audit_log_url?: string | null
          conducted_at?: string
          draw_style?: Database["public"]["Enums"]["draw_style"]
          draw_type?: Database["public"]["Enums"]["draw_type"]
          id?: string
          operator_id?: string | null
          random_org_request_id?: string | null
          random_org_response?: Json | null
          random_org_signature?: string | null
          stream_recorded_url?: string | null
          stream_url?: string | null
          waffle_id?: string
          winner_id?: string
          winning_seat_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "draws_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draws_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          from_role: Database["public"]["Enums"]["feedback_role"]
          from_user_id: string
          id: string
          is_negative: boolean
          is_neutral: boolean
          revealed_at: string | null
          score_communication: number
          score_description: number | null
          score_dispute_behavior: number | null
          score_overall: number
          score_shipping_speed: number | null
          score_verification_speed: number | null
          submitted_at: string
          text: string
          to_user_id: string
          waffle_id: string
          window_closes_at: string
        }
        Insert: {
          from_role: Database["public"]["Enums"]["feedback_role"]
          from_user_id: string
          id?: string
          is_negative?: boolean
          is_neutral?: boolean
          revealed_at?: string | null
          score_communication: number
          score_description?: number | null
          score_dispute_behavior?: number | null
          score_overall: number
          score_shipping_speed?: number | null
          score_verification_speed?: number | null
          submitted_at?: string
          text: string
          to_user_id: string
          waffle_id: string
          window_closes_at: string
        }
        Update: {
          from_role?: Database["public"]["Enums"]["feedback_role"]
          from_user_id?: string
          id?: string
          is_negative?: boolean
          is_neutral?: boolean
          revealed_at?: string | null
          score_communication?: number
          score_description?: number | null
          score_dispute_behavior?: number | null
          score_overall?: number
          score_shipping_speed?: number | null
          score_verification_speed?: number | null
          submitted_at?: string
          text?: string
          to_user_id?: string
          waffle_id?: string
          window_closes_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      flags: {
        Row: {
          actioned: boolean
          created_at: string
          details: string | null
          flagged_by: string
          id: string
          reason: string
          reviewed: boolean
          reviewed_at: string | null
          reviewed_by: string | null
          waffle_id: string
        }
        Insert: {
          actioned?: boolean
          created_at?: string
          details?: string | null
          flagged_by: string
          id?: string
          reason: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          waffle_id: string
        }
        Update: {
          actioned?: boolean
          created_at?: string
          details?: string | null
          flagged_by?: string
          id?: string
          reason?: string
          reviewed?: boolean
          reviewed_at?: string | null
          reviewed_by?: string | null
          waffle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flags_flagged_by_fkey"
            columns: ["flagged_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flags_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_waffle_pulls: {
        Row: {
          drawn_at: string | null
          id: string
          main_seat_numbers: number[]
          mini_waffle_id: string
          pull_number: number
          seats_awarded: number
          winner_id: string | null
        }
        Insert: {
          drawn_at?: string | null
          id?: string
          main_seat_numbers: number[]
          mini_waffle_id: string
          pull_number: number
          seats_awarded: number
          winner_id?: string | null
        }
        Update: {
          drawn_at?: string | null
          id?: string
          main_seat_numbers?: number[]
          mini_waffle_id?: string
          pull_number?: number
          seats_awarded?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mini_waffle_pulls_mini_waffle_id_fkey"
            columns: ["mini_waffle_id"]
            isOneToOne: false
            referencedRelation: "mini_waffles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mini_waffle_pulls_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mini_waffles: {
        Row: {
          created_at: string
          deadline: string
          id: string
          parent_waffle_id: string
          restricted_to_holders: boolean
          seat_price: number
          seats_sold: number
          status: Database["public"]["Enums"]["waffle_status"]
          total_seats: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline: string
          id?: string
          parent_waffle_id: string
          restricted_to_holders?: boolean
          seat_price: number
          seats_sold?: number
          status?: Database["public"]["Enums"]["waffle_status"]
          total_seats: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string
          id?: string
          parent_waffle_id?: string
          restricted_to_holders?: boolean
          seat_price?: number
          seats_sold?: number
          status?: Database["public"]["Enums"]["waffle_status"]
          total_seats?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mini_waffles_parent_waffle_id_fkey"
            columns: ["parent_waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          waffle_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          waffle_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
          waffle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          authorized_at: string | null
          captured_at: string | null
          created_at: string
          holder_id: string | null
          id: string
          refunded_at: string | null
          seat_number: number
          status: Database["public"]["Enums"]["seat_status"]
          stripe_payment_intent_id: string | null
          updated_at: string
          waffle_id: string
        }
        Insert: {
          authorized_at?: string | null
          captured_at?: string | null
          created_at?: string
          holder_id?: string | null
          id?: string
          refunded_at?: string | null
          seat_number: number
          status?: Database["public"]["Enums"]["seat_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
          waffle_id: string
        }
        Update: {
          authorized_at?: string | null
          captured_at?: string | null
          created_at?: string
          holder_id?: string | null
          id?: string
          refunded_at?: string | null
          seat_number?: number
          status?: Database["public"]["Enums"]["seat_status"]
          stripe_payment_intent_id?: string | null
          updated_at?: string
          waffle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_holder_id_fkey"
            columns: ["holder_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seats_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          ban_expires_at: string | null
          ban_reason: string | null
          bio: string | null
          chef_tier: Database["public"]["Enums"]["chef_tier"]
          completed_waffles_chef: number
          completed_waffles_diner: number
          created_at: string
          display_name: string | null
          email: string
          fingerprint_id: string | null
          id: string
          is_banned: boolean
          kyc_provider_id: string | null
          kyc_verified_at: string | null
          payout_enabled: boolean
          rep_score: number
          role: Database["public"]["Enums"]["user_role"]
          stack_tier: Database["public"]["Enums"]["stack_tier"]
          strike_count: number
          stripe_account_id: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          bio?: string | null
          chef_tier?: Database["public"]["Enums"]["chef_tier"]
          completed_waffles_chef?: number
          completed_waffles_diner?: number
          created_at?: string
          display_name?: string | null
          email: string
          fingerprint_id?: string | null
          id: string
          is_banned?: boolean
          kyc_provider_id?: string | null
          kyc_verified_at?: string | null
          payout_enabled?: boolean
          rep_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          stack_tier?: Database["public"]["Enums"]["stack_tier"]
          strike_count?: number
          stripe_account_id?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          ban_expires_at?: string | null
          ban_reason?: string | null
          bio?: string | null
          chef_tier?: Database["public"]["Enums"]["chef_tier"]
          completed_waffles_chef?: number
          completed_waffles_diner?: number
          created_at?: string
          display_name?: string | null
          email?: string
          fingerprint_id?: string | null
          id?: string
          is_banned?: boolean
          kyc_provider_id?: string | null
          kyc_verified_at?: string | null
          payout_enabled?: boolean
          rep_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          stack_tier?: Database["public"]["Enums"]["stack_tier"]
          strike_count?: number
          stripe_account_id?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      waffle_items: {
        Row: {
          ai_valuation: number | null
          ai_valuation_checked_at: string | null
          ai_valuation_flag: Database["public"]["Enums"]["valuation_flag"]
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string
          declared_value: number
          description: string | null
          id: string
          is_firearm: boolean
          is_new: boolean
          is_restricted: boolean
          photo_urls: string[]
          sort_order: number
          title: string
          waffle_id: string
        }
        Insert: {
          ai_valuation?: number | null
          ai_valuation_checked_at?: string | null
          ai_valuation_flag?: Database["public"]["Enums"]["valuation_flag"]
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          declared_value: number
          description?: string | null
          id?: string
          is_firearm?: boolean
          is_new?: boolean
          is_restricted?: boolean
          photo_urls?: string[]
          sort_order?: number
          title: string
          waffle_id: string
        }
        Update: {
          ai_valuation?: number | null
          ai_valuation_checked_at?: string | null
          ai_valuation_flag?: Database["public"]["Enums"]["valuation_flag"]
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          declared_value?: number
          description?: string | null
          id?: string
          is_firearm?: boolean
          is_new?: boolean
          is_restricted?: boolean
          photo_urls?: string[]
          sort_order?: number
          title?: string
          waffle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waffle_items_waffle_id_fkey"
            columns: ["waffle_id"]
            isOneToOne: false
            referencedRelation: "waffles"
            referencedColumns: ["id"]
          },
        ]
      }
      waffles: {
        Row: {
          allow_seat_choice: boolean
          approved_at: string | null
          approved_by: string | null
          category: string
          chef_id: string
          completed_at: string | null
          created_at: string
          deadline: string
          delivered_at: string | null
          description: string
          draw_audit_id: string | null
          draw_scheduled_at: string | null
          draw_style: Database["public"]["Enums"]["draw_style"]
          draw_type: Database["public"]["Enums"]["draw_type"]
          drawn_at: string | null
          filled_at: string | null
          flag_count: number
          goes_live_at: string | null
          id: string
          is_featured: boolean
          is_firearm: boolean
          is_restricted: boolean
          is_stack: boolean
          label_url: string | null
          mini_waffle_id: string | null
          platform_fee: number | null
          review_notes: string | null
          seat_price: number
          seats_sold: number
          shipped_at: string | null
          shipping_carrier:
            | Database["public"]["Enums"]["shipping_carrier"]
            | null
          shipping_method: string
          status: Database["public"]["Enums"]["waffle_status"]
          third_party_deadline: string | null
          third_party_verify: boolean
          title: string
          total_pot: number | null
          total_seats: number
          tracking_number: string | null
          updated_at: string
          verify_deadline: string | null
          voided_at: string | null
          winner_id: string | null
          winner_privacy: Database["public"]["Enums"]["winner_privacy"]
          winner_seat_number: number | null
        }
        Insert: {
          allow_seat_choice?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          chef_id: string
          completed_at?: string | null
          created_at?: string
          deadline: string
          delivered_at?: string | null
          description: string
          draw_audit_id?: string | null
          draw_scheduled_at?: string | null
          draw_style?: Database["public"]["Enums"]["draw_style"]
          draw_type?: Database["public"]["Enums"]["draw_type"]
          drawn_at?: string | null
          filled_at?: string | null
          flag_count?: number
          goes_live_at?: string | null
          id?: string
          is_featured?: boolean
          is_firearm?: boolean
          is_restricted?: boolean
          is_stack?: boolean
          label_url?: string | null
          mini_waffle_id?: string | null
          platform_fee?: number | null
          review_notes?: string | null
          seat_price: number
          seats_sold?: number
          shipped_at?: string | null
          shipping_carrier?:
            | Database["public"]["Enums"]["shipping_carrier"]
            | null
          shipping_method?: string
          status?: Database["public"]["Enums"]["waffle_status"]
          third_party_deadline?: string | null
          third_party_verify?: boolean
          title: string
          total_pot?: number | null
          total_seats: number
          tracking_number?: string | null
          updated_at?: string
          verify_deadline?: string | null
          voided_at?: string | null
          winner_id?: string | null
          winner_privacy?: Database["public"]["Enums"]["winner_privacy"]
          winner_seat_number?: number | null
        }
        Update: {
          allow_seat_choice?: boolean
          approved_at?: string | null
          approved_by?: string | null
          category?: string
          chef_id?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string
          delivered_at?: string | null
          description?: string
          draw_audit_id?: string | null
          draw_scheduled_at?: string | null
          draw_style?: Database["public"]["Enums"]["draw_style"]
          draw_type?: Database["public"]["Enums"]["draw_type"]
          drawn_at?: string | null
          filled_at?: string | null
          flag_count?: number
          goes_live_at?: string | null
          id?: string
          is_featured?: boolean
          is_firearm?: boolean
          is_restricted?: boolean
          is_stack?: boolean
          label_url?: string | null
          mini_waffle_id?: string | null
          platform_fee?: number | null
          review_notes?: string | null
          seat_price?: number
          seats_sold?: number
          shipped_at?: string | null
          shipping_carrier?:
            | Database["public"]["Enums"]["shipping_carrier"]
            | null
          shipping_method?: string
          status?: Database["public"]["Enums"]["waffle_status"]
          third_party_deadline?: string | null
          third_party_verify?: boolean
          title?: string
          total_pot?: number | null
          total_seats?: number
          tracking_number?: string | null
          updated_at?: string
          verify_deadline?: string | null
          voided_at?: string | null
          winner_id?: string | null
          winner_privacy?: Database["public"]["Enums"]["winner_privacy"]
          winner_seat_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "waffles_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waffles_chef_id_fkey"
            columns: ["chef_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waffles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_waffle: {
        Args: {
          p_allow_seat_choice: boolean
          p_category: string
          p_deadline: string
          p_description: string
          p_draw_style: Database["public"]["Enums"]["draw_style"]
          p_draw_type: Database["public"]["Enums"]["draw_type"]
          p_item: Json
          p_seat_price: number
          p_shipping_method: string
          p_title: string
          p_total_seats: number
        }
        Returns: Json
      }
    }
    Enums: {
      chef_tier: "new_chef" | "trusted_chef" | "established_chef" | "power_chef"
      dispute_status:
        | "open"
        | "awaiting_chef_response"
        | "awaiting_diner_response"
        | "partial_refund_offered"
        | "escalated_to_host"
        | "resolved_chef_favor"
        | "resolved_diner_favor"
        | "closed"
      draw_style: "spin" | "drop" | "slot" | "roll" | "cage" | "deal"
      draw_type: "automated" | "live"
      feedback_role: "chef" | "diner"
      item_condition: "A+" | "A" | "B" | "C" | "D" | "F"
      notification_type:
        | "waffle_filled"
        | "draw_scheduled"
        | "draw_result_win"
        | "draw_result_loss"
        | "item_shipped"
        | "item_delivered"
        | "verify_reminder"
        | "feedback_reminder"
        | "feedback_revealed"
        | "dispute_opened"
        | "dispute_update"
        | "mod_action"
        | "rep_change"
      seat_status: "available" | "authorized" | "captured" | "refunded"
      shipping_carrier: "ups" | "fedex" | "usps" | "local_pickup"
      stack_tier:
        | "short_stack"
        | "fresh_stack"
        | "rising_stack"
        | "buttery_stack"
        | "golden_stack"
      user_role: "user" | "mod" | "principal"
      user_tier: "guest" | "basic" | "id_verified"
      valuation_flag: "none" | "soft_warning" | "hard_block"
      waffle_status:
        | "draft"
        | "pending_review"
        | "active"
        | "filled"
        | "drawing"
        | "drawn"
        | "shipped"
        | "delivered"
        | "verified"
        | "completed"
        | "voided"
        | "disputed"
      winner_privacy: "full" | "partial" | "public"
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
      chef_tier: ["new_chef", "trusted_chef", "established_chef", "power_chef"],
      dispute_status: [
        "open",
        "awaiting_chef_response",
        "awaiting_diner_response",
        "partial_refund_offered",
        "escalated_to_host",
        "resolved_chef_favor",
        "resolved_diner_favor",
        "closed",
      ],
      draw_style: ["spin", "drop", "slot", "roll", "cage", "deal"],
      draw_type: ["automated", "live"],
      feedback_role: ["chef", "diner"],
      item_condition: ["A+", "A", "B", "C", "D", "F"],
      notification_type: [
        "waffle_filled",
        "draw_scheduled",
        "draw_result_win",
        "draw_result_loss",
        "item_shipped",
        "item_delivered",
        "verify_reminder",
        "feedback_reminder",
        "feedback_revealed",
        "dispute_opened",
        "dispute_update",
        "mod_action",
        "rep_change",
      ],
      seat_status: ["available", "authorized", "captured", "refunded"],
      shipping_carrier: ["ups", "fedex", "usps", "local_pickup"],
      stack_tier: [
        "short_stack",
        "fresh_stack",
        "rising_stack",
        "buttery_stack",
        "golden_stack",
      ],
      user_role: ["user", "mod", "principal"],
      user_tier: ["guest", "basic", "id_verified"],
      valuation_flag: ["none", "soft_warning", "hard_block"],
      waffle_status: [
        "draft",
        "pending_review",
        "active",
        "filled",
        "drawing",
        "drawn",
        "shipped",
        "delivered",
        "verified",
        "completed",
        "voided",
        "disputed",
      ],
      winner_privacy: ["full", "partial", "public"],
    },
  },
} as const
