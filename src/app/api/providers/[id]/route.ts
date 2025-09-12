import { NextRequest, NextResponse } from 'next/server';
import { updateAIProvider, getAIProvider, initDatabase } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 确保数据库已初始化
    initDatabase();
    
    const { id: providerId } = await params;
    const body = await request.json();
    
    // 验证供应商是否存在
    const existingProvider = getAIProvider(providerId);
    if (!existingProvider) {
      return NextResponse.json(
        { error: '供应商不存在' },
        { status: 404 }
      );
    }
    
    // 验证请求体
    const allowedFields = ['api_key', 'api_endpoint', 'is_enabled'];
    const updates: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: '没有提供有效的更新字段' },
        { status: 400 }
      );
    }
    
    // 更新供应商配置
    const success = updateAIProvider(providerId, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: '更新供应商配置失败' },
        { status: 500 }
      );
    }
    
    // 返回更新后的配置
    const updatedProvider = getAIProvider(providerId);
    return NextResponse.json(updatedProvider);
    
  } catch (error) {
    console.error('更新AI供应商配置失败:', error);
    return NextResponse.json(
      { error: '更新AI供应商配置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 确保数据库已初始化
    initDatabase();
    
    const { id: providerId } = await params;
    const provider = getAIProvider(providerId);
    
    if (!provider) {
      return NextResponse.json(
        { error: '供应商不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(provider);
    
  } catch (error) {
    console.error('获取AI供应商配置失败:', error);
    return NextResponse.json(
      { error: '获取AI供应商配置失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}