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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_admin: boolean
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string
          created_by: string
          id: string
          listing_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          created_by: string
          id?: string
          listing_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          created_by?: string
          id?: string
          listing_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string | null
          quest_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id?: string | null
          quest_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string | null
          quest_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      level_tiers: {
        Row: {
          created_at: string
          daily_listing_limit: number
          free_code_monthly: boolean
          has_themes: boolean
          id: string
          max_level: number
          min_level: number
          point_multiplier: number
          streak_bonus_eligible: boolean
          tier_color: string
          tier_name: string
        }
        Insert: {
          created_at?: string
          daily_listing_limit?: number
          free_code_monthly?: boolean
          has_themes?: boolean
          id?: string
          max_level: number
          min_level: number
          point_multiplier?: number
          streak_bonus_eligible?: boolean
          tier_color?: string
          tier_name: string
        }
        Update: {
          created_at?: string
          daily_listing_limit?: number
          free_code_monthly?: boolean
          has_themes?: boolean
          id?: string
          max_level?: number
          min_level?: number
          point_multiplier?: number
          streak_bonus_eligible?: boolean
          tier_color?: string
          tier_name?: string
        }
        Relationships: []
      }
      listing_applications: {
        Row: {
          applicant_user_id: string
          created_at: string
          id: string
          listing_id: string
          message: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          applicant_user_id: string
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          applicant_user_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "listing_applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          admin_note: string | null
          created_at: string
          creator_user_id: string
          description: string
          id: string
          impressions: number
          lat: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng: number | null
          location_address: string
          location_name: string
          photo_urls: string[] | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["listing_status"]
          title: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          creator_user_id: string
          description: string
          id?: string
          impressions?: number
          lat?: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          location_address: string
          location_name: string
          photo_urls?: string[] | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          creator_user_id?: string
          description?: string
          id?: string
          impressions?: number
          lat?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          lng?: number | null
          location_address?: string
          location_name?: string
          photo_urls?: string[] | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          is_deleted: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_deleted?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      point_purchases: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          package_name: string
          points_amount: number
          price_cents: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          package_name: string
          points_amount: number
          price_cents: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          package_name?: string
          points_amount?: number
          price_cents?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          related_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          related_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          related_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          level: number
          onboarding_completed: boolean | null
          referral_code: string | null
          swap_points: number
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          username: string | null
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          onboarding_completed?: boolean | null
          referral_code?: string | null
          swap_points?: number
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          level?: number
          onboarding_completed?: boolean | null
          referral_code?: string | null
          swap_points?: number
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      quests: {
        Row: {
          base_points: number
          created_at: string
          description: string
          id: string
          impressions: number
          is_active: boolean
          lat: number | null
          lng: number | null
          location_address: string
          location_name: string
          quest_type: Database["public"]["Enums"]["quest_type"]
          title: string
        }
        Insert: {
          base_points?: number
          created_at?: string
          description: string
          id?: string
          impressions?: number
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          location_address: string
          location_name: string
          quest_type: Database["public"]["Enums"]["quest_type"]
          title: string
        }
        Update: {
          base_points?: number
          created_at?: string
          description?: string
          id?: string
          impressions?: number
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          location_address?: string
          location_name?: string
          quest_type?: Database["public"]["Enums"]["quest_type"]
          title?: string
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          code: string
          created_at: string
          id: string
          points_spent: number
          redeemed_at: string | null
          reward_id: string
          status: Database["public"]["Enums"]["redemption_status"]
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          points_spent: number
          redeemed_at?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["redemption_status"]
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          points_spent?: number
          redeemed_at?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["redemption_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: boolean
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: boolean
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: boolean
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
        }
        Relationships: []
      }
      rewards: {
        Row: {
          category: Database["public"]["Enums"]["reward_category"]
          cost_points: number
          created_at: string
          description: string
          id: string
          is_active: boolean
          partner_name: string
          title: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["reward_category"]
          cost_points: number
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          partner_name: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["reward_category"]
          cost_points?: number
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          partner_name?: string
          title?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          admin_note: string | null
          after_image_url: string
          before_image_url: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          location_address: string | null
          location_name: string | null
          points_awarded: number | null
          quest_id: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["submission_status"]
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          after_image_url: string
          before_image_url: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          location_name?: string | null
          points_awarded?: number | null
          quest_id: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          user_id: string
        }
        Update: {
          admin_note?: string | null
          after_image_url?: string
          before_image_url?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          location_name?: string | null
          points_awarded?: number | null
          quest_id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_listing_points: {
        Args: {
          p_admin_note?: string
          p_listing_id: string
          p_points_amount: number
          p_user_id: string
          p_xp_amount: number
        }
        Returns: undefined
      }
      award_submission_points: {
        Args: { multiplier?: number; submission_id: string }
        Returns: undefined
      }
      award_submission_points_v2: {
        Args: {
          p_admin_note?: string
          p_points_amount: number
          p_submission_id: string
          p_xp_amount: number
        }
        Returns: undefined
      }
      award_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: undefined
      }
      generate_redemption_code: { Args: never; Returns: string }
      generate_unique_username: { Args: { base_name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_listing_impressions: {
        Args: { listing_id: string }
        Returns: undefined
      }
      increment_quest_impressions: {
        Args: { quest_id: string }
        Returns: undefined
      }
      process_referral: {
        Args: { p_new_user_id: string; p_referral_code: string }
        Returns: undefined
      }
      redeem_reward: {
        Args: { p_reward_id: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      application_status: "pending" | "accepted" | "rejected"
      badge_type:
        | "first_quest"
        | "cleanup_hero"
        | "good_samaritan"
        | "community_star"
        | "eco_warrior"
        | "helper_badge"
        | "referral_champion"
        | "level_5"
        | "level_10"
        | "level_25"
      listing_status: "pending" | "approved" | "rejected"
      listing_type: "help_request" | "micro_job" | "good_deed_request"
      quest_type: "cleanup" | "good_deed"
      redemption_status: "issued" | "redeemed" | "expired"
      reward_category: "food" | "shower" | "bed" | "discount" | "other"
      submission_status: "pending" | "approved" | "rejected"
      user_type: "helper" | "supporter"
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
      app_role: ["admin", "user"],
      application_status: ["pending", "accepted", "rejected"],
      badge_type: [
        "first_quest",
        "cleanup_hero",
        "good_samaritan",
        "community_star",
        "eco_warrior",
        "helper_badge",
        "referral_champion",
        "level_5",
        "level_10",
        "level_25",
      ],
      listing_status: ["pending", "approved", "rejected"],
      listing_type: ["help_request", "micro_job", "good_deed_request"],
      quest_type: ["cleanup", "good_deed"],
      redemption_status: ["issued", "redeemed", "expired"],
      reward_category: ["food", "shower", "bed", "discount", "other"],
      submission_status: ["pending", "approved", "rejected"],
      user_type: ["helper", "supporter"],
    },
  },
} as const
