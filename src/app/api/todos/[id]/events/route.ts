import { NextResponse } from 'next/server';
import { initDatabase, listTodoEvents, getTodoById } from '@/lib/db';

initDatabase();

// GET /api/todos/[id]/events  查看指定待办的事件日志（默认最多100条）
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(Math.max(parseInt(limitParam || '100', 10) || 100, 1), 1000);

    // 若待办不存在，返回404
    const existing = getTodoById(resolvedParams.id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: '记录不存在' }, { status: 404 });
    }

    const events = listTodoEvents(resolvedParams.id, limit);
    return NextResponse.json({ ok: true, data: events });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
