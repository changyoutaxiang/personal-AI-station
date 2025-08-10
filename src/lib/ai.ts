/**
 * AI服务层 - 智能分析、文本润色功能和智能问答
 * 使用OpenRouter + Kimi-K2模型
 */

import type { WorkAnalysis, Entry } from '@/types/index';
// 移除数据库相关导入，避免客户端组件错误
// import { getKnowledgeContext } from './knowledge-manager';
// import { getWeeklyReportData } from './db';
import { getAIModelConfig } from './db';
import { debug } from '@/lib/debug';
import { aiCache } from './ai-cache';

// 文本特征类型定义
interface TextFeatures {
  keywords: string[];
  phrases: string[];
  concepts: string[];
  chars: string[];
  length: number;
}

// 周报数据类型定义
interface WeeklyData {
  stats: {
    total: number;
    projects: Array<{project: string, count: number}>;
    importance: Array<{level: number, count: number}>;
    timeRange: {start: string, end: string};
  };
}

// AI分析结果类型
interface AIAnalysisResult {
  index: number;
  score: number;
  reason: string;
}

interface PolishTextResponse {
  success: boolean;
  polishedText?: string;
  error?: string;
  tokensUsed?: number;
}

interface GenerateQuestionsResponse {
  success: boolean;
  questions?: string[];
  error?: string;
  tokensUsed?: number;
}

interface SimilarityResponse {
  success: boolean;
  similarEntries?: Array<{
    id: number;
    content: string;
    similarity: number;
    project_tag?: string;
    person_tag?: string;
    importance_tag?: number;
    created_at: string;
  }>;
  error?: string;
}

interface WeeklyReportResponse {
  success: boolean;
  report?: {
    summary: string;
    highlights: string[];
    insights: string[];
    recommendations: string[];
  };
  error?: string;
  tokensUsed?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
  error?: {
    message: string;
  };
}

export async function polishText(originalText: string): Promise<PolishTextResponse> {
  // 环境变量检查
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'AI润色功能未配置，请联系管理员'
    };
  }

  // 输入验证
  if (!originalText || originalText.trim().length === 0) {
    return {
      success: false,
      error: '输入文本为空'
    };
  }

  // 字数限制
  if (originalText.length > 500) {
    return {
      success: false,
      error: '文本长度超出限制（最多500字符）'
    };
  }

  // 检查缓存
  const cachedResult = aiCache.get<PolishTextResponse>('polish_text', originalText);
  if (cachedResult) {
    debug.log('文本润色缓存命中');
    return cachedResult;
  }

  // 构建润色提示词
  const prompt = `你是一个专业的中文文本编辑助手。请帮我优化这段语音转文字的内容：

原始文本：${originalText}

请执行以下优化：
1. 去除口癖词汇（"那个"、"就是"、"然后"、"嗯"、"啊"等）
2. 修正语法错误和标点符号
3. 保持原始语义，不添加额外信息
4. 让文本更加简洁流畅
5. 保持原文的语调和表达方式

请直接输出优化后的文本，不需要解释过程。`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
        'X-Title': 'Digital Brain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: getAIModelConfig('polish_text'),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    const polishedText = data.choices[0].message.content.trim();

    const result = {
      success: true,
      polishedText,
      tokensUsed: data.usage?.total_tokens
    };

    // 缓存结果（润色结果缓存24小时）
    aiCache.set('polish_text', originalText, result, undefined, 24 * 60 * 60 * 1000);

    return result;

  } catch (error) {
    debug.error('文本润色失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '润色服务暂时不可用'
    };
  }
}

/**
 * AI生成犀利提问
 */
export async function generateQuestions(content: string): Promise<GenerateQuestionsResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'AI功能未配置，请联系管理员'
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      error: '输入内容为空'
    };
  }

  // 检查缓存
  const cachedResult = aiCache.get<GenerateQuestionsResponse>('generate_questions', content);
  if (cachedResult) {
    debug.log('犀利提问缓存命中');
    return cachedResult;
  }

  // 获取个人背景信息 - 暂时注释掉数据库调用
  // const knowledgeContext = getKnowledgeContext();
  const knowledgeContext = '';
  
  const prompt = `你是一个思维敏锐的提问专家。请针对以下内容，提出3-5个犀利、深入的问题。

${knowledgeContext}

基于用户的背景信息，这些问题应该：
1. 挖掘深层逻辑和假设
2. 质疑观点的完整性和准确性  
3. 探索更深层的含义和影响
4. 提出不同角度的思考
5. 帮助完善和深化思考
6. 结合用户的业务、团队和个人背景

要分析的内容：${content}

请以数组形式返回问题，每个问题独立一行，格式如下：
1. [问题1]
2. [问题2]
3. [问题3]
...

问题要具体、有针对性，避免空泛的提问。直接返回问题列表，不需要其他解释。`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
        'X-Title': 'Digital Brain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: getAIModelConfig('generate_questions'),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    const responseText = data.choices[0].message.content.trim();
    
    // 解析问题列表
    const questions = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // 移除序号
      .filter(line => line.length > 5); // 过滤太短的行

    const result = {
      success: true,
      questions,
      tokensUsed: data.usage?.total_tokens
    };

    // 缓存结果（提问结果缓存12小时）
    aiCache.set('generate_questions', content, result, undefined, 12 * 60 * 60 * 1000);

    return result;

  } catch (error) {
    debug.error('生成问题失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI提问服务暂时不可用'
    };
  }
}

/**
 * 改进的中文文本特征提取算法
 */
function extractTextFeatures(text: string) {
  const cleanText = text.toLowerCase();
  
  // 1. 按标点符号分割句子
  const sentences = cleanText
    .replace(/[，。！？；：、""''（）【】]/g, '|')
    .split('|')
    .filter(s => s.length > 0);
  
  // 2. 中文单字符提取（每个汉字都是一个有意义的单位）
  const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
  
  // 3. 提取2-4字的中文词组（滑动窗口方式）
  const chineseWords = [];
  for (const sentence of sentences) {
    const chars = sentence.match(/[\u4e00-\u9fff]/g) || [];
    // 提取2字词
    for (let i = 0; i < chars.length - 1; i++) {
      chineseWords.push(chars[i] + chars[i + 1]);
    }
    // 提取3字词
    for (let i = 0; i < chars.length - 2; i++) {
      chineseWords.push(chars[i] + chars[i + 1] + chars[i + 2]);
    }
    // 提取4字词
    for (let i = 0; i < chars.length - 3; i++) {
      chineseWords.push(chars[i] + chars[i + 1] + chars[i + 2] + chars[i + 3]);
    }
  }
  
  // 4. 提取英文单词
  const englishWords = cleanText.match(/[a-z]+/g) || [];
  
  // 5. 过滤停用词
  const stopWords = new Set(['的', '了', '在', '是', '我', '你', '他', '她', '它', '和', '与', '或', '但', '然而', '因为', '所以', '如果', '那么', '这个', '那个', '这些', '那些', '一个', '一些', '应该', '为了', '今天', '中午', '一会', '会儿']);
  
  const keywords = [
    ...chineseWords.filter(word => !stopWords.has(word) && word.length >= 2),
    ...englishWords.filter(word => !stopWords.has(word) && word.length > 2)
  ];
  
  // 6. 提取重要短语（基于句子片段）
  const phrases = [];
  for (const sentence of sentences) {
    if (sentence.length >= 4 && sentence.length <= 12) {
      phrases.push(sentence.trim());
    }
  }
  
  // 7. 关键概念词（高权重词汇）
  const conceptWords = [];
  
  // 扩展的概念词库（按语义分组）
  const conceptGroups = {
    // 疲劳相关
    fatigue: ['累', '累死', '疲劳', '疲惫', '困', '乏', '疲乏', '痛苦', '辛苦'],
    // 时间相关
    time: ['早起', '太早', '中午', '早上', '上午', '下午', '晚上', '时间'],
    // 精力相关
    energy: ['精力', '体力', '能量', '状态', '精神'],
    // 休息相关
    rest: ['休息', '睡觉', '躺', '放松', '歇', '小憩'],
    // 地点相关
    place: ['酒店', '宾馆', '房间', '家', '办公室'],
    // 动作相关
    action: ['保持', '维持', '应该', '需要', '回', '去', '来']
  };
  
  // 为每个概念组创建匹配
  for (const [groupName, patterns] of Object.entries(conceptGroups)) {
    for (const pattern of patterns) {
      if (cleanText.includes(pattern)) {
        // 将概念词标准化到组名，增强匹配
        conceptWords.push(pattern);
        // 同时添加组标识，让同组概念能够匹配
        conceptWords.push(`group_${groupName}`);
      }
    }
  }
  
  return {
    keywords: [...new Set(keywords)],
    phrases: [...new Set(phrases)],
    concepts: [...new Set(conceptWords)],
    chars: [...new Set(chineseChars)],
    length: text.length
  };
}

/**
 * 计算文本相似度（改进的多维度算法）
 */
function calculateAdvancedSimilarity(text1Features: TextFeatures, text2Features: TextFeatures): number {
  const { keywords: kw1, phrases: ph1, concepts: cp1, chars: ch1, length: len1 } = text1Features;
  const { keywords: kw2, phrases: ph2, concepts: cp2, chars: ch2, length: len2 } = text2Features;
  
  // 1. 概念词相似度（权重35% - 最重要）
  const commonConcepts = cp1.filter((c: string) => cp2.includes(c)).length;
  const totalConcepts = Math.max(cp1.length, cp2.length);
  const conceptSimilarity = totalConcepts > 0 ? (commonConcepts / totalConcepts) : 0;
  
  // 增强：语义组相似度（同组概念视为相似）
  const groupMatches = cp1.filter(c1 => 
    c1.startsWith('group_') && cp2.some(c2 => c2 === c1)
  ).length;
  const enhancedConceptSimilarity = Math.max(conceptSimilarity, groupMatches > 0 ? 0.6 : 0);
  
  // 2. 关键词相似度（权重25%）
  const commonKeywords = kw1.filter((kw: string) => kw2.includes(kw)).length;
  const totalKeywords = Math.max(kw1.length, kw2.length);
  const keywordSimilarity = totalKeywords > 0 ? (commonKeywords / totalKeywords) : 0;
  
  // 3. 短语相似度（权重20%）
  const commonPhrases = ph1.filter((ph: string) => ph2.includes(ph)).length;
  const totalPhrases = Math.max(ph1.length, ph2.length);
  const phraseSimilarity = totalPhrases > 0 ? (commonPhrases / totalPhrases) : 0;
  
  // 4. 汉字相似度（权重10% - 字符级匹配）
  const commonChars = ch1.filter((c: string) => ch2.includes(c)).length;
  const totalChars = Math.max(ch1.length, ch2.length);
  const charSimilarity = totalChars > 0 ? (commonChars / totalChars) : 0;
  
  // 5. 长度相似度（权重5%）
  const lengthRatio = Math.min(len1, len2) / Math.max(len1, len2);
  
  // 6. 模糊匹配增强（权重5%）
  let fuzzyMatches = 0;
  for (const keyword1 of kw1) {
    for (const keyword2 of kw2) {
      if (keyword1.includes(keyword2) || keyword2.includes(keyword1) || 
          (keyword1.length >= 2 && keyword2.length >= 2 && 
           (keyword1.slice(0, 2) === keyword2.slice(0, 2) || keyword1.slice(-2) === keyword2.slice(-2)))) {
        fuzzyMatches++;
        break;
      }
    }
  }
  const fuzzyRatio = kw1.length > 0 ? fuzzyMatches / kw1.length : 0;
  
  // 综合评分（使用增强的概念相似度）
  const finalScore = (
    enhancedConceptSimilarity * 0.35 +  // 增强概念相似度最重要
    keywordSimilarity * 0.25 +          // 关键词次重要
    phraseSimilarity * 0.20 +           // 短语
    charSimilarity * 0.10 +             // 字符级
    lengthRatio * 0.05 +                // 长度
    fuzzyRatio * 0.05                   // 模糊匹配
  ) * 100;
  
  return Math.round(finalScore * 10) / 10; // 保留1位小数
}

/**
 * AI语义相似度分析（使用LLM增强）
 */
async function analyzeSemanticSimilarity(inputContent: string, candidates: Entry[]): Promise<Array<Entry & { similarity: number; ai_reason?: string; ai_score?: number; basic_score?: number; fallback?: boolean }>> {
  if (candidates.length === 0) return [];
  
  try {
    // 获取背景知识库上下文 - 暂时注释掉数据库调用
    // const knowledgeContext = getKnowledgeContext();
    const knowledgeContext = '';
    
    // 构建用于AI分析的候选文本
    const candidateTexts = candidates.map((entry, index) => 
      `${index + 1}. ${entry.content}`
    ).join('\n\n');
    
    const prompt = `你是一个专业的文本相似度分析专家。请分析输入内容与候选内容的相似度。

${knowledgeContext}

**输入内容：**
${inputContent}

**候选内容：**
${candidateTexts}

请为每个候选内容评分（0-100分），考虑以下因素：
- 语义相似度（主题、概念的相似性）
- 内容重叠度（具体信息的重复程度）
- 上下文关联性（在用户背景下的关联程度）
- 实际意义相似性（解决同类问题、描述同类事物等）

请以JSON格式返回评分结果：
{
  "analysis": [
    {"index": 1, "score": 85, "reason": "具体的相似原因"},
    {"index": 2, "score": 23, "reason": "相似程度较低的原因"}
  ]
}

只返回JSON，不要包含其他解释文字。`;

    // 使用新的安全OpenRouter客户端
    const { simpleChatCompletion } = await import('./openrouter-client');
    
    const response = await simpleChatCompletion(
      getAIModelConfig('analyze_semantic_similarity'),
      [{ role: 'user', content: prompt }],
      {
        temperature: 0.1, // 低温度确保结果一致性
        max_tokens: 1500,
        timeout: 20000, // 20秒超时
        maxRetries: 2
      }
    );
    
    const content = response.content;
    
    if (!content) {
      throw new Error('AI响应格式错误');
    }

    // 解析AI的JSON响应
    const analysisResult = JSON.parse(content);
    
    // 将AI评分结果映射回原始数据
    const enhancedCandidates = candidates.map((entry, index) => {
      const aiAnalysis = analysisResult.analysis.find((a: AIAnalysisResult) => a.index === index + 1);
      const aiScore = aiAnalysis?.score || 0;
      const aiReason = aiAnalysis?.reason || '无分析结果';
      
      // 结合基础算法评分和AI评分（AI权重70%，基础算法30%）
      const basicFeatures = extractTextFeatures(entry.content);
      const inputFeatures = extractTextFeatures(inputContent);
      const basicScore = calculateAdvancedSimilarity(inputFeatures, basicFeatures);
      
      const finalScore = Math.round((aiScore * 0.7 + basicScore * 0.3) * 10) / 10;
      
      return {
        ...entry,
        similarity: finalScore,
        ai_reason: aiReason,
        ai_score: aiScore,
        basic_score: basicScore
      } as Entry & { similarity: number; ai_reason: string; ai_score: number; basic_score: number };
    });
    
    return enhancedCandidates;
    
  } catch (error) {
    debug.error('AI语义分析失败，回退到基础算法:', error);
    
    // AI失败时回退到基础算法
    const inputFeatures = extractTextFeatures(inputContent);
    return candidates.map(entry => {
      const entryFeatures = extractTextFeatures(entry.content);
      const similarity = calculateAdvancedSimilarity(inputFeatures, entryFeatures);
      
      return {
        ...entry,
        similarity,
        ai_reason: 'AI分析不可用，使用基础算法',
        fallback: true
      } as Entry & { similarity: number; ai_reason: string; fallback: boolean };
    });
  }
}

/**
 * 查找相似内容（AI增强的语义相似度算法）
 */
export async function findSimilarEntries(content: string, allEntries: Entry[]): Promise<SimilarityResponse> {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: '输入内容为空'
      };
    }

    // 过滤太短的内容
    if (content.trim().length < 8) {
      return {
        success: true,
        similarEntries: []
      };
    }

    // 检查缓存（基于内容和数据条目数量生成缓存键）
    const cacheKey = `${content}_${allEntries.length}`;
    const cachedResult = aiCache.get<SimilarityResponse>('find_similar_entries', cacheKey);
    if (cachedResult) {
      debug.log('相似内容缓存命中');
      return cachedResult;
    }
    
    // 第一阶段：基础过滤，选择可能相关的候选内容
    const inputFeatures = extractTextFeatures(content);
    const preFilteredEntries = allEntries
      .filter(entry => entry.content.length >= 8)
      .map(entry => {
        const entryFeatures = extractTextFeatures(entry.content);
        const basicSimilarity = calculateAdvancedSimilarity(inputFeatures, entryFeatures);
        return { ...entry, basicSimilarity };
      })
      .filter(entry => entry.basicSimilarity >= 5) // 预过滤阈值降低到5%
      .sort((a, b) => b.basicSimilarity - a.basicSimilarity)
      .slice(0, 15); // 取前15个候选进行AI分析

    if (preFilteredEntries.length === 0) {
      return {
        success: true,
        similarEntries: []
      };
    }

    // 第二阶段：AI语义相似度增强分析
    const aiEnhancedEntries = await analyzeSemanticSimilarity(content, preFilteredEntries);

    // 最终过滤和排序
    const finalResults = aiEnhancedEntries
      .filter(entry => entry.similarity >= 15) // 提高最终阈值到15%
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6); // 最多返回6个高质量结果

    const result = {
      success: true,
      similarEntries: finalResults
    };

    // 缓存结果（相似内容缓存1小时，因为数据可能经常变化）
    aiCache.set('find_similar_entries', cacheKey, result, undefined, 60 * 60 * 1000);

    return result;
  } catch (error) {
    debug.error('查找相似内容失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '相似度分析暂时不可用'
    };
  }
}

/**
 * 智能工作模式分析
 */
export function analyzeWorkPatterns(entries: Entry[]): WorkAnalysis {
  if (!entries || entries.length === 0) {
    return {
      peakHours: [],
      projectDistribution: [],
      importanceDistribution: [],
      weeklyPattern: [],
      productivity_insights: ['暂无足够数据进行分析']
    };
  }

  // 分析时间模式
  const hourCounts: { [key: number]: number } = {};
  const projectCounts: { [key: string]: number } = {};
  const importanceCounts: { [key: number]: number } = {};
  const dayCounts: { [key: string]: number } = {};

  entries.forEach(entry => {
    const date = new Date(entry.created_at);
    const hour = date.getHours();
    const dayName = date.toLocaleDateString('zh-CN', { weekday: 'long' });

    // 统计时间分布
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    
    // 统计项目分布
    if (entry.project_tag) {
      projectCounts[entry.project_tag] = (projectCounts[entry.project_tag] || 0) + 1;
    }
    
    // 统计重要程度分布
    if (entry.importance_tag !== undefined && entry.importance_tag !== null) {
      importanceCounts[entry.importance_tag] = (importanceCounts[entry.importance_tag] || 0) + 1;
    }
    
    // 统计周模式
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
  });

  // 处理数据
  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count);

  const totalEntries = entries.length;
  const projectDistribution = Object.entries(projectCounts)
    .map(([project, count]) => ({
      project,
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const importanceDistribution = Object.entries(importanceCounts)
    .map(([importance, count]) => ({
      importance: parseInt(importance),
      count,
      percentage: Math.round((count / totalEntries) * 100)
    }))
    .sort((a, b) => a.importance - b.importance);

  const weeklyPattern = Object.entries(dayCounts)
    .map(([day, count]) => ({ day, count }));

  // 生成洞察
  const insights: string[] = [];
  if (peakHours.length > 0) {
    const topHour = peakHours[0];
    insights.push(`您最活跃的时间是${topHour.hour}点，建议将重要工作安排在这个时间段`);
  }

  if (projectDistribution.length > 0) {
    const topProject = projectDistribution[0];
    insights.push(`您最关注的项目是"${topProject.project}"，占总记录的${topProject.percentage}%`);
  }

  const highImportanceCount = importanceCounts[4] || 0 + importanceCounts[5] || 0;
  const highImportanceRatio = (highImportanceCount / totalEntries) * 100;
  if (highImportanceRatio > 30) {
    insights.push(`您有${Math.round(highImportanceRatio)}%的记录标记为高重要度，说明工作重点明确`);
  } else if (highImportanceRatio < 10) {
    insights.push('建议提高对重要事件的敏感度，适当标记高重要度事项');
  }

  return {
    peakHours,
    projectDistribution,
    importanceDistribution,
    weeklyPattern,
    productivity_insights: insights
  };
}

/**
 * AI驱动的智能周报生成
 */
export async function generateIntelligentWeeklyReport(entries: Entry[]): Promise<{ success: boolean; report?: string; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'AI功能未配置，请联系管理员'
    };
  }

  if (!entries || entries.length === 0) {
    return {
      success: true,
      report: "本周暂无记录数据。"
    };
  }

  // 预处理数据
  const workAnalysis = analyzeWorkPatterns(entries);
  const recentEntries = entries.slice(-50); // 最近50条记录
  
  const dataContext = `
数据概览：
- 总记录数：${entries.length}条
- 最活跃时间：${workAnalysis.peakHours.slice(0, 3).map(h => `${h.hour}点(${h.count}次)`).join(', ')}
- 主要项目：${workAnalysis.projectDistribution.slice(0, 3).map(p => `${p.project}(${p.percentage}%)`).join(', ')}
- 重要度分布：${workAnalysis.importanceDistribution.map(i => `${i.importance}星(${i.percentage}%)`).join(', ')}

主要工作内容摘要：
${recentEntries.map((entry, index) => `${index + 1}. ${entry.content.slice(0, 100)}${entry.content.length > 100 ? '...' : ''} [${entry.project_tag || '未分类'}] [${entry.importance_tag || 0}★]`).join('\n')}
  `;

  // 获取个人背景信息 - 暂时注释掉数据库调用
  // const knowledgeContext = getKnowledgeContext();
  const knowledgeContext = '';
  
  const prompt = `你是一个专业的工作分析师和个人效率顾问。请基于用户的背景信息和一周的工作记录数据，生成一份深度的智能工作周报。

${knowledgeContext}

工作数据分析：
${dataContext}

请按以下结构生成周报，要求深入分析而非简单汇总，并结合用户的背景信息：

# 📊 智能工作周报

## 🎯 核心成就与亮点
[分析本周最重要的成就和突破，识别关键里程碑]

## 📈 工作模式分析
[基于时间分布和频率分析工作习惯，给出优化建议]

## 🔍 深度洞察
[发现工作中的模式、趋势和潜在问题]

## 💡 效率优化建议
[基于数据给出具体的改进建议]

## 🚀 下周重点规划
[基于本周情况建议下周的重点方向]

要求：
1. 基于数据说话，避免空洞的总结
2. 发现深层次的工作模式和趋势
3. 提供可执行的具体建议
4. 语言要专业但不失温度
5. 重点关注个人成长和效率提升`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Digital Brain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: getAIModelConfig('generate_intelligent_weekly_report'),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    const report = data.choices[0].message.content.trim();

    return {
      success: true,
      report
    };

  } catch (error) {
    debug.error('生成智能周报失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '智能周报服务暂时不可用'
    };
  }
}

/**
 * 极简增长智能体分析
 */
export async function generateMinimalistAnalysis(content: string): Promise<{ success: boolean; analysis?: string; error?: string; tokensUsed?: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'AI功能未配置，请联系管理员'
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      success: false,
      error: '输入内容为空'
    };
  }
  
  const prompt = `【极简增长首席顾问】
# 角色与目标
你现在将扮演我的"首席极简增长顾问"。你的核心使命是，基于已提供的《极简增长》读书笔记知识库，帮助我（作为一名企业管理者）深入理解并实践书中的核心方法论。你的目标不是提供宽泛的商业建议，而是始终以"极简增长"的独特视角，帮助我进行深度学习和解决实际问题。

# 知识库边界
你的所有回答、分析和建议，都必须严格依据《极简增长》读书笔记知识库的核心理念：

## 核心理念
- **人工智能时代的极简组织与敏捷增长**：在AI时代，组织需要更加敏捷和极简，避免复杂的层级结构
- **对的事遇对的人迸发超预期能量**：正确的人做正确的事情会产生1+1>2的效果
- **选人比育人更重要的人才管理策略**：招聘合适的人比培训不合适的人更有效
- **企业与人生简单之道需要洞察力与克制力**：简单不是简陋，而是需要深度思考和自我约束
- **停止在过时行业中浪费资源的战略思考**：要有勇气停止"昨天的战争"

## 四大灵魂追问
1. **核心客户**：谁是真正的目标客户？
2. **核心需求**：解决什么关键问题？
3. **核心产品**：最简化的解决方案是什么？
4. **核心竞争力**：独特优势在哪里？

## 关键方法论
- **压强投入原则**：集中资源在最关键的环节，避免资源分散
- **坚决舍弃智慧**：有勇气放弃次要的、分散注意力的事项
- **软能力建设**：重视人才的软技能和文化适配
- **核心要素对齐**：确保客户、需求、产品、竞争力四要素协调一致

## 常见陷阱
- 贪婪思维：试图满足所有客户需求
- 过时竞争：继续在衰落行业中投入资源
- 要素错配：核心要素之间不匹配
- 资源分散：缺乏压强投入的焦点

# 分析框架
请按照以下结构进行分析：

## 1. 内容洞察
基于极简增长视角，分析用户内容的核心要素

## 2. 四大灵魂追问应用
- 核心客户：谁是真正的目标客户？
- 核心需求：解决什么关键问题？
- 核心产品：最简化的解决方案是什么？
- 核心竞争力：独特优势在哪里？

## 3. 极简增长建议
基于知识库提供具体的行动建议

## 4. 警示陷阱
指出可能的"非极简"思维陷阱

## 5. 深度思考问题
提出1-2个苏格拉底式的深度问题

## 6. 行动建议
提供3-4个具体的下一步行动

要分析的内容：${content}

请严格按照上述框架进行分析，确保每个建议都能追溯到《极简增长》的核心理念。语气要专业、启发性，像一位经验丰富的首席顾问。`;

  try {
    // 设置20秒超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Digital Brain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: getAIModelConfig('generate_minimalist_analysis'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 0.9
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const analysis = data.choices[0]?.message?.content;
    if (!analysis) {
      throw new Error('AI返回内容为空');
    }

    return {
      success: true,
      analysis,
      tokensUsed: data.usage?.total_tokens
    };
    
  } catch (error) {
    debug.error('极简增长分析失败:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'AI分析超时，请尝试缩短输入内容'
        };
      }
      
      return {
        success: false,
        error: `AI服务错误: ${error.message}`
      };
    }
    
    return {
      success: false,
      error: 'AI服务暂时不可用，请稍后重试'
    };
  }
}

/**
 * 通用 Chat Completion 封装
 * 用于执行聊天对话，支持动态模型和可选的 system prompt
 */
export async function chatCompletion(opts: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}): Promise<{ success: boolean; content?: string; tokensUsed?: number; error?: string }> {
  // 环境变量检查
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'AI功能未配置，请联系管理员'
    };
  }

  // 输入验证
  if (!opts.messages || opts.messages.length === 0) {
    return {
      success: false,
      error: '消息列表为空'
    };
  }

  // 获取模型配置
  const model = opts.model || getAIModelConfig('agent_chat');
  const temperature = opts.temperature ?? 0.7;
  const max_tokens = opts.max_tokens ?? 1000;
  const top_p = opts.top_p ?? 0.9;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
        'X-Title': 'Digital Brain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        temperature,
        max_tokens,
        top_p
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    const content = data.choices[0].message.content.trim();

    return {
      success: true,
      content,
      tokensUsed: data.usage?.total_tokens
    };

  } catch (error) {
    debug.error('Chat completion 失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat completion 服务暂时不可用'
    };
  }
}

/**
 * 生成简化版周报（基于最近7天数据）
 * 这是一个轻量级的包装函数，结合数据获取和AI生成
 */
export async function generateSimpleWeeklyReport(): Promise<WeeklyReportResponse> {
  try {
    // 获取周报数据 - 暂时注释掉数据库调用
  // const weeklyData = getWeeklyReportData();
  const weeklyData = { 
      entries: [], 
      analyses: [],
      stats: {
        total: 0,
        projects: [],
        importance: [],
        timeRange: { start: '', end: '' }
      }
    }; // 临时空数据
    
    if (weeklyData.entries.length === 0) {
      return {
        success: true,
        report: {
          summary: "本周暂无记录数据。",
          highlights: [],
          insights: ["建议开始记录日常工作内容，这样可以更好地分析工作模式。"],
          recommendations: ["试试添加一些工作记录来开始你的数字大脑之旅！"]
        }
      };
    }

    // 使用现有的AI周报生成功能
    const aiResult = await generateIntelligentWeeklyReport(weeklyData.entries);
    
    if (!aiResult.success) {
      return {
        success: false,
        error: aiResult.error
      };
    }

    // 解析AI生成的报告并结构化
    const report = parseWeeklyReport(aiResult.report || '', weeklyData);
    
    return {
      success: true,
      report,
      tokensUsed: 0 // 暂时不统计token使用
    };
  } catch (error) {
    debug.error('生成简化周报失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '周报生成失败'
    };
  }
}

/**
 * 解析AI生成的周报内容并结构化
 */
function parseWeeklyReport(aiReport: string, weeklyData: WeeklyData): {
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
} {
  // 简单的结构化处理
  return {
    summary: `本周共记录 ${weeklyData.stats.total} 条内容，时间跨度：${weeklyData.stats.timeRange.start.split(' ')[0]} 至 ${weeklyData.stats.timeRange.end.split(' ')[0]}。`,
    highlights: [
      `记录总数：${weeklyData.stats.total} 条`,
      `主要项目：${weeklyData.stats.projects.map(p => p.project).join(', ') || '暂无项目标签'}`,
      `重要级别分布：${weeklyData.stats.importance.map(i => `${i.level}星(${i.count}条)`).join(', ')}`
    ],
    insights: [
      aiReport.slice(0, 200) + (aiReport.length > 200 ? '...' : '')
    ],
    recommendations: [
      "继续保持记录习惯，积累更多数据以获得更深入的分析",
      "考虑为记录添加项目标签，便于后续分析"
    ]
  };
}