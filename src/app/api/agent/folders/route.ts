import { NextRequest, NextResponse } from 'next/server';
import { 
  createConversationFolder, 
  listConversationFolders, 
  updateConversationFolder,
  deleteConversationFolder,
  getFolderTree
} from '@/lib/db';
import { debug } from '@/lib/debug';

// GET - 获取文件夹列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const tree = searchParams.get('tree') === 'true';
    
    let folders;
    if (tree) {
      // 返回树形结构
      folders = getFolderTree();
    } else {
      // 返回特定父级下的文件夹
      const parentIdNum = parentId ? parseInt(parentId) : null;
      folders = listConversationFolders(parentIdNum);
    }
    
    return NextResponse.json({
      success: true,
      folders
    });
  } catch (error) {
    debug.error('获取文件夹列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取文件夹列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建文件夹
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon, parent_id } = body;
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '文件夹名称不能为空' },
        { status: 400 }
      );
    }
    
    const folderData = {
      name: name.trim(),
      description: description?.trim(),
      color: color || '#3B82F6',
      icon: icon || 'folder',
      parent_id: parent_id || undefined
    };
    
    const folder = createConversationFolder(folderData);
    
    debug.log('创建文件夹成功:', folder);
    
    return NextResponse.json({
      success: true,
      folder
    });
  } catch (error) {
    debug.error('创建文件夹失败:', error);
    return NextResponse.json(
      { success: false, error: '创建文件夹失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新文件夹
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, color, icon, parent_id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '文件夹ID不能为空' },
        { status: 400 }
      );
    }
    
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim();
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (parent_id !== undefined) updates.parent_id = parent_id;
    
    const folder = updateConversationFolder(id, updates);
    
    debug.log('更新文件夹成功:', folder);
    
    return NextResponse.json({
      success: true,
      folder
    });
  } catch (error) {
    debug.error('更新文件夹失败:', error);
    return NextResponse.json(
      { success: false, error: '更新文件夹失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除文件夹
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');
    
    if (!idParam) {
      return NextResponse.json(
        { success: false, error: '文件夹ID不能为空' },
        { status: 400 }
      );
    }
    
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '无效的文件夹ID' },
        { status: 400 }
      );
    }
    
    const success = deleteConversationFolder(id);
    
    if (success) {
      debug.log('删除文件夹成功:', id);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: '文件夹不存在或删除失败' },
        { status: 404 }
      );
    }
  } catch (error) {
    debug.error('删除文件夹失败:', error);
    return NextResponse.json(
      { success: false, error: '删除文件夹失败' },
      { status: 500 }
    );
  }
}
