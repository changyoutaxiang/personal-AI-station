import { NextResponse } from 'next/server';

// 示例提示模板数据
const defaultPrompts = [
  {
    id: 'prompt-1',
    title: '通用助手',
    content: '你是一个有帮助的AI助手，请帮助用户回答问题并提供有用的信息。',
    category: 'general',
    is_favorite: false,
    use_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prompt-2',
    title: '代码助手',
    content: '你是一个专业的程序员助手，请帮助用户解决编程问题，提供代码建议和最佳实践。',
    category: 'development',
    is_favorite: false,
    use_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// GET /api/agent/prompts - 获取提示模板列表
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: defaultPrompts
    });
  } catch (error) {
    console.error('获取提示模板失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取提示模板失败'
    }, { status: 500 });
  }
}

// POST /api/agent/prompts - 创建新提示模板
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newPrompt = {
      id: `prompt-${Date.now()}`,
      title: body.title || '新模板',
      content: body.content || '',
      category: body.category || 'general',
      is_favorite: false,
      use_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newPrompt
    });
  } catch (error) {
    console.error('创建提示模板失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建提示模板失败'
    }, { status: 500 });
  }
}