import { NextResponse } from 'next/server';

// GET /api/agent/conversations - 获取会话列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    // 返回示例会话数据
    const conversations = [
      {
        id: 'conversation-1',
        title: '示例对话',
        folder_id: folderId || null,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0
      }
    ];

    return NextResponse.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取会话列表失败'
    }, { status: 500 });
  }
}

// POST /api/agent/conversations - 创建新会话
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newConversation = {
      id: `conversation-${Date.now()}`,
      title: body.title || '新对话',
      folder_id: body.folder_id || null,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      message_count: 0
    };

    return NextResponse.json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建会话失败'
    }, { status: 500 });
  }
}