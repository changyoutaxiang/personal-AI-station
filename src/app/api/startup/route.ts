import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

/**
 * 执行数据安全检查和备份
 */
async function ensureDataSafety() {
  try {
    console.log('🛡️ 开始数据安全检查...');
    
    // 检查数据库文件是否存在
    const dbPath = 'data/digital-brain.db';
    if (!existsSync(dbPath)) {
      console.warn('⚠️ 数据库文件不存在，跳过备份');
      return { status: 'skipped', reason: 'Database file not found' };
    }
    
    // 执行数据完整性验证
    try {
      await execAsync('./scripts/verify-data-integrity.sh');
      console.log('✅ 数据完整性验证通过');
    } catch (error) {
      console.error('❌ 数据完整性验证失败:', error);
    }
    
    // 检查是否需要备份（如果今天还没有备份）
    const today = new Date().toISOString().split('T')[0];
    const todayBackupDir = `data/backups/${today}`;
    
    if (!existsSync(todayBackupDir)) {
      console.log('📦 执行今日首次备份...');
      try {
        await execAsync('./scripts/auto-backup.sh');
        console.log('✅ 自动备份完成');
        return { status: 'backup_completed', message: 'Daily backup completed successfully' };
      } catch (error) {
        console.error('❌ 自动备份失败:', error);
        return { status: 'backup_failed', error: error instanceof Error ? error.message : 'Unknown error' };
      }
    } else {
      console.log('ℹ️ 今日已有备份，跳过自动备份');
      return { status: 'backup_exists', message: 'Backup already exists for today' };
    }
  } catch (error) {
    console.error('❌ 数据安全检查失败:', error);
    return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await ensureDataSafety();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('启动初始化失败:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // 简单的健康检查
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'Startup API is running'
  });
}