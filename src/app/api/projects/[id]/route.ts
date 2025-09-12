import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateProjectRequest } from '@/types/project';

// GET - 获取单个项目详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 获取项目基本信息
    const getProjectStmt = db.prepare(`
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
      WHERE p.id = ?
    `);
    
    const project = getProjectStmt.get(id) as any;
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 获取子项目
    const getSubProjectsStmt = db.prepare('SELECT * FROM projects WHERE parent_id = ? ORDER BY created_at ASC');
    const subProjects = getSubProjectsStmt.all(id);
    
    // 获取项目任务
    const getTasksStmt = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at ASC');
    const tasks = getTasksStmt.all(id);
    
    const projectWithStats = {
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
      })),
      tasks: tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        projectId: task.project_id,
        status: task.status,
        priority: task.priority,
        estimatedHours: task.estimated_hours,
        actualHours: task.actual_hours || 0,
        dueDate: task.due_date,
        completedAt: task.completed_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        assignee: task.assignee
      }))
    };
    
    return NextResponse.json({ project: projectWithStats });
    
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      { error: '获取项目详情失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新项目
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<CreateProjectRequest> = await request.json();
    
    // 检查项目是否存在
    const checkProjectStmt = db.prepare('SELECT id FROM projects WHERE id = ?');
    const existingProject = checkProjectStmt.get(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 构建更新语句
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean | null)[] = [];
    
    if (updates.name !== undefined) {
      if (!updates.name.trim()) {
        return NextResponse.json(
          { error: '项目名称不能为空' },
          { status: 400 }
        );
      }
      updateFields.push('name = ?');
      updateValues.push(updates.name.trim());
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description?.trim() || null);
    }
    
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
      
      // 如果状态改为完成，设置完成时间
      if (updates.status === 'completed') {
        updateFields.push('completed_at = ?');
        updateValues.push(new Date().toISOString());
        updateFields.push('progress = ?');
        updateValues.push(100);
      } else if (updates.status === 'active') {
        // 如果从完成改为进行中，清除完成时间
        updateFields.push('completed_at = ?');
        updateValues.push(null);
      }
    }
    
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(updates.priority);
    }
    
    if (updates.estimatedHours !== undefined) {
      updateFields.push('estimated_hours = ?');
      updateValues.push(updates.estimatedHours);
    }
    
    if (updates.startDate !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(updates.startDate || null);
    }
    
    if (updates.dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(updates.dueDate || null);
    }
    
    if (updates.color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(updates.color || null);
    }
    
    if (updates.icon !== undefined) {
      updateFields.push('icon = ?');
      updateValues.push(updates.icon || null);
    }
    
    if (updates.parentId !== undefined) {
      // 检查父项目是否存在且不是自己
      if (updates.parentId && updates.parentId !== id) {
        const checkParentStmt = db.prepare('SELECT id FROM projects WHERE id = ?');
        const parentProject = checkParentStmt.get(updates.parentId);
        if (!parentProject) {
          return NextResponse.json(
            { error: '父项目不存在' },
            { status: 400 }
          );
        }
      }
      updateFields.push('parent_id = ?');
      updateValues.push(updates.parentId || null);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: '没有需要更新的字段' },
        { status: 400 }
      );
    }
    
    // 执行更新
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    const updateStmt = db.prepare(
      `UPDATE projects SET ${updateFields.join(', ')} WHERE id = ?`
    );
    updateStmt.run(...updateValues);
    
    // 获取更新后的项目
    const getUpdatedProjectStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const updatedProject = getUpdatedProjectStmt.get(id) as any;
    
    return NextResponse.json({
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        parentId: updatedProject.parent_id,
        status: updatedProject.status,
        priority: updatedProject.priority,
        progress: updatedProject.progress || 0,
        estimatedHours: updatedProject.estimated_hours,
        actualHours: updatedProject.actual_hours || 0,
        startDate: updatedProject.start_date,
        dueDate: updatedProject.due_date,
        completedAt: updatedProject.completed_at,
        createdAt: updatedProject.created_at,
        updatedAt: updatedProject.updated_at,
        color: updatedProject.color,
        icon: updatedProject.icon,
        templateId: updatedProject.template_id
      }
    });
    
  } catch (error) {
    console.error('更新项目失败:', error);
    return NextResponse.json(
      { error: '更新项目失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除项目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 检查项目是否存在
    const checkProjectStmt = db.prepare('SELECT id FROM projects WHERE id = ?');
    const project = checkProjectStmt.get(id);
    
    if (!project) {
      return NextResponse.json(
        { error: '项目不存在' },
        { status: 404 }
      );
    }
    
    // 检查是否有子项目
    const checkSubProjectsStmt = db.prepare('SELECT id FROM projects WHERE parent_id = ?');
    const subProjects = checkSubProjectsStmt.all(id);
    
    if (subProjects.length > 0) {
      return NextResponse.json(
        { error: '无法删除包含子项目的项目，请先删除或移动子项目' },
        { status: 400 }
      );
    }
    
    // 开启事务删除项目及相关数据
    const deleteTransaction = db.transaction(() => {
      // 删除项目任务
      const deleteTasksStmt = db.prepare('DELETE FROM tasks WHERE project_id = ?');
      deleteTasksStmt.run(id);
      
      // 删除项目标签关联
      const deleteTagsStmt = db.prepare('DELETE FROM project_tags WHERE project_id = ?');
      deleteTagsStmt.run(id);
      
      // 删除项目
      const deleteProjectStmt = db.prepare('DELETE FROM projects WHERE id = ?');
      deleteProjectStmt.run(id);
    });
    
    deleteTransaction();
    
    return NextResponse.json({ 
      message: '项目删除成功',
      projectId: id
    });
    
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      { error: '删除项目失败' },
      { status: 500 }
    );
  }
}