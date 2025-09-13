import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/agent/conversations - 获取会话列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    // 从 Supabase 获取会话列表
    let query = supabase
      .from('agent_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    // 如果指定了文件夹ID，则过滤
    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('获取会话列表失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: conversations || []
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取会话列表失败'
    }, { status: 500 });
  }
}

// POST /api/agent/conversations - 创建新会话
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 插入到 Supabase
    const { data: newConversation, error } = await supabase
      .from('agent_conversations')
      .insert({
        title: body.title || '新对话',
        folder_id: body.folder_id || null,
        model: body.model || null,
        system_prompt: body.system_prompt || null
      })
      .select()
      .single();

    if (error) {
      console.error('创建会话失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newConversation
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建会话失败'
    }, { status: 500 });
  }
}