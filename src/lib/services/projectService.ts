import { Project, ProjectWithStats, CreateProjectRequest, Task } from '@/types/project';

export class ProjectService {
  private static baseUrl = '/api/projects';

  /**
   * 获取项目列表
   */
  static async getProjects(params?: {
    status?: string;
    priority?: string;
    parentId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: ProjectWithStats[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.parentId) searchParams.set('parentId', params.parentId);
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
      throw new Error(error.error || '获取项目列表失败');
    }
    
    return await response.json();
  }

  /**
   * 获取单个项目详情
   */
  static async getProject(id: string): Promise<ProjectWithStats & { tasks: Task[] }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取项目详情失败');
    }
    
    const data = await response.json();
    return data.project;
  }

  /**
   * 创建项目
   */
  static async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '创建项目失败');
    }
    
    const data = await response.json();
    return data.project;
  }

  /**
   * 更新项目
   */
  static async updateProject(id: string, updates: Partial<CreateProjectRequest>): Promise<Project> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '更新项目失败');
    }
    
    const data = await response.json();
    return data.project;
  }

  /**
   * 删除项目
   */
  static async deleteProject(id: string): Promise<{ message: string; projectId: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '删除项目失败');
    }
    
    return await response.json();
  }

  /**
   * 批量操作项目
   */
  static async batchUpdate(
    projectIds: string[],
    updates: Partial<Pick<CreateProjectRequest, 'status' | 'priority'>>
  ): Promise<{ updated: number; failed: number }> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectIds,
        updates,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '批量更新失败');
    }
    
    return await response.json();
  }

  /**
   * 搜索项目
   */
  static async searchProjects(query: string): Promise<ProjectWithStats[]> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '搜索失败');
    }
    
    const data = await response.json();
    return data.projects;
  }

  /**
   * 获取项目统计信息
   */
  static async getProjectStats(id: string): Promise<{
    taskStats: {
      total: number;
      completed: number;
      inProgress: number;
      pending: number;
    };
    timeStats: {
      estimated: number;
      actual: number;
      remaining: number;
    };
    progressStats: {
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  }> {
    const response = await fetch(`${this.baseUrl}/${id}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '获取统计信息失败');
    }
    
    return await response.json();
  }

  /**
   * 获取根项目（无父项目的项目）
   */
  static async getRootProjects(): Promise<ProjectWithStats[]> {
    return this.getProjects({ parentId: '' }).then(data => data.projects);
  }

  /**
   * 获取项目层次结构
   */
  static async getProjectHierarchy(): Promise<ProjectWithStats[]> {
    const allProjects = await this.getProjects({ limit: 1000 }).then(data => data.projects);
    
    // 构建层次结构
    const projectMap = new Map<string, ProjectWithStats>();
    const rootProjects: ProjectWithStats[] = [];
    
    // 建立映射
    allProjects.forEach(project => {
      projectMap.set(project.id, { ...project, subProjects: [] });
    });
    
    // 构建层次关系
    allProjects.forEach(project => {
      const projectWithSubs = projectMap.get(project.id)!;
      
      if (project.parentId) {
        const parent = projectMap.get(project.parentId);
        if (parent) {
          parent.subProjects.push(projectWithSubs);
        }
      } else {
        rootProjects.push(projectWithSubs);
      }
    });
    
    return rootProjects;
  }

  /**
   * 计算项目进度
   */
  static calculateProgress(project: ProjectWithStats): number {
    if (project.status === 'completed') return 100;
    if (project.taskCount === 0) return 0;
    
    return Math.round((project.completedTasks / project.taskCount) * 100);
  }

  /**
   * 判断项目是否逾期
   */
  static isOverdue(project: Project): boolean {
    if (!project.dueDate || project.status === 'completed') return false;
    return new Date(project.dueDate) < new Date();
  }

  /**
   * 获取项目健康度评分
   */
  static getHealthScore(project: ProjectWithStats): {
    score: number;
    level: 'excellent' | 'good' | 'warning' | 'critical';
    factors: string[];
  } {
    let score = 100;
    const factors: string[] = [];
    
    // 进度评估
    const progress = this.calculateProgress(project);
    if (progress < 30) {
      score -= 20;
      factors.push('进度缓慢');
    }
    
    // 逾期评估
    if (this.isOverdue(project)) {
      score -= 30;
      factors.push('已逾期');
    }
    
    // 任务完成率
    if (project.taskCount > 0) {
      const completionRate = project.completedTasks / project.taskCount;
      if (completionRate < 0.5) {
        score -= 15;
        factors.push('任务完成率低');
      }
    }
    
    // 工时评估
    if (project.estimatedHours && project.actualHours > project.estimatedHours * 1.2) {
      score -= 10;
      factors.push('超出预估工时');
    }
    
    let level: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 90) level = 'excellent';
    else if (score >= 70) level = 'good';
    else if (score >= 50) level = 'warning';
    else level = 'critical';
    
    return { score, level, factors };
  }
}