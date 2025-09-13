import { supabase, handleDbError, type DbResult, type PaginationParams, applyPagination } from '@/lib/supabase-client';
import type { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];
type Subtask = Database['public']['Tables']['subtasks']['Row'];
type SubtaskInsert = Database['public']['Tables']['subtasks']['Insert'];

// 获取所有任务
export async function getAllTasks(params?: PaginationParams): Promise<DbResult<Task[]>> {
  let query = supabase
    .from('tasks')
    .select('*');

  query = applyPagination(query, params);

  const result = await query;
  return handleDbError(result);
}

// 获取今日任务
export async function getTodayTasks(): Promise<DbResult<Task[]>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const result = await supabase
    .from('tasks')
    .select('*')
    .or(`due_date.gte.${today.toISOString()},due_date.lt.${tomorrow.toISOString()}`)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 获取过期任务
export async function getOverdueTasks(): Promise<DbResult<Task[]>> {
  const now = new Date().toISOString();

  const result = await supabase
    .from('tasks')
    .select('*')
    .lt('due_date', now)
    .neq('status', 'done')
    .order('due_date', { ascending: true });

  return handleDbError(result);
}

// 根据 ID 获取任务
export async function getTaskById(id: string): Promise<DbResult<Task>> {
  const result = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  return handleDbError(result);
}

// 创建任务
export async function createTask(taskData: TaskInsert): Promise<DbResult<Task>> {
  const now = new Date().toISOString();
  const taskWithDefaults: TaskInsert = {
    status: 'todo',
    priority: 'medium',
    actual_hours: 0,
    created_at: now,
    updated_at: now,
    ...taskData,
    id: taskData.id || crypto.randomUUID(),
  };

  const result = await supabase
    .from('tasks')
    .insert(taskWithDefaults)
    .select()
    .single();

  return handleDbError(result);
}

// 更新任务
export async function updateTask(id: string, updates: TaskUpdate): Promise<DbResult<Task>> {
  const updateData: TaskUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // 如果状态变为 done，设置完成时间
  if (updates.status === 'done' && !updates.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }
  // 如果状态不是 done，清除完成时间
  else if (updates.status && updates.status !== 'done') {
    updateData.completed_at = null;
  }

  const result = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return handleDbError(result);
}

// 删除任务
export async function deleteTask(id: string): Promise<DbResult<boolean>> {
  // 先删除相关的子任务
  await supabase
    .from('subtasks')
    .delete()
    .eq('task_id', id);

  const result = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (result.error) {
    return handleDbError(result);
  }

  return { data: true, error: null, success: true };
}

// 获取任务的子任务
export async function getSubtasks(taskId: string): Promise<DbResult<Subtask[]>> {
  const result = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  return handleDbError(result);
}

// 创建子任务
export async function createSubtask(subtaskData: SubtaskInsert): Promise<DbResult<Subtask>> {
  const subtaskWithDefaults: SubtaskInsert = {
    completed: false,
    created_at: new Date().toISOString(),
    ...subtaskData,
    id: subtaskData.id || crypto.randomUUID(),
  };

  const result = await supabase
    .from('subtasks')
    .insert(subtaskWithDefaults)
    .select()
    .single();

  return handleDbError(result);
}

// 更新子任务
export async function updateSubtask(id: string, updates: Partial<Subtask>): Promise<DbResult<Subtask>> {
  const result = await supabase
    .from('subtasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return handleDbError(result);
}

// 删除子任务
export async function deleteSubtask(id: string): Promise<DbResult<boolean>> {
  const result = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id);

  if (result.error) {
    return handleDbError(result);
  }

  return { data: true, error: null, success: true };
}

// 按状态获取任务
export async function getTasksByStatus(status: NonNullable<Task['status']>): Promise<DbResult<Task[]>> {
  const result = await supabase
    .from('tasks')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 按优先级获取任务
export async function getTasksByPriority(priority: NonNullable<Task['priority']>): Promise<DbResult<Task[]>> {
  const result = await supabase
    .from('tasks')
    .select('*')
    .eq('priority', priority)
    .order('due_date', { ascending: true });

  return handleDbError(result);
}

// 搜索任务
export async function searchTasks(query: string): Promise<DbResult<Task[]>> {
  const result = await supabase
    .from('tasks')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 批量更新任务状态
export async function batchUpdateTaskStatus(
  taskIds: string[], 
  status: Task['status']
): Promise<DbResult<Task[]>> {
  const now = new Date().toISOString();
  const updates: TaskUpdate = {
    status,
    updated_at: now,
  };

  // 如果状态是完成，设置完成时间
  if (status === 'done') {
    updates.completed_at = now;
  }

  const result = await supabase
    .from('tasks')
    .update(updates)
    .in('id', taskIds)
    .select();

  return handleDbError(result);
}

// 获取任务统计信息
export async function getTaskStats(): Promise<DbResult<{
  total: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  cancelled: number;
  overdue: number;
}>> {
  try {
    const now = new Date().toISOString();

    // 获取所有任务统计
    const { data: allTasks, error: allError } = await supabase
      .from('tasks')
      .select('status, due_date');

    if (allError) {
      return handleDbError({ data: null, error: allError });
    }

    // 获取过期任务数量
    const { count: overdueCount, error: overdueError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .lt('due_date', now)
      .neq('status', 'done');

    if (overdueError) {
      return handleDbError({ data: null, error: overdueError });
    }

    const stats = {
      total: allTasks?.length || 0,
      todo: allTasks?.filter(t => t.status === 'todo').length || 0,
      in_progress: allTasks?.filter(t => t.status === 'in_progress').length || 0,
      review: allTasks?.filter(t => t.status === 'review').length || 0,
      done: allTasks?.filter(t => t.status === 'done').length || 0,
      cancelled: allTasks?.filter(t => t.status === 'cancelled').length || 0,
      overdue: overdueCount || 0,
    };

    return { data: stats, error: null, success: true };
  } catch (error: any) {
    return { data: null, error: error.message, success: false };
  }
}