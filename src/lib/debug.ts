/**
 * 调试工具 - 基于环境变量控制调试输出
 */

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const debug = {
  log: (...args: unknown[]) => {
    if (IS_DEVELOPMENT) {
      console.log(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    if (IS_DEVELOPMENT) {
      console.error(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (IS_DEVELOPMENT) {
      console.warn(...args);
    }
  },
  
  info: (...args: unknown[]) => {
    if (IS_DEVELOPMENT) {
      console.info(...args);
    }
  }
};

// 在生产环境中完全禁用console
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  // 保留console.error用于真正的错误
}