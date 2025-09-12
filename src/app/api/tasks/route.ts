import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  dueDate?: string;
  assignee?: string;
}

// GET - 获取任务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee = searchParams.get('assignee');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const queryParams: any[] = [];
    
    if (projectId) {
      query += ' AND project_id = ?';
      queryParams.push(projectId);
    }
    
    if (status) {
      query += ' AND status = ?';
      queryParams.push(status);
    }
    
    if (priority) {
      query += ' AND priority = ?';
      queryParams.push(priority);
    }
    
    if (assignee) {
      query += ' AND assignee = ?';
      queryParams.push(assignee);
    }
    
    // 添加排序和分页
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    const stmt = db.prepare(query);
    const tasks = stmt.all(...queryParams);
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE 1=1';
    const countParams: any[] = [];
    
    if (projectId) {
      countQuery += ' AND project_id = ?';
      countParams.push(projectId);
    }
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }
    
    if (assignee) {
      countQuery += ' AND assignee = ?';
      countParams.push(assignee);
    }
    
    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams) as { total: number };
    
    const formattedTasks = tasks.map((task: any) => ({
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
    }));
    
    return NextResponse.json({
      tasks: formattedTasks,
      total,
      hasMore: offset + limit < total
    });
    
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const taskData: CreateTaskRequest = await request.json();
    
    // 验证必需字段
    if (!taskData.title || !taskData.title.trim()) {
      return NextResponse.json(
        { error: '任务标题不能为空' },
        { status: 400 }
      );
    }
    
    if (!taskData.projectId) {
      return NextResponse.json(
        { error: '必须指定项目ID' },
        { status: 400 }
      );
    }
    
    // 检查项目是否存在
    const checkProjectStmt = db.prepare('SELECT id FROM projects WHERE id = ?');
    const project = checkProjectStmt.get(taskData.projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: '指定的项目不存在' },
        { status: 404 }
      );
    }
    
    // 生成任务ID
    const taskId = uuidv4();
    const now = new Date().toISOString();
    
    // 插入新任务
    const insertStmt = db.prepare(`
      INSERT INTO tasks (
        id, title, description, project_id, status, priority,
        estimated_hours, due_date, assignee, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertStmt.run(
      taskId,
      taskData.title.trim(),
      taskData.description?.trim() || null,
      taskData.projectId,
      taskData.status || 'todo',
      taskData.priority || 'medium',
      taskData.estimatedHours || null,
      taskData.dueDate || null,
      taskData.assignee || null,
      now,
      now
    );
    
    // 获取创建的任务
    const getTaskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const createdTask = getTaskStmt.get(taskId) as any;
    
    return NextResponse.json({
      task: {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        projectId: createdTask.project_id,
        status: createdTask.status,
        priority: createdTask.priority,
        estimatedHours: createdTask.estimated_hours,
        actualHours: createdTask.actual_hours || 0,
        dueDate: createdTask.due_date,
        completedAt: createdTask.completed_at,
        createdAt: createdTask.created_at,
        updatedAt: createdTask.updated_at,
        assignee: createdTask.assignee
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    );
  }
}