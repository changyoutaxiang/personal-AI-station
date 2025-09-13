import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/agent/messages?conversationId=xxx - 获取会话消息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({
        success: false,
        error: '缺少 conversationId 参数'
      }, { status: 400 });
    }

    // 从 Supabase 获取消息列表
    const { data: messages, error } = await supabase
      .from('agent_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('获取会话消息失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: messages || []
    });
  } catch (error) {
    console.error('获取会话消息失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取会话消息失败'
    }, { status: 500 });
  }
}

// POST /api/agent/messages - 创建新消息
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 验证必需参数
    if (!body.conversation_id || !body.content) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 });
    }

    // 插入到 Supabase
    const { data: newMessage, error } = await supabase
      .from('agent_messages')
      .insert({
        conversation_id: body.conversation_id,
        role: body.role || 'user',
        content: body.content,
        model: body.model || null,
        tokens_used: body.tokens_used || null
      })
      .select()
      .single();

    if (error) {
      console.error('创建消息失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // 更新会话的 updated_at 时间
    await supabase
      .from('agent_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', body.conversation_id);

    return NextResponse.json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('创建消息失败:', error);
    return NextResponse.json({
      success: false,
      error: '创建消息失败'
    }, { status: 500 });
  }
}