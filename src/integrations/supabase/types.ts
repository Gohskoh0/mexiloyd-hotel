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
      app_settings: {
        Row: {
          address: string
          city: string
          country: string
          currency: string
          currency_symbol: string
          deposit_percent: number
          email: string
          google_maps_url: string
          hotel_name: string
          id: number
          phone: string
          tagline: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address?: string
          city?: string
          country?: string
          currency?: string
          currency_symbol?: string
          deposit_percent?: number
          email?: string
          google_maps_url?: string
          hotel_name?: string
          id?: number
          phone?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          address?: string
          city?: string
          country?: string
          currency?: string
          currency_symbol?: string
          deposit_percent?: number
          email?: string
          google_maps_url?: string
          hotel_name?: string
          id?: number
          phone?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          amount_paid: number
          check_in: string
          check_out: string
          created_at: string
          guest_email: string
          guest_name: string
          guest_phone: string
          guests: number
          id: string
          nights: number
          payment_option: Database["public"]["Enums"]["payment_option"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          paystack_reference: string | null
          reference: string
          room_type_id: string
          rooms_booked: number
          special_requests: string | null
          status: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          check_in: string
          check_out: string
          created_at?: string
          guest_email: string
          guest_name: string
          guest_phone: string
          guests?: number
          id?: string
          nights: number
          payment_option: Database["public"]["Enums"]["payment_option"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          paystack_reference?: string | null
          reference: string
          room_type_id: string
          rooms_booked?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          check_in?: string
          check_out?: string
          created_at?: string
          guest_email?: string
          guest_name?: string
          guest_phone?: string
          guests?: number
          id?: string
          nights?: number
          payment_option?: Database["public"]["Enums"]["payment_option"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          paystack_reference?: string | null
          reference?: string
          room_type_id?: string
          rooms_booked?: number
          special_requests?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_type_id_fkey"
            columns: ["room_type_id"]
            isOneToOne: false
            referencedRelation: "room_types"
            referencedColumns: ["id"]
          },
        ]
      }
      room_types: {
        Row: {
          amenities: string[]
          base_price: number
          bed_type: string
          created_at: string
          description: string
          id: string
          images: string[]
          is_active: boolean
          max_occupancy: number
          name: string
          short_description: string
          size_sqm: number | null
          slug: string
          sort_order: number
          total_units: number
          updated_at: string
        }
        Insert: {
          amenities?: string[]
          base_price?: number
          bed_type?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_active?: boolean
          max_occupancy?: number
          name: string
          short_description?: string
          size_sqm?: number | null
          slug: string
          sort_order?: number
          total_units?: number
          updated_at?: string
        }
        Update: {
          amenities?: string[]
          base_price?: number
          bed_type?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          is_active?: boolean
          max_occupancy?: number
          name?: string
          short_description?: string
          size_sqm?: number | null
          slug?: string
          sort_order?: number
          total_units?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      room_units_available: {
        Args: { _check_in: string; _check_out: string; _room_type_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "checked_out"
        | "cancelled"
      payment_option: "full" | "deposit" | "at_hotel"
      payment_status: "unpaid" | "partial" | "paid" | "refunded"
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
      booking_status: [
        "pending",
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
      ],
      payment_option: ["full", "deposit", "at_hotel"],
      payment_status: ["unpaid", "partial", "paid", "refunded"],
    },
  },
} as const
