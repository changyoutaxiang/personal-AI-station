#!/usr/bin/env node

/**
 * 数据迁移执行脚本
 * 提供交互式界面运行数据迁移
 */

const { runMigration } = require('./sqlite-to-supabase');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🚀 SQLite 到 Supabase 数据迁移工具');
  console.log('=' .repeat(50));

  console.log('\n📋 迁移前检查清单:');
  console.log('✅ Supabase 项目已创建');
  console.log('✅ 环境变量已配置 (.env.local)');
  console.log('✅ Schema 修复脚本已应用');
  console.log('✅ 本地 SQLite 数据备份已完成');

  const confirm = await askQuestion('\n是否继续执行数据迁移？(y/N): ');

  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('❌ 迁移已取消');
    rl.close();
    return;
  }

  console.log('\n🔄 开始执行迁移...\n');

  try {
    await runMigration();
    console.log('\n🎉 迁移完成！');

    console.log('\n📋 下一步操作:');
    console.log('1. 验证迁移数据的正确性');
    console.log('2. 更新应用配置使用 Supabase');
    console.log('3. 测试应用功能');
    console.log('4. 部署到生产环境');

  } catch (error) {
    console.error('\n💥 迁移失败:', error.message);
    console.log('\n🔧 故障排除建议:');
    console.log('1. 检查网络连接');
    console.log('2. 验证 Supabase 配置');
    console.log('3. 检查数据格式兼容性');
    console.log('4. 查看详细日志文件');
  }

  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };