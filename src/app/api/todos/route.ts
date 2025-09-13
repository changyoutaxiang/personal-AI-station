import { NextResponse } from 'next/server';
import { getAllTodos, getTodosByCategory } from '@/lib/supabase/todos';

// GET /api/todos?category=today|week|overdue
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'today';

    // 使用 Supabase todos 表获取数据
    const result = category === 'all'
      ? await getAllTodos()
      : await getTodosByCategory(category);

    if (!result.success) {
      console.error('Supabase todos error:', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    const todoRecords = result.data || [];

    // 计算过期任务
    const now = new Date();
    const todosWithOverdue = todoRecords.map(todo => {
      const isOverdue = todo.due_date && new Date(todo.due_date) < now && todo.completed === 0;
      return {
        ...todo,
        isOverdue
      };
    });

    // 按优先级和过期状态排序：过期任务 > 高优先级 > 其他
    todosWithOverdue.sort((a, b) => {
      // 过期任务优先
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      // 优先级排序
      return b.priority - a.priority;
    });

    return NextResponse.json({
      ok: true,
      data: todosWithOverdue,
      meta: {
        total: todosWithOverdue.length,
        overdue: todosWithOverdue.filter(t => t.isOverdue).length,
        completed: todosWithOverdue.filter(t => t.completed === 1).length
      }
    });
  } catch (err: any) {
    console.error('Todos API Error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// POST /api/todos  创建待办（真正保存到数据库）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'text 为必填字段' }, { status: 400 });
    }

    // 导入 Supabase 数据库函数
    const { createTodo } = await import('@/lib/supabase/todos');

    // 转换前端数据格式到数据库格式
    const todoData = {
      text: body.text.trim(),
      priority: body.priority === 'high' ? 2 : body.priority === 'low' ? 0 : 1,
      category: body.category || 'today',
      dueDate: body.dueDate,
      tags: body.tags || [],
      completed: false
    };

    // 保存到 Supabase
    const result = await createTodo(todoData);

    if (!result.success) {
      console.error('Create todo error:', result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err: any) {
    console.error('Create Todo Error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}
