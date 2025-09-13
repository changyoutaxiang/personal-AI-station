import { NextResponse } from 'next/server';

// GET /api/agent/test - 测试 OpenRouter API 连接
export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    // 检查 API Key 配置
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        status: 'not_configured',
        error: {
          message: 'API Key 未配置',
          solution: '请在 .env.local 文件中设置 OPENROUTER_API_KEY'
        }
      }, { status: 500 });
    }

    // 测试 API 连接
    const testMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Reply with a single word: "OK"'
      },
      {
        role: 'user',
        content: 'Test'
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'Super Assistant Test'
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: testMessages,
        stream: false,
        max_tokens: 10,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorInfo;

      try {
        errorInfo = JSON.parse(errorText);
      } catch {
        errorInfo = { message: errorText };
      }

      // 解析错误类型
      let errorType = 'unknown';
      let solution = '请检查控制台日志';

      if (response.status === 401) {
        errorType = 'auth_failed';
        solution = 'API Key 无效，请检查是否正确配置';
      } else if (response.status === 429) {
        errorType = 'rate_limit';
        solution = '超出速率限制，请稍后再试';
      } else if (response.status >= 500) {
        errorType = 'service_error';
        solution = 'OpenRouter 服务异常，请稍后再试';
      }

      return NextResponse.json({
        success: false,
        status: errorType,
        error: {
          message: `API 测试失败 (${response.status})`,
          details: errorInfo,
          solution: solution
        }
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'OpenRouter API 连接正常',
      model: data.model || process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
      test_response: data.choices?.[0]?.message?.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('API 测试失败:', error);

    let errorMessage = 'API 测试失败';
    let errorType = 'network_error';
    let solution = '请检查网络连接';

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = '无法连接到 OpenRouter';
        solution = '请检查网络连接或防火墙设置';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'DNS 解析失败';
        solution = '请检查 DNS 设置或网络连接';
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = '连接超时';
        solution = '请检查网络速度或稍后再试';
      }
    }

    return NextResponse.json({
      success: false,
      status: errorType,
      error: {
        message: errorMessage,
        details: error instanceof Error ? error.message : '未知错误',
        solution: solution
      }
    }, { status: 500 });
  }
}