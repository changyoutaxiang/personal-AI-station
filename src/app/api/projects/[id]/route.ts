import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject } from '@/lib/supabase/projects';
import type { Project } from '@/types/project';

// GET /api/projects/[id] - 获取单个项目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '项目ID是必需的' },
        { status: 400 }
      );
    }

    const result = await getProjectById(id);

    if (!result.success) {
      if (result.error?.includes('No rows')) {
        return NextResponse.json(
          { error: '项目不存在' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取项目失败:', error);
    return NextResponse.json(
      { error: '获取项目失败' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - 更新项目
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: '项目ID是必需的' },
        { status: 400 }
      );
    }

    // 验证更新数据
    const updates: Partial<Project> = {};
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json(
          { error: '项目名称不能为空' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }
    
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.progress !== undefined) updates.progress = body.progress;
    if (body.estimatedHours !== undefined) updates.estimatedHours = body.estimatedHours;
    if (body.actualHours !== undefined) updates.actualHours = body.actualHours;
    if (body.startDate !== undefined) updates.startDate = body.startDate;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate;
    if (body.completedAt !== undefined) updates.completedAt = body.completedAt;
    if (body.color !== undefined) updates.color = body.color;
    if (body.icon !== undefined) updates.icon = body.icon;
    if (body.parentId !== undefined) updates.parentId = body.parentId;

    const result = await updateProject(id, updates);

    if (!result.success) {
      if (result.error?.includes('No rows')) {
        return NextResponse.json(
          { error: '项目不存在' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    return NextResponse.json(
      { error: '更新项目失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: '项目ID是必需的' },
        { status: 400 }
      );
    }

    const result = await deleteProject(id);

    if (!result.success) {
      if (result.error?.includes('关联的任务')) {
        return NextResponse.json(
          { error: result.error },
          { status: 409 } // Conflict
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '项目删除成功'
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      { error: '删除项目失败' },
      { status: 500 }
    );
  }
}