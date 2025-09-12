import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CreateTaskRequest } from '../route';
import { Task } from '@/types/project';

// GET - 获取单个任务
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const getTaskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = getTaskStmt.get(id) as any;
    
    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      task: {
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
      }
    });
    
  } catch (error) {
    console.error('获取任务失败:', error);
    return NextResponse.json(
      { error: '获取任务失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新任务
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates: Partial<Task> = await request.json();
    
    // 检查任务是否存在
    const checkTaskStmt = db.prepare('SELECT id, status FROM tasks WHERE id = ?');
    const existingTask = checkTaskStmt.get(id) as { id: string; status: Task['status'] } | undefined;
    
    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }
    
    // 构建更新语句
    const updateFields: string[] = [];
    const updateValues: (string | number | boolean | null)[] = [];
    
    if (updates.title !== undefined) {
      if (!updates.title.trim()) {
        return NextResponse.json(
          { error: '任务标题不能为空' },
          { status: 400 }
        );
      }
      updateFields.push('title = ?');
      updateValues.push(updates.title.trim());
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description?.trim() || null);
    }
    
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
      
      // 如果状态改为完成，设置完成时间
      if (updates.status === 'done') {
        updateFields.push('completed_at = ?');
        updateValues.push(new Date().toISOString());
      } else if (existingTask && existingTask.status === 'done' && (updates.status as any) !== 'done') {
        // 如果从完成改为其他状态，清除完成时间
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
    
    if (updates.dueDate !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(updates.dueDate || null);
    }
    
    if (updates.assignee !== undefined) {
      updateFields.push('assignee = ?');
      updateValues.push(updates.assignee || null);
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
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`
    );
    updateStmt.run(...updateValues);
    
    // 获取更新后的任务
    const getUpdatedTaskStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const updatedTask = getUpdatedTaskStmt.get(id) as any;
    
    return NextResponse.json({
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        projectId: updatedTask.project_id,
        status: updatedTask.status,
        priority: updatedTask.priority,
        estimatedHours: updatedTask.estimated_hours,
        actualHours: updatedTask.actual_hours || 0,
        dueDate: updatedTask.due_date,
        completedAt: updatedTask.completed_at,
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at,
        assignee: updatedTask.assignee
      }
    });
    
  } catch (error) {
    console.error('更新任务失败:', error);
    return NextResponse.json(
      { error: '更新任务失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 检查任务是否存在
    const checkTaskStmt = db.prepare('SELECT id FROM tasks WHERE id = ?');
    const task = checkTaskStmt.get(id);
    
    if (!task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }
    
    // 删除任务
    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    deleteStmt.run(id);
    
    return NextResponse.json({ 
      message: '任务删除成功',
      taskId: id
    });
    
  } catch (error) {
    console.error('删除任务失败:', error);
    return NextResponse.json(
      { error: '删除任务失败' },
      { status: 500 }
    );
  }
}