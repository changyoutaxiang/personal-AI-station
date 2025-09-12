import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateProjectRequest, ProjectWithStats } from '@/types/project';

// 生成项目ID
function generateProjectId(): string {
  return 'proj_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// GET - 获取项目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const parentId = searchParams.get('parentId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let query = `
      SELECT 
        p.*,
        COALESCE(task_stats.task_count, 0) as task_count,
        COALESCE(task_stats.completed_tasks, 0) as completed_tasks,
        COALESCE(task_stats.total_estimated_hours, 0) as calculated_estimated_hours,
        COALESCE(task_stats.total_actual_hours, 0) as calculated_actual_hours
      FROM projects p
      LEFT JOIN (
        SELECT 
          project_id,
          COUNT(*) as task_count,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
          SUM(COALESCE(estimated_hours, 0)) as total_estimated_hours,
          SUM(COALESCE(actual_hours, 0)) as total_actual_hours
        FROM tasks
        GROUP BY project_id
      ) task_stats ON p.id = task_stats.project_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND p.priority = ?';
      params.push(priority);
    }
    
    if (parentId) {
      query += ' AND p.parent_id = ?';
      params.push(parentId);
    }
    
    query += ' ORDER BY p.updated_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const projects = db.prepare(query).all(...params) as any[];
    
    // 获取每个项目的子项目
    const projectsWithSubProjects: ProjectWithStats[] = [];
    const getSubProjectsStmt = db.prepare('SELECT * FROM projects WHERE parent_id = ? ORDER BY created_at ASC');
    
    for (const project of projects) {
      const subProjects = getSubProjectsStmt.all(project.id);
      
      projectsWithSubProjects.push({
        id: project.id,
        name: project.name,
        description: project.description,
        parentId: project.parent_id,
        status: project.status,
        priority: project.priority,
        progress: project.progress || 0,
        estimatedHours: project.calculated_estimated_hours > 0 ? project.calculated_estimated_hours : project.estimated_hours,
        actualHours: project.calculated_actual_hours > 0 ? project.calculated_actual_hours : (project.actual_hours || 0),
        startDate: project.start_date,
        dueDate: project.due_date,
        completedAt: project.completed_at,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        color: project.color,
        icon: project.icon,
        templateId: project.template_id,
        taskCount: project.task_count || 0,
        completedTasks: project.completed_tasks || 0,
        subProjects: subProjects.map((sp: any) => ({
          id: sp.id,
          name: sp.name,
          description: sp.description,
          parentId: sp.parent_id,
          status: sp.status,
          priority: sp.priority,
          progress: sp.progress || 0,
          estimatedHours: sp.estimated_hours,
          actualHours: sp.actual_hours || 0,
          startDate: sp.start_date,
          dueDate: sp.due_date,
          completedAt: sp.completed_at,
          createdAt: sp.created_at,
          updatedAt: sp.updated_at,
          color: sp.color,
          icon: sp.icon,
          templateId: sp.template_id
        }))
      });
    }
    
    return NextResponse.json({
      projects: projectsWithSubProjects,
      total: projects.length,
      hasMore: projects.length === limit
    });
    
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      { error: '获取项目列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建项目
export async function POST(request: NextRequest) {
  try {
    const projectData: CreateProjectRequest = await request.json();
    
    // 验证必需字段
    if (!projectData.name?.trim()) {
      return NextResponse.json(
        { error: '项目名称不能为空' },
        { status: 400 }
      );
    }
    
    const projectId = generateProjectId();
    
    // 插入项目
    const insertStmt = db.prepare(`
      INSERT INTO projects (
        id, name, description, parent_id, status, priority, 
        estimated_hours, start_date, due_date, color, icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      projectId,
      projectData.name.trim(),
      projectData.description?.trim() || null,
      projectData.parentId || null,
      projectData.status || 'active',
      projectData.priority || 'medium',
      projectData.estimatedHours || null,
      projectData.startDate || null,
      projectData.dueDate || null,
      projectData.color || null,
      projectData.icon || null
    );
    
    // 获取创建的项目
    const getProjectStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = getProjectStmt.get(projectId) as any;
    
    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        parentId: project.parent_id,
        status: project.status,
        priority: project.priority,
        progress: project.progress || 0,
        estimatedHours: project.estimated_hours,
        actualHours: project.actual_hours || 0,
        startDate: project.start_date,
        dueDate: project.due_date,
        completedAt: project.completed_at,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        color: project.color,
        icon: project.icon,
        templateId: project.template_id
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json(
      { error: '创建项目失败' },
      { status: 500 }
    );
  }
}