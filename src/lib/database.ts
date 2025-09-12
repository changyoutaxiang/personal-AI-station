import { supabase } from './supabase'
import { db as sqliteDb, initDatabase as initSQLiteDatabase } from './db'

// 数据库类型
type DatabaseType = 'supabase' | 'sqlite'

// 获取当前数据库类型
function getDatabaseType(): DatabaseType {
  return (process.env.DATABASE_TYPE as DatabaseType) || 'sqlite'
}

// 统一的数据库接口
export class Database {
  private static instance: Database
  private dbType: DatabaseType

  private constructor() {
    this.dbType = getDatabaseType()
    if (this.dbType === 'sqlite') {
      initSQLiteDatabase()
    }
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  // 条目相关操作
  async getEntries(limit?: number, offset?: number) {
    if (this.dbType === 'supabase') {
      let query = supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (limit) query = query.limit(limit)
      if (offset) query = query.range(offset, offset + (limit || 10) - 1)
      
      const { data, error } = await query
      if (error) throw error
      return data
    } else {
      let sql = 'SELECT * FROM entries ORDER BY created_at DESC'
      if (limit) sql += ` LIMIT ${limit}`
      if (offset) sql += ` OFFSET ${offset}`
      
      return sqliteDb.prepare(sql).all()
    }
  }

  async createEntry(content: string, projectTag?: string, effortTag?: string, dailyReportTag?: string) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('entries')
        .insert({
          content,
          project_tag: projectTag,
          effort_tag: effortTag,
          daily_report_tag: dailyReportTag,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const stmt = sqliteDb.prepare(`
        INSERT INTO entries (content, project_tag, effort_tag, daily_report_tag, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      const result = stmt.run(content, projectTag, effortTag, dailyReportTag)
      return { id: result.lastInsertRowid, content, project_tag: projectTag, effort_tag: effortTag, daily_report_tag: dailyReportTag }
    }
  }

  async updateEntry(id: number, content: string, projectTag?: string, effortTag?: string, dailyReportTag?: string) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('entries')
        .update({
          content,
          project_tag: projectTag,
          effort_tag: effortTag,
          daily_report_tag: dailyReportTag,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const stmt = sqliteDb.prepare(`
        UPDATE entries 
        SET content = ?, project_tag = ?, effort_tag = ?, daily_report_tag = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      stmt.run(content, projectTag, effortTag, dailyReportTag, id)
      return { id, content, project_tag: projectTag, effort_tag: effortTag, daily_report_tag: dailyReportTag }
    }
  }

  async deleteEntry(id: number) {
    if (this.dbType === 'supabase') {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } else {
      const stmt = sqliteDb.prepare('DELETE FROM entries WHERE id = ?')
      stmt.run(id)
    }
  }

  async searchEntries(query: string) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .textSearch('content', query)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } else {
      const stmt = sqliteDb.prepare(`
        SELECT * FROM entries 
        WHERE content LIKE ? 
        ORDER BY created_at DESC
      `)
      return stmt.all(`%${query}%`)
    }
  }

  // 任务相关操作
  async getTasks() {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } else {
      return sqliteDb.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all()
    }
  }

  async createTask(task: any) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const stmt = sqliteDb.prepare(`
        INSERT INTO tasks (id, title, description, status, priority, estimated_hours, actual_hours, due_date, completed_at, created_at, updated_at, assignee)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
      `)
      stmt.run(task.id, task.title, task.description, task.status, task.priority, task.estimated_hours, task.actual_hours, task.due_date, task.completed_at, task.assignee)
      return task
    }
  }

  async updateTask(id: string, updates: any) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      const stmt = sqliteDb.prepare(`
        UPDATE tasks 
        SET ${fields}, updated_at = datetime('now')
        WHERE id = ?
      `)
      stmt.run(...values, id)
      return { id, ...updates }
    }
  }

  async deleteTask(id: string) {
    if (this.dbType === 'supabase') {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } else {
      const stmt = sqliteDb.prepare('DELETE FROM tasks WHERE id = ?')
      stmt.run(id)
    }
  }

  // AI洞察相关操作
  async getAIInsights() {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    } else {
      return sqliteDb.prepare('SELECT * FROM ai_insights WHERE is_active = 1 ORDER BY created_at DESC').all()
    }
  }

  async createAIInsight(insight: any) {
    if (this.dbType === 'supabase') {
      const { data, error } = await supabase
        .from('ai_insights')
        .insert({
          ...insight,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      const stmt = sqliteDb.prepare(`
        INSERT INTO ai_insights (insight_type, title, content, data_source, confidence_score, created_at, valid_until, is_active)
        VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)
      `)
      const result = stmt.run(insight.insight_type, insight.title, insight.content, insight.data_source, insight.confidence_score, insight.valid_until, insight.is_active)
      return { id: result.lastInsertRowid, ...insight }
    }
  }
}

// 导出单例实例
export const database = Database.getInstance()