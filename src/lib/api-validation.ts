/**
 * API校验和统一错误处理中间件
 * 提供服务端校验、错误格式化和安全限制
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationSchema, validateObject, ValidationError } from './validation';

// 统一API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
  timestamp?: string;
  requestId?: string;
}

// 校验选项
export interface ValidationOptions {
  maxBodySize?: number; // 最大请求体大小（字节）
  requiredFields?: string[]; // 必填字段
  allowedFields?: string[]; // 允许的字段
  contentLimits?: {
    maxLength?: number; // 内容最大长度
    maxLines?: number; // 最大行数
  };
}

/**
 * 创建标准化API响应
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  errors?: ValidationError[]
): ApiResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(error && { error }),
    ...(errors && errors.length > 0 && { errors }),
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substring(2, 15)
  };
}

/**
 * 标准化错误响应
 */
export function createErrorResponse(
  error: string,
  status: number = 400,
  errors?: ValidationError[]
): NextResponse<ApiResponse> {
  return NextResponse.json(
    createApiResponse(false, undefined, error, errors),
    { status }
  );
}

/**
 * 标准化成功响应
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    createApiResponse(true, data),
    { status }
  );
}

/**
 * 请求体大小校验
 */
function validateRequestSize(request: NextRequest, maxSize: number): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSize) {
    return false;
  }
  return true;
}

/**
 * 内容长度和行数限制校验
 */
function validateContentLimits(
  content: string,
  limits: { maxLength?: number; maxLines?: number }
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (limits.maxLength && content.length > limits.maxLength) {
    errors.push({
      field: 'content',
      message: `内容长度不能超过 ${limits.maxLength} 个字符，当前 ${content.length} 个字符`
    });
  }
  
  if (limits.maxLines) {
    const lineCount = content.split('\n').length;
    if (lineCount > limits.maxLines) {
      errors.push({
        field: 'content',
        message: `内容行数不能超过 ${limits.maxLines} 行，当前 ${lineCount} 行`
      });
    }
  }
  
  return errors;
}

/**
 * 字段过滤（只保留允许的字段）
 */
function filterAllowedFields(data: Record<string, unknown>, allowedFields: string[]): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      filtered[field] = data[field];
    }
  }
  return filtered;
}

/**
 * API请求校验中间件
 */
export async function validateApiRequest(
  request: NextRequest,
  schema?: ValidationSchema,
  options?: ValidationOptions
): Promise<{
  valid: boolean;
  data?: Record<string, unknown>;
  errors?: ValidationError[];
  errorResponse?: NextResponse;
}> {
  try {
    // 检查请求大小
    const maxSize = options?.maxBodySize || 1024 * 1024; // 默认1MB
    if (!validateRequestSize(request, maxSize)) {
      return {
        valid: false,
        errorResponse: createErrorResponse('请求体过大', 413)
      };
    }

    // 解析请求体
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch (error) {
      return {
        valid: false,
        errorResponse: createErrorResponse('请求体格式错误，必须是有效的JSON', 400)
      };
    }

    // 字段过滤
    if (options?.allowedFields) {
      body = filterAllowedFields(body, options.allowedFields);
    }

    // 必填字段校验
    const errors: ValidationError[] = [];
    if (options?.requiredFields) {
      for (const field of options.requiredFields) {
        if (!body[field] || (typeof body[field] === 'string' && !body[field].toString().trim())) {
          errors.push({
            field,
            message: `${field} 是必填字段`
          });
        }
      }
    }

    // 使用ValidationSchema校验
    if (schema) {
      const schemaErrors = validateObject(body, schema);
      errors.push(...schemaErrors);
    }

    // 内容限制校验
    if (options?.contentLimits) {
      for (const [field, value] of Object.entries(body)) {
        if (typeof value === 'string' && (field.includes('content') || field.includes('message') || field.includes('prompt'))) {
          const contentErrors = validateContentLimits(value, options.contentLimits);
          errors.push(...contentErrors);
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        errorResponse: createErrorResponse('请求参数校验失败', 400, errors)
      };
    }

    return {
      valid: true,
      data: body
    };
  } catch (error) {
    return {
      valid: false,
      errorResponse: createErrorResponse('服务器内部错误', 500)
    };
  }
}

/**
 * API错误处理包装器
 */
export function withApiErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    console.error('API错误:', error);
    
    // 根据错误类型返回不同的响应
    if (error.name === 'AbortError') {
      return createErrorResponse('请求超时', 408);
    }
    
    if (error.message.includes('验证失败')) {
      return createErrorResponse(error.message, 400);
    }
    
    if (error.message.includes('未授权')) {
      return createErrorResponse('未授权访问', 401);
    }
    
    if (error.message.includes('禁止访问')) {
      return createErrorResponse('权限不足', 403);
    }
    
    if (error.message.includes('不存在')) {
      return createErrorResponse('资源不存在', 404);
    }
    
    return createErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? '服务器内部错误' 
        : error.message,
      500
    );
  });
}

/**
 * 防止提示词注入的内容清理
 */
export function sanitizePromptContent(content: string): string {
  // 移除可能的指令注入
  const dangerousPatterns = [
    /ignore\s+previous\s+instructions/gi,
    /forget\s+everything/gi,
    /you\s+are\s+now/gi,
    /new\s+role\s*:/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /重新定义/gi,
    /忽略.*指令/gi,
    /你现在是/gi,
    /扮演.*角色/gi,
  ];
  
  let cleaned = content;
  for (const pattern of dangerousPatterns) {
    cleaned = cleaned.replace(pattern, '[已过滤]');
  }
  
  return cleaned;
}

/**
 * 内容安全检查
 */
export function isContentSafe(content: string): { safe: boolean; reason?: string } {
  // 检查是否包含敏感信息模式
  const sensitivePatterns = [
    /\b\d{4}\s*-\s*\d{4}\s*-\s*\d{4}\s*-\s*\d{4}\b/, // 信用卡号
    /\b\d{15,19}\b/, // 可能的信用卡号
    /password\s*[=:]\s*\S+/gi, // 密码
    /token\s*[=:]\s*\S+/gi, // token
    /api[_-]?key\s*[=:]\s*\S+/gi, // API key
  ];
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(content)) {
      return { safe: false, reason: '内容可能包含敏感信息' };
    }
  }
  
  // 检查异常长的单词（可能是攻击载荷）
  const words = content.split(/\s+/);
  for (const word of words) {
    if (word.length > 200) {
      return { safe: false, reason: '内容包含异常长的字符串' };
    }
  }
  
  return { safe: true };
}
