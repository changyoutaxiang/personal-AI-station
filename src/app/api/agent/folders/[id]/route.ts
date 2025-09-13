import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE /api/agent/folders/[id] - 删除文件夹
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;

    // 首先检查文件夹是否存在
    const { data: folder, error: checkError } = await supabase
      .from('agent_folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (checkError || !folder) {
      return NextResponse.json({
        success: false,
        error: '文件夹不存在'
      }, { status: 404 });
    }

    // 将文件夹中的所有会话移到"全部对话"（folder_id = null）
    const { error: updateError } = await supabase
      .from('agent_conversations')
      .update({ folder_id: null })
      .eq('folder_id', folderId);

    if (updateError) {
      console.error('更新会话文件夹失败:', updateError);
      return NextResponse.json({
        success: false,
        error: '移动会话失败'
      }, { status: 500 });
    }

    // 删除文件夹
    const { error: deleteError } = await supabase
      .from('agent_folders')
      .delete()
      .eq('id', folderId);

    if (deleteError) {
      console.error('删除文件夹失败:', deleteError);
      return NextResponse.json({
        success: false,
        error: deleteError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '文件夹删除成功'
    });
  } catch (error) {
    console.error('删除文件夹失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除文件夹失败'
    }, { status: 500 });
  }
}

// PUT /api/agent/folders/[id] - 更新文件夹（重命名等）
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;
    const body = await request.json();

    // 准备更新数据
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // 只更新提供的字段
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.color !== undefined) {
      updateData.color = body.color;
    }

    // 更新文件夹
    const { data: updatedFolder, error } = await supabase
      .from('agent_folders')
      .update(updateData)
      .eq('id', folderId)
      .select()
      .single();

    if (error) {
      console.error('更新文件夹失败:', error);

      // 如果是找不到记录
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: '文件夹不存在'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedFolder
    });
  } catch (error) {
    console.error('更新文件夹失败:', error);
    return NextResponse.json({
      success: false,
      error: '更新文件夹失败'
    }, { status: 500 });
  }
}

// GET /api/agent/folders/[id] - 获取单个文件夹详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const folderId = params.id;

    // 获取文件夹详情和统计信息
    const { data: folder, error: folderError } = await supabase
      .from('agent_folders')
      .select('*')
      .eq('id', folderId)
      .single();

    if (folderError || !folder) {
      return NextResponse.json({
        success: false,
        error: '文件夹不存在'
      }, { status: 404 });
    }

    // 获取文件夹中的会话数量
    const { count, error: countError } = await supabase
      .from('agent_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', folderId);

    if (countError) {
      console.error('获取会话数量失败:', countError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...folder,
        conversation_count: count || 0
      }
    });
  } catch (error) {
    console.error('获取文件夹详情失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取文件夹详情失败'
    }, { status: 500 });
  }
}