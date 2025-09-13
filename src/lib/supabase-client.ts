import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase 连接配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建 Supabase 客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 当前不使用用户认证
  },
  db: {
    schema: 'public',
  },
});

// 数据库操作结果类型
export type DbResult<T> = {
  data: T | null;
  error: string | null;
  success: boolean;
};

// 统一的错误处理函数
export function handleDbError<T>(
  result: { data: T | null; error: any }
): DbResult<T> {
  if (result.error) {
    console.error('Supabase operation failed:', result.error);
    return {
      data: null,
      error: result.error.message || 'Database operation failed',
      success: false,
    };
  }

  return {
    data: result.data,
    error: null,
    success: true,
  };
}

// 分页查询参数
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'desc' as const,
};

// 应用分页参数到查询
export function applyPagination(
  query: any,
  params: PaginationParams = {}
) {
  const { page, limit, sortBy, sortOrder } = {
    ...DEFAULT_PAGINATION,
    ...params,
  };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return query
    .range(from, to)
    .order(sortBy, { ascending: sortOrder === 'asc' });
}

// 连接测试函数
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('entries').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
}