'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Trophy, Sparkles, Trash2, Calendar } from 'lucide-react';
import TodoForm from './TodoForm';
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



export const TodayView = () => {
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);

  // 获取所有任务数据
  const fetchTodos = async () => {
    try {
      const result = await getAllTodosAction();
      if (result.success && result.data) {
        setTodos(result.data);
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
    console.log('删除按钮被点击，任务ID:', todoId);
    
    const confirmed = window.confirm('确定要删除这个任务吗？');
    console.log('用户确认结果:', confirmed);
    
    if (confirmed) {
      try {
        console.log('开始调用删除API...');
        const result = await deleteTodoAction(todoId);
        console.log('删除API返回结果:', result);
        
        if (result.success) {
          console.log('删除成功，重新获取数据...');
          await fetchTodos(); // 重新获取数据
          alert('任务删除成功！');
        } else {
          console.error('删除失败:', result.error);
          alert(result.error || '删除失败');
        }
      } catch (error) {
        console.error('删除任务失败:', error);
        alert('删除任务失败: ' + (error instanceof Error ? error.message : '未知错误'));
      }
    }
  };

  // 从todos数据生成项目结构
  const generateProjectsData = () => {
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
    todos.forEach(todo => {
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
        time: '',
        completed: todo.status === 'completed'
      });
    });
    
    return Array.from(projectMap.values());
  };

  const projectsData = generateProjectsData();



  // 获取项目对应的颜色类 - 统一设计系统
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

  return (
    <div className="space-y-6">
      {/* 响应式网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {projectsData.map((project) => {
          const colorClasses = getProjectColorClasses(project.name);
          return (
            <div
              key={project.name}
              className="glassmorphism-card transform-3d flex flex-col h-full cursor-pointer"
              onClick={(e) => {
                // 只有点击空白区域时才触发添加任务
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.project-content-area')) {
                  setSelectedProject(project.name);
                  setShowTodoForm(true);
                }
              }}
            >
              {/* 项目标题栏 */}
              <div
                className="flex items-center px-4 py-3 transition-colors"
                style={colorClasses.headerStyle}
              >
                <h3 className="text-sm font-semibold" style={colorClasses.titleStyle}>
                  {project.name}
                </h3>
              </div>
              {/* 项目内容 - 直接显示 */}
              <div className="p-4 flex-1 project-content-area bg-background">
                  {project.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {project.tasks.map((task: Todo) => {
                                const getTaskColors = (projectName: string) => {
                                  const taskColorMap = {
                                    FSD: {
                                      borderColor: 'border-color-primary/30',
                                      circleColor: 'border-color-primary/50'
                                    },
                                    AIEC: {
                                      borderColor: 'border-color-secondary/30',
                                      circleColor: 'border-color-secondary/50'
                                    },
                                    训战营: {
                                      borderColor: 'border-success/30',
                                      circleColor: 'border-success/50'
                                    },
                                    管理会议: {
                                      borderColor: 'border-warning/30',
                                      circleColor: 'border-warning/50'
                                    },
                                    组织赋能: {
                                      borderColor: 'border-color-secondary/30',
                                      circleColor: 'border-color-secondary/50'
                                    },
                                    其他: {
                                      borderColor: 'border-text-secondary/30',
                                      circleColor: 'border-text-secondary/50'
                                    }
                                  };
                                  return taskColorMap[projectName as keyof typeof taskColorMap] || taskColorMap['其他'];
                                };
                                const taskColors = getTaskColors(project.name);
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
                                            className={`w-6 h-6 rounded-full border-2 ${taskColors.circleColor} transition-all duration-normal cursor-pointer hover:bg-color-primary/10 hover:scale-110 flex items-center justify-center group-hover:border-color-primary`}
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              const target = e.currentTarget as HTMLElement;
                                              target.classList.add('checkmark-animation');
                                              
                                              try {
                                                const result = await updateTodoAction(task.id, { status: 'completed' });
                                                if (result.success) {
                                                  // 添加完成动画延迟，让用户看到反馈
                                                  setTimeout(() => {
                                                    fetchTodos(); // 刷新数据
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
                                            {task.title}
                                          </h3>
                                          {task.status === 'completed' && (
                                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                                              <Trophy className="w-2.5 h-2.5 mr-1" />
                                              已完成
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center mt-1 text-xs text-text-secondary">
                                          {task.weekday && (
                                            <>
                                              <Calendar className="w-3 h-3 mr-1" />
                                              <span className="mr-2 text-color-secondary">
                                                {weekdayMap[task.weekday as keyof typeof weekdayMap] || task.weekday}
                                              </span>
                                            </>
                                          )}
                                          <span className="capitalize">{task.priority}</span>
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
                      title="今日无任务"
                      description="点击添加新任务开始今天的工作"
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
      
      {/* TodoForm 弹窗 */}
      {showTodoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 transition-opacity duration-normal">
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
                 fetchTodos(); // 重新获取数据
               }}
             />
          </div>
        </div>
      )}
    </div>
  );
};