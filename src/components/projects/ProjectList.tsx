'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid,
  List,
  Plus,
  ChevronDown,
  X
} from 'lucide-react';
import { Project, ProjectWithStats } from '@/types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: ProjectWithStats[];
  loading?: boolean;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectStatusChange?: (projectId: string, status: Project['status']) => void;
  onProjectView?: (projectId: string) => void;
  onProjectCreate?: () => void;
  className?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created' | 'updated' | 'priority' | 'progress';
type SortOrder = 'asc' | 'desc';

const statusOptions: Array<{ value: Project['status'] | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'on_hold', label: '暂停' },
  { value: 'archived', label: '已归档' }
];

const priorityOptions: Array<{ value: Project['priority'] | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
];

const sortOptions: Array<{ value: SortField; label: string }> = [
  { value: 'name', label: '名称' },
  { value: 'created', label: '创建时间' },
  { value: 'updated', label: '更新时间' },
  { value: 'priority', label: '优先级' },
  { value: 'progress', label: '进度' }
];

export function ProjectList({
  projects,
  loading = false,
  onProjectEdit,
  onProjectDelete,
  onProjectStatusChange,
  onProjectView,
  onProjectCreate,
  className = ''
}: ProjectListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Project['priority'] | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // 过滤和排序项目
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        (project.description?.toLowerCase().includes(query))
      );
    }

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // 优先级过滤
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    // 排序
    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'progress':
          aValue = a.taskCount > 0 ? (a.completedTasks / a.taskCount) * 100 : 0;
          bValue = b.taskCount > 0 ? (b.completedTasks / b.taskCount) * 100 : 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [projects, searchQuery, statusFilter, priorityFilter, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortField('updated');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || sortField !== 'updated' || sortOrder !== 'desc';

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* 加载状态的骨架屏 */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="rounded-xl p-4 animate-pulse"
            style={{
              background: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-gray-300/50 rounded w-1/2" />
                <div className="h-4 bg-gray-300/50 rounded w-4" />
              </div>
              <div className="h-3 bg-gray-300/50 rounded w-3/4" />
              <div className="h-2 bg-gray-300/50 rounded w-full" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-300/50 rounded w-1/4" />
                <div className="h-3 bg-gray-300/50 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 工具栏 */}
      <div className="mb-6 space-y-4">
        {/* 主工具栏 - 响应式优化 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* 搜索框 */}
          <div className="flex-1 sm:max-w-md relative">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-40"
              style={{ color: 'var(--text-secondary)' }}
            />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{
                background: 'var(--card-glass)',
                color: 'var(--text-primary)',
                border: '1px solid var(--card-border)'
              }}
            />
          </div>

          {/* 右侧工具 - 响应式布局 */}
          <div className="flex items-center gap-2 justify-end">
            {/* 过滤器按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                hasActiveFilters ? 'ring-2 ring-blue-500/20' : ''
              }`}
              style={{
                background: showFilters ? 'var(--flow-primary)20' : 'var(--card-glass)',
                color: showFilters ? 'var(--flow-primary)' : 'var(--text-primary)',
                border: '1px solid var(--card-border)'
              }}
            >
              <Filter className="w-4 h-4" />
              过滤
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* 视图切换 */}
            <div 
              className="flex rounded-lg p-1"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--card-border)'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' ? 'shadow-sm' : ''
                }`}
                style={{
                  background: viewMode === 'grid' ? 'var(--card-background)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' ? 'shadow-sm' : ''
                }`}
                style={{
                  background: viewMode === 'list' ? 'var(--card-background)' : 'transparent',
                  color: 'var(--text-primary)'
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* 新建项目按钮 */}
            <button
              onClick={onProjectCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md"
              style={{
                background: 'var(--flow-primary)',
                color: 'white'
              }}
            >
              <Plus className="w-4 h-4" />
              新建项目
            </button>
          </div>
        </div>

        {/* 展开的过滤器面板 */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div 
                className="p-4 rounded-lg space-y-4"
                style={{
                  background: 'var(--card-glass)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 状态过滤 */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      状态
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                      className="w-full px-3 py-2 rounded border-0 text-sm focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        background: 'var(--card-background)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 优先级过滤 */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      优先级
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
                      className="w-full px-3 py-2 rounded border-0 text-sm focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        background: 'var(--card-background)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 排序字段 */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      排序依据
                    </label>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="w-full px-3 py-2 rounded border-0 text-sm focus:ring-2 focus:ring-blue-500/20"
                      style={{
                        background: 'var(--card-background)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 排序顺序 */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      排序顺序
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSortOrder('desc')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                          sortOrder === 'desc' ? 'ring-2 ring-blue-500/20' : ''
                        }`}
                        style={{
                          background: sortOrder === 'desc' ? 'var(--flow-primary)20' : 'var(--card-background)',
                          color: sortOrder === 'desc' ? 'var(--flow-primary)' : 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        <SortAsc className="w-4 h-4 rotate-180" />
                        降序
                      </button>
                      <button
                        onClick={() => setSortOrder('asc')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-all ${
                          sortOrder === 'asc' ? 'ring-2 ring-blue-500/20' : ''
                        }`}
                        style={{
                          background: sortOrder === 'asc' ? 'var(--flow-primary)20' : 'var(--card-background)',
                          color: sortOrder === 'asc' ? 'var(--flow-primary)' : 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        <SortAsc className="w-4 h-4" />
                        升序
                      </button>
                    </div>
                  </div>
                </div>

                {/* 清除过滤器 */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-3 py-1 text-sm rounded transition-colors hover:bg-red-500/10 text-red-500"
                    >
                      <X className="w-4 h-4" />
                      清除过滤器
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 项目列表/网格 - 响应式优化 */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6' 
          : 'space-y-3 md:space-y-4'
      }`}>
        <AnimatePresence mode="popLayout">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onProjectEdit}
              onDelete={onProjectDelete}
              onStatusChange={onProjectStatusChange}
              onView={onProjectView}
              className={viewMode === 'list' ? 'w-full' : ''}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 空状态 */}
      {filteredAndSortedProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center opacity-20"
            style={{ background: 'var(--flow-primary)' }}
          >
            <Grid className="w-8 h-8" style={{ color: 'var(--text-primary)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {hasActiveFilters ? '未找到匹配的项目' : '还没有项目'}
          </h3>
          <p className="opacity-70 mb-6" style={{ color: 'var(--text-secondary)' }}>
            {hasActiveFilters 
              ? '尝试调整筛选条件或清除过滤器' 
              : '创建您的第一个项目来开始工作'
            }
          </p>
          {!hasActiveFilters && (
            <button
              onClick={onProjectCreate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:shadow-md"
              style={{
                background: 'var(--flow-primary)',
                color: 'white'
              }}
            >
              <Plus className="w-5 h-5" />
              新建项目
            </button>
          )}
        </div>
      )}
    </div>
  );
}