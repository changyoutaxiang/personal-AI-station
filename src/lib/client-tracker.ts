/**
 * 客户端安全的行为追踪接口
 * 通过API路由发送追踪数据，避免直接访问数据库
 */

'use client';

import { debug } from './debug';

interface TrackingData {
  [key: string]: unknown;
}

// 创建与原始trackEvent兼容的接口
export const trackEvent = {
  // 页面访问追踪
  async pageView(url: string): Promise<void> {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page_view',
          data: { url, timestamp: Date.now() }
        })
      });
    } catch (error) {
      debug.warn('页面访问追踪失败:', error);
    }
  },

  // AI交互追踪
  async aiInteraction(action: string, data: TrackingData): Promise<void> {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ai_interaction',
          data: { action, ...data, timestamp: Date.now() }
        })
      });
    } catch (error) {
      debug.warn('AI交互追踪失败:', error);
    }
  },

  // 内容创建追踪
  async contentCreate(contentLength: number, projectTag?: string): Promise<void> {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content_create',
          data: { contentLength, projectTag, timestamp: Date.now() }
        })
      });
    } catch (error) {
      debug.warn('内容创建追踪失败:', error);
    }
  },

  // 内容编辑追踪
  async contentEdit(entryId: number, changes: Record<string, unknown>): Promise<void> {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'content_edit',
          data: { entryId, changes, timestamp: Date.now() }
        })
      });
    } catch (error) {
      debug.warn('内容编辑追踪失败:', error);
    }
  },

  // 标签使用追踪
  async tagUsage(tagType: string, tagValue: string): Promise<void> {
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'tag_usage',
          data: { tagType, tagValue, timestamp: Date.now() }
        })
      });
    } catch (error) {
      debug.warn('标签使用追踪失败:', error);
    }
  },

  // 搜索行为追踪

};

// 默认导出
export default trackEvent;