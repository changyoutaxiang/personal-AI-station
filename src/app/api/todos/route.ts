import { NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { initDatabase, listTodos, createTodoFromObject } from '@/lib/db';

// 确保数据库初始化（SQLite兼容性）
if (process.env.DATABASE_TYPE !== 'supabase') {
  initDatabase();
}

// GET /api/todos?category=today|week
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const items = listTodos({ category });
    return NextResponse.json({ ok: true, data: items });
  } catch (err: any) {
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
    const created = createTodoFromObject(body);
    return NextResponse.json({ ok: true, data: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || '服务器错误' }, { status: 500 });
  }
}
