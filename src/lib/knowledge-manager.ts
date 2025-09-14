/**
 * 知识库管理系统
 * 负责扫描knowledge-base文件夹，维护文件索引和内容缓存
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';
import { createKnowledgeDocument, getAllKnowledgeDocuments, updateKnowledgeDocument, deleteKnowledgeDocument } from './db';
import type { KnowledgeDocument } from '@/types/index';
import { debug } from '@/lib/debug';

const KNOWLEDGE_BASE_PATH = join(process.cwd(), 'knowledge-base');

interface FileInfo {
  path: string;
  relativePath: string;
  name: string;
  type: string;
  lastModified: Date;
  size: number;
  content?: string;
}

/**
 * 扫描知识库文件夹
 */
function scanKnowledgeFiles(): FileInfo[] {
  if (!existsSync(KNOWLEDGE_BASE_PATH)) {
    debug.warn('知识库文件夹不存在:', KNOWLEDGE_BASE_PATH);
    return [];
  }

  const files: FileInfo[] = [];
  
  function scanDirectory(dirPath: string) {
    try {
      const entries = readdirSync(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 递归扫描子目录
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = extname(entry).toLowerCase();
          
          // 只处理markdown和文本文件
          if (['.md', '.txt', '.mdx'].includes(ext)) {
            const relativePath = relative(KNOWLEDGE_BASE_PATH, fullPath);
            const type = getDocumentType(relativePath);
            
            files.push({
              path: fullPath,
              relativePath,
              name: entry,
              type,
              lastModified: stat.mtime,
              size: stat.size
            });
          }
        }
      }
    } catch (error) {
      debug.error('扫描目录失败:', dirPath, error);
    }
  }
  
  scanDirectory(KNOWLEDGE_BASE_PATH);
  return files;
}

/**
 * 根据文件路径确定文档类型
 */
function getDocumentType(relativePath: string): string {
  const pathParts = relativePath.split('/');
  
  if (pathParts.length > 1) {
    const folder = pathParts[0];
    switch (folder) {
      case 'business': return '业务信息';
      case 'team': return '团队信息';
      case 'personal': return '个人信息';
      case 'current-focus': return '当前关注';
      case 'context': return '背景上下文';
      default: return '其他';
    }
  }
  
  return '根目录';
}

/**
 * 读取文件内容并提取摘要和关键词
 */
function processFileContent(filePath: string): { content: string; summary: string; keywords: string } {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 提取摘要（取第一段或前200字符）
    const lines = content.split('\n').filter(line => line.trim());
    const firstParagraph = lines.find(line => !line.startsWith('#') && line.length > 10);
    const summary = firstParagraph 
      ? firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '')
      : content.substring(0, 200) + (content.length > 200 ? '...' : '');
    
    // 简单的关键词提取（提取标题和重要词汇）
    const keywords = extractKeywords(content);
    
    return { content, summary, keywords };
  } catch (error) {
    debug.error('读取文件失败:', filePath, error);
    return { content: '', summary: '', keywords: '' };
  }
}

/**
 * 简单的关键词提取
 */
function extractKeywords(content: string): string {
  const keywords = new Set<string>();
  
  // 提取标题
  const headerMatches = content.match(/#{1,6}\s+(.+)/g);
  if (headerMatches) {
    headerMatches.forEach(header => {
      const title = header.replace(/#{1,6}\s+/, '').trim();
      if (title.length > 2 && title.length < 50) {
        keywords.add(title);
      }
    });
  }
  
  // 提取列表项的关键词
  const listMatches = content.match(/[-*+]\s+(.+)/g);
  if (listMatches) {
    listMatches.forEach(item => {
      const text = item.replace(/[-*+]\s+/, '').trim();
      if (text.length > 2 && text.length < 30) {
        keywords.add(text.split('：')[0].split(':')[0]);
      }
    });
  }
  
  return Array.from(keywords).slice(0, 10).join(', ');
}

/**
 * 同步知识库文件到数据库
 */
export async function syncKnowledgeBase(): Promise<{ 
  success: boolean; 
  updated: number; 
  created: number; 
  deleted: number; 
  error?: string 
}> {
  try {
    debug.log('🔄 开始同步知识库...');
    
    // 扫描文件系统
    const files = scanKnowledgeFiles();
    debug.log(`📁 发现 ${files.length} 个知识文件`);
    
    // 获取数据库中的现有记录
    const existingDocs = getAllKnowledgeDocuments() as KnowledgeDocument[];
    const existingPaths = new Set(existingDocs.map(doc => doc.title));
    
    let created = 0;
    let updated = 0;
    let deleted = 0;
    
    // 处理每个文件
    for (const file of files) {
      const { content, summary, keywords } = processFileContent(file.path);
      
      if (!content.trim()) continue;
      
      const existingDoc = existingDocs.find(doc => doc.title === file.relativePath);
      
      if (existingDoc) {
        // 检查文件是否有更新
        const fileModTime = file.lastModified.getTime();
        const dbModTime = new Date(existingDoc.updated_at).getTime();
        
        if (fileModTime > dbModTime) {
          // 更新现有文档
          updateKnowledgeDocument(existingDoc.id, {
            content,
            summary,
            keywords,
            priority: getPriorityByType(file.type)
          });
          updated++;
          debug.log(`✏️ 更新: ${file.relativePath}`);
        }
        
        existingPaths.delete(file.relativePath);
      } else {
        // 创建新文档
        createKnowledgeDocument({
          document_type: file.type,
          title: file.relativePath,
          content,
          summary,
          keywords,
          priority: getPriorityByType(file.type)
        });
        created++;
        debug.log(`➕ 创建: ${file.relativePath}`);
      }
    }
    
    // 删除不存在的文件对应的数据库记录
    for (const remainingPath of existingPaths) {
      const docToDelete = existingDocs.find(doc => doc.title === remainingPath);
      if (docToDelete) {
        deleteKnowledgeDocument(docToDelete.id);
        deleted++;
        debug.log(`🗑️ 删除: ${remainingPath}`);
      }
    }
    
    debug.log(`✅ 知识库同步完成: 创建${created}, 更新${updated}, 删除${deleted}`);
    
    return { success: true, created, updated, deleted };
  } catch (error) {
    debug.error('❌ 知识库同步失败:', error);
    return { 
      success: false, 
      created: 0, 
      updated: 0, 
      deleted: 0, 
      error: error instanceof Error ? error.message : '同步失败' 
    };
  }
}

/**
 * 根据文档类型获取优先级
 */
function getPriorityByType(type: string): number {
  switch (type) {
    case '个人信息': return 5;
    case '当前关注': return 4;
    case '业务信息': return 3;
    case '团队信息': return 3;
    case '背景上下文': return 2;
    default: return 1;
  }
}

/**
 * 获取知识库内容用于AI上下文
 */
export function getKnowledgeContext(): string {
  try {
    const documents = getAllKnowledgeDocuments() as KnowledgeDocument[];
    
    if (documents.length === 0) {
      return '';
    }
    
    // 按优先级排序，只取前5个最重要的文档
    const topDocs = documents
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5);
    
    let context = '# 个人背景信息\n\n';
    
    for (const doc of topDocs) {
      context += `## ${doc.document_type} - ${doc.title}\n`;
      if (doc.summary) {
        context += `${doc.summary}\n\n`;
      } else {
        // 如果没有摘要，取前300字符
        const shortContent = doc.content.substring(0, 300) + (doc.content.length > 300 ? '...' : '');
        context += `${shortContent}\n\n`;
      }
    }
    
    context += '---\n以上是用户的个人背景信息，请在回答时考虑这些背景。\n\n';
    
    return context;
  } catch (error) {
    debug.error('获取知识库上下文失败:', error);
    return '';
  }
}