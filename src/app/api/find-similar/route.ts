import { NextRequest, NextResponse } from 'next/server';
import { findSimilarEntries } from '@/lib/ai';
import { getAllEntries } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供有效的内容' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: '输入内容过长，请控制在1000字符以内' },
        { status: 400 }
      );
    }

    console.log('开始查找相似内容，内容长度:', content.length);
    const startTime = Date.now();
    
    // 获取所有记录
    const allEntries = getAllEntries();
    const result = await findSimilarEntries(content, allEntries);
    
    const duration = Date.now() - startTime;
    console.log('相似内容查找完成，耗时:', duration + 'ms');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('相似内容查找API错误:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: `相似内容查找失败: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
