/**
 * 服务端专用数据库控制器
 * 确保better-sqlite3和db.ts只在服务端使用
 */

// 只在服务端导入数据库模块
let dbModule: typeof import('./db') | null = null;

/**
 * 懒加载数据库模块（仅在服务端）
 */
async function getDbModule() {
  if (typeof window !== 'undefined') {
    throw new Error('数据库操作不能在客户端执行');
  }
  
  if (!dbModule) {
    dbModule = await import('./db');
  }
  
  return dbModule;
}

/**
 * 服务端数据库操作包装器
 */
export const ServerDbController = {
  // Entry 相关操作
  async createEntry(entry: Parameters<typeof import('./db').createEntry>[0]) {
    const db = await getDbModule();
    return db.createEntry(entry);
  },

  async getAllEntries(limit?: number) {
    const db = await getDbModule();
    return db.getAllEntries(limit);
  },

  async getEntryById(id: number) {
    const db = await getDbModule();
    return db.getEntryById(id);
  },

  async updateEntry(id: number, entry: Parameters<typeof import('./db').updateEntry>[1]) {
    const db = await getDbModule();
    return db.updateEntry(id, entry);
  },

  async deleteEntry(id: number) {
    const db = await getDbModule();
    return db.deleteEntry(id);
  },

  // Conversation 相关操作
  async createConversation(data: Parameters<typeof import('./db').createConversation>[0]) {
    const db = await getDbModule();
    return db.createConversation(data);
  },

  async getConversationById(id: number) {
    const db = await getDbModule();
    return db.getConversationById(id);
  },

  async listConversations(params?: Parameters<typeof import('./db').listConversations>[0]) {
    const db = await getDbModule();
    return db.listConversations(params);
  },

  async updateConversation(id: number, updates: Parameters<typeof import('./db').updateConversation>[1]) {
    const db = await getDbModule();
    return db.updateConversation(id, updates);
  },

  async deleteConversation(id: number) {
    const db = await getDbModule();
    return db.deleteConversation(id);
  },

  // Message 相关操作
  async createMessage(data: Parameters<typeof import('./db').createMessage>[0]) {
    const db = await getDbModule();
    return db.createMessage(data);
  },

  async listMessagesByConversation(conversationId: number, limit?: number, offset?: number) {
    const db = await getDbModule();
    return db.listMessagesByConversation(conversationId, limit, offset);
  },

  async getMessageById(id: number) {
    const db = await getDbModule();
    return db.getMessageById(id);
  },

  async deleteMessage(id: number) {
    const db = await getDbModule();
    return db.deleteMessage(id);
  },

  // Prompt Template 相关操作
  async listPromptTemplates() {
    const db = await getDbModule();
    return db.listPromptTemplates();
  },

  async createPromptTemplate(data: Parameters<typeof import('./db').createPromptTemplate>[0]) {
    const db = await getDbModule();
    return db.createPromptTemplate(data);
  },

  async getPromptTemplateById(id: number) {
    const db = await getDbModule();
    return db.getPromptTemplateById(id);
  },

  async updatePromptTemplate(id: number, updates: Parameters<typeof import('./db').updatePromptTemplate>[1]) {
    const db = await getDbModule();
    return db.updatePromptTemplate(id, updates);
  },

  async deletePromptTemplate(id: number) {
    const db = await getDbModule();
    return db.deletePromptTemplate(id);
  },

  // AI Model Config 相关操作
  async getAIModelConfig(functionName: string) {
    const db = await getDbModule();
    return db.getAIModelConfig(functionName);
  },

  async getAllAIModelConfigs() {
    const db = await getDbModule();
    return db.getAllAIModelConfigs();
  },

  async updateAIModelConfig(functionName: string, modelName: string) {
    const db = await getDbModule();
    return db.updateAIModelConfig(functionName, modelName);
  },

  // Tag 相关操作
  async listTags() {
    const db = await getDbModule();
    return db.listTags();
  },

  async createTag(name: string) {
    const db = await getDbModule();
    return db.createTag(name);
  },

  async deleteTag(id: number) {
    const db = await getDbModule();
    return db.deleteTag(id);
  },

  async addTagToConversation(conversationId: number, tagId: number) {
    const db = await getDbModule();
    return db.addTagToConversation(conversationId, tagId);
  },

  async removeTagFromConversation(conversationId: number, tagId: number) {
    const db = await getDbModule();
    return db.removeTagFromConversation(conversationId, tagId);
  },

  async listTagsByConversation(conversationId: number) {
    const db = await getDbModule();
    return db.listTagsByConversation(conversationId);
  },



  // 健康检查
  async checkDatabaseHealth() {
    const db = await getDbModule();
    return db.checkDatabaseHealth();
  },

  // 初始化数据库
  async initDatabase() {
    const db = await getDbModule();
    return db.initDatabase();
  }
};

/**
 * 客户端安全检查
 */
export function ensureServerSide() {
  if (typeof window !== 'undefined') {
    throw new Error('此操作只能在服务端执行');
  }
}
