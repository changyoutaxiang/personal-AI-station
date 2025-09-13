import { NextResponse } from 'next/server';

// 内存中的文件夹存储（临时解决方案，生产环境应使用数据库）
// 使用全局变量在请求之间保持数据
if (!global.agentFolders) {
  global.agentFolders = [];
}

// GET /api/agent/folders - 获取文件夹列表
export async function GET() {
  try {
    // 返回存储的文件夹数据
    const folders = global.agentFolders || [];

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
      description: body.description || '',
      color: body.color || '#3B82F6',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 将新文件夹添加到存储中
    if (!global.agentFolders) {
      global.agentFolders = [];
    }
    global.agentFolders.push(newFolder);

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