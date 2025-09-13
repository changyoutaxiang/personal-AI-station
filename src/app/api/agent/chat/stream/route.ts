import { NextResponse } from 'next/server';

// POST /api/agent/chat/stream - 流式聊天API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, conversationId, systemPrompt, model } = body;

    // 简单回复逻辑（这里应该集成真实的 AI 模型）
    const aiResponse = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId || 'conversation-1',
      role: 'assistant',
      content: `我收到了您的消息："${message}"。这是一个测试回复，AI 功能正在逐步恢复中。`,
      created_at: new Date().toISOString(),
      isStreaming: false
    };

    return NextResponse.json({
      success: true,
      data: {
        userMessage: {
          id: `msg-user-${Date.now()}`,
          conversation_id: conversationId || 'conversation-1',
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        },
        assistantMessage: aiResponse
      }
    });
  } catch (error) {
    console.error('流式聊天失败:', error);
    return NextResponse.json({
      success: false,
      error: '聊天服务暂时不可用'
    }, { status: 500 });
  }
}