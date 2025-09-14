/**
 * 用户行为追踪相关的类型定义
 * 这些类型用于构建用户的认知模型和行为模式分析
 */

// 用户行为事件类型
export type BehaviorEventType = 
  | 'page_view'          // 页面访问
  | 'content_create'     // 内容创建
  | 'content_edit'       // 内容编辑
  | 'content_delete'     // 内容删除
  | 'ai_interaction'     // AI功能交互
  | 'tag_usage'          // 标签使用
  | 'focus_session'      // 专注会话
  | 'idle_time'          // 空闲时间
  | 'recommendation_interaction'; // 推荐交互

// 用户行为事件
export interface BehaviorEvent {
  id: number;
  event_type: BehaviorEventType;
  event_data: string;  // JSON字符串形式的事件数据
  context: string;     // JSON字符串形式的上下文
  timestamp: string;
  session_id: string;
  duration_ms?: number;  // 事件持续时间（毫秒）
}

// 行为上下文信息
export interface BehaviorContext {
  page_url?: string;           // 当前页面URL
  viewport_size?: {            // 视口大小
    width: number;
    height: number;
  };
  time_of_day: number;         // 一天中的小时数 (0-23)
  day_of_week: number;         // 一周中的天数 (0-6, 0=周日)
  user_agent?: string;         // 用户代理信息
  referrer?: string;           // 来源页面
  scroll_position?: number;    // 滚动位置
  active_tab_time?: number;    // 活跃标签页时间
  [key: string]: unknown;      // 索引签名以支持动态属性
}

// 用户行为模式
export interface BehaviorPattern {
  id: number;
  pattern_type: 'temporal' | 'content' | 'interaction' | 'productivity';
  pattern_name: string;
  pattern_data: {
    description: string;
    frequency: number;          // 出现频率
    confidence: number;         // 置信度 (0-1)
    time_patterns?: TimePeriod[]; // 时间模式
    content_patterns?: ContentPattern[]; // 内容模式
    triggers?: string[];        // 触发条件
    outcomes?: string[];        // 结果影响
  };
  discovered_at: string;
  last_seen: string;
  strength: number;  // 模式强度 (0-1)
  is_active: boolean;
}

// 时间周期模式
export interface TimePeriod {
  start_hour: number;
  end_hour: number;
  days_of_week: number[];  // 0-6, 0=周日
  frequency: number;       // 在此时间段的活动频率
}

// 内容模式
export interface ContentPattern {
  topic: string;
  keywords: string[];
  importance_range: [number, number];  // 重要度范围
  project_tags: string[];
  person_tags: string[];
  content_length_range: [number, number];  // 内容长度范围
}

// 用户认知画像
export interface CognitiveProfile {
  user_id: string;
  profile_data: {
    // 工作习惯
    work_patterns: {
      peak_hours: number[];              // 高效时段
      preferred_session_length: number;  // 偏好的工作时长(分钟)
      break_frequency: number;           // 休息频率(每小时)
      multitasking_tendency: number;     // 多任务倾向 (0-1)
    };
    
    // 信息处理偏好
    information_processing: {
      reading_speed: number;             // 阅读速度(字/分钟)
      preferred_content_length: number;  // 偏好内容长度
      visual_vs_text_preference: number; // 视觉vs文本偏好 (-1到1)
      detail_orientation: number;        // 细节导向度 (0-1)
    };
    
    // 决策模式
    decision_making: {
      decision_speed: 'fast' | 'deliberate' | 'variable';
      information_seeking: number;       // 信息寻求倾向 (0-1)
      risk_tolerance: number;           // 风险承受度 (0-1)
      collaboration_preference: number; // 协作偏好 (0-1)
    };
    
    // 兴趣演化
    interest_evolution: {
      current_topics: TopicInterest[];
      emerging_interests: string[];
      declining_interests: string[];
      stability_score: number;  // 兴趣稳定性 (0-1)
    };
    
    // 认知负荷
    cognitive_load: {
      average_daily_entries: number;
      information_density_preference: number;  // 信息密度偏好
      context_switching_frequency: number;     // 上下文切换频率
      optimal_complexity_level: number;        // 最佳复杂度水平
    };
  };
  
  confidence_score: number;  // 画像准确性 (0-1)
  created_at: string;
  last_updated: string;
}

// 主题兴趣
export interface TopicInterest {
  topic: string;
  interest_level: number;    // 兴趣程度 (0-1)
  engagement_trend: 'rising' | 'stable' | 'declining';
  first_appeared: string;
  last_activity: string;
  related_entries_count: number;
}

// 推荐上下文
export interface RecommendationContext {
  current_time: string;
  current_activity?: string;
  recent_entries: number[];     // 最近的条目ID
  current_focus?: string;       // 当前关注点
  energy_level?: 'high' | 'medium' | 'low';
  available_time?: number;      // 可用时间(分钟)
  location?: string;
  mood_indicators?: string[];   // 情绪指标
}

// 推荐项目
export interface RecommendationItem {
  id: string;
  type: 'related_content' | 'suggested_action' | 'insight' | 'reminder';
  title: string;
  description: string;
  content?: Record<string, unknown>;
  confidence: number;          // 推荐置信度 (0-1)
  relevance_score: number;     // 相关性评分 (0-1)
  timing_score: number;        // 时机评分 (0-1)
  reasoning: string;           // 推荐理由
  expected_value: number;      // 预期价值 (0-1)
  effort_required: 'low' | 'medium' | 'high';
  created_at: string;
  expires_at?: string;
  user_feedback?: 'positive' | 'negative' | 'neutral';
}

// 知识关联
export interface KnowledgeRelationship {
  id: string;
  source_entry_id: number;
  target_entry_id: number;
  relationship_type: 'semantic' | 'temporal' | 'causal' | 'categorical' | 'contextual';
  strength: number;            // 关联强度 (0-1)
  confidence: number;          // 置信度 (0-1)
  discovered_by: 'user' | 'ai' | 'algorithm';
  evidence: {
    common_keywords?: string[];
    semantic_similarity?: number;
    temporal_proximity?: number;
    context_overlap?: number;
    user_confirmations?: number;
  };
  created_at: string;
  last_validated: string;
  is_active: boolean;
}

// 洞察发现
export interface Insight {
  id: string;
  insight_type: 'pattern' | 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  evidence: InsightEvidence;
  confidence: number;          // 置信度 (0-1)
  impact_level: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggested_actions?: string[];
  related_entries: number[];
  created_at: string;
  acknowledged_at?: string;
  user_rating?: number;        // 用户评分 (1-5)
}

// 洞察证据
export interface InsightEvidence {
  data_points: number;         // 支撑数据点数量
  time_span: string;          // 时间跨度
  statistical_significance?: number;
  examples?: string[];
  visualizations?: {
    chart_type: string;
    chart_data: Record<string, unknown>;
  }[];
}

// 会话管理
export interface UserSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  event_count: number;
  page_views: number;
  interactions: number;
  focus_time_ms: number;      // 实际专注时间
  idle_time_ms: number;       // 空闲时间
  productivity_score?: number; // 生产力评分 (0-1)
  session_quality: 'high' | 'medium' | 'low';
  key_achievements?: string[]; // 关键成就
}

// 性能指标
export interface PerformanceMetrics {
  date: string;
  metrics: {
    total_entries: number;
    total_time_spent_ms: number;
    average_session_length_ms: number;
    focus_ratio: number;              // 专注时间比例
    productivity_score: number;       // 整体生产力评分
    goal_completion_rate: number;     // 目标完成率
    information_retention_score: number; // 信息保留评分
    creativity_indicators: number;    // 创造力指标
    stress_indicators: number;        // 压力指标
  };
}