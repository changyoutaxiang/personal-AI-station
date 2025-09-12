import { NextResponse } from 'next/server';
import { initDatabase, getOKRById, updateOKRObject, hardDeleteOKR, listOKREvents } from '@/lib/db';

// 确保数据库初始化
initDatabase();

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/okrs/[id] 获取单个OKR
export async function GET(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const item = getOKRById(id);
    if (!item) {
      return NextResponse.json({ ok: false, error: 'OKR目标不存在' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, data: item });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}

// PATCH /api/okrs/[id] 更新OKR
export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await req.json();
    


    // 普通更新
    console.log('更新OKR - ID:', id, '数据:', body);
    const updated = updateOKRObject(id, body);
    console.log('更新结果:', updated);
    if (!updated) {
      console.error('OKR更新失败 - ID不存在或更新操作失败:', id);
      return NextResponse.json({ ok: false, error: '更新失败：OKR不存在或更新操作失败' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}

// DELETE /api/okrs/[id] 删除OKR
export async function DELETE(req: Request, { params }: RouteParams) {
  const { id } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const hardDelete = (searchParams.get('hard') || 'false') === 'true';

    const success = hardDeleteOKR(id);
    if (!success) {
      return NextResponse.json({ ok: false, error: '删除失败' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: '删除成功' });
  } catch (err: unknown) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : '服务器错误' }, { status: 500 });
  }
}