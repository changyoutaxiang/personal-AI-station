#!/usr/bin/env node

/**
 * 多巴胺主题测试和验证脚本
 * 验证主题实现的完整性、对比度、localStorage 持久化等
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 开始多巴胺主题测试和验证...\n');

// 测试结果收集
const results = {
  styleValidation: {},
  componentValidation: {},
  persistenceValidation: {},
  contrastValidation: {},
  crossThemeValidation: {}
};

/**
 * 1. 样式文件验证
 */
function validateStyles() {
  console.log('📋 1. 验证样式文件...');
  
  const globalsPath = path.join(__dirname, 'src/app/globals.css');
  
  try {
    const content = fs.readFileSync(globalsPath, 'utf8');
    
    // 检查多巴胺主题基本变量
    const dopamineVariables = [
      '--dopamine-orange',
      '--dopamine-green', 
      '--dopamine-light-green',
      '--dopamine-indigo',
      '--dopamine-yellow'
    ];
    
    dopamineVariables.forEach(variable => {
      if (content.includes(variable)) {
        results.styleValidation[variable] = '✅ 已定义';
      } else {
        results.styleValidation[variable] = '❌ 未找到';
      }
    });
    
    // 检查多巴胺主题区块
    const themeBlocks = [
      '[data-theme="dopamine"]',
      '[data-theme="dopamine"][data-color-scheme="dark"]'
    ];
    
    themeBlocks.forEach(block => {
      if (content.includes(block)) {
        results.styleValidation[block] = '✅ 主题区块存在';
      } else {
        results.styleValidation[block] = '❌ 主题区块缺失';
      }
    });
    
    // 检查语义映射
    const semanticMappings = [
      '--dynamic-primary: var(--dopamine-orange)',
      '--text-success: var(--dopamine-green)',
      '--text-warning: var(--dopamine-yellow)',
      '--text-accent: var(--dopamine-indigo)',
      '--flow-primary: var(--dopamine-orange)'
    ];
    
    semanticMappings.forEach(mapping => {
      if (content.includes(mapping)) {
        results.styleValidation[mapping] = '✅ 语义映射正确';
      } else {
        results.styleValidation[mapping] = '⚠️ 映射需检查';
      }
    });
    
  } catch (error) {
    results.styleValidation.error = `❌ 无法读取样式文件: ${error.message}`;
  }
  
  console.log('   样式验证完成\n');
}

/**
 * 2. 组件文件验证
 */
function validateComponents() {
  console.log('📋 2. 验证组件文件...');
  
  // 验证 ThemeContext
  const contextPath = path.join(__dirname, 'src/contexts/ThemeContext.tsx');
  try {
    const content = fs.readFileSync(contextPath, 'utf8');
    
    if (content.includes("'dopamine'")) {
      results.componentValidation.themeContext = '✅ ThemeContext 支持 dopamine';
    } else {
      results.componentValidation.themeContext = '❌ ThemeContext 缺少 dopamine';
    }
    
    if (content.includes("label: '多巴胺'")) {
      results.componentValidation.themeLabel = '✅ 主题标签正确';
    } else {
      results.componentValidation.themeLabel = '⚠️ 主题标签需检查';
    }
    
  } catch (error) {
    results.componentValidation.contextError = `❌ ${error.message}`;
  }
  
  // 验证 ThemeToggle
  const togglePath = path.join(__dirname, 'src/components/ThemeToggle.tsx');
  try {
    const content = fs.readFileSync(togglePath, 'utf8');
    
    if (content.includes('多巴胺主题')) {
      results.componentValidation.toggleComponent = '✅ ThemeToggle 包含多巴胺选项';
    } else {
      results.componentValidation.toggleComponent = '❌ ThemeToggle 缺少多巴胺选项';
    }
    
    // 检查颜色预览
    if (content.includes('#FF6B47') && content.includes('#FFD700')) {
      results.componentValidation.colorPreview = '✅ 颜色预览正确';
    } else {
      results.componentValidation.colorPreview = '⚠️ 颜色预览需检查';
    }
    
  } catch (error) {
    results.componentValidation.toggleError = `❌ ${error.message}`;
  }
  
  console.log('   组件验证完成\n');
}

/**
 * 3. 验证对比度
 */
function validateContrast() {
  console.log('📋 3. 验证对比度...');
  
  // 多巴胺主题核心色彩
  const colors = {
    'dopamine-orange': '#FF6B47',
    'dopamine-green': '#00D084', 
    'dopamine-light-green': '#8FD14F',
    'dopamine-indigo': '#6366F1',
    'dopamine-yellow': '#FFD700'
  };
  
  // 前景色建议（来自文档）
  const foregroundColors = {
    'dopamine-orange': '#FFFFFF',
    'dopamine-green': '#062814',
    'dopamine-light-green': '#132009',
    'dopamine-indigo': '#FFFFFF', 
    'dopamine-yellow': '#1F1500'
  };
  
  // 简单对比度检查（基于亮度差异）
  function getLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  function getContrastRatio(color1, color2) {
    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  
  Object.keys(colors).forEach(colorKey => {
    const bgColor = colors[colorKey];
    const fgColor = foregroundColors[colorKey];
    const ratio = getContrastRatio(bgColor, fgColor);
    
    let grade = '';
    if (ratio >= 7) grade = 'AAA ✅';
    else if (ratio >= 4.5) grade = 'AA ✅';
    else grade = '❌ 不达标';
    
    results.contrastValidation[colorKey] = `${ratio.toFixed(1)}:1 ${grade}`;
  });
  
  console.log('   对比度验证完成\n');
}

/**
 * 4. 生成测试报告
 */
function generateReport() {
  console.log('📊 生成测试报告...\n');
  
  let report = `# 多巴胺主题测试报告\n\n`;
  report += `测试时间: ${new Date().toLocaleString()}\n\n`;
  
  // 样式验证报告
  report += `## 📋 样式文件验证\n\n`;
  Object.entries(results.styleValidation).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 组件验证报告
  report += `\n## 🔧 组件文件验证\n\n`;
  Object.entries(results.componentValidation).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 对比度验证报告
  report += `\n## 🎨 对比度验证（WCAG标准）\n\n`;
  Object.entries(results.contrastValidation).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 测试建议
  report += `\n## 🧪 手动测试建议\n\n`;
  report += `### 跨浏览器测试\n`;
  report += `- [ ] Chrome: 访问 http://localhost:3000 测试主题切换\n`;
  report += `- [ ] Safari: 验证颜色显示和动画效果\n`;
  report += `- [ ] Firefox: 检查CSS变量兼容性\n\n`;
  
  report += `### 组件自测\n`;
  report += `- [ ] 按钮: 检查主色调和hover效果\n`;
  report += `- [ ] 输入框: 验证焦点状态颜色\n`;
  report += `- [ ] 卡片: 确认边框和阴影颜色\n`;
  report += `- [ ] 图表高亮: 测试数据可视化色彩\n`;
  report += `- [ ] Toast/Modal: 验证状态色显示\n\n`;
  
  report += `### 回归验证\n`;
  report += `- [ ] 切换其他主题: 确保不受影响\n`;
  report += `- [ ] 刷新页面: 验证主题选择持久化\n`;
  report += `- [ ] 冷启动: 确认localStorage正常工作\n\n`;
  
  report += `### 提交建议\n`;
  report += `\`\`\`bash\n`;
  report += `# commit 1（样式）\n`;
  report += `git add src/app/globals.css\n`;
  report += `git commit -m "feat(theme): add dopamine theme tokens (light/dark) in globals.css"\n\n`;
  report += `# commit 2（逻辑）\n`;
  report += `git add src/contexts/ThemeContext.tsx src/components/ThemeToggle.tsx\n`;
  report += `git commit -m "feat(theme): register 'dopamine' in ThemeContext and ThemeToggle"\n`;
  report += `\`\`\`\n\n`;
  
  // 写入报告文件
  const reportPath = path.join(__dirname, 'DOPAMINE_THEME_TEST_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(report);
  console.log(`📄 详细报告已保存到: ${reportPath}\n`);
}

/**
 * 5. 主要执行流程
 */
function runTests() {
  validateStyles();
  validateComponents(); 
  validateContrast();
  generateReport();
  
  console.log('🎉 多巴胺主题测试验证完成！');
  console.log('');
  console.log('🚀 下一步操作:');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问 http://localhost:3000');
  console.log('3. 测试主题切换功能');
  console.log('4. 验证各组件的颜色显示');
  console.log('5. 测试localStorage持久化');
  console.log('6. 进行跨浏览器验证');
}

// 运行测试
runTests();
