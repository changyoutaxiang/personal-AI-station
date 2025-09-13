/**
 * 数据库适配器 - Supabase 专用数据库访问层
 * 已完全迁移到 Supabase，不再支持 SQLite
 */

import { createClient } from '@supabase/supabase-js';

// 类型定义
export interface DatabaseConfig {
  type: 'supabase';
  supabase: {
    url: string;
    anonKey: string;
  };
}

export interface TaskRecord {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  owner?: string;
  color: string;
  is_archived: boolean;
}

/**
 * Supabase 数据库适配器类
 */
export class DatabaseAdapter {
  private config: DatabaseConfig;
  private supabaseClient: any;

  constructor() {
    this.config = this.loadConfig();
    this.initializeClients();
  }

  /**
   * 加载数据库配置 - 仅支持 Supabase
   */
  private loadConfig(): DatabaseConfig {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase 配置不完整：缺少 NEXT_PUBLIC_SUPABASE_URL 或 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    return {
      type: 'supabase',
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey
      }
    };
  }

  /**
   * 初始化 Supabase 客户端
   */
  private initializeClients() {
    this.supabaseClient = createClient(
      this.config.supabase.url,
      this.config.supabase.anonKey
    );
  }

  /**
   * 获取当前数据库类型
   */
  getDatabaseType(): 'supabase' {
    return this.config.type;
  }

  /**
   * 任务相关操作
   */
  async getTasks(limit?: number): Promise<TaskRecord[]> {
    const query = this.supabaseClient
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit) {
      query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  }

  async getTaskById(id: string): Promise<TaskRecord | null> {
    const { data, error } = await this.supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  }

  async createTask(task: Omit<TaskRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TaskRecord> {
    const now = new Date().toISOString();
    const newTask = {
      ...task,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };

    const { data, error } = await this.supabaseClient
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  }

  async updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord> {
    const updatedAt = new Date().toISOString();
    const taskUpdates = { ...updates, updated_at: updatedAt };

    const { data, error } = await this.supabaseClient
      .from('tasks')
      .update(taskUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
  }

  /**
   * 项目相关操作
   */
  async getProjects(): Promise<ProjectRecord[]> {
    const { data, error } = await this.supabaseClient
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; type: string }> {
    try {
      const { data, error } = await this.supabaseClient
        .from('tasks')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        return {
          status: 'error',
          message: `Supabase connection failed: ${error.message}`,
          type: 'supabase'
        };
      }

      return {
        status: 'ok',
        message: `Supabase connected successfully`,
        type: 'supabase'
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Database health check failed: ${error}`,
        type: this.config.type
      };
    }
  }

  /**
   * 辅助方法
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const dbAdapter = new DatabaseAdapter();

// 导出便捷方法
export const getDatabaseType = () => dbAdapter.getDatabaseType();
export const healthCheckDatabase = () => dbAdapter.healthCheck();