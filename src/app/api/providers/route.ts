import { NextRequest, NextResponse } from 'next/server';
import { getAllAIProviders, updateAIProvider, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    // 确保数据库已初始化
    initDatabase();
    const providers = getAllAIProviders();
    return NextResponse.json(providers);
  } catch (error) {
    console.error('获取AI供应商配置失败:', error);
    return NextResponse.json(
      { error: '获取AI供应商配置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}