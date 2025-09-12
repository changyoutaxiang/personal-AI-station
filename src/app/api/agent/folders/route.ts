import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 完全简化的API响应，无任何依赖
    return NextResponse.json({
      success: true,
      folders: [],
      message: 'Folders API working - returning empty list'
    });
  } catch (error) {
    console.error('Folders API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load folders'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 创建模拟文件夹对象
    const folder = {
      id: Date.now().toString(),
      name: body.name || '新文件夹',
      description: body.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      folder
    }, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create folder'
    }, { status: 500 });
  }
}