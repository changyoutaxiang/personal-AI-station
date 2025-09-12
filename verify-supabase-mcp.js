#!/usr/bin/env node

/**
 * Supabase MCP 连接验证脚本
 * 
 * 此脚本用于验证 Supabase MCP 服务器配置是否正确
 * 运行: node verify-supabase-mcp.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

console.log(colors.cyan('🚀 Supabase MCP 连接验证开始...\n'));

async function verifyEnvironment() {
  console.log(colors.blue('📋 1. 检查环境配置...'));
  
  // 检查 .env.local 文件
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log(colors.red('❌ 未找到 .env.local 文件'));
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 检查必要的环境变量
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_ACCESS_TOKEN'
  ];
  
  let allFound = true;
  for (const varName of requiredVars) {
    if (envContent.includes(varName)) {
      console.log(colors.green(`   ✅ ${varName} 已配置`));
    } else {
      console.log(colors.red(`   ❌ ${varName} 未找到`));
      allFound = false;
    }
  }
  
  return allFound;
}

async function verifyMcpConfig() {
  console.log(colors.blue('\n📋 2. 检查 MCP 配置文件...'));
  
  const mcpPath = path.join(__dirname, 'mcp.json');
  if (!fs.existsSync(mcpPath)) {
    console.log(colors.red('❌ 未找到 mcp.json 文件'));
    return false;
  }
  
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
    
    if (mcpConfig.mcpServers && mcpConfig.mcpServers.supabase) {
      console.log(colors.green('   ✅ Supabase MCP 服务器已配置'));
      
      const supabaseConfig = mcpConfig.mcpServers.supabase;
      
      // 检查必要的配置项
      if (supabaseConfig.command === 'npx') {
        console.log(colors.green('   ✅ 命令配置正确'));
      }
      
      if (supabaseConfig.args && supabaseConfig.args.includes('--read-only')) {
        console.log(colors.green('   ✅ 只读模式已启用'));
      }
      
      const projectRefArg = supabaseConfig.args?.find(arg => arg.startsWith('--project-ref='));
      if (projectRefArg) {
        console.log(colors.green(`   ✅ 项目引用: ${projectRefArg.split('=')[1]}`));
      }
      
      if (supabaseConfig.env && supabaseConfig.env.SUPABASE_ACCESS_TOKEN) {
        const token = supabaseConfig.env.SUPABASE_ACCESS_TOKEN;
        if (token.startsWith('sbp_')) {
          console.log(colors.green('   ✅ 访问令牌格式正确'));
        } else {
          console.log(colors.red('   ❌ 访问令牌格式可能不正确'));
        }
      }
      
      return true;
    } else {
      console.log(colors.red('❌ MCP 配置中未找到 Supabase 服务器'));
      return false;
    }
  } catch (error) {
    console.log(colors.red(`❌ MCP 配置文件解析错误: ${error.message}`));
    return false;
  }
}

async function testMcpConnection() {
  console.log(colors.blue('\n📋 3. 测试 MCP 服务器连接...'));
  
  return new Promise((resolve) => {
    const env = { ...process.env };
    
    // 从 .env.local 加载环境变量
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            env[key.trim()] = value.trim();
          }
        }
      }
    }
    
    const mcpProcess = spawn('npx', [
      '@supabase/mcp-server-supabase@latest',
      '--read-only',
      '--project-ref=aswbgrymrcanzhvofghr'
    ], {
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let hasOutput = false;
    let errorOutput = '';
    
    mcpProcess.stdout.on('data', (data) => {
      hasOutput = true;
      console.log(colors.green('   ✅ MCP 服务器响应正常'));
    });
    
    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mcpProcess.on('close', (code) => {
      if (code === 0 || hasOutput) {
        console.log(colors.green('   ✅ MCP 服务器连接成功'));
        resolve(true);
      } else {
        console.log(colors.red(`   ❌ MCP 服务器连接失败 (退出码: ${code})`));
        if (errorOutput) {
          console.log(colors.red(`   错误详情: ${errorOutput}`));
        }
        resolve(false);
      }
    });
    
    mcpProcess.on('error', (error) => {
      console.log(colors.red(`   ❌ 启动 MCP 服务器时出错: ${error.message}`));
      resolve(false);
    });
    
    // 5秒超时
    setTimeout(() => {
      mcpProcess.kill();
      if (hasOutput) {
        console.log(colors.green('   ✅ MCP 服务器连接正常（超时但有响应）'));
        resolve(true);
      } else {
        console.log(colors.red('   ❌ MCP 服务器连接超时'));
        resolve(false);
      }
    }, 5000);
    
    // 发送一个简单的请求来测试连接
    setTimeout(() => {
      mcpProcess.stdin.write('{"jsonrpc":"2.0","method":"ping","id":1}\n');
    }, 1000);
  });
}

async function generateReport() {
  console.log(colors.blue('\n📋 4. 生成配置报告...'));
  
  const envPath = path.join(__dirname, '.env.local');
  const mcpPath = path.join(__dirname, 'mcp.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform
    },
    files: {
      envExists: fs.existsSync(envPath),
      mcpExists: fs.existsSync(mcpPath)
    }
  };
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    report.supabaseConfig = {
      hasUrl: envContent.includes('NEXT_PUBLIC_SUPABASE_URL'),
      hasAnonKey: envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      hasAccessToken: envContent.includes('SUPABASE_ACCESS_TOKEN'),
      databaseType: envContent.includes('DATABASE_TYPE=supabase') ? 'supabase' : 'sqlite'
    };
  }
  
  console.log(colors.cyan('\n📊 配置报告:'));
  console.log(JSON.stringify(report, null, 2));
}

// 主验证流程
async function main() {
  try {
    const envOk = await verifyEnvironment();
    const mcpOk = await verifyMcpConfig();
    const connectionOk = await testMcpConnection();
    
    await generateReport();
    
    console.log(colors.cyan('\n🎯 验证结果总结:'));
    console.log(`   环境配置: ${envOk ? colors.green('✅ 通过') : colors.red('❌ 失败')}`);
    console.log(`   MCP 配置: ${mcpOk ? colors.green('✅ 通过') : colors.red('❌ 失败')}`);
    console.log(`   连接测试: ${connectionOk ? colors.green('✅ 通过') : colors.red('❌ 失败')}`);
    
    if (envOk && mcpOk && connectionOk) {
      console.log(colors.green('\n🎉 Supabase MCP 配置完全正确！'));
      console.log(colors.yellow('💡 请重启 Claude Code 以加载新的 MCP 配置。'));
    } else {
      console.log(colors.red('\n❌ 配置存在问题，请检查上述错误信息。'));
    }
    
  } catch (error) {
    console.error(colors.red(`💥 验证过程中出错: ${error.message}`));
    process.exit(1);
  }
}

// 运行验证
main();