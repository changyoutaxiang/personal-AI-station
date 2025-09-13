import { NextResponse } from 'next/server';
import {
  getTodoById,
  updateTodo,
  deleteTodo
} from '@/lib/supabase/todos';

// GET /api/todos/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await getTodoById(id);

    if (!result.success) {
      if (result.error?.includes('No rows found')) {
        return NextResponse.json({ ok: false, error: '未找到该待办' }, { status: 404 });
      }
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err: any) {
    console.error('GET todo error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/todos/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));

    const result = await updateTodo(id, body || {});

    if (!result.success) {
      console.error('PATCH todo error:', result.error);
      return NextResponse.json({ ok: false, error: result.error || '更新失败或记录不存在' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err: any) {
    console.error('PATCH todo error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// PUT /api/todos/[id] - 更新待办事项
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    console.log('🔄 PUT /api/todos/' + id + ' 接收到的数据:', body);

    // 转换前端数据格式到后端期望的格式
    const updates: Record<string, unknown> = {};

    if (body.text !== undefined) updates.text = body.text;
    if (body.completed !== undefined) updates.completed = body.completed;
    if (body.priority !== undefined) {
      // 转换优先级格式：前端 'high'/'medium'/'low' -> 后端 2/1/0
      updates.priority = body.priority === 'high' ? 2 : body.priority === 'low' ? 0 : 1;
    }
    if (body.category !== undefined) updates.category = body.category;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate; // 注意字段名转换
    if (body.tags !== undefined) updates.tags = body.tags;

    console.log('🔄 转换后的更新数据:', updates);

    const result = await updateTodo(id, updates);

    if (!result.success) {
      console.log('❌ 更新失败:', result.error);
      return NextResponse.json({ ok: false, error: result.error || '更新失败或记录不存在' }, { status: 400 });
    }

    console.log('✅ 更新成功:', result.data);
    return NextResponse.json({ ok: true, data: result.data });
  } catch (err: any) {
    console.error('❌ PUT /api/todos/' + id + ' 错误:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] 硬删除
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await deleteTodo(id);

    if (!result.success) {
      console.error('DELETE todo error:', result.error);
      return NextResponse.json({ ok: false, error: result.error || '删除失败或记录不存在' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('DELETE todo error:', err);
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}