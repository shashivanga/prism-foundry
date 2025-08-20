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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          actor: string | null
          created_at: string | null
          id: string
          payload: Json | null
          project_id: string | null
          type: string
        }
        Insert: {
          actor?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          project_id?: string | null
          type: string
        }
        Update: {
          actor?: string | null
          created_at?: string | null
          id?: string
          payload?: Json | null
          project_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      builds: {
        Row: {
          created_at: string | null
          id: string
          mvp_spec_id: string | null
          preview_url: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mvp_spec_id?: string | null
          preview_url: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mvp_spec_id?: string | null
          preview_url?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builds_mvp_spec_id_fkey"
            columns: ["mvp_spec_id"]
            isOneToOne: false
            referencedRelation: "mvp_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builds_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      change_logs: {
        Row: {
          created_at: string | null
          delta_json: Json | null
          from_prd_version: number | null
          id: string
          project_id: string
          summary_md: string | null
          to_prd_version: number
        }
        Insert: {
          created_at?: string | null
          delta_json?: Json | null
          from_prd_version?: number | null
          id?: string
          project_id: string
          summary_md?: string | null
          to_prd_version: number
        }
        Update: {
          created_at?: string | null
          delta_json?: Json | null
          from_prd_version?: number | null
          id?: string
          project_id?: string
          summary_md?: string | null
          to_prd_version?: number
        }
        Relationships: [
          {
            foreignKeyName: "change_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          impact: Json | null
          project_id: string
          rationale: string
          source_id: string | null
          source_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          impact?: Json | null
          project_id: string
          rationale: string
          source_id?: string | null
          source_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          impact?: Json | null
          project_id?: string
          rationale?: string
          source_id?: string | null
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_items: {
        Row: {
          author_email: string | null
          build_id: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          contradiction_of_ids: Json | null
          created_at: string | null
          id: string
          in_scope: boolean | null
          project_id: string
          role: string | null
          share_link_id: string | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          text: string
        }
        Insert: {
          author_email?: string | null
          build_id?: string | null
          category: Database["public"]["Enums"]["feedback_category"]
          contradiction_of_ids?: Json | null
          created_at?: string | null
          id?: string
          in_scope?: boolean | null
          project_id: string
          role?: string | null
          share_link_id?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          text: string
        }
        Update: {
          author_email?: string | null
          build_id?: string | null
          category?: Database["public"]["Enums"]["feedback_category"]
          contradiction_of_ids?: Json | null
          created_at?: string | null
          id?: string
          in_scope?: boolean | null
          project_id?: string
          role?: string | null
          share_link_id?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_items_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_share_link_id_fkey"
            columns: ["share_link_id"]
            isOneToOne: false
            referencedRelation: "share_links"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_specs: {
        Row: {
          created_at: string | null
          id: string
          model: string | null
          prd_version_id: string
          project_id: string
          spec_json: Json
          spec_md: string
          tasks: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string | null
          prd_version_id: string
          project_id: string
          spec_json: Json
          spec_md: string
          tasks?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string | null
          prd_version_id?: string
          project_id?: string
          spec_json?: Json
          spec_md?: string
          tasks?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mvp_specs_prd_version_id_fkey"
            columns: ["prd_version_id"]
            isOneToOne: false
            referencedRelation: "prd_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_specs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      prd_versions: {
        Row: {
          content_json: Json
          content_md: string
          created_at: string | null
          created_by: string
          id: string
          project_id: string
          version: number
        }
        Insert: {
          content_json: Json
          content_md: string
          created_at?: string | null
          created_by: string
          id?: string
          project_id: string
          version: number
        }
        Update: {
          content_json?: Json
          content_md?: string
          created_at?: string | null
          created_by?: string
          id?: string
          project_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prd_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prd_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_name: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string
          updated_at: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      share_links: {
        Row: {
          build_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_revoked: boolean | null
          project_id: string
          token: string
        }
        Insert: {
          build_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          project_id: string
          token: string
        }
        Update: {
          build_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_revoked?: boolean | null
          project_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "share_links_build_id_fkey"
            columns: ["build_id"]
            isOneToOne: false
            referencedRelation: "builds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "share_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["role_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["role_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      feedback_category: "bug" | "enhancement" | "scope" | "question"
      feedback_status: "open" | "in_progress" | "resolved"
      impact_tag: "timeline" | "effort" | "scope"
      role_enum: "client" | "pm" | "admin"
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
      feedback_category: ["bug", "enhancement", "scope", "question"],
      feedback_status: ["open", "in_progress", "resolved"],
      impact_tag: ["timeline", "effort", "scope"],
      role_enum: ["client", "pm", "admin"],
    },
  },
} as const
