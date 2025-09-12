import { NextResponse } from 'next/server';
import { initDatabase, listOKRs, createOKRFromObject } from '@/lib/db';

// 确保数据库初始化
initDatabase();

// GET /api/okrs
export async function GET(request: Request) {
  try {
    initDatabase();

    const items = listOKRs();
    return NextResponse.json({ ok: true, data: items });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}

// POST /api/okrs  创建OKR目标
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'title 为必填字段' }, { status: 400 });
    }
    const created = createOKRFromObject(body);
    return NextResponse.json({ ok: true, data: created });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}