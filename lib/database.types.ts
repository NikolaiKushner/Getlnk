// Database types generated from Supabase schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Theme options for public profiles
export type ProfileTheme =
  | "default"
  | "dark"
  | "gradient"
  | "minimal"
  | "ocean";

// Subscription plan types
export type SubscriptionPlan = "free" | "pro" | "business";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          role: "regular" | "superadmin";
          full_name: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          plan: SubscriptionPlan;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          subscription_status: SubscriptionStatus | null;
          subscription_period_end: string | null;
          trial_ends_at: string | null;
          paddle_portal_url: string | null;
          paddle_update_payment_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "regular" | "superadmin";
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          plan?: SubscriptionPlan;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          subscription_status?: SubscriptionStatus | null;
          subscription_period_end?: string | null;
          trial_ends_at?: string | null;
          paddle_portal_url?: string | null;
          paddle_update_payment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "regular" | "superadmin";
          full_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          plan?: SubscriptionPlan;
          paddle_customer_id?: string | null;
          paddle_subscription_id?: string | null;
          subscription_status?: SubscriptionStatus | null;
          subscription_period_end?: string | null;
          trial_ends_at?: string | null;
          paddle_portal_url?: string | null;
          paddle_update_payment_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      public_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          theme: ProfileTheme;
          is_published: boolean;
          page_views: number;
          social_links: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: ProfileTheme;
          is_published?: boolean;
          page_views?: number;
          social_links?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          theme?: ProfileTheme;
          is_published?: boolean;
          page_views?: number;
          social_links?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          icon: string | null;
          position: number;
          clicks: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          icon?: string | null;
          position?: number;
          clicks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          icon?: string | null;
          position?: number;
          clicks?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      page_analytics: {
        Row: {
          id: string;
          profile_id: string;
          link_id: string | null;
          event_type: string;
          referrer: string | null;
          user_agent: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          link_id?: string | null;
          event_type: string;
          referrer?: string | null;
          user_agent?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          link_id?: string | null;
          event_type?: string;
          referrer?: string | null;
          user_agent?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price_monthly: number;
          price_yearly: number;
          paddle_price_id_monthly: string | null;
          paddle_price_id_yearly: string | null;
          features: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          price_monthly?: number;
          price_yearly?: number;
          paddle_price_id_monthly?: string | null;
          paddle_price_id_yearly?: string | null;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          price_monthly?: number;
          price_yearly?: number;
          paddle_price_id_monthly?: string | null;
          paddle_price_id_yearly?: string | null;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscription_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          from_plan: SubscriptionPlan | null;
          to_plan: SubscriptionPlan | null;
          paddle_event_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          from_plan?: SubscriptionPlan | null;
          to_plan?: SubscriptionPlan | null;
          paddle_event_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          from_plan?: SubscriptionPlan | null;
          to_plan?: SubscriptionPlan | null;
          paddle_event_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_link_clicks: {
        Args: { link_id: string };
        Returns: void;
      };
      increment_page_views: {
        Args: { profile_id: string };
        Returns: void;
      };
      get_user_plan: {
        Args: { p_user_id: string };
        Returns: SubscriptionPlan;
      };
    };
    Enums: {
      user_role: "regular" | "superadmin";
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
    };
  };
}

// Helper types for easier usage
export type PublicProfile =
  Database["public"]["Tables"]["public_profiles"]["Row"];
export type PublicProfileInsert =
  Database["public"]["Tables"]["public_profiles"]["Insert"];
export type PublicProfileUpdate =
  Database["public"]["Tables"]["public_profiles"]["Update"];

export type Link = Database["public"]["Tables"]["links"]["Row"];
export type LinkInsert = Database["public"]["Tables"]["links"]["Insert"];
export type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
