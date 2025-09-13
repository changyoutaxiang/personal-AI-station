// Supabase 自动生成的数据库类型定义
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
      ai_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string | null
          data_source: string | null
          id: number
          insight_type: string
          is_active: boolean | null
          title: string
          valid_until: string | null
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string | null
          data_source?: string | null
          id?: number
          insight_type: string
          is_active?: boolean | null
          title: string
          valid_until?: string | null
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string | null
          data_source?: string | null
          id?: number
          insight_type?: string
          is_active?: boolean | null
          title?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      behavior_patterns: {
        Row: {
          discovered_at: string | null
          id: number
          is_active: boolean | null
          last_seen: string | null
          pattern_data: string
          pattern_name: string
          pattern_type: string
          strength: number | null
        }
        Insert: {
          discovered_at?: string | null
          id?: number
          is_active?: boolean | null
          last_seen?: string | null
          pattern_data: string
          pattern_name: string
          pattern_type: string
          strength?: number | null
        }
        Update: {
          discovered_at?: string | null
          id?: number
          is_active?: boolean | null
          last_seen?: string | null
          pattern_data?: string
          pattern_name?: string
          pattern_type?: string
          strength?: number | null
        }
        Relationships: []
      }
      cognitive_profiles: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          last_updated: string | null
          profile_data: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          last_updated?: string | null
          profile_data: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          last_updated?: string | null
          profile_data?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          messages: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          messages: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      entries: {
        Row: {
          content: string
          created_at: string | null
          daily_report_tag: string | null
          effort_tag: string | null
          id: number
          project_tag: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          daily_report_tag?: string | null
          effort_tag?: string | null
          id?: number
          project_tag?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          daily_report_tag?: string | null
          effort_tag?: string | null
          id?: number
          project_tag?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          parent_id?: string | null
          path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_base: {
        Row: {
          content: string
          created_at: string | null
          document_type: string
          id: number
          is_active: boolean | null
          keywords: string | null
          priority: number | null
          summary: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_type: string
          id?: number
          is_active?: boolean | null
          keywords?: string | null
          priority?: number | null
          summary?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string
          id?: number
          is_active?: boolean | null
          keywords?: string | null
          priority?: number | null
          summary?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_relationships: {
        Row: {
          created_at: string | null
          id: string
          relationship_type: string
          source_entry_id: number
          strength: number | null
          target_entry_id: number
        }
        Insert: {
          created_at?: string | null
          id: string
          relationship_type: string
          source_entry_id: number
          strength?: number | null
          target_entry_id: number
        }
        Update: {
          created_at?: string | null
          id?: string
          relationship_type?: string
          source_entry_id?: number
          strength?: number | null
          target_entry_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relationships_source_entry_id_fkey"
            columns: ["source_entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relationships_target_entry_id_fkey"
            columns: ["target_entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
        ]
      }
      okrs: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          parent_id: string | null
          status: string | null
          target_value: number | null
          title: string
          type: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id: string
          parent_id?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          type: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          type?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "okrs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "okrs"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_archived: boolean | null
          name: string
          owner: string | null
          priority: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id: string
          is_archived?: boolean | null
          name: string
          owner?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          owner?: string | null
          priority?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          confidence: number
          content: string | null
          created_at: string | null
          description: string
          effort_required: string | null
          expected_value: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          reasoning: string
          relevance_score: number
          timing_score: number
          title: string
          type: string
          user_feedback: string | null
        }
        Insert: {
          confidence: number
          content?: string | null
          created_at?: string | null
          description: string
          effort_required?: string | null
          expected_value?: number | null
          expires_at?: string | null
          id: string
          is_active?: boolean | null
          reasoning: string
          relevance_score: number
          timing_score: number
          title: string
          type: string
          user_feedback?: string | null
        }
        Update: {
          confidence?: number
          content?: string | null
          created_at?: string | null
          description?: string
          effort_required?: string | null
          expected_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          reasoning?: string
          relevance_score?: number
          timing_score?: number
          title?: string
          type?: string
          user_feedback?: string | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string | null
          id: number
          query: string
          results_count: number | null
          search_type: string | null
          user_session: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          query: string
          results_count?: number | null
          search_type?: string | null
          user_session?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          query?: string
          results_count?: number | null
          search_type?: string | null
          user_session?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          task_id: string
          title: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id: string
          task_id: string
          title: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assignee: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_behavior_events: {
        Row: {
          context: string
          duration_ms: number | null
          event_data: string
          event_type: string
          id: number
          session_id: string
          timestamp: string | null
        }
        Insert: {
          context: string
          duration_ms?: number | null
          event_data: string
          event_type: string
          id?: number
          session_id: string
          timestamp?: string | null
        }
        Update: {
          context?: string
          duration_ms?: number | null
          event_data?: string
          event_type?: string
          id?: number
          session_id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      work_patterns: {
        Row: {
          analysis_date: string | null
          confidence_score: number | null
          id: number
          pattern_data: string
          pattern_type: string
          time_period: string
        }
        Insert: {
          analysis_date?: string | null
          confidence_score?: number | null
          id?: number
          pattern_data: string
          pattern_type: string
          time_period: string
        }
        Update: {
          analysis_date?: string | null
          confidence_score?: number | null
          id?: number
          pattern_data?: string
          pattern_type?: string
          time_period?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const