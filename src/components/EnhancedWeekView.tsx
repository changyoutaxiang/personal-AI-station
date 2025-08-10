'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  Trophy,
  Sparkles,
  LayoutGrid,
  List,
  Trash2,
  Search,
  Filter,
  Circle
} from 'lucide-react';
import TodoForm from './TodoForm';
import { SearchFilter } from './SearchFilter';
import { SearchHighlighter } from './SearchHighlighter';
import { getAllTodosAction, deleteTodoAction, updateTodoAction } from '@/lib/actions';
import type { Todo } from '@/types/index';
import EmptyState from './ui/EmptyState';

// 定义项目和子项目的颜色映射
const projectColors = {
  FSD: 'indigo',
  AIEC: 'blue',
  训战营: 'emerald',
  管理会议: 'amber',
  组织赋能: 'purple',
  其他: 'gray'
};

// 周几颜色映射
const dayColors = {
  周一: { color: 'var(--flow-primary)', bgColor: 'var(--flow-primary)/10' },
  周二: { color: 'var(--dynamic-secondary)', bgColor: 'var(--dynamic-secondary)/10' },
  周三: { color: 'var(--text-success)', bgColor: 'var(--text-success)/10' },
  周四: { color: 'var(--text-warning)', bgColor: 'var(--text-warning)/10' },
  周五: { color: 'var(--text-error)', bgColor: 'var(--text-error)/10' },
  周六: { color: 'var(--text-secondary)', bgColor: 'var(--text-secondary)/10' },
  周日: { color: 'var(--text-primary)', bgColor: 'var(--text-primary)/10' }
};

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

// Task接口定义
interface Task extends Todo {
  day: string;
  time: string;
}

interface Project {
  name: string;
  tasks: Task[];
}

interface TaskWithProject extends Task {
  projectName: string;
  projectColor: string;
}

export const EnhancedWeekView = () => {
  // 跟踪每个项目的展开状态
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    FSD: true,
    AIEC: false,
    训战营: false,
    管理会议: false,
    组织赋能: false,
    其他: false
  });

  // 添加任务表单状态
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);

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

  // 从todos数据生成项目结构
  const generateProjectsData = (): Project[] => {
    const projectMap = new Map();
    
    // 预定义的项目列表，确保即使没有任务也显示
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
      
      const project = projectMap.get(projectName);
      project.tasks.push({
        id: todo.id,
        title: todo.title,
        day: '周一', // 默认设置为周一
        time: '',
        status: todo.status,
        priority: todo.priority,
        project_tag: todo.project_tag,
        weekday: todo.weekday,
        sort_order: todo.sort_order,
        description: todo.description
      });
    });
    
    return Array.from(projectMap.values());
  };

  const projectsData = generateProjectsData();

  // 切换项目的展开/折叠状态
  const toggleProject = (project: string) => {
    setExpandedProjects({
      ...expandedProjects,
      [project]: !expandedProjects[project]
    });
  };

  // 获取项目对应的颜色类 - 统一设计系统
  const getProjectColorClasses = (projectName: string, isExpanded: boolean) => {
    const colorMap = {
      FSD: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--dynamic-primary)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--dynamic-primary)' : 'var(--dynamic-primary)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--dynamic-primary)' : 'var(--text-primary)'
        }
      },
      AIEC: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--flow-primary)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--flow-primary)' : 'var(--flow-primary)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--flow-primary)' : 'var(--text-primary)'
        }
      },
      训战营: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--text-success)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--text-success)' : 'var(--text-success)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--text-success)' : 'var(--text-primary)'
        }
      },
      管理会议: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--text-warning)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--text-warning)' : 'var(--text-warning)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--text-warning)' : 'var(--text-primary)'
        }
      },
      组织赋能: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--dynamic-secondary)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--dynamic-secondary)' : 'var(--dynamic-secondary)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--dynamic-secondary)' : 'var(--text-primary)'
        }
      },
      其他: {
        header: '',
        title: '',
        headerStyle: {
          backgroundColor: isExpanded ? 'var(--text-secondary)/10' : 'var(--card-glass)',
          borderLeft: `4px solid ${isExpanded ? 'var(--text-secondary)' : 'var(--text-secondary)/50'}`
        },
        titleStyle: {
          color: isExpanded ? 'var(--text-secondary)' : 'var(--text-primary)'
        }
      }
    };
    return colorMap[projectName as keyof typeof colorMap] || colorMap['其他'];
  };

  // 添加视图切换状态
  const [viewMode, setViewMode] = useState<'project' | 'calendar'>('project');

  // 按日期重组任务数据
  const getDayTasks = () => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dayTasksMap: Record<string, TaskWithProject[]> = {};
    
    days.forEach((day) => {
      dayTasksMap[day] = [];
    });

    projectsData.forEach((project) => {
      project.tasks.forEach((task) => {
        if (dayTasksMap[task.day]) {
          dayTasksMap[task.day].push({
            ...task,
            projectName: project.name,
            projectColor: projectColors[project.name as keyof typeof projectColors] || 'gray'
          });
        }
      });
    });

    return dayTasksMap;
  };

  const dayTasks = getDayTasks();
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // 获取任务状态样式
  const getTaskStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          badgeClass: 'bg-success/20 text-success',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'in_progress':
        return {
          badgeClass: 'bg-warning/20 text-warning',
          icon: <Sparkles className="w-3 h-3" />
        };
      default:
        return {
          badgeClass: 'bg-text-secondary/20 text-text-secondary',
          icon: <Circle className="w-3 h-3" />
        };
    }
  };

  // 获取优先级样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      default: return 'text-success';
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">本周任务</h2>
          <p className="text-sm text-text-muted">
            共{totalTasks}个任务，{completedTasks}个已完成
          </p>
        </div>
        <div className="flex space-x-1 p-1 rounded-lg bg-background-elevated border border-border">
          <button
            onClick={() => setViewMode('project')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-normal ${
              viewMode === 'project'
                ? 'bg-background text-color-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <List className="w-4 h-4 mr-1.5" />
            项目视图
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-normal ${
              viewMode === 'calendar'
                ? 'bg-background text-color-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            日历视图
          </button>
        </div>
      </div>

      {viewMode === 'project' ? (
        <div className="space-y-6">
          {projectsData.map((project) => {
            const colorClasses = getProjectColorClasses(
              project.name,
              expandedProjects[project.name]
            );
            const projectTaskCount = project.tasks.length;
            const completedCount = project.tasks.filter(task => task.status === 'completed').length;
            
            return (
              <div
                key={project.name}
                className="glassmorphism-card transform-3d overflow-hidden"
              >
                {/* 项目标题栏 */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-normal hover:bg-background-subtle group"
                  style={colorClasses.headerStyle}
                  onClick={() => toggleProject(project.name)}
                >
                  <h3 className="text-sm font-semibold" style={colorClasses.titleStyle}>
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-text-muted">
                      {completedCount}/{projectTaskCount}
                    </span>
                    <div>
                      {expandedProjects[project.name] ? (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 项目内容 */}
                {expandedProjects[project.name] && (
                  <div 
                    className="p-4 project-content-area cursor-pointer transition-colors bg-background"
                    onClick={(e) => {
                      // 只有点击空白区域时才触发添加任务
                      if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.project-content-area')) {
                        setSelectedProject(project.name);
                        setShowTodoForm(true);
                      }
                    }}
                  >
                    {project.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {project.tasks.map((task) => {
                          const projectColor = getProjectColor(project.name);
                          const statusStyle = getTaskStatusStyle(task.status);
                          
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
                                        searchTerm=""
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
                                        <Calendar className="w-3 h-3 mr-1" />
                                        <span>{weekdayMap[task.weekday as keyof typeof weekdayMap] || task.weekday}</span>
                                      </>
                                    )}
                                    <span className={`capitalize ${getPriorityStyle(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                  </div>
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => (
            <div key={day} className="flex flex-col">
              <div
                className="text-center py-2 rounded-t-md text-sm font-medium"
                style={{
                  backgroundColor: dayColors[day as keyof typeof dayColors]?.bgColor || 'var(--card-glass)'
                }}
              >
                <span style={{
                  color: dayColors[day as keyof typeof dayColors]?.color || 'var(--text-primary)'
                }}
                >
                  {day}
                </span>
              </div>
              <div className="glassmorphism-card p-2 flex-1 min-h-[400px]">
                {dayTasks[day] && dayTasks[day].length > 0 ? (
                  <div className="space-y-2">
                    {dayTasks[day].map((task) => {
                      const taskStatusStyle = getTaskStatusStyle(task.status);
                      const projectColor = getProjectColor(task.projectName);
                      
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
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-normal p-0.5 rounded-full text-text-error hover:bg-text-error/10"
                            title="删除任务"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                          
                          <div className="flex items-start pr-5">
                            <div className="flex-shrink-0">
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-3 h-3 text-success" />
                              ) : (
                                <div
                                  className="w-5 h-5 rounded-full border transition-colors cursor-pointer hover:bg-color-primary/10 flex items-center justify-center"
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
                                ></div>
                              )}
                            </div>
                            <div className="ml-2 flex-1">
                              <div className="flex items-center">
                                <h3
                                  className={`text-xs font-medium break-words max-w-full ${
                                    task.status === 'completed' ? 'text-success line-through' : 'text-text-primary'
                                  }`}
                                >
                                  <SearchHighlighter
                                    text={task.title}
                                    searchTerm=""
                                    className="text-xs font-medium"
                                  />
                                </h3>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                <span
                                  className="inline-block px-1 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: `${projectColor}/20`,
                                    color: projectColor
                                  }}
                                >
                                  {task.projectName}
                                </span>
                                <span className={`text-xs text-text-muted capitalize ${getPriorityStyle(task.priority)}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-2">
                    <EmptyState 
                      type="todos"
                      size="small"
                      title={`${day}无任务`}
                      description="点击日期添加任务"
                      className="bg-transparent border-0"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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