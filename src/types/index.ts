export interface Entry {
  id: number;
  content: string;
  project_tag?: string;
  person_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  effort_tag?: string;
  resource_consumption_tag?: string;
  importance_tag?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProjectStats {
  project_tag: string;
  count: number;
}

export interface PersonStats {
  person_tag: string;
  count: number;
}

export interface AIInsight {
  id: number;
  insight_type: string;
  title: string;
  content: string;
  data_source?: string;
  confidence_score: number;
  created_at: string;
  valid_until?: string;
  is_active: boolean;
}

export interface WorkPattern {
  id: number;
  pattern_type: string;
  time_period: string;
  pattern_data: string;
  analysis_date: string;
  confidence_score: number;
}

export interface WorkAnalysis {
  peakHours: Array<{hour: number, count: number}>;
  projectDistribution: Array<{project: string, count: number, percentage: number}>;
  importanceDistribution: Array<{importance: number, count: number, percentage: number}>;
  weeklyPattern: Array<{day: string, count: number}>;
  productivity_insights: string[];
}

export interface KnowledgeDocument {
  id: number;
  document_type: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeDocument {
  document_type: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string;
  priority?: number;
}

// Todo相关类型定义
export interface Todo {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  project_tag?: string;
  weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  sort_order: number;
}

export interface CreateTodo {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  project_tag?: string;
  weekday?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}

export interface TodoStats {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  completion_rate: number;
  by_priority: {
    high: number;
    medium: number;
    low: number;
  };
}

// 搜索相关类型定义
export interface SearchResult {
  entries: Entry[];
  totalCount: number;
  searchTime: number;
  searchTerms: string[];
  suggestions: string[];
}

export interface SearchItemResult {
  id: number;
  content: string;
  project_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  created_at: string;
  relevanceScore: number;
  matchedTerms: string[];
  highlightedContent: string;
}

// 导出行为追踪相关类型
export * from './behavior';