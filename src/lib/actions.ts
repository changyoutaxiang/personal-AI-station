'use server';

import {
  createEntryAsync, getAllEntriesAsync, getTodayEntriesAsync, getThisWeekEntriesAsync,
  deleteEntryAsync, searchEntriesAsync, getAllKnowledgeDocuments, getKnowledgeStats,
  exportToJSON, exportToCSV, getExportData, validateDataIntegrity, quickHealthCheck,
  saveSearchHistory, getSearchHistory, getPopularSearches, toggleFavoriteSearch,
  getFavoriteSearches, deleteSearchHistory, clearSearchHistory, updateEntryAsync,
  getEnhancedWeeklyReportData, listTodosAsync, getAIModelConfig
} from './db-supabase';

// 日报返回类型定义
interface DailyReportData {
  type: 'simple' | 'fallback' | 'ai_enhanced';
  content?: string;
  warning?: string;
  analysis?: {
    date: string;
    executive_summary: string;
    key_achievements: string[];
    efficiency_analysis?: {
      completion_rate_assessment?: string;
      time_allocation?: string;
      energy_management?: string;
    };
    insights: string[];
    bottlenecks?: string[];
    tomorrow_optimization?: {
      priority_focus?: string;
      method_suggestions?: string;
      habit_adjustments?: string;
    };
    actionable_tips: string[];
  };
  rawData?: any;
}
import { polishText, generateQuestions, findSimilarEntries, generateIntelligentWeeklyReport, buildEnhancedDailyPrompt } from './ai';
import { chatCompletion as aiChatCompletion } from './ai-client';
import { syncKnowledgeBase, searchKnowledgeBase } from './knowledge-manager';
import { debug } from './debug';

import { quickSearch, getSearchStats } from './search';
import { revalidatePath } from 'next/cache';

// 添加新记录
export async function addEntry(formData: FormData) {
  debug.log('🔄 addEntry called with FormData');
  
  const content = formData.get('content') as string;
  const projectTag = formData.get('project_tag') as string;



  const dailyReportTag = formData.get('daily_report_tag') as string;


  const effortTag = formData.get('effort_tag') as string;

  debug.log('📝 Entry data:', {
    content: content?.slice(0, 50) + '...',
    projectTag,
    dailyReportTag,
    effortTag
  });

  if (!content || content.trim().length === 0) {
    debug.error('❌ Content is empty');
    throw new Error('内容不能为空');
  }

  try {
    debug.log('💾 Attempting to create entry...');
    const entry = await createEntryAsync({
      content: content.trim(),
      project_tag: projectTag || undefined,
      daily_report_tag: dailyReportTag || '核心进展',
      effort_tag: effortTag || '轻松'
    });

    debug.log('✅ Entry created successfully:', entry.id);
    revalidatePath('/');
    return { success: true, data: entry };
  } catch (error) {
    debug.error('❌ 添加记录失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '添加记录失败' };
  }
}

// 获取所有记录
export async function fetchEntries() {
  try {
    const entries = await getAllEntriesAsync();
    return { success: true, data: entries };
  } catch (error) {
    debug.error('获取记录失败:', error);
    return { success: false, error: '获取记录失败', data: [] };
  }
}

// 获取今日记录
export async function fetchTodayEntries() {
  try {
    const entries = await getTodayEntriesAsync();
    return { success: true, data: entries };
  } catch (error) {
    debug.error('获取今日记录失败:', error);
    return { success: false, error: '获取今日记录失败', data: [] };
  }
}

// 获取本周记录
export async function fetchThisWeekEntries() {
  debug.log('📅 Fetching this week entries...');
  try {
    const entries = await getThisWeekEntriesAsync();
    debug.log(`✅ Found ${entries.length} this week entries`);
    return entries;
  } catch (error) {
    debug.error('❌ Error fetching this week entries:', error);
    throw error;
  }
}

// 搜索记录（基础版本，保持兼容性）
export async function searchEntriesAction(query: string) {
  if (!query || query.trim().length === 0) {
    return await fetchEntries();
  }

  try {
    const entries = await searchEntriesAsync(query.trim());
    return { success: true, data: entries };
  } catch (error) {
    debug.error('搜索记录失败:', error);
    return { success: false, error: '搜索记录失败', data: [] };
  }
}



// 快速搜索（用于实时搜索建议）
export async function quickSearchAction(query: string, limit = 5) {
  if (!query || query.trim().length === 0) {
    return { success: true, data: [] };
  }

  try {
    const entries = quickSearch(query.trim(), limit);
    return { success: true, data: entries };
  } catch (error) {
    debug.error('快速搜索失败:', error);
    return { success: false, error: '快速搜索失败', data: [] };
  }
}

// 获取搜索统计信息
export async function getSearchStatsAction() {
  try {
    const stats = getSearchStats();
    return { success: true, data: stats };
  } catch (error) {
    debug.error('获取搜索统计失败:', error);
    return { 
      success: false, 
      error: '获取搜索统计失败',
      data: {
        topProjects: [],
        topPeople: [],
        importanceDistribution: []
      }
    };
  }
}

// 删除记录
export async function removeEntry(id: number) {
  try {
    await deleteEntryAsync(id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    debug.error('删除记录失败:', error);
    return { success: false, error: '删除记录失败' };
  }
}

// 更新记录
export async function updateEntryAction(id: number, updates: { 
  content?: string;
  project_tag?: string; 
  daily_report_tag?: string;
  effort_tag?: string;
}) {
  try {
    debug.log('🔄 更新记录:', { id, updates });
    const updatedEntry = await updateEntryAsync(id, updates);
    revalidatePath('/');
    return { success: true, data: updatedEntry };
  } catch (error) {
    debug.error('更新记录失败:', error);
    return { success: false, error: '更新记录失败' };
  }
}

// 生成智能日报（AI分析版）
export async function generateDailyReport(): Promise<{ success: boolean; data?: DailyReportData | string; error?: string }> {
  try {
    // 获取今日数据
    const todayEntries = await getTodayEntriesAsync();
    const allTodos = await listTodosAsync({ category: 'today' });
    
    const today = new Date().toLocaleDateString('zh-CN');
    
    // 如果没有任何数据，返回简单消息
    if (todayEntries.length === 0 && allTodos.length === 0) {
      return { 
        success: true, 
        data: {
          type: 'simple',
          content: `# 今日总结 (${today})\n\n今天还没有记录任何内容和任务。开始记录你的工作进展吧！`
        }
      };
    }
    
    // 分析todos数据
    const completedTodos = allTodos.filter(todo => todo.completed);
    const pendingTodos = allTodos.filter(todo => !todo.completed);
    const completionRate = allTodos.length > 0 ? 
      Math.round((completedTodos.length / allTodos.length) * 100) : 0;
    
    const todosData = {
      completed: completedTodos,
      pending: pendingTodos,
      total: allTodos.length,
      completionRate
    };
    
    // 如果数据很少，生成简单报告
    if (todayEntries.length === 0 && allTodos.length < 3) {
      const projects = [...new Set(todayEntries.filter(e => e.project_tag).map(e => e.project_tag || ''))].filter(p => p);
      
      const simpleReport = `# 今日总结 (${today})

## 📊 数据概览
- 工作记录：${todayEntries.length}条
- 任务完成：${completedTodos.length}/${allTodos.length}个 (${completionRate}%)
- 涉及项目：${projects.join(', ') || '无'}

## ✅ 已完成任务
${completedTodos.length > 0 ? 
  completedTodos.map(todo => `- ${(todo as any).title || todo.id}`).join('\n') : 
  '暂无完成任务'}

## ⏳ 待办任务  
${pendingTodos.length > 0 ? 
  pendingTodos.map(todo => `- ${(todo as any).title || todo.id}`).join('\n') : 
  '暂无待办任务'}

## 📝 工作记录
${todayEntries.length > 0 ? 
  todayEntries.map((entry, index) => 
    `${index + 1}. ${entry.content}${entry.project_tag ? ` [${entry.project_tag}]` : ''}`
  ).join('\n') : 
  '暂无工作记录'}

---
*简化版日报 - 数据较少时自动生成*`;

      return { 
        success: true, 
        data: {
          type: 'simple', 
          content: simpleReport
        }
      };
    }
    
    // 生成AI增强提示词
    const enhancedPrompt = buildEnhancedDailyPrompt(todayEntries, todosData, today);
    
    // 调用AI分析
    debug.log('🤖 开始AI日报分析...');
    const aiResult = await aiChatCompletion({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: 'anthropic/claude-3.5-sonnet',
      temperature: 0.7,
      max_tokens: 3000
    });
    
    if (!aiResult.success) {
      debug.error('❌ AI分析失败:', aiResult.error);
      throw new Error(aiResult.error || 'AI分析失败');
    }
    
    if (!aiResult.content) {
      debug.error('❌ AI分析返回空结果');
      throw new Error('AI分析返回空内容');
    }
    
    // 解析AI结果
    let aiAnalysis;
    try {
      // 清理可能的markdown标记
      const cleanContent = aiResult.content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      aiAnalysis = JSON.parse(cleanContent);
      debug.log('✅ AI日报分析完成');
    } catch (parseError) {
      debug.error('❌ AI返回格式解析失败:', parseError);
      debug.log('Raw AI response:', aiResult.content);
      throw new Error('AI分析结果格式错误');
    }
    
    return { 
      success: true, 
      data: {
        type: 'ai_enhanced',
        analysis: aiAnalysis,
        rawData: {
          entries: todayEntries,
          todos: todosData,
          date: today
        }
      }
    };
    
  } catch (error) {
    debug.error('❌ 生成智能日报失败:', error);
    
    // 回退到简单版本
    try {
      const todayEntries = await getTodayEntriesAsync();
      const projects = [...new Set(todayEntries.filter(e => e.project_tag).map(e => e.project_tag || ''))].filter(p => p);
      
      const fallbackReport = `# 今日总结 (${new Date().toLocaleDateString('zh-CN')})

## 记录概览 
- 总记录数：${todayEntries.length}条
- 涉及项目：${projects.join(', ') || '无'}

## 详细内容
${todayEntries.map((entry, index) => 
  `${index + 1}. ${entry.content}${entry.project_tag ? ` [${entry.project_tag}]` : ''}`
).join('\n')}

---
*备用版本 - AI分析暂时不可用*`;

      return { 
        success: true, 
        data: {
          type: 'fallback',
          content: fallbackReport,
          warning: 'AI分析暂时不可用，已生成基础版本'
        }
      };
    } catch (fallbackError) {
      debug.error('❌ 生成备用日报也失败:', fallbackError);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '生成日报失败' 
      };
    }
  }
}

// 文本润色
export async function polishTextAction(text: string) {
  if (!text || text.trim().length === 0) {
    return { success: false, error: '输入文本为空' };
  }

  try {
    const result = await polishText(text.trim());
    return result;
  } catch (error) {
    debug.error('文本润色失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '润色服务暂时不可用' 
    };
  }
}





// =============AI智能功能=============

// AI生成犀利提问
export async function generateQuestionsAction(content: string) {
  if (!content || content.trim().length === 0) {
    return { success: false, error: '输入内容为空' };
  }

  try {
    const result = await generateQuestions(content.trim());
    return result;
  } catch (error) {
    debug.error('生成问题失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'AI提问服务暂时不可用' 
    };
  }
}

// 查找相似记录
export async function findSimilarEntriesAction(content: string) {
  if (!content || content.trim().length === 0) {
    return { success: false, error: '输入内容为空' };
  }

  try {
    // 获取所有记录进行相似度分析
    const allEntries = await getAllEntriesAsync();
    const result = await findSimilarEntries(content.trim(), allEntries);
    return result;
  } catch (error) {
    debug.error('查找相似记录失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '相似度分析暂时不可用' 
    };
  }
}

// 合并记录
export async function mergeEntriesAction(targetId: number | undefined, sourceIds: number[], newContent: string) {
  try {
    debug.log('📝 mergeEntriesAction called:', { targetId, sourceIds, newContentLength: newContent.length });
    
    // 验证输入参数
    if (!newContent || newContent.trim().length === 0) {
      return { success: false, error: '合并内容不能为空' };
    }
    
    if (sourceIds.length === 0) {
      return { success: false, error: '请选择要合并的记录' };
    }
    
    // 验证记录是否存在
    const allEntries = await getAllEntriesAsync();
    const allEntryIds = allEntries.map(e => e.id);
    
    // 检查源记录是否存在
    const missingSourceIds = sourceIds.filter(id => !allEntryIds.includes(id));
    if (missingSourceIds.length > 0) {
      debug.error('❌ Source entries not found:', missingSourceIds);
      return { success: false, error: '部分要合并的记录不存在' };
    }
    
    // 检查目标记录是否存在（如果有）
    if (targetId && !allEntryIds.includes(targetId)) {
      debug.error('❌ Target entry not found:', targetId);
      return { success: false, error: '目标记录不存在' };
    }
    
    // 执行合并操作
    try {
      // 删除要合并的源记录
      for (const sourceId of sourceIds) {
        debug.log('🗑️ Deleting source entry:', sourceId);
        await deleteEntryAsync(sourceId);
      }

      // 如果有目标记录（编辑现有记录时），也删除它
      if (targetId) {
        debug.log('🗑️ Deleting target entry:', targetId);
        await deleteEntryAsync(targetId);
      }

      // 创建新的合并记录
      debug.log('✨ Creating merged entry with content:', newContent.slice(0, 100) + '...');
      const mergedEntry = await createEntryAsync({
        content: newContent.trim(),
        project_tag: undefined, // 合并后可以重新设置
        daily_report_tag: '核心进展', // 提供默认值
        effort_tag: '轻松' // 提供默认值
      });
      
      debug.log('✅ Merge completed successfully, new entry ID:', mergedEntry.id);
      revalidatePath('/');
      return { success: true, data: mergedEntry };
      
    } catch (deleteError) {
      debug.error('❌ Database operation failed during merge:', deleteError);
      return { success: false, error: '数据库操作失败，请重试' };
    }
    
  } catch (error) {
    debug.error('❌ 合并记录失败:', error);
    return { success: false, error: error instanceof Error ? error.message : '合并记录失败' };
  }
}

// =============智能分析功能=============

// 工作模式分析功能已删除 - 简化分析页面

// 生成智能周报
export async function generateIntelligentWeeklyReportAction() {
  try {
    // 获取最近7天的记录
    const allEntries = await getAllEntriesAsync();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEntries = allEntries; // 移除时间过滤，返回所有条目

    const result = await generateIntelligentWeeklyReport(weeklyEntries);
    return result;
  } catch (error) {
    debug.error('生成智能周报失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '智能周报生成失败' 
    };
  }
}

// 个人效率洞察功能已删除 - 简化分析页面

// =============背景知识库管理=============

// 同步知识库文件
export async function syncKnowledgeBaseAction() {
  try {
    const result = await syncKnowledgeBase();
    revalidatePath('/');
    return result;
  } catch (error) {
    debug.error('同步知识库失败:', error);
    return {
      success: false,
      created: 0,
      updated: 0,
      deleted: 0,
      error: error instanceof Error ? error.message : '同步知识库失败'
    };
  }
}

// 获取知识库文档列表
export async function getKnowledgeDocumentsAction() {
  try {
    const documents = getAllKnowledgeDocuments();
    return { success: true, data: documents };
  } catch (error) {
    debug.error('获取知识库文档失败:', error);
    return { success: false, error: '获取知识库文档失败', data: [] };
  }
}

// 获取知识库统计信息
export async function getKnowledgeStatsAction() {
  try {
    const stats = getKnowledgeStats();
    return { success: true, data: stats };
  } catch (error) {
    debug.error('获取知识库统计失败:', error);
    return { 
      success: false, 
      error: '获取知识库统计失败',
      data: { total: 0, byType: [] }
    };
  }
}

// 搜索知识库
export async function searchKnowledgeBaseAction(query: string) {
  try {
    const results = searchKnowledgeBase(query);
    return { success: true, data: results };
  } catch (error) {
    debug.error('搜索知识库失败:', error);
    return { success: false, error: '搜索知识库失败', data: [] };
  }
}

// =============数据导出相关操作=============

// 导出数据为JSON格式
export async function exportDataAsJSONAction(includeKnowledgeBase = true) {
  try {
    debug.log('📤 开始JSON格式数据导出...');
    const jsonData = await exportToJSON();
    const exportData = await getExportData();
    
    debug.log(`✅ JSON导出成功: ${exportData.metadata.totalRecords} 条记录`);
    return { 
      success: true, 
      data: jsonData,
      metadata: exportData.metadata,
      filename: `digital-brain-export-${new Date().toISOString().slice(0, 10)}.json`
    };
  } catch (error) {
    debug.error('JSON导出失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'JSON导出失败' 
    };
  }
}

// 导出数据为CSV格式
export async function exportDataAsCSVAction() {
  try {
    debug.log('📤 开始CSV格式数据导出...');
    const csvData = exportToCSV();
    const exportData = await getExportData(); // CSV导出
    
    debug.log(`✅ CSV导出成功: ${exportData.metadata.totalRecords} 条记录`);
    return { 
      success: true, 
      data: csvData,
      metadata: exportData.metadata,
      filename: `digital-brain-export-${new Date().toISOString().slice(0, 10)}.csv`
    };
  } catch (error) {
    debug.error('CSV导出失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'CSV导出失败' 
    };
  }
}



// 获取导出预览信息
export async function getExportPreviewAction() {
  try {
    const exportData = await getExportData();
    
    return {
      success: true,
      data: {
        totalRecords: exportData.metadata.totalRecords,
        dateRange: exportData.metadata.dateRange,
        projectCount: exportData.statistics.projectStats.length,
        personCount: 0, // 暂时设为0，因为当前没有personStats统计
        knowledgeBaseCount: exportData.knowledgeBase?.length || 0,
        topProjects: exportData.statistics.projectStats.slice(0, 5),
        // importanceDistribution: exportData.statistics.importanceDistribution // 暂时注释，因为Entry类型中没有importance_tag
      }
    };
  } catch (error) {
    debug.error('获取导出预览失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取导出预览失败' 
    };
  }
}

// =============数据完整性验证相关操作=============

// 执行完整的数据完整性验证
export async function validateDataIntegrityAction() {
  try {
    debug.log('🔍 开始数据完整性验证...');
    const report = validateDataIntegrity();
    
    debug.log(`✅ 数据完整性验证完成: ${report.passedChecks}/${report.totalChecks} 项检查通过`);
    return { 
      success: true, 
      data: report 
    };
  } catch (error) {
    debug.error('数据完整性验证失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '数据完整性验证失败' 
    };
  }
}

// 快速健康检查
export async function quickHealthCheckAction() {
  try {
    const health = quickHealthCheck();
    
    return {
      success: true,
      data: health
    };
  } catch (error) {
    debug.error('快速健康检查失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '快速健康检查失败' 
    };
  }
}

// =============搜索历史相关操作=============

// 保存搜索历史记录
export async function saveSearchHistoryAction(
  query: string, 
  searchOptions: Record<string, unknown>, 
  resultCount: number, 
  searchTimeMs: number
) {
  try {
    const historyItem = saveSearchHistory(query, searchOptions, resultCount, searchTimeMs);
    return { success: true, data: historyItem };
  } catch (error) {
    debug.error('保存搜索历史失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '保存搜索历史失败' 
    };
  }
}

// 获取搜索历史记录
export async function getSearchHistoryAction(limit = 20) {
  try {
    const history = getSearchHistory(limit);
    return { success: true, data: history };
  } catch (error) {
    debug.error('获取搜索历史失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取搜索历史失败',
      data: []
    };
  }
}

// 获取热门搜索
export async function getPopularSearchesAction(limit = 10) {
  try {
    const popular = getPopularSearches(limit);
    return { success: true, data: popular };
  } catch (error) {
    debug.error('获取热门搜索失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取热门搜索失败',
      data: []
    };
  }
}

// 切换收藏搜索状态
export async function toggleFavoriteSearchAction(id: number) {
  try {
    const success = toggleFavoriteSearch(id);
    return { success, data: { favoriteToggled: success } };
  } catch (error) {
    debug.error('切换收藏状态失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '切换收藏状态失败' 
    };
  }
}

// 获取收藏的搜索
export async function getFavoriteSearchesAction() {
  try {
    const favorites = getFavoriteSearches();
    return { success: true, data: favorites };
  } catch (error) {
    debug.error('获取收藏搜索失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取收藏搜索失败',
      data: []
    };
  }
}

// 删除搜索历史记录
export async function deleteSearchHistoryAction(id: number) {
  try {
    const success = deleteSearchHistory(id);
    return { success, data: { deleted: success } };
  } catch (error) {
    debug.error('删除搜索历史失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '删除搜索历史失败' 
    };
  }
}

// 清空搜索历史（保留收藏）
export async function clearSearchHistoryAction() {
  try {
    const deletedCount = clearSearchHistory();
    return { success: true, data: { deletedCount } };
  } catch (error) {
    debug.error('清空搜索历史失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '清空搜索历史失败' 
    };
  }
}



// =============批量操作相关Server Actions=============

// 批量删除记录
export async function batchDeleteEntriesAction(ids: number[]) {
  try {
    debug.log(`🗑️ Batch deleting ${ids.length} entries:`, ids);
    
    for (const id of ids) {
      await deleteEntryAsync(id);
    }
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { deletedCount: ids.length, message: `✅ 已删除 ${ids.length} 条记录` }
    };
  } catch (error) {
    debug.error('批量删除记录失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '批量删除记录失败' 
    };
  }
}

// 批量更新记录
export async function batchUpdateEntriesAction(ids: number[], updates: { 
  project_tag?: string; 
}) {
  try {
    debug.log(`📝 Batch updating ${ids.length} entries:`, { ids, updates });
    
    for (const id of ids) {
      await updateEntryAsync(id, updates);
    }
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { updatedCount: ids.length, message: `✅ 已更新 ${ids.length} 条记录` }
    };
  } catch (error) {
    debug.error('批量更新记录失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '批量更新记录失败' 
    };
  }
}

