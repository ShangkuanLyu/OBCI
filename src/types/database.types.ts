// Generated from the live Supabase schema via MCP generate_typescript_types.
// Regenerate after every migration batch — do not edit by hand.
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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      contact_enquiries: {
        Row: {
          created_at: string
          email: string
          handled_by: string | null
          id: number
          locale: string
          message: string
          name: string
          organisation_name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["enquiry_status"]
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          handled_by?: string | null
          id?: never
          locale?: string
          message: string
          name: string
          organisation_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          handled_by?: string | null
          id?: never
          locale?: string
          message?: string
          name?: string
          organisation_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["enquiry_status"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_enquiries_handled_by_fkey"
            columns: ["handled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          email: string
          event_id: number
          id: number
          name: string
          note: string | null
          organisation_name: string | null
          phone: string | null
          status: Database["public"]["Enums"]["registration_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id: number
          id?: never
          name: string
          note?: string | null
          organisation_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: number
          id?: never
          name?: string
          note?: string | null
          organisation_name?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          body_en: string | null
          body_zh: string | null
          capacity: number | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: number
          is_featured: boolean
          location_en: string | null
          location_zh: string | null
          registration_open: boolean
          registration_url: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string | null
          summary_zh: string | null
          title_en: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_zh?: string | null
          capacity?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: never
          is_featured?: boolean
          location_en?: string | null
          location_zh?: string | null
          registration_open?: boolean
          registration_url?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_zh?: string | null
          capacity?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: never
          is_featured?: boolean
          location_en?: string | null
          location_zh?: string | null
          registration_open?: boolean
          registration_url?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_chapter_members: {
        Row: {
          chapter_id: number
          joined_at: string
          member_id: number
          role_title: string | null
        }
        Insert: {
          chapter_id: number
          joined_at?: string
          member_id: number
          role_title?: string | null
        }
        Update: {
          chapter_id?: number
          joined_at?: string
          member_id?: number
          role_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industry_chapter_members_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "industry_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "industry_chapter_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_chapters: {
        Row: {
          contact_email: string | null
          cover_image_path: string | null
          created_at: string
          description_en: string | null
          description_zh: string | null
          display_order: number
          id: number
          is_active: boolean
          name_en: string
          name_zh: string
          secretary_general: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          cover_image_path?: string | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          name_en: string
          name_zh: string
          secretary_general?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          cover_image_path?: string | null
          created_at?: string
          description_en?: string | null
          description_zh?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          name_en?: string
          name_zh?: string
          secretary_general?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          currency: string
          id: number
          invoice_no: string
          issued_at: string
          metadata: Json
          payment_id: number
          pdf_path: string | null
        }
        Insert: {
          amount: number
          currency?: string
          id?: never
          invoice_no: string
          issued_at?: string
          metadata?: Json
          payment_id: number
          pdf_path?: string | null
        }
        Update: {
          amount?: number
          currency?: string
          id?: never
          invoice_no?: string
          issued_at?: string
          metadata?: Json
          payment_id?: number
          pdf_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      leadership: {
        Row: {
          bio_en: string | null
          bio_zh: string | null
          created_at: string
          display_order: number
          group_key: string
          id: number
          is_active: boolean
          name_en: string
          name_zh: string
          portrait_path: string | null
          title_en: string
          title_zh: string
          updated_at: string
        }
        Insert: {
          bio_en?: string | null
          bio_zh?: string | null
          created_at?: string
          display_order?: number
          group_key: string
          id?: never
          is_active?: boolean
          name_en: string
          name_zh: string
          portrait_path?: string | null
          title_en: string
          title_zh: string
          updated_at?: string
        }
        Update: {
          bio_en?: string | null
          bio_zh?: string | null
          created_at?: string
          display_order?: number
          group_key?: string
          id?: never
          is_active?: boolean
          name_en?: string
          name_zh?: string
          portrait_path?: string | null
          title_en?: string
          title_zh?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_en: string | null
          alt_zh: string | null
          bucket: string
          created_at: string
          created_by: string | null
          file_name: string
          height: number | null
          id: number
          mime_type: string | null
          storage_path: string
          width: number | null
        }
        Insert: {
          alt_en?: string | null
          alt_zh?: string | null
          bucket: string
          created_at?: string
          created_by?: string | null
          file_name: string
          height?: number | null
          id?: never
          mime_type?: string | null
          storage_path: string
          width?: number | null
        }
        Update: {
          alt_en?: string | null
          alt_zh?: string | null
          bucket?: string
          created_at?: string
          created_by?: string | null
          file_name?: string
          height?: number | null
          id?: never
          mime_type?: string | null
          storage_path?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          application_id: number | null
          created_at: string
          expires_at: string | null
          id: number
          joined_at: string
          member_no: string | null
          membership_type_id: number
          organisation_id: number | null
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          application_id?: number | null
          created_at?: string
          expires_at?: string | null
          id?: never
          joined_at?: string
          member_no?: string | null
          membership_type_id: number
          organisation_id?: number | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          application_id?: number | null
          created_at?: string
          expires_at?: string | null
          id?: never
          joined_at?: string
          member_no?: string | null
          membership_type_id?: number
          organisation_id?: number | null
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "membership_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_membership_type_id_fkey"
            columns: ["membership_type_id"]
            isOneToOne: false
            referencedRelation: "membership_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_applications: {
        Row: {
          access_token: string
          applicant_name: string
          applicant_user_id: string | null
          created_at: string
          email: string
          id: number
          locale: string
          membership_type_id: number
          message: string | null
          organisation_id: number | null
          organisation_name: string | null
          phone: string | null
          position: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          access_token?: string
          applicant_name: string
          applicant_user_id?: string | null
          created_at?: string
          email: string
          id?: never
          locale?: string
          membership_type_id: number
          message?: string | null
          organisation_id?: number | null
          organisation_name?: string | null
          phone?: string | null
          position?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          access_token?: string
          applicant_name?: string
          applicant_user_id?: string | null
          created_at?: string
          email?: string
          id?: never
          locale?: string
          membership_type_id?: number
          message?: string | null
          organisation_id?: number | null
          organisation_name?: string | null
          phone?: string | null
          position?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_applications_membership_type_id_fkey"
            columns: ["membership_type_id"]
            isOneToOne: false
            referencedRelation: "membership_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_applications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_documents: {
        Row: {
          application_id: number
          file_name: string
          id: number
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          application_id: number
          file_name: string
          id?: never
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          application_id?: number
          file_name?: string
          id?: never
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "membership_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_types: {
        Row: {
          benefits_en: string[]
          benefits_zh: string[]
          code: string
          currency: string
          description_en: string | null
          description_zh: string | null
          display_order: number
          id: number
          is_active: boolean
          name_en: string
          name_zh: string
          price_annual: number | null
          stripe_price_id: string | null
        }
        Insert: {
          benefits_en?: string[]
          benefits_zh?: string[]
          code: string
          currency?: string
          description_en?: string | null
          description_zh?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          name_en: string
          name_zh: string
          price_annual?: number | null
          stripe_price_id?: string | null
        }
        Update: {
          benefits_en?: string[]
          benefits_zh?: string[]
          code?: string
          currency?: string
          description_en?: string | null
          description_zh?: string | null
          display_order?: number
          id?: never
          is_active?: boolean
          name_en?: string
          name_zh?: string
          price_annual?: number | null
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          display_order: number
          href: string
          id: number
          is_active: boolean
          label_en: string
          label_zh: string
          menu: string
          parent_id: number | null
        }
        Insert: {
          display_order?: number
          href: string
          id?: never
          is_active?: boolean
          label_en: string
          label_zh: string
          menu: string
          parent_id?: number | null
        }
        Update: {
          display_order?: number
          href?: string
          id?: never
          is_active?: boolean
          label_en?: string
          label_zh?: string
          menu?: string
          parent_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_name: string | null
          body_en: string | null
          body_zh: string | null
          category_id: number | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          id: number
          is_featured: boolean
          published_at: string | null
          slug: string
          source_url: string | null
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string | null
          summary_zh: string | null
          tags: string[]
          title_en: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body_en?: string | null
          body_zh?: string | null
          category_id?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          is_featured?: boolean
          published_at?: string | null
          slug: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          tags?: string[]
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body_en?: string | null
          body_zh?: string | null
          category_id?: number | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          is_featured?: boolean
          published_at?: string | null
          slug?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          tags?: string[]
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          display_order: number
          id: number
          name_en: string
          name_zh: string
          slug: string
        }
        Insert: {
          display_order?: number
          id?: never
          name_en: string
          name_zh: string
          slug: string
        }
        Update: {
          display_order?: number
          id?: never
          name_en?: string
          name_zh?: string
          slug?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: number
          locale: string
          name: string | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: never
          locale?: string
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: never
          locale?: string
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      organisations: {
        Row: {
          abn: string | null
          created_at: string
          id: number
          industry: string | null
          name: string
          name_local: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          abn?: string | null
          created_at?: string
          id?: never
          industry?: string | null
          name: string
          name_local?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          abn?: string | null
          created_at?: string
          id?: never
          industry?: string | null
          name?: string
          name_local?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          display_order: number
          id: number
          is_active: boolean
          kind: string
          logo_path: string | null
          name_en: string
          name_zh: string
          region: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: never
          is_active?: boolean
          kind: string
          logo_path?: string | null
          name_en: string
          name_zh: string
          region?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: never
          is_active?: boolean
          kind?: string
          logo_path?: string | null
          name_en?: string
          name_zh?: string
          region?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: number | null
          created_at: string
          currency: string
          description: string | null
          id: number
          member_id: number | null
          method: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          application_id?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: never
          member_id?: number | null
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          application_id?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: never
          member_id?: number | null
          method?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "membership_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          organisation_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          organisation_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organisation_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          body_en: string | null
          body_zh: string | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          id: number
          kind: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          summary_en: string | null
          summary_zh: string | null
          title_en: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          body_en?: string | null
          body_zh?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          kind: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          body_en?: string | null
          body_zh?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          kind?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          summary_en?: string | null
          summary_zh?: string | null
          title_en?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      attach_application_document: {
        Args: {
          p_access_token: string
          p_application_id: number
          p_file_name: string
          p_mime_type: string
          p_size_bytes: number
          p_storage_path: string
        }
        Returns: undefined
      }
      get_application_for_checkout: {
        Args: { p_access_token: string; p_application_id: number }
        Returns: Json
      }
      submit_membership_application: {
        Args: {
          p_applicant_name: string
          p_email: string
          p_locale?: string
          p_membership_type_code: string
          p_message?: string
          p_organisation_name?: string
          p_phone?: string
          p_position?: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "membership_manager"
        | "event_manager"
        | "member"
      application_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      content_status: "draft" | "published" | "archived"
      enquiry_status: "new" | "in_progress" | "closed"
      member_status: "active" | "lapsed" | "suspended"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      registration_status: "pending" | "confirmed" | "cancelled"
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
        "editor",
        "membership_manager",
        "event_manager",
        "member",
      ],
      application_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "withdrawn",
      ],
      content_status: ["draft", "published", "archived"],
      enquiry_status: ["new", "in_progress", "closed"],
      member_status: ["active", "lapsed", "suspended"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      registration_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
