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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chatbot_summaries: {
        Row: {
          chapter_id: string
          class: string
          created_at: string
          created_by: string | null
          id: string
          key_points: string[] | null
          language: Database["public"]["Enums"]["content_language"]
          subject: string
          summary_text: string
          updated_at: string
        }
        Insert: {
          chapter_id: string
          class: string
          created_at?: string
          created_by?: string | null
          id?: string
          key_points?: string[] | null
          language?: Database["public"]["Enums"]["content_language"]
          subject: string
          summary_text: string
          updated_at?: string
        }
        Update: {
          chapter_id?: string
          class?: string
          created_at?: string
          created_by?: string | null
          id?: string
          key_points?: string[] | null
          language?: Database["public"]["Enums"]["content_language"]
          subject?: string
          summary_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      content: {
        Row: {
          article_body: string | null
          class: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          language: Database["public"]["Enums"]["content_language"]
          title: string
          updated_at: string
          url: string | null
          version: number | null
        }
        Insert: {
          article_body?: string | null
          class: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: Database["public"]["Enums"]["content_language"]
          title: string
          updated_at?: string
          url?: string | null
          version?: number | null
        }
        Update: {
          article_body?: string | null
          class?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: Database["public"]["Enums"]["content_language"]
          title?: string
          updated_at?: string
          url?: string | null
          version?: number | null
        }
        Relationships: []
      }
      ebooks: {
        Row: {
          class: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          language: Database["public"]["Enums"]["content_language"]
          offline_enabled: boolean
          pdf_filename: string | null
          pdf_url: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: Database["public"]["Enums"]["content_language"]
          offline_enabled?: boolean
          pdf_filename?: string | null
          pdf_url: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          language?: Database["public"]["Enums"]["content_language"]
          offline_enabled?: boolean
          pdf_filename?: string | null
          pdf_url?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          language: Database["public"]["Enums"]["content_language"] | null
          updated_at: string
        }
        Insert: {
          class?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          language?: Database["public"]["Enums"]["content_language"] | null
          updated_at?: string
        }
        Update: {
          class?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          language?: Database["public"]["Enums"]["content_language"] | null
          updated_at?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_scores: {
        Row: {
          attempted_at: string
          id: string
          quiz_id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          quiz_id: string
          score: number
          total_questions?: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          quiz_id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_scores_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          class: string
          correct_answer: number
          created_at: string
          created_by: string | null
          id: string
          language: Database["public"]["Enums"]["content_language"]
          options: Json
          question: string
        }
        Insert: {
          class: string
          correct_answer: number
          created_at?: string
          created_by?: string | null
          id?: string
          language?: Database["public"]["Enums"]["content_language"]
          options?: Json
          question: string
        }
        Update: {
          class?: string
          correct_answer?: number
          created_at?: string
          created_by?: string | null
          id?: string
          language?: Database["public"]["Enums"]["content_language"]
          options?: Json
          question?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          classes: string[]
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          subjects: string[]
          teacher_id: string
          updated_at: string
        }
        Insert: {
          classes?: string[]
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          subjects?: string[]
          teacher_id: string
          updated_at?: string
        }
        Update: {
          classes?: string[]
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          subjects?: string[]
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "student" | "teacher" | "admin"
      content_language: "hindi" | "english"
      content_type: "video" | "article" | "pdf" | "image"
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
      app_role: ["student", "teacher", "admin"],
      content_language: ["hindi", "english"],
      content_type: ["video", "article", "pdf", "image"],
    },
  },
} as const
