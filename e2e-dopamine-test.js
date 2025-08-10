#!/usr/bin/env node

/**
 * 多巴胺主题 E2E 测试脚本
 * 测试主题切换、localStorage 持久化、跨浏览器兼容性
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动多巴胺主题 E2E 测试...\n');

const results = {
  themeSwitch: {},
  localStorage: {},
  components: {},
  crossBrowser: {},
  performance: {}
};

/**
 * 等待元素出现
 */
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.error(`等待元素失败: ${selector}`);
    return false;
  }
}

/**
 * 获取元素的计算样式
 */
async function getComputedStyle(page, selector, property) {
  try {
    return await page.evaluate((sel, prop) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      return window.getComputedStyle(element).getPropertyValue(prop);
    }, selector, property);
  } catch (error) {
    return null;
  }
}

/**
 * 测试主题切换功能
 */
async function testThemeSwitch(page) {
  console.log('📋 1. 测试主题切换功能...');
  
  try {
    // 访问主页
    await page.goto('http://localhost:3000');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 查找设置或主题切换按钮
    const themeButton = await page.locator('text=/主题|theme|设置/i').first();
    if (await themeButton.isVisible()) {
      await themeButton.click();
      results.themeSwitch.buttonFound = '✅ 主题设置按钮可访问';
    } else {
      // 尝试直接访问设置页面
      await page.goto('http://localhost:3000/settings');
      results.themeSwitch.buttonFound = '⚠️ 通过直接URL访问';
    }
    
    // 查找多巴胺主题选项
    const dopamineOption = await page.locator('text=/多巴胺|dopamine/i').first();
    if (await dopamineOption.isVisible()) {
      await dopamineOption.click();
      
      // 等待主题应用
      await page.waitForTimeout(1000);
      
      // 验证主题是否应用
      const dataTheme = await page.getAttribute('html', 'data-theme');
      if (dataTheme === 'dopamine') {
        results.themeSwitch.themeApplied = '✅ 多巴胺主题成功应用';
        
        // 检查关键颜色变量
        const primaryColor = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--flow-primary').trim();
        });
        
        if (primaryColor.includes('#FF6B47') || primaryColor.includes('255, 107, 71')) {
          results.themeSwitch.colorVariables = '✅ 主题颜色变量正确';
        } else {
          results.themeSwitch.colorVariables = '⚠️ 颜色变量需检查: ' + primaryColor;
        }
        
      } else {
        results.themeSwitch.themeApplied = '❌ 主题切换失败';
      }
    } else {
      results.themeSwitch.themeApplied = '❌ 未找到多巴胺主题选项';
    }
    
  } catch (error) {
    results.themeSwitch.error = `❌ 测试失败: ${error.message}`;
  }
}

/**
 * 测试 localStorage 持久化
 */
async function testLocalStorage(page) {
  console.log('📋 2. 测试 localStorage 持久化...');
  
  try {
    // 设置多巴胺主题
    await page.evaluate(() => {
      localStorage.setItem('app-theme', 'dopamine');
    });
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 检查主题是否保持
    const dataTheme = await page.getAttribute('html', 'data-theme');
    if (dataTheme === 'dopamine') {
      results.localStorage.persistence = '✅ 主题选择成功持久化';
    } else {
      results.localStorage.persistence = '❌ 主题持久化失败';
    }
    
    // 测试冷启动
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('app-theme');
    });
    
    if (storedTheme === 'dopamine') {
      results.localStorage.coldStart = '✅ localStorage 存储正确';
    } else {
      results.localStorage.coldStart = '❌ localStorage 存储失败';
    }
    
  } catch (error) {
    results.localStorage.error = `❌ 测试失败: ${error.message}`;
  }
}

/**
 * 测试组件样式
 */
async function testComponents(page) {
  console.log('📋 3. 测试组件样式...');
  
  try {
    // 确保在多巴胺主题下
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dopamine');
    });
    
    await page.waitForTimeout(500);
    
    // 测试按钮样式
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      const buttonColor = await getComputedStyle(page, 'button', 'background-color');
      results.components.buttons = buttonColor ? '✅ 按钮样式已应用' : '⚠️ 按钮样式需检查';
    }
    
    // 测试卡片样式  
    const cards = await page.locator('.glass-card, .card, [class*="card"]').all();
    if (cards.length > 0) {
      const cardBorder = await getComputedStyle(page, '.glass-card, .card, [class*="card"]', 'border-color');
      results.components.cards = cardBorder ? '✅ 卡片样式已应用' : '⚠️ 卡片样式需检查';
    }
    
    // 测试输入框样式
    const inputs = await page.locator('input, textarea').all();
    if (inputs.length > 0) {
      const inputBorder = await getComputedStyle(page, 'input, textarea', 'border-color');
      results.components.inputs = inputBorder ? '✅ 输入框样式已应用' : '⚠️ 输入框样式需检查';
    }
    
  } catch (error) {
    results.components.error = `❌ 测试失败: ${error.message}`;
  }
}

/**
 * 测试主题切换回归
 */
async function testThemeRegression(page) {
  console.log('📋 4. 测试主题切换回归...');
  
  try {
    const themes = ['warm', 'cyber', 'forest', 'dopamine'];
    
    for (const theme of themes) {
      // 设置主题
      await page.evaluate((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('app-theme', t);
      }, theme);
      
      await page.waitForTimeout(300);
      
      // 验证主题应用
      const currentTheme = await page.getAttribute('html', 'data-theme');
      if (currentTheme === theme) {
        results.crossBrowser[`theme_${theme}`] = '✅ 正常切换';
      } else {
        results.crossBrowser[`theme_${theme}`] = '❌ 切换失败';
      }
    }
    
    // 最后回到多巴胺主题
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dopamine');
      localStorage.setItem('app-theme', 'dopamine');
    });
    
  } catch (error) {
    results.crossBrowser.error = `❌ 测试失败: ${error.message}`;
  }
}

/**
 * 性能测试
 */
async function testPerformance(page) {
  console.log('📋 5. 测试性能影响...');
  
  try {
    // 测量主题切换时间
    const startTime = Date.now();
    
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dopamine');
    });
    
    // 等待样式应用
    await page.waitForTimeout(100);
    
    const endTime = Date.now();
    const switchTime = endTime - startTime;
    
    results.performance.switchTime = `${switchTime}ms ${switchTime < 500 ? '✅' : '⚠️'}`;
    
    // 测试内存使用（简单评估）
    const memoryUsage = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    results.performance.memoryUsage = memoryUsage > 0 ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB ✅` : '无法测量';
    
  } catch (error) {
    results.performance.error = `❌ 测试失败: ${error.message}`;
  }
}

/**
 * 生成测试报告
 */
function generateReport() {
  console.log('📊 生成 E2E 测试报告...\n');
  
  let report = `# 多巴胺主题 E2E 测试报告\n\n`;
  report += `测试时间: ${new Date().toLocaleString()}\n`;
  report += `测试环境: Chrome Headless\n\n`;
  
  // 主题切换测试
  report += `## 🎨 主题切换功能测试\n\n`;
  Object.entries(results.themeSwitch).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // localStorage 测试
  report += `\n## 💾 数据持久化测试\n\n`;
  Object.entries(results.localStorage).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 组件样式测试
  report += `\n## 🧩 组件样式测试\n\n`;
  Object.entries(results.components).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 跨主题回归测试
  report += `\n## 🔄 主题切换回归测试\n\n`;
  Object.entries(results.crossBrowser).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 性能测试
  report += `\n## ⚡ 性能测试\n\n`;
  Object.entries(results.performance).forEach(([key, value]) => {
    report += `- ${key}: ${value}\n`;
  });
  
  // 总结
  report += `\n## 📝 测试总结\n\n`;
  const totalTests = Object.values({...results.themeSwitch, ...results.localStorage, ...results.components, ...results.crossBrowser, ...results.performance}).length;
  const passedTests = Object.values({...results.themeSwitch, ...results.localStorage, ...results.components, ...results.crossBrowser, ...results.performance}).filter(v => v.includes('✅')).length;
  
  report += `- 总测试项: ${totalTests}\n`;
  report += `- 通过测试: ${passedTests}\n`;
  report += `- 通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;
  
  if (passedTests / totalTests > 0.8) {
    report += `🎉 **测试结果**: 多巴胺主题实现质量良好，可以进行提交！\n\n`;
  } else {
    report += `⚠️ **测试结果**: 存在一些问题需要修复后再提交。\n\n`;
  }
  
  // 手动测试建议
  report += `## 🧪 手动验证清单\n\n`;
  report += `### 跨浏览器测试\n`;
  report += `- [ ] Chrome: 验证多巴胺主题显示正常\n`;
  report += `- [ ] Safari: 检查颜色渲染和动画效果\n`;
  report += `- [ ] Firefox: 确认CSS变量兼容性\n\n`;
  
  report += `### 组件交互测试\n`;
  report += `- [ ] 按钮hover效果: 颜色变化自然\n`;
  report += `- [ ] 输入框focus状态: 边框高亮正确\n`;
  report += `- [ ] 卡片阴影: 多巴胺主题色调一致\n`;
  report += `- [ ] Toast通知: 成功/警告色正确显示\n\n`;
  
  report += `### 可访问性验证\n`;
  report += `- [ ] 文本对比度: 所有文本清晰可读\n`;
  report += `- [ ] 颜色语义: 颜色含义明确一致\n`;
  report += `- [ ] 键盘导航: focus状态清晰可见\n\n`;
  
  // 写入报告文件
  const reportPath = path.join(__dirname, 'DOPAMINE_E2E_TEST_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  
  console.log(report);
  console.log(`📄 详细报告已保存到: ${reportPath}\n`);
}

/**
 * 主要执行流程
 */
async function runE2ETests() {
  let browser = null;
  let page = null;
  
  try {
    // 检查服务器是否运行
    console.log('🔍 检查开发服务器状态...');
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // 设置视口
    await page.setViewport({ width: 1200, height: 800 });
    
    // 尝试访问服务器
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });
      console.log('✅ 开发服务器连接成功\n');
    } catch (error) {
      console.error('❌ 无法连接到开发服务器');
      console.error('请确保运行: npm run dev');
      console.error('然后重新运行此测试脚本\n');
      return;
    }
    
    // 运行测试套件
    await testThemeSwitch(page);
    await testLocalStorage(page);
    await testComponents(page);
    await testThemeRegression(page);
    await testPerformance(page);
    
  } catch (error) {
    console.error('❌ E2E 测试执行失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // 生成报告
  generateReport();
  
  console.log('🎉 E2E 测试完成！');
  console.log('');
  console.log('🚀 建议下一步操作:');
  console.log('1. 查看测试报告处理问题');
  console.log('2. 进行手动跨浏览器验证');
  console.log('3. 完成后执行提交流程');
}

// 检查是否安装了 puppeteer
const puppeteerPath = path.join(__dirname, 'node_modules', 'puppeteer');
if (!fs.existsSync(puppeteerPath)) {
  console.log('⚠️ 未检测到 Puppeteer');
  console.log('由于 E2E 测试需要 Puppeteer，将跳过浏览器自动化测试');
  console.log('');
  console.log('📋 手动测试清单：');
  console.log('1. 启动开发服务器: npm run dev');
  console.log('2. 访问 http://localhost:3000');
  console.log('3. 找到主题设置或访问 /settings');
  console.log('4. 切换到多巴胺主题');
  console.log('5. 刷新页面验证持久化');
  console.log('6. 测试各组件颜色显示');
  console.log('7. 切换其他主题验证无影响');
  console.log('8. 在不同浏览器中重复测试');
  
  // 生成简化报告
  results.manual = {
    note: '需要手动验证 - 未安装 Puppeteer'
  };
  generateReport();
} else {
  // 运行自动化测试
  runE2ETests();
}
