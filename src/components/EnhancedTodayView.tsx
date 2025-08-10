'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Trophy, Sparkles, Trash2, Calendar, Search, Filter, Circle } from 'lucide-react';
import TodoForm from './TodoForm';
import { SearchFilter } from './SearchFilter';
import { SearchHighlighter } from './SearchHighlighter';
import { getAllTodosAction, deleteTodoAction, updateTodoAction } from '@/lib/actions';
import type { Todo } from '@/types/index';
import EmptyState from './ui/EmptyState';

// 周几映射
const weekdayMap = {
  monday: '周一',
  tuesday: '周二',
  wednesday: '周三',
  thursday: '周四',
  friday: '周五',
  saturday: '周六',
  sunday: '周日'
};

export const EnhancedTodayView = () => {
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有任务数据
  const fetchTodos = async () => {
    try {
      const result = await getAllTodosAction();
      if (result.success && result.data) {
        setAllTodos(result.data);
        setFilteredTodos(result.data);
      }
    } catch (error) {
      console.error('获取任务失败:', error);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchTodos();
  }, []);

  // 删除任务
  const handleDeleteTodo = async (todoId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('确定要删除这个任务吗？');
    
    if (confirmed) {
      try {
        const result = await deleteTodoAction(todoId);
        if (result.success) {
          await fetchTodos();
        } else {
          alert(result.error || '删除失败');
        }
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败: ' + (error instanceof Error ? error.message : '未知错误'));
      }
    }
  };

  // 处理筛选后的数据
  const handleFilteredTodos = (todos: Todo[]) => {
    setFilteredTodos(todos);
  };

  // 项目数据接口
  interface ProjectData {
    name: string;
    tasks: Todo[];
  }

  // 从筛选后的数据生成项目结构
  const generateProjectsData = (): ProjectData[] => {
    const projectMap = new Map<string, ProjectData>();
    
    // 预定义的项目列表
    const predefinedProjects = ['FSD', 'AIEC', '训战营', '管理会议', '组织赋能', '其他'];
    
    // 初始化所有预定义项目
    predefinedProjects.forEach(projectName => {
      projectMap.set(projectName, {
        name: projectName,
        tasks: []
      });
    });
    
    // 处理实际的todos数据
    filteredTodos.forEach(todo => {
      const projectName = todo.project_tag || '其他';
      
      if (!projectMap.has(projectName)) {
        projectMap.set(projectName, {
          name: projectName,
          tasks: []
        });
      }
      
      const project = projectMap.get(projectName)!;
      project.tasks.push(todo);
    });
    
    return Array.from(projectMap.values());
  };

  const projectsData = generateProjectsData();

  // 获取项目对应的颜色类
  const getProjectColorClasses = (projectName: string) => {
    const colorMap = {
      FSD: {
        headerStyle: {
          borderLeft: '4px solid var(--dynamic-primary)',
          backgroundColor: 'var(--dynamic-primary)/10'
        },
        titleStyle: { color: 'var(--dynamic-primary)' }
      },
      AIEC: {
        headerStyle: {
          borderLeft: '4px solid var(--flow-primary)',
          backgroundColor: 'var(--flow-primary)/10'
        },
        titleStyle: { color: 'var(--flow-primary)' }
      },
      训战营: {
        headerStyle: {
          borderLeft: '4px solid var(--text-success)',
          backgroundColor: 'var(--text-success)/10'
        },
        titleStyle: { color: 'var(--text-success)' }
      },
      管理会议: {
        headerStyle: {
          borderLeft: '4px solid var(--text-warning)',
          backgroundColor: 'var(--text-warning)/10'
        },
        titleStyle: { color: 'var(--text-warning)' }
      },
      组织赋能: {
        headerStyle: {
          borderLeft: '4px solid var(--dynamic-secondary)',
          backgroundColor: 'var(--dynamic-secondary)/10'
        },
        titleStyle: { color: 'var(--dynamic-secondary)' }
      },
      其他: {
        headerStyle: {
          borderLeft: '4px solid var(--text-secondary)',
          backgroundColor: 'var(--text-secondary)/10'
        },
        titleStyle: { color: 'var(--text-secondary)' }
      }
    };
    return colorMap[projectName as keyof typeof colorMap] || colorMap['其他'];
  };

  // 获取任务状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          badgeClass: 'bg-success/20 text-success',
          icon: <CheckCircle className="w-3 h-3 mr-1" />
        };
      case 'in_progress':
        return {
          badgeClass: 'bg-warning/20 text-warning',
          icon: <Sparkles className="w-3 h-3 mr-1" />
        };
      default:
        return {
          badgeClass: 'bg-text-secondary/20 text-text-secondary',
          icon: <Circle className="w-3 h-3 mr-1" />
        };
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-success';
    }
  };

  // 获取项目颜色
  const getProjectColor = (projectName: string) => {
    const projectColorMap = {
      FSD: 'var(--dynamic-primary)',
      AIEC: 'var(--flow-primary)',
      训战营: 'var(--text-success)',
      管理会议: 'var(--text-warning)',
      组织赋能: 'var(--dynamic-secondary)',
      其他: 'var(--text-secondary)'
    };
    return projectColorMap[projectName as keyof typeof projectColorMap] || projectColorMap['其他'];
  };

  const totalTasks = filteredTodos.length;
  const completedTasks = filteredTodos.filter(todo => todo.status === 'completed').length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="space-y-6">
      {/* 搜索和筛选区域 */}
      <div className="glassmorphism-card p-4 mb-6">
        <SearchFilter 
          todos={allTodos} 
          onFilteredTodos={handleFilteredTodos} 
        />
      </div>

      {/* 统计信息 */}
      {totalTasks > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glassmorphism-card p-3 text-center">
            <div className="text-2xl font-bold text-text-primary">{totalTasks}</div>
            <div className="text-sm text-text-muted">总任务</div>
          </div>
          <div className="glassmorphism-card p-3 text-center">
            <div className="text-2xl font-bold text-success">{completedTasks}</div>
            <div className="text-sm text-text-muted">已完成</div>
          </div>
          <div className="glassmorphism-card p-3 text-center">
            <div className="text-2xl font-bold text-warning">{pendingTasks}</div>
            <div className="text-sm text-text-muted">待完成</div>
          </div>
        </div>
      )}

      {/* 响应式网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projectsData.map((project) => {
          const colorClasses = getProjectColorClasses(project.name);
          const projectTaskCount = project.tasks.length;
          const completedCount = project.tasks.filter(todo => todo.status === 'completed').length;
          
          return (
            <div
              key={project.name}
              className="glassmorphism-card transform-3d flex flex-col h-full cursor-pointer"
              onClick={(e) => {
                // 只有点击空白区域时才触发添加任务
                const target = e.target as HTMLElement;
                if (target === e.currentTarget || target.closest('.project-content-area')) {
                  setSelectedProject(project.name);
                  setShowTodoForm(true);
                }
              }}
            >
              {/* 项目标题栏 */}
              <div
                className="flex items-center justify-between px-4 py-3 transition-colors"
                style={colorClasses.headerStyle}
              >
                <h3 className="text-sm font-semibold" style={colorClasses.titleStyle}>
                  {project.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-text-muted">
                    {completedCount}/{projectTaskCount}
                  </span>
                </div>
              </div>
              
              {/* 项目内容 */}
              <div className="p-4 flex-1 project-content-area bg-background">
                {project.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {project.tasks.map((task) => {
                      const statusStyle = getStatusStyle(task.status);
                      const projectColor = getProjectColor(project.name);
                      
                      return (
                        <div
                          key={task.id}
                          className={`glassmorphism-card relative cursor-pointer group ${
                            task.status === 'completed' 
                              ? 'border-success/30 bg-success/5' 
                              : 'border-border hover:border-color-primary/50'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTodo(task);
                            setShowTodoForm(true);
                          }}
                        >
                          {/* 删除按钮 */}
                          <button
                            onClick={(e) => handleDeleteTodo(task.id, e)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-normal p-1 rounded-full text-text-error hover:bg-text-error/10"
                            title="删除任务"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          
                          <div className="flex items-start pr-8">
                            <div className="flex-shrink-0">
                              {task.status === 'completed' ? (
                                <div className="relative">
                                  <CheckCircle className="w-4 h-4 text-success animate-pulse" />
                                  <div className="absolute -top-0.5 -right-0.5">
                                    <Sparkles className="w-2.5 h-2.5 text-warning" />
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="w-6 h-6 rounded-full border-2 transition-all duration-normal cursor-pointer hover:bg-color-primary/10 hover:scale-110 flex items-center justify-center group-hover:border-color-primary"
                                  style={{ borderColor: `${projectColor}/50` }}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const target = e.currentTarget as HTMLElement;
                                    target.classList.add('checkmark-animation');
                                    
                                    try {
                                      const result = await updateTodoAction(task.id, { status: 'completed' });
                                      if (result.success) {
                                        setTimeout(() => {
                                          fetchTodos();
                                        }, 300);
                                      } else {
                                        target.classList.remove('checkmark-animation');
                                      }
                                    } catch (error) {
                                      console.error('更新任务状态失败:', error);
                                      target.classList.remove('checkmark-animation');
                                    }
                                  }}
                                  title="点击标记为已完成"
                                >
                                  <div className="w-2 h-2 rounded-full bg-color-primary scale-0 group-hover:scale-100 transition-transform duration-normal"></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="ml-3 flex-1">
                              <div className="flex items-center">
                                <h3
                                  className={`text-sm font-medium break-words max-w-full ${
                                    task.status === 'completed' ? 'text-success line-through' : 'text-text-primary'
                                  }`}
                                >
                                  <SearchHighlighter
                                    text={task.title}
                                    searchTerm={searchTerm}
                                    className="text-sm font-medium"
                                  />
                                </h3>
                                
                                {task.status === 'completed' && (
                                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.badgeClass}`}
                                  >
                                    {statusStyle.icon}
                                    已完成
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-1 text-xs text-text-secondary">
                                {task.weekday && (
                                  <>
                                    <Calendar className="w-3 h-3" />
                                    <span>{weekdayMap[task.weekday as keyof typeof weekdayMap] || task.weekday}</span>
                                  </>
                                )}
                                
                                <span className={`capitalize ${getPriorityStyle(task.priority)}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              
                              {task.description && searchTerm && (
                                <div className="mt-1">
                                  <SearchHighlighter
                                    text={task.description}
                                    searchTerm={searchTerm}
                                    className="text-xs text-text-muted"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState 
                    type="todos"
                    size="small"
                    title={`${project.name}无任务`}
                    description={`为${project.name}项目添加任务`}
                    action={{
                      label: '添加任务',
                      onClick: () => {
                        setSelectedProject(project.name);
                        setShowTodoForm(true);
                      },
                      icon: '➕'
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredTodos.length === 0 && allTodos.length > 0 && (
        <div className="glassmorphism-card p-8 text-center">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">没有找到匹配的任务</h3>
          <p className="text-sm text-text-muted">
            尝试调整搜索条件或清除筛选器
          </p>
        </div>
      )}

      {allTodos.length === 0 && (
        <div className="glassmorphism-card p-8 text-center">
          <Trophy className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">欢迎开始！</h3>
          <p className="text-sm text-text-muted mb-4">
            还没有创建任何任务，开始添加你的第一个任务吧！
          </p>
          <button
            onClick={() => {
              setSelectedProject('FSD');
              setShowTodoForm(true);
            }}
            className="px-4 py-2 bg-color-primary text-white rounded-lg hover:bg-color-primary/80 transition-colors"
          >
            创建第一个任务
          </button>
        </div>
      )}
      
      {/* TodoForm 弹窗 */}
      {showTodoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 transition-opacity duration-normal"
        >
          <div className="glassmorphism-card p-6 w-full max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingTodo ? '编辑任务' : `为 ${selectedProject} 项目添加任务`}
              </h3>
            </div>
            <TodoForm
              defaultProject={selectedProject}
              editingTodo={editingTodo || undefined}
              onCancel={() => {
                setShowTodoForm(false);
                setSelectedProject('');
                setEditingTodo(null);
              }}
              onTodoCreated={() => {
                setShowTodoForm(false);
                setSelectedProject('');
                setEditingTodo(null);
                fetchTodos();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};