// 项目相关类型定义

export interface CreateProjectRequest {
  name: string;
  description?: string;
  estimatedHours?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  parentId?: string;
  status?: 'active' | 'completed' | 'archived' | 'on_hold';
  startDate?: string;
  dueDate?: string;
  color?: string;
  icon?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'completed' | 'archived' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  estimatedHours?: number;
  actualHours: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  color?: string;
  icon?: string;
  templateId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  actualHours: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

export interface ProjectWithStats extends Project {
  taskCount: number;
  completedTasks: number;
  subProjects: Project[];
}