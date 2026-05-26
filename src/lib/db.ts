export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      salons: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          address: string | null;
          phone: string | null;
          whatsapp_number: string | null;
          logo_url: string | null;
          brand_colors: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          logo_url?: string | null;
          brand_colors?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp_number?: string | null;
          logo_url?: string | null;
          brand_colors?: Json | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          benefits: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          benefits?: string | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          benefits?: string | null;
          category?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          salon_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_slots: {
        Row: {
          id: string;
          salon_id: string;
          staff_id: string | null;
          service_id: string | null;
          start_time: string;
          end_time: string;
          capacity: number;
          is_blocked: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          staff_id?: string | null;
          service_id?: string | null;
          start_time: string;
          end_time: string;
          capacity?: number;
          is_blocked?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string;
          staff_id?: string | null;
          service_id?: string | null;
          start_time?: string;
          end_time?: string;
          capacity?: number;
          is_blocked?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          salon_id: string;
          service_id: string;
          customer_id: string;
          staff_id: string | null;
          slot_id: string;
          booking_reference: string;
          status: string;
          scheduled_start: string;
          scheduled_end: string;
          price: number;
          notes: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          service_id: string;
          customer_id: string;
          staff_id?: string | null;
          slot_id: string;
          booking_reference: string;
          status?: string;
          scheduled_start: string;
          scheduled_end: string;
          price: number;
          notes?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string;
          service_id?: string;
          customer_id?: string;
          staff_id?: string | null;
          slot_id?: string;
          booking_reference?: string;
          status?: string;
          scheduled_start?: string;
          scheduled_end?: string;
          price?: number;
          notes?: string | null;
          source?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          salon_id: string | null;
          email: string | null;
          name: string | null;
          role: string | null;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id?: string | null;
          email?: string | null;
          name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string | null;
          email?: string | null;
          name?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          salon_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          payload: Json | null;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          salon_id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          payload?: Json | null;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          salon_id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          payload?: Json | null;
          is_read?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      whatsapp_sessions: {
        Row: {
          phone: string;
          salon_id: string;
          step: string;
          selected_service_id: string | null;
          selected_slot_id: string | null;
          customer_name: string | null;
          updated_at: string;
          expires_at: string;
        };
        Insert: {
          phone: string;
          salon_id: string;
          step?: string;
          selected_service_id?: string | null;
          selected_slot_id?: string | null;
          customer_name?: string | null;
          updated_at?: string;
          expires_at?: string;
        };
        Update: {
          phone?: string;
          salon_id?: string;
          step?: string;
          selected_service_id?: string | null;
          selected_slot_id?: string | null;
          customer_name?: string | null;
          updated_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      whatsapp_processed_messages: {
        Row: {
          message_id: string;
          phone: string;
          processed_at: string;
        };
        Insert: {
          message_id: string;
          phone: string;
          processed_at?: string;
        };
        Update: {
          message_id?: string;
          phone?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
