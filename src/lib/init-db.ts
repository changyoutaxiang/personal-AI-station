import { initDatabase } from './db';
import { debug } from '@/lib/debug';

// 初始化应用系统
async function initialize() {
  try {
    debug.log('🚀 开始初始化应用系统...');
    
    // 初始化数据库
    debug.log('📊 初始化数据库...');
    initDatabase();
    debug.log('✅ 数据库初始化完成！');
    
    debug.log('🎉 应用系统初始化完成！');
  } catch (error) {
    debug.error('❌ 应用系统初始化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行初始化
if (require.main === module) {
  initialize();
}

export { initialize as initDB };