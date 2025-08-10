import { NextResponse } from 'next/server';
import { generateSimpleWeeklyReport } from '@/lib/ai';
import { debug } from '@/lib/debug';

export async function POST() {
  try {
    debug.log('📊 开始生成智能周报...');
    
    const result = await generateSimpleWeeklyReport();
    
    if (result.success) {
      debug.log('✅ 周报生成成功');
      return NextResponse.json({
        success: true,
        report: result.report
      });
    } else {
      debug.error('❌ 周报生成失败:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    debug.error('❌ 周报API错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '服务器内部错误'
    }, { status: 500 });
  }
}