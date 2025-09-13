// Supabase 数据库类型定义
export interface Database {
  public: {
    Tables: {
      entries: {
        Row: {
          id: number;
          content: string;
          project_tag: string | null;
          effort_tag: string | null;
          sort_order: number | null;
          daily_report_tag: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          content: string;
          project_tag?: string | null;
          effort_tag?: string | null;
          sort_order?: number | null;
          daily_report_tag?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          content?: string;
          project_tag?: string | null;
          effort_tag?: string | null;
          sort_order?: number | null;
          daily_report_tag?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          estimated_hours: number | null;
          actual_hours: number | null;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          assignee: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          estimated_hours?: number | null;
          actual_hours?: number | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          assignee?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          estimated_hours?: number | null;
          actual_hours?: number | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          assignee?: string | null;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          title: string;
          messages: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          messages: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          messages?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_base: {
        Row: {
          id: number;
          document_type: string;
          title: string;
          content: string;
          summary: string | null;
          keywords: string | null;
          priority: number | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          document_type: string;
          title: string;
          content: string;
          summary?: string | null;
          keywords?: string | null;
          priority?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          document_type?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          keywords?: string | null;
          priority?: number | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_behavior_events: {
        Row: {
          id: number;
          event_type: string;
          event_data: string;
          context: string;
          timestamp: string;
          session_id: string;
          duration_ms: number | null;
        };
        Insert: {
          id?: number;
          event_type: string;
          event_data: string;
          context: string;
          timestamp?: string;
          session_id: string;
          duration_ms?: number | null;
        };
        Update: {
          id?: number;
          event_type?: string;
          event_data?: string;
          context?: string;
          timestamp?: string;
          session_id?: string;
          duration_ms?: number | null;
        };
      };
      ai_insights: {
        Row: {
          id: number;
          insight_type: string;
          title: string;
          content: string;
          data_source: string | null;
          confidence_score: number | null;
          created_at: string;
          valid_until: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: number;
          insight_type: string;
          title: string;
          content: string;
          data_source?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          valid_until?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: number;
          insight_type?: string;
          title?: string;
          content?: string;
          data_source?: string | null;
          confidence_score?: number | null;
          created_at?: string;
          valid_until?: string | null;
          is_active?: boolean | null;
        };
      };
      work_patterns: {
        Row: {
          id: number;
          pattern_type: string;
          time_period: string;
          pattern_data: string;
          analysis_date: string;
          confidence_score: number | null;
        };
        Insert: {
          id?: number;
          pattern_type: string;
          time_period: string;
          pattern_data: string;
          analysis_date?: string;
          confidence_score?: number | null;
        };
        Update: {
          id?: number;
          pattern_type?: string;
          time_period?: string;
          pattern_data?: string;
          analysis_date?: string;
          confidence_score?: number | null;
        };
      };
      behavior_patterns: {
        Row: {
          id: number;
          pattern_type: string;
          pattern_name: string;
          pattern_data: string;
          discovered_at: string;
          last_seen: string;
          strength: number | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: number;
          pattern_type: string;
          pattern_name: string;
          pattern_data: string;
          discovered_at?: string;
          last_seen?: string;
          strength?: number | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: number;
          pattern_type?: string;
          pattern_name?: string;
          pattern_data?: string;
          discovered_at?: string;
          last_seen?: string;
          strength?: number | null;
          is_active?: boolean | null;
        };
      };
      cognitive_profiles: {
        Row: {
          user_id: string;
          profile_data: string;
          confidence_score: number | null;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          profile_data: string;
          confidence_score?: number | null;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          profile_data?: string;
          confidence_score?: number | null;
          last_updated?: string;
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          content: string | null;
          confidence: number;
          relevance_score: number;
          timing_score: number;
          reasoning: string;
          expected_value: number | null;
          effort_required: string | null;
          created_at: string;
          expires_at: string | null;
          user_feedback: string | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description: string;
          content?: string | null;
          confidence: number;
          relevance_score: number;
          timing_score: number;
          reasoning: string;
          expected_value?: number | null;
          effort_required?: string | null;
          created_at?: string;
          expires_at?: string | null;
          user_feedback?: string | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string;
          content?: string | null;
          confidence?: number;
          relevance_score?: number;
          timing_score?: number;
          reasoning?: string;
          expected_value?: number | null;
          effort_required?: string | null;
          created_at?: string;
          expires_at?: string | null;
          user_feedback?: string | null;
          is_active?: boolean | null;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          parent_id: string | null;
          path: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          parent_id?: string | null;
          path: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          parent_id?: string | null;
          path?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          content: string;
          category: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          content?: string;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_history: {
        Row: {
          id: number;
          query: string;
          results_count: number | null;
          search_type: string | null;
          user_session: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          query: string;
          results_count?: number | null;
          search_type?: string | null;
          user_session?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          query?: string;
          results_count?: number | null;
          search_type?: string | null;
          user_session?: string | null;
          created_at?: string;
        };
      };
      knowledge_relationships: {
        Row: {
          id: string;
          source_entry_id: number;
          target_entry_id: number;
          relationship_type: string;
          strength: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_entry_id: number;
          target_entry_id: number;
          relationship_type: string;
          strength?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_entry_id?: number;
          target_entry_id?: number;
          relationship_type?: string;
          strength?: number | null;
          created_at?: string;
        };
      };
      okrs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'objective' | 'key_result';
          parent_id: string | null;
          target_value: number | null;
          current_value: number | null;
          unit: string | null;
          due_date: string | null;
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: 'objective' | 'key_result';
          parent_id?: string | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          due_date?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'objective' | 'key_result';
          parent_id?: string | null;
          target_value?: number | null;
          current_value?: number | null;
          unit?: string | null;
          due_date?: string | null;
          status?: 'draft' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}