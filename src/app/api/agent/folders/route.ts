import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/agent/folders - 获取文件夹列表
export async function GET() {
  try {
    // 从 Supabase 获取文件夹列表
    const { data: folders, error } = await supabase
      .from('agent_folders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取文件夹列表失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: folders || []
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

    // 插入到 Supabase
    const { data: newFolder, error } = await supabase
      .from('agent_folders')
      .insert({
        name: body.name || '新文件夹',
        description: body.description || null,
        color: body.color || '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      console.error('创建文件夹失败:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

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