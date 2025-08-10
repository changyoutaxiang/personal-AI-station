import { NextRequest, NextResponse } from 'next/server';
import { 
  getMessageById,
  deleteMessage,
  updateMessage 
} from '@/lib/db';
import { debug } from '@/lib/debug';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idNumber = parseInt(id, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '消息ID必须是有效的数字'
      }, { status: 400 });
    }

    // 获取消息信息
    const message = getMessageById(idNumber);
    
    if (!message) {
      return NextResponse.json({
        success: false,
        error: '消息不存在'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    debug.error('获取消息信息错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取消息信息失败'
    }, { status: 500 });
  }
}

// PUT - 编辑消息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idNumber = parseInt(id, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '消息ID必须是有效的数字'
      }, { status: 400 });
    }

    const body = await request.json();
    const { content, editReason } = body;

    // 验证输入
    if (!content || typeof content !== 'string') {
      return NextResponse.json({
        success: false,
        error: '消息内容不能为空'
      }, { status: 400 });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json({
        success: false,
        error: '消息内容不能为空'
      }, { status: 400 });
    }

    // 检查消息是否存在
    const existingMessage = getMessageById(idNumber);
    if (!existingMessage) {
      return NextResponse.json({
        success: false,
        error: '消息不存在'
      }, { status: 404 });
    }

    // 只允许编辑用户消息
    if (existingMessage.role !== 'user') {
      return NextResponse.json({
        success: false,
        error: '只能编辑用户消息'
      }, { status: 403 });
    }

    // 检查内容是否真的改变了
    if (existingMessage.content.trim() === trimmedContent) {
      return NextResponse.json({
        success: false,
        error: '消息内容没有变化'
      }, { status: 400 });
    }

    // 更新消息
    const updatedMessage = updateMessage(idNumber, {
      content: trimmedContent,
      editReason: editReason || undefined
    });
    
    if (!updatedMessage) {
      return NextResponse.json({
        success: false,
        error: '更新消息失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (error) {
    debug.error('编辑消息错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '编辑消息失败'
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
        error: '消息ID必须是有效的数字'
      }, { status: 400 });
    }

    // 检查消息是否存在
    const existingMessage = getMessageById(idNumber);
    if (!existingMessage) {
      return NextResponse.json({
        success: false,
        error: '消息不存在'
      }, { status: 404 });
    }

    // 删除消息
    const deleted = deleteMessage(idNumber);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: '删除消息失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '消息删除成功'
    });

  } catch (error) {
    debug.error('删除消息错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除消息失败'
    }, { status: 500 });
  }
}
