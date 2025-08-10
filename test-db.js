const { db, initDatabase } = require('./src/lib/db.ts');

console.log('🔧 初始化数据库...');
try {
  initDatabase();
  console.log('✅ 数据库初始化完成');
  
  // 检查新表是否存在
  console.log('\n📋 检查新增表结构...');
  
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND name IN ('conversations', 'messages', 'tags', 'conversation_tags', 'prompt_templates')
    ORDER BY name
  `).all();
  
  console.log('新增的表:', tables);
  
  // 检查外键约束是否启用
  const foreignKeysResult = db.prepare('PRAGMA foreign_keys').get();
  console.log('外键约束状态:', foreignKeysResult);
  
  // 检查索引是否存在
  const indexes = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='index' 
    AND name IN (
      'idx_messages_conversation_id', 
      'idx_conversations_updated_at', 
      'idx_tags_name', 
      'idx_conversation_tags_tag_id'
    )
    ORDER BY name
  `).all();
  
  console.log('新增的索引:', indexes);
  
  // 测试插入一条测试对话
  console.log('\n🧪 测试基本功能...');
  
  // 插入测试对话
  const insertConversation = db.prepare(`
    INSERT INTO conversations (title, model_name, system_prompt) 
    VALUES (?, ?, ?)
  `);
  
  const conversationResult = insertConversation.run(
    '测试对话',
    'gpt-3.5-turbo',
    '你是一个有用的助手'
  );
  
  console.log('✅ 插入测试对话成功，ID:', conversationResult.lastInsertRowid);
  
  // 插入测试消息
  const insertMessage = db.prepare(`
    INSERT INTO messages (conversation_id, role, content) 
    VALUES (?, ?, ?)
  `);
  
  const messageResult = insertMessage.run(
    conversationResult.lastInsertRowid,
    'user',
    '你好'
  );
  
  console.log('✅ 插入测试消息成功，ID:', messageResult.lastInsertRowid);
  
  // 插入测试标签
  const insertTag = db.prepare(`
    INSERT INTO tags (name) VALUES (?)
  `);
  
  const tagResult = insertTag.run('测试标签');
  console.log('✅ 插入测试标签成功，ID:', tagResult.lastInsertRowid);
  
  // 插入测试提示模板
  const insertTemplate = db.prepare(`
    INSERT INTO prompt_templates (name, content, description) 
    VALUES (?, ?, ?)
  `);
  
  const templateResult = insertTemplate.run(
    '测试模板',
    '这是一个测试模板内容',
    '这是测试模板的描述'
  );
  
  console.log('✅ 插入测试模板成功，ID:', templateResult.lastInsertRowid);
  
  // 测试外键约束 - 创建对话标签关联
  const insertConversationTag = db.prepare(`
    INSERT INTO conversation_tags (conversation_id, tag_id) 
    VALUES (?, ?)
  `);
  
  insertConversationTag.run(conversationResult.lastInsertRowid, tagResult.lastInsertRowid);
  console.log('✅ 插入对话标签关联成功');
  
  // 查询测试数据
  console.log('\n📊 查询测试数据...');
  
  const conversations = db.prepare(`
    SELECT c.*, GROUP_CONCAT(t.name) as tags
    FROM conversations c
    LEFT JOIN conversation_tags ct ON c.id = ct.conversation_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    GROUP BY c.id
  `).all();
  
  console.log('对话数据:', conversations);
  
  const messages = db.prepare(`
    SELECT * FROM messages WHERE conversation_id = ?
  `).all(conversationResult.lastInsertRowid);
  
  console.log('消息数据:', messages);
  
  const templates = db.prepare('SELECT * FROM prompt_templates').all();
  console.log('模板数据:', templates);
  
  console.log('\n🎉 数据库新表结构测试全部通过！');
  
  // 清理测试数据
  console.log('\n🧹 清理测试数据...');
  db.prepare('DELETE FROM conversation_tags WHERE conversation_id = ?').run(conversationResult.lastInsertRowid);
  db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationResult.lastInsertRowid);
  db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationResult.lastInsertRowid);
  db.prepare('DELETE FROM tags WHERE id = ?').run(tagResult.lastInsertRowid);
  db.prepare('DELETE FROM prompt_templates WHERE id = ?').run(templateResult.lastInsertRowid);
  
  console.log('✅ 测试数据清理完成');
  
} catch (error) {
  console.error('❌ 数据库测试失败:', error);
} finally {
  db.close();
}
