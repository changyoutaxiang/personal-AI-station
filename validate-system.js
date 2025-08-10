#!/usr/bin/env node

/**
 * 系统验证脚本 - 验收测试前的最终检查
 * 验证所有关键组件和配置是否就绪
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// 验证结果统计
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  issues: []
};

function checkItem(name, condition, passMessage, failMessage, critical = false) {
  results.total++;
  if (condition) {
    results.passed++;
    log(`✅ ${name}: ${passMessage}`, 'green');
    return true;
  } else {
    results.failed++;
    log(`❌ ${name}: ${failMessage}`, 'red');
    results.issues.push({ name, message: failMessage, critical });
    return false;
  }
}

function checkWarning(name, condition, passMessage, warnMessage) {
  if (condition) {
    log(`✅ ${name}: ${passMessage}`, 'green');
  } else {
    log(`⚠️  ${name}: ${warnMessage}`, 'yellow');
  }
}

async function validateSystem() {
  log('🔍 执行系统验证检查...', 'cyan');
  log('==========================================', 'cyan');

  // 1. 基础文件结构检查
  log('\n📁 文件结构检查', 'blue');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package配置文件' },
    { path: 'next.config.ts', desc: 'Next.js配置文件' },
    { path: 'src/app/agent/page.tsx', desc: '智能助理主页面' },
    { path: 'src/app/api/agent/chat/route.ts', desc: '聊天API路由' },
    { path: 'src/lib/openrouter-client.ts', desc: 'OpenRouter客户端' },
    { path: 'src/contexts/ChatContext.tsx', desc: '聊天上下文' },
    { path: 'data/digital-brain.db', desc: '数据库文件' }
  ];

  for (const file of requiredFiles) {
    const exists = fs.existsSync(file.path);
    checkItem(
      `文件: ${file.path}`,
      exists,
      `${file.desc}存在`,
      `${file.desc}缺失`,
      true
    );
  }

  // 2. 核心目录检查
  log('\n📂 目录结构检查', 'blue');
  
  const requiredDirs = [
    { path: 'src/app/api/agent', desc: 'Agent API目录' },
    { path: 'src/components/agent', desc: 'Agent组件目录' },
    { path: 'src/hooks', desc: 'Hooks目录' },
    { path: 'data', desc: '数据目录' }
  ];

  for (const dir of requiredDirs) {
    const exists = fs.existsSync(dir.path) && fs.statSync(dir.path).isDirectory();
    checkItem(
      `目录: ${dir.path}`,
      exists,
      `${dir.desc}存在`,
      `${dir.desc}缺失`,
      true
    );
  }

  // 3. 数据库检查
  log('\n🗄️  数据库检查', 'blue');
  
  const dbPath = 'data/digital-brain.db';
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    checkItem(
      '数据库大小',
      stats.size > 1000, // 至少1KB，说明有数据
      `数据库文件正常 (${sizeMB}MB)`,
      '数据库文件可能为空',
      false
    );
    
    // 检查备份目录
    const backupDir = 'data/backups';
    const hasBackups = fs.existsSync(backupDir) && fs.readdirSync(backupDir).length > 0;
    checkWarning(
      '数据库备份',
      hasBackups,
      '数据库备份目录存在',
      '建议设置数据库备份'
    );
  }

  // 4. 配置文件检查
  log('\n⚙️  配置文件检查', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    
    // 检查必需依赖
    const requiredDeps = [
      'next', 'react', 'react-dom', 'better-sqlite3', 'axios', 'react-hot-toast'
    ];
    
    let allDepsPresent = true;
    for (const dep of requiredDeps) {
      if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
        allDepsPresent = false;
        break;
      }
    }
    
    checkItem(
      '必需依赖',
      allDepsPresent,
      '所有必需依赖已安装',
      '存在缺失的依赖',
      true
    );
    
    // 检查测试脚本
    const hasTestScript = packageJson.scripts && packageJson.scripts['test:e2e'];
    checkItem(
      '测试脚本',
      hasTestScript,
      'E2E测试脚本已配置',
      'E2E测试脚本缺失',
      false
    );
    
  } catch (error) {
    checkItem(
      'package.json解析',
      false,
      '',
      `配置文件解析失败: ${error.message}`,
      true
    );
  }

  // 5. 核心API路由检查
  log('\n🌐 API路由检查', 'blue');
  
  const apiRoutes = [
    'src/app/api/agent/chat/route.ts',
    'src/app/api/agent/conversations/route.ts',
    'src/app/api/agent/messages/route.ts',
    'src/app/api/agent/prompts/route.ts',
    'src/app/api/models/route.ts'
  ];

  let routeCount = 0;
  for (const route of apiRoutes) {
    if (fs.existsSync(route)) {
      routeCount++;
    }
  }

  checkItem(
    'API路由完整性',
    routeCount >= 4,
    `${routeCount}/${apiRoutes.length} 个API路由存在`,
    `只有 ${routeCount}/${apiRoutes.length} 个API路由存在`,
    true
  );

  // 6. 核心组件检查
  log('\n🧩 核心组件检查', 'blue');
  
  const coreComponents = [
    'src/components/agent/ChatLayout.tsx',
    'src/components/agent/ChatMessages.tsx',
    'src/components/agent/ChatInput.tsx',
    'src/components/agent/ChatSidebar.tsx',
    'src/components/agent/ModelSelector.tsx'
  ];

  let componentCount = 0;
  for (const component of coreComponents) {
    if (fs.existsSync(component)) {
      componentCount++;
    }
  }

  checkItem(
    '核心组件完整性',
    componentCount >= 4,
    `${componentCount}/${coreComponents.length} 个核心组件存在`,
    `只有 ${componentCount}/${coreComponents.length} 个核心组件存在`,
    true
  );

  // 7. 环境配置检查
  log('\n🔧 环境配置检查', 'blue');
  
  // 检查.env文件
  const envExists = fs.existsSync('.env.local') || fs.existsSync('.env');
  checkWarning(
    '环境配置文件',
    envExists,
    '环境配置文件存在',
    '建议创建.env.local文件配置API密钥'
  );
  
  // 检查Node版本
  const nodeVersion = process.version;
  const nodeVersionNum = parseInt(nodeVersion.slice(1).split('.')[0]);
  checkItem(
    'Node.js版本',
    nodeVersionNum >= 18,
    `Node.js版本: ${nodeVersion}`,
    `Node.js版本过低: ${nodeVersion} (需要 >=18)`,
    true
  );

  // 8. 测试文件检查
  log('\n🧪 测试文件检查', 'blue');
  
  const testFiles = [
    { path: 'test-e2e.js', desc: 'E2E自动化测试脚本' },
    { path: 'E2E_TEST_CHECKLIST.md', desc: '测试清单文档' },
    { path: 'TEST_GUIDE.md', desc: '测试指南文档' }
  ];

  for (const file of testFiles) {
    const exists = fs.existsSync(file.path);
    checkItem(
      file.desc,
      exists,
      '文件存在',
      '文件缺失',
      false
    );
  }

  // 9. 代码质量检查
  log('\n📝 代码质量检查', 'blue');
  
  // 检查TypeScript配置
  const tsconfigExists = fs.existsSync('tsconfig.json');
  checkItem(
    'TypeScript配置',
    tsconfigExists,
    'tsconfig.json存在',
    'TypeScript配置缺失',
    false
  );
  
  // 检查ESLint配置
  const eslintExists = fs.existsSync('eslint.config.mjs');
  checkWarning(
    'ESLint配置',
    eslintExists,
    'ESLint配置存在',
    '建议配置ESLint进行代码检查'
  );

  // 10. 生成验证报告
  log('\n📊 验证结果', 'cyan');
  log('==========================================', 'cyan');
  
  const passRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  
  log(`总检查项: ${results.total}`, 'blue');
  log(`通过项: ${results.passed}`, 'green');
  log(`失败项: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`通过率: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  if (results.issues.length > 0) {
    log('\n❗ 发现的问题:', 'yellow');
    results.issues.forEach((issue, index) => {
      const icon = issue.critical ? '🚨' : '⚠️';
      log(`${index + 1}. ${icon} ${issue.name}: ${issue.message}`);
    });
  }
  
  // 最终建议
  log('\n💡 验证总结', 'cyan');
  
  const criticalIssues = results.issues.filter(i => i.critical);
  
  if (criticalIssues.length === 0 && passRate >= 90) {
    log('🎉 系统验证通过！可以开始执行端到端测试。', 'green');
    log('👉 运行命令: npm run test:e2e', 'green');
    return 0;
  } else if (criticalIssues.length === 0 && passRate >= 70) {
    log('⚠️  系统基本就绪，但建议解决上述警告问题。', 'yellow');
    log('👉 运行命令: npm run test:e2e', 'yellow');
    return 1;
  } else {
    log('🚨 系统存在关键问题，需要先解决后再进行测试。', 'red');
    log('❌ 请解决上述关键问题后重新验证。', 'red');
    return 2;
  }
}

// 执行验证
if (require.main === module) {
  validateSystem()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`验证执行失败: ${error.message}`, 'red');
      process.exit(3);
    });
}

module.exports = { validateSystem };
