#!/usr/bin/env node

/**
 * SQLite 到 Supabase 数据迁移脚本
 * 将本地 SQLite 数据库中的数据迁移到 Supabase
 */

const Database = require('better-sqlite3');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 配置
const SQLITE_DB_PATH = path.join(__dirname, '..', 'digital-brain.db');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 初始化客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const db = new Database(SQLITE_DB_PATH);

// 迁移状态跟踪
const migrationLog = {
  startTime: new Date(),
  tables: {},
  errors: [],
  summary: {}
};

/**
 * 通用数据迁移函数
 */
async function migrateTable(tableName, transformFunction = null) {
  console.log(`🔄 开始迁移表: ${tableName}`);

  try {
    // 使用 better-sqlite3 API 读取数据
    const stmt = db.prepare(`SELECT * FROM ${tableName}`);
    const rows = stmt.all();

    if (!rows || rows.length === 0) {
      console.log(`⚠️  ${tableName} 表为空，跳过迁移`);
      migrationLog.tables[tableName] = { status: 'empty', count: 0 };
      return;
    }

    // 应用数据转换函数（如果提供）
    let transformedRows = rows;
    if (transformFunction) {
      transformedRows = rows.map(transformFunction);
    }

    // 批量插入到 Supabase
    const { data, error } = await supabase
      .from(tableName)
      .insert(transformedRows);

    if (error) {
      console.error(`❌ 插入 ${tableName} 到 Supabase 失败:`, error);
      migrationLog.errors.push(`插入 ${tableName}: ${error.message}`);
      throw error;
    }

    console.log(`✅ ${tableName} 迁移成功: ${rows.length} 条记录`);
    migrationLog.tables[tableName] = {
      status: 'success',
      count: rows.length,
      transformed: !!transformFunction
    };

  } catch (error) {
    console.error(`❌ ${tableName} 迁移失败:`, error);
    migrationLog.errors.push(`迁移 ${tableName}: ${error.message}`);
    throw error;
  }
}

/**
 * Tasks 表数据转换函数
 * 处理字段映射和数据清理
 */
function transformTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    project_id: row.project_id,
    status: row.status,
    priority: row.priority,
    estimated_hours: row.estimated_hours,
    actual_hours: row.actual_hours,
    due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
    completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

/**
 * Projects 表数据转换函数
 */
function transformProject(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    status: row.status || 'active',
    priority: row.priority || 'medium',
    start_date: row.start_date ? new Date(row.start_date).toISOString() : null,
    due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
    completed_at: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    owner: row.owner || null,
    color: row.color || '#3B82F6',
    is_archived: row.is_archived || false
  };
}

/**
 * Subtasks 表数据转换函数
 */
function transformSubtask(row) {
  return {
    id: row.id,
    task_id: row.task_id,
    title: row.title,
    description: row.description || null,
    completed: row.completed || false,
    order_index: row.order_index || 0,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

/**
 * 验证 Supabase 连接
 */
async function verifySupabaseConnection() {
  console.log('🔍 验证 Supabase 连接...');

  try {
    const { data, error } = await supabase.from('tasks').select('count', { count: 'exact' });

    if (error) {
      throw error;
    }

    console.log('✅ Supabase 连接正常');
    return true;
  } catch (error) {
    console.error('❌ Supabase 连接失败:', error);
    return false;
  }
}

/**
 * 主迁移函数
 */
async function runMigration() {
  console.log('🚀 开始 SQLite 到 Supabase 数据迁移');
  console.log('📍 数据库路径:', SQLITE_DB_PATH);
  console.log('📍 Supabase URL:', SUPABASE_URL);

  try {
    // 验证连接
    const isConnected = await verifySupabaseConnection();
    if (!isConnected) {
      throw new Error('无法连接到 Supabase');
    }

    // 按依赖关系顺序迁移表
    console.log('\n📋 开始按顺序迁移表...\n');

    // 1. 首先迁移 projects 表（因为 tasks 表引用它）
    await migrateTable('projects', transformProject);

    // 2. 迁移 tasks 表
    await migrateTable('tasks', transformTask);

    // 3. 迁移 subtasks 表（依赖 tasks 表）
    await migrateTable('subtasks', transformSubtask);

    // 4. 迁移其他表（如果存在且在 Supabase 中有对应表）
    const otherTables = [
      'comments',
      'task_dependencies',
      'task_tags',
      'tags',
      'project_tags',
      'project_templates',
      'project_stats',
      'ai_model_config',
      'ai_providers',
      'html_projects'
    ];

    for (const tableName of otherTables) {
      try {
        // 检查 Supabase 中是否存在该表
        const { error } = await supabase.from(tableName).select('*').limit(1);
        if (!error) {
          await migrateTable(tableName);
        } else {
          console.log(`⚠️  跳过表 ${tableName}（Supabase 中不存在）`);
        }
      } catch (error) {
        console.log(`⚠️  跳过表 ${tableName}:`, error.message);
      }
    }

    // 迁移完成
    migrationLog.endTime = new Date();
    migrationLog.duration = migrationLog.endTime - migrationLog.startTime;

    console.log('\n🎉 数据迁移完成！');
    console.log('\n📊 迁移摘要:');
    console.log('='.repeat(50));

    let totalRecords = 0;
    let successfulTables = 0;

    for (const [tableName, info] of Object.entries(migrationLog.tables)) {
      const status = info.status === 'success' ? '✅' :
                    info.status === 'empty' ? '⚪' : '❌';
      console.log(`${status} ${tableName}: ${info.count} 条记录`);

      if (info.status === 'success') {
        totalRecords += info.count;
        successfulTables++;
      }
    }

    console.log('='.repeat(50));
    console.log(`📈 总计: ${totalRecords} 条记录，${successfulTables} 个表迁移成功`);
    console.log(`⏱️  耗时: ${Math.round(migrationLog.duration / 1000)}秒`);

    if (migrationLog.errors.length > 0) {
      console.log('\n⚠️  迁移过程中的错误:');
      migrationLog.errors.forEach(error => console.log(`   - ${error}`));
    }

    // 保存迁移日志
    const logPath = path.join(__dirname, `migration-log-${Date.now()}.json`);
    require('fs').writeFileSync(logPath, JSON.stringify(migrationLog, null, 2));
    console.log(`📝 迁移日志已保存到: ${logPath}`);

  } catch (error) {
    console.error('💥 迁移失败:', error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    db.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration, migrateTable, transformTask, transformProject, transformSubtask };