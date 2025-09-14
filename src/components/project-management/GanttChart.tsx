'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  AlertCircle,
  Users,
  Flag,
  CheckCircle2,
  Circle,
  Milestone,
  Link2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWeekend } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { GanttTask, ViewMode, ProjectTask } from '@/types/project-management';
import { TrelloCard } from '@/types/trello';

interface GanttChartProps {
  tasks: (TrelloCard | ProjectTask)[];
  viewMode?: ViewMode;
  onTaskClick?: (task: TrelloCard | ProjectTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
  initialShowDependencies?: boolean;
  initialShowCriticalPath?: boolean;
  initialShowResourceNames?: boolean;
  initialShowProgress?: boolean;
  height?: number;
}

export function GanttChart({
  tasks,
  viewMode = 'Week',
  onTaskClick,
  onTaskUpdate,
  initialShowDependencies = true,
  initialShowCriticalPath = true,
  initialShowResourceNames = true,
  initialShowProgress = true,
  height = 600,
}: GanttChartProps) {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);
  const [zoom, setZoom] = useState(1);

  // 添加状态来管理复选框
  const [showDependencies, setShowDependencies] = useState(initialShowDependencies);
  const [showCriticalPath, setShowCriticalPath] = useState(initialShowCriticalPath);
  const [showResourceNames, setShowResourceNames] = useState(initialShowResourceNames);
  const [showProgress, setShowProgress] = useState(initialShowProgress);

  // 转换任务数据为甘特图格式
  const ganttTasks = useMemo(() => {
    return tasks.map(task => {
      const isProjectTask = 'plannedStartDate' in task;
      const startDate = isProjectTask && task.plannedStartDate
        ? new Date(task.plannedStartDate)
        : task.createdAt ? new Date(task.createdAt) : new Date();

      const endDate = isProjectTask && task.plannedEndDate
        ? new Date(task.plannedEndDate)
        : task.dueDate ? new Date(task.dueDate) : addDays(startDate, 7);

      const progress = isProjectTask && task.percentComplete
        ? task.percentComplete
        : task.completed ? 100 : 0;

      const taskType = isProjectTask && task.taskType === 'milestone' ? 'milestone' : 'task';

      return {
        id: task.id,
        title: task.title,
        startDate,
        endDate,
        progress,
        type: taskType,
        dependencies: isProjectTask ? task.predecessors || [] : [],
        isCritical: isProjectTask && task.isCriticalPath,
        resources: task.members?.map(m => m.name) || [],
        priority: task.priority,
        status: task.completed ? 'completed' : 'in-progress',
      };
    });
  }, [tasks]);

  // 计算时间范围
  const { startDate, endDate, days } = useMemo(() => {
    if (ganttTasks.length === 0) {
      const start = new Date();
      const end = addDays(start, 30);
      return { startDate: start, endDate: end, days: 30 };
    }

    const allDates = ganttTasks.flatMap(task => [task.startDate, task.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // 添加缓冲区
    const start = addDays(minDate, -7);
    const end = addDays(maxDate, 7);
    const totalDays = differenceInDays(end, start);

    return { startDate: start, endDate: end, days: totalDays };
  }, [ganttTasks]);

  // 生成时间刻度
  const timeScale = useMemo(() => {
    const scale = [];
    let current = startDate;

    while (current <= endDate) {
      switch (currentViewMode) {
        case 'Day':
          scale.push({
            date: current,
            label: format(current, 'MM/dd', { locale: zhCN }),
            isWeekend: isWeekend(current),
          });
          current = addDays(current, 1);
          break;
        case 'Week':
          const weekStart = startOfWeek(current, { locale: zhCN });
          const weekEnd = endOfWeek(current, { locale: zhCN });
          scale.push({
            date: weekStart,
            label: `${format(weekStart, 'MM/dd')} - ${format(weekEnd, 'MM/dd')}`,
            isWeekend: false,
          });
          current = addDays(weekEnd, 1);
          break;
        case 'Month':
          const monthStart = startOfMonth(current);
          scale.push({
            date: monthStart,
            label: format(monthStart, 'yyyy年MM月', { locale: zhCN }),
            isWeekend: false,
          });
          current = addDays(endOfMonth(current), 1);
          break;
        default:
          current = addDays(current, 1);
      }
    }

    return scale;
  }, [startDate, endDate, currentViewMode]);

  // 计算任务条的位置和宽度
  const calculateTaskPosition = useCallback((task: typeof ganttTasks[0]) => {
    const totalWidth = 100; // 百分比
    const taskStart = differenceInDays(task.startDate, startDate);
    const taskDuration = differenceInDays(task.endDate, task.startDate) || 1;

    const left = (taskStart / days) * totalWidth;
    const width = (taskDuration / days) * totalWidth;

    return { left: `${left}%`, width: `${width}%` };
  }, [startDate, days]);

  // 获取任务优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  // 处理任务点击
  const handleTaskClick = (task: typeof ganttTasks[0]) => {
    setSelectedTask(task.id);
    const originalTask = tasks.find(t => t.id === task.id);
    if (originalTask && onTaskClick) {
      onTaskClick(originalTask);
    }
  };

  // 处理视图模式切换
  const handleViewModeChange = (mode: ViewMode) => {
    setCurrentViewMode(mode);
  };

  // 处理缩放
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoom(prev => Math.min(prev + 0.1, 2));
    } else {
      setZoom(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800">甘特图</h3>

            {/* 视图模式选择 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewModeChange('Day')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  currentViewMode === 'Day'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                日
              </button>
              <button
                onClick={() => handleViewModeChange('Week')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  currentViewMode === 'Week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                周
              </button>
              <button
                onClick={() => handleViewModeChange('Month')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  currentViewMode === 'Month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                月
              </button>
            </div>

            {/* 缩放控制 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleZoom('out')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={zoom >= 2}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 显示选项 */}
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showDependencies}
                onChange={(e) => setShowDependencies(e.target.checked)}
                className="rounded"
              />
              <span>显示依赖</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showCriticalPath}
                onChange={(e) => setShowCriticalPath(e.target.checked)}
                className="rounded"
              />
              <span>关键路径</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showProgress}
                onChange={(e) => setShowProgress(e.target.checked)}
                className="rounded"
              />
              <span>进度</span>
            </label>
          </div>
        </div>
      </div>

      {/* 甘特图主体 */}
      <div
        className="relative overflow-auto"
        style={{ height, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <div className="flex">
          {/* 任务列表 */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            {/* 表头 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>任务名称</span>
                <div className="flex items-center space-x-4">
                  <span>开始</span>
                  <span>结束</span>
                  <span>进度</span>
                </div>
              </div>
            </div>

            {/* 任务行 */}
            <div>
              {ganttTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    border-b border-gray-200 p-3 hover:bg-gray-100 cursor-pointer
                    ${selectedTask === task.id ? 'bg-blue-50' : ''}
                  `}
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      {task.type === 'milestone' ? (
                        <Milestone className="w-4 h-4 text-purple-500" />
                      ) : task.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{format(task.startDate, 'MM/dd')}</span>
                      <span>{format(task.endDate, 'MM/dd')}</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                  </div>

                  {showResourceNames && task.resources.length > 0 && (
                    <div className="mt-1 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {task.resources.join(', ')}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* 时间轴和任务条 */}
          <div className="flex-1 relative">
            {/* 时间刻度头 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 h-12 flex">
              {timeScale.map((scale, index) => (
                <div
                  key={index}
                  className={`
                    flex-1 border-r border-gray-200 px-2 py-3 text-xs text-center
                    ${scale.isWeekend ? 'bg-gray-50' : ''}
                  `}
                >
                  <span className="text-gray-600">{scale.label}</span>
                </div>
              ))}
            </div>

            {/* 任务条区域 */}
            <div className="relative">
              {/* 网格背景 */}
              <div className="absolute inset-0 flex">
                {timeScale.map((scale, index) => (
                  <div
                    key={index}
                    className={`
                      flex-1 border-r border-gray-100
                      ${scale.isWeekend ? 'bg-gray-50' : ''}
                    `}
                  />
                ))}
              </div>

              {/* 任务条 */}
              {ganttTasks.map((task, index) => {
                const position = calculateTaskPosition(task);
                const isOverdue = task.endDate < new Date() && task.progress < 100;

                return (
                  <div
                    key={task.id}
                    className="relative h-12 border-b border-gray-200"
                    style={{ height: showResourceNames && task.resources.length > 0 ? '56px' : '48px' }}
                  >
                    {/* 任务条 */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="absolute top-1/2 transform -translate-y-1/2"
                      style={{
                        left: position.left,
                        width: position.width,
                      }}
                    >
                      {task.type === 'milestone' ? (
                        // 里程碑样式
                        <div className="flex items-center justify-center h-8">
                          <div className="w-8 h-8 bg-purple-500 transform rotate-45 flex items-center justify-center">
                            <Flag className="w-4 h-4 text-white transform -rotate-45" />
                          </div>
                        </div>
                      ) : (
                        // 普通任务条
                        <div
                          className={`
                            h-8 rounded-lg overflow-hidden relative
                            ${task.isCritical ? 'ring-2 ring-red-500' : ''}
                            ${isOverdue ? 'animate-pulse' : ''}
                          `}
                        >
                          {/* 背景 */}
                          <div
                            className={`
                              absolute inset-0
                              ${getPriorityColor(task.priority)} opacity-30
                            `}
                          />

                          {/* 进度条 */}
                          {showProgress && (
                            <div
                              className={`
                                absolute top-0 left-0 h-full
                                ${getPriorityColor(task.priority)}
                              `}
                              style={{ width: `${task.progress}%` }}
                            />
                          )}

                          {/* 任务标题 */}
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs text-gray-700 font-medium truncate">
                              {task.title}
                            </span>
                          </div>

                          {/* 警告图标 */}
                          {isOverdue && (
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>

                    {/* 依赖线 */}
                    {showDependencies && task.dependencies.length > 0 && (
                      <svg
                        className="absolute inset-0 pointer-events-none"
                        style={{ overflow: 'visible' }}
                      >
                        {task.dependencies.map(depId => {
                          const depTask = ganttTasks.find(t => t.id === depId);
                          if (!depTask) return null;

                          const depPosition = calculateTaskPosition(depTask);

                          return (
                            <line
                              key={`${task.id}-${depId}`}
                              x1={`calc(${depPosition.left} + ${depPosition.width})`}
                              y1="24"
                              x2={position.left}
                              y2="24"
                              stroke="#9CA3AF"
                              strokeWidth="1"
                              strokeDasharray="4"
                              markerEnd="url(#arrowhead)"
                            />
                          );
                        })}

                        {/* 箭头定义 */}
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="9"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              fill="#9CA3AF"
                            />
                          </marker>
                        </defs>
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-gray-600">普通任务</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-purple-500 transform rotate-45"></div>
              <span className="text-gray-600">里程碑</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
              <span className="text-gray-600">关键路径</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">逾期</span>
            </div>
          </div>

          <div className="text-gray-500">
            共 {ganttTasks.length} 个任务 •
            {ganttTasks.filter(t => t.status === 'completed').length} 个已完成 •
            {ganttTasks.filter(t => t.type === 'milestone').length} 个里程碑
          </div>
        </div>
      </div>
    </div>
  );
}