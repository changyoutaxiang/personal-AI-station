import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 完全简化的API响应，无任何依赖
    return NextResponse.json({
      success: true,
      templates: [],
      message: 'Prompts API working - returning empty list'
    });
  } catch (error) {
    console.error('Prompts API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load prompts'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 创建模拟提示模板对象
    const prompt = {
      id: Date.now().toString(),
      title: body.title || '新模板',
      content: body.content || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      prompt
    }, { status: 201 });
  } catch (error) {
    console.error('Create prompt error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create prompt'
    }, { status: 500 });
  }
}