import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 数据库表类型定义
export interface Entry {
  id: number
  content: string
  project_tag?: string
  created_at: string
  updated_at: string
  effort_tag?: string
  sort_order?: number
  daily_report_tag?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  assignee?: string
}

export interface Subtask {
  id: string
  task_id: string
  title: string
  completed: boolean
  created_at: string
}

export interface AIInsight {
  id: number
  insight_type: string
  title: string
  content: string
  data_source?: string
  confidence_score?: number
  created_at: string
  valid_until?: string
  is_active?: boolean
}

export interface WorkPattern {
  id: number
  pattern_type: string
  time_period: string
  pattern_data: string
  analysis_date: string
  confidence_score?: number
}

export interface KnowledgeBase {
  id: number
  document_type: string
  title: string
  content: string
  summary?: string
  keywords?: string
  priority?: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface UserBehaviorEvent {
  id: number
  event_type: string
  event_data: string
  context: string
  timestamp: string
  session_id: string
  duration_ms?: number
}

export interface BehaviorPattern {
  id: number
  pattern_type: string
  pattern_name: string
  pattern_data: string
  discovered_at: string
  last_seen: string
  strength?: number
  is_active?: boolean
}

export interface CognitiveProfile {
  user_id: string
  profile_data: string
  confidence_score?: number
  last_updated: string
  created_at: string
}

export interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  content?: string
  confidence: number
  relevance_score: number
  timing_score: number
  reasoning: string
  expected_value?: number
  effort_required?: string
  created_at: string
  expires_at?: string
  user_feedback?: string
  is_active?: boolean
}

export interface KnowledgeRelationship {
  id: string
  source_entry_id: number
  target_entry_id: number
  relationship_type: string
  strength?: number
  created_at: string
}