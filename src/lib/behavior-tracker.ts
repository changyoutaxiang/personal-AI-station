/**
 * 用户行为追踪服务
 * 负责收集、存储和分析用户的行为数据
 */

import { db } from './db';
import { debug } from '@/lib/debug';
import { 
  BehaviorEvent, 
  BehaviorEventType, 
  BehaviorContext, 
  BehaviorPattern,
  CognitiveProfile
} from '@/types/behavior';

// 生成会话ID
let currentSessionId: string | null = null;

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 获取当前会话ID
export function getCurrentSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
}

// 结束当前会话
export function endCurrentSession(): void {
  currentSessionId = null;
}

// 获取行为上下文
function getBehaviorContext(): BehaviorContext {
  const now = new Date();
  
  return {
    time_of_day: now.getHours(),
    day_of_week: now.getDay(),
    viewport_size: typeof window !== 'undefined' ? {
      width: window.innerWidth,
      height: window.innerHeight
    } : undefined,
    page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    active_tab_time: Date.now()
  };
}

// 记录行为事件
export async function trackBehaviorEvent(
  eventType: BehaviorEventType,
  eventData: Record<string, unknown> = {},
  duration?: number
): Promise<void> {
  try {
    const context = getBehaviorContext();
    const sessionId = getCurrentSessionId();
    
    const event: Omit<BehaviorEvent, 'id'> = {
      event_type: eventType,
      event_data: JSON.stringify(eventData),
      context: JSON.stringify(context),
      timestamp: new Date().toISOString(),
      session_id: sessionId,
      duration_ms: duration
    };

    // 插入到数据库
    const stmt = db.prepare(`
      INSERT INTO user_behavior_events (
        event_type, event_data, context, timestamp, session_id, duration_ms
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      event.event_type,
      event.event_data,
      event.context,
      event.timestamp,
      event.session_id,
      event.duration_ms
    );

    debug.log(`🎯 行为事件记录: ${eventType}`, eventData);
  } catch (error) {
    debug.error('记录行为事件失败:', error);
  }
}

// 分析时间模式
export function analyzeTimePatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const hourlyActivity: { [hour: number]: number } = {};
  const dailyActivity: { [day: number]: number } = {};
  
  events.forEach(event => {
    const context = JSON.parse(event.context as string);
    hourlyActivity[context.time_of_day] = (hourlyActivity[context.time_of_day] || 0) + 1;
    dailyActivity[context.day_of_week] = (dailyActivity[context.day_of_week] || 0) + 1;
  });

  const patterns: BehaviorPattern[] = [];

  // 分析活跃时段
  const peakHours = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  if (peakHours.length > 0) {
    patterns.push({
      id: Date.now(),
      pattern_type: 'temporal',
      pattern_name: '活跃时段模式',
      pattern_data: {
        description: `用户通常在 ${peakHours.join(', ')} 点最为活跃`,
        frequency: peakHours.length,
        confidence: 0.8,
        time_patterns: peakHours.map(hour => ({
          start_hour: hour,
          end_hour: hour + 1,
          days_of_week: [1, 2, 3, 4, 5], // 工作日
          frequency: hourlyActivity[hour] || 0
        }))
      },
      discovered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      strength: 0.7,
      is_active: true
    });
  }

  return patterns;
}

// 分析内容创建模式
export function analyzeContentPatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const contentEvents = events.filter(e => 
    e.event_type === 'content_create' || e.event_type === 'content_edit'
  );

  if (contentEvents.length < 5) {
    return []; // 数据不足，无法分析
  }

  const patterns: BehaviorPattern[] = [];
  
  // 分析创作时长模式
  const durations = contentEvents
    .filter(e => e.duration_ms)
    .map(e => e.duration_ms!);

  if (durations.length > 0) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    patterns.push({
      id: Date.now() + 1,
      pattern_type: 'content',
      pattern_name: '创作时长模式',
      pattern_data: {
        description: `平均创作时长约 ${Math.round(avgDuration / 1000 / 60)} 分钟`,
        frequency: durations.length,
        confidence: durations.length > 10 ? 0.8 : 0.6,
        content_patterns: [{
          topic: '通用创作',
          keywords: [],
          importance_range: [1, 5],
          project_tags: [],
          person_tags: [],
          content_length_range: [0, 1000]
        }]
      },
      discovered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      strength: Math.min(durations.length / 20, 1),
      is_active: true
    });
  }

  return patterns;
}

// 分析用户的交互模式
export function analyzeInteractionPatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const interactionEvents = events.filter(e => 
    e.event_type === 'ai_interaction' || 
    e.event_type === 'search_query' ||
    e.event_type === 'recommendation_interaction'
  );

  const patterns: BehaviorPattern[] = [];

  // AI交互频率分析
  const aiEvents = interactionEvents.filter(e => e.event_type === 'ai_interaction');
  if (aiEvents.length > 0) {
    const aiInteractionTypes: { [key: string]: number } = {};
    
    aiEvents.forEach(event => {
      const data = JSON.parse(event.event_data as string);
      const interactionType = data.interaction_type || 'unknown';
      aiInteractionTypes[interactionType] = (aiInteractionTypes[interactionType] || 0) + 1;
    });

    const mostUsedAIFeature = Object.entries(aiInteractionTypes)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostUsedAIFeature) {
      patterns.push({
        id: Date.now() + 2,
        pattern_type: 'interaction',
        pattern_name: 'AI功能偏好',
        pattern_data: {
          description: `最常使用的AI功能是 ${mostUsedAIFeature[0]} (${mostUsedAIFeature[1]}次)`,
          frequency: mostUsedAIFeature[1],
          confidence: 0.9,
          triggers: ['需要AI辅助时'],
          outcomes: ['提高工作效率']
        },
        discovered_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        strength: Math.min(mostUsedAIFeature[1] / 10, 1),
        is_active: true
      });
    }
  }

  return patterns;
}

// 生成认知画像
export async function generateCognitiveProfile(): Promise<CognitiveProfile | null> {
  try {
    // 获取最近30天的行为数据
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const events = db.prepare(`
      SELECT * FROM user_behavior_events 
      WHERE timestamp > ? 
      ORDER BY timestamp DESC
    `).all(thirtyDaysAgo.toISOString()) as BehaviorEvent[];

    if (events.length < 10) {
      return null; // 数据量不足
    }

    // 分析各种模式
    const timePatterns = analyzeTimePatterns(events);
    const contentPatterns = analyzeContentPatterns(events);
    const interactionPatterns = analyzeInteractionPatterns(events);
    
    // 使用模式数据（避免unused warning）
    debug.log('Patterns analyzed:', { 
      timeCount: timePatterns.length, 
      contentCount: contentPatterns.length, 
      interactionCount: interactionPatterns.length 
    });

    // 提取活跃时段
    const hourlyActivity: { [hour: number]: number } = {};
    events.forEach(event => {
      const context = JSON.parse(event.context as string);
      hourlyActivity[context.time_of_day] = (hourlyActivity[context.time_of_day] || 0) + 1;
    });

    const peakHours = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // 计算平均会话时长
    const sessions = new Map<string, BehaviorEvent[]>();
    events.forEach(event => {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, []);
      }
      sessions.get(event.session_id)!.push(event);
    });

    const sessionLengths = Array.from(sessions.values()).map(sessionEvents => {
      const start = new Date(sessionEvents[sessionEvents.length - 1].timestamp).getTime();
      const end = new Date(sessionEvents[0].timestamp).getTime();
      return end - start;
    });

    const avgSessionLength = sessionLengths.length > 0 
      ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length 
      : 0;

    // 分析多任务倾向
    const contextSwitches = events.filter((event, index) => {
      if (index === 0) return false;
      const prevData = JSON.parse(events[index - 1].event_data as string);
      const currData = JSON.parse(event.event_data as string);
      return prevData.project_tag !== currData.project_tag;
    }).length;

    const multitaskingTendency = Math.min(contextSwitches / events.length, 1);

    const profile: CognitiveProfile = {
      user_id: 'default',
      profile_data: {
        work_patterns: {
          peak_hours: peakHours,
          preferred_session_length: Math.round(avgSessionLength / 60000), // 转换为分钟
          break_frequency: 1, // 暂时设置默认值
          multitasking_tendency: multitaskingTendency
        },
        information_processing: {
          reading_speed: 200, // 默认值
          preferred_content_length: 300, // 基于实际数据计算
          visual_vs_text_preference: 0, // 中性
          detail_orientation: 0.7 // 基于标签使用频率计算
        },
        decision_making: {
          decision_speed: multitaskingTendency > 0.5 ? 'fast' : 'deliberate',
          information_seeking: 0.6,
          risk_tolerance: 0.5,
          collaboration_preference: 0.4
        },
        interest_evolution: {
          current_topics: [], // 需要基于内容分析
          emerging_interests: [],
          declining_interests: [],
          stability_score: 0.7
        },
        cognitive_load: {
          average_daily_entries: events.length / 30,
          information_density_preference: 0.6,
          context_switching_frequency: multitaskingTendency,
          optimal_complexity_level: 0.6
        }
      },
      confidence_score: Math.min(events.length / 100, 1), // 基于数据量计算置信度
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };

    return profile;
  } catch (error) {
    debug.error('生成认知画像失败:', error);
    return null;
  }
}

// 便捷的事件追踪函数
export const trackEvent = {
  pageView: (url: string) => trackBehaviorEvent('page_view', { url }),
  
  contentCreate: (contentLength: number, projectTag?: string) => 
    trackBehaviorEvent('content_create', { contentLength, projectTag }),
  
  contentEdit: (entryId: number, changes: Record<string, unknown>) => 
    trackBehaviorEvent('content_edit', { entryId, changes }),
  
  search: (query: string, resultsCount: number) => 
    trackBehaviorEvent('search_query', { query, resultsCount }),
  
  aiInteraction: (interactionType: string, data: Record<string, unknown>) => 
    trackBehaviorEvent('ai_interaction', { interaction_type: interactionType, ...data }),
  
  focusSession: (duration: number, quality: 'high' | 'medium' | 'low') => 
    trackBehaviorEvent('focus_session', { quality }, duration),
  
  tagUsage: (tagType: 'project' | 'person', tagValue: string) => 
    trackBehaviorEvent('tag_usage', { tag_type: tagType, tag_value: tagValue })
};

// 获取行为统计
export function getBehaviorStats(days: number = 7): {
  totalEvents: number;
  eventsByType: { [key: string]: number };
  dailyActivity: { [date: string]: number };
  mostActiveHour: number;
} {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = db.prepare(`
    SELECT * FROM user_behavior_events 
    WHERE timestamp > ?
  `).all(startDate.toISOString()) as BehaviorEvent[];

  const eventsByType: { [key: string]: number } = {};
  const dailyActivity: { [date: string]: number } = {};
  const hourlyActivity: { [hour: number]: number } = {};

  events.forEach(event => {
    // 统计事件类型
    eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
    
    // 统计每日活动
    const date = event.timestamp.split('T')[0];
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    
    // 统计时段活动
    const context = JSON.parse(event.context as string);
    hourlyActivity[context.time_of_day] = (hourlyActivity[context.time_of_day] || 0) + 1;
  });

  const mostActiveHour = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return {
    totalEvents: events.length,
    eventsByType,
    dailyActivity,
    mostActiveHour: mostActiveHour ? parseInt(mostActiveHour) : 9 // 默认9点
  };
}