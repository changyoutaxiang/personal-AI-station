import { NextResponse } from 'next/server';

// GET /api/agent/messages?conversationId=xxx - 获取会话消息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '缺少 conversationId 参数'
      }, { status: 400 });
    }

    // 返回示例消息数据
    const messages = [
      {
        id: `msg-${Date.now()}-1`,
        conversation_id: conversationId,
        role: 'user',
        content: '欢迎使用 AI 对话功能！',
        created_at: new Date().toISOString()
      },
      {
        id: `msg-${Date.now()}-2`,
        conversation_id: conversationId,
        role: 'assistant',
        content: '您好！我是您的 AI 助手，很高兴为您服务。您可以向我提问任何问题。',
        created_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('获取会话消息失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取会话消息失败'
    }, { status: 500 });
  }
}

// POST /api/agent/messages - 创建新消息
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: body.conversation_id,
      role: body.role || 'user',
      content: body.content,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('创建消息失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建消息失败'
    }, { status: 500 });
  }
}