import { NextRequest, NextResponse } from 'next/server';
import { 
  listMessagesByConversation,
  getConversationById,
  db
} from '@/lib/db';
import { debug } from '@/lib/debug';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 解析查询参数
    const conversationIdParam = searchParams.get('conversationId');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    
    // 参数校验
    if (!conversationIdParam) {
      return NextResponse.json({
        success: false,
        error: 'conversationId 参数为必填项'
      }, { status: 400 });
    }

    const conversationId = parseInt(conversationIdParam, 10);
    if (isNaN(conversationId)) {
      return NextResponse.json({
        success: false,
        error: 'conversationId 必须是有效的数字'
      }, { status: 400 });
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // 校验 limit 和 offset
    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
      return NextResponse.json({
        success: false,
        error: 'limit 必须是 1-100 之间的数字'
      }, { status: 400 });
    }

    if (offset && (isNaN(offset) || offset < 0)) {
      return NextResponse.json({
        success: false,
        error: 'offset 必须是非负数'
      }, { status: 400 });
    }

    // 检查会话是否存在
    const conversation = getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 });
    }

    // 获取消息列表和总数
    const messages = listMessagesByConversation(conversationId, limit, offset);
    
    // 获取总消息数量，用于分页
    const totalCountResult = db.prepare(`
      SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?
    `).get(conversationId) as { total: number };
    
    const totalCount = totalCountResult.total;
    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;
    const prevOffset = offset > 0 ? Math.max(0, offset - limit) : null;

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        conversationId,
        limit,
        offset,
        count: messages.length,
        totalCount,
        hasMore,
        hasPrevious: offset > 0,
        nextOffset,
        prevOffset
      }
    });

  } catch (error) {
    debug.error('获取消息列表错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取消息列表失败'
    }, { status: 500 });
  }
}
