/**
 * AI服务层 - 智能分析、文本润色功能和智能问答
 * 使用OpenRouter + Kimi-K2模型
 */

import type { WorkAnalysis, Entry } from '@/types/index';
// 移除数据库相关导入，避免客户端组件错误
// import { getKnowledgeContext } from './knowledge-manager';
import { getEnhancedWeeklyReportData } from './supabase/export';
import { getAIModelConfig } from './supabase/config';
import { debug } from '@/lib/debug';
import { chatCompletion as aiChatCompletion } from './ai-client';


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
    created_at?: string;
    updated_at?: string;
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
      reasoning?: string; // 某些模型（如deepseek-r1）的思维链字段
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
    const result = await aiChatCompletion({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: getAIModelConfig('polish_text'),
      temperature: 0.3,
      max_tokens: 800,
      top_p: 0.9
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || '润色服务暂时不可用'
      };
    }

    return {
      success: true,
      polishedText: result.content?.trim() || '',
      tokensUsed: result.tokensUsed
    };

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
  if (!content || content.trim().length === 0) {
    return {
      success: false,
      error: '输入内容为空'
    };
  }

  // 获取个人背景信息 - 暂时注释掉数据库调用
  // const knowledgeContext = getKnowledgeContext();
  const knowledgeContext = '';
  
  const prompt = `你是一个思维敏锐的提问专家。请针对以下内容，提出5个犀利、深入的问题。

${knowledgeContext}

基于用户的背景信息，这些问题应该：
1. 挖掘深层逻辑和假设
2. 质疑观点的完整性和准确性  
3. 探索更深层的含义和影响
4. 提出不同角度的思考
5. 帮助完善和深化思考
6. 结合用户的业务、团队和个人背景

要分析的内容：${content}

请严格按照以下格式返回问题，每个问题必须以问号结尾：

1. [第一个犀利问题？]
2. [第二个深入问题？]
3. [第三个探讨性问题？]
4. [第四个挑战性问题？]
5. [第五个启发性问题？]

要求：
- 每个问题必须以问号结尾
- 问题要具体、有针对性，避免空泛
- 不要添加任何解释文字
- 直接返回编号的问题列表
- 确保每个问题都是真正的疑问句，包含问号`;

  try {
    const result = await aiChatCompletion({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'google/gemini-2.5-flash', // 使用更适合生成问题的模型
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'AI提问服务暂时不可用'
      };
    }

    let responseText = result.content?.trim() || '';
    
    // 如果仍然没有有效内容，记录调试信息
    if (!responseText) {
      debug.error('AI返回内容为空');
      throw new Error('AI返回内容为空');
    }
    
    // 清理响应文本，移除可能的解释文字
    responseText = cleanResponseText(responseText);
    
    // 解析问题列表 - 改进版
    const questions = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '')) // 移除序号
      .filter(line => line.length > 5) // 过滤太短的行
      .filter(line => {
        // 额外过滤：确保行看起来像问题（包含问号或是合理的疑问句）
        const hasQuestionMark = line.includes('？') || line.includes('?');
        const isReasonableQuestion = /^(\w|[\u4e00-\u9fff])/.test(line) && !line.includes('问题') && !line.includes('问题列表') && !line.includes('最终问题');
        return hasQuestionMark || isReasonableQuestion;
      })
      .slice(0, 5); // 限制最多返回5个问题

    return {
      success: true,
      questions,
      tokensUsed: result.tokensUsed
    };

  } catch (error) {
    debug.error('生成问题失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI提问服务暂时不可用'
    };
  }
}

/**
 * 清理AI响应文本，移除解释文字，只保留问题列表
 */
function cleanResponseText(text: string): string {
  // 如果文本以编号开头，说明格式正确，直接返回
  if (/^\d+\./.test(text.trim())) {
    return text.trim();
  }
  
  // 尝试提取编号的问题列表
  const numberedQuestions = text.match(/\d+\.\s*[^\n]+/g);
  if (numberedQuestions && numberedQuestions.length > 0) {
    return numberedQuestions.join('\n');
  }
  
  // 如果没有编号问题，尝试提取包含问号的句子
  const questionSentences = text.match(/[^.!?]*[？?][^.!?]*/g);
  if (questionSentences && questionSentences.length > 0) {
    return questionSentences.join('\n');
  }
  
  // 如果都没有，返回原文本（但这种情况很少见）
  return text.trim();
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
    const { getOpenRouterApiKey } = await import('./supabase/config');
    
    const dbApiKey = getOpenRouterApiKey();
    
    const response = await simpleChatCompletion(
      getAIModelConfig('analyze_semantic_similarity'),
      [{ role: 'user', content: prompt }],
      {
        apiKey: dbApiKey || undefined, // 使用数据库API Key，如果没有则fallback到环境变量
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
    // 使用当前时间作为默认值，因为created_at字段已被移除
    const date = new Date();
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
    const result = await aiChatCompletion({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: getAIModelConfig('weekly_report'),
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || '智能周报服务暂时不可用'
      };
    }

    return {
      success: true,
      report: result.content?.trim() || ''
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
    const result = await aiChatCompletion({
      messages: [{ role: 'user', content: prompt }],
      model: getAIModelConfig('generate_minimalist_analysis'),
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'AI分析服务暂时不可用'
      };
    }

    const analysis = result.content;
    if (!analysis) {
      return {
        success: false,
        error: 'AI返回内容为空'
      };
    }

    return {
      success: true,
      analysis,
      tokensUsed: result.tokensUsed
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

// chatCompletion函数已移至ai-client.ts，使用aiChatCompletion代替

/**
 * 生成简化版周报（基于最近7天数据）
 * 这是一个轻量级的包装函数，结合数据获取和AI生成
 */
export async function generateSimpleWeeklyReport(): Promise<WeeklyReportResponse> {
  try {
    debug.log('📊 开始生成综合周报（记录+TODO）...');
    
    // 获取增强的周报数据（记录+TODO）
    const enhancedData = getEnhancedWeeklyReportData();
    
    // 检查数据完整性
    if (enhancedData.entries.length === 0 && enhancedData.todos.total === 0) {
      return {
        success: true,
        report: {
          summary: "本周暂无记录和任务数据。",
          highlights: [],
          insights: ["建议开始记录日常工作内容和创建待办任务，这样可以更好地分析工作模式。"],
          recommendations: ["试试添加一些工作记录和待办事项来开始你的数字大脑之旅！"]
        }
      };
    }

    // 构建综合分析的AI提示词
    const enhancedPrompt = buildEnhancedWeeklyPrompt(enhancedData);
    
    debug.log('🤖 开始AI分析，数据概况:', {
      记录数: enhancedData.entries.length,
      总任务数: enhancedData.todos.total,
      完成率: `${enhancedData.todos.completionRate}%`
    });

    // 调用AI进行综合分析
    const aiResult = await aiChatCompletion({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: getAIModelConfig('weekly_report'),
      temperature: 0.7,
      max_tokens: 2000
    });
    
    if (!aiResult.success) {
      debug.error('❌ AI分析失败:', aiResult.error);
      return {
        success: false,
        error: aiResult.error || 'AI分析失败'
      };
    }

    // 解析AI生成的报告并结构化
    const report = parseEnhancedWeeklyReport(aiResult.content || '', enhancedData);
    
    debug.log('✅ 综合周报生成成功');
    return {
      success: true,
      report,
      tokensUsed: aiResult.tokensUsed || 0
    };
  } catch (error) {
    debug.error('❌ 生成综合周报失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '周报生成失败'
    };
  }
}

/**
 * 构建增强的AI日报提示词（记录+TODO当日分析）
 */
export function buildEnhancedDailyPrompt(entries: Entry[], todos: { completed: any[]; pending: any[]; total: number; completionRate: number }, date: string): string {
  return `# 角色定位
你是一位资深的个人效率顾问和工作模式分析师，拥有10年以上的生产力研究经验。你擅长从数据中发现模式、识别效率瓶颈，并提供具有实际操作价值的改进建议。

# 专业背景
- 熟悉GTD（Getting Things Done）方法论
- 精通时间管理和能量管理技术
- 具备行为模式分析和习惯优化经验
- 善于将复杂数据转化为可操作的洞察

# 分析任务
基于 ${date} 的工作记录和任务完成情况，生成一份专业级的个人工作日报。要求数据驱动、洞察深刻、建议具体。

## 📊 今日数据概览
### 工作记录
- 记录总数：${entries.length}条
- 主要项目：${[...new Set(entries.filter(e => e.project_tag).map(e => e.project_tag))].join(', ') || '无项目标签'}
- 重要程度分布：${entries.filter(e => e.effort_tag === '困难').length}个困难任务，${entries.filter(e => e.effort_tag === '中等').length}个中等任务，${entries.filter(e => e.effort_tag === '轻松').length}个轻松任务

### 任务完成情况
- ✅ 已完成：${todos.completed.length}个任务
- ⏳ 待完成：${todos.pending.length}个任务
- 📊 完成率：${todos.completionRate}%
- 🎯 任务总计：${todos.total}个

## 🧠 分析方法论
请按照以下思维链进行分析（请在分析中体现这个思考过程）：

**Step 1: 成就识别**
- 今日最重要的3个成就是什么？
- 哪些任务体现了高价值产出？
- 完成率${todos.completionRate}%代表什么水平？

**Step 2: 效率模式分析**
- 从记录时间分布看，工作节奏如何？
- 困难任务的处理方式是否高效？
- 任务类型与个人能力匹配度如何？

**Step 3: 时间价值评估**
- 哪些活动产生了最高的价值回报？
- 是否存在时间投入与产出不匹配的情况？
- 项目优先级安排是否合理？

**Step 4: 瓶颈诊断**
- 什么因素限制了今日的生产力？
- 未完成任务的共同特征是什么？
- 是否存在可以系统性改进的模式？

**Step 5: 明日规划建议**
- 基于今日模式，明日应如何优化？
- 哪些成功经验值得复制？
- 具体的改进行动是什么？

## 📝 输出格式要求
请严格按照以下JSON结构输出（不要包含markdown代码块标记）：

{
  "date": "${date}",
  "executive_summary": "今日核心成就的高管级别摘要（50字内）",
  "key_achievements": [
    "具体成就1（体现价值和影响）",
    "具体成就2（量化结果）",
    "具体成就3（质性突破）"
  ],
  "efficiency_analysis": {
    "completion_rate_assessment": "基于${todos.completionRate}%完成率的专业评估",
    "time_allocation": "时间分配的优缺点分析",
    "energy_management": "精力投入与产出的匹配分析"
  },
  "insights": [
    "今日工作模式的关键洞察1",
    "行为模式发现2",
    "效率规律识别3"
  ],
  "bottlenecks": [
    "具体瓶颈问题1（如果存在）",
    "系统性改进机会2（如果发现）"
  ],
  "tomorrow_optimization": {
    "priority_focus": "明日最应该关注的优先事项",
    "method_suggestions": "具体的方法和工具建议",
    "habit_adjustments": "小的习惯调整建议"
  },
  "actionable_tips": [
    "立即可执行的改进建议1",
    "操作性强的优化建议2",
    "具体的工具或方法建议3"
  ]
}

## 💡 分析原则
1. **数据驱动**：每个观点都要有数据支撑
2. **价值导向**：关注高价值活动和成果
3. **具体可操作**：避免空洞建议，提供具体方案
4. **积极建设性**：既要发现问题也要提供解决路径
5. **个性化洞察**：基于个人独特的工作模式给出建议

开始你的专业分析：`;
}

/**
 * 构建增强的AI周报提示词（记录+TODO综合分析）
 */
function buildEnhancedWeeklyPrompt(data: import('./supabase/export').EnhancedWeeklyData): string {
  const { entries, todos, productivity, stats } = data;

  return `# 角色定位
你是一位具有15年经验的高级管理咨询师和个人效能教练，专门从事工作模式分析和生产力优化。你曾为多家Fortune 500公司提供效率提升咨询，擅长从复杂数据中识别关键成功模式。

# 专业认证与背景
- 认证生产力顾问（CPP）
- GTD®认证教练
- 精通OKR目标管理方法论
- 时间块管理法（Time Blocking）专家
- 熟悉PDCA持续改进循环
- 能量管理和认知负荷理论实践者

# 分析任务
为期间 ${stats.timeRange.start.split('T')[0]} 至 ${stats.timeRange.end.split('T')[0]} 的工作数据生成一份企业级个人效能分析报告。要求：战略性思维、数据驱动洞察、可执行建议。

## 📊 核心数据概览
### 工作记录维度
- 📝 记录总量：${entries.length}条工作记录
- 🏷️ 项目分布：${stats.projects.map(p => `${p.project}(${p.count}条)`).join(', ') || '无项目分类'}
- ⭐ 复杂度分析：${entries.filter(e => e.effort_tag === '困难').length}个高难度，${entries.filter(e => e.effort_tag === '中等').length}个中等复杂度，${entries.filter(e => e.effort_tag === '轻松').length}个简单任务

### 任务执行维度  
- ✅ 完成任务：${todos.completed.length}个（${todos.completionRate}%完成率）
- ⏳ 待处理：${todos.pending.length}个任务
- 🎯 总任务量：${todos.total}个

### 优先级管理维度
- 🔴 高优先级：${productivity.priorityDistribution.high}个（战略级任务）
- 🟡 中优先级：${productivity.priorityDistribution.medium}个（重要任务）
- 🟢 低优先级：${productivity.priorityDistribution.low}个（日常任务）

### 生活工作平衡维度
- 💼 工作任务：${productivity.categoryBreakdown.work}个
- 🏠 生活管理：${productivity.categoryBreakdown.life}个
- 📚 学习成长：${productivity.categoryBreakdown.study}个
- 💪 健康管理：${productivity.categoryBreakdown.health}个
- 📦 其他类别：${productivity.categoryBreakdown.other}个

### 执行节奏分析
**每日完成分布**：${productivity.dailyCompletions.map(d => `${d.date.split('-')[2]}号:${d.count}个`).join(', ')}

## 🧠 专业分析框架
采用SWOT+PDCA+OKR综合分析法，请严格按照以下思维链条进行分析：

### Phase 1: 战略性现状评估
1. **整体表现基准**：${todos.completionRate}%的完成率在专业标准中处于什么水平？
2. **价值创造分析**：哪些活动产生了最高的价值密度？
3. **资源配置评估**：时间和精力的分配是否与目标优先级匹配？

### Phase 2: 效能模式识别
1. **高效时段发现**：从每日完成分布中识别黄金工作时间
2. **任务类型偏好**：分析个人在不同复杂度任务上的表现差异
3. **项目管理模式**：评估多项目并行处理的效果

### Phase 3: 系统性瓶颈诊断
1. **完成率障碍**：什么系统性因素阻碍了100%完成率？
2. **优先级失配**：高优先级任务是否得到应有的关注？
3. **认知负荷分析**：任务复杂度是否超出舒适区？

### Phase 4: 对标与趋势分析
1. **同期对比**：与个人历史数据的纵向比较
2. **行业基准**：与同类专业人士的横向对比
3. **增长轨迹**：识别可持续的改进趋势

### Phase 5: 战略性改进建议
1. **系统级优化**：需要建立哪些新的工作系统？
2. **习惯级调整**：哪些微习惯能带来复利效应？
3. **工具级升级**：什么方法论或工具能提升效率？

## 📝 专业报告输出格式
请严格按照以下企业级报告结构输出（JSON格式，无代码块标记）：

{
  "period": "${stats.timeRange.start.split('T')[0]} 至 ${stats.timeRange.end.split('T')[0]}",
  "executive_summary": "一句话总结本周的核心成就和关键发现（董事会级别摘要）",
  "key_performance_indicators": {
    "completion_rate": "${todos.completionRate}%",
    "efficiency_score": "基于多维度数据计算的效率评分（1-10分）",
    "priority_management_index": "优先级管理效果评估"
  },
  "strategic_achievements": [
    "最重要的战略性成果1（量化impact）",
    "关键突破2（质性价值）",
    "系统性改进3（可复制价值）"
  ],
  "performance_patterns": {
    "peak_productivity_insights": "高效时段和条件分析",
    "task_type_optimization": "任务类型处理的优劣势模式",
    "workflow_efficiency": "工作流程的顺畅度评估"
  },
  "bottleneck_analysis": {
    "primary_constraints": "限制效能的主要因素",
    "systemic_issues": "需要系统性解决的问题",
    "opportunity_gaps": "未充分利用的效率提升机会"
  },
  "competitive_insights": [
    "相对个人历史表现的提升点",
    "在专业标准中的定位分析",
    "领先或落后的具体维度"
  ],
  "next_week_strategy": {
    "priority_focus": "下周的战略重点（基于数据驱动）",
    "methodology_upgrades": "建议采用的新方法或工具",
    "habit_system_design": "需要建立的新习惯系统"
  },
  "actionable_playbook": [
    "立即执行级建议（今天就能开始）",
    "本周实施级改进（7天内完成）", 
    "系统建设级优化（长期持续改进）"
  ]
}

## 🎯 分析品质标准
1. **数据准确性**：每个结论都要有具体数据支撑
2. **洞察深度**：超越表面现象，发现根本模式
3. **建议实用性**：所有建议都必须具备立即可操作性
4. **战略高度**：从个人发展战略角度思考问题
5. **个性化定制**：基于个人独特数据模式给出专属建议

## 💼 专业分析开始
请以资深管理咨询师的视角，开始你的深度分析：`;
}

/**
 * 解析增强版AI生成的周报内容
 */
function parseEnhancedWeeklyReport(aiReport: string, data: import('./supabase/export').EnhancedWeeklyData): {
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
} {
  try {
    // 尝试解析JSON格式的AI回复
    const jsonMatch = aiReport.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `本周完成${data.todos.completed.length}个任务，记录${data.entries.length}条内容，完成率${data.todos.completionRate}%`,
        highlights: parsed.highlights || [],
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || []
      };
    }
  } catch (error) {
    debug.log('JSON解析失败，使用文本解析');
  }

  // 回退到文本解析
  return {
    summary: `本周完成${data.todos.completed.length}个任务，记录${data.entries.length}条内容，完成率${data.todos.completionRate}%。主要项目：${data.stats.projects.map(p => p.project).join(', ') || '无'}`,
    highlights: [
      `📈 任务完成率：${data.todos.completionRate}%`,
      `📝 工作记录：${data.entries.length}条`,
      `🎯 高优先级任务：${data.productivity.priorityDistribution.high}个`,
      `💼 工作类任务：${data.productivity.categoryBreakdown.work}个`
    ],
    insights: [
      aiReport.slice(0, 300) + (aiReport.length > 300 ? '...' : ''),
      data.todos.completionRate >= 80 ? '任务完成率表现优秀，继续保持！' : '任务完成率有提升空间，建议优化时间管理。'
    ],
    recommendations: [
      data.productivity.priorityDistribution.high > 0 && data.todos.completionRate < 100 ? '优先处理高优先级待办任务' : '继续保持良好的任务管理习惯',
      data.entries.length < 5 ? '增加工作记录的频率，便于后续分析' : '保持记录习惯，积累更多工作数据',
      '考虑设置明确的项目标签，提高工作分析的精度'
    ]
  };
}

/**
 * 解析AI生成的周报内容并结构化（旧版本，保留兼容性）
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