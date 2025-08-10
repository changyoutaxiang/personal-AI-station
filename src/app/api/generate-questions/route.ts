import { NextRequest, NextResponse } from 'next/server';
import { generateQuestions } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的内容' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: '输入内容过长，请控制在2000字符以内' },
        { status: 400 }
      );
    }

    console.log('开始AI问题生成，内容长度:', content.length);
    const startTime = Date.now();
    
    const result = await generateQuestions(content);
    
    const duration = Date.now() - startTime;
    console.log('AI问题生成完成，耗时:', duration + 'ms');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI问题生成API错误:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: `问题生成失败: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
