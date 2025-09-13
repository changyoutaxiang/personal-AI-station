import { supabase, handleDbError, type DbResult, type PaginationParams, applyPagination } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type Entry = Database['public']['Tables']['entries']['Row'];
type EntryInsert = Database['public']['Tables']['entries']['Insert'];
type EntryUpdate = Database['public']['Tables']['entries']['Update'];

// 获取所有条目
export async function getAllEntries(params?: PaginationParams): Promise<DbResult<Entry[]>> {
  let query = supabase
    .from('entries')
    .select('*');

  query = applyPagination(query, params);

  const result = await query;
  return handleDbError(result);
}

// 根据 ID 获取条目
export async function getEntryById(id: number): Promise<DbResult<Entry>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single();

  return handleDbError(result);
}

// 创建条目
export async function createEntry(entryData: EntryInsert): Promise<DbResult<Entry>> {
  const now = new Date().toISOString();
  const entryWithDefaults: EntryInsert = {
    effort_tag: '轻松',
    sort_order: 0,
    daily_report_tag: '无',
    created_at: now,
    updated_at: now,
    ...entryData,
  };

  const result = await supabase
    .from('entries')
    .insert(entryWithDefaults)
    .select()
    .single();

  return handleDbError(result);
}

// 更新条目
export async function updateEntry(id: number, updates: EntryUpdate): Promise<DbResult<Entry>> {
  const updateData: EntryUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const result = await supabase
    .from('entries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return handleDbError(result);
}

// 删除条目
export async function deleteEntry(id: number): Promise<DbResult<boolean>> {
  const result = await supabase
    .from('entries')
    .delete()
    .eq('id', id);

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Delete operation failed',
      success: false,
    };
  }

  return { data: true, error: null, success: true };
}

// 按项目标签获取条目
export async function getEntriesByProjectTag(projectTag: string): Promise<DbResult<Entry[]>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .eq('project_tag', projectTag)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 按努力标签获取条目
export async function getEntriesByEffortTag(effortTag: string): Promise<DbResult<Entry[]>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .eq('effort_tag', effortTag)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 按日报标签获取条目
export async function getEntriesByDailyReportTag(dailyReportTag: string): Promise<DbResult<Entry[]>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .eq('daily_report_tag', dailyReportTag)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 搜索条目
export async function searchEntries(query: string): Promise<DbResult<Entry[]>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .textSearch('content', query)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 获取所有项目标签
export async function getProjectTags(): Promise<DbResult<string[]>> {
  const result = await supabase
    .from('entries')
    .select('project_tag')
    .not('project_tag', 'is', null);

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to fetch project tags',
      success: false,
    };
  }

  const uniqueTags = [...new Set(result.data?.map(item => item.project_tag).filter((tag): tag is string => Boolean(tag)) || [])];
  return { data: uniqueTags, error: null, success: true };
}

// 获取所有努力标签
export async function getEffortTags(): Promise<DbResult<string[]>> {
  const result = await supabase
    .from('entries')
    .select('effort_tag')
    .not('effort_tag', 'is', null);

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to fetch effort tags',
      success: false,
    };
  }

  const uniqueTags = [...new Set(result.data?.map(item => item.effort_tag).filter((tag): tag is string => Boolean(tag)) || [])];
  return { data: uniqueTags, error: null, success: true };
}

// 获取所有日报标签
export async function getDailyReportTags(): Promise<DbResult<string[]>> {
  const result = await supabase
    .from('entries')
    .select('daily_report_tag')
    .not('daily_report_tag', 'is', null);

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Failed to fetch daily report tags',
      success: false,
    };
  }

  const uniqueTags = [...new Set(result.data?.map(item => item.daily_report_tag).filter((tag): tag is string => Boolean(tag)) || [])];
  return { data: uniqueTags, error: null, success: true };
}

// 批量更新条目排序
export async function batchUpdateEntrySortOrder(updates: { id: number; sort_order: number }[]): Promise<DbResult<boolean>> {
  try {
    const promises = updates.map(({ id, sort_order }) =>
      supabase
        .from('entries')
        .update({ sort_order, updated_at: new Date().toISOString() })
        .eq('id', id)
    );

    const results = await Promise.all(promises);
    
    // 检查是否有错误
    const hasError = results.some(result => result.error);
    if (hasError) {
      const errors = results.filter(result => result.error).map(result => result.error);
      return { data: null, error: errors[0]?.message || 'Batch update failed', success: false };
    }

    return { data: true, error: null, success: true };
  } catch (error: any) {
    return { data: null, error: error.message, success: false };
  }
}

// 按日期范围获取条目
export async function getEntriesByDateRange(startDate: string, endDate: string): Promise<DbResult<Entry[]>> {
  const result = await supabase
    .from('entries')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 获取条目统计信息
export async function getEntryStats(): Promise<DbResult<{
  total: number;
  byProjectTag: Record<string, number>;
  byEffortTag: Record<string, number>;
  byDailyReportTag: Record<string, number>;
  recentCount: number;
}>> {
  try {
    // 获取所有条目
    const { data: allEntries, error } = await supabase
      .from('entries')
      .select('project_tag, effort_tag, daily_report_tag, created_at');

    if (error) {
      return {
        data: null,
        error: error.message || 'Failed to fetch entry statistics',
        success: false,
      };
    }

    const entries = allEntries || [];
    
    // 统计各种标签的分布
    const byProjectTag: Record<string, number> = {};
    const byEffortTag: Record<string, number> = {};
    const byDailyReportTag: Record<string, number> = {};

    entries.forEach(entry => {
      if (entry.project_tag) {
        byProjectTag[entry.project_tag] = (byProjectTag[entry.project_tag] || 0) + 1;
      }
      if (entry.effort_tag) {
        byEffortTag[entry.effort_tag] = (byEffortTag[entry.effort_tag] || 0) + 1;
      }
      if (entry.daily_report_tag) {
        byDailyReportTag[entry.daily_report_tag] = (byDailyReportTag[entry.daily_report_tag] || 0) + 1;
      }
    });

    // 统计最近7天的条目数量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCount = entries.filter(entry =>
      entry.created_at && new Date(entry.created_at) >= sevenDaysAgo
    ).length;

    const stats = {
      total: entries.length,
      byProjectTag,
      byEffortTag,
      byDailyReportTag,
      recentCount,
    };

    return { data: stats, error: null, success: true };
  } catch (error: any) {
    return { data: null, error: error.message, success: false };
  }
}