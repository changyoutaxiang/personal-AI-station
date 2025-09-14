import { supabase } from '@/lib/supabase-client';
import type { DbResult } from '@/lib/supabase-client';
import type { Project, CreateProjectRequest, ProjectWithStats } from '@/types/project';

// Helper function to convert database row to Project type
function dbRowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    parentId: row.parent_id,
    status: row.status,
    priority: row.priority,
    progress: row.progress || 0,
    estimatedHours: row.estimated_hours,
    actualHours: row.actual_hours || 0,
    startDate: row.start_date,
    dueDate: row.due_date,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    color: row.color,
    icon: row.icon,
    templateId: row.template_id
  };
}

// Helper function to convert database rows to Projects array
function dbRowsToProjects(rows: any[]): Project[] {
  return rows.map(dbRowToProject);
}

// 获取所有项目
export async function getAllProjects(): Promise<DbResult<Project[]>> {
  const result = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  return {
    data: dbRowsToProjects(result.data || []),
    error: null,
    success: true
  };
}

// 获取带统计信息的项目列表
export async function getProjectsWithStats(): Promise<DbResult<ProjectWithStats[]>> {
  const result = await supabase
    .from('projects')
    .select(`
      *,
      tasks:tasks(count)
    `)
    .order('created_at', { ascending: false });

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  const projectsWithStats = (result.data || []).map((row: any) => {
    const project = dbRowToProject(row);
    return {
      ...project,
      taskCount: row.tasks?.[0]?.count || 0,
      completedTasks: 0, // TODO: 需要额外查询已完成任务数
      subProjects: [] // TODO: 需要额外查询子项目
    } as ProjectWithStats;
  });

  return {
    data: projectsWithStats,
    error: null,
    success: true
  };
}

// 根据ID获取项目
export async function getProjectById(id: string): Promise<DbResult<Project>> {
  const result = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  if (!result.data) {
    return { data: null, error: 'Project not found', success: false };
  }

  return {
    data: dbRowToProject(result.data),
    error: null,
    success: true
  };
}

// 创建项目
export async function createProject(projectData: CreateProjectRequest): Promise<DbResult<Project>> {
  const dbData = {
    name: projectData.name,
    description: projectData.description || '',
    parent_id: projectData.parentId || null,
    status: projectData.status || 'active',
    priority: projectData.priority || 'medium',
    progress: 0,
    estimated_hours: projectData.estimatedHours || 0,
    actual_hours: 0,
    start_date: projectData.startDate || null,
    due_date: projectData.dueDate || null,
    color: projectData.color || null,
    icon: projectData.icon || null
  };

  const result = await supabase
    .from('projects')
    .insert(dbData)
    .select()
    .single();

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  if (!result.data) {
    return { data: null, error: 'Failed to create project', success: false };
  }

  return {
    data: dbRowToProject(result.data),
    error: null,
    success: true
  };
}

// 更新项目
export async function updateProject(id: string, updates: Partial<CreateProjectRequest>): Promise<DbResult<Project>> {
  const dbUpdates: any = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.icon !== undefined) dbUpdates.icon = updates.icon;

  const result = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  if (!result.data) {
    return { data: null, error: 'Project not found or failed to update', success: false };
  }

  return {
    data: dbRowToProject(result.data),
    error: null,
    success: true
  };
}

// 删除项目
export async function deleteProject(id: string): Promise<DbResult<boolean>> {
  const result = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  return {
    data: true,
    error: null,
    success: true
  };
}

// 获取项目统计信息
export async function getProjectStats(): Promise<DbResult<{ total: number; active: number; completed: number; archived: number; }>> {
  const result = await supabase
    .from('projects')
    .select('status');

  if (result.error) {
    return { data: null, error: result.error, success: false };
  }

  const data = result.data || [];
  const stats = {
    total: data.length,
    active: data.filter(p => p.status === 'active').length,
    completed: data.filter(p => p.status === 'completed').length,
    archived: data.filter(p => p.status === 'archived').length
  };

  return { data: stats, error: null, success: true };
}