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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string | null
          id_admin: string
          nama: string
          password_hash: string
          role: Database["public"]["Enums"]["admin_role"]
          username: string
        }
        Insert: {
          created_at?: string | null
          id_admin?: string
          nama: string
          password_hash: string
          role?: Database["public"]["Enums"]["admin_role"]
          username: string
        }
        Update: {
          created_at?: string | null
          id_admin?: string
          nama?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["admin_role"]
          username?: string
        }
        Relationships: []
      }
      jadwal: {
        Row: {
          created_at: string | null
          id_jadwal: string
          id_lapangan: string
          jam_mulai: string
          jam_selesai: string
          keterangan: string | null
          tanggal: string
          tipe_blokir: Database["public"]["Enums"]["tipe_blokir"]
        }
        Insert: {
          created_at?: string | null
          id_jadwal?: string
          id_lapangan: string
          jam_mulai: string
          jam_selesai: string
          keterangan?: string | null
          tanggal: string
          tipe_blokir?: Database["public"]["Enums"]["tipe_blokir"]
        }
        Update: {
          created_at?: string | null
          id_jadwal?: string
          id_lapangan?: string
          jam_mulai?: string
          jam_selesai?: string
          keterangan?: string | null
          tanggal?: string
          tipe_blokir?: Database["public"]["Enums"]["tipe_blokir"]
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_id_lapangan_fkey"
            columns: ["id_lapangan"]
            isOneToOne: false
            referencedRelation: "lapangan"
            referencedColumns: ["id_lapangan"]
          },
        ]
      }
      lapangan: {
        Row: {
          created_at: string | null
          id_lapangan: string
          jenis: Database["public"]["Enums"]["jenis_lapangan"]
          lokasi: string | null
          nama: string
          status_aktif: boolean
        }
        Insert: {
          created_at?: string | null
          id_lapangan?: string
          jenis: Database["public"]["Enums"]["jenis_lapangan"]
          lokasi?: string | null
          nama: string
          status_aktif?: boolean
        }
        Update: {
          created_at?: string | null
          id_lapangan?: string
          jenis?: Database["public"]["Enums"]["jenis_lapangan"]
          lokasi?: string | null
          nama?: string
          status_aktif?: boolean
        }
        Relationships: []
      }
      pembayaran: {
        Row: {
          bukti_url: string | null
          created_at: string | null
          id_admin: string | null
          id_pembayaran: string
          id_reservasi: string
          jumlah: number
          metode: Database["public"]["Enums"]["metode_pembayaran"]
          status_verifikasi: Database["public"]["Enums"]["status_verifikasi"]
          waktu_bayar: string | null
        }
        Insert: {
          bukti_url?: string | null
          created_at?: string | null
          id_admin?: string | null
          id_pembayaran?: string
          id_reservasi: string
          jumlah: number
          metode: Database["public"]["Enums"]["metode_pembayaran"]
          status_verifikasi?: Database["public"]["Enums"]["status_verifikasi"]
          waktu_bayar?: string | null
        }
        Update: {
          bukti_url?: string | null
          created_at?: string | null
          id_admin?: string | null
          id_pembayaran?: string
          id_reservasi?: string
          jumlah?: number
          metode?: Database["public"]["Enums"]["metode_pembayaran"]
          status_verifikasi?: Database["public"]["Enums"]["status_verifikasi"]
          waktu_bayar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_id_admin_fkey"
            columns: ["id_admin"]
            isOneToOne: false
            referencedRelation: "admin"
            referencedColumns: ["id_admin"]
          },
          {
            foreignKeyName: "pembayaran_id_reservasi_fkey"
            columns: ["id_reservasi"]
            isOneToOne: false
            referencedRelation: "reservasi"
            referencedColumns: ["id_reservasi"]
          },
        ]
      }
      penyewa: {
        Row: {
          created_at: string | null
          id_penyewa: string
          nama: string
          no_telepon: string
        }
        Insert: {
          created_at?: string | null
          id_penyewa?: string
          nama: string
          no_telepon: string
        }
        Update: {
          created_at?: string | null
          id_penyewa?: string
          nama?: string
          no_telepon?: string
        }
        Relationships: []
      }
      reservasi: {
        Row: {
          created_at: string | null
          id_lapangan: string
          id_penyewa: string
          id_reservasi: string
          jam_mulai: string
          jam_selesai: string
          kode_booking: string
          status: Database["public"]["Enums"]["status_reservasi"]
          tanggal: string
        }
        Insert: {
          created_at?: string | null
          id_lapangan: string
          id_penyewa: string
          id_reservasi?: string
          jam_mulai: string
          jam_selesai: string
          kode_booking: string
          status?: Database["public"]["Enums"]["status_reservasi"]
          tanggal: string
        }
        Update: {
          created_at?: string | null
          id_lapangan?: string
          id_penyewa?: string
          id_reservasi?: string
          jam_mulai?: string
          jam_selesai?: string
          kode_booking?: string
          status?: Database["public"]["Enums"]["status_reservasi"]
          tanggal?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservasi_id_lapangan_fkey"
            columns: ["id_lapangan"]
            isOneToOne: false
            referencedRelation: "lapangan"
            referencedColumns: ["id_lapangan"]
          },
          {
            foreignKeyName: "reservasi_id_penyewa_fkey"
            columns: ["id_penyewa"]
            isOneToOne: false
            referencedRelation: "penyewa"
            referencedColumns: ["id_penyewa"]
          },
        ]
      }
      tarif: {
        Row: {
          akhir_berlaku: string | null
          created_at: string | null
          harga_per_jam: number
          id_lapangan: string
          id_tarif: string
          mulai_berlaku: string
        }
        Insert: {
          akhir_berlaku?: string | null
          created_at?: string | null
          harga_per_jam: number
          id_lapangan: string
          id_tarif?: string
          mulai_berlaku: string
        }
        Update: {
          akhir_berlaku?: string | null
          created_at?: string | null
          harga_per_jam?: number
          id_lapangan?: string
          id_tarif?: string
          mulai_berlaku?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarif_id_lapangan_fkey"
            columns: ["id_lapangan"]
            isOneToOne: false
            referencedRelation: "lapangan"
            referencedColumns: ["id_lapangan"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_code: { Args: never; Returns: string }
    }
    Enums: {
      admin_role: "superadmin" | "operator"
      jenis_lapangan: "futsal" | "badminton" | "basket" | "voli"
      metode_pembayaran: "transfer" | "qris" | "tunai"
      status_reservasi: "MENUNGGU" | "TERKONFIRMASI" | "DITOLAK" | "DIBATALKAN"
      status_verifikasi: "MENUNGGU" | "VALID" | "INVALID"
      tipe_blokir: "buka" | "maintenance" | "event"
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
      admin_role: ["superadmin", "operator"],
      jenis_lapangan: ["futsal", "badminton", "basket", "voli"],
      metode_pembayaran: ["transfer", "qris", "tunai"],
      status_reservasi: ["MENUNGGU", "TERKONFIRMASI", "DITOLAK", "DIBATALKAN"],
      status_verifikasi: ["MENUNGGU", "VALID", "INVALID"],
      tipe_blokir: ["buka", "maintenance", "event"],
    },
  },
} as const
