'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X, Clock, Tag, AlertCircle, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import type { Entry } from '@/types/index';

interface SearchFilterProps {
  todos: Entry[];
  onFilteredTodos: (filteredTodos: Entry[]) => void;
  className?: string;
}

interface FilterState {
  searchTerm: string;
  selectedProjects: string[];
  selectedStatuses: string[];
  selectedPriorities: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface SearchHistoryItem {
  term: string;
  timestamp: number;
  filters: Partial<FilterState>;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  todos,
  onFilteredTodos,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    searchTerm: '',
    selectedProjects: [],
    selectedStatuses: [],
    selectedPriorities: [],
    dateRange: {
      start: null,
      end: null
    }
  });
  
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState(-1);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  // 获取所有唯一的项目标签
  const allProjects = Array.from(new Set(todos.map(todo => todo.project_tag || '其他')));
  const allStatuses = ['pending', 'in_progress', 'completed'];
  const allPriorities = ['high', 'medium', 'low'];

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K 聚焦搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Cmd/Ctrl + F 切换筛选器
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowFilters(prev => !prev);
      }
      
      // Escape 关闭所有弹窗
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowHistory(false);
        setSelectedHistoryIndex(-1);
      }
      
      // 方向键导航历史记录
      if (showHistory && searchHistory.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedHistoryIndex(prev => 
            prev < searchHistory.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedHistoryIndex(prev => 
            prev > 0 ? prev - 1 : searchHistory.length - 1
          );
        } else if (e.key === 'Enter' && selectedHistoryIndex >= 0) {
          e.preventDefault();
          const selected = searchHistory[selectedHistoryIndex];
          setSearchTerm(selected.term);
          setFilterState(prev => ({ ...prev, ...selected.filters, searchTerm: selected.term }));
          setShowHistory(false);
          setSelectedHistoryIndex(-1);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showHistory, searchHistory.length, selectedHistoryIndex]);

  // 点击外部关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setSelectedHistoryIndex(-1);
      }
      if (shortcutsRef.current && !shortcutsRef.current.contains(event.target as Node)) {
        // 可以添加更多外部点击处理
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 过滤逻辑
  const filterTodos = useCallback((todos: Entry[], filters: FilterState) => {
    return todos.filter(todo => {
      // 搜索词过滤
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const titleMatch = todo.content.toLowerCase().includes(searchTerm);
        const descriptionMatch = false; // Entry没有description属性
        const projectMatch = (todo.project_tag || '其他').toLowerCase().includes(searchTerm);
        
        if (!titleMatch && !descriptionMatch && !projectMatch) {
          return false;
        }
      }

      // 项目过滤
      if (filters.selectedProjects.length > 0) {
        const project = todo.project_tag || '其他';
        if (!filters.selectedProjects.includes(project)) {
          return false;
        }
      }

      // 状态过滤 - Entry没有status属性，跳过此过滤
      // if (filters.selectedStatuses.length > 0) {
      //   if (!filters.selectedStatuses.includes(todo.status)) {
      //     return false;
      //   }
      // }

      // 优先级过滤 - Entry没有priority属性，使用importance_tag
      if (filters.selectedPriorities.length > 0) {
        if (!filters.selectedPriorities.includes(todo.importance_tag?.toString() || '0')) {
          return false;
        }
      }

      return true;
    });
  }, []);

  // 应用过滤并更新结果
  useEffect(() => {
    // 只有当todos不为空时才进行过滤
    if (todos.length > 0) {
      const filtered = filterTodos(todos, filterState);
      onFilteredTodos(filtered);
    }
  }, [todos, filterState, filterTodos, onFilteredTodos]);

  // 保存搜索历史
  const saveToHistory = (term: string, filters: Partial<FilterState>) => {
    const newItem: SearchHistoryItem = {
      term,
      timestamp: Date.now(),
      filters
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.term !== term);
      return [newItem, ...filtered].slice(0, 10); // 保留最近10条
    });
  };

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilterState(prev => ({ ...prev, searchTerm: value }));
    
    if (value.trim()) {
      setShowHistory(false);
    }
  };

  // 处理搜索提交
  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      saveToHistory(searchTerm.trim(), {
        selectedProjects: filterState.selectedProjects,
        selectedStatuses: filterState.selectedStatuses,
        selectedPriorities: filterState.selectedPriorities
      });
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('');
    setFilterState(prev => ({ ...prev, searchTerm: '' }));
  };

  // 切换筛选器
  const toggleFilter = (type: keyof Omit<FilterState, 'searchTerm' | 'dateRange'>, value: string) => {
    setFilterState(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(item => item !== value)
        : [...prev[type], value]
    }));
  };

  // 清除所有筛选器
  const clearAllFilters = () => {
    setFilterState({
      searchTerm: searchTerm,
      selectedProjects: [],
      selectedStatuses: [],
      selectedPriorities: [],
      dateRange: { start: null, end: null }
    });
  };

  // 获取活跃筛选器数量
  const activeFilterCount = 
    filterState.selectedProjects.length + 
    filterState.selectedStatuses.length + 
    filterState.selectedPriorities.length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索栏 */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            ref={searchRef}
            type="text"
            placeholder="搜索任务... (Cmd/Ctrl + K)"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              } else if (e.key === 'ArrowDown' && searchHistory.length > 0) {
                setShowHistory(true);
                setSelectedHistoryIndex(0);
              }
            }}
            onFocus={() => {
              if (searchHistory.length > 0 && !searchTerm) {
                setShowHistory(true);
              }
            }}
            className="w-full pl-10 pr-10 py-2 glassmorphism-card text-sm focus:outline-none focus:ring-2 focus:ring-color-primary/50"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 搜索历史 */}
        {showHistory && searchHistory.length > 0 && (
          <div ref={historyRef} className="absolute top-full left-0 right-0 mt-1 glassmorphism-card z-50 max-h-48 overflow-y-auto">
            {searchHistory.map((item, index) => (
              <button
                key={item.timestamp}
                onClick={() => {
                  setSearchTerm(item.term);
                  setFilterState(prev => ({ ...prev, ...item.filters, searchTerm: item.term }));
                  setShowHistory(false);
                  setSelectedHistoryIndex(-1);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-background-subtle transition-colors ${
                  index === selectedHistoryIndex ? 'bg-background-subtle' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.term}</span>
                  <Clock className="w-3 h-3 text-text-muted" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 筛选器控制 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-1.5 glassmorphism-card text-sm hover:bg-background-subtle transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>筛选器</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-color-primary text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-color-primary hover:text-color-primary/80 transition-colors"
          >
            清除全部
          </button>
        )}
      </div>

      {/* 筛选面板 */}
      {showFilters && (
        <div className="glassmorphism-card p-4 space-y-4">
          {/* 项目筛选 */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-text-primary">项目</h4>
            <div className="flex flex-wrap gap-2">
              {allProjects.map(project => (
                <button
                  key={project}
                  onClick={() => toggleFilter('selectedProjects', project)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    filterState.selectedProjects.includes(project)
                      ? 'bg-color-primary text-white'
                      : 'bg-background-subtle text-text-secondary hover:bg-background-elevated'
                  }`}
                >
                  {project}
                </button>
              ))}
            </div>
          </div>

          {/* 状态筛选 */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-text-primary">状态</h4>
            <div className="flex flex-wrap gap-2">
              {allStatuses.map(status => (
                <button
                  key={status}
                  onClick={() => toggleFilter('selectedStatuses', status)}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full transition-colors ${
                    filterState.selectedStatuses.includes(status)
                      ? 'bg-color-primary text-white'
                      : 'bg-background-subtle text-text-secondary hover:bg-background-elevated'
                  }`}
                >
                  {status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : 
                   status === 'in_progress' ? <Clock className="w-3 h-3" /> : 
                   <Circle className="w-3 h-3" />}
                  <span>{status === 'in_progress' ? '进行中' : status === 'completed' ? '已完成' : '待办'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 优先级筛选 */}
          <div>
            <h4 className="text-sm font-medium mb-2 text-text-primary">优先级</h4>
            <div className="flex flex-wrap gap-2">
              {allPriorities.map(priority => (
                <button
                  key={priority}
                  onClick={() => toggleFilter('selectedPriorities', priority)}
                  className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full transition-colors ${
                    filterState.selectedPriorities.includes(priority)
                      ? 'bg-color-primary text-white'
                      : 'bg-background-subtle text-text-secondary hover:bg-background-elevated'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  <span className="capitalize">{priority}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 快捷键提示 */}
      <div className="text-xs text-text-muted space-y-1">
        <div>快捷键：</div>
        <div>• Cmd/Ctrl + K - 搜索</div>
        <div>• Cmd/Ctrl + F - 切换筛选器</div>
        <div>• Esc - 关闭弹窗</div>
      </div>
    </div>
  );
};