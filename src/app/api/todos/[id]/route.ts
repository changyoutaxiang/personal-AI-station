import { NextResponse } from 'next/server';
import { 
  initDatabase, 
  getTodoById, 
  updateTodoObject, 
  hardDeleteTodo 
} from '@/lib/db';

initDatabase();

// GET /api/todos/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const item = getTodoById(id);
    if (!item) return NextResponse.json({ ok: false, error: '未找到该待办' }, { status: 404 });
    return NextResponse.json({ ok: true, data: item });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/todos/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const updated = updateTodoObject(id, body || {});
    if (!updated) return NextResponse.json({ ok: false, error: '更新失败或记录不存在' }, { status: 400 });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// PUT /api/todos/[id] - 与 PATCH 相同的逻辑
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => ({}));
    const updated = updateTodoObject(id, body || {});
    if (!updated) return NextResponse.json({ ok: false, error: '更新失败或记录不存在' }, { status: 400 });
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] 硬删除
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ok = hardDeleteTodo(id);
    if (!ok) return NextResponse.json({ ok: false, error: '删除失败或记录不存在' }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}
