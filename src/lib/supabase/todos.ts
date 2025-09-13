import { supabase, handleDbError, type DbResult } from '@/lib/supabase-client';

// Todo 类型定义
export interface TodoRecord {
  id: string;
  title: string;
  content?: string;
  tags?: string;
  priority: number;
  due_date?: string;
  source?: string;
  version: number;
  completed: number;
  category?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  text: string;
  priority: number;
  category: string;
  dueDate?: string;
  tags?: string[];
  completed: boolean;
}

// 获取所有 todos
export async function getAllTodos(): Promise<DbResult<TodoRecord[]>> {
  const result = await supabase
    .from('todos')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 根据分类获取 todos
export async function getTodosByCategory(category: string): Promise<DbResult<TodoRecord[]>> {
  const result = await supabase
    .from('todos')
    .select('*')
    .eq('category', category)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  return handleDbError(result);
}

// 根据 ID 获取 todo
export async function getTodoById(id: string): Promise<DbResult<TodoRecord>> {
  const result = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();

  return handleDbError(result);
}

// 创建 todo
export async function createTodo(todoData: CreateTodoData): Promise<DbResult<TodoRecord>> {
  const now = new Date().toISOString();

  // 获取最大排序值
  const { data: maxOrderData } = await supabase
    .from('todos')
    .select('sort_order')
    .eq('category', todoData.category)
    .order('sort_order', { ascending: false })
    .limit(1);

  const maxOrder = maxOrderData?.[0]?.sort_order || 0;

  const newTodo: Omit<TodoRecord, 'created_at' | 'updated_at'> = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: todoData.text,
    content: JSON.stringify({
      text: todoData.text,
      priority: todoData.priority === 2 ? 'high' : todoData.priority === 0 ? 'low' : 'medium',
      category: todoData.category,
      dueDate: todoData.dueDate,
      tags: todoData.tags || [],
      completed: todoData.completed
    }),
    tags: JSON.stringify(todoData.tags || []),
    priority: todoData.priority,
    due_date: todoData.dueDate,
    source: 'web',
    version: 1,
    completed: todoData.completed ? 1 : 0,
    category: todoData.category,
    sort_order: maxOrder + 1
  };

  const result = await supabase
    .from('todos')
    .insert(newTodo)
    .select()
    .single();

  return handleDbError(result);
}

// 更新 todo
export async function updateTodo(id: string, updates: Record<string, any>): Promise<DbResult<TodoRecord>> {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString()
  };

  // 处理不同的更新字段
  if (updates.text !== undefined) {
    updateData.title = updates.text;
  }
  if (updates.completed !== undefined) {
    updateData.completed = updates.completed ? 1 : 0;
  }
  if (updates.priority !== undefined) {
    updateData.priority = updates.priority;
  }
  if (updates.category !== undefined) {
    updateData.category = updates.category;
  }
  if (updates.due_date !== undefined) {
    updateData.due_date = updates.due_date;
  }
  if (updates.tags !== undefined) {
    updateData.tags = JSON.stringify(updates.tags);
  }

  // 更新 content 字段中的 JSON 数据
  if (updates.text !== undefined || updates.completed !== undefined || updates.priority !== undefined) {
    // 先获取当前记录
    const { data: currentTodo } = await supabase
      .from('todos')
      .select('content')
      .eq('id', id)
      .single();

    if (currentTodo?.content) {
      try {
        const currentContent = JSON.parse(currentTodo.content);
        const newContent = {
          ...currentContent,
          ...(updates.text !== undefined && { text: updates.text }),
          ...(updates.completed !== undefined && { completed: updates.completed }),
          ...(updates.priority !== undefined && {
            priority: updates.priority === 2 ? 'high' : updates.priority === 0 ? 'low' : 'medium'
          })
        };
        updateData.content = JSON.stringify(newContent);
      } catch (e) {
        console.warn('Failed to parse content JSON:', e);
      }
    }
  }

  const result = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  return handleDbError(result);
}

// 删除 todo
export async function deleteTodo(id: string): Promise<DbResult<boolean>> {
  // 先删除相关的事件日志
  await supabase
    .from('todos_events')
    .delete()
    .eq('entity_id', id);

  const result = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (result.error) {
    return {
      data: null,
      error: result.error.message || 'Delete todo failed',
      success: false,
    };
  }

  return { data: true, error: null, success: true };
}

// 批量更新 todo 排序
export async function updateTodosSortOrder(todoIds: string[], newSortOrders: number[]): Promise<DbResult<boolean>> {
  if (todoIds.length !== newSortOrders.length) {
    return {
      data: null,
      error: 'todoIds and newSortOrders arrays must have the same length',
      success: false
    };
  }

  try {
    // 批量更新排序
    const updates = todoIds.map((id, index) => ({
      id,
      sort_order: newSortOrders[index],
      updated_at: new Date().toISOString()
    }));

    for (const update of updates) {
      await supabase
        .from('todos')
        .update({ sort_order: update.sort_order, updated_at: update.updated_at })
        .eq('id', update.id);
    }

    return { data: true, error: null, success: true };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to update sort orders',
      success: false
    };
  }
}

// 获取 todo 统计信息
export async function getTodoStats(): Promise<DbResult<{
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}>> {
  try {
    const now = new Date().toISOString();

    // 获取所有 todos
    const { data: allTodos, error: allError } = await supabase
      .from('todos')
      .select('completed, due_date');

    if (allError) {
      return {
        data: null,
        error: allError.message || 'Failed to fetch todo statistics',
        success: false,
      };
    }

    // 计算统计信息
    const total = allTodos?.length || 0;
    const completed = allTodos?.filter(t => t.completed === 1).length || 0;
    const pending = total - completed;
    const overdue = allTodos?.filter(t =>
      t.completed === 0 &&
      t.due_date &&
      t.due_date < now
    ).length || 0;

    return {
      data: { total, completed, pending, overdue },
      error: null,
      success: true
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || 'Failed to calculate todo statistics',
      success: false
    };
  }
}