import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection } from '@/lib/db';

// POST /api/agent/folders/[folderId]/conversations
// 将会话添加到文件夹
export async function POST(
  request: NextRequest,
  { params }: { params: { folderId: string } }
) {
  const db = getDbConnection();
  
  try {
    const resolvedParams = await params;
    const folderId = parseInt(resolvedParams.folderId);
    const { conversationIds } = await request.json();
    
    if (!folderId) {
      return NextResponse.json({
        success: false,
        error: '无效的文件夹ID'
      }, { status: 400 });
    }
    
    if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: '无效的会话ID列表'
      }, { status: 400 });
    }
    
    // 验证文件夹是否存在
    const folderStmt = db.prepare('SELECT id FROM conversation_folders WHERE id = ?');
    const folder = folderStmt.get(folderId);
    
    if (!folder) {
      return NextResponse.json({
        success: false,
        error: '文件夹不存在'
      }, { status: 404 });
    }
    
    // 验证所有会话是否存在
    const conversationIdsStr = conversationIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (conversationIdsStr.length === 0) {
      return NextResponse.json({
        success: false,
        error: '无有效的会话ID'
      }, { status: 400 });
    }
    
    const placeholders = conversationIdsStr.map(() => '?').join(',');
    const conversationStmt = db.prepare(`SELECT id FROM conversations WHERE id IN (${placeholders})`);
    const conversations = conversationStmt.all(...conversationIdsStr);
    
    if (conversations.length !== conversationIdsStr.length) {
      return NextResponse.json({
        success: false,
        error: '部分会话不存在'
      }, { status: 400 });
    }
    
    // 将会话移动到文件夹
    const updateStmt = db.prepare('UPDATE conversations SET folder_id = ? WHERE id = ?');
    let totalChanges = 0;
    
    for (const conversationId of conversationIdsStr) {
      const result = updateStmt.run(folderId, conversationId);
      totalChanges += result.changes;
    }
    
    // 检查所有更新是否成功
    if (totalChanges === 0) {
      return NextResponse.json({
        success: false,
        error: '没有会话被移动'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `成功移动 ${totalChanges} 个会话到文件夹`,
      movedCount: totalChanges
    });
    
  } catch (error) {
    console.error('将会话添加到文件夹失败:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 });
  }
}
