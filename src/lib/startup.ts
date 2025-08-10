/**
 * 应用启动初始化模块
 * 用于在应用启动时执行必要的初始化操作
 */

import { debug } from './debug';

// 全局标记，确保只初始化一次
let isInitialized = false;

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