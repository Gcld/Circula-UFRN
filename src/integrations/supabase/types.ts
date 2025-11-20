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
      locations: {
        Row: {
          created_at: string | null
          descricao: string | null
          endereco: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          endereco: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          endereco?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
          trade_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
          trade_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      objects: {
        Row: {
          categoria: Database["public"]["Enums"]["object_category"]
          condicao: string
          created_at: string | null
          descricao: string
          id: string
          imagens: string[] | null
          owner_id: string
          status: Database["public"]["Enums"]["object_status"] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria: Database["public"]["Enums"]["object_category"]
          condicao: string
          created_at?: string | null
          descricao: string
          id?: string
          imagens?: string[] | null
          owner_id: string
          status?: Database["public"]["Enums"]["object_status"] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["object_category"]
          condicao?: string
          created_at?: string | null
          descricao?: string
          id?: string
          imagens?: string[] | null
          owner_id?: string
          status?: Database["public"]["Enums"]["object_status"] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          curso: string | null
          email: string
          id: string
          matricula: string | null
          nome_completo: string
          telefone: string | null
          updated_at: string | null
          vinculo_ativo: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          email: string
          id: string
          matricula?: string | null
          nome_completo: string
          telefone?: string | null
          updated_at?: string | null
          vinculo_ativo?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          curso?: string | null
          email?: string
          id?: string
          matricula?: string | null
          nome_completo?: string
          telefone?: string | null
          updated_at?: string | null
          vinculo_ativo?: boolean | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          avaliado_id: string
          avaliador_id: string
          comentario: string | null
          created_at: string | null
          id: string
          nota: number
          trade_id: string
        }
        Insert: {
          avaliado_id: string
          avaliador_id: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota: number
          trade_id: string
        }
        Update: {
          avaliado_id?: string
          avaliador_id?: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota?: number
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_avaliado_id_fkey"
            columns: ["avaliado_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string | null
          id: string
          location_id: string | null
          mensagem: string | null
          objeto_desejado_id: string
          objeto_oferecido_id: string
          proponente_id: string
          receptor_id: string
          status: Database["public"]["Enums"]["trade_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          mensagem?: string | null
          objeto_desejado_id: string
          objeto_oferecido_id: string
          proponente_id: string
          receptor_id: string
          status?: Database["public"]["Enums"]["trade_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          location_id?: string | null
          mensagem?: string | null
          objeto_desejado_id?: string
          objeto_oferecido_id?: string
          proponente_id?: string
          receptor_id?: string
          status?: Database["public"]["Enums"]["trade_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_objeto_desejado_id_fkey"
            columns: ["objeto_desejado_id"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_objeto_oferecido_id_fkey"
            columns: ["objeto_oferecido_id"]
            isOneToOne: false
            referencedRelation: "objects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_proponente_id_fkey"
            columns: ["proponente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_receptor_id_fkey"
            columns: ["receptor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_rating: { Args: { user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      object_category:
        | "livros"
        | "eletronicos"
        | "roupas"
        | "acessorios"
        | "moveis"
        | "outros"
      object_status: "disponivel" | "em_negociacao" | "trocado"
      trade_status:
        | "pendente"
        | "aceita"
        | "recusada"
        | "concluida"
        | "cancelada"
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
      object_category: [
        "livros",
        "eletronicos",
        "roupas",
        "acessorios",
        "moveis",
        "outros",
      ],
      object_status: ["disponivel", "em_negociacao", "trocado"],
      trade_status: [
        "pendente",
        "aceita",
        "recusada",
        "concluida",
        "cancelada",
      ],
    },
  },
} as const
