/**
 * 增强搜索功能模块
 * 支持智能搜索、拼音搜索、模糊匹配等高级功能
 */

import { db } from './db';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';

// 带相关性分数的Entry类型
interface EntryWithScore extends Entry {
  _relevanceScore?: number;
}

// 拼音映射表（简化版，包含常用汉字）
const pinyinMap: { [key: string]: string } = {
  // 数字
  '一': 'yi', '二': 'er', '三': 'san', '四': 'si', '五': 'wu', 
  '六': 'liu', '七': 'qi', '八': 'ba', '九': 'jiu', '十': 'shi',
  
  // 常用词汇
  '项目': 'xiangmu', '工作': 'gongzuo', '会议': 'huiyi', '计划': 'jihua',
  '任务': 'renwu', '完成': 'wancheng', '讨论': 'taolun', '问题': 'wenti',
  '方案': 'fangan', '设计': 'sheji', '开发': 'kaifa', '测试': 'ceshi',
  '上线': 'shangxian', '发布': 'fabu', '优化': 'youhua', '修复': 'xiufu',
  '需求': 'xuqiu', '功能': 'gongneng', '用户': 'yonghu', '系统': 'xitong',
  '数据': 'shuju', '分析': 'fenxi', '报告': 'baogao', '总结': 'zongjie',
  '学习': 'xuexi', '研究': 'yanjiu', '文档': 'wendang', '笔记': 'biji',
  '思考': 'sikao', '想法': 'xiangfa', '创意': 'chuangyi', '灵感': 'linggan',
  
  // 人物相关
  '老板': 'laoban', '同事': 'tongshi', '客户': 'kehu',
  '团队': 'tuandui', '领导': 'lingdao', '经理': 'jingli', '主管': 'zhuguan',
  
  // 时间相关
  '今天': 'jintian', '昨天': 'zuotian', '明天': 'mingtian', '周': 'zhou',
  '月': 'yue', '年': 'nian', '上午': 'shangwu', '下午': 'xiawu',
  '晚上': 'wanshang', '早上': 'zaoshang',
  
  // 状态相关
  '重要': 'zhongyao', '紧急': 'jinji', '进行': 'jinxing',
  '待定': 'daiding', '取消': 'quxiao', '延期': 'yanqi', '成功': 'chenggong',
  '失败': 'shibai', '困难': 'kunnan', '容易': 'rongyi', '复杂': 'fuza'
};

// 搜索结果接口
export interface SearchResult {
  entries: Entry[];
  totalCount: number;
  searchTime: number;
  searchTerms: string[];
  suggestions: string[];
}



/**
 * 将中文转换为拼音
 */
function toPinyin(text: string): string {
  let result = text;
  for (const [char, pinyin] of Object.entries(pinyinMap)) {
    result = result.replace(new RegExp(char, 'g'), pinyin);
  }
  return result;
}


/**
 * 计算文本相关性得分
 */
function calculateRelevanceScore(entry: Entry, searchTerms: string[]): number {
  let score = 0;
  const content = entry.content.toLowerCase();
  const projectTag = (entry.project_tag || '').toLowerCase();
  const personTag = (entry.person_tag || '').toLowerCase();
  
  for (const term of searchTerms) {
    const lowerTerm = term.toLowerCase();
    
    // 内容匹配 (权重: 3)
    const contentMatches = (content.match(new RegExp(lowerTerm, 'g')) || []).length;
    score += contentMatches * 3;
    
    // 项目标签匹配 (权重: 2)
    if (projectTag.includes(lowerTerm)) {
      score += 2;
    }
    
    // 人物标签匹配 (权重: 2)
    if (personTag.includes(lowerTerm)) {
      score += 2;
    }
    
    // 重要性加成 - 暂时移除，因为Entry类型中没有importance_tag
    // score += entry.importance_tag * 0.1;
    
    // 拼音匹配 (权重: 1)
    const pinyinContent = toPinyin(content);
    const pinyinProject = toPinyin(projectTag);
    const pinyinPerson = toPinyin(personTag);
    
    if (pinyinContent.includes(lowerTerm)) score += 1;
    if (pinyinProject.includes(lowerTerm)) score += 1;
    if (pinyinPerson.includes(lowerTerm)) score += 1;
  }
  
  return score;
}



/**
 * 快速搜索（简化版，用于实时搜索）
 */
export function quickSearch(query: string, limit = 10): Entry[] {
  if (!query.trim()) return [];
  
  const searchTerms = query.trim().split(/\s+/).filter(term => term.length > 0);
  
  if (searchTerms.length === 0) return [];
  
  // 构建简单的搜索查询
  const conditions: string[] = [];
  const params: Record<string, string> = {};
  
  searchTerms.forEach((term, index) => {
    const paramKey = `term${index}`;
    params[paramKey] = `%${term}%`;
    conditions.push(`(content LIKE @${paramKey} OR project_tag LIKE @${paramKey} OR person_tag LIKE @${paramKey})`);
  });
  
  const sql = `
    SELECT * FROM entries 
    WHERE ${conditions.join(' AND ')}
    ORDER BY id DESC
    LIMIT ${limit}
  `;
  
  const stmt = db.prepare(sql);
  const results = stmt.all(params) as Entry[];
  
  // 按相关性得分排序
  return results
    .map(entry => ({
      ...entry,
      _relevanceScore: calculateRelevanceScore(entry, searchTerms)
    } as EntryWithScore))
    .sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0))
    .map(entry => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _relevanceScore, ...cleanEntry } = entry;
      return cleanEntry;
    });
}

/**
 * 获取搜索统计信息
 */
export function getSearchStats() {
  try {
    // 获取最常搜索的项目标签
    const projectStats = db.prepare(`
      SELECT project_tag, COUNT(*) as count
      FROM entries 
      WHERE project_tag IS NOT NULL AND project_tag != ''
      GROUP BY project_tag
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    // 获取努力程度分布
    const effortStats = db.prepare(`
      SELECT effort_tag, COUNT(*) as count
      FROM entries 
      WHERE effort_tag IS NOT NULL AND effort_tag != ''
      GROUP BY effort_tag
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    // 获取每日报告标签分布
    const dailyReportStats = db.prepare(`
      SELECT daily_report_tag, COUNT(*) as count
      FROM entries
      WHERE daily_report_tag IS NOT NULL AND daily_report_tag != ''
      GROUP BY daily_report_tag
      ORDER BY count DESC
      LIMIT 10
    `).all();

    return {
      topProjects: projectStats,
      topEfforts: effortStats,
      dailyReportDistribution: dailyReportStats
    };
  } catch (error) {
    debug.error('获取搜索统计失败:', error);
    return {
      topProjects: [],
      topEfforts: [],
      dailyReportDistribution: []
    };
  }
}