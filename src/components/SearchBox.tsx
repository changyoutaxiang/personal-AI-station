'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  quickSearchAction, 
  getSearchStatsAction
} from '@/lib/actions';
import type { Entry, SearchResult } from '@/types/index';
import { debug } from '@/lib/debug';


interface SearchStats {
  topProjects: Array<{ project_tag: string; count: number }>;
  topPeople: Array<{ person_tag: string; count: number }>;
  importanceDistribution: Array<{ importance_tag: number; count: number }>;
}

interface SearchBoxProps {
  onSearchResults: (results: SearchResult) => void;
  onClearSearch: () => void;
}

export default function SearchBox({ onSearchResults, onClearSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickResults, setQuickResults] = useState<Entry[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStats>({
    topProjects: [],
    topPeople: [],
    importanceDistribution: []
  });


  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 加载搜索统计信息
  useEffect(() => {
    loadSearchStats();
  }, []);

  const loadSearchStats = async () => {
    try {
      const result = await getSearchStatsAction();
      if (result.success) {
        setSearchStats(result.data as SearchStats);
      }
    } catch (error) {
      debug.error('加载搜索统计失败:', error);
    }
  };



  // 执行搜索
  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      onClearSearch();
      return;
    }

    setIsSearching(true);
    setSearchProgress('正在搜索数据库...');
    
    try {
      const result = await quickSearchAction(searchQuery, 50);
      
      if (result.success) {
        setSearchProgress('正在处理搜索结果...');
        
        // 转换为SearchResult格式
        const searchResult = {
          entries: result.data,
          totalCount: result.data.length,
          searchTime: 0,
          searchTerms: searchQuery.split(' '),
          suggestions: []
        };
        
        onSearchResults(searchResult);
      }
    } catch (error) {
      debug.error('搜索失败:', error);
      setSearchProgress('搜索失败，请重试');
    } finally {
      setIsSearching(false);
      setSearchProgress('');
    }
  };

  // 快速搜素建议
  const handleQuickSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setQuickResults([]);
      return;
    }

    try {
      const result = await quickSearchAction(searchQuery, 5);
      if (result.success) {
        setQuickResults(result.data);
      }
    } catch (error) {
      debug.error('快速搜索失败:', error);
    }
  };

  // 输入变化处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的定时器
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        handleQuickSearch(value);
        setShowSuggestions(true);
      } else {
        setQuickResults([]);
        setShowSuggestions(false);
        onClearSearch();
      }
    }, 300);
  };

  // 键盘事件处理
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // 清除搜索
  const handleClear = () => {
    setQuery('');
    setQuickResults([]);
    setShowSuggestions(false);
    onClearSearch();
  };

  // 选择快速搜索结果
  const handleSelectQuickResult = (entry: Entry) => {
    setQuery(entry.content.substring(0, 50) + '...');
    setShowSuggestions(false);
    handleSearch(entry.content);
  };

  // 选择搜索标签
  const handleSelectTag = (tag: string) => {
    setQuery(tag);
    handleSearch(tag);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      {/* 主搜索框 */}
      <div className="relative">
        <div className="flex items-center border rounded-lg" style={{
          backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
          borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
        }}>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              onFocus={() => query && setShowSuggestions(true)}
              placeholder="搜索记录内容、项目、人物... (支持拼音搜索)"
              className="w-full px-4 py-3 pr-10 text-sm border-none rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50 transition-colors"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                '--placeholder-color': 'var(--text-secondary)'
              } as React.CSSProperties & { '--placeholder-color': string }}
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex items-center border-l" style={{ borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))' }}>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="px-4 py-3 rounded-r-lg hover:opacity-80 disabled:opacity-50 transition-all duration-200 min-w-[80px] flex items-center justify-center"
              style={{
                backgroundColor: 'var(--flow-primary, #0ea5e9)',
                color: 'white'
              }}
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span className="text-xs">搜索中</span>
                </div>
              ) : (
                <span>🔍 搜索</span>
              )}
            </button>
          </div>
        </div>

        {/* 搜索进度指示器 */}
        {isSearching && searchProgress && (
          <div className="mt-2 px-4 py-2 border rounded-lg" style={{
            backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
          }}>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-t-transparent" style={{
                borderColor: 'var(--flow-primary, #0ea5e9)',
                borderTopColor: 'transparent'
              }}></div>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{searchProgress}</span>
            </div>
          </div>
        )}

        {/* 搜索建议下拉框 */}
        {showSuggestions && (query || searchStats.topProjects.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto" style={{
            backgroundColor: 'var(--background, #ffffff)',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
          }}>
            {/* 快速搜索结果 */}
            {quickResults.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>💡 搜索建议</div>
                {quickResults.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectQuickResult(entry)}
                    className="w-full text-left p-2 hover:opacity-80 rounded text-sm"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-glass, rgba(255, 255, 255, 0.1))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div className="truncate">
                      {entry.content.length > 60 
                        ? entry.content.substring(0, 60) + '...'
                        : entry.content
                      }
                    </div>
                    <div className="flex gap-1 mt-1">
                      {entry.project_tag && (
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{
                          backgroundColor: 'var(--flow-primary)/20',
                          color: 'var(--flow-primary)'
                        }}>
                          {entry.project_tag}
                        </span>
                      )}
                      {entry.person_tag && (
                        <span className="px-1.5 py-0.5 rounded text-xs" style={{
                          backgroundColor: 'var(--text-success)/20',
                          color: 'var(--text-success)'
                        }}>
                          {entry.person_tag}
                        </span>
                      )}

                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 热门标签 */}
            {!query && (
              <div className="p-3 border-t" style={{ borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))' }}>
                {searchStats.topProjects.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>🏷️ 热门项目</div>
                    <div className="flex flex-wrap gap-1">
                      {searchStats.topProjects.slice(0, 5).map((project) => (
                        <button
                          key={project.project_tag}
                          onClick={() => handleSelectTag(project.project_tag)}
                          className="px-2 py-1 rounded text-xs hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--flow-primary, #0ea5e9)',
                            color: 'white'
                          }}
                        >
                          {project.project_tag} ({project.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchStats.topPeople.length > 0 && (
                  <div>
                    <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>👥 相关人物</div>
                    <div className="flex flex-wrap gap-1">
                      {searchStats.topPeople.slice(0, 5).map((person) => (
                        <button
                          key={person.person_tag}
                          onClick={() => handleSelectTag(person.person_tag)}
                          className="px-2 py-1 rounded text-xs hover:opacity-80"
                          style={{
                            backgroundColor: 'var(--text-success)/20',
                            color: 'var(--text-success)'
                          }}
                        >
                          {person.person_tag} ({person.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            )}
          </div>
        )}
      </div>





      {/* 点击外部关闭建议框 */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSuggestions(false)}
        />
      )}


    </div>
  );
}