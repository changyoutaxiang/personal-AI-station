'use server';

import { createEntry, getAllEntries, getTodayEntries, deleteEntry, searchEntries, getAllKnowledgeDocuments, getKnowledgeStats, exportToJSON, exportToCSV, getExportData, validateDataIntegrity, quickHealthCheck, saveSearchHistory, getSearchHistory, getPopularSearches, toggleFavoriteSearch, getFavoriteSearches, deleteSearchHistory, clearSearchHistory, updateEntriesOrder, updateEntry, createTodo, getAllTodos, updateTodo, updateTodoStatus, deleteTodo, getTodoStats, updateTodosOrder } from './db';
import { polishText, generateQuestions, findSimilarEntries, analyzeWorkPatterns, generateIntelligentWeeklyReport } from './ai';
import { syncKnowledgeBase, searchKnowledgeBase } from './knowledge-manager';
import { debug } from './debug';

import { quickSearch, getSearchStats } from './search';
import { revalidatePath } from 'next/cache';

// 添加新记录
export async function addEntry(formData: FormData) {
  debug.log('🔄 addEntry called with FormData');
  
  const content = formData.get('content') as string;
  const projectTag = formData.get('project_tag') as string;


  const attributeTag = formData.get('attribute_tag') as string;
  const urgencyTag = formData.get('urgency_tag') as string;
  const dailyReportTag = formData.get('daily_report_tag') as string;
  const resourceTag = formData.get('resource_tag') as string;


  const effortTag = formData.get('effort_tag') as string;

  debug.log('📝 Entry data:', {
    content: content?.slice(0, 50) + '...',
    projectTag,
    attributeTag,
    urgencyTag,
    dailyReportTag,
    resourceTag,


    effortTag
  });

  if (!content || content.trim().length === 0) {
    debug.error('❌ Content is empty');
    throw new Error('内容不能为空');
  }

  try {
    debug.log('💾 Attempting to create entry...');
    const entry = createEntry({
      content: content.trim(),
      project_tag: projectTag || undefined,
      attribute_tag: attributeTag || '无',
      urgency_tag: urgencyTag || 'Jack 交办',
      daily_report_tag: dailyReportTag || '核心进展',
      resource_tag: resourceTag || '自己搞定',
  

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
    const entries = getAllEntries();
    return { success: true, data: entries };
  } catch (error) {
    debug.error('获取记录失败:', error);
    return { success: false, error: '获取记录失败', data: [] };
  }
}

// 获取今日记录
export async function fetchTodayEntries() {
  try {
    const entries = getTodayEntries();
    return { success: true, data: entries };
  } catch (error) {
    debug.error('获取今日记录失败:', error);
    return { success: false, error: '获取今日记录失败', data: [] };
  }
}

// 搜索记录（基础版本，保持兼容性）
export async function searchEntriesAction(query: string) {
  if (!query || query.trim().length === 0) {
    return await fetchEntries();
  }

  try {
    const entries = searchEntries(query.trim());
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
    deleteEntry(id);
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
  attribute_tag?: string; 
  urgency_tag?: string; 
  daily_report_tag?: string;
  resource_consumption_tag?: string;
  effort_tag?: string;
}) {
  try {
    debug.log('🔄 更新记录:', { id, updates });
    const updatedEntry = updateEntry(id, updates);
    revalidatePath('/');
    return { success: true, data: updatedEntry };
  } catch (error) {
    debug.error('更新记录失败:', error);
    return { success: false, error: '更新记录失败' };
  }
}

// 生成日报
export async function generateDailyReport() {
  try {
    const todayEntries = getTodayEntries();
    
    if (todayEntries.length === 0) {
      return { success: true, data: "今天还没有记录任何内容。" };
    }

    const projects = [...new Set(todayEntries.filter(e => e.project_tag).map(e => e.project_tag || ''))].filter(p => p);

    const report = `# 今日总结 (${new Date().toLocaleDateString('zh-CN')})

## 记录概览
- 总记录数：${todayEntries.length}条
- 涉及项目：${projects.join(', ') || '无'}

## 详细内容
${todayEntries.map((entry, index) => 
  `${index + 1}. ${entry.content}${entry.project_tag ? ` [${entry.project_tag}]` : ''}`
).join('\n')}

---
*由 你好 唱游 自动生成*
`;

    return { success: true, data: report };
  } catch (error) {
    debug.error('生成日报失败:', error);
    return { success: false, error: '生成日报失败' };
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
    const allEntries = getAllEntries();
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
    
    // 删除要合并的源记录
    for (const sourceId of sourceIds) {
      debug.log('🗑️ Deleting source entry:', sourceId);
      deleteEntry(sourceId);
    }
    
    // 如果有目标记录（编辑现有记录时），也删除它
    if (targetId) {
      debug.log('🗑️ Deleting target entry:', targetId);
      deleteEntry(targetId);
    }
    
    // 创建新的合并记录
    debug.log('✨ Creating merged entry with content:', newContent.slice(0, 100) + '...');
    const mergedEntry = createEntry({
      content: newContent.trim(),
      project_tag: undefined // 合并后可以重新设置
    });

    debug.log('✅ Merge completed successfully, new entry ID:', mergedEntry.id);
    revalidatePath('/');
    return { success: true, data: mergedEntry };
  } catch (error) {
    debug.error('❌ 合并记录失败:', error);
    return { success: false, error: '合并记录失败' };
  }
}

// =============智能分析功能=============

// 获取工作模式分析
export async function getWorkAnalysisAction() {
  try {
    const allEntries = getAllEntries();
    const analysis = analyzeWorkPatterns(allEntries);
    return { success: true, data: analysis };
  } catch (error) {
    debug.error('工作模式分析失败:', error);
    return { 
      success: false, 
      error: '工作模式分析失败',
      data: {
        peakHours: [],
        projectDistribution: [],
        importanceDistribution: [],
        weeklyPattern: [],
        productivity_insights: ['分析服务暂时不可用']
      }
    };
  }
}

// 生成智能周报
export async function generateIntelligentWeeklyReportAction() {
  try {
    // 获取最近7天的记录
    const allEntries = getAllEntries();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEntries = allEntries.filter(entry => 
      new Date(entry.created_at) >= oneWeekAgo
    );

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

// 获取个人效率洞察（综合分析）
export async function getProductivityInsightsAction() {
  try {
    const allEntries = getAllEntries();
    const workAnalysis = analyzeWorkPatterns(allEntries);
    
    // 计算一些额外的洞察指标
    const today = new Date();
    const thisWeek = allEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });
    
    const lastWeek = allEntries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && daysDiff <= 14;
    });

    const weeklyGrowth = lastWeek.length > 0 
      ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
      : 0;

    const insights = {
      ...workAnalysis,
      weeklyStats: {
        thisWeek: thisWeek.length,
        lastWeek: lastWeek.length,
        growth: weeklyGrowth
      },
      totalEntries: allEntries.length,
      averageImportance: 0 // 暂时设为0，因为Entry类型中没有importance_tag
    };

    return { success: true, data: insights };
  } catch (error) {
    debug.error('获取效率洞察失败:', error);
    return { 
      success: false, 
      error: '获取效率洞察失败',
      data: null
    };
  }
}

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
    const jsonData = exportToJSON(includeKnowledgeBase);
    const exportData = getExportData(includeKnowledgeBase);
    
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
    const exportData = getExportData(false); // CSV不包含知识库
    
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
    const exportData = getExportData(true);
    
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

// =============记录排序相关操作=============

// 更新记录排序
export async function updateEntriesOrderAction(orderUpdates: Array<{ id: number; sort_order: number }>) {
  try {
    debug.log('🔄 更新记录排序:', orderUpdates.map(u => ({ id: u.id, order: u.sort_order })));
    updateEntriesOrder(orderUpdates);
    revalidatePath('/');
    return { success: true, data: { updated: orderUpdates.length } };
  } catch (error) {
    debug.error('更新记录排序失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '更新记录排序失败' 
    };
  }
}

// =============批量操作相关Server Actions=============

// 批量删除记录
export async function batchDeleteEntriesAction(ids: number[]) {
  try {
    debug.log(`🗑️ Batch deleting ${ids.length} entries:`, ids);
    
    for (const id of ids) {
      deleteEntry(id);
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
  attribute_tag?: string; 
  urgency_tag?: string; 
  resource_consumption_tag?: string;
}) {
  try {
    debug.log(`📝 Batch updating ${ids.length} entries:`, { ids, updates });
    
    for (const id of ids) {
      updateEntry(id, updates);
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

// 批量删除Todo
export async function batchDeleteTodosAction(ids: number[]) {
  try {
    debug.log(`🗑️ Batch deleting ${ids.length} todos:`, ids);
    
    let deletedCount = 0;
    for (const id of ids) {
      const success = deleteTodo(id);
      if (success) deletedCount++;
    }
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { deletedCount, message: `✅ 已删除 ${deletedCount} 个待办事项` }
    };
  } catch (error) {
    debug.error('批量删除Todo失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '批量删除待办事项失败' 
    };
  }
}

// 批量更新Todo状态
export async function batchUpdateTodosAction(ids: number[], updates: { 
  status?: Todo['status'];
  priority?: Todo['priority'];
}) {
  try {
    debug.log(`📝 Batch updating ${ids.length} todos:`, { ids, updates });
    
    let updatedCount = 0;
    for (const id of ids) {
      try {
        updateTodo(id, updates);
        updatedCount++;
      } catch (error) {
        debug.error(`Failed to update todo ${id}:`, error);
      }
    }
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { updatedCount, message: `✅ 已更新 ${updatedCount} 个待办事项` }
    };
  } catch (error) {
    debug.error('批量更新Todo失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '批量更新待办事项失败' 
    };
  }
}

// ================================
// Todo相关Server Actions
// ================================

import type { CreateTodo, Todo } from '@/types/index';

// 创建新的Todo
export async function createTodoAction(formData: FormData) {
  debug.log('🔄 createTodoAction called with FormData');
  
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as 'low' | 'medium' | 'high';
  const weekday = formData.get('weekday') as string;
  const project_tag = formData.get('project_tag') as string;

  debug.log('📝 Todo data:', {
    title: title?.slice(0, 50) + '...',
    priority,
    weekday,
    project_tag
  });

  if (!title || title.trim().length === 0) {
    debug.error('❌ Todo title is empty');
    return { 
      success: false, 
      error: '任务标题不能为空' 
    };
  }

  try {
    debug.log('💾 Attempting to create todo...');
    const todoData: CreateTodo = {
      title: title.trim(),
      description: description?.trim() || undefined,
      priority: priority || 'medium',
      weekday: (weekday?.trim() && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(weekday.trim())) ? weekday.trim() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' : undefined,
      project_tag: project_tag?.trim() || undefined
    };
    
    const todo = createTodo(todoData);
    debug.log('✅ Todo created successfully:', todo.id);
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { todo, message: '✅ 任务创建成功！' }
    };
  } catch (error) {
    debug.error('❌ Failed to create todo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '创建任务失败' 
    };
  }
}

// 获取所有Todo
export async function getAllTodosAction() {
  try {
    const todos = getAllTodos();
    return { success: true, data: todos };
  } catch (error) {
    debug.error('获取所有Todo失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取任务列表失败' 
    };
  }
}



// 更新Todo状态
export async function updateTodoStatusAction(id: number, status: Todo['status']) {
  try {
    debug.log(`🔄 更新Todo状态: ${id} -> ${status}`);
    const updatedTodo = updateTodoStatus(id, status);
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { todo: updatedTodo, message: '✅ 任务状态更新成功！' }
    };
  } catch (error) {
    debug.error('更新Todo状态失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '更新任务状态失败' 
    };
  }
}

// 更新Todo
export async function updateTodoAction(id: number, updates: Partial<Todo>) {
  try {
    debug.log(`🔄 更新Todo: ${id}`, updates);
    const updatedTodo = updateTodo(id, updates);
    
    revalidatePath('/');
    return { 
      success: true, 
      data: { todo: updatedTodo, message: '✅ 任务更新成功！' }
    };
  } catch (error) {
    debug.error('更新Todo失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '更新任务失败' 
    };
  }
}

// 删除Todo
export async function deleteTodoAction(id: number) {
  try {
    debug.log(`🗑️ 删除Todo: ${id}`);
    const success = deleteTodo(id);
    
    if (success) {
      revalidatePath('/');
      return { 
        success: true, 
        data: { message: '✅ 任务删除成功！' }
      };
    } else {
      return { 
        success: false, 
        error: '任务不存在或删除失败' 
      };
    }
  } catch (error) {
    debug.error('删除Todo失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '删除任务失败' 
    };
  }
}

// 获取Todo统计信息
export async function getTodoStatsAction() {
  try {
    const stats = getTodoStats();
    return { success: true, data: stats };
  } catch (error) {
    debug.error('获取Todo统计失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '获取统计信息失败' 
    };
  }
}

// 批量更新Todos排序顺序
export async function updateTodosOrderAction(updates: Array<{ id: number; sort_order: number; }>) {
  try {
    debug.log('🔄 updateTodosOrderAction called with updates:', updates);
    const success = updateTodosOrder(updates);
    
    if (success) {
      revalidatePath('/');
      return { 
        success: true, 
        data: { message: '✅ 排序更新成功！' }
      };
    } else {
      return { 
        success: false, 
        error: '排序更新失败' 
      };
    }
  } catch (error) {
    debug.error('更新Todo排序失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '排序更新失败' 
    };
  }
}