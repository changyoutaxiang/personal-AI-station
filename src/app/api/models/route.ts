import { NextResponse } from 'next/server';
import { getAllAIModelConfigs } from '@/lib/db';

export async function GET() {
  try {
    const configs = getAllAIModelConfigs();
    return NextResponse.json(configs);
  } catch (error) {
    console.error('获取AI模型配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}
