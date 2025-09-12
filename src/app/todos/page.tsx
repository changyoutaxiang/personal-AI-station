'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { CalendarDays, Clock, Target, Brain, MessageCircle, Code, BarChart3, Settings, FolderKanban, Timer } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Todo, Priority, Category, RepeatType, Theme } from '@/types/todo';
import { AddTodoForm } from '@/components/todos/AddTodoForm';
import { TodoItem } from '@/components/todos/TodoItem';
import { CalendarView } from '@/components/todos/CalendarView';
import { PriorityView } from '@/components/todos/PriorityView';
import { TagView } from '@/components/todos/TagView';
import { ViewSwitcher } from '@/components/todos/ViewSwitcher';
import { OKRHeroBar } from '@/components/todos/OKRHeroBar';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeSelector } from '@/components/todos/ThemeSelector';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { useNotification } from '@/hooks/todos/useNotification';
import { NotificationContainer } from '@/components/todos/NotificationContainer';

// Import Todo CSS styles
import '@/styles/todos.css';

type ViewMode = 'list' | 'calendar' | 'priority' | 'tag';

// 简化的API调用函数
async function fetchTodos(category: 'today' | 'week'): Promise<Todo[]> {
  try {
    const response = await fetch(`/api/todos?category=${category}`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('API错误:', data.error);
      return [];
    }
    
    // 转换数据格式
    return data.data.map((rec: any) => {
      try {
        const content = rec.content ? JSON.parse(rec.content) : {};
        return {
          id: rec.id,
          text: content.text || rec.title || '',
          completed: Boolean(rec.completed),
          category: content.category || rec.category || 'today',
          priority: content.priority || 'medium',
          createdAt: new Date(rec.created_at),
          dueDate: content.dueDate ? new Date(content.dueDate) : undefined,
          tags: content.tags || [],
          subTasks: content.subTasks || [],
          estimatedTime: content.estimatedTime,
          repeatType: content.repeatType || 'none'
        } as Todo;
      } catch (error) {
        console.error('数据转换错误:', error, rec);
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return [];
  }
}

// TodoPage内容组件
function TodoPageContent() {
  console.log('🚀 TodoPage组件开始渲染');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 基础状态
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [todayViewMode, setTodayViewMode] = useState<ViewMode>('list');
  const [weekViewMode, setWeekViewMode] = useState<ViewMode>('list');
  const [operationLoading, setOperationLoading] = useState<{ [key: string]: boolean }>({});
  const [showPomodoro, setShowPomodoro] = useState(false);
  
  // 自动创建待办的状态
  const [autoCreateContent, setAutoCreateContent] = useState<string>('');
  const [shouldAutoCreate, setShouldAutoCreate] = useState(false);
  const addFormRef = useRef<{ triggerAdd: (content: string) => void }>(null);
  
  // 根据当前标签页选择对应的视图模式
  const viewMode = activeTab === 'today' ? todayViewMode : weekViewMode;
  const setViewMode = activeTab === 'today' ? setTodayViewMode : setWeekViewMode;
  
  // 通知系统
  const { notifications, showSuccess, showError, removeNotification } = useNotification();
  
  // 处理URL参数，实现自动创建待办
  useEffect(() => {
    const action = searchParams.get('action');
    const content = searchParams.get('content');
    
    if (action === 'create' && content) {
      setAutoCreateContent(content);
      setShouldAutoCreate(true);
      
      // 清除URL参数，避免重复触发
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);
  
  // 当需要自动创建时，触发添加操作
  useEffect(() => {
    if (shouldAutoCreate && autoCreateContent && addFormRef.current) {
      // 延迟执行，确保组件完全加载
      setTimeout(() => {
        if (addFormRef.current) {
          addFormRef.current.triggerAdd(autoCreateContent);
          setShouldAutoCreate(false);
          setAutoCreateContent('');
        }
      }, 500);
    }
  }, [shouldAutoCreate, autoCreateContent]);
  
  // 手动加载数据的函数
  const loadTodos = async () => {
    setLoading(true);
    try {
      const data = await fetchTodos(activeTab);
      setTodos(data);
      console.log(`✅ 成功加载${activeTab}待办事项:`, data.length, '条');
    } catch (error) {
      console.error('加载待办事项失败:', error);
      showError('加载待办事项失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化加载 - 使用简单的按钮触发方式
  const handleInitialLoad = () => {
    loadTodos();
  };
  
  // 切换标签页时重新加载
  const handleTabChange = (tab: 'today' | 'week') => {
    setActiveTab(tab);
    // 延迟加载，确保状态更新完成
    setTimeout(() => {
      fetchTodos(tab).then(setTodos);
    }, 100);
  };
  
  // 过滤和排序逻辑
  const { todayTodos, weekTodos, finalTodos } = useMemo(() => {
    console.log(`📊 开始处理待办事项，总数: ${todos.length}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayFiltered = todos.filter(todo => {
      // 今日任务：只显示dueDate为今天的任务
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }
      // 如果没有设置dueDate，但category是today，也认为是今日任务
      return todo.category === 'today';
    });
    
    console.log(`今日待办过滤后: ${todayFiltered.length} 条`);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // 先获取本周所有任务（包含今日）
    const allWeekTodos = todos.filter(todo => {
      // 本周任务：包含category为'week'和'today'的所有任务
      if (todo.category === 'week' || todo.category === 'today') return true;
      if (todo.dueDate) {
        const dueDate = new Date(todo.dueDate);
        return dueDate >= weekStart && dueDate <= weekEnd;
      }
      const createdDate = new Date(todo.createdAt);
      return createdDate >= weekStart && createdDate <= weekEnd;
    });
    
    // 从本周任务中排除今日任务，避免重复显示
    const weekFiltered = allWeekTodos.filter(todo => {
      return !todayFiltered.some(todayTodo => todayTodo.id === todo.id);
    });
    
    console.log(`本周待办过滤后: ${weekFiltered.length} 条`);
    
    const final = activeTab === 'today' ? todayFiltered : weekFiltered;
    console.log(`最终显示: ${final.length} 条`);
    
    return {
      todayTodos: todayFiltered,
      weekTodos: weekFiltered,
      finalTodos: final
    };
  }, [todos, activeTab]);
  
  // 添加待办事项
  const addTodo = async (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todoData,
          category: activeTab
        })
      });
      
      const result = await response.json();
      if (result.ok) {
        loadTodos(); // 重新加载数据
        showSuccess('待办事项添加成功');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('添加待办事项失败:', error);
      showError('添加待办事项失败');
    }
  };
  
  // 切换完成状态
  const toggleTodo = async (id: string) => {
    console.log('🔄 开始切换任务状态:', id);
    setOperationLoading(prev => ({ ...prev, [id]: true }));
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) {
        console.log('❌ 未找到任务:', id);
        return;
      }
      console.log('📝 当前任务状态:', todo.completed, '将切换为:', !todo.completed);
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        })
      });
      
      const result = await response.json();
      if (result.ok) {
        loadTodos(); // 重新加载数据
        showSuccess(todo.completed ? '任务标记为未完成' : '任务标记为已完成');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('更新待办事项失败:', error);
      showError('更新待办事项失败');
    } finally {
      setOperationLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // 删除待办事项
  const deleteTodo = async (id: string) => {
    console.log('🗑️ 开始删除任务:', id);
    setOperationLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.ok) {
        loadTodos(); // 重新加载数据
        showSuccess('待办事项删除成功');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('删除待办事项失败:', error);
      showError('删除待办事项失败');
    } finally {
      setOperationLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // 更新待办事项
  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    setOperationLoading(prev => ({ ...prev, [id]: true }));
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...todo,
          ...updates
        })
      });
      
      const result = await response.json();
      if (result.ok) {
        loadTodos(); // 重新加载数据
        showSuccess('待办事项更新成功');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('更新待办事项失败:', error);
      showError('更新待办事项失败');
    } finally {
      setOperationLoading(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // 导航配置
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: FolderKanban,
      label: '项目',
      href: '/projects',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Code,
      label: 'HTML渲染',
      href: '/html-renderer',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    },
    {
      icon: Timer,
      label: '番茄钟',
      href: '#',
      color: 'from-red-500 to-orange-600',
      onClick: () => setShowPomodoro(!showPomodoro)
    }
  ];

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--background)'}}>
        {/* 平衡模式：简化背景装饰，保留品牌特色 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <NotificationContainer 
          notifications={notifications}
          onClose={removeNotification}
        />
        
        {/* 右上角导航 - 与其他页面保持一致，但移除随机背景图标（仅首页专属功能） */}
        <nav className="absolute top-6 right-6 z-20">
          <div className="flex gap-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={item.onClick || (() => router.push(item.href))}
                  className={`group relative p-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105 ${item.label === '番茄钟' && showPomodoro ? 'bg-purple-100' : ''}`}
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)'
                  }}
                  title={item.label}
                >
                  <IconComponent className="w-5 h-5" />
                  
                  {/* 悬停提示 */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="px-2 py-1 rounded whitespace-nowrap text-xs" style={{
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}>
                      {item.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Slogan - 与其他页面保持一致 */}
        <div className="text-center mb-8 pt-16">
          <h2 className="text-5xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            May the <span className="bg-gradient-to-r from-[var(--flow-primary)] to-[var(--flow-secondary)] bg-clip-text text-transparent">AI</span> be with you
          </h2>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
          {/* OKR Hero Bar - 暂时隐藏 */}
          {/* <div className="mb-8">
            <OKRHeroBar isVisible={true} />
          </div> */}
          
          {/* 标签页切换和控制按钮区域 */}
          <div className="mb-6">
            {/* 标签页切换 */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 border border-purple-200">
                <button
                  onClick={() => handleTabChange('today')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'today'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>今日任务</span>
                  <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {todayTodos.length}
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('week')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'week'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>本周任务</span>
                  <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {weekTodos.length}
                  </span>
                </button>
              </div>
            </div>
            

            
            {/* 视图切换器 - 仅在本周任务时显示 */}
            <ViewSwitcher
               activeView={viewMode}
               onViewChange={setViewMode}
               activeTab={activeTab}
             />
          </div>
          
          {/* 添加待办事项表单 */}
          <div className="mb-8">
            <AddTodoForm 
               ref={addFormRef}
               onAdd={(todoData) => addTodo({
                 ...todoData,
                 completed: false,
                 subTasks: []
               })} 
               activeTab={activeTab} 
             />
          </div>
          
          {/* 待办事项列表 */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">加载中...</p>
              </div>
            ) : finalTodos.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'today' ? '今日暂无任务' : '本周暂无任务'}
                </h3>
                <p className="text-gray-600 mb-4">
                  点击下方"加载数据"按钮获取待办事项，或添加新的任务开始您的高效之旅
                </p>
                <button
                  onClick={handleInitialLoad}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? '加载中...' : '加载数据'}
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {finalTodos.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          任务清单空空如也
                        </h3>
                        <p className="text-gray-500">
                          添加一些任务，开始你的高效之旅吧！
                        </p>
                      </div>
                    ) : (
                      finalTodos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          activeTab={activeTab}
                          onToggle={toggleTodo}
                          onDelete={deleteTodo}
                          onUpdate={updateTodo}
                          operationLoading={operationLoading}
                        />
                      ))
                    )}
                  </div>
                )}
                {viewMode === 'calendar' && (
                  <CalendarView
                     todos={finalTodos}
                     onToggle={toggleTodo}
                     onDelete={deleteTodo}
                     onUpdate={updateTodo}
                   />
                )}
                {viewMode === 'priority' && (
                  <PriorityView
                     todos={finalTodos}
                     onToggle={toggleTodo}
                     onDelete={deleteTodo}
                     onUpdate={updateTodo}
                     operationLoading={operationLoading}
                   />
                )}
                {viewMode === 'tag' && (
                  <TagView
                     todos={finalTodos}
                     onToggle={toggleTodo}
                     onDelete={deleteTodo}
                     onUpdate={updateTodo}
                     operationLoading={operationLoading}
                   />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

// 简化的TodoPage组件
export default function TodoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <TodoPageContent />
    </Suspense>
  );
}
