import { NextResponse } from 'next/server';
import { initDatabase, listOKREvents } from '@/lib/db';

// 确保数据库初始化
initDatabase();

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/okrs/[id]/events 获取OKR事件日志
export async function GET(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const events = listOKREvents(id, limit);
    return NextResponse.json({ ok: true, data: events });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}