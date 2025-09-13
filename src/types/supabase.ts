// 更新的 Supabase 类型定义 - 包含 todos 表
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          title: string
          content: string | null
          completed: number | null
          priority: number | null
          due_date: string | null
          category: string | null
          tags: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          title: string
          content?: string | null
          completed?: number | null
          priority?: number | null
          due_date?: string | null
          category?: string | null
          tags?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          completed?: number | null
          priority?: number | null
          due_date?: string | null
          category?: string | null
          tags?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      entries: {
        Row: {
          id: number
          content: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          content: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          content?: string
          created_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
