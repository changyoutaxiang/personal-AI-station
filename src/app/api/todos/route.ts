import { NextResponse } from 'next/server';
import { database } from '@/lib/database';

// GET /api/todos?category=today|week
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    // 使用统一数据库接口
    const tasks = await database.getTasks();
    return NextResponse.json({ ok: true, data: tasks });
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
    
    // 使用统一数据库接口创建任务
    const taskData = {
      id: Date.now().toString(),
      title: body.text,
      description: body.description || '',
      status: 'pending' as const,
      priority: body.priority || 'medium' as const,
      estimated_hours: body.estimated_hours || null,
      actual_hours: null,
      due_date: body.due_date || null,
      completed_at: null,
      assignee: body.assignee || null
    };
    
    const created = await database.createTask(taskData);
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    console.error('Create Todo Error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}
