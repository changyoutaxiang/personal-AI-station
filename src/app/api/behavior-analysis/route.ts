import { NextResponse } from 'next/server';
import { runBehaviorAnalysis } from '@/lib/behavior-analyzer';
import { debug } from '@/lib/debug';

export async function GET() {
  try {
    const analysisResult = await runBehaviorAnalysis();
    
    return NextResponse.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    debug.error('行为分析失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '行为分析服务暂时不可用'
    }, { status: 500 });
  }
}

export async function POST() {
  // 可以用于触发重新分析
  return GET();
}