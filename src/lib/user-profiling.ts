/**
 * 用户画像生成和管理系统
 * 基于行为数据构建用户的认知画像和工作模式
 */

import { db } from './db';
import { 
  CognitiveProfile, 
  BehaviorEvent, 
  TopicInterest,
  PerformanceMetrics 
} from '@/types/behavior';

// 类型定义
interface ParsedEventData {
  contentLength?: number;
  content_length?: number;
  projectTag?: string;
  project_tag?: string;
  personTag?: string;
  person_tag?: string;
  interaction_type?: string;
}

interface ParsedContext {
  time_of_day?: number;
  day_of_week?: number;
}

// 获取用户行为数据
function getUserBehaviorEvents(days: number = 30): BehaviorEvent[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db.prepare(`
    SELECT * FROM user_behavior_events 
    WHERE timestamp > ?
    ORDER BY timestamp DESC
  `).all(startDate.toISOString()) as BehaviorEvent[];
}

// 解析事件数据
function parseEventData(event: BehaviorEvent): ParsedEventData {
  try {
    const parsed = typeof event.event_data === 'string' 
      ? JSON.parse(event.event_data) 
      : event.event_data as Record<string, unknown>;
    return parsed as ParsedEventData;
  } catch {
    return {};
  }
}

// 解析上下文数据
function parseContext(event: BehaviorEvent): ParsedContext {
  try {
    const parsed = typeof event.context === 'string' 
      ? JSON.parse(event.context) 
      : event.context as Record<string, unknown>;
    return parsed as ParsedContext;
  } catch {
    return {};
  }
}

/**
 * 分析工作时间模式
 */
function analyzeWorkPatterns(events: BehaviorEvent[]) {
  const hourlyActivity: { [hour: number]: number } = {};
  const sessionData: { [sessionId: string]: BehaviorEvent[] } = {};
  
  // 统计每小时活动和会话数据
  events.forEach(event => {
    const context = parseContext(event);
    const hour = context.time_of_day || new Date(event.timestamp).getHours();
    
    hourlyActivity[hour as number] = (hourlyActivity[hour as number] || 0) + 1;
    
    if (!sessionData[event.session_id]) {
      sessionData[event.session_id] = [];
    }
    sessionData[event.session_id].push(event);
  });

  // 计算高峰时段
  const peakHours = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // 计算会话长度
  const sessionLengths = Object.values(sessionData).map(sessionEvents => {
    if (sessionEvents.length < 2) return 0;
    
    const sorted = sessionEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const start = new Date(sorted[0].timestamp).getTime();
    const end = new Date(sorted[sorted.length - 1].timestamp).getTime();
    return end - start;
  }).filter(length => length > 60000); // 至少1分钟的会话

  const averageSessionLength = sessionLengths.length > 0 
    ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length 
    : 0;

  // 分析多任务倾向
  const contextSwitches = events.filter((event, index) => {
    if (index === 0) return false;
    const prevData = parseEventData(events[index - 1]);
    const currData = parseEventData(event);
    return prevData.project_tag !== currData.project_tag;
  }).length;

  const multitaskingTendency = events.length > 0 ? contextSwitches / events.length : 0;

  return {
    peak_hours: peakHours,
    preferred_session_length: Math.round(averageSessionLength / 60000), // 转换为分钟
    break_frequency: sessionLengths.length > 0 ? 60 / (averageSessionLength / 60000) : 1,
    multitasking_tendency: Math.min(multitaskingTendency, 1)
  };
}

/**
 * 分析信息处理偏好
 */
function analyzeInformationProcessing(events: BehaviorEvent[]) {
  const contentEvents = events.filter(e => 
    e.event_type === 'content_create' || e.event_type === 'content_edit'
  );

  const searchEvents = events.filter(e => e.event_type === 'search_query');
  const aiEvents = events.filter(e => e.event_type === 'ai_interaction');

  // 分析内容长度偏好
  const contentLengths = contentEvents.map(event => {
    const data = parseEventData(event);
    const length = data.contentLength || data.content_length;
    return typeof length === 'number' ? length : 0;
  }).filter(length => length > 0);

  const averageContentLength = contentLengths.length > 0 
    ? contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length 
    : 200;

  // 分析阅读速度（基于会话时长和内容量）
  const estimatedReadingSpeed = Math.max(150, Math.min(300, averageContentLength * 2));

  // 分析视觉vs文本偏好（基于AI交互类型）
  const visualInteractions = aiEvents.filter(event => {
    const data = parseEventData(event);
    return data.interaction_type === 'generate_questions' || 
           data.interaction_type === 'text_polish';
  }).length;

  const visualPreference = aiEvents.length > 0 
    ? (visualInteractions / aiEvents.length) * 2 - 1 // 转换为-1到1的范围
    : 0;

  // 分析细节导向度（基于搜索频率和内容编辑）
  const editEvents = events.filter(e => e.event_type === 'content_edit');
  const detailOrientation = contentEvents.length > 0 
    ? Math.min(1, (editEvents.length + searchEvents.length) / contentEvents.length)
    : 0.5;

  return {
    reading_speed: estimatedReadingSpeed,
    preferred_content_length: Math.round(averageContentLength),
    visual_vs_text_preference: Math.round(visualPreference * 100) / 100,
    detail_orientation: Math.round(detailOrientation * 100) / 100
  };
}

/**
 * 分析决策模式
 */
function analyzeDecisionMaking(events: BehaviorEvent[]) {
  const contentEvents = events.filter(e => e.event_type === 'content_create');
  const editEvents = events.filter(e => e.event_type === 'content_edit');
  const searchEvents = events.filter(e => e.event_type === 'search_query');
  
  // 决策速度（基于编辑频率）
  const editRatio = contentEvents.length > 0 ? editEvents.length / contentEvents.length : 0;
  const decisionSpeed = editRatio < 0.3 ? 'fast' : 
                       editRatio < 0.7 ? 'deliberate' : 'variable';

  // 信息寻求倾向（基于搜索频率）
  const informationSeeking = Math.min(1, searchEvents.length / Math.max(1, contentEvents.length));

  // 风险承受度（基于AI使用频率）
  const aiEvents = events.filter(e => e.event_type === 'ai_interaction');
  const riskTolerance = Math.min(1, aiEvents.length / Math.max(1, events.length * 0.5));

  // 协作偏好（基于人物标签使用）
  const personTagEvents = events.filter(event => {
    const data = parseEventData(event);
    return data.person_tag || data.personTag;
  });
  const collaborationPreference = Math.min(1, personTagEvents.length / Math.max(1, contentEvents.length));

  return {
    decision_speed: decisionSpeed as 'fast' | 'deliberate' | 'variable',
    information_seeking: Math.round(informationSeeking * 100) / 100,
    risk_tolerance: Math.round(riskTolerance * 100) / 100,
    collaboration_preference: Math.round(collaborationPreference * 100) / 100
  };
}

/**
 * 分析兴趣演化
 */
function analyzeInterestEvolution(events: BehaviorEvent[]): TopicInterest[] {
  const contentEvents = events.filter(e => 
    e.event_type === 'content_create' || e.event_type === 'content_edit'
  );

  const projectInterests: { [project: string]: {
    count: number;
    firstSeen: string;
    lastSeen: string;
    recentActivity: number;
  } } = {};

  contentEvents.forEach(event => {
    const data = parseEventData(event);
    const project = data.project_tag || data.projectTag || '未分类';
    const eventDate = new Date(event.timestamp);
    const recentDays = 7;
    const isRecent = (Date.now() - eventDate.getTime()) < (recentDays * 24 * 60 * 60 * 1000);

    if (!projectInterests[project as string]) {
      projectInterests[project as string] = {
        count: 0,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        recentActivity: 0
      };
    }

    projectInterests[project as string].count++;
    if (eventDate.getTime() < new Date(projectInterests[project as string].firstSeen).getTime()) {
      projectInterests[project as string].firstSeen = event.timestamp;
    }
    if (eventDate.getTime() > new Date(projectInterests[project as string].lastSeen).getTime()) {
      projectInterests[project as string].lastSeen = event.timestamp;
    }
    if (isRecent) {
      projectInterests[project as string].recentActivity++;
    }
  });

  return Object.entries(projectInterests).map(([topic, data]) => {
    const totalEvents = contentEvents.length;
    const interestLevel = Math.min(1, data.count / Math.max(1, totalEvents * 0.1));
    
    // 判断趋势
    const recentRatio = data.recentActivity / Math.max(1, data.count);
    const engagementTrend = recentRatio > 0.6 ? 'rising' :
                          recentRatio > 0.3 ? 'stable' : 'declining';

    return {
      topic,
      interest_level: Math.round(interestLevel * 100) / 100,
      engagement_trend: engagementTrend as 'rising' | 'stable' | 'declining',
      first_appeared: data.firstSeen,
      last_activity: data.lastSeen,
      related_entries_count: data.count
    };
  }).sort((a, b) => b.interest_level - a.interest_level);
}

/**
 * 分析认知负荷
 */
function analyzeCognitiveLoad(events: BehaviorEvent[]) {
  const contentEvents = events.filter(e => e.event_type === 'content_create');
  const dailyEntries: { [date: string]: number } = {};
  
  // 统计每日条目数
  contentEvents.forEach(event => {
    const date = event.timestamp.split('T')[0];
    dailyEntries[date] = (dailyEntries[date] || 0) + 1;
  });

  const dailyCounts = Object.values(dailyEntries);
  const averageDailyEntries = dailyCounts.length > 0 
    ? dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length 
    : 0;

  // 信息密度偏好（基于内容长度分布）
  const contentLengths = contentEvents.map(event => {
    const data = parseEventData(event);
    const length = data.contentLength || data.content_length;
    return typeof length === 'number' ? length : 0;
  }).filter(length => length > 0);

  const avgContentLength = contentLengths.length > 0 
    ? contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length 
    : 200;

  const informationDensityPreference = Math.min(1, avgContentLength / 500);

  // 上下文切换频率（基于项目标签变化）
  const projectSwitches = events.filter((event, index) => {
    if (index === 0) return false;
    const prevData = parseEventData(events[index - 1]);
    const currData = parseEventData(event);
    return prevData.project_tag !== currData.project_tag;
  }).length;

  const contextSwitchingFrequency = events.length > 0 ? projectSwitches / events.length : 0;

  // 最佳复杂度水平（综合评估）
  const complexityIndicators = [
    Math.min(1, averageDailyEntries / 10), // 日产出能力
    informationDensityPreference,           // 信息密度偏好
    1 - contextSwitchingFrequency          // 专注度
  ];
  
  const optimalComplexityLevel = complexityIndicators.reduce((a, b) => a + b, 0) / complexityIndicators.length;

  return {
    average_daily_entries: Math.round(averageDailyEntries * 10) / 10,
    information_density_preference: Math.round(informationDensityPreference * 100) / 100,
    context_switching_frequency: Math.round(contextSwitchingFrequency * 100) / 100,
    optimal_complexity_level: Math.round(optimalComplexityLevel * 100) / 100
  };
}

/**
 * 生成完整的认知画像
 */
export async function generateUserProfile(): Promise<CognitiveProfile | null> {
  const events = getUserBehaviorEvents(30);
  
  if (events.length < 5) {
    return null; // 数据不足
  }

  const workPatterns = analyzeWorkPatterns(events);
  const informationProcessing = analyzeInformationProcessing(events);
  const decisionMaking = analyzeDecisionMaking(events);
  const interestEvolution = analyzeInterestEvolution(events);
  const cognitiveLoad = analyzeCognitiveLoad(events);

  // 计算兴趣稳定性
  const stabilityScore = interestEvolution.length > 0 
    ? interestEvolution.filter(interest => interest.engagement_trend === 'stable').length / interestEvolution.length
    : 0.5;

  const profile: CognitiveProfile = {
    user_id: 'default',
    profile_data: {
      work_patterns: workPatterns,
      information_processing: informationProcessing,
      decision_making: decisionMaking,
      interest_evolution: {
        current_topics: interestEvolution.slice(0, 5),
        emerging_interests: interestEvolution
          .filter(t => t.engagement_trend === 'rising')
          .map(t => t.topic)
          .slice(0, 3),
        declining_interests: interestEvolution
          .filter(t => t.engagement_trend === 'declining')
          .map(t => t.topic)
          .slice(0, 3),
        stability_score: Math.round(stabilityScore * 100) / 100
      },
      cognitive_load: cognitiveLoad
    },
    confidence_score: Math.min(1, events.length / 100), // 基于数据量
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  return profile;
}

/**
 * 保存用户画像到数据库
 */
export function saveUserProfile(profile: CognitiveProfile): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO cognitive_profiles 
    (user_id, profile_data, confidence_score, last_updated, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    profile.user_id,
    JSON.stringify(profile.profile_data),
    profile.confidence_score,
    profile.last_updated,
    profile.created_at
  );
}

/**
 * 获取用户画像
 */
export function getUserProfile(): CognitiveProfile | null {
  const result = db.prepare(`
    SELECT * FROM cognitive_profiles WHERE user_id = ?
  `).get('default') as { user_id: string; profile_data: string; confidence_score: number; last_updated: string; created_at: string } | undefined;

  if (!result) return null;

  return {
    user_id: result.user_id,
    profile_data: JSON.parse(result.profile_data),
    confidence_score: result.confidence_score,
    last_updated: result.last_updated,
    created_at: result.created_at
  };
}

/**
 * 生成性能指标
 */
export function generatePerformanceMetrics(days: number = 7): PerformanceMetrics {
  const events = getUserBehaviorEvents(days);
  const contentEvents = events.filter(e => e.event_type === 'content_create');
  const sessions = new Map<string, BehaviorEvent[]>();
  
  // 按会话分组
  events.forEach(event => {
    if (!sessions.has(event.session_id)) {
      sessions.set(event.session_id, []);
    }
    sessions.get(event.session_id)!.push(event);
  });

  // 计算会话时长
  const sessionLengths = Array.from(sessions.values()).map(sessionEvents => {
    if (sessionEvents.length < 2) return 0;
    
    const sorted = sessionEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const start = new Date(sorted[0].timestamp).getTime();
    const end = new Date(sorted[sorted.length - 1].timestamp).getTime();
    return end - start;
  }).filter(length => length > 0);

  const totalTimeSpent = sessionLengths.reduce((a, b) => a + b, 0);
  const averageSessionLength = sessionLengths.length > 0 
    ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length 
    : 0;

  // 计算专注比例（假设长会话表示专注）
  const focusThreshold = 15 * 60 * 1000; // 15分钟
  const focusTime = sessionLengths
    .filter(length => length > focusThreshold)
    .reduce((a, b) => a + b, 0);
  const focusRatio = totalTimeSpent > 0 ? focusTime / totalTimeSpent : 0;

  // 生产力评分（综合多个因素）
  const productivityFactors = [
    Math.min(1, contentEvents.length / (days * 2)), // 日均产出
    focusRatio,                                     // 专注度
    Math.min(1, sessionLengths.length / days)       // 活跃度
  ];
  const productivityScore = productivityFactors.reduce((a, b) => a + b, 0) / productivityFactors.length;

  return {
    date: new Date().toISOString().split('T')[0],
    metrics: {
      total_entries: contentEvents.length,
      total_time_spent_ms: totalTimeSpent,
      average_session_length_ms: averageSessionLength,
      focus_ratio: Math.round(focusRatio * 1000) / 1000,
      productivity_score: Math.round(productivityScore * 1000) / 1000,
      goal_completion_rate: 0.8, // 暂时使用固定值
      information_retention_score: 0.75, // 暂时使用固定值
      creativity_indicators: Math.min(1, events.filter(e => e.event_type === 'ai_interaction').length / Math.max(1, contentEvents.length)),
      stress_indicators: Math.max(0, Math.min(1, (sessionLengths.filter(l => l < 5 * 60 * 1000).length) / Math.max(1, sessionLengths.length)))
    }
  };
}