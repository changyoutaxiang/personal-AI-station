#!/usr/bin/env node

/**
 * 端到端自动化测试脚本
 * 用于验证Digital Brain智能助理的核心功能
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// 测试配置
const TEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  testMessages: [
    '你好，这是一个测试消息',
    '请解释一下什么是人工智能',
    '写一首关于春天的短诗',
    '帮我总结一下前面的对话内容', // 测试上下文功能
  ],
  testModels: [
    'moonshotai/kimi-k2',
    'anthropic/claude-3-haiku',
    'openai/gpt-3.5-turbo'
  ]
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// HTTP客户端配置
const httpClient = axios.create({
  baseURL: API_URL,
  timeout: TEST_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// 记录测试结果
function recordTest(name, success, message, warning = false) {
  testResults.total++;
  const result = {
    name,
    success,
    message,
    warning,
    timestamp: new Date().toISOString()
  };
  
  if (success) {
    testResults.passed++;
    logSuccess(`${name}: ${message}`);
  } else if (warning) {
    testResults.warnings++;
    logWarning(`${name}: ${message}`);
  } else {
    testResults.failed++;
    logError(`${name}: ${message}`);
  }
  
  testResults.tests.push(result);
}

// 基础连接测试
async function testBasicConnectivity() {
  log('\n=== 基础连接测试 ===', 'cyan');
  
  try {
    // 测试主页面访问
    const response = await axios.get(`${BASE_URL}/agent`, { timeout: 10000 });
    if (response.status === 200) {
      recordTest('页面访问', true, `主页面正常访问 (${response.status})`);
    } else {
      recordTest('页面访问', false, `页面访问异常: HTTP ${response.status}`);
    }
  } catch (error) {
    recordTest('页面访问', false, `页面访问失败: ${error.message}`);
  }
  
  // 测试API端点
  try {
    const response = await httpClient.get('/agent/conversations');
    recordTest('API连接', true, 'API端点正常响应');
  } catch (error) {
    recordTest('API连接', false, `API连接失败: ${error.message}`);
  }
}

// 环境配置检查
async function testEnvironmentConfig() {
  log('\n=== 环境配置检查 ===', 'cyan');
  
  // 检查OPENROUTER_API_KEY
  if (process.env.OPENROUTER_API_KEY) {
    recordTest('API密钥配置', true, 'OPENROUTER_API_KEY已配置');
  } else {
    recordTest('API密钥配置', false, 'OPENROUTER_API_KEY未配置', true);
  }
  
  // 检查数据库文件
  const dbPath = path.join(__dirname, 'data', 'digital-brain.db');
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    recordTest('数据库文件', true, `数据库文件存在 (${(stats.size / 1024).toFixed(2)}KB)`);
  } else {
    recordTest('数据库文件', false, '数据库文件不存在');
  }
  
  // 检查模型可用性
  try {
    const response = await httpClient.get('/models');
    const models = response.data;
    if (Array.isArray(models) && models.length > 0) {
      recordTest('模型列表', true, `找到 ${models.length} 个可用模型`);
    } else {
      recordTest('模型列表', false, '未找到可用模型');
    }
  } catch (error) {
    recordTest('模型列表', false, `获取模型列表失败: ${error.message}`);
  }
}

// 基础聊天功能测试
async function testBasicChatFunctionality() {
  log('\n=== 基础聊天功能测试 ===', 'cyan');
  
  let conversationId = null;
  
  // 测试创建新会话和发送消息
  for (const [index, message] of TEST_CONFIG.testMessages.entries()) {
    try {
      logInfo(`测试消息 ${index + 1}: ${message.substring(0, 30)}...`);
      
      const response = await httpClient.post('/agent/chat', {
        conversationId: conversationId,
        message: message,
        model: 'moonshotai/kimi-k2',
        historyLimit: 20
      });
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        conversationId = data.conversationId;
        
        recordTest(`消息发送-${index + 1}`, true, 
          `消息发送成功，收到回复 (${data.assistant.content.length}字符)`);
          
        // 验证响应内容
        if (data.assistant.content && data.assistant.content.trim().length > 0) {
          recordTest(`回复内容-${index + 1}`, true, 'AI回复内容非空');
        } else {
          recordTest(`回复内容-${index + 1}`, false, 'AI回复内容为空');
        }
        
        // 测试Token使用情况
        if (data.assistant.tokensUsed > 0) {
          recordTest(`Token统计-${index + 1}`, true, `使用了 ${data.assistant.tokensUsed} tokens`);
        } else {
          recordTest(`Token统计-${index + 1}`, false, 'Token使用统计异常', true);
        }
        
        // 短暂延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } else {
        recordTest(`消息发送-${index + 1}`, false, '消息发送失败：响应格式异常');
      }
    } catch (error) {
      recordTest(`消息发送-${index + 1}`, false, `消息发送失败: ${error.message}`);
      
      // 如果是API密钥问题，跳出循环
      if (error.message.includes('unauthorized') || error.message.includes('API key')) {
        logError('检测到API密钥问题，跳过后续聊天测试');
        break;
      }
    }
  }
  
  // 返回conversationId用于后续测试
  return conversationId;
}

// 会话管理功能测试
async function testConversationManagement() {
  log('\n=== 会话管理功能测试 ===', 'cyan');
  
  try {
    // 获取会话列表
    const response = await httpClient.get('/agent/conversations');
    if (response.data && response.data.success) {
      const conversations = response.data.data;
      recordTest('会话列表获取', true, `获取到 ${conversations.length} 个会话`);
      
      if (conversations.length > 0) {
        const conversation = conversations[0];
        
        // 测试会话重命名
        const newTitle = `测试会话-${Date.now()}`;
        try {
          await httpClient.put(`/agent/conversations/${conversation.id}`, {
            title: newTitle
          });
          recordTest('会话重命名', true, '会话重命名成功');
        } catch (error) {
          recordTest('会话重命名', false, `会话重命名失败: ${error.message}`);
        }
        
        // 测试获取会话消息
        try {
          const messagesResponse = await httpClient.get(`/agent/messages?conversationId=${conversation.id}&limit=10`);
          if (messagesResponse.data && messagesResponse.data.success) {
            const messages = messagesResponse.data.data;
            recordTest('会话消息获取', true, `获取到 ${messages.length} 条消息`);
          } else {
            recordTest('会话消息获取', false, '获取会话消息失败');
          }
        } catch (error) {
          recordTest('会话消息获取', false, `获取会话消息失败: ${error.message}`);
        }
        
        // 测试会话导出
        try {
          const exportResponse = await httpClient.get(`/agent/conversations/${conversation.id}/export`);
          if (exportResponse.data) {
            recordTest('会话导出', true, '会话导出功能正常');
          } else {
            recordTest('会话导出', false, '会话导出失败');
          }
        } catch (error) {
          recordTest('会话导出', false, `会话导出失败: ${error.message}`);
        }
      }
    } else {
      recordTest('会话列表获取', false, '获取会话列表失败');
    }
  } catch (error) {
    recordTest('会话列表获取', false, `获取会话列表失败: ${error.message}`);
  }
}

// 模型切换测试
async function testModelSwitching() {
  log('\n=== 模型切换功能测试 ===', 'cyan');
  
  for (const model of TEST_CONFIG.testModels) {
    try {
      logInfo(`测试模型: ${model}`);
      
      const response = await httpClient.post('/agent/chat', {
        message: '请说一句话来测试这个模型',
        model: model
      });
      
      if (response.data && response.data.success) {
        recordTest(`模型-${model}`, true, '模型调用成功');
      } else {
        recordTest(`模型-${model}`, false, '模型调用失败');
      }
      
      // 延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('unavailable')) {
        recordTest(`模型-${model}`, false, '模型不可用', true);
      } else {
        recordTest(`模型-${model}`, false, `模型测试失败: ${error.message}`);
      }
    }
  }
}

// 异常场景测试
async function testErrorScenarios() {
  log('\n=== 异常场景测试 ===', 'cyan');
  
  // 测试空消息
  try {
    await httpClient.post('/agent/chat', {
      message: ''
    });
    recordTest('空消息验证', false, '空消息应该被拒绝');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      recordTest('空消息验证', true, '空消息正确被拒绝');
    } else {
      recordTest('空消息验证', false, `空消息处理异常: ${error.message}`);
    }
  }
  
  // 测试超长消息
  const longMessage = 'A'.repeat(10000);
  try {
    const response = await httpClient.post('/agent/chat', {
      message: longMessage
    });
    
    if (response.data && response.data.success) {
      recordTest('超长消息处理', true, '超长消息处理正常');
    } else {
      recordTest('超长消息处理', false, '超长消息处理失败');
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      recordTest('超长消息处理', true, '超长消息被正确限制');
    } else {
      recordTest('超长消息处理', false, `超长消息处理异常: ${error.message}`);
    }
  }
  
  // 测试无效模型
  try {
    await httpClient.post('/agent/chat', {
      message: '测试消息',
      model: 'invalid-model-name'
    });
    recordTest('无效模型处理', false, '无效模型应该被拒绝');
  } catch (error) {
    recordTest('无效模型处理', true, '无效模型被正确拒绝');
  }
}

// 标签管理测试
async function testTagManagement() {
  log('\n=== 标签管理测试 ===', 'cyan');
  
  try {
    // 获取标签列表
    const response = await httpClient.get('/agent/tags');
    if (response.data && response.data.success) {
      recordTest('标签列表获取', true, `获取到 ${response.data.data.length} 个标签`);
    } else {
      recordTest('标签列表获取', false, '获取标签列表失败');
    }
  } catch (error) {
    recordTest('标签列表获取', false, `获取标签列表失败: ${error.message}`);
  }
}

// 性能测试（简化版）
async function testPerformance() {
  log('\n=== 性能测试 ===', 'cyan');
  
  // 测试API响应时间
  const startTime = Date.now();
  try {
    await httpClient.get('/agent/conversations');
    const responseTime = Date.now() - startTime;
    
    if (responseTime < 1000) {
      recordTest('API响应时间', true, `响应时间: ${responseTime}ms`);
    } else if (responseTime < 3000) {
      recordTest('API响应时间', true, `响应时间: ${responseTime}ms (可接受)`, true);
    } else {
      recordTest('API响应时间', false, `响应时间: ${responseTime}ms (过慢)`);
    }
  } catch (error) {
    recordTest('API响应时间', false, `性能测试失败: ${error.message}`);
  }
}

// 生成测试报告
function generateTestReport() {
  log('\n=== 测试结果报告 ===', 'cyan');
  
  const passRate = testResults.total > 0 ? 
    ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
  
  log(`总测试数: ${testResults.total}`, 'bright');
  log(`通过: ${testResults.passed}`, 'green');
  log(`失败: ${testResults.failed}`, 'red');
  log(`警告: ${testResults.warnings}`, 'yellow');
  log(`通过率: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  // 保存详细报告到文件
  const reportPath = path.join(__dirname, 'test-results.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      warnings: testResults.warnings,
      passRate: parseFloat(passRate)
    },
    tests: testResults.tests,
    environment: {
      nodeVersion: process.version,
      baseUrl: BASE_URL,
      hasApiKey: !!process.env.OPENROUTER_API_KEY
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n详细报告已保存到: ${reportPath}`, 'blue');
  
  // 判断整体测试结果
  if (testResults.failed === 0 && parseFloat(passRate) >= 90) {
    log('\n🎉 所有关键测试通过！系统准备就绪。', 'green');
    return 0;
  } else if (testResults.failed <= 2 && parseFloat(passRate) >= 70) {
    log('\n⚠️  大部分测试通过，但有一些问题需要关注。', 'yellow');
    return 1;
  } else {
    log('\n🚨 测试失败较多，系统可能存在严重问题。', 'red');
    return 2;
  }
}

// 主测试函数
async function runAllTests() {
  log('🚀 开始执行端到端测试...', 'cyan');
  log(`测试目标: ${BASE_URL}`, 'blue');
  
  try {
    await testBasicConnectivity();
    await testEnvironmentConfig();
    await testBasicChatFunctionality();
    await testConversationManagement();
    await testModelSwitching();
    await testErrorScenarios();
    await testTagManagement();
    await testPerformance();
  } catch (error) {
    logError(`测试执行异常: ${error.message}`);
  }
  
  return generateTestReport();
}

// 执行测试
if (require.main === module) {
  runAllTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      logError(`测试执行失败: ${error.message}`);
      process.exit(3);
    });
}

module.exports = {
  runAllTests,
  testResults
};
