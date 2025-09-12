-- Digital Brain Supabase Schema
-- 创建所有必要的表结构

-- 创建entries表
CREATE TABLE IF NOT EXISTS public.entries (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  project_tag TEXT,
  effort_tag TEXT DEFAULT '轻松',
  sort_order INTEGER DEFAULT 0,
  daily_report_tag TEXT DEFAULT '无',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建AI洞察表
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id BIGSERIAL PRIMARY KEY,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data_source TEXT,
  confidence_score REAL DEFAULT 0.8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- 创建用户工作模式表
CREATE TABLE IF NOT EXISTS public.work_patterns (
  id BIGSERIAL PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  time_period TEXT NOT NULL,
  pattern_data TEXT NOT NULL,
  analysis_date TIMESTAMPTZ DEFAULT NOW(),
  confidence_score REAL DEFAULT 0.8
);

-- 创建背景知识库表
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建任务表
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  estimated_hours REAL,
  actual_hours REAL DEFAULT 0,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assignee TEXT
);

-- 创建子任务表
CREATE TABLE IF NOT EXISTS public.subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE
);

-- 创建用户行为事件表
CREATE TABLE IF NOT EXISTS public.user_behavior_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL,
  context TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT NOT NULL,
  duration_ms INTEGER
);

-- 创建行为模式表
CREATE TABLE IF NOT EXISTS public.behavior_patterns (
  id BIGSERIAL PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_name TEXT NOT NULL,
  pattern_data TEXT NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  strength REAL DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true
);

-- 创建认知画像表
CREATE TABLE IF NOT EXISTS public.cognitive_profiles (
  user_id TEXT PRIMARY KEY,
  profile_data TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建推荐历史表
CREATE TABLE IF NOT EXISTS public.recommendations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  confidence REAL NOT NULL,
  relevance_score REAL NOT NULL,
  timing_score REAL NOT NULL,
  reasoning TEXT NOT NULL,
  expected_value REAL DEFAULT 0.5,
  effort_required TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  user_feedback TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 创建知识关联表
CREATE TABLE IF NOT EXISTS public.knowledge_relationships (
  id TEXT PRIMARY KEY,
  source_entry_id BIGINT NOT NULL,
  target_entry_id BIGINT NOT NULL,
  relationship_type TEXT NOT NULL,
  strength REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (source_entry_id) REFERENCES public.entries(id) ON DELETE CASCADE,
  FOREIGN KEY (target_entry_id) REFERENCES public.entries(id) ON DELETE CASCADE
);

-- 创建搜索历史表
CREATE TABLE IF NOT EXISTS public.search_history (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  search_type TEXT DEFAULT 'general',
  user_session TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建对话历史表
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  messages TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建模板表
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建文件夹表
CREATE TABLE IF NOT EXISTS public.folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES public.folders(id) ON DELETE CASCADE
);

-- 创建OKR表
CREATE TABLE IF NOT EXISTS public.okrs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('objective', 'key_result')) NOT NULL,
  parent_id TEXT,
  target_value REAL,
  current_value REAL DEFAULT 0,
  unit TEXT,
  due_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES public.okrs(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries(created_at);
CREATE INDEX IF NOT EXISTS idx_entries_project_tag ON public.entries(project_tag);
CREATE INDEX IF NOT EXISTS idx_entries_effort_tag ON public.entries(effort_tag);
CREATE INDEX IF NOT EXISTS idx_entries_daily_report_tag ON public.entries(daily_report_tag);
CREATE INDEX IF NOT EXISTS idx_entries_content_search ON public.entries USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON public.subtasks(completed);

CREATE INDEX IF NOT EXISTS idx_behavior_events_type ON public.user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_events_session ON public.user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_events_timestamp ON public.user_behavior_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_search_history_query ON public.search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON public.search_history(created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active);

CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON public.folders(path);

CREATE INDEX IF NOT EXISTS idx_okrs_type ON public.okrs(type);
CREATE INDEX IF NOT EXISTS idx_okrs_parent_id ON public.okrs(parent_id);
CREATE INDEX IF NOT EXISTS idx_okrs_status ON public.okrs(status);
CREATE INDEX IF NOT EXISTS idx_okrs_due_date ON public.okrs(due_date);

-- 启用Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognitive_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;

-- 创建基本的RLS策略（允许所有操作，可根据需要调整）
CREATE POLICY "Enable all operations for all users" ON public.entries FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.ai_insights FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.work_patterns FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.knowledge_base FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.tasks FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.subtasks FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.user_behavior_events FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.behavior_patterns FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.cognitive_profiles FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.recommendations FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.knowledge_relationships FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.search_history FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.templates FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.folders FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON public.okrs FOR ALL USING (true);