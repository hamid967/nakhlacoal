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
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          country: string
          created_at: string
          district: string | null
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          phone: string
          postal_code: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          district?: string | null
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone: string
          postal_code?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          district?: string | null
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          phone?: string
          postal_code?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          id: number
          properties: Json
          referrer: string | null
          session_id: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          id?: number
          properties?: Json
          referrer?: string | null
          session_id: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          id?: number
          properties?: Json
          referrer?: string | null
          session_id?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      articles: {
        Row: {
          author: string | null
          body_ar: string | null
          body_en: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_en: string | null
          hero_image: string | null
          id: string
          is_published: boolean
          published_at: string | null
          reading_minutes: number | null
          slug: string
          tags: string[] | null
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          hero_image?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          tags?: string[] | null
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          hero_image?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          tags?: string[] | null
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          qty: number
          unit_price: number
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          qty?: number
          unit_price: number
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          qty?: number
          unit_price?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency: string
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          hero_image: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          hero_image?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          hero_image?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          cert_number: string | null
          created_at: string
          document_url: string | null
          id: string
          is_public: boolean
          issuer: string | null
          logo_url: string | null
          name_ar: string
          name_en: string
          sort_order: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          cert_number?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          is_public?: boolean
          issuer?: string | null
          logo_url?: string | null
          name_ar: string
          name_en: string
          sort_order?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          cert_number?: string | null
          created_at?: string
          document_url?: string | null
          id?: string
          is_public?: boolean
          issuer?: string | null
          logo_url?: string | null
          name_ar?: string
          name_en?: string
          sort_order?: number
          updated_at?: string
          valid_until?: string | null
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
      email_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          opened_count: number
          scheduled_at: string | null
          segment: Json
          sent_count: number
          status: string
          template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          opened_count?: number
          scheduled_at?: string | null
          segment?: Json
          sent_count?: number
          status?: string
          template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          opened_count?: number
          scheduled_at?: string | null
          segment?: Json
          sent_count?: number
          status?: string
          template?: string
          updated_at?: string
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
      email_preferences: {
        Row: {
          created_at: string
          email: string
          id: string
          invoice_receipts: boolean
          marketing: boolean
          order_updates: boolean
          quote_updates: boolean
          shipment_updates: boolean
          unsubscribe_token: string
          unsubscribed_all: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invoice_receipts?: boolean
          marketing?: boolean
          order_updates?: boolean
          quote_updates?: boolean
          shipment_updates?: boolean
          unsubscribe_token?: string
          unsubscribed_all?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invoice_receipts?: boolean
          marketing?: boolean
          order_updates?: boolean
          quote_updates?: boolean
          shipment_updates?: boolean
          unsubscribe_token?: string
          unsubscribed_all?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          admin_notify_email: string | null
          auto_admin_quote_alert: boolean
          auto_customer_invite: boolean
          auto_invoice_receipt: boolean
          auto_order_confirmation: boolean
          auto_shipment_notification: boolean
          auto_zatca_failure_alert: boolean
          id: boolean
          slack_webhook_url: string | null
          updated_at: string
          updated_by: string | null
          zatca_alert_threshold: number
        }
        Insert: {
          admin_notify_email?: string | null
          auto_admin_quote_alert?: boolean
          auto_customer_invite?: boolean
          auto_invoice_receipt?: boolean
          auto_order_confirmation?: boolean
          auto_shipment_notification?: boolean
          auto_zatca_failure_alert?: boolean
          id?: boolean
          slack_webhook_url?: string | null
          updated_at?: string
          updated_by?: string | null
          zatca_alert_threshold?: number
        }
        Update: {
          admin_notify_email?: string | null
          auto_admin_quote_alert?: boolean
          auto_customer_invite?: boolean
          auto_invoice_receipt?: boolean
          auto_order_confirmation?: boolean
          auto_shipment_notification?: boolean
          auto_zatca_failure_alert?: boolean
          id?: boolean
          slack_webhook_url?: string | null
          updated_at?: string
          updated_by?: string | null
          zatca_alert_threshold?: number
        }
        Relationships: []
      }
      export_leads: {
        Row: {
          company: string
          contact_name: string
          container_size: string | null
          country: string
          created_at: string
          email: string
          id: string
          incoterm: string | null
          monthly_volume_tons: number | null
          notes: string | null
          phone: string | null
          port_of_discharge: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company: string
          contact_name: string
          container_size?: string | null
          country: string
          created_at?: string
          email: string
          id?: string
          incoterm?: string | null
          monthly_volume_tons?: number | null
          notes?: string | null
          phone?: string | null
          port_of_discharge?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string
          contact_name?: string
          container_size?: string | null
          country?: string
          created_at?: string
          email?: string
          id?: string
          incoterm?: string | null
          monthly_volume_tons?: number | null
          notes?: string | null
          phone?: string | null
          port_of_discharge?: string | null
          status?: string
          updated_at?: string
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
          counterparty_address: Json | null
          counterparty_vat: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          customer_user_id: string | null
          due_date: string | null
          grand_total_sar: number
          id: string
          invoice_no: string
          invoice_subtype: string
          invoice_type: string
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
          zatca_qr: string | null
          zatca_status: string
          zatca_uuid: string | null
        }
        Insert: {
          buyer_address?: string | null
          buyer_name: string
          buyer_vat_number?: string | null
          counterparty_address?: Json | null
          counterparty_vat?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          customer_user_id?: string | null
          due_date?: string | null
          grand_total_sar?: number
          id?: string
          invoice_no?: string
          invoice_subtype?: string
          invoice_type?: string
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
          zatca_qr?: string | null
          zatca_status?: string
          zatca_uuid?: string | null
        }
        Update: {
          buyer_address?: string | null
          buyer_name?: string
          buyer_vat_number?: string | null
          counterparty_address?: Json | null
          counterparty_vat?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          customer_user_id?: string | null
          due_date?: string | null
          grand_total_sar?: number
          id?: string
          invoice_no?: string
          invoice_subtype?: string
          invoice_type?: string
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
          zatca_qr?: string | null
          zatca_status?: string
          zatca_uuid?: string | null
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
      link_preview_checks: {
        Row: {
          batch_id: string | null
          canonical: string | null
          checked_by: string | null
          created_at: string
          http_status: number | null
          id: string
          note: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          og_url: string | null
          raw: Json | null
          source: string
          status: string
          tool: string
          twitter_card: string | null
          twitter_image: string | null
          url: string
          warnings: Json
        }
        Insert: {
          batch_id?: string | null
          canonical?: string | null
          checked_by?: string | null
          created_at?: string
          http_status?: number | null
          id?: string
          note?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          og_url?: string | null
          raw?: Json | null
          source?: string
          status?: string
          tool?: string
          twitter_card?: string | null
          twitter_image?: string | null
          url: string
          warnings?: Json
        }
        Update: {
          batch_id?: string | null
          canonical?: string | null
          checked_by?: string | null
          created_at?: string
          http_status?: number | null
          id?: string
          note?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          og_url?: string | null
          raw?: Json | null
          source?: string
          status?: string
          tool?: string
          twitter_card?: string | null
          twitter_image?: string | null
          url?: string
          warnings?: Json
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          created_at: string
          lifetime_spend_sar: number
          points_balance: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          lifetime_spend_sar?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          lifetime_spend_sar?: number
          points_balance?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          points: number
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          points: number
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          points?: number
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_channels: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          credentials_ref: string | null
          id: string
          last_sync_at: string | null
          name: string
          provider: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string
          credentials_ref?: string | null
          id?: string
          last_sync_at?: string | null
          name: string
          provider: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          credentials_ref?: string | null
          id?: string
          last_sync_at?: string | null
          name?: string
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          channel_id: string
          created_at: string
          external_id: string | null
          external_sku: string | null
          id: string
          last_error: string | null
          last_pushed_at: string | null
          price_sar: number | null
          status: string
          stock_qty: number | null
          updated_at: string
          variant_id: string
        }
        Insert: {
          channel_id: string
          created_at?: string
          external_id?: string | null
          external_sku?: string | null
          id?: string
          last_error?: string | null
          last_pushed_at?: string | null
          price_sar?: number | null
          status?: string
          stock_qty?: number | null
          updated_at?: string
          variant_id: string
        }
        Update: {
          channel_id?: string
          created_at?: string
          external_id?: string | null
          external_sku?: string | null
          id?: string
          last_error?: string | null
          last_pushed_at?: string | null
          price_sar?: number | null
          status?: string
          stock_qty?: number | null
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "marketplace_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_listings_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          channel_id: string
          external_order_id: string
          id: string
          imported_at: string
          order_id: string | null
          raw: Json
          status: string
        }
        Insert: {
          channel_id: string
          external_order_id: string
          id?: string
          imported_at?: string
          order_id?: string | null
          raw?: Json
          status?: string
        }
        Update: {
          channel_id?: string
          external_order_id?: string
          id?: string
          imported_at?: string
          order_id?: string | null
          raw?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "marketplace_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_confirmed: boolean
          locale: string
          source: string | null
          unsubscribe_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_confirmed?: boolean
          locale?: string
          source?: string | null
          unsubscribe_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_confirmed?: boolean
          locale?: string
          source?: string | null
          unsubscribe_token?: string
          updated_at?: string
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
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_name_snapshot: string
          qty: number
          sku_snapshot: string | null
          subtotal: number
          unit_price: number
          variant_id: string | null
          variant_label_snapshot: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_name_snapshot: string
          qty: number
          sku_snapshot?: string | null
          subtotal: number
          unit_price: number
          variant_id?: string | null
          variant_label_snapshot?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_name_snapshot?: string
          qty?: number
          sku_snapshot?: string | null
          subtotal?: number
          unit_price?: number
          variant_id?: string | null
          variant_label_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
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
          legal_accepted_at: string | null
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_status: string
          phone: string
          postal_code: string | null
          pricing_snapshot: Json | null
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
          wholesale_account_id: string | null
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
          legal_accepted_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          phone: string
          postal_code?: string | null
          pricing_snapshot?: Json | null
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
          wholesale_account_id?: string | null
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
          legal_accepted_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string
          postal_code?: string | null
          pricing_snapshot?: Json | null
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
          wholesale_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_wholesale_account_id_fkey"
            columns: ["wholesale_account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_sar: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          method: string | null
          order_id: string
          provider: string
          provider_ref: string | null
          raw_response: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_sar: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          method?: string | null
          order_id: string
          provider?: string
          provider_ref?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_sar?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          method?: string | null
          order_id?: string
          provider?: string
          provider_ref?: string | null
          raw_response?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      product_images: {
        Row: {
          alt_ar: string | null
          alt_en: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt_ar?: string | null
          alt_en?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt_ar?: string | null
          alt_en?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          approved: boolean
          body: string | null
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          approved?: boolean
          body?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          created_at: string
          id: string
          is_active: boolean
          label_ar: string
          label_en: string
          pack_size: number | null
          price: number
          product_id: string
          reserved_qty: number
          sku: string
          sort_order: number
          stock: number
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar: string
          label_en: string
          pack_size?: number | null
          price: number
          product_id: string
          reserved_qty?: number
          sku: string
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          label_ar?: string
          label_en?: string
          pack_size?: number | null
          price?: number
          product_id?: string
          reserved_qty?: number
          sku?: string
          sort_order?: number
          stock?: number
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          ash_pct: number | null
          batch_code: string
          burn_time_min: number | null
          calorific_kcal_kg: number | null
          created_at: string
          id: string
          is_public: boolean
          lab_report_url: string | null
          moisture_pct: number | null
          produced_at: string
          product_id: string | null
          updated_at: string
        }
        Insert: {
          ash_pct?: number | null
          batch_code: string
          burn_time_min?: number | null
          calorific_kcal_kg?: number | null
          created_at?: string
          id?: string
          is_public?: boolean
          lab_report_url?: string | null
          moisture_pct?: number | null
          produced_at: string
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          ash_pct?: number | null
          batch_code?: string
          burn_time_min?: number | null
          calorific_kcal_kg?: number | null
          created_at?: string
          id?: string
          is_public?: boolean
          lab_report_url?: string | null
          moisture_pct?: number | null
          produced_at?: string
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category_id: string | null
          created_at: string
          currency: string
          hero_image: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          story_ar: string | null
          story_en: string | null
          tagline_ar: string | null
          tagline_en: string | null
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string
          hero_image?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          story_ar?: string | null
          story_en?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category_id?: string | null
          created_at?: string
          currency?: string
          hero_image?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          story_ar?: string | null
          story_en?: string | null
          tagline_ar?: string | null
          tagline_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
          invited_at: string | null
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
          wholesale_account_id: string | null
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
          invited_at?: string | null
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
          wholesale_account_id?: string | null
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
          invited_at?: string | null
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
          wholesale_account_id?: string | null
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
          {
            foreignKeyName: "quote_requests_wholesale_account_id_fkey"
            columns: ["wholesale_account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
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
      referral_codes: {
        Row: {
          code: string
          created_at: string
          total_reward_sar: number
          user_id: string
          uses: number
        }
        Insert: {
          code: string
          created_at?: string
          total_reward_sar?: number
          user_id: string
          uses?: number
        }
        Update: {
          code?: string
          created_at?: string
          total_reward_sar?: number
          user_id?: string
          uses?: number
        }
        Relationships: []
      }
      referral_redemptions: {
        Row: {
          code: string
          created_at: string
          discount_sar: number
          id: string
          order_id: string | null
          referred_user_id: string | null
          referrer_user_id: string
          reward_points: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_sar?: number
          id?: string
          order_id?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          reward_points?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_sar?: number
          id?: string
          order_id?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
      stock_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          qty: number
          released: boolean
          session_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          qty: number
          released?: boolean
          session_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          qty?: number
          released?: boolean
          session_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          avatar_url: string | null
          created_at: string
          id: string
          is_published: boolean
          quote_ar: string | null
          quote_en: string | null
          rating: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          quote_ar?: string | null
          quote_en?: string | null
          rating?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          quote_ar?: string | null
          quote_en?: string | null
          rating?: number | null
          sort_order?: number
          updated_at?: string
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
      wholesale_accounts: {
        Row: {
          approved_at: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          cr_number: string | null
          created_at: string
          credit_limit_sar: number
          id: string
          lead_id: string | null
          notes: string | null
          payment_terms: string
          sales_rep_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          vat_number: string | null
        }
        Insert: {
          approved_at?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cr_number?: string | null
          created_at?: string
          credit_limit_sar?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_terms?: string
          sales_rep_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Update: {
          approved_at?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cr_number?: string | null
          created_at?: string
          credit_limit_sar?: number
          id?: string
          lead_id?: string | null
          notes?: string | null
          payment_terms?: string
          sales_rep_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_accounts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "wholesale_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_leads: {
        Row: {
          business_type: string | null
          city: string | null
          company: string
          contact_name: string
          country: string
          created_at: string
          email: string
          id: string
          monthly_volume_kg: number | null
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          business_type?: string | null
          city?: string | null
          company: string
          contact_name: string
          country?: string
          created_at?: string
          email: string
          id?: string
          monthly_volume_kg?: number | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          business_type?: string | null
          city?: string | null
          company?: string
          contact_name?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          monthly_volume_kg?: number | null
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      wholesale_price_tiers: {
        Row: {
          account_id: string | null
          category_id: string | null
          created_at: string
          discount_pct: number | null
          fixed_price_sar: number | null
          id: string
          min_qty: number
          updated_at: string
          valid_from: string
          valid_until: string | null
          variant_id: string | null
        }
        Insert: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          discount_pct?: number | null
          fixed_price_sar?: number | null
          id?: string
          min_qty?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          variant_id?: string | null
        }
        Update: {
          account_id?: string | null
          category_id?: string | null
          created_at?: string
          discount_pct?: number | null
          fixed_price_sar?: number | null
          id?: string
          min_qty?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_price_tiers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wholesale_price_tiers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wholesale_price_tiers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wholesale_statements: {
        Row: {
          account_id: string
          closing_balance_sar: number
          created_at: string
          id: string
          invoiced_sar: number
          opening_balance_sar: number
          paid_sar: number
          pdf_url: string | null
          period_end: string
          period_start: string
          updated_at: string
        }
        Insert: {
          account_id: string
          closing_balance_sar?: number
          created_at?: string
          id?: string
          invoiced_sar?: number
          opening_balance_sar?: number
          paid_sar?: number
          pdf_url?: string | null
          period_end: string
          period_start: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          closing_balance_sar?: number
          created_at?: string
          id?: string
          invoiced_sar?: number
          opening_balance_sar?: number
          paid_sar?: number
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wholesale_statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "wholesale_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      zatca_credentials: {
        Row: {
          active: boolean
          cert_expires_at: string | null
          common_name: string
          compliance_csid: string | null
          compliance_request_id: string | null
          created_at: string
          csr: string | null
          csr_config: Json
          device_serial: string
          environment: string
          id: string
          key_curve: string
          notes: string | null
          onboarding_step: string
          org_address: Json | null
          org_cr: string | null
          org_name: string
          org_vat: string
          private_key_encrypted: string | null
          production_csid: string | null
          public_key: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cert_expires_at?: string | null
          common_name: string
          compliance_csid?: string | null
          compliance_request_id?: string | null
          created_at?: string
          csr?: string | null
          csr_config?: Json
          device_serial: string
          environment?: string
          id?: string
          key_curve?: string
          notes?: string | null
          onboarding_step?: string
          org_address?: Json | null
          org_cr?: string | null
          org_name: string
          org_vat: string
          private_key_encrypted?: string | null
          production_csid?: string | null
          public_key?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cert_expires_at?: string | null
          common_name?: string
          compliance_csid?: string | null
          compliance_request_id?: string | null
          created_at?: string
          csr?: string | null
          csr_config?: Json
          device_serial?: string
          environment?: string
          id?: string
          key_curve?: string
          notes?: string | null
          onboarding_step?: string
          org_address?: Json | null
          org_cr?: string | null
          org_name?: string
          org_vat?: string
          private_key_encrypted?: string | null
          production_csid?: string | null
          public_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      zatca_invoices: {
        Row: {
          alert_count: number
          alerted_at: string | null
          attempts: number
          cleared_at: string | null
          created_at: string
          credential_id: string | null
          hash: string
          icv: number
          id: string
          invoice_id: string
          invoice_subtype: string
          invoice_type: string
          last_error: string | null
          pih: string
          qr_base64: string | null
          status: string
          submission_type: string
          submitted_at: string | null
          updated_at: string
          uuid: string
          xml_signed: string | null
          zatca_response: Json | null
        }
        Insert: {
          alert_count?: number
          alerted_at?: string | null
          attempts?: number
          cleared_at?: string | null
          created_at?: string
          credential_id?: string | null
          hash: string
          icv: number
          id?: string
          invoice_id: string
          invoice_subtype?: string
          invoice_type?: string
          last_error?: string | null
          pih: string
          qr_base64?: string | null
          status?: string
          submission_type: string
          submitted_at?: string | null
          updated_at?: string
          uuid: string
          xml_signed?: string | null
          zatca_response?: Json | null
        }
        Update: {
          alert_count?: number
          alerted_at?: string | null
          attempts?: number
          cleared_at?: string | null
          created_at?: string
          credential_id?: string | null
          hash?: string
          icv?: number
          id?: string
          invoice_id?: string
          invoice_subtype?: string
          invoice_type?: string
          last_error?: string | null
          pih?: string
          qr_base64?: string | null
          status?: string
          submission_type?: string
          submitted_at?: string | null
          updated_at?: string
          uuid?: string
          xml_signed?: string | null
          zatca_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "zatca_invoices_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "zatca_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zatca_invoices_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
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
      email_opted_in: {
        Args: { _category: string; _email: string }
        Returns: boolean
      }
      expire_stock_reservations: { Args: never; Returns: number }
      get_account_balance: {
        Args: { _account_id: string }
        Returns: {
          available_sar: number
          credit_limit_sar: number
          outstanding_sar: number
        }[]
      }
      get_quote_status: {
        Args: { _id: string; _phone: string }
        Returns: {
          created_at: string
          id: string
          product: string
          quantity: number
          quoted_price_sar: number
          status: string
          unit: string
          updated_at: string
        }[]
      }
      get_wholesale_price: {
        Args: { _qty?: number; _variant_id: string }
        Returns: {
          price_sar: number
          source: string
          tier_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      release_order_reservations: {
        Args: { _order_id: string }
        Returns: number
      }
      validate_referral_code: {
        Args: { _code: string }
        Returns: {
          referrer: string
          valid: boolean
        }[]
      }
      zatca_next_icv: {
        Args: { _credential_id: string }
        Returns: {
          next_icv: number
          previous_hash: string
        }[]
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
        | "sales_rep"
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
        "sales_rep",
      ],
    },
  },
} as const
