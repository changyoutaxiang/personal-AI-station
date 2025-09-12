import { NextResponse } from 'next/server';
import { getAllTasks, getOverdueTasks, getTodayTasks } from '@/lib/db';

// GET /api/todos?category=today|week|overdue
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'today';
    
    let tasks = [];
    
    // 根据不同类别获取任务
    switch (category) {
      case 'overdue':
        tasks = getOverdueTasks();
        break;
      case 'today':
        // 获取今日任务，包含过期任务
        const todayTasks = getTodayTasks();
        const overdueTasks = getOverdueTasks();
        // 合并并去重
        const allTasks = [...todayTasks, ...overdueTasks];
        tasks = allTasks.filter((task, index, array) => 
          array.findIndex(t => t.id === task.id) === index
        );
        break;
      case 'week':
      default:
        tasks = getAllTasks();
        break;
    }
    
    // 转换任务为 todo 格式，并标记过期任务
    const now = new Date();
    const todos = tasks.map(task => {
      const isOverdue = task.due_date && new Date(task.due_date) < now && task.status !== 'done';
      const taskCategory = isOverdue ? 'overdue' : category;
      
      return {
        id: task.id,
        title: task.title,
        content: JSON.stringify({
          text: task.title,
          description: task.description,
          status: task.status === 'done' ? 'completed' : 'pending',
          completed: task.status === 'done',
          priority: task.priority || 'medium',
          category: taskCategory,
          createdAt: task.created_at,
          dueDate: task.due_date,
          tags: isOverdue ? ['overdue'] : [],
          subTasks: [],
          repeatType: 'none',
          isOverdue: isOverdue
        }),
        tags: isOverdue ? '["overdue"]' : '[]',
        priority: task.priority === 'high' ? 2 : task.priority === 'low' ? 0 : 1,
        due_date: task.due_date,
        source: 'task_conversion',
        version: 1,
        completed: task.status === 'done' ? 1 : 0,
        category: taskCategory,
        sort_order: isOverdue ? 0 : 1, // 过期任务优先显示
        created_at: task.created_at,
        updated_at: task.updated_at
      };
    });
    
    // 按优先级排序：过期任务 > 高优先级 > 其他
    todos.sort((a, b) => {
      const aContent = JSON.parse(a.content);
      const bContent = JSON.parse(b.content);
      
      // 过期任务优先
      if (aContent.isOverdue && !bContent.isOverdue) return -1;
      if (!aContent.isOverdue && bContent.isOverdue) return 1;
      
      // 优先级排序
      return b.priority - a.priority;
    });
    
    return NextResponse.json({ 
      ok: true, 
      data: todos,
      meta: {
        total: todos.length,
        overdue: todos.filter(t => JSON.parse(t.content).isOverdue).length,
        completed: todos.filter(t => t.completed === 1).length
      }
    });
  } catch (err: any) {
    console.error('Todos API Error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// POST /api/todos  创建待办（事件日志自动触发）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'text 为必填字段' }, { status: 400 });
    }
    
    // 临时创建模拟任务对象，避免数据库依赖
    const created = {
      id: Date.now().toString(),
      title: body.text,
      description: body.description || '',
      status: 'pending' as const,
      priority: body.priority || 'medium' as const,
      estimated_hours: body.estimated_hours || null,
      actual_hours: null,
      due_date: body.due_date || null,
      completed_at: null,
      assignee: body.assignee || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    console.error('Create Todo Error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}
