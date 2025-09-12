'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Play, 
  Pause, 
  CheckCircle, 
  Archive,
  Edit,
  Trash2,
  Users,
  BarChart3
} from 'lucide-react';
import { Project, ProjectWithStats } from '@/types/project';

interface ProjectCardProps {
  project: ProjectWithStats;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onStatusChange?: (projectId: string, status: Project['status']) => void;
  onView?: (projectId: string) => void;
  className?: string;
}

const statusColors = {
  active: '#10B981',    // 绿色 - 进行中
  completed: '#6B7280', // 灰色 - 已完成
  on_hold: '#F59E0B',   // 黄色 - 暂停
  archived: '#9CA3AF'   // 浅灰 - 已归档
};

const priorityColors = {
  urgent: '#EF4444',    // 红色 - 紧急
  high: '#F97316',      // 橙色 - 高优先级
  medium: '#3B82F6',    // 蓝色 - 中优先级
  low: '#8B5CF6'        // 紫色 - 低优先级
};

export function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onView, 
  className = '' 
}: ProjectCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'on_hold': return <Pause className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'on_hold': return '暂停';
      case 'archived': return '已归档';
    }
  };

  const getPriorityText = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent': return '紧急';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateProgress = () => {
    if (project.taskCount === 0) return 0;
    return Math.round((project.completedTasks / project.taskCount) * 100);
  };

  const isOverdue = () => {
    if (!project.dueDate || project.status === 'completed') return false;
    return new Date(project.dueDate) < new Date();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`group relative rounded-xl p-4 shadow-lg transition-all duration-200 cursor-pointer ${className}`}
      style={{
        background: 'var(--card-glass)',
        backdropFilter: 'blur(15px)',
        border: '1px solid var(--card-border)'
      }}
      onClick={() => onView?.(project.id)}
    >
      {/* 优先级指示条 */}
      <div 
        className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
        style={{ backgroundColor: priorityColors[project.priority] }}
      />

      {/* 项目头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-lg leading-tight mb-1 truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.name}
          </h3>
          {project.description && (
            <p 
              className="text-sm opacity-70 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* 操作菜单 */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 rounded hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActions && (
            <div 
              className="absolute right-0 top-8 z-10 w-48 py-2 rounded-lg shadow-xl"
              style={{ 
                background: 'var(--card-background)',
                border: '1px solid var(--card-border)'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project);
                  setShowActions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-black/5 transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <Edit className="w-4 h-4" />
                编辑项目
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(project.id);
                  setShowActions(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-500"
              >
                <Trash2 className="w-4 h-4" />
                删除项目
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 状态和进度 */}
      <div className="space-y-3">
        {/* 状态标签 */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${statusColors[project.status]}20`,
              color: statusColors[project.status]
            }}
          >
            {getStatusIcon(project.status)}
            {getStatusText(project.status)}
          </div>

          <div 
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: `${priorityColors[project.priority]}20`,
              color: priorityColors[project.priority]
            }}
          >
            {getPriorityText(project.priority)}优先级
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span 
              className="text-xs font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              进度
            </span>
            <span 
              className="text-xs font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              {calculateProgress()}%
            </span>
          </div>
          <div 
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--card-border)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${calculateProgress()}%`,
                backgroundColor: statusColors[project.status]
              }}
            />
          </div>
        </div>

        {/* 任务统计 */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <BarChart3 
                className="w-3 h-3"
                style={{ color: 'var(--text-secondary)' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                {project.taskCount} 任务
              </span>
            </div>
            
            {project.subProjects.length > 0 && (
              <div className="flex items-center gap-1">
                <Users 
                  className="w-3 h-3"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {project.subProjects.length} 子项目
                </span>
              </div>
            )}
          </div>

          {/* 时间信息 */}
          <div className="flex items-center gap-3">
            {project.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock 
                  className="w-3 h-3"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {project.estimatedHours}h
                </span>
              </div>
            )}

            {project.dueDate && (
              <div 
                className={`flex items-center gap-1 ${isOverdue() ? 'text-red-500' : ''}`}
                style={{ color: isOverdue() ? '#EF4444' : 'var(--text-secondary)' }}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDate(project.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 点击遮罩关闭菜单 */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
}