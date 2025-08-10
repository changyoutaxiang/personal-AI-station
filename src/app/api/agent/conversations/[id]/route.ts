import { NextRequest, NextResponse } from 'next/server';
import { 
  getConversationById, 
  updateConversation,
  deleteConversation,
  deleteMessagesByConversation 
} from '@/lib/db';
import { debug } from '@/lib/debug';

// 更新会话请求接口
interface UpdateConversationRequest {
  title?: string;
  model_name?: string;
  system_prompt?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idString = id;
    const idNumber = parseInt(idString, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '会话ID必须是有效的数字'
      }, { status: 400 });
    }

    // 获取会话信息
    const conversation = getConversationById(idNumber);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      conversation
    });

  } catch (error) {
    debug.error('获取会话信息错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取会话信息失败'
    }, { status: 500 });
  }
}



export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idNumber = parseInt(id, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '会话ID必须是有效的数字'
      }, { status: 400 });
    }

    // 检查会话是否存在
    const existingConversation = getConversationById(idNumber);
    if (!existingConversation) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 });
    }

    // 删除会话（数据库外键约束会自动删除相关的消息和标签映射）
    const deleted = deleteConversation(idNumber);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: '删除会话失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '会话删除成功'
    });

  } catch (error) {
    debug.error('删除会话错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除会话失败'
    }, { status: 500 });
  }
}
