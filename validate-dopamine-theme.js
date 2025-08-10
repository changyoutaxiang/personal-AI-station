#!/usr/bin/env node

/**
 * 多巴胺主题简化验证脚本
 * 验证服务器状态、文件完整性和基本配置
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🎨 多巴胺主题验证脚本\n');

const results = {
  server: {},
  files: {},
  configuration: {},
  styles: {}
};

/**
 * 检查服务器状态
 */
function checkServerStatus() {
  return new Promise((resolve) => {
    console.log('📋 1. 检查开发服务器状态...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      if (res.statusCode === 200) {
        results.server.status = '✅ 开发服务器正常运行';
        results.server.port = '✅ 端口 3000 可访问';
      } else {
        results.server.status = `⚠️ 服务器返回状态码: ${res.statusCode}`;
      }
      resolve();
    });
    
    req.on('error', (err) => {
      results.server.status = '❌ 开发服务器未运行';
      results.server.note = '请运行: npm run dev';
      resolve();
    });
    
    req.on('timeout', () => {
      results.server.status = '⚠️ 服务器响应超时';
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

/**
 * 验证文件完整性
 */
function validateFiles() {
  console.log('📋 2. 验证文件完整性...');
  
  const requiredFiles = [
    'src/app/globals.css',
    'src/contexts/ThemeContext.tsx',
    'src/components/ThemeToggle.tsx'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      results.files[file] = '✅ 文件存在';
    } else {
      results.files[file] = '❌ 文件缺失';
    }
  });
}

/**
 * 验证主题配置
 */
function validateConfiguration() {
  console.log('📋 3. 验证主题配置...');
  
  try {
    // 检查 ThemeContext
    const contextPath = path.join(__dirname, 'src/contexts/ThemeContext.tsx');
    const contextContent = fs.readFileSync(contextPath, 'utf8');
    
    if (contextContent.includes("'dopamine'")) {
      results.configuration.themeContext = '✅ ThemeContext 支持 dopamine';
    } else {
      results.configuration.themeContext = '❌ ThemeContext 缺少 dopamine 支持';
    }
    
    if (contextContent.includes("label: '多巴胺'")) {
      results.configuration.themeLabel = '✅ 主题标签正确';
    } else {
      results.configuration.themeLabel = '⚠️ 主题标签需要检查';
    }
    
    // 检查 ThemeToggle
    const togglePath = path.join(__dirname, 'src/components/ThemeToggle.tsx');
    const toggleContent = fs.readFileSync(togglePath, 'utf8');
    
    if (toggleContent.includes('多巴胺') || toggleContent.includes('dopamine')) {
      results.configuration.themeToggle = '✅ ThemeToggle 包含多巴胺选项';
    } else {
      results.configuration.themeToggle = '❌ ThemeToggle 缺少多巴胺选项';
    }
    
  } catch (error) {
    results.configuration.error = `❌ 配置验证失败: ${error.message}`;
  }
}

/**
 * 验证样式文件
 */
function validateStyles() {
  console.log('📋 4. 验证样式定义...');
  
  try {
    const stylesPath = path.join(__dirname, 'src/app/globals.css');
    const stylesContent = fs.readFileSync(stylesPath, 'utf8');
    
    // 检查多巴胺主题变量
    const dopamineVariables = [
      '--dopamine-orange',
      '--dopamine-green',
      '--dopamine-light-green',
      '--dopamine-indigo',
      '--dopamine-yellow'
    ];
    
    dopamineVariables.forEach(variable => {
      if (stylesContent.includes(variable)) {
        results.styles[variable] = '✅ 已定义';
      } else {
        results.styles[variable] = '❌ 未找到';
      }
    });
    
    // 检查主题区块
    if (stylesContent.includes('[data-theme="dopamine"]')) {
      results.styles.themeBlock = '✅ 多巴胺主题区块存在';
    } else {
      results.styles.themeBlock = '❌ 多巴胺主题区块缺失';
    }
    
    if (stylesContent.includes('[data-theme="dopamine"][data-color-scheme="dark"]')) {
      results.styles.darkMode = '✅ 暗色模式支持';
    } else {
      results.styles.darkMode = '❌ 暗色模式缺失';
    }
    
    // 检查语义映射
    const mappings = [
      'var(--dopamine-orange)',
      'var(--dopamine-green)',
      'var(--dopamine-indigo)'
    ];
    
    let mappingCount = 0;
    mappings.forEach(mapping => {
      if (stylesContent.includes(mapping)) {
        mappingCount++;
      }
    });
    
    if (mappingCount >= 2) {
      results.styles.semanticMapping = `✅ 语义映射正常 (${mappingCount}/${mappings.length})`;
    } else {
      results.styles.semanticMapping = `⚠️ 语义映射需要检查 (${mappingCount}/${mappings.length})`;
    }
    
  } catch (error) {
    results.styles.error = `❌ 样式验证失败: ${error.message}`;
  }
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('\n📊 生成验证报告...\n');
  
  let report = `# 多巴胺主题验证报告\n\n`;
  report += `验证时间: ${new Date().toLocaleString()}\n\n`;
  
  // 服务器状态
  report += `## 🌐 服务器状态\n\n`;
  Object.entries(results.server).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 文件完整性
  report += `\n## 📁 文件完整性\n\n`;
  Object.entries(results.files).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 主题配置
  report += `\n## ⚙️ 主题配置\n\n`;
  Object.entries(results.configuration).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 样式定义
  report += `\n## 🎨 样式定义\n\n`;
  Object.entries(results.styles).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 计算总体状态
  const allResults = {...results.server, ...results.files, ...results.configuration, ...results.styles};
  const totalTests = Object.keys(allResults).filter(k => !k.includes('note') && !k.includes('error')).length;
  const passedTests = Object.values(allResults).filter(v => v.includes('✅')).length;
  const warningTests = Object.values(allResults).filter(v => v.includes('⚠️')).length;
  const failedTests = Object.values(allResults).filter(v => v.includes('❌')).length;
  
  report += `\n## 📊 验证总结\n\n`;
  report += `- 总验证项: ${totalTests}\n`;
  report += `- 通过验证: ${passedTests}\n`;
  report += `- 警告项目: ${warningTests}\n`;
  report += `- 失败项目: ${failedTests}\n`;
  report += `- 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;
  
  if (failedTests === 0) {
    report += `🎉 **验证结果**: 多巴胺主题配置完整，可以进行测试！\n\n`;
    
    if (results.server.status?.includes('✅')) {
      report += `### 🚀 建议下一步操作：\n`;
      report += `1. 在浏览器中访问 http://localhost:3000\n`;
      report += `2. 寻找主题设置选项（可能在侧栏、设置页面或导航栏）\n`;
      report += `3. 切换到"多巴胺"主题\n`;
      report += `4. 验证颜色显示正确（橙红色主调）\n`;
      report += `5. 刷新页面确认主题持久化\n`;
      report += `6. 测试亮色/暗色模式切换\n\n`;
    } else {
      report += `### ⚠️ 需要先启动服务器：\n`;
      report += `\`\`\`bash\n`;
      report += `npm run dev\n`;
      report += `# 然后在浏览器访问 http://localhost:3000\n`;
      report += `\`\`\`\n\n`;
    }
  } else {
    report += `❌ **验证结果**: 发现 ${failedTests} 个问题需要修复。\n\n`;
  }
  
  // 手动测试指南
  report += `## 🧪 手动测试指南\n\n`;
  report += `### 基本功能测试\n`;
  report += `1. **主题切换测试**\n`;
  report += `   - 访问主题设置\n`;
  report += `   - 选择"多巴胺"主题\n`;
  report += `   - 确认界面颜色变为橙红色调\n\n`;
  
  report += `2. **持久化测试**\n`;
  report += `   - 切换到多巴胺主题后刷新页面\n`;
  report += `   - 确认主题选择被保持\n`;
  report += `   - 关闭浏览器重新打开验证\n\n`;
  
  report += `3. **颜色模式测试**\n`;
  report += `   - 在多巴胺主题下切换亮色/暗色模式\n`;
  report += `   - 确认颜色适配正确\n\n`;
  
  report += `4. **回归测试**\n`;
  report += `   - 切换到其他主题（温暖、科技、森林）\n`;
  report += `   - 确认其他主题不受影响\n`;
  report += `   - 再次切换回多巴胺主题验证\n\n`;
  
  report += `### 跨浏览器测试\n`;
  report += `- [ ] **Chrome**: 验证多巴胺主题完整显示\n`;
  report += `- [ ] **Safari**: 检查颜色渲染一致性\n`;
  report += `- [ ] **Firefox**: 确认CSS变量支持\n`;
  report += `- [ ] **Edge**: 测试兼容性（可选）\n\n`;
  
  report += `### 组件验证清单\n`;
  report += `- [ ] 按钮颜色使用多巴胺橙红色\n`;
  report += `- [ ] 输入框焦点状态正确\n`;
  report += `- [ ] 卡片边框和阴影色调一致\n`;
  report += `- [ ] 文本颜色对比度良好\n`;
  report += `- [ ] 成功提示使用多巴胺绿色\n`;
  report += `- [ ] 警告提示使用多巴胺黄色\n`;
  report += `- [ ] 信息提示使用多巴胺靛蓝色\n\n`;
  
  // 提交建议
  if (failedTests === 0) {
    report += `## 🚢 提交建议\n\n`;
    report += `完成手动测试后，可以按以下步骤提交：\n\n`;
    report += `\`\`\`bash\n`;
    report += `# commit 1（样式）\n`;
    report += `git add src/app/globals.css\n`;
    report += `git commit -m "feat(theme): add dopamine theme tokens (light/dark) in globals.css"\n\n`;
    report += `# commit 2（逻辑）\n`;
    report += `git add src/contexts/ThemeContext.tsx src/components/ThemeToggle.tsx\n`;
    report += `git commit -m "feat(theme): register 'dopamine' in ThemeContext and ThemeToggle"\n\n`;
    report += `# commit 3（测试和文档）\n`;
    report += `git add *.md *.js\n`;
    report += `git commit -m "docs(theme): add dopamine theme testing and validation"\n`;
    report += `\`\`\`\n\n`;
  }
  
  // 保存报告
  const reportPath = path.join(__dirname, 'DOPAMINE_VALIDATION_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(report);
  console.log(`📄 详细报告已保存到: ${reportPath}\n`);
}

/**
 * 主执行流程
 */
async function runValidation() {
  await checkServerStatus();
  validateFiles();
  validateConfiguration();
  validateStyles();
  generateReport();
  
  console.log('🎉 多巴胺主题验证完成！');
  
  // 给出下一步建议
  if (results.server.status?.includes('✅')) {
    console.log('\n🌟 服务器正在运行，您现在可以：');
    console.log('1. 在浏览器中打开 http://localhost:3000');
    console.log('2. 测试多巴胺主题切换功能');
  } else {
    console.log('\n📋 下一步操作：');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 然后进行手动测试');
  }
}

// 运行验证
runValidation().catch(console.error);
