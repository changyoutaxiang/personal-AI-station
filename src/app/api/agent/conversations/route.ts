import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 完全简化的API响应，无任何依赖
    return NextResponse.json({
      success: true,
      conversations: [],
      pagination: {
        limit: 50,
        offset: 0,
        count: 0
      },
      message: 'Conversations API working - returning empty list'
    });
  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load conversations'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 创建模拟会话对象
    const conversation = {
      id: Date.now().toString(),
      title: body.title || '新对话',
      model_name: body.model_name || 'moonshotai/kimi-k2',
      system_prompt: body.system_prompt || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      conversation
    }, { status: 201 });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create conversation'
    }, { status: 500 });
  }
}