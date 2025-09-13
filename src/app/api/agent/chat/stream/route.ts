import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 创建 SSE (Server-Sent Events) 响应
function createSSEResponse(stream: ReadableStream) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// 调用 OpenRouter API 获取流式响应
async function callOpenRouterAPI(
  messages: Array<{ role: string; content: string }>,
  model: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  assistantMessageId: number,
  actualConversationId: number
) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  // 使用默认模型如果没有指定
  const selectedModel = model || 'anthropic/claude-3.5-sonnet';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'Super Assistant AI Agent'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error:', errorText);
      throw new Error(`OpenRouter API returned ${response.status}: ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body from OpenRouter');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;

          if (delta) {
            fullContent += delta;

            // 发送增量内容（前端期望的格式）
            const chunkData = {
              type: 'chunk',
              content: delta
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
          }
        } catch (e) {
          console.warn('Failed to parse SSE data:', e);
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('OpenRouter API call failed:', error);
    // 不返回降级响应，直接抛出错误让调用方处理
    throw error;
  }
}

// POST /api/agent/chat/stream - 流式聊天API
export async function POST(request: Request) {
  try {
    // 首先验证 API 配置
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('OpenRouter API Key not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'AI 服务未配置',
            details: 'OpenRouter API Key 未设置',
            solution: '请在 .env.local 文件中配置 OPENROUTER_API_KEY',
            type: 'CONFIGURATION_ERROR'
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await request.json();
    const { message, conversationId, systemPrompt, model, historyLimit = 10 } = body;

    // 验证必需参数
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: '参数错误',
            details: '消息内容不能为空',
            type: 'VALIDATION_ERROR'
          }
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // 处理会话 ID
        let actualConversationId = conversationId;
        let userMessageId: number;
        let assistantMessageId: number;

        // 如果没有会话ID，创建新会话
        if (!actualConversationId) {
          const { data: newConversation, error: convError } = await supabase
            .from('agent_conversations')
            .insert({
              title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
              model: model || 'anthropic/claude-3.5-sonnet',
              system_prompt: systemPrompt || null
            })
            .select()
            .single();

          if (convError) {
            console.error('创建会话失败:', convError);
            const errorData = {
              type: 'error',
              error: {
                message: '创建会话失败',
                details: convError.message,
                solution: '请刷新页面重试'
              }
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          actualConversationId = newConversation.id;
        }

        // 保存用户消息到数据库
        const { data: userMsg, error: userMsgError } = await supabase
          .from('agent_messages')
          .insert({
            conversation_id: actualConversationId,
            role: 'user',
            content: message,
            model: null,
            tokens_used: null
          })
          .select()
          .single();

        if (userMsgError) {
          console.error('保存用户消息失败:', userMsgError);
        }
        userMessageId = userMsg?.id || Date.now();

        // 1. 发送初始化事件（前端期望的格式）
        const initData = {
          type: 'init',
          conversationId: actualConversationId,
          userMessage: {
            id: userMessageId,
            content: message,
            role: 'user'
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initData)}\n\n`));

        // 4. 构建消息历史（这里暂时只使用当前消息）
        const messages = [];

        // 添加系统提示（如果有）
        if (systemPrompt) {
          messages.push({
            role: 'system',
            content: systemPrompt
          });
        }

        // 添加用户消息
        messages.push({
          role: 'user',
          content: message
        });

        // 5. 调用 OpenRouter API 获取流式响应
        let fullContent = '';

        try {
          fullContent = await callOpenRouterAPI(
            messages,
            model,
            controller,
            encoder,
            assistantMessageId,
            actualConversationId
          );
        } catch (error) {
          console.error('Error calling OpenRouter:', error);

          // 构建详细的错误信息
          let errorMessage = 'AI 服务调用失败';
          let errorDetails = '';
          let solution = '';

          if (error instanceof Error) {
            if (error.message.includes('401')) {
              errorMessage = 'API 认证失败';
              errorDetails = 'OpenRouter API Key 无效或未配置';
              solution = '请检查 .env.local 文件中的 OPENROUTER_API_KEY 配置';
            } else if (error.message.includes('429')) {
              errorMessage = 'API 请求限制';
              errorDetails = '超出 OpenRouter API 速率限制';
              solution = '请稍后再试或升级 API 计划';
            } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
              errorMessage = 'OpenRouter 服务异常';
              errorDetails = 'OpenRouter 服务端错误';
              solution = '请稍后再试，或访问 https://openrouter.ai/status 查看服务状态';
            } else if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
              errorMessage = '网络连接失败';
              errorDetails = '无法连接到 OpenRouter API';
              solution = '请检查网络连接或代理设置';
            } else {
              errorDetails = error.message;
              solution = '请检查控制台日志获取更多信息';
            }
          }

          // 发送错误事件
          const errorData = {
            type: 'error',
            error: {
              message: errorMessage,
              details: errorDetails,
              solution: solution,
              timestamp: new Date().toISOString()
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));

          // 发送结束标记并关闭流
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          return;
        }

        // 保存助手回复到数据库
        const { data: assistantMsg, error: assistantMsgError } = await supabase
          .from('agent_messages')
          .insert({
            conversation_id: actualConversationId,
            role: 'assistant',
            content: fullContent,
            model: model || 'anthropic/claude-3.5-sonnet',
            tokens_used: null
          })
          .select()
          .single();

        if (assistantMsgError) {
          console.error('保存助手消息失败:', assistantMsgError);
        }
        assistantMessageId = assistantMsg?.id || Date.now() + 1;

        // 更新会话的 updated_at 时间
        await supabase
          .from('agent_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', actualConversationId);

        // 6. 发送完成事件（前端期望的格式）
        const finalData = {
          type: 'final',
          assistant: {
            id: assistantMessageId,
            content: fullContent,
            tokensUsed: 0 // 这里暂时不统计 token
          }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));

        // 7. 发送结束标记
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));

        // 关闭流
        controller.close();
      },
    });

    return createSSEResponse(stream);
  } catch (error) {
    console.error('流式聊天失败:', error);
    return NextResponse.json({
      success: false,
      error: '聊天服务暂时不可用'
    }, { status: 500 });
  }
}