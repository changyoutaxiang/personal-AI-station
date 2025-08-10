/**
 * 统一输入验证工具
 * 提供标准化的数据验证、错误提示和格式化功能
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 验证单个值
 */
export function validateValue(value: unknown, rule: ValidationRule): string | null {
  const { required, minLength, maxLength, pattern, custom, message } = rule;

  // 必填验证
  if (required && (value === null || value === undefined || value === '')) {
    return message || '此字段为必填项';
  }

  // 如果不是必填且为空，跳过其他验证
  if (!required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // 字符串长度验证
  if (typeof value === 'string') {
    if (minLength && value.length < minLength) {
      return message || `最少需要 ${minLength} 个字符`;
    }

    if (maxLength && value.length > maxLength) {
      return message || `最多允许 ${maxLength} 个字符`;
    }
  }

  // 正则表达式验证
  if (pattern && typeof value === 'string') {
    if (!pattern.test(value)) {
      return message || '格式不正确';
    }
  }

  // 自定义验证
  if (custom) {
    const customResult = custom(value);
    if (customResult !== true) {
      return customResult || message || '验证失败';
    }
  }

  return null;
}

/**
 * 验证整个对象
 */
export function validateObject(data: unknown, schema: ValidationSchema): ValidationError[] {
  const errors: ValidationError[] = [];
  const dataObj = data as Record<string, unknown>;

  for (const [field, rule] of Object.entries(schema)) {
    const error = validateValue(dataObj[field], rule);
    if (error) {
      errors.push({ field, message: error });
    }
  }

  return errors;
}

/**
 * 验证表单数据
 */
export function validateForm(data: unknown, schema: ValidationSchema): {
  isValid: boolean;
  errors: ValidationError[];
  errorMap: Record<string, string>;
} {
  const errors = validateObject(data, schema);
  const errorMap: Record<string, string> = {};

  errors.forEach(error => {
    errorMap[error.field] = error.message;
  });

  return {
    isValid: errors.length === 0,
    errors,
    errorMap
  };
}

/**
 * 常用验证规则
 */
export const ValidationRules = {
  // 必填
  required: (message?: string): ValidationRule => ({
    required: true,
    message
  }),

  // 邮箱
  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || '请输入有效的邮箱地址'
  }),

  // 手机号
  phone: (message?: string): ValidationRule => ({
    pattern: /^1[3-9]\d{9}$/,
    message: message || '请输入有效的手机号码'
  }),

  // URL
  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || '请输入有效的URL地址'
  }),

  // 数字
  number: (message?: string): ValidationRule => ({
    pattern: /^\d+$/,
    message: message || '请输入有效的数字'
  }),

  // 字符串长度
  length: (min: number, max: number, message?: string): ValidationRule => ({
    minLength: min,
    maxLength: max,
    message: message || `长度需要在 ${min} 到 ${max} 个字符之间`
  }),

  // 最小长度
  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `最少需要 ${min} 个字符`
  }),

  // 最大长度
  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `最多允许 ${max} 个字符`
  }),

  // 自定义正则
  pattern: (regex: RegExp, message?: string): ValidationRule => ({
    pattern: regex,
    message
  }),

  // 自定义验证
  custom: (validator: (value: unknown) => boolean | string, message?: string): ValidationRule => ({
    custom: validator,
    message
  })
};

/**
 * 常用验证模式
 */
export const ValidationSchemas = {
  // 用户注册
  userRegistration: {
    username: ValidationRules.required('用户名不能为空'),
    email: ValidationRules.email(),
    password: ValidationRules.length(6, 20, '密码长度需要在6-20个字符之间'),
    phone: ValidationRules.phone()
  },

  // 记录创建
  entryCreate: {
    content: ValidationRules.required('内容不能为空'),
    project_tag: ValidationRules.maxLength(50, '项目标签最多50个字符'),
    attribute_tag: ValidationRules.maxLength(50, '属性标签最多50个字符')
  },

  // 待办事项
  todoCreate: {
    title: ValidationRules.required('标题不能为空'),
    description: ValidationRules.maxLength(500, '描述最多500个字符'),
    priority: ValidationRules.custom(
      (value) => ['low', 'medium', 'high'].includes(String(value)),
      '优先级必须是low、medium或high'
    )
  },

  // 项目标签
  projectTag: {
    name: ValidationRules.required('项目名称不能为空'),
    color: ValidationRules.custom(
      (value) => ['indigo', 'blue', 'emerald', 'amber', 'purple', 'rose', 'stone', 'gray'].includes(String(value)),
      '请选择有效的颜色'
    )
  }
};

/**
 * 数据清理和格式化
 */
export function sanitizeData(data: unknown, schema: ValidationSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [field] of Object.entries(schema)) {
    const value = (data as Record<string, unknown>)[field];

    // 跳过空值
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // 字符串清理
    if (typeof value === 'string') {
      result[field] = value.trim();
    } else {
      result[field] = value;
    }
  }

  return result;
}
