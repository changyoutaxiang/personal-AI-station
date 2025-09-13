/**
 * 数据库适配器 - 统一的数据库访问层
 * 根据环境变量自动切换 SQLite 或 Supabase
 */

import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 类型定义
export interface DatabaseConfig {
  type: 'sqlite' | 'supabase';
  supabase?: {
    url: string;
    anonKey: string;
  };
  sqlite?: {
    path: string;
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
 * 数据库适配器类
 */
export class DatabaseAdapter {
  private config: DatabaseConfig;
  private supabaseClient: any;
  private sqliteDb: any;

  constructor() {
    this.config = this.loadConfig();
    this.initializeClients();
  }

  /**
   * 加载数据库配置
   */
  private loadConfig(): DatabaseConfig {
    const databaseType = process.env.DATABASE_TYPE as 'sqlite' | 'supabase' || 'sqlite';

    const config: DatabaseConfig = {
      type: databaseType
    };

    if (databaseType === 'supabase') {
      config.supabase = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      };
    } else {
      // 确保数据目录存在
      const dataDir = join(process.cwd(), 'data');
      if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
      }

      config.sqlite = {
        path: join(dataDir, 'digital-brain.db')
      };
    }

    return config;
  }

  /**
   * 初始化数据库客户端
   */
  private initializeClients() {
    if (this.config.type === 'supabase' && this.config.supabase) {
      this.supabaseClient = createClient(
        this.config.supabase.url,
        this.config.supabase.anonKey
      );
    }

    if (this.config.type === 'sqlite' && this.config.sqlite) {
      this.sqliteDb = new Database(this.config.sqlite.path);
    }
  }

  /**
   * 获取当前数据库类型
   */
  getDatabaseType(): 'sqlite' | 'supabase' {
    return this.config.type;
  }

  /**
   * 任务相关操作
   */
  async getTasks(limit?: number): Promise<TaskRecord[]> {
    if (this.config.type === 'supabase') {
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
    } else {
      // SQLite 实现
      const query = limit
        ? 'SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?'
        : 'SELECT * FROM tasks ORDER BY created_at DESC';

      const stmt = this.sqliteDb.prepare(query);
      const rows = limit ? stmt.all(limit) : stmt.all();

      return rows.map(this.transformSqliteTask);
    }
  }

  async getTaskById(id: string): Promise<TaskRecord | null> {
    if (this.config.type === 'supabase') {
      const { data, error } = await this.supabaseClient
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM tasks WHERE id = ?');
      const row = stmt.get(id);

      return row ? this.transformSqliteTask(row) : null;
    }
  }

  async createTask(task: Omit<TaskRecord, 'id' | 'created_at' | 'updated_at'>): Promise<TaskRecord> {
    const now = new Date().toISOString();
    const newTask = {
      ...task,
      id: this.generateId(),
      created_at: now,
      updated_at: now
    };

    if (this.config.type === 'supabase') {
      const { data, error } = await this.supabaseClient
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } else {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO tasks (id, title, description, project_id, status, priority,
                          estimated_hours, actual_hours, due_date, completed_at,
                          created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        newTask.id, newTask.title, newTask.description, newTask.project_id,
        newTask.status, newTask.priority, newTask.estimated_hours,
        newTask.actual_hours, newTask.due_date, newTask.completed_at,
        newTask.created_at, newTask.updated_at
      );

      return newTask;
    }
  }

  async updateTask(id: string, updates: Partial<TaskRecord>): Promise<TaskRecord> {
    const updatedAt = new Date().toISOString();
    const taskUpdates = { ...updates, updated_at: updatedAt };

    if (this.config.type === 'supabase') {
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
    } else {
      // 构建动态 SQL 更新语句
      const fields = Object.keys(taskUpdates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(taskUpdates), id];

      const stmt = this.sqliteDb.prepare(`UPDATE tasks SET ${setClause} WHERE id = ?`);
      stmt.run(...values);

      // 返回更新后的记录
      const updated = await this.getTaskById(id);
      if (!updated) {
        throw new Error(`Task with id ${id} not found after update`);
      }

      return updated;
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (this.config.type === 'supabase') {
      const { error } = await this.supabaseClient
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
    } else {
      const stmt = this.sqliteDb.prepare('DELETE FROM tasks WHERE id = ?');
      stmt.run(id);
    }
  }

  /**
   * 项目相关操作
   */
  async getProjects(): Promise<ProjectRecord[]> {
    if (this.config.type === 'supabase') {
      const { data, error } = await this.supabaseClient
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data || [];
    } else {
      const stmt = this.sqliteDb.prepare('SELECT * FROM projects ORDER BY created_at DESC');
      const rows = stmt.all();

      return rows.map(this.transformSqliteProject);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; message: string; type: string }> {
    try {
      if (this.config.type === 'supabase') {
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
      } else {
        // SQLite 健康检查
        const stmt = this.sqliteDb.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type="table"');
        const result = stmt.get();

        return {
          status: 'ok',
          message: `SQLite connected successfully, ${result.count} tables found`,
          type: 'sqlite'
        };
      }
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

  private transformSqliteTask(row: any): TaskRecord {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      project_id: row.project_id,
      status: row.status,
      priority: row.priority,
      estimated_hours: row.estimated_hours,
      actual_hours: row.actual_hours,
      due_date: row.due_date,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  private transformSqliteProject(row: any): ProjectRecord {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      priority: row.priority,
      start_date: row.start_date,
      due_date: row.due_date,
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      owner: row.owner,
      color: row.color || '#3B82F6',
      is_archived: row.is_archived || false
    };
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.sqliteDb) {
      this.sqliteDb.close();
    }
  }
}

// 导出单例实例
export const dbAdapter = new DatabaseAdapter();

// 导出便捷方法
export const getDatabaseType = () => dbAdapter.getDatabaseType();
export const healthCheckDatabase = () => dbAdapter.healthCheck();