import { NextRequest, NextResponse } from 'next/server';
import { polishText } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的文本' },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { success: false, error: '输入文本过长，请控制在500字符以内' },
        { status: 400 }
      );
    }

    console.log('开始AI文本润色，文本长度:', text.length);
    const startTime = Date.now();
    
    const result = await polishText(text);
    
    const duration = Date.now() - startTime;
    console.log('AI文本润色完成，耗时:', duration + 'ms');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI文本润色API错误:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: `文本润色失败: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
