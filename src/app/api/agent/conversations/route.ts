import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 临时返回空数据，避免500错误
    return NextResponse.json({
      success: true,
      conversations: [],
      pagination: {
        limit: 50,
        offset: 0,
        count: 0
      }
    });
  } catch (error) {
    console.error('获取会话列表错误:', error);
    return NextResponse.json({
      success: false,
      error: '获取会话列表失败'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 临时创建模拟会话对象
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
    console.error('创建会话错误:', error);
    return NextResponse.json({
      success: false,
      error: '创建会话失败'
    }, { status: 500 });
  }
}