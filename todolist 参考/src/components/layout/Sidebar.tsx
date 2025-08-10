import React from 'react';
import { X, Clock, Tag, User, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  time?: string;
  subProject?: string;
  projectName?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask?: (taskId: string | number, updates: Partial<Task>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onUpdateTask 
}) => {
  if (!task) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-blue-500" />;
      case 'review': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out z-50 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`} style={{ width: '380px' }}>
      {/* 侧边栏头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">任务详情</h3>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 任务内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* 任务标题 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
            {task.description && (
              <p className="text-gray-600 leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* 状态信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">状态</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'todo' ? '待办' :
                   task.status === 'in-progress' ? '进行中' :
                   task.status === 'review' ? '审核中' : '已完成'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">优先级</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority === 'high' ? '高' :
                 task.priority === 'medium' ? '中' : '低'}
              </span>
            </div>

            {task.time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.time}</span>
              </div>
            )}

            {task.subProject && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.subProject}</span>
              </div>
            )}

            {task.projectName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{task.projectName}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">快速操作</h4>
            <div className="space-y-2">
              <button 
                onClick={() => onUpdateTask?.(task.id, { status: 'in-progress' })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                开始任务
              </button>
              <button 
                onClick={() => onUpdateTask?.(task.id, { status: 'completed' })}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                标记完成
              </button>
              <button 
                onClick={() => onUpdateTask?.(task.id, { status: 'todo' })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                重置为待办
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            编辑任务
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            删除任务
          </button>
        </div>
      </div>
    </div>
  );
};