// Supabase 数据访问层统一导出文件
export * from './tasks';
export * from './entries';

// 通用导出
export { supabase, testConnection, type DbResult, type PaginationParams } from '@/lib/supabase-client';
export type { Database } from '@/types/supabase';

// 数据库切换配置
export const DATABASE_TYPE = process.env.DATABASE_TYPE || 'sqlite';

// 判断是否使用 Supabase
export const useSupabase = () => DATABASE_TYPE === 'supabase';

// 统一的数据库选择器（暂时用于过渡期）
export function selectDatabase() {
  if (useSupabase()) {
    return 'supabase';
  }
  return 'sqlite';
}