import { NextRequest, NextResponse } from 'next/server';
import { 
  getPromptTemplateById,
  updatePromptTemplate,
  deletePromptTemplate,
  listPromptTemplates
} from '@/lib/db';
import { debug } from '@/lib/debug';

// 更新提示模板请求接口
interface UpdatePromptRequest {
  name?: string;
  content?: string;
  description?: string;
  is_favorite?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idNumber = parseInt(id, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '模板ID必须是有效的数字'
      }, { status: 400 });
    }

    const body: UpdatePromptRequest = await request.json();
    
    // 检查模板是否存在
    const existingTemplate = getPromptTemplateById(idNumber);
    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        error: '提示模板不存在'
      }, { status: 404 });
    }

    // 参数校验
    const updates: {
      name?: string;
      content?: string;
      description?: string;
      is_favorite?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json({
          success: false,
          error: '模板名称必须是字符串'
        }, { status: 400 });
      }
      
      const name = body.name.trim();
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
      
      // 检查名称是否与其他模板冲突（排除当前模板）
      const existingTemplates = listPromptTemplates();
      const nameExists = existingTemplates.some(template =>
        template.id !== idNumber && template.name.toLowerCase() === name.toLowerCase()
      );
      
      if (nameExists) {
        return NextResponse.json({
          success: false,
          error: '该模板名称已存在，请使用其他名称'
        }, { status: 400 });
      }
      
      updates.name = name;
    }

    if (body.content !== undefined) {
      if (typeof body.content !== 'string') {
        return NextResponse.json({
          success: false,
          error: '模板内容必须是字符串'
        }, { status: 400 });
      }
      
      const content = body.content.trim();
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
      
      updates.content = content;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') {
        return NextResponse.json({
          success: false,
          error: '模板描述必须是字符串'
        }, { status: 400 });
      }
      
      const description = body.description.trim();
      if (description.length > 500) {
        return NextResponse.json({
          success: false,
          error: '模板描述不能超过 500 字符'
        }, { status: 400 });
      }
      
      updates.description = description || undefined;
    }

    if (body.is_favorite !== undefined) {
      if (typeof body.is_favorite !== 'boolean') {
        return NextResponse.json({
          success: false,
          error: 'is_favorite 必须是布尔值'
        }, { status: 400 });
      }
      
      updates.is_favorite = body.is_favorite;
    }

    // 如果没有任何更新内容
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有提供任何更新内容'
      }, { status: 400 });
    }

    // 更新提示模板
    const updatedTemplate = updatePromptTemplate(idNumber, updates);

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    });

  } catch (error) {
    debug.error('更新提示模板错误:', error);
    
    // 处理数据库唯一性约束错误
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({
        success: false,
        error: '该模板名称已存在，请使用其他名称'
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新提示模板失败'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const idNumber = parseInt(id, 10);
    
    if (isNaN(idNumber)) {
      return NextResponse.json({
        success: false,
        error: '模板ID必须是有效的数字'
      }, { status: 400 });
    }

    // 检查模板是否存在
    const existingTemplate = getPromptTemplateById(idNumber);
    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        error: '提示模板不存在'
      }, { status: 404 });
    }

    // 删除提示模板
    const deleted = deletePromptTemplate(idNumber);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        error: '删除提示模板失败'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '提示模板删除成功'
    });

  } catch (error) {
    debug.error('删除提示模板错误:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除提示模板失败'
    }, { status: 500 });
  }
}
