export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string;
          role: "owner" | "admin" | "member";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          organization_id: string;
          email: string;
          full_name: string;
          role?: "owner" | "admin" | "member";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          organization_id?: string;
          email?: string;
          full_name?: string;
          role?: "owner" | "admin" | "member";
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          stripe_subscription_id: string | null;
          plan_tier: "starter" | "professional" | "business" | "enterprise";
          status: "active" | "trialing" | "past_due" | "canceled" | "inactive";
          competitor_limit: number;
          scrape_interval_hours: number;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stripe_subscription_id?: string | null;
          plan_tier?: "starter" | "professional" | "business" | "enterprise";
          status?: "active" | "trialing" | "past_due" | "canceled" | "inactive";
          competitor_limit?: number;
          scrape_interval_hours?: number;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_subscription_id?: string | null;
          plan_tier?: "starter" | "professional" | "business" | "enterprise";
          status?: "active" | "trialing" | "past_due" | "canceled" | "inactive";
          competitor_limit?: number;
          scrape_interval_hours?: number;
          current_period_start?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
      competitors: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          website_url: string;
          logo_url: string | null;
          status: "active" | "paused" | "error";
          scrape_frequency: string;
          last_scraped_at: string | null;
          product_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          website_url: string;
          logo_url?: string | null;
          status?: "active" | "paused" | "error";
          scrape_frequency?: string;
          last_scraped_at?: string | null;
          product_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          website_url?: string;
          logo_url?: string | null;
          status?: "active" | "paused" | "error";
          scrape_frequency?: string;
          last_scraped_at?: string | null;
          product_count?: number;
          updated_at?: string;
        };
      };
      competitor_pages: {
        Row: {
          id: string;
          competitor_id: string;
          url: string;
          page_type: "collection" | "product" | "category" | "search";
          label: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          url: string;
          page_type?: "collection" | "product" | "category" | "search";
          label?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          url?: string;
          page_type?: "collection" | "product" | "category" | "search";
          label?: string | null;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          competitor_id: string;
          name: string;
          url: string;
          image_url: string | null;
          current_price: number | null;
          original_price: number | null;
          currency: string;
          in_stock: boolean;
          is_on_sale: boolean;
          category: string | null;
          sku: string | null;
          last_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          name: string;
          url: string;
          image_url?: string | null;
          current_price?: number | null;
          original_price?: number | null;
          currency?: string;
          in_stock?: boolean;
          is_on_sale?: boolean;
          category?: string | null;
          sku?: string | null;
          last_checked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          url?: string;
          image_url?: string | null;
          current_price?: number | null;
          original_price?: number | null;
          currency?: string;
          in_stock?: boolean;
          is_on_sale?: boolean;
          category?: string | null;
          sku?: string | null;
          last_checked_at?: string | null;
          updated_at?: string;
        };
      };
      price_history: {
        Row: {
          id: string;
          product_id: string;
          price: number;
          original_price: number | null;
          currency: string;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          price: number;
          original_price?: number | null;
          currency?: string;
          recorded_at?: string;
        };
        Update: {
          price?: number;
          original_price?: number | null;
          currency?: string;
        };
      };
      product_changes: {
        Row: {
          id: string;
          product_id: string;
          change_type:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended";
          old_value: string | null;
          new_value: string | null;
          percentage_change: number | null;
          detected_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          change_type:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended";
          old_value?: string | null;
          new_value?: string | null;
          percentage_change?: number | null;
          detected_at?: string;
        };
        Update: {
          change_type?:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended";
          old_value?: string | null;
          new_value?: string | null;
          percentage_change?: number | null;
        };
      };
      scrape_jobs: {
        Row: {
          id: string;
          competitor_id: string;
          status: "pending" | "running" | "completed" | "failed";
          pages_scraped: number;
          products_found: number;
          changes_detected: number;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          status?: "pending" | "running" | "completed" | "failed";
          pages_scraped?: number;
          products_found?: number;
          changes_detected?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "pending" | "running" | "completed" | "failed";
          pages_scraped?: number;
          products_found?: number;
          changes_detected?: number;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
      };
      alert_configs: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          alert_type:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended"
            | "any_change";
          threshold: number | null;
          competitor_id: string | null;
          channels: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          alert_type:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended"
            | "any_change";
          threshold?: number | null;
          competitor_id?: string | null;
          channels?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          alert_type?:
            | "price_increase"
            | "price_decrease"
            | "new_product"
            | "out_of_stock"
            | "back_in_stock"
            | "sale_started"
            | "sale_ended"
            | "any_change";
          threshold?: number | null;
          competitor_id?: string | null;
          channels?: string[];
          is_active?: boolean;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          organization_id: string;
          alert_config_id: string | null;
          product_id: string | null;
          competitor_id: string | null;
          title: string;
          message: string;
          severity: "info" | "warning" | "critical";
          change_type: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          alert_config_id?: string | null;
          product_id?: string | null;
          competitor_id?: string | null;
          title: string;
          message: string;
          severity?: "info" | "warning" | "critical";
          change_type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          message?: string;
          severity?: "info" | "warning" | "critical";
          is_read?: boolean;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          organization_id: string;
          email_enabled: boolean;
          email_frequency: "instant" | "hourly" | "daily" | "weekly";
          slack_enabled: boolean;
          slack_webhook_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email_enabled?: boolean;
          email_frequency?: "instant" | "hourly" | "daily" | "weekly";
          slack_enabled?: boolean;
          slack_webhook_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email_enabled?: boolean;
          email_frequency?: "instant" | "hourly" | "daily" | "weekly";
          slack_enabled?: boolean;
          slack_webhook_url?: string | null;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          report_type: "weekly" | "monthly" | "custom";
          period_start: string;
          period_end: string;
          summary: Json | null;
          status: "generating" | "ready" | "failed";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          report_type?: "weekly" | "monthly" | "custom";
          period_start: string;
          period_end: string;
          summary?: Json | null;
          status?: "generating" | "ready" | "failed";
          created_at?: string;
        };
        Update: {
          title?: string;
          report_type?: "weekly" | "monthly" | "custom";
          summary?: Json | null;
          status?: "generating" | "ready" | "failed";
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
