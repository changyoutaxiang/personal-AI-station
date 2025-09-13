import { NextResponse } from 'next/server';

// GET /api/agent/folders - 获取文件夹列表
export async function GET() {
  try {
    // 返回示例文件夹数据
    const folders = [
      {
        id: 'default',
        name: '默认文件夹',
        color: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: folders
    });
  } catch (error) {
    console.error('获取文件夹列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取文件夹列表失败'
    }, { status: 500 });
  }
}

// POST /api/agent/folders - 创建新文件夹
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: body.name || '新文件夹',
      color: body.color || '#3B82F6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newFolder
    });
  } catch (error) {
    console.error('创建文件夹失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建文件夹失败'
    }, { status: 500 });
  }
}