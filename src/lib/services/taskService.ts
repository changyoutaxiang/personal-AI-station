import { Task } from '@/types/project';

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

export class TaskService {
  private static baseUrl = '/api/tasks';

  /**
   * 获取任务列表
   */
  static async getTasks(params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.assignee) searchParams.set('assignee', params.assignee);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const url = `${this.baseUrl}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取任务列表失败');
    }
    
    return await response.json();
  }

  /**
   * 获取单个任务详情
   */
  static async getTask(id: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取任务详情失败');
    }
    
    const data = await response.json();
    return data.task;
  }

  /**
   * 创建任务
   */
  static async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '创建任务失败');
    }
    
    const data = await response.json();
    return data.task;
  }

  /**
   * 更新任务
   */
  static async updateTask(id: string, updates: Partial<CreateTaskRequest>): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '更新任务失败');
    }
    
    const data = await response.json();
    return data.task;
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: string): Promise<{ message: string; taskId: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '删除任务失败');
    }
    
    return await response.json();
  }

  /**
   * 更新任务状态
   */
  static async updateTaskStatus(id: string, status: Task['status']): Promise<Task> {
    return this.updateTask(id, { status });
  }

  /**
   * 更新任务优先级
   */
  static async updateTaskPriority(id: string, priority: Task['priority']): Promise<Task> {
    return this.updateTask(id, { priority });
  }

  /**
   * 获取项目的任务统计
   */
  static async getProjectTaskStats(projectId: string): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    cancelled: number;
  }> {
    const { tasks } = await this.getTasks({ projectId, limit: 1000 });
    
    const stats = {
      total: tasks.length,
      todo: 0,
      inProgress: 0,
      review: 0,
      done: 0,
      cancelled: 0
    };
    
    tasks.forEach(task => {
      switch (task.status) {
        case 'todo':
          stats.todo++;
          break;
        case 'in_progress':
          stats.inProgress++;
          break;
        case 'review':
          stats.review++;
          break;
        case 'done':
          stats.done++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
      }
    });
    
    return stats;
  }

  /**
   * 批量更新任务状态
   */
  static async batchUpdateTaskStatus(
    taskIds: string[],
    status: Task['status']
  ): Promise<{ updated: number; failed: number }> {
    let updated = 0;
    let failed = 0;
    
    for (const taskId of taskIds) {
      try {
        await this.updateTaskStatus(taskId, status);
        updated++;
      } catch (error) {
        console.error(`更新任务 ${taskId} 状态失败:`, error);
        failed++;
      }
    }
    
    return { updated, failed };
  }

  /**
   * 搜索任务
   */
  static async searchTasks(query: string, projectId?: string): Promise<Task[]> {
    // 注意：这里简单实现为获取所有任务然后过滤
    // 生产环境中应该在API层实现搜索
    const { tasks } = await this.getTasks({ 
      projectId,
      limit: 1000 
    });
    
    const searchQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchQuery) ||
      (task.description && task.description.toLowerCase().includes(searchQuery)) ||
      (task.assignee && task.assignee.toLowerCase().includes(searchQuery))
    );
  }
}