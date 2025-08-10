import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
// AVAILABLE_MODELS 通过重新导出可用

// 确保数据目录存在
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 数据库文件路径
const dbPath = join(dataDir, 'digital-brain.db');

// 创建数据库连接
export const db = new Database(dbPath);

// 初始化数据库表
export function initDatabase() {
  // 启用外键约束
  db.exec('PRAGMA foreign_keys = ON');
  
  // 创建entries表
  const createEntriesTable = `
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      project_tag TEXT,

      attribute_tag TEXT DEFAULT '无',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 添加attribute_tag字段（如果不存在）
  const addAttributeColumn = `
    ALTER TABLE entries ADD COLUMN attribute_tag TEXT DEFAULT '无'
  `;

  // 添加urgency_tag字段（如果不存在）
  const addUrgencyColumn = `
    ALTER TABLE entries ADD COLUMN urgency_tag TEXT DEFAULT 'Jack 交办'
  `;

  // 添加effort_tag字段（如果不存在）
  const addEffortColumn = `
    ALTER TABLE entries ADD COLUMN effort_tag TEXT DEFAULT '轻松'
  `;

  // 添加sort_order字段（如果不存在）
  const addSortOrderColumn = `
    ALTER TABLE entries ADD COLUMN sort_order INTEGER DEFAULT 0
  `;

  // 添加daily_report_tag字段（如果不存在）
  const addDailyReportColumn = `
    ALTER TABLE entries ADD COLUMN daily_report_tag TEXT DEFAULT '核心进展'
  `;

  // 添加resource_consumption_tag字段（如果不存在）
  const addResourceConsumptionColumn = `
    ALTER TABLE entries ADD COLUMN resource_consumption_tag TEXT DEFAULT '低'
  `;

  // 添加resource_tag字段（如果不存在）
  const addResourceTagColumn = `
    ALTER TABLE entries ADD COLUMN resource_tag TEXT DEFAULT '自己搞定'
  `;





  // 创建AI洞察表
  const createInsightsTable = `
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      insight_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      data_source TEXT,
      confidence_score REAL DEFAULT 0.8,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      valid_until DATETIME,
      is_active BOOLEAN DEFAULT 1
    )
  `;

  // 创建用户工作模式表
  const createWorkPatternsTable = `
    CREATE TABLE IF NOT EXISTS work_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_type TEXT NOT NULL,
      time_period TEXT NOT NULL,
      pattern_data TEXT NOT NULL,
      analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      confidence_score REAL DEFAULT 0.8
    )
  `;

  // 创建背景知识库表
  const createKnowledgeBaseTable = `
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      keywords TEXT,
      priority INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建用户行为事件表
  const createBehaviorEventsTable = `
    CREATE TABLE IF NOT EXISTS user_behavior_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL,
      context TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      session_id TEXT NOT NULL,
      duration_ms INTEGER
    )
  `;

  // 创建行为模式表
  const createBehaviorPatternsTable = `
    CREATE TABLE IF NOT EXISTS behavior_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_type TEXT NOT NULL,
      pattern_name TEXT NOT NULL,
      pattern_data TEXT NOT NULL,
      discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      strength REAL DEFAULT 0.5,
      is_active BOOLEAN DEFAULT 1
    )
  `;

  // 创建认知画像表
  const createCognitiveProfilesTable = `
    CREATE TABLE IF NOT EXISTS cognitive_profiles (
      user_id TEXT PRIMARY KEY,
      profile_data TEXT NOT NULL,
      confidence_score REAL DEFAULT 0.5,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建推荐历史表
  const createRecommendationsTable = `
    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT,
      confidence REAL NOT NULL,
      relevance_score REAL NOT NULL,
      timing_score REAL NOT NULL,
      reasoning TEXT NOT NULL,
      expected_value REAL DEFAULT 0.5,
      effort_required TEXT DEFAULT 'medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      user_feedback TEXT,
      is_active BOOLEAN DEFAULT 1
    )
  `;

  // 创建知识关联表
  const createKnowledgeRelationshipsTable = `
    CREATE TABLE IF NOT EXISTS knowledge_relationships (
      id TEXT PRIMARY KEY,
      source_entry_id INTEGER NOT NULL,
      target_entry_id INTEGER NOT NULL,
      relationship_type TEXT NOT NULL,
      strength REAL NOT NULL,
      confidence REAL NOT NULL,
      discovered_by TEXT NOT NULL,
      evidence TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_validated DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (source_entry_id) REFERENCES entries (id),
      FOREIGN KEY (target_entry_id) REFERENCES entries (id)
    )
  `;

  // 创建用户会话表
  const createUserSessionsTable = `
    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id TEXT PRIMARY KEY,
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      duration_ms INTEGER,
      event_count INTEGER DEFAULT 0,
      page_views INTEGER DEFAULT 0,
      interactions INTEGER DEFAULT 0,
      focus_time_ms INTEGER DEFAULT 0,
      idle_time_ms INTEGER DEFAULT 0,
      productivity_score REAL,
      session_quality TEXT DEFAULT 'medium',
      key_achievements TEXT
    )
  `;

  // 创建搜索历史表
  const createSearchHistoryTable = `
    CREATE TABLE IF NOT EXISTS search_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      query TEXT NOT NULL,
      search_options TEXT,
      result_count INTEGER DEFAULT 0,
      search_time_ms INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN DEFAULT 0
    )
  `;

  // 创建todos表
  const createTodosTable = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      project_tag TEXT,
      weekday TEXT CHECK(weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建AI模型配置表
  const createAIConfigTable = `
    CREATE TABLE IF NOT EXISTS ai_model_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      function_name TEXT NOT NULL UNIQUE,
      model_name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建对话表
  const createConversationsTable = `
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      model_name TEXT NOT NULL,
      system_prompt TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建消息表
  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      role TEXT CHECK(role IN ('system','user','assistant')) NOT NULL,
      content TEXT NOT NULL,
      tokens_used INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `;

  // 创建标签表
  const createTagsTable = `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建对话标签关联表
  const createConversationTagsTable = `
    CREATE TABLE IF NOT EXISTS conversation_tags (
      conversation_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (conversation_id, tag_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `;

  // 创建提示模板表
  const createPromptTemplatesTable = `
    CREATE TABLE IF NOT EXISTS prompt_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      description TEXT,
      is_favorite BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 创建会话文件夹表
  const createConversationFoldersTable = `
    CREATE TABLE IF NOT EXISTS conversation_folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color VARCHAR(7) DEFAULT '#3B82F6',
      icon VARCHAR(50) DEFAULT 'folder',
      position INTEGER DEFAULT 0,
      parent_id INTEGER REFERENCES conversation_folders(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 添加folder_id字段到conversations表（如果不存在）
  const addConversationFolderColumn = `
    ALTER TABLE conversations ADD COLUMN folder_id INTEGER REFERENCES conversation_folders(id)
  `;
  
  // 添加sort_order字段到todos表（如果不存在）
  const addTodoSortOrderColumn = `
    ALTER TABLE todos ADD COLUMN sort_order INTEGER DEFAULT 0
  `;
  
  // 添加weekday字段到todos表（如果不存在）
  const addTodoWeekdayColumn = `
    ALTER TABLE todos ADD COLUMN weekday TEXT CHECK(weekday IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'))
  `;

  // 创建索引以提高查询性能
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_entries_project ON entries(project_tag)',

    'CREATE INDEX IF NOT EXISTS idx_entries_sort_order ON entries(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_insights_type ON ai_insights(insight_type)',
    'CREATE INDEX IF NOT EXISTS idx_insights_created_at ON ai_insights(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_patterns_type ON work_patterns(pattern_type)',
    'CREATE INDEX IF NOT EXISTS idx_patterns_date ON work_patterns(analysis_date)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_base(document_type)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_active ON knowledge_base(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_priority ON knowledge_base(priority)',
    // 新增行为追踪相关索引
    'CREATE INDEX IF NOT EXISTS idx_behavior_events_type ON user_behavior_events(event_type)',
    'CREATE INDEX IF NOT EXISTS idx_behavior_events_timestamp ON user_behavior_events(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_behavior_events_session ON user_behavior_events(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_behavior_patterns_type ON behavior_patterns(pattern_type)',
    'CREATE INDEX IF NOT EXISTS idx_behavior_patterns_active ON behavior_patterns(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type)',
    'CREATE INDEX IF NOT EXISTS idx_recommendations_created ON recommendations(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_recommendations_active ON recommendations(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_source ON knowledge_relationships(source_entry_id)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_target ON knowledge_relationships(target_entry_id)',
    'CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_type ON knowledge_relationships(relationship_type)',
    'CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(start_time)',
    // 搜索历史索引
    'CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query)',
    'CREATE INDEX IF NOT EXISTS idx_search_history_favorite ON search_history(is_favorite)',
    // todos表索引
    'CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status)',
    'CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority)',
    'CREATE INDEX IF NOT EXISTS idx_todos_sort_order ON todos(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_todos_weekday ON todos(weekday)',
    // 对话与模板相关索引
    'CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)',
    'CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at)',
    'CREATE INDEX IF NOT EXISTS idx_conversations_folder_id ON conversations(folder_id)',
    'CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)',
    'CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag_id ON conversation_tags(tag_id)',
    // 文件夹相关索引
    'CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON conversation_folders(parent_id)',
    'CREATE INDEX IF NOT EXISTS idx_folders_position ON conversation_folders(position)'
  ];

  try {
    db.exec(createEntriesTable);
    
    // 尝试添加attribute_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addAttributeColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加urgency_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addUrgencyColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加effort_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addEffortColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加sort_order字段（如果表已存在但字段不存在）
    try {
      db.exec(addSortOrderColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加daily_report_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addDailyReportColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加resource_consumption_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addResourceConsumptionColumn);
    } catch {
      // 字段已存在，忽略错误
    }

    // 尝试添加resource_tag字段（如果表已存在但字段不存在）
    try {
      db.exec(addResourceTagColumn);
    } catch {
      // 字段已存在，忽略错误
    }




    
    db.exec(createInsightsTable);
    db.exec(createWorkPatternsTable);
    db.exec(createKnowledgeBaseTable);
    db.exec(createBehaviorEventsTable);
    db.exec(createBehaviorPatternsTable);
    db.exec(createCognitiveProfilesTable);
    db.exec(createRecommendationsTable);
    db.exec(createKnowledgeRelationshipsTable);
    db.exec(createUserSessionsTable);
    db.exec(createSearchHistoryTable);
    db.exec(createTodosTable);
    db.exec(createAIConfigTable);
    db.exec(createConversationsTable);
    db.exec(createMessagesTable);
    db.exec(createTagsTable);
    db.exec(createConversationTagsTable);
    db.exec(createPromptTemplatesTable);
    db.exec(createConversationFoldersTable);
    
    // 尝试添加sort_order字段到todos表（如果表已存在但字段不存在）
    try {
      db.exec(addTodoSortOrderColumn);
    } catch {
      // 字段已存在，忽略错误
    }
    
    // 尝试添加weekday字段到todos表（如果表已存在但字段不存在）
    try {
      db.exec(addTodoWeekdayColumn);
    } catch {
      // 字段已存在，忽略错误
    }
    
    // 尝试添加folder_id字段到conversations表（如果表已存在但字段不存在）
    try {
      db.exec(addConversationFolderColumn);
    } catch {
      // 字段已存在，忽略错误
    }
    
    // 初始化默认AI模型配置
    initDefaultAIConfig();
    
    // 初始化默认提示模板
    initDefaultPromptTemplates();
    
    createIndexes.forEach(index => db.exec(index));
    debug.log('✅ 数据库初始化完成（包含AI功能、知识库、行为追踪表、对话与模板管理功能）');
  } catch (error) {
    debug.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

// 数据库操作接口
export interface Entry {
  id: number;
  content: string;
  project_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  resource_tag?: string;

  effort_tag?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 创建新记录
export function createEntry(entry: Omit<Entry, 'id' | 'created_at' | 'updated_at' | 'sort_order'>): Entry {
  // 获取当前最大的sort_order值，新记录放在最前面
  const maxOrderStmt = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM entries');
  const maxOrder = (maxOrderStmt.get() as { maxOrder: number }).maxOrder;
  
  const stmt = db.prepare(`
    INSERT INTO entries (content, project_tag, attribute_tag, urgency_tag, daily_report_tag, resource_tag, effort_tag, sort_order)
    VALUES (@content, @project_tag, @attribute_tag, @urgency_tag, @daily_report_tag, @resource_tag, @effort_tag, @sort_order)
  `);
  
  const result = stmt.run({
    ...entry,
    sort_order: maxOrder + 1
  });
  return getEntryById(result.lastInsertRowid as number);
}

// 获取所有记录
export function getAllEntries(limit = 100): Entry[] {
  const stmt = db.prepare(`
    SELECT * FROM entries 
    ORDER BY sort_order DESC, created_at DESC 
    LIMIT @limit
  `);
  return stmt.all({ limit }) as Entry[];
}

// 根据ID获取记录
export function getEntryById(id: number): Entry {
  const stmt = db.prepare('SELECT * FROM entries WHERE id = @id');
  return stmt.get({ id }) as Entry;
}

// 更新记录
export function updateEntry(id: number, entry: Partial<Entry>): Entry {
  const fields = Object.keys(entry).filter(key => key !== 'id');
  const setClause = fields.map(field => `${field} = @${field}`).join(', ');
  
  const stmt = db.prepare(`
    UPDATE entries 
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  
  stmt.run({ ...entry, id });
  return getEntryById(id);
}

// 批量更新记录排序
export function updateEntriesOrder(orderUpdates: Array<{ id: number; sort_order: number }>): void {
  const stmt = db.prepare(`
    UPDATE entries 
    SET sort_order = @sort_order
    WHERE id = @id
  `);
  
  // 使用事务确保数据一致性
  const updateOrder = db.transaction((updates: Array<{ id: number; sort_order: number }>) => {
    for (const update of updates) {
      stmt.run(update);
    }
  });
  
  updateOrder(orderUpdates);
}

// 删除记录
export function deleteEntry(id: number): void {
  const stmt = db.prepare('DELETE FROM entries WHERE id = @id');
  stmt.run({ id });
}

// 获取周报数据（最近7天的记录）
export function getWeeklyReportData(): {
  entries: Entry[];
  stats: {
    total: number;
    projects: Array<{project: string, count: number}>;

    timeRange: {start: string, end: string};
  }
} {
  // 获取最近7天的记录
  const entriesStmt = db.prepare(`
    SELECT * FROM entries 
    WHERE created_at >= date('now', '-7 days')
    ORDER BY created_at DESC
  `);
  const entries = entriesStmt.all() as Entry[];

  // 计算项目分布
  const projectsStmt = db.prepare(`
    SELECT project_tag as project, COUNT(*) as count 
    FROM entries 
    WHERE created_at >= date('now', '-7 days') AND project_tag IS NOT NULL
    GROUP BY project_tag
    ORDER BY count DESC
  `);
  const projects = projectsStmt.all() as Array<{project: string, count: number}>;



  // 获取时间范围
  const timeRangeStmt = db.prepare(`
    SELECT 
      MIN(created_at) as start,
      MAX(created_at) as end
    FROM entries 
    WHERE created_at >= date('now', '-7 days')
  `);
  const timeRange = timeRangeStmt.get() as {start: string, end: string} || {start: '', end: ''};

  return {
    entries,
    stats: {
      total: entries.length,
      projects,
  
      timeRange
    }
  };
}

// 搜索记录
export function searchEntries(query: string, limit = 50): Entry[] {
  const stmt = db.prepare(`
    SELECT * FROM entries 
    WHERE content LIKE @query 
       OR project_tag LIKE @query 
       OR attribute_tag LIKE @query
    ORDER BY created_at DESC 
    LIMIT @limit
  `);
  return stmt.all({ query: `%${query}%`, limit }) as Entry[];
}

// 获取今日记录
export function getTodayEntries(): Entry[] {
  const stmt = db.prepare(`
    SELECT * FROM entries 
    WHERE DATE(created_at) = DATE('now')
    ORDER BY created_at DESC
  `);
  return stmt.all() as Entry[];
}

// 获取最近7天的记录
export function getRecentEntries(days = 7): Entry[] {
  const stmt = db.prepare(`
    SELECT * FROM entries 
    WHERE created_at >= datetime('now', '-@days days')
    ORDER BY created_at DESC
  `);
  return stmt.all({ days }) as Entry[];
}

// 按项目分组统计
export function getProjectStats() {
  const stmt = db.prepare(`
    SELECT project_tag, COUNT(*) as count
    FROM entries 
    WHERE project_tag IS NOT NULL
    GROUP BY project_tag
    ORDER BY count DESC
  `);
  return stmt.all();
}

// 按人物分组统计


// 数据库健康检查
export function checkDatabaseHealth() {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM entries');
    const result = stmt.get() as { count: number };
    return { healthy: true, entryCount: result.count };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
}

// 关闭数据库连接
export function closeDatabase() {
  db.close();
}

// =============背景知识库操作=============

// 创建知识文档
export function createKnowledgeDocument(data: {
  document_type: string;
  title: string;
  content: string;
  summary?: string;
  keywords?: string;
  priority?: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO knowledge_base (document_type, title, content, summary, keywords, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.document_type,
    data.title,
    data.content,
    data.summary || null,
    data.keywords || null,
    data.priority || 1
  );
  
  // 返回创建的文档
  const selectStmt = db.prepare('SELECT * FROM knowledge_base WHERE id = ?');
  return selectStmt.get(result.lastInsertRowid);
}

// 获取所有活跃的知识文档
export function getAllKnowledgeDocuments() {
  const stmt = db.prepare(`
    SELECT * FROM knowledge_base 
    WHERE is_active = 1 
    ORDER BY priority DESC, created_at DESC
  `);
  return stmt.all();
}

// 按类型获取知识文档
export function getKnowledgeDocumentsByType(documentType: string) {
  const stmt = db.prepare(`
    SELECT * FROM knowledge_base 
    WHERE document_type = ? AND is_active = 1 
    ORDER BY priority DESC, created_at DESC
  `);
  return stmt.all(documentType);
}

// 获取单个知识文档
export function getKnowledgeDocument(id: number) {
  const stmt = db.prepare('SELECT * FROM knowledge_base WHERE id = ?');
  return stmt.get(id);
}

// 更新知识文档
export function updateKnowledgeDocument(id: number, data: {
  title?: string;
  content?: string;
  summary?: string;
  keywords?: string;
  priority?: number;
  is_active?: boolean;
}) {
  const updates = [];
  const values = [];
  
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.content !== undefined) {
    updates.push('content = ?');
    values.push(data.content);
  }
  if (data.summary !== undefined) {
    updates.push('summary = ?');
    values.push(data.summary);
  }
  if (data.keywords !== undefined) {
    updates.push('keywords = ?');
    values.push(data.keywords);
  }
  if (data.priority !== undefined) {
    updates.push('priority = ?');
    values.push(data.priority);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE knowledge_base 
    SET ${updates.join(', ')} 
    WHERE id = ?
  `);
  
  stmt.run(...values);
  
  // 返回更新后的文档
  return getKnowledgeDocument(id);
}

// 删除知识文档（软删除）
export function deleteKnowledgeDocument(id: number) {
  const stmt = db.prepare('UPDATE knowledge_base SET is_active = 0 WHERE id = ?');
  stmt.run(id);
}

// 永久删除知识文档
export function permanentDeleteKnowledgeDocument(id: number) {
  const stmt = db.prepare('DELETE FROM knowledge_base WHERE id = ?');
  stmt.run(id);
}

// 获取知识库统计信息
export function getKnowledgeStats() {
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM knowledge_base WHERE is_active = 1');
  const typeStmt = db.prepare(`
    SELECT document_type, COUNT(*) as count 
    FROM knowledge_base 
    WHERE is_active = 1 
    GROUP BY document_type 
    ORDER BY count DESC
  `);
  
  const total = (totalStmt.get() as { count: number }).count;
  const byType = typeStmt.all();
  
  return { total, byType };
}

// =============数据导出功能=============

export interface ExportData {
  metadata: {
    exportDate: string;
    version: string;
    totalRecords: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
  entries: Entry[];
  knowledgeBase?: Array<{
    id: number;
    document_type: string;
    title: string;
    content: string;
    summary?: string;
    keywords?: string;
    priority: number;
    created_at: string;
    updated_at: string;
  }>;
  statistics: {
    projectStats: Array<{project_tag: string; count: number}>;

  };
}

// 获取完整的导出数据
export function getExportData(includeKnowledgeBase = true): ExportData {
  // 获取所有记录
  const entries = db.prepare('SELECT * FROM entries ORDER BY created_at DESC').all() as Entry[];
  
  // 获取知识库数据
  let knowledgeBase: Array<{
    id: number;
    document_type: string;
    title: string;
    content: string;
    summary?: string;
    keywords?: string;
    priority: number;
    created_at: string;
    updated_at: string;
  }> | undefined;
  
  if (includeKnowledgeBase) {
    knowledgeBase = db.prepare(`
      SELECT id, document_type, title, content, summary, keywords, priority, created_at, updated_at
      FROM knowledge_base 
      WHERE is_active = 1 
      ORDER BY priority DESC, created_at DESC
    `).all() as Array<{
      id: number;
      document_type: string;
      title: string;
      content: string;
      summary?: string;
      keywords?: string;
      priority: number;
      created_at: string;
      updated_at: string;
    }>;
  }
  
  // 获取统计数据
  const projectStats = getProjectStats();

  
  // 获取日期范围
  const dateRange = db.prepare(`
    SELECT 
      MIN(created_at) as earliest,
      MAX(created_at) as latest
    FROM entries
  `).get() as { earliest: string; latest: string } || { earliest: '', latest: '' };
  
  return {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '2.2',
      totalRecords: entries.length,
      dateRange
    },
    entries,
    knowledgeBase,
    statistics: {
      projectStats: projectStats as Array<{project_tag: string; count: number}>,

    }
  };
}

// 生成JSON格式导出
export function exportToJSON(includeKnowledgeBase = true): string {
  const data = getExportData(includeKnowledgeBase);
  return JSON.stringify(data, null, 2);
}

// 生成CSV格式导出（仅记录数据）
export function exportToCSV(): string {
  const entries = getAllEntries(10000); // 获取大量数据
  
  // CSV标题行
  const headers = [
    'ID',
    '内容',
    '项目标签',

    '属性标签',
    '紧急程度',
    '工作量',
    '创建时间',
    '更新时间'
  ];
  
  // 转换数据行
  const rows = entries.map(entry => [
    entry.id,
    `"${(entry.content || '').replace(/"/g, '""')}"`, // 处理CSV中的引号
    entry.project_tag || '',

    entry.attribute_tag || '',
    entry.urgency_tag || '',
    entry.effort_tag || '',
    entry.created_at,
    entry.updated_at
  ]);
  
  // 组合CSV内容
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csvContent;
}



// =============数据完整性验证=============

export interface DataIntegrityReport {
  isValid: boolean;
  totalChecks: number;
  passedChecks: number;
  errors: string[];
  warnings: string[];
  details: {
    entries: {
      total: number;
      withContent: number;
      withTimestamps: number;

    };
    knowledgeBase: {
      total: number;
      active: number;
      withContent: number;
    };
    database: {
      tablesExist: boolean;
      indexesExist: boolean;
      foreignKeysValid: boolean;
    };
  };
}

// 数据完整性验证
export function validateDataIntegrity(): DataIntegrityReport {
  const report: DataIntegrityReport = {
    isValid: true,
    totalChecks: 0,
    passedChecks: 0,
    errors: [],
    warnings: [],
    details: {
      entries: {
        total: 0,
        withContent: 0,
        withTimestamps: 0
      },
      knowledgeBase: {
        total: 0,
        active: 0,
        withContent: 0
      },
      database: {
        tablesExist: false,
        indexesExist: false,
        foreignKeysValid: false
      }
    }
  };

  try {
    // 检查1: 验证核心表是否存在
    report.totalChecks++;
    try {
      const tableCheck = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('entries', 'knowledge_base', 'ai_insights')
      `).all();
      
      if (tableCheck.length >= 2) { // 至少entries和knowledge_base表
        report.passedChecks++;
        report.details.database.tablesExist = true;
      } else {
        report.errors.push('缺少核心数据表');
        report.isValid = false;
      }
    } catch (error) {
      report.errors.push(`数据表检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
      report.isValid = false;
    }

    // 检查2: 验证entries表数据完整性
    report.totalChecks++;
    try {
      const entries = db.prepare('SELECT * FROM entries').all() as Entry[];
      report.details.entries.total = entries.length;
      
      // 检查内容完整性
      const entriesWithContent = entries.filter(e => e.content && e.content.trim().length > 0);
      report.details.entries.withContent = entriesWithContent.length;
      
      // 检查时间戳完整性
      const entriesWithTimestamps = entries.filter(e => e.created_at && e.updated_at);
      report.details.entries.withTimestamps = entriesWithTimestamps.length;
      

      
      if (entries.length === 0) {
        report.warnings.push('数据库中没有任何记录');
      } else if (entriesWithContent.length === entries.length && 
                 entriesWithTimestamps.length === entries.length) {
        report.passedChecks++;
      } else {
        const issues = [];
        if (entriesWithContent.length < entries.length) {
          issues.push(`${entries.length - entriesWithContent.length}条记录缺少内容`);
        }
        if (entriesWithTimestamps.length < entries.length) {
          issues.push(`${entries.length - entriesWithTimestamps.length}条记录缺少时间戳`);
        }

        report.warnings.push(`记录数据完整性问题: ${issues.join(', ')}`);
        report.passedChecks++; // 警告不影响整体验证通过
      }
    } catch (error) {
      report.errors.push(`记录数据检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
      report.isValid = false;
    }

    // 检查3: 验证知识库数据完整性
    report.totalChecks++;
    try {
      const knowledgeDocs = db.prepare('SELECT * FROM knowledge_base').all() as Array<Record<string, unknown>>;
      report.details.knowledgeBase.total = knowledgeDocs.length;
      
      const activeDocs = knowledgeDocs.filter(doc => doc.is_active);
      report.details.knowledgeBase.active = activeDocs.length;
      
      const docsWithContent = knowledgeDocs.filter(doc => 
        doc.content && typeof doc.content === 'string' && doc.content.trim().length > 0
      );
      report.details.knowledgeBase.withContent = docsWithContent.length;
      
      if (knowledgeDocs.length === 0) {
        report.warnings.push('知识库中没有任何文档');
        report.passedChecks++;
      } else if (docsWithContent.length === knowledgeDocs.length) {
        report.passedChecks++;
      } else {
        report.warnings.push(`${knowledgeDocs.length - docsWithContent.length}个知识文档缺少内容`);
        report.passedChecks++; // 警告不影响整体验证通过
      }
    } catch (error) {
      report.errors.push(`知识库数据检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
      report.isValid = false;
    }

    // 检查4: 验证数据库索引
    report.totalChecks++;
    try {
      const indexes = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name LIKE 'idx_%'
      `).all();
      
      if (indexes.length >= 3) { // 至少有几个核心索引
        report.details.database.indexesExist = true;
        report.passedChecks++;
      } else {
        report.warnings.push('数据库索引不完整，可能影响查询性能');
        report.passedChecks++; // 索引问题不影响数据完整性
      }
    } catch (error) {
      report.warnings.push(`索引检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
      report.passedChecks++; // 不影响整体验证
    }

    // 检查5: 验证数据一致性
    report.totalChecks++;
    try {
      // 检查是否有孤立的数据或重复数据
      const duplicateCheck = db.prepare(`
        SELECT content, COUNT(*) as count 
        FROM entries 
        GROUP BY content 
        HAVING COUNT(*) > 1
      `).all();
      
      if (duplicateCheck.length > 0) {
        report.warnings.push(`发现${duplicateCheck.length}组重复记录`);
      }
      
      report.passedChecks++;
    } catch (error) {
      report.warnings.push(`数据一致性检查失败: ${error instanceof Error ? error.message : '未知错误'}`);
      report.passedChecks++; // 不影响整体验证
    }

  } catch (error) {
    report.errors.push(`完整性验证过程失败: ${error instanceof Error ? error.message : '未知错误'}`);
    report.isValid = false;
  }

  return report;
}

// 快速数据健康检查
export function quickHealthCheck(): {
  healthy: boolean;
  entryCount: number;
  knowledgeCount: number;
} {
  try {
    const entryCount = (db.prepare('SELECT COUNT(*) as count FROM entries').get() as { count: number }).count;
    const knowledgeCount = (db.prepare('SELECT COUNT(*) as count FROM knowledge_base WHERE is_active = 1').get() as { count: number }).count;
    
    return {
      healthy: true,
      entryCount,
      knowledgeCount
    };
  } catch {
    return {
      healthy: false,
      entryCount: 0,
      knowledgeCount: 0
    };
  }
}

// =============搜索历史管理=============

export interface SearchHistoryItem {
  id: number;
  query: string;
  search_options?: string;
  result_count: number;
  search_time_ms: number;
  created_at: string;
  is_favorite: boolean;
}

// 保存搜索历史
export function saveSearchHistory(
  query: string, 
  searchOptions: Record<string, unknown>, 
  resultCount: number, 
  searchTimeMs: number
): SearchHistoryItem {
  const stmt = db.prepare(`
    INSERT INTO search_history (query, search_options, result_count, search_time_ms)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    query,
    JSON.stringify(searchOptions),
    resultCount,
    searchTimeMs
  );
  
  return {
    id: result.lastInsertRowid as number,
    query,
    search_options: JSON.stringify(searchOptions),
    result_count: resultCount,
    search_time_ms: searchTimeMs,
    created_at: new Date().toISOString(),
    is_favorite: false
  };
}

// 获取搜索历史（最近的20条）
export function getSearchHistory(limit = 20): SearchHistoryItem[] {
  const stmt = db.prepare(`
    SELECT * FROM search_history 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  
  return stmt.all(limit) as SearchHistoryItem[];
}

// 获取热门搜索（按搜索频率）
export function getPopularSearches(limit = 10): Array<{ query: string; count: number; last_search: string }> {
  const stmt = db.prepare(`
    SELECT 
      query,
      COUNT(*) as count,
      MAX(created_at) as last_search
    FROM search_history 
    WHERE LENGTH(query) > 1
    GROUP BY query 
    ORDER BY count DESC, last_search DESC
    LIMIT ?
  `);
  
  return stmt.all(limit) as Array<{ query: string; count: number; last_search: string }>;
}

// 标记/取消标记收藏搜索
export function toggleFavoriteSearch(id: number): boolean {
  const stmt = db.prepare(`
    UPDATE search_history 
    SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
    WHERE id = ?
  `);
  
  const result = stmt.run(id);
  return result.changes > 0;
}

// 获取收藏的搜索
export function getFavoriteSearches(): SearchHistoryItem[] {
  const stmt = db.prepare(`
    SELECT * FROM search_history 
    WHERE is_favorite = 1
    ORDER BY created_at DESC
  `);
  
  return stmt.all() as SearchHistoryItem[];
}

// 删除搜索历史记录
export function deleteSearchHistory(id: number): boolean {
  const stmt = db.prepare('DELETE FROM search_history WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// 清空所有搜索历史（保留收藏的）
export function clearSearchHistory(): number {
  const stmt = db.prepare('DELETE FROM search_history WHERE is_favorite = 0');
  const result = stmt.run();
  return result.changes;
}

// =============AI模型配置管理=============

export interface AIModelConfig {
  id: number;
  function_name: string;
  model_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// 可用的AI模型列表 - 从 models.ts 文件导入以避免数据库依赖
// 重新导出以保持向后兼容
export { AVAILABLE_MODELS } from './models';

// AI功能列表及其默认模型
export const AI_FUNCTIONS = [
  { name: 'polish_text', label: '文本润色', defaultModel: 'moonshotai/kimi-k2', description: '优化语音转文字内容，去除口癖词汇' },
  { name: 'generate_questions', label: 'AI犀利提问', defaultModel: 'moonshotai/kimi-k2', description: '基于内容生成深度思考问题' },
  { name: 'find_similar', label: '相似内容查找', defaultModel: 'anthropic/claude-3-haiku', description: '使用AI分析内容相似度' },
  { name: 'weekly_report', label: '智能周报', defaultModel: 'moonshotai/kimi-k2', description: '生成智能工作周报' },
  { name: 'minimalist_analysis', label: '极简增长分析', defaultModel: 'moonshotai/kimi-k2', description: '基于极简增长理论的深度分析' },
  { name: 'agent_chat', label: '对话聊天', defaultModel: 'moonshotai/kimi-k2', description: '通用中文对话模型' }
];

// 初始化默认AI模型配置
export function initDefaultAIConfig(): void {
  try {
    for (const func of AI_FUNCTIONS) {
      // 检查是否已经存在配置
      const existingConfig = db.prepare('SELECT * FROM ai_model_config WHERE function_name = ?').get(func.name);
      
      if (!existingConfig) {
        // 插入默认配置
        const stmt = db.prepare(`
          INSERT INTO ai_model_config (function_name, model_name, description)
          VALUES (?, ?, ?)
        `);
        
        stmt.run(func.name, func.defaultModel, func.description);
      }
    }
  } catch (error) {
    debug.error('初始化AI模型配置失败:', error);
  }
}

// 获取所有AI模型配置
export function getAllAIModelConfigs(): AIModelConfig[] {
  const stmt = db.prepare('SELECT * FROM ai_model_config ORDER BY function_name');
  return stmt.all() as AIModelConfig[];
}

// 获取特定功能的模型配置
export function getAIModelConfig(functionName: string): string {
  const stmt = db.prepare('SELECT model_name FROM ai_model_config WHERE function_name = ?');
  const result = stmt.get(functionName) as { model_name: string } | undefined;
  
  // 如果没有找到配置，返回默认模型
  if (!result) {
    const defaultFunc = AI_FUNCTIONS.find(f => f.name === functionName);
    return defaultFunc?.defaultModel || 'moonshotai/kimi-k2';
  }
  
  return result.model_name;
}

// 更新AI模型配置
export function updateAIModelConfig(functionName: string, modelName: string): boolean {
  const stmt = db.prepare(`
    UPDATE ai_model_config 
    SET model_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE function_name = ?
  `);
  
  const result = stmt.run(modelName, functionName);
  return result.changes > 0;
}

// 批量更新AI模型配置
export function updateMultipleAIModelConfigs(configs: Array<{ functionName: string; modelName: string }>): boolean {
  const stmt = db.prepare(`
    UPDATE ai_model_config 
    SET model_name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE function_name = ?
  `);
  
  try {
    db.transaction(() => {
      for (const config of configs) {
        stmt.run(config.modelName, config.functionName);
      }
    })();
    return true;
  } catch (error) {
    debug.error('批量更新AI模型配置失败:', error);
    return false;
  }
}

// ================================
// Todo相关数据库操作函数
// ================================

import type { Todo, CreateTodo, TodoStats } from '@/types/index';
import { debug } from '@/lib/debug';

// 创建新的Todo
export function createTodo(todo: CreateTodo): Todo {
  // 获取当前最大的sort_order值，新Todo放在最前面
  const maxOrderStmt = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as maxOrder FROM todos');
  const maxOrder = (maxOrderStmt.get() as { maxOrder: number }).maxOrder;
  
  const stmt = db.prepare(`
    INSERT INTO todos (title, description, priority, project_tag, weekday, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    todo.title,
    todo.description || null,
    todo.priority || 'medium',
    todo.project_tag || null,
    todo.weekday || null,
    maxOrder + 1
  );
  
  const createdTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid) as Todo;
  return createdTodo;
}

// 获取所有Todo
export function getAllTodos(): Todo[] {
  const stmt = db.prepare(`
    SELECT * FROM todos 
    ORDER BY 
      sort_order DESC,
      CASE status 
        WHEN 'in_progress' THEN 1 
        WHEN 'pending' THEN 2 
        WHEN 'completed' THEN 3 
      END,
      CASE priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END
  `);
  
  return stmt.all() as Todo[];
}



// 根据ID获取单个Todo
export function getTodoById(id: number): Todo | null {
  const stmt = db.prepare('SELECT * FROM todos WHERE id = ?');
  return stmt.get(id) as Todo | null;
}

// 更新Todo
export function updateTodo(id: number, updates: Partial<Todo>): Todo {
  const fields = [];
  const values = [];
  
  // 构建动态更新查询
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE todos 
    SET ${fields.join(', ')} 
    WHERE id = ?
  `);
  
  stmt.run(...values);
  
  return getTodoById(id)!;
}

// 更新Todo状态
export function updateTodoStatus(id: number, status: Todo['status']): Todo {
  const stmt = db.prepare(`
    UPDATE todos 
    SET status = ?
    WHERE id = ?
  `);
  
  stmt.run(status, id);
  return getTodoById(id)!;
}

// 删除Todo
export function deleteTodo(id: number): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}







// 获取Todo统计信息
export function getTodoStats(): TodoStats {
  // 获取基础统计
  const basicStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
    FROM todos
  `).get() as { total: number; completed: number; in_progress: number; pending: number };
  
  // 获取优先级分布
  const priorityStats = db.prepare(`
    SELECT 
      SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as low
    FROM todos
  `).get() as { high: number; medium: number; low: number };
  
  const completion_rate = basicStats.total > 0 ? (basicStats.completed / basicStats.total) * 100 : 0;
  
  return {
    total: basicStats.total,
    completed: basicStats.completed,
    in_progress: basicStats.in_progress,
    pending: basicStats.pending,
    completion_rate,
    by_priority: {
      high: priorityStats.high,
      medium: priorityStats.medium,
      low: priorityStats.low
    }
  };
}

// 批量更新Todos的排序顺序
export function updateTodosOrder(updates: Array<{ id: number; sort_order: number; }>): boolean {
  const updateStmt = db.prepare('UPDATE todos SET sort_order = ? WHERE id = ?');
  
  try {
    db.transaction(() => {
      for (const update of updates) {
        updateStmt.run(update.sort_order, update.id);
      }
    })();
    return true;
  } catch (error) {
    debug.error('批量更新Todo排序失败:', error);
    return false;
  }
}

// ================================
// 对话管理 CRUD 操作
// ================================

export interface Conversation {
  id: number;
  title: string;
  model_name: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationData {
  title: string;
  model_name: string;
  system_prompt?: string;
}

// 创建对话
export function createConversation(data: CreateConversationData): Conversation {
  const stmt = db.prepare(`
    INSERT INTO conversations (title, model_name, system_prompt)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(
    data.title,
    data.model_name,
    data.system_prompt || null
  );
  
  return getConversationById(result.lastInsertRowid as number);
}

// 根据ID获取对话
export function getConversationById(id: number): Conversation {
  const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
  return stmt.get(id) as Conversation;
}

// 获取对话列表（包含标签信息）
export function listConversations(params?: {
  keyword?: string;
  tagId?: number; // 兼容旧的单个标签ID
  tagIds?: number[]; // 支持多个标签ID
  folderId?: number; // 文件夹过滤
  limit?: number;
  offset?: number;
}): (Conversation & { tags?: Tag[] })[] {
  let query = `
    SELECT DISTINCT c.* FROM conversations c
  `;
  
  const conditions: string[] = [];
  const values: unknown[] = [];
  
  // 如果需要按标签筛选
  if (params?.tagId) {
    // 兼容旧的单个标签ID
    query += ` 
      LEFT JOIN conversation_tags ct ON c.id = ct.conversation_id
    `;
    conditions.push('ct.tag_id = ?');
    values.push(params.tagId);
  } else if (params?.tagIds && params.tagIds.length > 0) {
    // 支持多个标签ID筛选
    query += ` 
      LEFT JOIN conversation_tags ct ON c.id = ct.conversation_id
    `;
    const placeholders = params.tagIds.map(() => '?').join(',');
    conditions.push(`ct.tag_id IN (${placeholders})`);
    params.tagIds.forEach(tagId => values.push(tagId));
  }
  
  // 文件夹过滤
  if (params?.folderId !== undefined) {
    if (params.folderId === null) {
      // null 表示"全部对话"，只显示未分配到文件夹的对话
      conditions.push('c.folder_id IS NULL');
    } else {
      // 显示指定文件夹中的对话
      conditions.push('c.folder_id = ?');
      values.push(params.folderId);
    }
  }
  
  // 关键词搜索
  if (params?.keyword) {
    conditions.push('(c.title LIKE ? OR c.system_prompt LIKE ?)');
    const keywordParam = `%${params.keyword}%`;
    values.push(keywordParam, keywordParam);
  }
  
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  query += ` ORDER BY c.updated_at DESC`;
  
  if (params?.limit) {
    query += ` LIMIT ?`;
    values.push(params.limit);
    
    if (params?.offset) {
      query += ` OFFSET ?`;
      values.push(params.offset);
    }
  }
  
  const stmt = db.prepare(query);
  const conversations = stmt.all(...values) as Conversation[];
  
  // 为每个会话加载标签信息
  const conversationsWithTags = conversations.map(conversation => {
    const tags = listTagsByConversation(conversation.id);
    return {
      ...conversation,
      tags
    };
  });
  
  return conversationsWithTags;
}

// 更新对话
export function updateConversation(id: number, updates: {
  title?: string;
  model_name?: string;
  system_prompt?: string;
}): Conversation {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  
  if (updates.model_name !== undefined) {
    fields.push('model_name = ?');
    values.push(updates.model_name);
  }
  
  if (updates.system_prompt !== undefined) {
    fields.push('system_prompt = ?');
    values.push(updates.system_prompt);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE conversations
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getConversationById(id);
}

// 删除对话
export function deleteConversation(id: number): boolean {
  const stmt = db.prepare('DELETE FROM conversations WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ================================
// 消息管理 CRUD 操作  
// ================================

export interface Message {
  id: number;
  conversation_id: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  created_at: string;
}

export interface CreateMessageData {
  conversation_id: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens_used?: number;
}

// 创建消息
export function createMessage(data: CreateMessageData): Message {
  const stmt = db.prepare(`
    INSERT INTO messages (conversation_id, role, content, tokens_used)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.conversation_id,
    data.role,
    data.content,
    data.tokens_used || null
  );
  
  // 更新对话的最后更新时间
  const updateConversationStmt = db.prepare(`
    UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  updateConversationStmt.run(data.conversation_id);
  
  const getMessage = db.prepare('SELECT * FROM messages WHERE id = ?');
  return getMessage.get(result.lastInsertRowid) as Message;
}

// 按对话获取消息列表
export function listMessagesByConversation(
  conversationId: number,
  limit?: number,
  offset?: number
): Message[] {
  let query = `
    SELECT * FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `;
  
  const values: unknown[] = [conversationId];
  
  if (limit !== undefined) {
    query += ` LIMIT ?`;
    values.push(limit);
    
    if (offset !== undefined) {
      query += ` OFFSET ?`;
      values.push(offset);
    }
  }
  
  const stmt = db.prepare(query);
  return stmt.all(...values) as Message[];
}

// 根据ID获取消息
export function getMessageById(id: number): Message | null {
  const stmt = db.prepare('SELECT * FROM messages WHERE id = ?');
  return stmt.get(id) as Message | null;
}

// 更新消息内容
export function updateMessage(id: number, updates: {
  content?: string;
  editReason?: string;
}): Message | null {
  // 先获取原消息
  const originalMessage = getMessageById(id);
  if (!originalMessage) {
    return null;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  
  // 添加更新时间
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE messages
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  const result = stmt.run(...values);
  
  if (result.changes > 0) {
    // 更新会话的更新时间
    const updateConversationStmt = db.prepare(`
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateConversationStmt.run(originalMessage.conversation_id);
    
    // 如果有编辑原因，保存到编辑历史（如果需要的话）
    if (updates.editReason && updates.content !== originalMessage.content) {
      try {
        // 创建编辑历史表（如果不存在）
        db.exec(`
          CREATE TABLE IF NOT EXISTS message_edit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER NOT NULL,
            original_content TEXT NOT NULL,
            edited_content TEXT NOT NULL,
            edited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            edit_reason TEXT,
            FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE
          )
        `);
        
        const historyStmt = db.prepare(`
          INSERT INTO message_edit_history (message_id, original_content, edited_content, edit_reason)
          VALUES (?, ?, ?, ?)
        `);
        
        historyStmt.run(id, originalMessage.content, updates.content, updates.editReason);
      } catch (error) {
        console.warn('保存编辑历史失败:', error);
      }
    }
    
    return getMessageById(id);
  }
  
  return null;
}

// 删除单条消息
export function deleteMessage(id: number): boolean {
  const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// 删除对话的所有消息
export function deleteMessagesByConversation(conversationId: number): boolean {
  const stmt = db.prepare('DELETE FROM messages WHERE conversation_id = ?');
  const result = stmt.run(conversationId);
  return result.changes > 0;
}

// ================================
// 提示模板管理 CRUD 操作
// ================================

export interface PromptTemplate {
  id: number;
  name: string;
  content: string;
  description?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptTemplateData {
  name: string;
  content: string;
  description?: string;
  is_favorite?: boolean;
}

// 创建提示模板
export function createPromptTemplate(data: CreatePromptTemplateData): PromptTemplate {
  const stmt = db.prepare(`
    INSERT INTO prompt_templates (name, content, description, is_favorite)
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name,
    data.content,
    data.description || null,
    data.is_favorite ? 1 : 0
  );
  
  return getPromptTemplateById(result.lastInsertRowid as number);
}

// 根据ID获取提示模板
export function getPromptTemplateById(id: number): PromptTemplate {
  const stmt = db.prepare('SELECT * FROM prompt_templates WHERE id = ?');
  const result = stmt.get(id) as PromptTemplate | undefined;
  if (result) {
    result.is_favorite = Boolean(result.is_favorite);
  }
  return result as PromptTemplate;
}

// 获取所有提示模板
export function listPromptTemplates(): PromptTemplate[] {
  const stmt = db.prepare(`
    SELECT * FROM prompt_templates
    ORDER BY is_favorite DESC, updated_at DESC
  `);
  
  const results = stmt.all() as PromptTemplate[];
  return results.map(result => ({
    ...result,
    is_favorite: Boolean(result.is_favorite)
  }));
}

// 更新提示模板
export function updatePromptTemplate(id: number, updates: {
  name?: string;
  content?: string;
  description?: string;
  is_favorite?: boolean;
}): PromptTemplate {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  
  if (updates.content !== undefined) {
    fields.push('content = ?');
    values.push(updates.content);
  }
  
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  
  if (updates.is_favorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(updates.is_favorite ? 1 : 0);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE prompt_templates
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getPromptTemplateById(id);
}

// 删除提示模板
export function deletePromptTemplate(id: number): boolean {
  const stmt = db.prepare('DELETE FROM prompt_templates WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

// ================================
// 标签管理 CRUD 操作
// ================================

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

// 创建标签
export function createTag(name: string): Tag {
  const stmt = db.prepare(`
    INSERT INTO tags (name)
    VALUES (?)
  `);
  
  const result = stmt.run(name);
  
  const getTag = db.prepare('SELECT * FROM tags WHERE id = ?');
  return getTag.get(result.lastInsertRowid) as Tag;
}

// 获取所有标签
export function listTags(): Tag[] {
  const stmt = db.prepare(`
    SELECT * FROM tags
    ORDER BY name ASC
  `);
  
  return stmt.all() as Tag[];
}

// 删除标签
export function deleteTag(id: number): boolean {
  // 使用事务先删除关联关系，再删除标签
  const deleteAssociations = db.prepare('DELETE FROM conversation_tags WHERE tag_id = ?');
  const deleteTagStmt = db.prepare('DELETE FROM tags WHERE id = ?');
  
  const transaction = db.transaction(() => {
    deleteAssociations.run(id);
    const result = deleteTagStmt.run(id);
    return result.changes > 0;
  });
  
  return transaction();
}

// 为对话添加标签
export function addTagToConversation(conversationId: number, tagId: number): boolean {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO conversation_tags (conversation_id, tag_id)
    VALUES (?, ?)
  `);
  
  const result = stmt.run(conversationId, tagId);
  return result.changes > 0;
}

// 从对话中移除标签
export function removeTagFromConversation(conversationId: number, tagId: number): boolean {
  const stmt = db.prepare(`
    DELETE FROM conversation_tags 
    WHERE conversation_id = ? AND tag_id = ?
  `);
  
  const result = stmt.run(conversationId, tagId);
  return result.changes > 0;
}

// 获取对话的所有标签
export function listTagsByConversation(conversationId: number): Tag[] {
  const stmt = db.prepare(`
    SELECT t.* FROM tags t
    INNER JOIN conversation_tags ct ON t.id = ct.tag_id
    WHERE ct.conversation_id = ?
    ORDER BY t.name ASC
  `);
  
  return stmt.all(conversationId) as Tag[];
}



// 计算会话时长
function calculateConversationDuration(messages: Message[]) {
  if (messages.length < 2) return 0;
  
  const firstMessage = new Date(messages[0].created_at);
  const lastMessage = new Date(messages[messages.length - 1].created_at);
  
  return Math.round((lastMessage.getTime() - firstMessage.getTime()) / 1000 / 60); // 分钟
}

// 分析会话流程
function analyzeConversationFlow(messages: Message[]) {
  const flow: Array<{
    turn: number;
    userMessage: {
      content: string;
      length: number;
      timestamp: string;
    };
    assistantResponse: {
      content: string;
      length: number;
      tokensUsed?: number;
      timestamp: string;
    } | null;
  }> = [];
  let currentTurn = 1;
  
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'user') {
      const flowItem = {
        turn: currentTurn,
        userMessage: {
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          length: msg.content.length,
          timestamp: msg.created_at
        },
        assistantResponse: null as {
          content: string;
          length: number;
          tokensUsed?: number;
          timestamp: string;
        } | null
      };
      
      // 查找对应的助手回复
      const nextMessage = messages[i + 1];
      if (nextMessage && nextMessage.role === 'assistant') {
        flowItem.assistantResponse = {
          content: nextMessage.content.substring(0, 100) + (nextMessage.content.length > 100 ? '...' : ''),
          length: nextMessage.content.length,
          tokensUsed: nextMessage.tokens_used,
          timestamp: nextMessage.created_at
        };
      }
      
      flow.push(flowItem);
      currentTurn++;
    }
  }
  
  return flow;
}

// ================================
// 默认提示模板初始化
// ================================

// 初始化默认提示模板
export function initDefaultPromptTemplates(): void {
  try {
    // 检查是否已经有模板了
    const existingTemplates = db.prepare('SELECT COUNT(*) as count FROM prompt_templates').get() as { count: number };
    
    if (existingTemplates.count > 0) {
      // 已经有模板了，不重复初始化
      return;
    }
    
    const defaultTemplates = [
      {
        name: '通用中文助理',
        content: '你是一个友善、专业的中文AI助理。请用中文回答，提供准确、有用的信息和建议。保持回答简洁明了，同时不失专业性。',
        description: '适用于日常问答的通用助理角色',
        is_favorite: false
      },
      {
        name: '产品经理助手',
        content: '你是一个资深的产品经理顾问。拥有丰富的产品规划、用户研究、数据分析和项目管理经验。能够提供产品策略、用户体验设计、竞品分析等方面的专业建议。请用中文回答，并结合具体案例和数据来支撑你的观点。',
        description: '专业的产品经理顾问角色',
        is_favorite: true
      },
      {
        name: '写作润色系统提示',
        content: '你是一个专业的中文写作润色师。你的任务是对用户提供的文本进行润色和优化，保持原意的同时提高语言的准确性、流畅性和表达力。请注意：\n1. 保持原文的主要意思和结构\n2. 修正语法错误和用词不当\n3. 提高语言的简洁性和准确性\n4. 如有必要，调整句子结构使其更加流畅\n5. 只输出润色后的文本，不要添加其他解释',
        description: '用于文本润色和优化表达',
        is_favorite: false
      },
      {
        name: '极简增长首席顾问',
        content: '你是一位深谙“极简增长”理论的资深首席增长顾问。你的专业能力包括：\n\n1. **数据驱动分析**：能够深入分析用户数据、产品数据和市场数据，发现增长机会\n2. **用户体验优化**：以最小可行产品（MVP）理念设计和优化用户体验\n3. **增长实验**：设计和执行A/B测试等增长实验\n4. **渠道优化**：优化获客、激活、留存、变现等各个环节\n5. **跨部门协作**：与产品、技术、运营等团队紧密协作\n\n请用中文回答，并提供具体可操作的建议和方案。',
        description: '专业的增长黑客和数据分析专家',
        is_favorite: true
      }
    ];
    
    const insertStmt = db.prepare(`
      INSERT INTO prompt_templates (name, content, description, is_favorite)
      VALUES (?, ?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      for (const template of defaultTemplates) {
        insertStmt.run(
          template.name,
          template.content,
          template.description,
          template.is_favorite ? 1 : 0
        );
      }
    });
    
    transaction();
    
    debug.log('✨ 默认提示模板初始化完成');
  } catch (error) {
    debug.error('初始化默认提示模板失败:', error);
  }
}

// ================================
// 文件夹管理 CRUD 操作
// ================================

export interface ConversationFolder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  position: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateFolderData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: number;
}

// 创建文件夹
export function createConversationFolder(data: CreateFolderData): ConversationFolder {
  // 获取当前最大的position值，新文件夹放在最后
  const maxPositionStmt = db.prepare('SELECT COALESCE(MAX(position), -1) as maxPosition FROM conversation_folders WHERE parent_id = ?');
  const maxPosition = (maxPositionStmt.get(data.parent_id || null) as { maxPosition: number }).maxPosition;
  
  const stmt = db.prepare(`
    INSERT INTO conversation_folders (name, description, color, icon, position, parent_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    data.name,
    data.description || null,
    data.color || '#3B82F6',
    data.icon || 'folder',
    maxPosition + 1,
    data.parent_id || null
  );
  
  return getConversationFolderById(result.lastInsertRowid as number);
}

// 根据ID获取文件夹
export function getConversationFolderById(id: number): ConversationFolder {
  const stmt = db.prepare('SELECT * FROM conversation_folders WHERE id = ?');
  return stmt.get(id) as ConversationFolder;
}

// 获取所有文件夹（支持树形结构）
export function listConversationFolders(parentId: number | null = null): ConversationFolder[] {
  const stmt = db.prepare(`
    SELECT * FROM conversation_folders 
    WHERE parent_id ${parentId === null ? 'IS NULL' : '= ?'}
    ORDER BY position ASC, created_at ASC
  `);
  
  if (parentId === null) {
    return stmt.all() as ConversationFolder[];
  } else {
    return stmt.all(parentId) as ConversationFolder[];
  }
}

// 获取文件夹树形结构
export function getFolderTree(): (ConversationFolder & { children?: ConversationFolder[] })[] {
  // 获取所有文件夹
  const allFolders = db.prepare(`
    SELECT * FROM conversation_folders 
    ORDER BY position ASC, created_at ASC
  `).all() as ConversationFolder[];
  
  // 构建树形结构
  const folderMap = new Map<number, ConversationFolder & { children: ConversationFolder[] }>();
  const rootFolders: (ConversationFolder & { children: ConversationFolder[] })[] = [];
  
  // 初始化所有文件夹
  allFolders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });
  
  // 构建父子关系
  allFolders.forEach(folder => {
    const folderWithChildren = folderMap.get(folder.id)!;
    
    if (folder.parent_id) {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    } else {
      rootFolders.push(folderWithChildren);
    }
  });
  
  return rootFolders;
}

// 更新文件夹
export function updateConversationFolder(id: number, updates: {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parent_id?: number;
}): ConversationFolder {
  const fields: string[] = [];
  const values: unknown[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }
  
  if (updates.icon !== undefined) {
    fields.push('icon = ?');
    values.push(updates.icon);
  }
  
  if (updates.parent_id !== undefined) {
    fields.push('parent_id = ?');
    values.push(updates.parent_id);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const stmt = db.prepare(`
    UPDATE conversation_folders
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getConversationFolderById(id);
}

// 删除文件夹
export function deleteConversationFolder(id: number): boolean {
  // 使用事务确保数据一致性
  const transaction = db.transaction(() => {
    // 1. 将文件夹中的对话移到根目录
    const moveConversationsStmt = db.prepare('UPDATE conversations SET folder_id = NULL WHERE folder_id = ?');
    moveConversationsStmt.run(id);
    
    // 2. 将子文件夹移到父级文件夹或根目录
    const getParentStmt = db.prepare('SELECT parent_id FROM conversation_folders WHERE id = ?');
    const folderInfo = getParentStmt.get(id) as { parent_id: number | null } | undefined;
    
    if (folderInfo) {
      const moveSubfoldersStmt = db.prepare('UPDATE conversation_folders SET parent_id = ? WHERE parent_id = ?');
      moveSubfoldersStmt.run(folderInfo.parent_id, id);
    }
    
    // 3. 删除文件夹
    const deleteFolderStmt = db.prepare('DELETE FROM conversation_folders WHERE id = ?');
    return deleteFolderStmt.run(id).changes > 0;
  });
  
  return transaction();
}

// 重新排序文件夹
export function reorderConversationFolders(updates: Array<{ id: number; position: number }>): boolean {
  const updateStmt = db.prepare('UPDATE conversation_folders SET position = ? WHERE id = ?');
  
  try {
    db.transaction(() => {
      for (const update of updates) {
        updateStmt.run(update.position, update.id);
      }
    })();
    return true;
  } catch (error) {
    debug.error('批量更新文件夹排序失败:', error);
    return false;
  }
}

// 移动对话到文件夹
export function moveConversationToFolder(conversationId: number, folderId: number | null): boolean {
  const stmt = db.prepare(`
    UPDATE conversations 
    SET folder_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  
  const result = stmt.run(folderId, conversationId);
  return result.changes > 0;
}

// 批量移动对话到文件夹
export function batchMoveConversationsToFolder(conversationIds: number[], folderId: number | null): boolean {
  if (conversationIds.length === 0) return true;
  
  const placeholders = conversationIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE conversations 
    SET folder_id = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (${placeholders})
  `);
  
  try {
    const result = stmt.run(folderId, ...conversationIds);
    return result.changes > 0;
  } catch (error) {
    debug.error('批量移动对话到文件夹失败:', error);
    return false;
  }
}

// 获取文件夹中的对话数量
export function getConversationCountInFolder(folderId: number | null): number {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM conversations 
    WHERE folder_id ${folderId === null ? 'IS NULL' : '= ?'}
  `);
  
  const result = folderId === null 
    ? stmt.get() as { count: number }
    : stmt.get(folderId) as { count: number };
  
  return result.count;
}

// 获取文件夹统计信息
export function getFolderStatistics() {
  const stmt = db.prepare(`
    SELECT 
      cf.id,
      cf.name,
      cf.color,
      cf.icon,
      COUNT(c.id) as conversation_count,
      MAX(c.updated_at) as last_activity
    FROM conversation_folders cf
    LEFT JOIN conversations c ON cf.id = c.folder_id
    GROUP BY cf.id, cf.name, cf.color, cf.icon
    ORDER BY cf.position ASC, cf.created_at ASC
  `);
  
  return stmt.all();
}

// 获取指定文件夹中的对话列表
export function getConversationsInFolder(folderId: number | null, params?: {
  keyword?: string;
  limit?: number;
  offset?: number;
}): (Conversation & { tags?: Tag[] })[] {
  let query = `
    SELECT DISTINCT c.* FROM conversations c
    WHERE c.folder_id ${folderId === null ? 'IS NULL' : '= ?'}
  `;
  
  const conditions: string[] = [];
  const values: unknown[] = [];
  
  if (folderId !== null) {
    values.push(folderId);
  }
  
  // 关键词搜索
  if (params?.keyword) {
    conditions.push('(c.title LIKE ? OR c.system_prompt LIKE ?)');
    const keywordParam = `%${params.keyword}%`;
    values.push(keywordParam, keywordParam);
  }
  
  if (conditions.length > 0) {
    query += ` AND ${conditions.join(' AND ')}`;
  }
  
  query += ` ORDER BY c.updated_at DESC`;
  
  if (params?.limit) {
    query += ` LIMIT ?`;
    values.push(params.limit);
    
    if (params?.offset) {
      query += ` OFFSET ?`;
      values.push(params.offset);
    }
  }
  
  const stmt = db.prepare(query);
  const conversations = stmt.all(...values) as Conversation[];
  
  // 为每个会话加载标签信息
  const conversationsWithTags = conversations.map(conversation => {
    const tags = listTagsByConversation(conversation.id);
    return {
      ...conversation,
      tags
    };
  });
  
  return conversationsWithTags;
}

// 导出数据库连接函数供API路由使用
export function getDbConnection() {
  return db;
}
