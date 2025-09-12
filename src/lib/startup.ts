/**
 * 应用启动初始化模块
 * 用于在应用启动时执行必要的初始化操作
 */

import { debug } from './debug';

// 全局标记，确保只初始化一次
let isInitialized = false;

/**
 * 执行数据安全检查和备份（仅在服务器端）
 */
async function ensureDataSafety() {
  // 只在服务器端执行
  if (typeof window !== 'undefined') {
    debug.log('🌐 客户端环境，跳过数据安全检查');
    return;
  }
  
  try {
    debug.log('🛡️ 开始数据安全检查...');
    
    // 动态导入Node.js模块（仅在服务器端）
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const { existsSync } = await import('fs');
    
    const execAsync = promisify(exec);
    
    // 检查数据库文件是否存在
    const dbPath = 'data/digital-brain.db';
    if (!existsSync(dbPath)) {
      debug.warn('⚠️ 数据库文件不存在，跳过备份');
      return;
    }
    
    // 执行数据完整性验证
    try {
      await execAsync('./scripts/verify-data-integrity.sh');
      debug.log('✅ 数据完整性验证通过');
    } catch (error) {
      debug.error('❌ 数据完整性验证失败:', error);
    }
    
    // 检查是否需要备份（如果今天还没有备份）
    const today = new Date().toISOString().split('T')[0];
    const todayBackupDir = `data/backups/${today}`;
    
    if (!existsSync(todayBackupDir)) {
      debug.log('📦 执行今日首次备份...');
      try {
        await execAsync('./scripts/auto-backup.sh');
        debug.log('✅ 自动备份完成');
      } catch (error) {
        debug.error('❌ 自动备份失败:', error);
      }
    } else {
      debug.log('✅ 今日已有备份，跳过自动备份');
    }
    
  } catch (error) {
    debug.error('❌ 数据安全检查失败:', error);
  }
}

/**
 * 应用启动初始化
 */
export async function initializeApp() {
  // 防止重复初始化
  if (isInitialized) {
    return;
  }

  try {
    debug.log('🚀 开始初始化你好 唱游应用...');
    
    // 只在服务器端初始化数据库
    if (typeof window === 'undefined') {
      debug.log('📊 初始化数据库...');
      const { initDatabase } = await import('./db');
      initDatabase();
      debug.log('✅ 数据库初始化完成！');
      
      // 执行数据安全检查和备份
      await ensureDataSafety();
    }
    
    // 标记为已初始化
    isInitialized = true;
    
    debug.log('✅ 你好 唱游应用初始化完成！');
  } catch (error) {
    debug.error('❌ 应用初始化失败:', error);
    // 不终止应用，只记录错误
  }
}

// 在模块加载时自动执行初始化（仅在服务器端）
if (typeof window === 'undefined') {
  initializeApp().catch(debug.error);
}