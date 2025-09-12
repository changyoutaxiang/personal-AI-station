'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trophy, Edit2, Save, X, Target, Star, Zap, Check } from 'lucide-react';
import { OKRGoal, KeyResult } from '@/types/todo';
import { useTheme } from './ThemeProvider';

interface OKRHeroBarProps {
  isVisible: boolean;
}

const goalIcons = [Target, Star, Zap];
const goalColors = [
  'from-pink-400 to-rose-400',
  'from-purple-400 to-indigo-400', 
  'from-emerald-400 to-teal-400'
];

export function OKRHeroBar({ isVisible }: OKRHeroBarProps) {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  
  const [goals, setGoals] = useState<OKRGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newKeyResult, setNewKeyResult] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // 从服务器加载OKR数据
  const fetchOKRs = async () => {
    try {
      const response = await fetch('/api/okrs');
      const result = await response.json();
      if (result.ok) {
        const serverGoals = result.data.map((record: any) => {
          const content = record.content && record.content.trim() !== '' ? JSON.parse(record.content) : {};
          const keyResults = record.key_results && record.key_results.trim() !== '' ? JSON.parse(record.key_results) : [];
          return {
            id: record.id,
            title: record.title,
            completed: record.completed === 1,
            createdAt: new Date(record.created_at),
            completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
            keyResults,
            goal_index: record.goal_index // 添加goal_index字段
          };
        });

        // 确保有3个OKR目标
        const mergedGoals: OKRGoal[] = [];
        
        // 首先处理已有的OKR数据（按创建时间排序）
        const sortedServerGoals = serverGoals.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        for (let i = 0; i < 3; i++) {
          if (i < sortedServerGoals.length) {
            // 使用现有的OKR数据
            const existingGoal = sortedServerGoals[i];
            const { goal_index, ...goalWithoutIndex } = existingGoal;
            mergedGoals.push(goalWithoutIndex);
          } else {
            // 创建空的OKR槽位
            mergedGoals.push({
              id: `temp_${Date.now()}_${i}`,
              title: '',
              completed: false,
              createdAt: new Date(),
              keyResults: []
            });
          }
        }
        setGoals(mergedGoals);
      }
    } catch (error) {
      console.error('加载OKR数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存OKR到服务器
  const saveOKRToServer = async (goal: OKRGoal) => {
    try {
      const response = await fetch('/api/okrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: goal.title,
          goalIndex: goals.indexOf(goal),
          keyResults: goal.keyResults,
          completed: goal.completed
        })
      });
      
      if (!response.ok) {
        throw new Error('保存失败');
      }
      
      const result = await response.json();
      if (result.ok && result.data) {
        // 更新本地状态中的ID
        setGoals(prev => prev.map(g => 
          g.id === goal.id ? { ...g, id: result.data.id } : g
        ));
      }
    } catch (error) {
      console.error('保存OKR失败:', error);
    }
  };

  // 更新OKR到服务器
  const updateOKROnServer = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/okrs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('更新OKR失败:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchOKRs();
    }
  }, [isVisible]);

  // 组件首次挂载时也要获取数据
  useEffect(() => {
    fetchOKRs();
  }, []);

  // 页面卸载时保存正在编辑的内容
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (editingGoal && editText.trim()) {
        // 清除自动保存定时器
        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
        }
        // 立即保存
        await autoSaveGoal(editingGoal, editText);
      }
    };

    const handleUnload = () => {
      if (editingGoal && editText.trim()) {
        // 使用 sendBeacon 进行最后的保存尝试
        const goal = currentGoals.find(g => g.id === editingGoal);
        if (goal) {
          const updatedGoal = { ...goal, title: editText.trim() };
          const data = JSON.stringify({
            title: updatedGoal.title,
            keyResults: updatedGoal.keyResults,
            completed: updatedGoal.completed
          });
          
          if (editingGoal.startsWith('temp_')) {
            navigator.sendBeacon('/api/okrs', data);
          } else {
            navigator.sendBeacon(`/api/okrs/${editingGoal}`, data);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [editingGoal, editText, autoSaveTimeout, goals]);

  const currentGoals: OKRGoal[] = Array.isArray(goals) ? goals : [];

  if (!isVisible) return null;

  // 显示加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  // 检查OKR是否应该自动完成
  const checkAutoComplete = (goal: OKRGoal) => {
    const hasKeyResults = goal.keyResults.length > 0;
    const allKeyResultsCompleted = goal.keyResults.every(kr => kr.completed);
    return hasKeyResults && allKeyResultsCompleted;
  };

  const toggleGoalCompletion = async (goalId: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const newCompleted = !goal.completed;
    const updatedGoal = {
      ...goal,
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : undefined
    };

    // 更新本地状态
    setGoals(currentGoals.map(g => g.id === goalId ? updatedGoal : g));
    
    // 同步到服务器
    if (goalId.startsWith('temp_')) {
      // 如果是临时ID，先保存到服务器
      await saveOKRToServer(updatedGoal);
    } else {
      await updateOKROnServer(goalId, {
        completed: newCompleted,
        title: updatedGoal.title,
        keyResults: updatedGoal.keyResults
      });
    }
  };

  const toggleKeyResult = async (goalId: string, keyResultId: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedKeyResults = goal.keyResults.map(kr => 
      kr.id === keyResultId ? { ...kr, completed: !kr.completed } : kr
    );
    
    let updatedGoal = { ...goal, keyResults: updatedKeyResults };
    
    // 检查是否需要自动完成OKR
    if (checkAutoComplete(updatedGoal) && !goal.completed) {
      updatedGoal = { ...updatedGoal, completed: true, completedAt: new Date() };
    }
    // 如果有未完成的key result，自动取消OKR完成状态
    else if (!updatedKeyResults.every(kr => kr.completed) && goal.completed) {
      updatedGoal = { ...updatedGoal, completed: false, completedAt: undefined };
    }
    
    // 更新本地状态
    setGoals(currentGoals.map(g => g.id === goalId ? updatedGoal : g));
    
    // 同步到服务器
    if (goalId.startsWith('temp_')) {
      // 如果是临时ID，先保存到服务器
      await saveOKRToServer(updatedGoal);
    } else {
      await updateOKROnServer(goalId, {
        title: updatedGoal.title,
        keyResults: updatedGoal.keyResults,
        completed: updatedGoal.completed
      });
    }
  };

  const addKeyResult = async (goalId: string) => {
    if (newKeyResult.trim()) {
      const goal = currentGoals.find(g => g.id === goalId);
      if (!goal) return;
      
      const newKR: KeyResult = {
        id: Date.now().toString(),
        text: newKeyResult.trim(),
        completed: false
      };
      
      const updatedGoal = {
        ...goal,
        keyResults: [...goal.keyResults, newKR]
      };
      
      // 更新本地状态
      setGoals(currentGoals.map(g => 
        g.id === goalId ? updatedGoal : g
      ));
      setNewKeyResult('');
      
      // 同步到服务器
      if (goalId.startsWith('temp_')) {
        // 如果是临时ID，先保存到服务器
        await saveOKRToServer(updatedGoal);
      } else {
        await updateOKROnServer(goalId, {
          title: updatedGoal.title,
          keyResults: updatedGoal.keyResults,
          completed: updatedGoal.completed
        });
      }
    }
  };

  const deleteKeyResult = async (goalId: string, keyResultId: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    const updatedGoal = {
      ...goal,
      keyResults: goal.keyResults.filter(kr => kr.id !== keyResultId)
    };
    
    // 更新本地状态
    setGoals(currentGoals.map(g => 
      g.id === goalId ? updatedGoal : g
    ));
    
    // 同步到服务器
    if (goalId.startsWith('temp_')) {
      // 如果是临时ID，先保存到服务器
      await saveOKRToServer(updatedGoal);
    } else {
      await updateOKROnServer(goalId, {
        title: updatedGoal.title,
        keyResults: updatedGoal.keyResults,
        completed: updatedGoal.completed
      });
    }
  };

  // 自动保存函数
  const autoSaveGoal = async (goalId: string, title: string) => {
    const goal = currentGoals.find(g => g.id === goalId);
    if (!goal || !title.trim()) return;
    
    const updatedGoal = { ...goal, title: title.trim() };
    
    // 更新本地状态
    setGoals(currentGoals.map(g =>
      g.id === goalId ? updatedGoal : g
    ));
    
    // 保存到服务器
    if (goalId.startsWith('temp_')) {
      await saveOKRToServer(updatedGoal);
    } else {
      await updateOKROnServer(goalId, {
        title: updatedGoal.title,
        keyResults: updatedGoal.keyResults,
        completed: updatedGoal.completed
      });
    }
  };

  // 处理文本变化并设置自动保存
  const handleTextChange = (value: string) => {
    setEditText(value);
    
    // 清除之前的定时器
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // 设置新的自动保存定时器（2秒后保存）
    if (editingGoal && value.trim()) {
      const timeout = setTimeout(() => {
        autoSaveGoal(editingGoal, value);
      }, 2000);
      setAutoSaveTimeout(timeout);
    }
  };

  const startEditing = (goal: OKRGoal) => {
    setEditingGoal(goal.id);
    setEditText(goal.title);
  };

  const saveEdit = async (goalId: string) => {
    if (editText.trim()) {
      const goal = currentGoals.find(g => g.id === goalId);
      if (!goal) return;
      
      const updatedGoal = {
        ...goal,
        title: editText.trim()
      };
      
      // 更新本地状态
      setGoals(currentGoals.map(g =>
        g.id === goalId ? updatedGoal : g
      ));
      
      // 同步到服务器
      if (goalId.startsWith('temp_')) {
        // 如果是临时ID，先保存到服务器
        await saveOKRToServer(updatedGoal);
      } else {
        // 如果是已存在的OKR，更新它
        await updateOKROnServer(goalId, {
          title: updatedGoal.title,
          keyResults: updatedGoal.keyResults,
          completed: updatedGoal.completed
        });
      }
    }
    setEditingGoal(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditText('');
  };

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {Array.isArray(currentGoals) && currentGoals.map((goal, index) => {
        const Icon = goalIcons[index];
        const colorClass = goalColors[index];
        const isEditing = editingGoal === goal.id;
        
        return (
          <div
            key={goal.id}
            className={`bg-gradient-to-r ${colorClass} rounded-2xl p-6 text-white relative group transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
          >
            {/* Completion Toggle */}
            <div className="absolute top-4 right-4">
              {goal.completed ? (
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer animate-bounce"
                     onClick={() => toggleGoalCompletion(goal.id)}>
                  <Trophy className="w-8 h-8 text-yellow-300" />
                </div>
              ) : (
                <button
                  onClick={() => toggleGoalCompletion(goal.id)}
                  className="w-8 h-8 border-2 border-white/50 rounded-full hover:border-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
                >
                  {/* Empty circle for uncompleted */}
                </button>
              )}
            </div>

            <div className="flex items-start justify-between pr-16">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon className="w-6 h-6 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">OKR # {index + 1}</span>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => handleTextChange(e.target.value)}
                      placeholder={`输入你的 OKR # ${index + 1} 目标...`}
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 resize-none focus:outline-none focus:border-white focus:bg-white/30 transition-all duration-200"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveEdit(goal.id)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <Save className="w-4 h-4" />
                        <span className="text-sm">保存</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span className="text-sm">取消</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {goal.title ? (
                      <div 
                        className={`text-lg font-bold leading-relaxed cursor-pointer hover:text-white/90 transition-colors duration-200 ${
                          goal.completed ? 'line-through opacity-75' : ''
                        }`}
                        onClick={() => startEditing(goal)}
                      >
                        {goal.title}
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(goal)}
                        className="text-left w-full p-3 border-2 border-dashed border-white/40 rounded-lg hover:border-white/60 hover:bg-white/10 transition-all duration-200 text-white/80 flex items-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>设定目标...</span>
                      </button>
                    )}
                    
                    {goal.title && !isEditing && (
                      <button
                        onClick={() => startEditing(goal)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/60 hover:text-white flex items-center space-x-1 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>编辑</span>
                      </button>
                    )}
                  </div>
                )}
                
                {/* Key Results */}
                {goal.title && !isEditing && (
                  <div className="mt-4 space-y-2">
                    {goal.keyResults.map((keyResult) => (
                      <div key={keyResult.id} className="flex items-center space-x-2 text-sm">
                        <button
                          onClick={() => toggleKeyResult(goal.id, keyResult.id)}
                          className={`w-4 h-4 border border-white/50 rounded flex items-center justify-center transition-all duration-200 ${
                            keyResult.completed ? 'bg-white/30' : 'hover:bg-white/20'
                          }`}
                        >
                          {keyResult.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-white/90 ${keyResult.completed ? 'line-through opacity-75' : ''}`}>
                          {keyResult.text}
                        </span>
                        <button
                          onClick={() => deleteKeyResult(goal.id, keyResult.id)}
                          className="text-white/50 hover:text-white/80 transition-colors duration-200 ml-auto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Key Result */}
                    {goal.keyResults.length < 3 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="text"
                          value={newKeyResult}
                          onChange={(e) => setNewKeyResult(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addKeyResult(goal.id);
                            }
                          }}
                          onBlur={() => {
                            if (newKeyResult.trim()) {
                              addKeyResult(goal.id);
                            }
                          }}
                          placeholder="添加关键结果..."
                          className="flex-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-sm text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
                        />
                        <button
                          onClick={() => addKeyResult(goal.id)}
                          className="text-white/70 hover:text-white transition-colors duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {goal.completed && goal.completedAt && (
              <div className="absolute bottom-4 left-6 text-white/70 text-xs">
                完成于 {new Date(goal.completedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}