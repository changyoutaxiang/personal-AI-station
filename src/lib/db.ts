/**
 * 数据库操作统一接口 - Supabase 实现
 * 这个文件替代了原有的 SQLite 实现，使用 Supabase 作为后端
 */

// 重新导出所有 Supabase 实现
export * from './db-supabase';

// 为了兼容性，添加一些占位符类型和函数
export interface ConversationFolder {
  id: number;
  name: string;
  color?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  folder_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// 数据库实例占位符（兼容性）
export const db = {
  prepare: (sql: string) => ({
    all: () => [],
    get: () => null,
    run: () => ({ changes: 0 })
  })
};

// 初始化数据库函数（占位符）
export function initDatabase(): void {
  console.log('📦 数据库初始化已迁移到 Supabase');
}

export function getDbConnection() {
  return db;
}

// 添加缺失的会话和消息相关函数（临时占位符）
export async function listMessagesByConversation(conversationId: number, limit?: number) {
  console.log('📝 listMessagesByConversation 调用 - 迁移到 Supabase 待实现');
  return [];
}

export async function getPromptTemplateById(id: number) {
  console.log('📝 getPromptTemplateById 调用 - 迁移到 Supabase 待实现');
  return null;
}

export async function listPromptTemplates() {
  console.log('📝 listPromptTemplates 调用 - 迁移到 Supabase 待实现');
  return [];
}

export async function updatePromptTemplate(id: number, data: any) {
  console.log('📝 updatePromptTemplate 调用 - 迁移到 Supabase 待实现');
  return null;
}

export async function deletePromptTemplate(id: number) {
  console.log('📝 deletePromptTemplate 调用 - 迁移到 Supabase 待实现');
  return true;
}

// AI 配置相关（占位符实现）
export function getAIProvider(): any {
  return { name: 'openrouter', enabled: true };
}

export function getAllAIProviders(): any[] {
  return [{ id: 1, name: 'openrouter', enabled: true }];
}

export function updateAIProvider(id: number, config: any): void {
  console.log('updateAIProvider - moved to Supabase');
}

export function getAllAIModelConfigs(): any[] {
  return [{ id: 1, model: 'anthropic/claude-3.5-sonnet', provider: 'openrouter' }];
}

export function updateAIModelConfig(functionName: string, config: any): void {
  console.log('updateAIModelConfig - moved to Supabase');
}

export function getOpenRouterApiKey(): string {
  return process.env.OPENROUTER_API_KEY || '';
}

// 知识库相关（占位符实现）
export function createKnowledgeDocument(doc: any): any {
  console.log('createKnowledgeDocument - moved to Supabase');
  return { id: Date.now(), ...doc };
}

export function updateKnowledgeDocument(id: number, doc: any): any {
  console.log('updateKnowledgeDocument - moved to Supabase');
  return { id, ...doc };
}

export function deleteKnowledgeDocument(id: number): void {
  console.log('deleteKnowledgeDocument - moved to Supabase');
}

// TODO 相关（占位符实现）
export function listTodoEvents(todoId?: string): any[] {
  return [];
}

export function getTodoById(id: string): any {
  return null;
}

// OKR 相关（占位符实现）
export function listOKRs(): any[] {
  return [];
}

export function createOKRFromObject(okr: any): any {
  return { id: Date.now(), ...okr };
}

export function getOKRById(id: number): any {
  return null;
}

export function updateOKRObject(id: number, okr: any): any {
  return { id, ...okr };
}

export function hardDeleteOKR(id: number): void {
  console.log('hardDeleteOKR - moved to Supabase');
}

export function listOKREvents(okrId?: number): any[] {
  return [];
}

// Agent 对话相关（占位符实现）
export function getConversationById(id: number): Conversation | null {
  return null;
}

export function updateConversation(id: number, updates: any): void {
  console.log('updateConversation - moved to Supabase');
}

export function deleteConversation(id: number): void {
  console.log('deleteConversation - moved to Supabase');
}

export function createMessage(message: any): Message {
  return { id: Date.now(), ...message };
}

export function getMessageById(id: number): Message | null {
  return null;
}

export function updateMessage(id: number, updates: any): void {
  console.log('updateMessage - moved to Supabase');
}

export function deleteMessage(id: number): void {
  console.log('deleteMessage - moved to Supabase');
}

export function getMessagesByConversationId(conversationId: number): Message[] {
  return [];
}

export function getAllConversations(): Conversation[] {
  return [];
}

export function getAllMessages(): Message[] {
  return [];
}

export function deleteMultipleConversations(ids: number[]): void {
  console.log('deleteMultipleConversations - moved to Supabase');
}

export function deleteMultipleMessages(ids: number[]): void {
  console.log('deleteMultipleMessages - moved to Supabase');
}

export function getPromptById(id: number): any {
  return null;
}

export function updatePrompt(id: number, updates: any): void {
  console.log('updatePrompt - moved to Supabase');
}

export function deletePrompt(id: number): void {
  console.log('deletePrompt - moved to Supabase');
}

// 默认导出（兼容性）
export default {
  ...db,
  initDatabase,
  getAIProvider,
  getAllEntries: async () => {
    const { getAllEntriesAsync } = await import('./db-supabase');
    return getAllEntriesAsync();
  }
};

console.log('✅ 数据库接口已迁移到 Supabase 实现');