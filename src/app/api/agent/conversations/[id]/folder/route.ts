import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

// DELETE /api/agent/conversations/[id]/folder
// 将会话从文件夹中移出
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDbConnection();
  
  try {
    const resolvedParams = await params;
    const conversationId = parseInt(resolvedParams.id);
    
    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '无效的会话ID'
      }, { status: 400 });
    }
    
    // 验证会话是否存在
    const conversationStmt = db.prepare('SELECT id FROM conversations WHERE id = ?');
    const conversation = conversationStmt.get(conversationId);
    
    if (!conversation) {
      return NextResponse.json({
        success: false,
        error: '会话不存在'
      }, { status: 404 });
    }
    
    // 从文件夹中移出会话（设置folder_id为NULL）
    const updateStmt = db.prepare('UPDATE conversations SET folder_id = NULL WHERE id = ?');
    const result = updateStmt.run(conversationId);
    
    if (result.changes === 0) {
      return NextResponse.json({
        success: false,
        error: '更新失败'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: '会话已从文件夹中移出'
    });
    
  } catch (error) {
    console.error('从文件夹移出会话失败:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}
