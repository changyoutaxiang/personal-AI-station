import { NextRequest } from 'next/server';
import { ServerDbController } from '@/lib/server-db-controller';
import { debug } from '@/lib/debug';
import { 
  validateApiRequest, 
  sanitizePromptContent, 
  isContentSafe
} from '@/lib/api-validation';
import { ValidationRules } from '@/lib/validation';
import { streamChatCompletion } from '@/lib/openrouter-client';

// 聊天请求接口
interface StreamChatRequest {
  conversationId?: number;
  model?: string;
  systemPrompt?: string;
  message: string;
  historyLimit?: number;
}

export async function POST(request: NextRequest) {
  try {
    // API请求校验
    const validationResult = await validateApiRequest(
      request,
      {
        message: ValidationRules.required('消息内容不能为空'),
        model: ValidationRules.maxLength(50, '模型名称过长'),
        systemPrompt: ValidationRules.maxLength(2000, '系统提示过长'),
        historyLimit: ValidationRules.custom(
          (value) => !value || (typeof value === 'number' && value > 0 && value <= 50),
          '历史消息限制必须是1-50之间的数字'
        )
      },
      {
        maxBodySize: 50 * 1024, // 50KB
        requiredFields: ['message'],
        allowedFields: ['message', 'model', 'systemPrompt', 'conversationId', 'historyLimit'],
        contentLimits: {
          maxLength: 5000, // 消息最大5000字符
          maxLines: 100 // 最大100行
        }
      }
    );

    if (!validationResult.valid) {
      return validationResult.errorResponse!;
    }

    const body = validationResult.data as unknown as StreamChatRequest;
    
    // 内容安全检查
    const safetyCheck = isContentSafe(body.message);
    if (!safetyCheck.safe) {
      return new Response(`内容安全检查失败: ${safetyCheck.reason}`, { status: 400 });
    }

    // 清理和限制输入
    const cleanMessage = sanitizePromptContent(body.message.trim());
    const model = body.model || 'moonshotai/kimi-k2';
    const historyLimit = Math.min(body.historyLimit || 20, 50);
    let conversationId = body.conversationId;

    // 创建新会话逻辑
    if (!conversationId) {
      debug.info('创建新会话...');
      let title = cleanMessage.replace(/\s+/g, ' ');
      
      if (title.length > 30) {
        const sentenceEnd = title.substring(0, 30).match(/.*[。？！.?!]/);
        if (sentenceEnd) {
          title = sentenceEnd[0];
        } else {
          const commaEnd = title.substring(0, 30).match(/.*[，,]/);
          if (commaEnd) {
            title = commaEnd[0];
          } else {
            title = title.substring(0, 25) + '...';
          }
        }
      }
      
      let systemPrompt = body.systemPrompt;
      if (!systemPrompt) {
        try {
          const templates = await ServerDbController.listPromptTemplates();
          const defaultTemplate = templates.find(t => t.name === '通用中文助理') || templates[0];
          systemPrompt = defaultTemplate?.content || '你是一个友善、专业的中文AI助理。';
        } catch (error) {
          debug.warn('获取默认模板失败:', error);
          systemPrompt = '你是一个友善、专业的中文AI助理。';
        }
      }

      // 清理系统提示词
      if (systemPrompt) {
        systemPrompt = sanitizePromptContent(systemPrompt).substring(0, 2000);
      }

      debug.info('正在创建会话:', { title, model_name: model, system_prompt_length: systemPrompt?.length });
      const conversation = await ServerDbController.createConversation({
        title,
        model_name: model,
        system_prompt: systemPrompt
      });
      
      conversationId = conversation.id;
      debug.info('会话创建成功, ID:', conversationId);
    }

    // 获取并构建消息历史
    const historyMessages = await ServerDbController.listMessagesByConversation(conversationId, historyLimit);
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [];
    
    // 添加系统提示
    if (body.systemPrompt || historyMessages.length === 0) {
      const conversation = await ServerDbController.getConversationById(conversationId);
      const systemPrompt = body.systemPrompt || conversation?.system_prompt;
      if (systemPrompt) {
        const cleanSystemPrompt = sanitizePromptContent(systemPrompt).substring(0, 2000);
        messages.push({ role: 'system', content: cleanSystemPrompt });
      }
    }
    
    // 添加历史消息
    for (const msg of historyMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.substring(0, 10000)
      });
    }
    
    // 添加用户新消息
    messages.push({ role: 'user', content: cleanMessage });

    // 先保存用户消息
    const userMessage = await ServerDbController.createMessage({
      conversation_id: conversationId,
      role: 'user',
      content: body.message
    });

    debug.info('正在调用流式AI:', { 
      model, 
      messages_count: messages.length,
      conversation_id: conversationId
    });

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullContent = '';
        let totalTokens = 0;

        try {
          // 发送初始响应数据（会话信息和用户消息）
          const initialData = {
            type: 'init',
            conversationId,
            userMessage: {
              id: userMessage.id,
              content: userMessage.content
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

          // 开始流式AI调用
          await streamChatCompletion(
            model,
            messages,
            (chunk: string, done: boolean) => {
              if (done) {
                // 流式完成，发送完成信号
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              } else {
                // 发送内容块
                fullContent += chunk;
                const chunkData = {
                  type: 'chunk',
                  content: chunk
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
              }
            },
            {
              temperature: 0.7,
              max_tokens: 2000,
              timeout: 30000
            }
          ).then(async (result) => {
            totalTokens = result.totalTokens;
            
            // 保存AI回复消息
            const assistantMessage = await ServerDbController.createMessage({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullContent,
              tokens_used: totalTokens
            });

            // 发送最终响应数据
            const finalData = {
              type: 'final',
              assistant: {
                id: assistantMessage.id,
                content: fullContent,
                tokensUsed: totalTokens
              }
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
            
            debug.info('流式AI响应完成:', { 
              content_length: fullContent.length, 
              tokens_used: totalTokens 
            });
            
            controller.close();
          });
          
        } catch (error) {
          console.error('流式AI调用失败:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : '未知错误'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('流式聊天API错误:', error);
    debug.error('流式聊天API发生错误:', error);
    
    return new Response(
      error instanceof Error ? error.message : '未知错误',
      { status: 500 }
    );
  }
}
