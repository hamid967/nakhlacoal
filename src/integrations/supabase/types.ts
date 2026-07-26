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
      activity_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_table: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          summary: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          summary?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          summary?: string | null
        }
        Relationships: []
      }
      analytics_settings: {
        Row: {
          enabled: boolean
          ga4_measurement_id: string | null
          gtm_container_id: string | null
          id: boolean
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          ga4_measurement_id?: string | null
          gtm_container_id?: string | null
          id?: boolean
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          ga4_measurement_id?: string | null
          gtm_container_id?: string | null
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_preview: string | null
          summary: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_preview?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_preview?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_memory: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_sar: number
          notes: string | null
          starts_at: string | null
          updated_at: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          discount_type: string
          discount_value: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_sar?: number
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_sar?: number
          notes?: string | null
          starts_at?: string | null
          updated_at?: string
          uses_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          balance_sar: number
          city: string | null
          commercial_register: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          credit_limit_sar: number
          email: string | null
          id: string
          notes: string | null
          owner_user_id: string | null
          payment_terms_days: number
          phone: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          balance_sar?: number
          city?: string | null
          commercial_register?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          credit_limit_sar?: number
          email?: string | null
          id?: string
          notes?: string | null
          owner_user_id?: string | null
          payment_terms_days?: number
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          balance_sar?: number
          city?: string | null
          commercial_register?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          credit_limit_sar?: number
          email?: string | null
          id?: string
          notes?: string | null
          owner_user_id?: string | null
          payment_terms_days?: number
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      daily_reports: {
        Row: {
          created_at: string
          grand_total_sar: number
          id: string
          low_stock_items: Json
          new_customers: number
          orders_count: number
          report_date: string
          sales_subtotal_sar: number
          updated_at: string
          vat_collected_sar: number
        }
        Insert: {
          created_at?: string
          grand_total_sar?: number
          id?: string
          low_stock_items?: Json
          new_customers?: number
          orders_count?: number
          report_date: string
          sales_subtotal_sar?: number
          updated_at?: string
          vat_collected_sar?: number
        }
        Update: {
          created_at?: string
          grand_total_sar?: number
          id?: string
          low_stock_items?: Json
          new_customers?: number
          orders_count?: number
          report_date?: string
          sales_subtotal_sar?: number
          updated_at?: string
          vat_collected_sar?: number
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          provider_id: string | null
          recipient: string
          status: string
          subject: string | null
          template: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          recipient: string
          status?: string
          subject?: string | null
          template: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider_id?: string | null
          recipient?: string
          status?: string
          subject?: string | null
          template?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          auto_order_confirmation: boolean
          auto_shipment_notification: boolean
          id: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_order_confirmation?: boolean
          auto_shipment_notification?: boolean
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_order_confirmation?: boolean
          auto_shipment_notification?: boolean
          id?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          active: boolean
          created_at: string
          id: string
          in_stock_kg: number
          label: string
          lead_days: number
          match_pattern: string
          min_order_kg: number
          slug: string
          sort_order: number
          tiers: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          in_stock_kg?: number
          label: string
          lead_days?: number
          match_pattern: string
          min_order_kg?: number
          slug: string
          sort_order?: number
          tiers?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          in_stock_kg?: number
          label?: string
          lead_days?: number
          match_pattern?: string
          min_order_kg?: number
          slug?: string
          sort_order?: number
          tiers?: Json
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total_sar: number
          quantity: number
          unit: string
          unit_price_sar: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total_sar?: number
          quantity?: number
          unit?: string
          unit_price_sar?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total_sar?: number
          quantity?: number
          unit?: string
          unit_price_sar?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          buyer_address: string | null
          buyer_name: string
          buyer_vat_number: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          customer_user_id: string | null
          due_date: string | null
          grand_total_sar: number
          id: string
          invoice_no: string
          issue_date: string
          notes: string | null
          order_id: string | null
          qr_payload: string | null
          seller_address: string | null
          seller_cr: string | null
          seller_name: string
          seller_vat_number: string
          status: string
          subtotal_sar: number
          updated_at: string
          vat_amount_sar: number
          vat_rate: number
        }
        Insert: {
          buyer_address?: string | null
          buyer_name: string
          buyer_vat_number?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          customer_user_id?: string | null
          due_date?: string | null
          grand_total_sar?: number
          id?: string
          invoice_no?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          qr_payload?: string | null
          seller_address?: string | null
          seller_cr?: string | null
          seller_name?: string
          seller_vat_number?: string
          status?: string
          subtotal_sar?: number
          updated_at?: string
          vat_amount_sar?: number
          vat_rate?: number
        }
        Update: {
          buyer_address?: string | null
          buyer_name?: string
          buyer_vat_number?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          customer_user_id?: string | null
          due_date?: string | null
          grand_total_sar?: number
          id?: string
          invoice_no?: string
          issue_date?: string
          notes?: string | null
          order_id?: string | null
          qr_payload?: string | null
          seller_address?: string | null
          seller_cr?: string | null
          seller_name?: string
          seller_vat_number?: string
          status?: string
          subtotal_sar?: number
          updated_at?: string
          vat_amount_sar?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_reports: {
        Row: {
          ash_pct: number
          batch_code: string
          burn_time_min: number
          carbon_pct: number
          created_at: string
          id: string
          max_temp_c: number
          moisture_pct: number
          notes: string | null
          updated_at: string
          volatile_pct: number
        }
        Insert: {
          ash_pct?: number
          batch_code: string
          burn_time_min?: number
          carbon_pct?: number
          created_at?: string
          id?: string
          max_temp_c?: number
          moisture_pct?: number
          notes?: string | null
          updated_at?: string
          volatile_pct?: number
        }
        Update: {
          ash_pct?: number
          batch_code?: string
          burn_time_min?: number
          carbon_pct?: number
          created_at?: string
          id?: string
          max_temp_c?: number
          moisture_pct?: number
          notes?: string | null
          updated_at?: string
          volatile_pct?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error: string | null
          id: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error?: string | null
          id?: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error?: string | null
          id?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          ai_summary: string | null
          business_type: string | null
          city: string | null
          commercial_register: string | null
          company_name: string
          contact_name: string
          country: string | null
          created_at: string
          delivery_date: string | null
          email: string | null
          grand_total_sar: number | null
          id: string
          items: Json | null
          notes: string | null
          payment_method: string | null
          phone: string
          postal_code: string | null
          product_type: string
          quantity: number
          shipping_method: string | null
          status: string
          subtotal_sar: number | null
          total_sar: number | null
          unit: string
          unit_price_sar: number | null
          updated_at: string
          user_id: string | null
          vat_amount_sar: number | null
          vat_rate: number | null
        }
        Insert: {
          address?: string | null
          ai_summary?: string | null
          business_type?: string | null
          city?: string | null
          commercial_register?: string | null
          company_name: string
          contact_name: string
          country?: string | null
          created_at?: string
          delivery_date?: string | null
          email?: string | null
          grand_total_sar?: number | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          phone: string
          postal_code?: string | null
          product_type: string
          quantity: number
          shipping_method?: string | null
          status?: string
          subtotal_sar?: number | null
          total_sar?: number | null
          unit?: string
          unit_price_sar?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount_sar?: number | null
          vat_rate?: number | null
        }
        Update: {
          address?: string | null
          ai_summary?: string | null
          business_type?: string | null
          city?: string | null
          commercial_register?: string | null
          company_name?: string
          contact_name?: string
          country?: string | null
          created_at?: string
          delivery_date?: string | null
          email?: string | null
          grand_total_sar?: number | null
          id?: string
          items?: Json | null
          notes?: string | null
          payment_method?: string | null
          phone?: string
          postal_code?: string | null
          product_type?: string
          quantity?: number
          shipping_method?: string | null
          status?: string
          subtotal_sar?: number | null
          total_sar?: number | null
          unit?: string
          unit_price_sar?: number | null
          updated_at?: string
          user_id?: string | null
          vat_amount_sar?: number | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      pending_orders: {
        Row: {
          created_at: string
          data: Json
          form: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          form?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          form?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          preferred_language: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          admin_notes: string | null
          company_name: string
          created_at: string
          customer_id: string | null
          destination: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          order_id: string | null
          phone: string
          product: string
          quantity: number
          quoted_price_sar: number | null
          reminder_sent_at: string | null
          status: string
          unit: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_name: string
          created_at?: string
          customer_id?: string | null
          destination?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          order_id?: string | null
          phone: string
          product: string
          quantity: number
          quoted_price_sar?: number | null
          reminder_sent_at?: string | null
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          created_at?: string
          customer_id?: string | null
          destination?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          phone?: string
          product?: string
          quantity?: number
          quoted_price_sar?: number | null
          reminder_sent_at?: string | null
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket_key: string
          hits: number
          updated_at: string
          window_start: string
        }
        Insert: {
          bucket_key: string
          hits?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          bucket_key?: string
          hits?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string
          created_at: string
          customer_user_id: string | null
          delivered_at: string | null
          destination_address: string | null
          destination_city: string | null
          id: string
          notes: string | null
          order_id: string | null
          origin_city: string | null
          recipient_name: string | null
          recipient_phone: string | null
          shipped_at: string | null
          shipping_cost_sar: number | null
          status: string
          tracking_no: string | null
          tracking_url: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          carrier?: string
          created_at?: string
          customer_user_id?: string | null
          delivered_at?: string | null
          destination_address?: string | null
          destination_city?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          origin_city?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipped_at?: string | null
          shipping_cost_sar?: number | null
          status?: string
          tracking_no?: string | null
          tracking_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          carrier?: string
          created_at?: string
          customer_user_id?: string | null
          delivered_at?: string | null
          destination_address?: string | null
          destination_city?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          origin_city?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          shipped_at?: string | null
          shipping_cost_sar?: number | null
          status?: string
          tracking_no?: string | null
          tracking_url?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          entity_id: string
          entity_type: string
          from_status: string | null
          id: string
          note: string | null
          to_status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          from_status?: string | null
          id?: string
          note?: string | null
          to_status?: string
        }
        Relationships: []
      }
      trademarks: {
        Row: {
          address_ar: string | null
          colors: string[]
          country_ar: string | null
          created_at: string
          description_ar: string | null
          expires_hijri: string | null
          filed_hijri: string | null
          goods_ar: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name_ar: string
          name_en: string
          nice_class: string
          owner_ar: string | null
          registered_hijri: string | null
          registration_no: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address_ar?: string | null
          colors?: string[]
          country_ar?: string | null
          created_at?: string
          description_ar?: string | null
          expires_hijri?: string | null
          filed_hijri?: string | null
          goods_ar?: string | null
          id: string
          image_url?: string | null
          is_active?: boolean
          name_ar: string
          name_en: string
          nice_class: string
          owner_ar?: string | null
          registered_hijri?: string | null
          registration_no: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address_ar?: string | null
          colors?: string[]
          country_ar?: string | null
          created_at?: string
          description_ar?: string | null
          expires_hijri?: string | null
          filed_hijri?: string | null
          goods_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name_ar?: string
          name_en?: string
          nice_class?: string
          owner_ar?: string | null
          registered_hijri?: string | null
          registration_no?: string
          sort_order?: number
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      web_vitals: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          navigation_type: string | null
          path: string
          rating: string | null
          session_id: string | null
          user_agent: string | null
          webgl: boolean | null
          webgl_reason: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value: number
          navigation_type?: string | null
          path: string
          rating?: string | null
          session_id?: string | null
          user_agent?: string | null
          webgl?: boolean | null
          webgl_reason?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          navigation_type?: string | null
          path?: string
          rating?: string | null
          session_id?: string | null
          user_agent?: string | null
          webgl?: boolean | null
          webgl_reason?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      trademarks_public: {
        Row: {
          colors: string[] | null
          description_ar: string | null
          expires_hijri: string | null
          filed_hijri: string | null
          goods_ar: string | null
          id: string | null
          is_active: boolean | null
          name_ar: string | null
          name_en: string | null
          nice_class: string | null
          registered_hijri: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          colors?: string[] | null
          description_ar?: string | null
          expires_hijri?: string | null
          filed_hijri?: string | null
          goods_ar?: string | null
          id?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          nice_class?: string | null
          registered_hijri?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          colors?: string[] | null
          description_ar?: string | null
          expires_hijri?: string | null
          filed_hijri?: string | null
          goods_ar?: string | null
          id?: string | null
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string | null
          nice_class?: string | null
          registered_hijri?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: { _key: string; _max: number; _window_seconds: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "wholesale"
        | "user"
        | "super_admin"
        | "sales"
        | "warehouse"
        | "accountant"
        | "distributor"
        | "customer"
        | "manager"
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
      app_role: [
        "admin",
        "wholesale",
        "user",
        "super_admin",
        "sales",
        "warehouse",
        "accountant",
        "distributor",
        "customer",
        "manager",
      ],
    },
  },
} as const
