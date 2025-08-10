/**
 * 高级行为分析引擎
 * 用于深度分析用户行为模式，生成洞察和预测
 */

import { db } from './db';
import {
  BehaviorEvent,
  BehaviorPattern,
  Insight
} from '@/types/behavior';

// 类型定义（保留用于未来扩展）
// interface TimePattern {
//   hour: number;
//   count: number;
//   intensity: number;
// }

// interface ContentPattern {
//   keyword: string;
//   frequency: number;
//   importance_avg: number;
// }

// interface InteractionPattern {
//   action_type: string;
//   count: number;
//   avg_duration: number;
// }

interface ParsedEventData {
  contentLength?: number;
  content_length?: number;
  projectTag?: string;
  project_tag?: string;
  importance_tag?: number;
  interaction_type?: string;
  success?: boolean;
}

interface ParsedContext {
  time_of_day?: number;
  day_of_week?: number;
}

// 时间段定义
export const TIME_PERIODS = {
  EARLY_MORNING: { start: 5, end: 9, name: '早晨' },
  MORNING: { start: 9, end: 12, name: '上午' },
  AFTERNOON: { start: 12, end: 18, name: '下午' },
  EVENING: { start: 18, end: 22, name: '晚上' },
  NIGHT: { start: 22, end: 24, name: '深夜' },
  LATE_NIGHT: { start: 0, end: 5, name: '凌晨' }
};

// 获取指定天数内的行为事件
function getBehaviorEvents(days: number = 30): BehaviorEvent[] {
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
 * 分析时间模式 - 发现用户的活跃时间段
 */
export function analyzeTemporalPatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = [];
  
  // 分析每小时的活动分布
  const hourlyActivity: { [hour: number]: number } = {};
  const weekdayActivity: { [day: number]: number } = {};
  const sessionActivity: { [sessionId: string]: BehaviorEvent[] } = {};
  
  events.forEach(event => {
    const context = parseContext(event);
    const hour = context.time_of_day || new Date(event.timestamp).getHours();
    const dayOfWeek = context.day_of_week || new Date(event.timestamp).getDay();
    
    hourlyActivity[hour as number] = (hourlyActivity[hour as number] || 0) + 1;
    weekdayActivity[dayOfWeek as number] = (weekdayActivity[dayOfWeek as number] || 0) + 1;
    
    if (!sessionActivity[event.session_id]) {
      sessionActivity[event.session_id] = [];
    }
    sessionActivity[event.session_id].push(event);
  });

  // 识别高峰时段
  const sortedHours = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  if (sortedHours.length > 0) {
    const peakHours = sortedHours.map(([hour, count]) => ({
      start_hour: parseInt(hour),
      end_hour: parseInt(hour) + 1,
      days_of_week: Object.keys(weekdayActivity).map(d => parseInt(d)),
      frequency: count
    }));

    patterns.push({
      id: Date.now(),
      pattern_type: 'temporal',
      pattern_name: '高峰活跃时段',
      pattern_data: {
        description: `用户主要在 ${sortedHours.map(([h]) => `${h}:00`).join(', ')} 时段活跃`,
        frequency: sortedHours.reduce((sum, [,count]) => sum + count, 0),
        confidence: Math.min(events.length / 50, 1), // 基于数据量计算置信度
        time_patterns: peakHours,
        triggers: ['日常作息时间', '工作安排'],
        outcomes: ['高效工作时段识别']
      },
      discovered_at: new Date().toISOString(),
      last_seen: events[0]?.timestamp || new Date().toISOString(),
      strength: Math.min(sortedHours[0][1] / events.length, 1),
      is_active: true
    });
  }

  // 分析会话模式
  const sessionLengths = Object.values(sessionActivity).map(sessionEvents => {
    const sortedEvents = sessionEvents.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    if (sortedEvents.length < 2) return 0;
    
    const start = new Date(sortedEvents[0].timestamp).getTime();
    const end = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
    return end - start;
  }).filter(length => length > 0);

  if (sessionLengths.length > 0) {
    const avgSessionLength = sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length;
    const avgMinutes = Math.round(avgSessionLength / 60000);

    patterns.push({
      id: Date.now() + 1,
      pattern_type: 'temporal',
      pattern_name: '会话时长模式',
      pattern_data: {
        description: `平均会话时长约 ${avgMinutes} 分钟`,
        frequency: sessionLengths.length,
        confidence: Math.min(sessionLengths.length / 20, 1),
        triggers: ['专注工作需求'],
        outcomes: ['时间管理优化']
      },
      discovered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      strength: Math.min(sessionLengths.length / 30, 1),
      is_active: true
    });
  }

  return patterns;
}

/**
 * 分析内容创建模式
 */
export function analyzeContentCreationPatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = [];
  
  const contentEvents = events.filter(e => 
    e.event_type === 'content_create' || e.event_type === 'content_edit'
  );

  if (contentEvents.length < 3) return patterns;

  // 分析内容长度模式
  const contentLengths: number[] = [];
  const projectTags: { [tag: string]: number } = {};
  const importanceDistribution: { [level: number]: number } = {};
  
  contentEvents.forEach(event => {
    const data = parseEventData(event);
    
    if (data.contentLength || data.content_length) {
      const length = data.contentLength || data.content_length;
      if (typeof length === 'number') {
        contentLengths.push(length);
      }
    }
    
    if (data.projectTag || data.project_tag) {
      const tag = data.projectTag || data.project_tag;
      if (typeof tag === 'string') {
        projectTags[tag] = (projectTags[tag] || 0) + 1;
      }
    }
    
    if (data.importance_tag && typeof data.importance_tag === 'number') {
      importanceDistribution[data.importance_tag] = 
        (importanceDistribution[data.importance_tag] || 0) + 1;
    }
  });

  // 内容长度偏好分析
  if (contentLengths.length > 0) {
    const avgLength = contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length;
    const lengthVariance = contentLengths.reduce((sum, len) => 
      sum + Math.pow(len - avgLength, 2), 0) / contentLengths.length;
    
    patterns.push({
      id: Date.now() + 10,
      pattern_type: 'content',
      pattern_name: '内容长度偏好',
      pattern_data: {
        description: `偏好创建 ${Math.round(avgLength)} 字左右的内容`,
        frequency: contentLengths.length,
        confidence: Math.min(contentLengths.length / 10, 1),
        content_patterns: [{
          topic: '通用内容',
          keywords: [],
          importance_range: [1, 5],
          project_tags: Object.keys(projectTags),
          person_tags: [],
          content_length_range: [
            Math.max(1, Math.round(avgLength - Math.sqrt(lengthVariance))),
            Math.round(avgLength + Math.sqrt(lengthVariance))
          ]
        }],
        triggers: ['内容创作需求'],
        outcomes: ['个性化内容建议']
      },
      discovered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      strength: Math.min(contentLengths.length / 20, 1),
      is_active: true
    });
  }

  // 项目专注度分析
  if (Object.keys(projectTags).length > 0) {
    const sortedProjects = Object.entries(projectTags)
      .sort(([,a], [,b]) => b - a);
    
    const topProject = sortedProjects[0];
    const focusRatio = topProject[1] / contentEvents.length;
    
    if (focusRatio > 0.3) { // 如果某个项目占比超过30%
      patterns.push({
        id: Date.now() + 11,
        pattern_type: 'content',
        pattern_name: '项目专注模式',
        pattern_data: {
          description: `高度专注于"${topProject[0]}"项目 (${Math.round(focusRatio * 100)}%)`,
          frequency: topProject[1],
          confidence: 0.9,
          content_patterns: [{
            topic: topProject[0],
            keywords: [topProject[0]],
            importance_range: [1, 5],
            project_tags: [topProject[0]],
            person_tags: [],
            content_length_range: [1, 1000]
          }],
          triggers: ['项目截止期限', '重要项目推进'],
          outcomes: ['提高项目效率']
        },
        discovered_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        strength: focusRatio,
        is_active: true
      });
    }
  }

  return patterns;
}

/**
 * 分析AI使用模式
 */
export function analyzeAIUsagePatterns(events: BehaviorEvent[]): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = [];
  
  const aiEvents = events.filter(e => e.event_type === 'ai_interaction');
  if (aiEvents.length < 2) return patterns;

  const interactionTypes: { [type: string]: number } = {};
  const successRates: { [type: string]: { success: number; total: number } } = {};
  
  aiEvents.forEach(event => {
    const data = parseEventData(event);
    const interactionType = data.interaction_type || 'unknown';
    
    interactionTypes[interactionType] = (interactionTypes[interactionType] || 0) + 1;
    
    if (!successRates[interactionType]) {
      successRates[interactionType] = { success: 0, total: 0 };
    }
    
    successRates[interactionType].total++;
    if (data.success) {
      successRates[interactionType].success++;
    }
  });

  // AI功能偏好分析
  const sortedInteractions = Object.entries(interactionTypes)
    .sort(([,a], [,b]) => b - a);

  if (sortedInteractions.length > 0) {
    const topInteraction = sortedInteractions[0];
    const usage = successRates[topInteraction[0]];
    const successRate = usage ? usage.success / usage.total : 0;
    
    patterns.push({
      id: Date.now() + 20,
      pattern_type: 'interaction',
      pattern_name: 'AI功能偏好',
      pattern_data: {
        description: `最常使用 ${topInteraction[0]} 功能 (${topInteraction[1]}次, 成功率${Math.round(successRate * 100)}%)`,
        frequency: topInteraction[1],
        confidence: Math.min(aiEvents.length / 10, 1),
        triggers: ['需要AI辅助时'],
        outcomes: ['智能化工作流程']
      },
      discovered_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      strength: Math.min(topInteraction[1] / aiEvents.length, 1),
      is_active: true
    });
  }

  return patterns;
}

/**
 * 生成行为洞察
 */
export function generateBehaviorInsights(events: BehaviorEvent[]): Insight[] {
  const insights: Insight[] = [];
  
  if (events.length < 5) {
    return [{
      id: `insight_${Date.now()}`,
      insight_type: 'warning',
      title: '数据收集中',
      description: '正在收集您的使用行为数据，需要更多数据才能提供个性化洞察。',
      evidence: {
        data_points: events.length,
        time_span: '最近使用',
        examples: ['继续使用系统以获得更好的洞察']
      },
      confidence: 0.3,
      impact_level: 'low',
      actionable: true,
      suggested_actions: ['继续正常使用系统', '多尝试不同功能'],
      related_entries: [],
      created_at: new Date().toISOString()
    }];
  }

  // 分析活跃时间洞察
  const hourlyActivity: { [hour: number]: number } = {};
  events.forEach(event => {
    const context = parseContext(event);
    const hour = context.time_of_day || new Date(event.timestamp).getHours();
    hourlyActivity[hour as number] = (hourlyActivity[hour as number] || 0) + 1;
  });

  const peakHour = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)[0];

  if (peakHour && parseInt(peakHour[0]) < 9) {
    insights.push({
      id: `insight_${Date.now()}_1`,
      insight_type: 'pattern',
      title: '早起型工作者',
      description: `您在早晨 ${peakHour[0]}:00 最为活跃，这表明您是典型的早起型工作者。`,
      evidence: {
        data_points: peakHour[1],
        time_span: '最近30天',
        examples: [`在 ${peakHour[0]}:00 有 ${peakHour[1]} 次活动记录`]
      },
      confidence: 0.8,
      impact_level: 'medium',
      actionable: true,
      suggested_actions: [
        '将重要任务安排在早晨时段',
        '保持早睡早起的作息习惯',
        '利用早晨的高效时光处理复杂工作'
      ],
      related_entries: [],
      created_at: new Date().toISOString()
    });
  } else if (peakHour && parseInt(peakHour[0]) > 20) {
    insights.push({
      id: `insight_${Date.now()}_2`,
      insight_type: 'pattern',
      title: '夜猫子型工作者',
      description: `您在晚上 ${peakHour[0]}:00 最为活跃，这表明您是夜猫子型工作者。`,
      evidence: {
        data_points: peakHour[1],
        time_span: '最近30天',
        examples: [`在 ${peakHour[0]}:00 有 ${peakHour[1]} 次活动记录`]
      },
      confidence: 0.8,
      impact_level: 'medium',
      actionable: true,
      suggested_actions: [
        '在晚间安排重要的创作和思考任务',
        '注意保证充足睡眠',
        '考虑调整作息以适应团队协作时间'
      ],
      related_entries: [],
      created_at: new Date().toISOString()
    });
  }

  // 分析AI使用洞察
  const aiEvents = events.filter(e => e.event_type === 'ai_interaction');
  if (aiEvents.length > 5) {
    const aiUsageRate = aiEvents.length / events.length;
    
    if (aiUsageRate > 0.3) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        insight_type: 'trend',
        title: 'AI重度用户',
        description: `您是AI功能的重度用户，${Math.round(aiUsageRate * 100)}%的活动涉及AI交互。`,
        evidence: {
          data_points: aiEvents.length,
          time_span: '最近活动',
          examples: [`${aiEvents.length}次AI交互，占总活动的${Math.round(aiUsageRate * 100)}%`]
        },
        confidence: 0.9,
        impact_level: 'high',
        actionable: true,
        suggested_actions: [
          '探索更高级的AI功能',
          '考虑将AI集成到更多工作流程中',
          '分享AI使用经验给其他用户'
        ],
        related_entries: [],
        created_at: new Date().toISOString()
      });
    }
  }

  return insights;
}

/**
 * 保存行为模式到数据库
 */
export function saveBehaviorPatterns(patterns: BehaviorPattern[]): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO behavior_patterns 
    (pattern_type, pattern_name, pattern_data, discovered_at, last_seen, strength, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  patterns.forEach(pattern => {
    stmt.run(
      pattern.pattern_type,
      pattern.pattern_name,
      JSON.stringify(pattern.pattern_data),
      pattern.discovered_at,
      pattern.last_seen,
      pattern.strength,
      pattern.is_active ? 1 : 0
    );
  });
}

/**
 * 运行完整的行为分析
 */
export async function runBehaviorAnalysis(): Promise<{
  patterns: BehaviorPattern[];
  insights: Insight[];
  totalEvents: number;
}> {
  const events = getBehaviorEvents(30); // 获取最近30天的数据
  
  const temporalPatterns = analyzeTemporalPatterns(events);
  const contentPatterns = analyzeContentCreationPatterns(events);
  const aiPatterns = analyzeAIUsagePatterns(events);
  
  const allPatterns = [...temporalPatterns, ...contentPatterns, ...aiPatterns];
  const insights = generateBehaviorInsights(events);
  
  // 保存模式到数据库
  if (allPatterns.length > 0) {
    saveBehaviorPatterns(allPatterns);
  }
  
  return {
    patterns: allPatterns,
    insights,
    totalEvents: events.length
  };
}