-- Supabase 表结构补充和修复脚本
-- 运行前请备份数据

-- 1. 为 tasks 表添加缺失的字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id TEXT;

-- 2. 创建 projects 表（如果不存在）
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'archived', 'cancelled')) DEFAULT 'active',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    owner TEXT,
    color TEXT DEFAULT '#3B82F6',
    is_archived BOOLEAN DEFAULT FALSE
);

-- 3. 创建缺失的索引
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_entries_project_tag ON entries(project_tag);
CREATE INDEX IF NOT EXISTS idx_entries_effort_tag ON entries(effort_tag);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);

CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);

-- 4. 创建触发器来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表创建更新时间触发器
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at 
    BEFORE UPDATE ON entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at 
    BEFORE UPDATE ON folders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_okrs_updated_at 
    BEFORE UPDATE ON okrs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 设置 RLS (Row Level Security) 策略
-- 暂时允许所有操作，后续可根据需要调整
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on entries" ON entries FOR ALL USING (true);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on subtasks" ON subtasks FOR ALL USING (true);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on conversations" ON conversations FOR ALL USING (true);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on knowledge_base" ON knowledge_base FOR ALL USING (true);

ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on user_behavior_events" ON user_behavior_events FOR ALL USING (true);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on ai_insights" ON ai_insights FOR ALL USING (true);

ALTER TABLE work_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on work_patterns" ON work_patterns FOR ALL USING (true);

ALTER TABLE behavior_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on behavior_patterns" ON behavior_patterns FOR ALL USING (true);

ALTER TABLE cognitive_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on cognitive_profiles" ON cognitive_profiles FOR ALL USING (true);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on recommendations" ON recommendations FOR ALL USING (true);

ALTER TABLE knowledge_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on knowledge_relationships" ON knowledge_relationships FOR ALL USING (true);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on search_history" ON search_history FOR ALL USING (true);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on templates" ON templates FOR ALL USING (true);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on folders" ON folders FOR ALL USING (true);

ALTER TABLE okrs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on okrs" ON okrs FOR ALL USING (true);

-- 6. 创建外键约束（如果支持）
-- 注意：需要先确保引用的数据存在
-- ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project_id FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
-- ALTER TABLE subtasks ADD CONSTRAINT fk_subtasks_task_id FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
-- ALTER TABLE knowledge_relationships ADD CONSTRAINT fk_kr_source_entry FOREIGN KEY (source_entry_id) REFERENCES entries(id) ON DELETE CASCADE;
-- ALTER TABLE knowledge_relationships ADD CONSTRAINT fk_kr_target_entry FOREIGN KEY (target_entry_id) REFERENCES entries(id) ON DELETE CASCADE;
-- ALTER TABLE folders ADD CONSTRAINT fk_folders_parent FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE;
-- ALTER TABLE okrs ADD CONSTRAINT fk_okrs_parent FOREIGN KEY (parent_id) REFERENCES okrs(id) ON DELETE CASCADE;