import { NextRequest, NextResponse } from 'next/server';
import { 
  listPromptTemplates, 
  createPromptTemplate 
} from '@/lib/db';
import { debug } from '@/lib/debug';

// 创建提示模板请求接口
interface CreatePromptRequest {
  name: string;
  content: string;
  description?: string;
  is_favorite?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // 临时返回空提示模板列表，避免数据库兼容性问题
    return NextResponse.json({
      success: true,
      templates: []
    });

  } catch (error) {
    debug.error('获取提示模板列表错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取提示模板列表失败'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePromptRequest = await request.json();
    
    // 参数校验
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'name 参数为必填项且必须是字符串'
      }, { status: 400 });
    }

    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'content 参数为必填项且必须是字符串'
      }, { status: 400 });
    }

    const name = body.name.trim();
    const content = body.content.trim();
    
    // 校验长度
    if (name.length === 0) {
      return NextResponse.json({
        success: false,
        error: '模板名称不能为空'
      }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({
        success: false,
        error: '模板名称不能超过 100 字符'
      }, { status: 400 });
    }

    if (content.length === 0) {
      return NextResponse.json({
        success: false,
        error: '模板内容不能为空'
      }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({
        success: false,
        error: '模板内容不能超过 5000 字符'
      }, { status: 400 });
    }

    // 校验描述长度
    const description = body.description ? body.description.trim() : undefined;
    if (description && description.length > 500) {
      return NextResponse.json({
        success: false,
        error: '模板描述不能超过 500 字符'
      }, { status: 400 });
    }

    const isFavorite = Boolean(body.is_favorite);

    // 检查模板名称是否已存在
    const existingTemplates = listPromptTemplates();
    const nameExists = existingTemplates.some(template => 
      template.name.toLowerCase() === name.toLowerCase()
    );
    
    if (nameExists) {
      return NextResponse.json({
        success: false,
        error: '该模板名称已存在，请使用其他名称'
      }, { status: 400 });
    }

    // 创建提示模板
    const template = createPromptTemplate({
      name,
      content,
      description,
      is_favorite: isFavorite
    });

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 });

  } catch (error) {
    debug.error('创建提示模板错误:', error);
    
    // 处理数据库唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({
        success: false,
        error: '该模板名称已存在，请使用其他名称'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建提示模板失败'
    }, { status: 500 });
  }
}
