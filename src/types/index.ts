export interface Entry {
  id: number;
  content: string;
  project_tag?: string;
  person_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  effort_tag?: string;
  importance_tag?: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 创建Entry时的类型，某些字段可以是可选的
export interface CreateEntry {
  content: string;
  project_tag?: string;
  person_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  effort_tag?: string;
  importance_tag?: number;
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




// 主页 Tab 枚举/常量，统一命名规范，避免不一致
export const HomeTabs = {
  RECORDS: 'records',
  AI_INSIGHTS: 'ai-insights',
  KNOWLEDGE: 'knowledge',
  EXPORT: 'export',
  CONFIG: 'config',
} as const;
export type HomeTab = typeof HomeTabs[keyof typeof HomeTabs];

// AI 洞察内部 Tab
export const AIInsightsTabs = {
  ANALYSIS: 'analysis',
  REPORT: 'report',
  INSIGHTS: 'insights',
} as const;
export type AIInsightsTab = typeof AIInsightsTabs[keyof typeof AIInsightsTabs];


// 数据导出内部 Tab（导出/完整性）
export const DataExportTabs = {
  EXPORT: 'export',
  INTEGRITY: 'integrity',
} as const;
export type DataExportTab = typeof DataExportTabs[keyof typeof DataExportTabs];

// 导出行为追踪相关类型
export * from './behavior';