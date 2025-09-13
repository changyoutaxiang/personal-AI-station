/**
 * Supabase 数据库操作层 - 完全替代 SQLite 实现
 * 提供与原有 db.ts 相同的 API 接口，但使用 Supabase 后端
 */

import {
  getAllEntries as supabaseGetAllEntries,
  createEntry as supabaseCreateEntry,
  updateEntry as supabaseUpdateEntry,
  deleteEntry as supabaseDeleteEntry,
  searchEntries as supabaseSearchEntries,
  getEntriesByDateRange,
  getProjectTags,
  getEffortTags,
  getDailyReportTags,
  getEntryStats
} from './supabase/entries';

import {
  getAllTodos as supabaseGetAllTodos,
  getTodosByCategory,
  createTodo as supabaseCreateTodo,
  updateTodo as supabaseUpdateTodo,
  deleteTodo as supabaseDeleteTodo,
  updateTodosSortOrder,
  getTodoStats
} from './supabase/todos';

import { supabase } from './supabase-client';
import { debug } from './debug';

// 类型定义 - 兼容原有接口
export interface Entry {
  id: number;
  content: string;
  project_tag?: string;
  effort_tag?: string;
  daily_report_tag?: string;
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export interface Todo {
  id: string;
  text: string;
  priority: number;
  category: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags?: string[];
  sort_order: number;
}

export interface CreateEntryData {
  content: string;
  project_tag?: string;
  effort_tag?: string;
  daily_report_tag?: string;
}

export interface UpdateEntryData {
  content?: string;
  project_tag?: string;
  effort_tag?: string;
  daily_report_tag?: string;
}

export interface CreateTodoData {
  text: string;
  priority: number;
  category: string;
  dueDate?: string;
  tags?: string[];
  completed: boolean;
}

// === 记录相关操作 ===

export function createEntry(data: CreateEntryData): Entry {
  debug.log('📝 Creating entry via Supabase...');

  // 由于原有的 db.ts 是同步的，我们需要保持同步接口
  // 实际的异步调用需要在 actions.ts 中处理
  throw new Error('createEntry 现在是异步的，请使用 createEntryAsync');
}

export async function createEntryAsync(data: CreateEntryData): Promise<Entry> {
  debug.log('📝 Creating entry via Supabase async...');

  const result = await supabaseCreateEntry({
    content: data.content,
    project_tag: data.project_tag,
    effort_tag: data.effort_tag || '轻松',
    daily_report_tag: data.daily_report_tag || '无'
  });

  if (!result.success || !result.data) {
    throw new Error(`Failed to create entry: ${result.error}`);
  }

  return result.data;
}

export function getAllEntries(): Entry[] {
  debug.log('📚 Getting all entries via Supabase...');

  // 由于原有的 db.ts 是同步的，我们需要保持同步接口
  // 实际的异步调用需要在 actions.ts 中处理
  throw new Error('getAllEntries 现在是异步的，请使用 getAllEntriesAsync');
}

export async function getAllEntriesAsync(): Promise<Entry[]> {
  debug.log('📚 Getting all entries via Supabase async...');

  const result = await supabaseGetAllEntries();

  if (!result.success || !result.data) {
    debug.log('❌ Failed to get entries:', result.error);
    return [];
  }

  return result.data;
}

export function getTodayEntries(): Entry[] {
  throw new Error('getTodayEntries 现在是异步的，请使用 getTodayEntriesAsync');
}

export async function getTodayEntriesAsync(): Promise<Entry[]> {
  debug.log('📅 Getting today entries via Supabase...');

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

  const result = await getEntriesByDateRange(todayStart, todayEnd);

  if (!result.success || !result.data) {
    debug.log('❌ Failed to get today entries:', result.error);
    return [];
  }

  return result.data;
}

export function getThisWeekEntries(): Entry[] {
  throw new Error('getThisWeekEntries 现在是异步的，请使用 getThisWeekEntriesAsync');
}

export async function getThisWeekEntriesAsync(): Promise<Entry[]> {
  debug.log('📅 Getting this week entries via Supabase...');

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const result = await getEntriesByDateRange(startOfWeek.toISOString(), endOfWeek.toISOString());

  if (!result.success || !result.data) {
    debug.log('❌ Failed to get this week entries:', result.error);
    return [];
  }

  return result.data;
}

export function deleteEntry(id: number): void {
  throw new Error('deleteEntry 现在是异步的，请使用 deleteEntryAsync');
}

export async function deleteEntryAsync(id: number): Promise<void> {
  debug.log('🗑️ Deleting entry via Supabase...');

  const result = await supabaseDeleteEntry(id);

  if (!result.success) {
    throw new Error(`Failed to delete entry: ${result.error}`);
  }
}

export function searchEntries(query: string): Entry[] {
  throw new Error('searchEntries 现在是异步的，请使用 searchEntriesAsync');
}

export async function searchEntriesAsync(query: string): Promise<Entry[]> {
  debug.log('🔍 Searching entries via Supabase...');

  const result = await supabaseSearchEntries(query);

  if (!result.success || !result.data) {
    debug.log('❌ Failed to search entries:', result.error);
    return [];
  }

  return result.data;
}

export function updateEntry(id: number, updates: UpdateEntryData): Entry {
  throw new Error('updateEntry 现在是异步的，请使用 updateEntryAsync');
}

export async function updateEntryAsync(id: number, updates: UpdateEntryData): Promise<Entry> {
  debug.log('🔄 Updating entry via Supabase...');

  const result = await supabaseUpdateEntry(id, updates);

  if (!result.success || !result.data) {
    throw new Error(`Failed to update entry: ${result.error}`);
  }

  return result.data;
}

// === TODO 相关操作 ===

export function listTodos(filters: { category?: string } = {}): Todo[] {
  throw new Error('listTodos 现在是异步的，请使用 listTodosAsync');
}

export async function listTodosAsync(filters: { category?: string } = {}): Promise<Todo[]> {
  debug.log('📋 Getting todos via Supabase...');

  let result;

  if (filters.category) {
    result = await getTodosByCategory(filters.category);
  } else {
    result = await supabaseGetAllTodos();
  }

  if (!result.success || !result.data) {
    debug.log('❌ Failed to get todos:', result.error);
    return [];
  }

  // 转换为兼容格式
  return result.data.map(todo => ({
    id: todo.id,
    text: todo.title,
    priority: todo.priority,
    category: todo.category || 'today',
    completed: todo.completed === 1,
    created_at: todo.created_at,
    updated_at: todo.updated_at,
    due_date: todo.due_date,
    tags: todo.tags ? JSON.parse(todo.tags) : [],
    sort_order: todo.sort_order
  }));
}

// === 知识库和统计相关（占位符实现）===

export function getAllKnowledgeDocuments(): any[] {
  debug.log('📚 getAllKnowledgeDocuments - placeholder implementation');
  return [];
}

export function getKnowledgeStats(): any {
  debug.log('📊 getKnowledgeStats - placeholder implementation');
  return {
    totalDocs: 0,
    totalWords: 0,
    categories: {}
  };
}

// === 导出相关（占位符实现）===

export function exportToJSON(): string {
  debug.log('📁 exportToJSON - placeholder implementation');
  return JSON.stringify({ message: 'Export functionality moved to Supabase implementation' });
}

export function exportToCSV(): string {
  debug.log('📁 exportToCSV - placeholder implementation');
  return 'message,Export functionality moved to Supabase implementation';
}

export function getExportData(): any {
  debug.log('📁 getExportData - placeholder implementation');
  return { message: 'Export functionality moved to Supabase implementation' };
}

// === 数据验证和健康检查 ===

export function validateDataIntegrity(): any {
  debug.log('✅ validateDataIntegrity - placeholder implementation');
  return { valid: true, message: 'Data validation moved to Supabase implementation' };
}

export async function quickHealthCheck(): Promise<any> {
  debug.log('🏥 Quick health check via Supabase...');

  try {
    const { data, error } = await supabase
      .from('entries')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      return {
        status: 'error',
        message: `Supabase health check failed: ${error.message}`,
        database: 'supabase'
      };
    }

    return {
      status: 'ok',
      message: 'Supabase connection healthy',
      database: 'supabase',
      entriesCount: data
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: `Health check failed: ${error.message}`,
      database: 'supabase'
    };
  }
}

// === 搜索历史（占位符实现）===

export function saveSearchHistory(query: string): void {
  debug.log('💾 saveSearchHistory - placeholder implementation');
}

export function getSearchHistory(): any[] {
  debug.log('📚 getSearchHistory - placeholder implementation');
  return [];
}

export function getPopularSearches(): any[] {
  debug.log('📚 getPopularSearches - placeholder implementation');
  return [];
}

export function toggleFavoriteSearch(query: string): void {
  debug.log('⭐ toggleFavoriteSearch - placeholder implementation');
}

export function getFavoriteSearches(): any[] {
  debug.log('⭐ getFavoriteSearches - placeholder implementation');
  return [];
}

export function deleteSearchHistory(id: number): void {
  debug.log('🗑️ deleteSearchHistory - placeholder implementation');
}

export function clearSearchHistory(): void {
  debug.log('🗑️ clearSearchHistory - placeholder implementation');
}

// === 增强报告相关 ===

export function getEnhancedWeeklyReportData(): any {
  debug.log('📊 getEnhancedWeeklyReportData - placeholder implementation');
  return {};
}

// === AI 模型配置 ===

export function getAIModelConfig(): any {
  debug.log('🤖 getAIModelConfig - placeholder implementation');
  return {
    model: 'anthropic/claude-3.5-sonnet',
    provider: 'openrouter'
  };
}

// === 迁移辅助函数 ===

export const isUsingSupabase = () => true;
export const getDatabaseType = () => 'supabase';

debug.log('✅ Supabase database layer initialized');