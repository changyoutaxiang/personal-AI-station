'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  Archive
} from 'lucide-react';
import { ProjectService } from '@/lib/services/projectService';
import { TaskService, CreateTaskRequest } from '@/lib/services/taskService';
import { Project, ProjectWithStats, Task } from '@/types/project';
import { TaskForm } from '@/components/tasks/TaskForm';

interface ProjectDetailData extends ProjectWithStats {
  tasks: Task[];
}

function ProjectDetailContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [taskFormLoading, setTaskFormLoading] = useState(false);

  // 加载项目详情
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const projectData = await ProjectService.getProject(projectId);
        setProject(projectData);
      } catch (err) {
        console.error('加载项目详情失败:', err);
        setError((err as Error).message);
        toast.error('加载项目详情失败: ' + (err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // 重新加载项目数据
  const reloadProject = async () => {
    try {
      const projectData = await ProjectService.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('重新加载项目失败:', err);
    }
  };

  // 处理添加任务
  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskForm(true);
  };

  // 处理编辑任务
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // 处理删除任务
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }

    try {
      await TaskService.deleteTask(taskId);
      toast.success('任务删除成功');
      await reloadProject();
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败: ' + (error as Error).message);
    }
  };

  // 处理任务表单提交
  const handleTaskFormSubmit = async (taskData: CreateTaskRequest) => {
    try {
      setTaskFormLoading(true);

      if (editingTask) {
        // 更新任务
        await TaskService.updateTask(editingTask.id, taskData);
        toast.success('任务更新成功');
      } else {
        // 创建任务
        await TaskService.createTask(taskData);
        toast.success('任务创建成功');
      }

      setShowTaskForm(false);
      setEditingTask(undefined);
      await reloadProject();
    } catch (error) {
      console.error('保存任务失败:', error);
      toast.error('保存任务失败: ' + (error as Error).message);
    } finally {
      setTaskFormLoading(false);
    }
  };

  // 处理任务表单取消
  const handleTaskFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(undefined);
  };

  // 快速更新任务状态
  const handleQuickStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      await TaskService.updateTaskStatus(taskId, status);
      toast.success('任务状态更新成功');
      await reloadProject();
    } catch (error) {
      console.error('更新任务状态失败:', error);
      toast.error('更新任务状态失败: ' + (error as Error).message);
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Play className="w-5 h-5 text-green-500" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'on_hold': return <Pause className="w-5 h-5 text-yellow-500" />;
      case 'archived': return <Archive className="w-5 h-5 text-gray-500" />;
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

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'low': return 'text-purple-500 bg-purple-50 border-purple-200';
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

  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return <Circle className="w-4 h-4 text-gray-400" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'review': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <Trash2 className="w-4 h-4 text-red-500" />;
    }
  };

  const getTaskStatusText = (status: Task['status']) => {
    switch (status) {
      case 'todo': return '待办';
      case 'in_progress': return '进行中';
      case 'review': return '审核中';
      case 'done': return '已完成';
      case 'cancelled': return '已取消';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateProgress = () => {
    if (!project || project.taskCount === 0) return 0;
    return Math.round((project.completedTasks / project.taskCount) * 100);
  };

  const isOverdue = () => {
    if (!project?.dueDate || project.status === 'completed') return false;
    return new Date(project.dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4" style={{color: 'var(--text-secondary)'}}>加载项目详情中...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background)'}}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
            加载失败
          </h2>
          <p className="mb-4" style={{color: 'var(--text-secondary)'}}>
            {error || '项目不存在'}
          </p>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回项目列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background)'}}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 头部导航 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
            style={{color: 'var(--text-secondary)'}}
          >
            <ArrowLeft className="w-5 h-5" />
            返回项目列表
          </button>
        </div>

        {/* 项目标题和状态 */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                {project.name}
              </h1>
              {project.description && (
                <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* 状态标签 */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  border: '1px solid var(--card-border)'
                }}>
                {getStatusIcon(project.status)}
                <span style={{color: 'var(--text-primary)'}}>
                  {getStatusText(project.status)}
                </span>
              </div>
              
              {/* 优先级标签 */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(project.priority)}`}>
                {getPriorityText(project.priority)}优先级
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                整体进度
              </span>
              <span className="text-sm font-bold" style={{color: 'var(--text-primary)'}}>
                {calculateProgress()}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden"
              style={{backgroundColor: 'var(--card-border)'}}>
              <div 
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{width: `${calculateProgress()}%`}}
              />
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-xl"
            style={{
              background: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>总任务数</p>
                <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                  {project.taskCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl"
            style={{
              background: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>已完成</p>
                <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                  {project.completedTasks}
                </p>
              </div>
            </div>
          </div>

          {project.estimatedHours && (
            <div className="p-6 rounded-xl"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--card-border)'
              }}>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>预估工时</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                    {project.estimatedHours}h
                  </p>
                </div>
              </div>
            </div>
          )}

          {project.dueDate && (
            <div className="p-6 rounded-xl"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--card-border)'
              }}>
              <div className="flex items-center gap-3">
                <Calendar className={`w-8 h-8 ${isOverdue() ? 'text-red-500' : 'text-blue-500'}`} />
                <div>
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>截止日期</p>
                  <p className={`text-lg font-bold ${isOverdue() ? 'text-red-500' : 'var(--text-primary)'}`}>
                    {formatDate(project.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 任务列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              项目任务
            </h2>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleAddTask}
            >
              <Plus className="w-4 h-4" />
              添加任务
            </button>
          </div>

          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-4">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl hover:shadow-lg transition-all duration-200"
                  style={{
                    background: 'var(--card-glass)',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => {
                          const statusCycle: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                          const currentIndex = statusCycle.indexOf(task.status);
                          const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
                          handleQuickStatusUpdate(task.id, nextStatus);
                        }}
                        className="p-1 rounded hover:bg-black/5 transition-colors"
                        title="点击切换任务状态"
                      >
                        {getTaskStatusIcon(task.status)}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{color: 'var(--text-primary)'}}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm opacity-70" style={{color: 'var(--text-secondary)'}}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className={`px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                          <span style={{color: 'var(--text-secondary)'}}>
                            {getTaskStatusText(task.status)}
                          </span>
                          {task.dueDate && (
                            <span style={{color: 'var(--text-secondary)'}}>
                              截止: {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg hover:bg-black/5 transition-colors"
                        style={{color: 'var(--text-secondary)'}}
                        onClick={() => handleEditTask(task)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                        style={{color: 'var(--text-secondary)'}}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--card-border)'
              }}>
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" style={{color: 'var(--text-secondary)'}} />
              <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                暂无任务
              </h3>
              <p style={{color: 'var(--text-secondary)'}}>
                为这个项目添加第一个任务吧！
              </p>
              <button
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleAddTask}
              >
                添加任务
              </button>
            </div>
          )}
        </div>
      </div>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card-glass)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--card-border)',
          },
        }}
      />

      {/* 任务表单模态框 */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          projectId={projectId}
          onSubmit={handleTaskFormSubmit}
          onCancel={handleTaskFormCancel}
          isLoading={taskFormLoading}
        />
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <ProjectDetailContent />
    </Suspense>
  );
}