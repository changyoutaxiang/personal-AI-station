import { NextRequest, NextResponse } from 'next/server';
import { 
  deleteMessage, 
  deleteConversation,
  getMessageById,
  getConversationById 
} from '@/lib/db';
import { debug } from '@/lib/debug';

interface BatchDeleteRequest {
  type: 'messages' | 'conversations';
  ids: number[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchDeleteRequest = await request.json();
    const { type, ids } = body;

    // 验证请求数据
    if (!type || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: '请求参数无效'
      }, { status: 400 });
    }

    // 验证ID数组
    if (!ids.every(id => typeof id === 'number' && id > 0)) {
      return NextResponse.json({
        success: false,
        error: '包含无效的ID'
      }, { status: 400 });
    }

    // 限制批量操作数量
    if (ids.length > 100) {
      return NextResponse.json({
        success: false,
        error: '单次批量删除不能超过100个项目'
      }, { status: 400 });
    }

    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [] as string[],
      deletedIds: [] as number[]
    };

    if (type === 'messages') {
      // 批量删除消息
      for (const id of ids) {
        try {
          // 先检查消息是否存在
          const message = getMessageById(id);
          if (!message) {
            results.failedCount++;
            results.errors.push(`消息 ${id} 不存在`);
            continue;
          }

          // 执行删除
          const deleted = deleteMessage(id);
          if (deleted) {
            results.successCount++;
            results.deletedIds.push(id);
          } else {
            results.failedCount++;
            results.errors.push(`删除消息 ${id} 失败`);
          }
        } catch (error) {
          results.failedCount++;
          results.errors.push(`删除消息 ${id} 时发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
    } else if (type === 'conversations') {
      // 批量删除会话
      for (const id of ids) {
        try {
          // 先检查会话是否存在
          const conversation = getConversationById(id);
          if (!conversation) {
            results.failedCount++;
            results.errors.push(`会话 ${id} 不存在`);
            continue;
          }

          // 执行删除（会同时删除相关的消息）
          const deleted = deleteConversation(id);
          if (deleted) {
            results.successCount++;
            results.deletedIds.push(id);
          } else {
            results.failedCount++;
            results.errors.push(`删除会话 ${id} 失败`);
          }
        } catch (error) {
          results.failedCount++;
          results.errors.push(`删除会话 ${id} 时发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
        }
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `不支持的删除类型: ${type}`
      }, { status: 400 });
    }

    // 记录操作日志
    debug.log(`批量删除 ${type}:`, {
      requestedIds: ids,
      successCount: results.successCount,
      failedCount: results.failedCount,
      deletedIds: results.deletedIds
    });

    // 返回操作结果
    const success = results.successCount > 0;
    const statusCode = success ? (results.failedCount > 0 ? 207 : 200) : 400; // 207 = Multi-Status

    return NextResponse.json({
      success,
      message: `成功删除 ${results.successCount} 个项目${results.failedCount > 0 ? `，${results.failedCount} 个失败` : ''}`,
      data: {
        total: ids.length,
        successCount: results.successCount,
        failedCount: results.failedCount,
        deletedIds: results.deletedIds,
        errors: results.errors.length > 0 ? results.errors : undefined
      }
    }, { status: statusCode });

  } catch (error) {
    debug.error('批量删除操作失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '批量删除失败',
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
