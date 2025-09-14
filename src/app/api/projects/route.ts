import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, getProjectsWithStats } from '@/lib/supabase/projects';
import type { CreateProjectRequest } from '@/types/project';

// GET /api/projects - 获取所有项目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withStats = searchParams.get('withStats') === 'true';

    let result;
    if (withStats) {
      result = await getProjectsWithStats();
    } else {
      result = await getAllProjects();
    }

    if (!result.success) {
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
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/projects - 创建新项目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { error: '项目名称是必需的' },
        { status: 400 }
      );
    }

    const projectData: CreateProjectRequest = {
      name: body.name.trim(),
      description: body.description,
      status: body.status || 'active',
      priority: body.priority || 'medium',
      startDate: body.startDate,
      dueDate: body.dueDate,
      color: body.color || '#3B82F6',
      estimatedHours: body.estimatedHours,
      parentId: body.parentId,
      icon: body.icon
    };

    const result = await createProject(projectData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 201 });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json(
      { error: '创建项目失败' },
      { status: 500 }
    );
  }
}