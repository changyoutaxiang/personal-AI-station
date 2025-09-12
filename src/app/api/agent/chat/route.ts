import { NextRequest } from 'next/server';
import { ServerDbController } from '@/lib/server-db-controller';
import { debug } from '@/lib/debug';
import { 
  validateApiRequest, 
  createErrorResponse, 
  createSuccessResponse, 
  sanitizePromptContent, 
  isContentSafe
  // withApiErrorHandling // TODO: 未使用，暂时注释
} from '@/lib/api-validation';
import { ValidationRules } from '@/lib/validation';
import { simpleChatCompletion } from '@/lib/openrouter-client';
import { getOpenRouterApiKey } from '@/lib/db';

// 聊天请求接口
interface ChatRequest {
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

    const body = validationResult.data as unknown as ChatRequest;
    
    // 内容安全检查
    const safetyCheck = isContentSafe(body.message);
    if (!safetyCheck.safe) {
      return createErrorResponse(`内容安全检查失败: ${safetyCheck.reason}`, 400);
    }

    // 清理和限制输入
    const cleanMessage = sanitizePromptContent(body.message.trim());
    const model = body.model || 'moonshotai/kimi-k2';
    const historyLimit = Math.min(body.historyLimit || 20, 50); // 限制历史消息数量
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
    
    // 添加历史消息（限制每条消息长度）
    for (const msg of historyMessages) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content.substring(0, 10000) // 限制历史消息长度
      });
    }
    
    // 添加用户新消息
    messages.push({ role: 'user', content: cleanMessage });

    // 获取API Key（优先数据库配置，其次环境变量）
    const dbApiKey = getOpenRouterApiKey();
    
    // 调用AI（使用新的安全客户端）
    debug.info('正在调用AI:', { 
      model, 
      messages_count: messages.length,
      conversation_id: conversationId,
      api_key_source: dbApiKey ? 'database' : 'environment'
    });
    
    const aiResponse = await simpleChatCompletion(
      model,
      messages,
      {
        apiKey: dbApiKey || undefined, // 传入数据库API Key，如果没有则fallback到环境变量
        timeout: 30000, // 30秒超时
        maxRetries: 2, // 最多重试2次
        temperature: 0.7,
        max_tokens: 2000
      }
    );
    
    debug.info('AI响应成功:', { 
      content_length: aiResponse.content.length, 
      tokens_used: aiResponse.tokensUsed 
    });

    // 保存消息到数据库
    const userMessage = await ServerDbController.createMessage({
      conversation_id: conversationId,
      role: 'user',
      content: body.message // 保存原始消息，不保存清理后的
    });

    const assistantMessage = await ServerDbController.createMessage({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse.content,
      tokens_used: aiResponse.tokensUsed
    });

    return createSuccessResponse({
      conversationId,
      userMessage: {
        id: userMessage.id,
        content: userMessage.content
      },
      assistant: {
        id: assistantMessage.id,
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed
      }
    });
  } catch (error) {
    console.error('Chat API 错误:', error);
    debug.error('Chat API 发生错误:', error);
    
    return createErrorResponse(
      error instanceof Error ? error.message : '未知错误',
      500
    );
  }
}
