import { NextRequest, NextResponse } from 'next/server';
import { updateAIModelConfig } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ functionName: string }> }
) {
  try {
    const { model } = await request.json();
    const { functionName } = await params;

    if (!model || !functionName) {
      return NextResponse.json(
        { error: '功能名称和模型名称都是必需的' },
        { status: 400 }
      );
    }

    const success = updateAIModelConfig(functionName, model);
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: '模型配置更新成功' 
      });
    } else {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('更新AI模型配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败' },
      { status: 500 }
    );
  }
}
